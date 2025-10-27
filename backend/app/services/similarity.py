import logging
import numpy as np
from typing import List, Dict, Tuple, Optional, Union
from sentence_transformers import SentenceTransformer, util
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import torch
import gc

logger = logging.getLogger(__name__)

class SimilarityEngine:
    """
    Advanced similarity calculation engine using BERT embeddings and multiple similarity metrics
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", device: str = None):
        """
        Initialize the SimilarityEngine
        
        Args:
            model_name: BERT model name to use for embeddings
            device: Device to use for model inference ('cpu', 'cuda', or None for auto)
        """
        self.model_name = model_name
        self.device = device or ('cuda' if torch.cuda.is_available() else 'cpu')
        
        try:
            # Initialize BERT model
            self.model = SentenceTransformer(model_name, device=self.device)
            logger.info(f"Loaded BERT model: {model_name} on {self.device}")
            
            # Initialize TF-IDF vectorizer as fallback
            self.tfidf_vectorizer = TfidfVectorizer(
                max_features=1000,
                stop_words='english',
                ngram_range=(1, 3),
                min_df=1
            )
            
            # Cache for embeddings to improve performance
            self._embeddings_cache = {}
            self._cache_size_limit = 1000  # Maximum number of cached embeddings
            
        except Exception as e:
            logger.error(f"Error initializing SimilarityEngine: {e}")
            raise Exception(f"Failed to initialize similarity engine: {str(e)}")
    
    def calculate_similarity(self, text1: str, text2: str, method: str = "bert") -> float:
        """
        Calculate similarity between two texts using specified method
        
        Args:
            text1: First text
            text2: Second text
            method: Similarity method ('bert', 'tfidf', 'hybrid')
            
        Returns:
            Similarity score between 0 and 1
        """
        if not text1 or not text2:
            return 0.0
        
        try:
            if method == "bert":
                return self._calculate_bert_similarity(text1, text2)
            elif method == "tfidf":
                return self._calculate_tfidf_similarity(text1, text2)
            elif method == "hybrid":
                return self._calculate_hybrid_similarity(text1, text2)
            else:
                logger.warning(f"Unknown method '{method}', using BERT")
                return self._calculate_bert_similarity(text1, text2)
                
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            # Fallback to TF-IDF if BERT fails
            try:
                return self._calculate_tfidf_similarity(text1, text2)
            except Exception as fallback_error:
                logger.error(f"Fallback similarity calculation also failed: {fallback_error}")
                return 0.0
    
    def _calculate_bert_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate similarity using BERT embeddings
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            # Get embeddings (use cache if available)
            emb1 = self._get_embedding(text1)
            emb2 = self._get_embedding(text2)
            
            # Calculate cosine similarity
            similarity = util.cos_sim(emb1, emb2).item()
            
            # Ensure score is between 0 and 1
            similarity = max(0.0, min(1.0, similarity))
            
            return similarity
            
        except Exception as e:
            logger.error(f"Error in BERT similarity calculation: {e}")
            raise
    
    def _calculate_tfidf_similarity(self, text1: str, text2: str) -> float:
        """
        Calculate similarity using TF-IDF vectors
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Similarity score between 0 and 1
        """
        try:
            # Create corpus with both texts
            corpus = [text1, text2]
            
            # Calculate TF-IDF vectors
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(corpus)
            
            # Calculate cosine similarity
            similarity_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
            similarity = similarity_matrix[0][0]
            
            # Ensure score is between 0 and 1
            similarity = max(0.0, min(1.0, similarity))
            
            return similarity
            
        except Exception as e:
            logger.error(f"Error in TF-IDF similarity calculation: {e}")
            raise
    
    def _calculate_hybrid_similarity(self, text1: str, text2: str) -> float:
        """
        Combine BERT and TF-IDF similarity for better results
        
        Args:
            text1: First text
            text2: Second text
            
        Returns:
            Combined similarity score between 0 and 1
        """
        try:
            # Calculate both similarities
            bert_sim = self._calculate_bert_similarity(text1, text2)
            tfidf_sim = self._calculate_tfidf_similarity(text1, text2)
            
            # Weighted combination (BERT gets higher weight as it's more accurate)
            combined_sim = (bert_sim * 0.7) + (tfidf_sim * 0.3)
            
            return combined_sim
            
        except Exception as e:
            logger.error(f"Error in hybrid similarity calculation: {e}")
            # Fallback to BERT only
            return self._calculate_bert_similarity(text1, text2)
    
    def _get_embedding(self, text: str) -> torch.Tensor:
        """
        Get BERT embedding for text, using cache if available
        
        Args:
            text: Input text
            
        Returns:
            BERT embedding tensor
        """
        # Create cache key (use hash for long texts)
        cache_key = hash(text) if len(text) > 100 else text
        
        if cache_key in self._embeddings_cache:
            return self._embeddings_cache[cache_key]
        
        try:
            # Generate new embedding
            embedding = self.model.encode(text, convert_to_tensor=True)
            
            # Cache the embedding
            self._cache_embedding(cache_key, embedding)
            
            return embedding
            
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def _cache_embedding(self, key: Union[str, int], embedding: torch.Tensor):
        """
        Cache an embedding, managing cache size
        
        Args:
            key: Cache key
            embedding: Embedding tensor to cache
        """
        try:
            # Add to cache
            self._embeddings_cache[key] = embedding
            
            # Manage cache size
            if len(self._embeddings_cache) > self._cache_size_limit:
                # Remove oldest entries (simple FIFO)
                oldest_key = next(iter(self._embeddings_cache))
                del self._embeddings_cache[oldest_key]
                
        except Exception as e:
            logger.warning(f"Error caching embedding: {e}")
    
    def calculate_skills_similarity(self, skills1: List[str], skills2: List[str]) -> float:
        """
        Calculate similarity between two skill lists
        
        Args:
            skills1: First skill list
            skills2: Second skill list
            
        Returns:
            Similarity score between 0 and 1
        """
        if not skills1 or not skills2:
            return 0.0
        
        try:
            # Convert skills to text for embedding
            skills_text1 = " ".join(skills1)
            skills_text2 = " ".join(skills2)
            
            # Calculate similarity using BERT
            similarity = self._calculate_bert_similarity(skills_text1, skills_text2)
            
            # Apply skill-specific adjustments
            adjusted_similarity = self._adjust_skills_similarity(skills1, skills2, similarity)
            
            return adjusted_similarity
            
        except Exception as e:
            logger.error(f"Error calculating skills similarity: {e}")
            return 0.0
    
    def _adjust_skills_similarity(self, skills1: List[str], skills2: List[str], base_similarity: float) -> float:
        """
        Adjust similarity score based on skill-specific factors
        
        Args:
            skills1: First skill list
            skills2: Second skill list
            base_similarity: Base similarity score
            
        Returns:
            Adjusted similarity score
        """
        try:
            # Calculate exact matches
            set1 = set(skills1)
            set2 = set(skills2)
            
            exact_matches = len(set1.intersection(set2))
            total_unique = len(set1.union(set2))
            
            if total_unique == 0:
                return base_similarity
            
            # Calculate exact match ratio
            exact_ratio = exact_matches / total_unique
            
            # Adjust base similarity based on exact matches
            # If there are many exact matches, boost the score
            # If there are few exact matches, reduce the score
            adjustment_factor = 0.3
            adjusted_similarity = base_similarity + (exact_ratio - base_similarity) * adjustment_factor
            
            # Ensure score is between 0 and 1
            adjusted_similarity = max(0.0, min(1.0, adjusted_similarity))
            
            return adjusted_similarity
            
        except Exception as e:
            logger.warning(f"Error adjusting skills similarity: {e}")
            return base_similarity
    
    def calculate_batch_similarity(self, texts: List[str], reference_text: str) -> List[float]:
        """
        Calculate similarity between multiple texts and a reference text
        
        Args:
            texts: List of texts to compare
            reference_text: Reference text for comparison
            
        Returns:
            List of similarity scores
        """
        try:
            # Get reference embedding once
            reference_embedding = self._get_embedding(reference_text)
            
            similarities = []
            
            for text in texts:
                try:
                    text_embedding = self._get_embedding(text)
                    similarity = util.cos_sim(text_embedding, reference_embedding).item()
                    similarities.append(max(0.0, min(1.0, similarity)))
                except Exception as e:
                    logger.warning(f"Error calculating similarity for text: {e}")
                    similarities.append(0.0)
            
            return similarities
            
        except Exception as e:
            logger.error(f"Error in batch similarity calculation: {e}")
            return [0.0] * len(texts)
    
    def find_most_similar(self, query_text: str, candidate_texts: List[str], top_k: int = 5) -> List[Tuple[int, float]]:
        """
        Find the most similar texts to a query text
        
        Args:
            query_text: Query text
            candidate_texts: List of candidate texts
            top_k: Number of top results to return
            
        Returns:
            List of tuples (index, similarity_score) sorted by similarity
        """
        try:
            # Calculate similarities
            similarities = self.calculate_batch_similarity(candidate_texts, query_text)
            
            # Create index-similarity pairs
            indexed_similarities = list(enumerate(similarities))
            
            # Sort by similarity (descending)
            indexed_similarities.sort(key=lambda x: x[1], reverse=True)
            
            # Return top-k results
            return indexed_similarities[:top_k]
            
        except Exception as e:
            logger.error(f"Error finding most similar texts: {e}")
            return []
    
    def rank_resumes_by_similarity(self, job_description: str, resume_texts: List[str], 
                                 resume_names: List[str] = None, 
                                 method: str = "bert",
                                 include_skills: bool = True,
                                 skills_weight: float = 0.3) -> List[Dict]:
        """
        Rank resumes by similarity to job description using BERT embeddings and cosine similarity
        
        Args:
            job_description: Job description text
            resume_texts: List of resume text content
            resume_names: Optional list of resume names/filenames
            method: Similarity method ('bert', 'tfidf', 'hybrid')
            include_skills: Whether to include skills-based similarity
            skills_weight: Weight for skills similarity in final score
            
        Returns:
            List of dictionaries with resume ranking information, sorted by similarity score
        """
        if not job_description or not resume_texts:
            logger.warning("Empty job description or resume texts provided")
            return []
        
        try:
            logger.info(f"Ranking {len(resume_texts)} resumes against job description")
            
            # Get job description embedding once
            jd_embedding = self._get_embedding(job_description)
            
            results = []
            
            for idx, resume_text in enumerate(resume_texts):
                try:
                    # Get resume embedding
                    resume_embedding = self._get_embedding(resume_text)
                    
                    # Calculate text similarity using specified method
                    if method == "bert":
                        text_similarity = util.cos_sim(resume_embedding, jd_embedding).item()
                    elif method == "tfidf":
                        text_similarity = self._calculate_tfidf_similarity(resume_text, job_description)
                    elif method == "hybrid":
                        text_similarity = self._calculate_hybrid_similarity(resume_text, job_description)
                    else:
                        text_similarity = util.cos_sim(resume_embedding, jd_embedding).item()
                    
                    # Ensure text similarity is between 0 and 1
                    text_similarity = max(0.0, min(1.0, text_similarity))
                    
                    # Calculate final similarity score
                    final_score = text_similarity
                    
                    # Create result dictionary
                    result = {
                        'rank': 0,  # Will be set after sorting
                        'resume_index': idx,
                        'resume_name': resume_names[idx] if resume_names and idx < len(resume_names) else f"Resume {idx + 1}",
                        'text_similarity': round(text_similarity, 4),
                        'final_score': round(final_score, 4),
                        'text_length': len(resume_text),
                        'method_used': method
                    }
                    
                    # Add skills information if requested
                    if include_skills:
                        # Extract skills from resume text (basic extraction)
                        resume_skills = self._extract_skills_from_text(resume_text)
                        jd_skills = self._extract_skills_from_text(job_description)
                        
                        if resume_skills and jd_skills:
                            skills_similarity = self.calculate_skills_similarity(resume_skills, jd_skills)
                            result['skills_similarity'] = round(skills_similarity, 4)
                            result['resume_skills_count'] = len(resume_skills)
                            result['jd_skills_count'] = len(jd_skills)
                            result['matching_skills'] = len(set(resume_skills) & set(jd_skills))
                            
                            # Adjust final score with skills weight
                            final_score = (text_similarity * (1 - skills_weight)) + (skills_similarity * skills_weight)
                            result['final_score'] = round(final_score, 4)
                        else:
                            result['skills_similarity'] = 0.0
                            result['resume_skills_count'] = 0
                            result['jd_skills_count'] = 0
                            result['matching_skills'] = 0
                    
                    results.append(result)
                    
                except Exception as e:
                    logger.error(f"Error processing resume {idx}: {e}")
                    # Add error result
                    results.append({
                        'rank': 0,
                        'resume_index': idx,
                        'resume_name': resume_names[idx] if resume_names and idx < len(resume_names) else f"Resume {idx + 1}",
                        'text_similarity': 0.0,
                        'final_score': 0.0,
                        'text_length': len(resume_text) if resume_text else 0,
                        'method_used': method,
                        'error': str(e)
                    })
            
            # Sort results by final score (descending)
            results.sort(key=lambda x: x['final_score'], reverse=True)
            
            # Assign ranks
            for i, result in enumerate(results):
                result['rank'] = i + 1
            
            logger.info(f"Successfully ranked {len(results)} resumes")
            return results
            
        except Exception as e:
            logger.error(f"Error in resume ranking: {e}")
            return []
    
    def _extract_skills_from_text(self, text: str) -> List[str]:
        """
        Extract basic skills from text for similarity calculation
        
        Args:
            text: Input text
            
        Returns:
            List of extracted skills
        """
        if not text:
            return []
        
        try:
            # Basic skill extraction - this is a simplified version
            # In production, you might want to use the SkillExtractor class
            common_skills = [
                'python', 'java', 'javascript', 'react', 'node', 'django', 'flask',
                'sql', 'mongodb', 'aws', 'docker', 'kubernetes', 'git', 'github',
                'machine learning', 'ai', 'data science', 'html', 'css', 'typescript',
                'angular', 'vue', 'spring', 'hibernate', 'maven', 'gradle', 'php',
                'laravel', 'wordpress', 'c++', 'c#', '.net', 'asp.net', 'ruby',
                'rails', 'go', 'rust', 'swift', 'kotlin', 'scala', 'r', 'matlab'
            ]
            
            text_lower = text.lower()
            found_skills = []
            
            for skill in common_skills:
                if skill in text_lower:
                    found_skills.append(skill)
            
            return found_skills
            
        except Exception as e:
            logger.warning(f"Error extracting skills from text: {e}")
            return []
    
    def rank_resumes_with_detailed_analysis(self, job_description: str, resume_data: List[Dict],
                                          method: str = "bert", 
                                          skills_weight: float = 0.3) -> Dict:
        """
        Comprehensive resume ranking with detailed analysis
        
        Args:
            job_description: Job description text
            resume_data: List of dictionaries containing resume information
                         Each dict should have: 'text', 'name', 'email', 'skills', etc.
            method: Similarity method ('bert', 'tfidf', 'hybrid')
            skills_weight: Weight for skills similarity in final score
            
        Returns:
            Dictionary containing ranking results and analysis
        """
        if not job_description or not resume_data:
            return {
                'rankings': [],
                'summary': {},
                'analysis': {},
                'error': 'Empty job description or resume data'
            }
        
        try:
            # Extract resume texts and names
            resume_texts = [resume.get('text', '') for resume in resume_data]
            resume_names = [resume.get('name', resume.get('filename', f'Resume {i+1}')) 
                           for i, resume in enumerate(resume_data)]
            
            # Get basic rankings
            rankings = self.rank_resumes_by_similarity(
                job_description, resume_texts, resume_names, method, True, skills_weight
            )
            
            # Calculate summary statistics
            if rankings:
                scores = [r['final_score'] for r in rankings if 'error' not in r]
                summary = {
                    'total_resumes': len(rankings),
                    'successful_rankings': len(scores),
                    'average_score': round(np.mean(scores), 4) if scores else 0.0,
                    'highest_score': round(max(scores), 4) if scores else 0.0,
                    'lowest_score': round(min(scores), 4) if scores else 0.0,
                    'score_std': round(np.std(scores), 4) if len(scores) > 1 else 0.0,
                    'method_used': method,
                    'skills_weight': skills_weight
                }
                
                # Analyze score distribution
                score_ranges = {
                    'excellent': len([s for s in scores if s >= 0.8]),
                    'good': len([s for s in scores if 0.6 <= s < 0.8]),
                    'fair': len([s for s in scores if 0.4 <= s < 0.6]),
                    'poor': len([s for s in scores if s < 0.4])
                }
                summary['score_distribution'] = score_ranges
                
                # Top candidates analysis
                top_candidates = rankings[:3] if len(rankings) >= 3 else rankings
                analysis = {
                    'top_candidates': top_candidates,
                    'recommendations': self._generate_ranking_recommendations(rankings, summary),
                    'improvement_suggestions': self._generate_improvement_suggestions(rankings)
                }
            else:
                summary = {'error': 'No rankings generated'}
                analysis = {}
            
            return {
                'rankings': rankings,
                'summary': summary,
                'analysis': analysis,
                'timestamp': str(np.datetime64('now'))
            }
            
        except Exception as e:
            logger.error(f"Error in detailed resume analysis: {e}")
            return {
                'rankings': [],
                'summary': {'error': str(e)},
                'analysis': {},
                'error': str(e)
            }
    
    def _generate_ranking_recommendations(self, rankings: List[Dict], summary: Dict) -> List[str]:
        """Generate recommendations based on ranking results"""
        recommendations = []
        
        if not rankings:
            return ["No resumes to analyze"]
        
        # Top candidate recommendations
        if summary.get('highest_score', 0) >= 0.8:
            recommendations.append("Excellent match found! Consider this candidate for immediate interview.")
        elif summary.get('highest_score', 0) >= 0.6:
            recommendations.append("Good matches available. Schedule interviews with top candidates.")
        else:
            recommendations.append("Consider revising job requirements or expanding candidate pool.")
        
        # Score distribution recommendations
        if summary.get('score_distribution', {}).get('excellent', 0) > 0:
            recommendations.append(f"Found {summary['score_distribution']['excellent']} excellent candidate(s).")
        
        if summary.get('average_score', 0) < 0.5:
            recommendations.append("Overall candidate pool quality is low. Consider adjusting job description.")
        
        return recommendations
    
    def _generate_improvement_suggestions(self, rankings: List[Dict]) -> List[str]:
        """Generate suggestions for improving resume matching"""
        suggestions = []
        
        if not rankings:
            return ["No data available for suggestions"]
        
        # Analyze common patterns
        low_scores = [r for r in rankings if r.get('final_score', 0) < 0.4]
        high_scores = [r for r in rankings if r.get('final_score', 0) >= 0.7]
        
        if low_scores:
            suggestions.append(f"Consider {len(low_scores)} low-scoring candidates for skill development programs.")
        
        if high_scores:
            suggestions.append(f"Top {len(high_scores)} candidates show strong alignment with job requirements.")
        
        # Skills gap analysis
        if any('skills_similarity' in r for r in rankings):
            avg_skills_sim = np.mean([r.get('skills_similarity', 0) for r in rankings if 'skills_similarity' in r])
            if avg_skills_sim < 0.5:
                suggestions.append("Consider offering training programs for common skill gaps.")
        
        return suggestions
    
    def get_model_info(self) -> Dict:
        """
        Get information about the current model
        
        Returns:
            Dictionary with model information
        """
        return {
            'model_name': self.model_name,
            'device': self.device,
            'cache_size': len(self._embeddings_cache),
            'max_cache_size': self._cache_size_limit,
            'cuda_available': torch.cuda.is_available()
        }
    
    def clear_cache(self):
        """Clear the embeddings cache to free memory"""
        try:
            self._embeddings_cache.clear()
            gc.collect()  # Force garbage collection
            logger.info("Embeddings cache cleared")
        except Exception as e:
            logger.warning(f"Error clearing cache: {e}")
    
    def optimize_memory(self):
        """Optimize memory usage by clearing cache and garbage collection"""
        try:
            self.clear_cache()
            torch.cuda.empty_cache() if torch.cuda.is_available() else None
            logger.info("Memory optimization completed")
        except Exception as e:
            logger.warning(f"Error during memory optimization: {e}")


# Example usage and testing
if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Test the similarity engine
    try:
        engine = SimilarityEngine()
        
        # Sample texts
        text1 = "Python developer with experience in Django and Flask"
        text2 = "Software engineer skilled in Python web development"
        text3 = "Java developer with Spring Boot experience"
        
        print("=== Similarity Engine Test ===")
        
        # Test different similarity methods
        bert_sim = engine.calculate_similarity(text1, text2, "bert")
        tfidf_sim = engine.calculate_similarity(text1, text2, "tfidf")
        hybrid_sim = engine.calculate_similarity(text1, text2, "hybrid")
        
        print(f"BERT similarity: {bert_sim:.3f}")
        print(f"TF-IDF similarity: {tfidf_sim:.3f}")
        print(f"Hybrid similarity: {hybrid_sim:.3f}")
        
        # Test skills similarity
        skills1 = ["Python", "Django", "Flask"]
        skills2 = ["Python", "FastAPI", "React"]
        skills_sim = engine.calculate_skills_similarity(skills1, skills2)
        print(f"Skills similarity: {skills_sim:.3f}")
        
        # Test batch similarity
        texts = [text1, text2, text3]
        similarities = engine.calculate_batch_similarity(texts, text1)
        print(f"Batch similarities: {[f'{s:.3f}' for s in similarities]}")
        
        # Test finding most similar
        most_similar = engine.find_most_similar(text1, texts, top_k=2)
        print(f"Most similar: {most_similar}")
        
        # Test the new resume ranking functionality
        print("\n=== Testing Resume Ranking ===")
        
        # Sample job description
        job_desc = "We are looking for a Python developer with experience in Django, Flask, and web development. Knowledge of SQL, Git, and AWS is required."
        
        # Sample resumes
        resume_texts = [
            "Python developer with 3 years experience in Django and Flask. Proficient in SQL, Git, and AWS.",
            "Java developer with Spring Boot experience. Some Python knowledge but mainly Java focused.",
            "Frontend developer with React and JavaScript. Limited backend experience.",
            "Python developer with Django experience. Also knows Docker and Kubernetes."
        ]
        
        resume_names = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown"]
        
        # Test basic ranking
        rankings = engine.rank_resumes_by_similarity(job_desc, resume_texts, resume_names)
        print(f"Basic rankings: {len(rankings)} resumes ranked")
        for rank in rankings[:3]:  # Show top 3
            print(f"Rank {rank['rank']}: {rank['resume_name']} - Score: {rank['final_score']}")
        
        # Test detailed analysis
        resume_data = [
            {'text': resume_texts[0], 'name': resume_names[0], 'email': 'john@example.com'},
            {'text': resume_texts[1], 'name': resume_names[1], 'email': 'jane@example.com'},
            {'text': resume_texts[2], 'name': resume_names[2], 'email': 'bob@example.com'},
            {'text': resume_texts[3], 'name': resume_names[3], 'email': 'alice@example.com'}
        ]
        
        detailed_analysis = engine.rank_resumes_with_detailed_analysis(job_desc, resume_data)
        print(f"\nDetailed analysis summary:")
        print(f"Total resumes: {detailed_analysis['summary'].get('total_resumes', 0)}")
        print(f"Average score: {detailed_analysis['summary'].get('average_score', 0)}")
        print(f"Top score: {detailed_analysis['summary'].get('highest_score', 0)}")
        
        # Get model info
        model_info = engine.get_model_info()
        print(f"\nModel info: {model_info}")
        
    except Exception as e:
        print(f"Error testing similarity engine: {e}")
