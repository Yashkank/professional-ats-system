import logging
import os
import sys
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import pandas as pd
import json
from datetime import datetime
import hashlib
import re

# Configure logging
def setup_logging(
    level: str = "INFO",
    log_file: Optional[str] = None,
    log_format: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
) -> logging.Logger:
    """
    Setup logging configuration for the application
    
    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
        log_format: Log message format
        
    Returns:
        Configured logger instance
    """
    # Create logs directory if it doesn't exist
    if log_file:
        log_dir = Path(log_file).parent
        log_dir.mkdir(parents=True, exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file) if log_file else logging.NullHandler()
        ]
    )
    
    # Create logger
    logger = logging.getLogger(__name__)
    
    # Suppress verbose logging from external libraries
    logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
    logging.getLogger("transformers").setLevel(logging.WARNING)
    logging.getLogger("torch").setLevel(logging.WARNING)
    logging.getLogger("sklearn").setLevel(logging.WARNING)
    
    logger.info(f"Logging configured with level: {level}")
    if log_file:
        logger.info(f"Log file: {log_file}")
    
    return logger

def validate_pdf(file) -> bool:
    """
    Validate if uploaded file is a valid PDF
    
    Args:
        file: Streamlit uploaded file object
        
    Returns:
        True if valid PDF, False otherwise
    """
    try:
        if file is None:
            return False
        
        # Check file extension
        if not file.name.lower().endswith('.pdf'):
            return False
        
        # Check file size (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB in bytes
        if file.size > max_size:
            return False
        
        # Check if file has content
        if file.size == 0:
            return False
        
        return True
        
    except Exception as e:
        logging.error(f"Error validating PDF file: {e}")
        return False

def create_results_dataframe(results: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Create a pandas DataFrame from results data
    
    Args:
        results: List of result dictionaries
        
    Returns:
        Formatted pandas DataFrame
    """
    try:
        if not results:
            return pd.DataFrame()
        
        # Create DataFrame
        df = pd.DataFrame(results)
        
        # Ensure all required columns exist
        required_columns = [
            'Filename', 'Candidate Name', 'Email', 'Phone',
            'Text Similarity (%)', 'Skills Similarity (%)', 'Final Score (%)',
            'Match Status', 'Skills Found', 'Skills Matched'
        ]
        
        for col in required_columns:
            if col not in df.columns:
                df[col] = None
        
        # Sort by final score (descending)
        if 'Final Score (%)' in df.columns:
            df = df.sort_values('Final Score (%)', ascending=False)
        
        # Reset index
        df = df.reset_index(drop=True)
        
        return df
        
    except Exception as e:
        logging.error(f"Error creating results DataFrame: {e}")
        return pd.DataFrame()

def save_results_to_csv(results_df: pd.DataFrame, filename: str = None) -> str:
    """
    Save results DataFrame to CSV file
    
    Args:
        results_df: Results DataFrame
        filename: Optional filename, defaults to timestamp-based name
        
    Returns:
        Path to saved CSV file
    """
    try:
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ats_results_{timestamp}.csv"
        
        # Ensure filename has .csv extension
        if not filename.endswith('.csv'):
            filename += '.csv'
        
        # Create results directory
        results_dir = Path("results")
        results_dir.mkdir(exist_ok=True)
        
        # Save file
        file_path = results_dir / filename
        results_df.to_csv(file_path, index=False)
        
        logging.info(f"Results saved to: {file_path}")
        return str(file_path)
        
    except Exception as e:
        logging.error(f"Error saving results to CSV: {e}")
        raise

def save_results_to_json(results: List[Dict[str, Any]], filename: str = None) -> str:
    """
    Save results to JSON file
    
    Args:
        results: Results data
        filename: Optional filename, defaults to timestamp-based name
        
    Returns:
        Path to saved JSON file
    """
    try:
        if filename is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"ats_results_{timestamp}.json"
        
        # Ensure filename has .json extension
        if not filename.endswith('.json'):
            filename += '.json'
        
        # Create results directory
        results_dir = Path("results")
        results_dir.mkdir(exist_ok=True)
        
        # Save file
        file_path = results_dir / filename
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False, default=str)
        
        logging.info(f"Results saved to: {file_path}")
        return str(file_path)
        
    except Exception as e:
        logging.error(f"Error saving results to JSON: {e}")
        raise

def calculate_performance_metrics(results_df: pd.DataFrame) -> Dict[str, Any]:
    """
    Calculate performance metrics from results
    
    Args:
        results_df: Results DataFrame
        
    Returns:
        Dictionary containing performance metrics
    """
    try:
        if results_df.empty:
            return {}
        
        metrics = {
            'total_resumes': len(results_df),
            'average_score': results_df['Final Score (%)'].mean(),
            'median_score': results_df['Final Score (%)'].median(),
            'std_score': results_df['Final Score (%)'].std(),
            'min_score': results_df['Final Score (%)'].min(),
            'max_score': results_df['Final Score (%)'].max(),
            'strong_matches': len(results_df[results_df['Match Status'] == '✅ Strong Match']),
            'moderate_matches': len(results_df[results_df['Match Status'] == '⚠️ Moderate Match']),
            'weak_matches': len(results_df[results_df['Match Status'] == '❌ Weak Match']),
            'average_skills_found': results_df['Skills Found'].mean(),
            'average_skills_matched': results_df['Skills Matched'].mean()
        }
        
        # Calculate percentiles
        percentiles = [25, 50, 75, 90, 95]
        for p in percentiles:
            metrics[f'percentile_{p}'] = results_df['Final Score (%)'].quantile(p / 100)
        
        return metrics
        
    except Exception as e:
        logging.error(f"Error calculating performance metrics: {e}")
        return {}

def generate_report_summary(results_df: pd.DataFrame, jd_filename: str) -> str:
    """
    Generate a summary report of the ATS results
    
    Args:
        results_df: Results DataFrame
        jd_filename: Job description filename
        
    Returns:
        Formatted report string
    """
    try:
        if results_df.empty:
            return "No results to generate report for."
        
        # Calculate metrics
        metrics = calculate_performance_metrics(results_df)
        
        # Generate report
        report = f"""
# ATS Results Summary Report

## Job Description
- **File:** {jd_filename}
- **Analysis Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Overall Statistics
- **Total Resumes Processed:** {metrics.get('total_resumes', 0)}
- **Average Match Score:** {metrics.get('average_score', 0):.1f}%
- **Median Match Score:** {metrics.get('median_score', 0):.1f}%
- **Score Range:** {metrics.get('min_score', 0):.1f}% - {metrics.get('max_score', 0):.1f}%

## Match Distribution
- **Strong Matches (≥70%):** {metrics.get('strong_matches', 0)}
- **Moderate Matches (60-69%):** {metrics.get('moderate_matches', 0)}
- **Weak Matches (<60%):** {metrics.get('weak_matches', 0)}

## Skills Analysis
- **Average Skills Found:** {metrics.get('average_skills_found', 0):.1f}
- **Average Skills Matched:** {metrics.get('average_skills_matched', 0):.1f}

## Top Performers
"""
        
        # Add top performers
        top_performers = results_df.head(5)
        for idx, row in top_performers.iterrows():
            report += f"- **{row['Candidate Name']}** ({row['Filename']}): {row['Final Score (%)']:.1f}%\n"
        
        return report
        
    except Exception as e:
        logging.error(f"Error generating report summary: {e}")
        return f"Error generating report: {str(e)}"

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename for safe file operations
    
    Args:
        filename: Original filename
        
    Returns:
        Sanitized filename
    """
    try:
        # Remove or replace invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '_', filename)
        
        # Remove leading/trailing spaces and dots
        sanitized = sanitized.strip(' .')
        
        # Ensure filename is not empty
        if not sanitized:
            sanitized = "unnamed_file"
        
        return sanitized
        
    except Exception as e:
        logging.error(f"Error sanitizing filename: {e}")
        return "unnamed_file"

def create_unique_filename(base_filename: str, directory: str = ".") -> str:
    """
    Create a unique filename to avoid conflicts
    
    Args:
        base_filename: Base filename
        directory: Directory to check for conflicts
        
    Returns:
        Unique filename
    """
    try:
        base_path = Path(directory) / base_filename
        counter = 1
        
        while base_path.exists():
            # Split filename and extension
            name, ext = base_path.stem, base_path.suffix
            
            # Create new filename with counter
            if name.endswith(f"_{counter-1}"):
                name = name[:-len(f"_{counter-1}")]
            
            new_filename = f"{name}_{counter}{ext}"
            base_path = Path(directory) / new_filename
            counter += 1
        
        return base_path.name
        
    except Exception as e:
        logging.error(f"Error creating unique filename: {e}")
        return base_filename

def get_file_hash(file_path: Union[str, Path]) -> str:
    """
    Calculate SHA-256 hash of a file
    
    Args:
        file_path: Path to the file
        
    Returns:
        File hash string
    """
    try:
        hash_sha256 = hashlib.sha256()
        
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        
        return hash_sha256.hexdigest()
        
    except Exception as e:
        logging.error(f"Error calculating file hash: {e}")
        return ""

def format_file_size(size_bytes: int) -> str:
    """
    Format file size in human-readable format
    
    Args:
        size_bytes: Size in bytes
        
    Returns:
        Formatted size string
    """
    try:
        if size_bytes == 0:
            return "0 B"
        
        size_names = ["B", "KB", "MB", "GB", "TB"]
        i = 0
        
        while size_bytes >= 1024 and i < len(size_names) - 1:
            size_bytes /= 1024.0
            i += 1
        
        return f"{size_bytes:.1f} {size_names[i]}"
        
    except Exception as e:
        logging.error(f"Error formatting file size: {e}")
        return "Unknown"

def cleanup_temp_files(temp_dir: str = "temp"):
    """
    Clean up temporary files
    
    Args:
        temp_dir: Temporary directory path
    """
    try:
        temp_path = Path(temp_dir)
        if temp_path.exists():
            for file_path in temp_path.glob("*"):
                try:
                    if file_path.is_file():
                        file_path.unlink()
                    elif file_path.is_dir():
                        import shutil
                        shutil.rmtree(file_path)
                except Exception as e:
                    logging.warning(f"Could not remove temp file {file_path}: {e}")
            
            logging.info(f"Cleaned up temporary directory: {temp_dir}")
            
    except Exception as e:
        logging.error(f"Error cleaning up temp files: {e}")

def validate_email(email: str) -> bool:
    """
    Validate email address format
    
    Args:
        email: Email address string
        
    Returns:
        True if valid email, False otherwise
    """
    try:
        if not email:
            return False
        
        # Basic email regex pattern
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(pattern, email))
        
    except Exception as e:
        logging.error(f"Error validating email: {e}")
        return False

def validate_phone(phone: str) -> bool:
    """
    Validate phone number format
    
    Args:
        phone: Phone number string
        
    Returns:
        True if valid phone, False otherwise
    """
    try:
        if not phone:
            return False
        
        # Remove common separators
        cleaned = re.sub(r'[\s\-\(\)\.]', '', phone)
        
        # Check if it's a valid phone number (7-15 digits)
        return bool(re.match(r'^\+?[\d]{7,15}$', cleaned))
        
    except Exception as e:
        logging.error(f"Error validating phone: {e}")
        return False

# Example usage and testing
if __name__ == "__main__":
    # Setup logging
    logger = setup_logging("INFO")
    
    print("=== Utility Functions Test ===")
    
    # Test filename sanitization
    test_filename = "test<>file.pdf"
    sanitized = sanitize_filename(test_filename)
    print(f"Sanitized filename: {sanitized}")
    
    # Test file size formatting
    sizes = [0, 1024, 1048576, 1073741824]
    for size in sizes:
        formatted = format_file_size(size)
        print(f"{size} bytes = {formatted}")
    
    # Test email validation
    test_emails = ["test@example.com", "invalid-email", "user@domain.co.uk"]
    for email in test_emails:
        is_valid = validate_email(email)
        print(f"Email {email}: {'Valid' if is_valid else 'Invalid'}")
    
    # Test phone validation
    test_phones = ["+1-555-123-4567", "555.123.4567", "invalid-phone"]
    for phone in test_phones:
        is_valid = validate_phone(phone)
        print(f"Phone {phone}: {'Valid' if is_valid else 'Invalid'}")
    
    print("Utility functions test completed!")

