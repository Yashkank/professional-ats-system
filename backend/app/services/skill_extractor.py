import re
import logging
from typing import List, Dict, Set, Tuple, Optional, Any
from collections import Counter
import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

logger = logging.getLogger(__name__)

class SkillExtractor:
    """
    Advanced skill extraction and matching system using NLP and ML techniques
    """
    
    def __init__(self, nlp_model: str = "en_core_web_sm"):
        """
        Initialize the SkillExtractor
        
        Args:
            nlp_model: spaCy model to use for NLP processing
        """
        try:
            self.nlp = spacy.load(nlp_model)
            logger.info(f"Loaded spaCy model: {nlp_model}")
        except OSError:
            logger.warning(f"Model {nlp_model} not found. Please install with: python -m spacy download {nlp_model}")
            self.nlp = None
        
        # Initialize TF-IDF vectorizer for skill matching
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 3),
            min_df=1
        )
        
        # Comprehensive skills database with categories and synonyms
        self.skills_database = self._initialize_skills_database()
        
        # Skills embeddings cache for performance
        self._skills_embeddings_cache = {}
        self._tfidf_matrix = None
        self._tfidf_features = None
    
    def _initialize_skills_database(self) -> Dict[str, Dict]:
        """
        Initialize comprehensive skills database with categories and synonyms
        
        Returns:
            Skills database dictionary
        """
        return {
            'programming_languages': {
                'Python': ['python', 'py', 'python3', 'python2', 'django', 'flask', 'fastapi'],
                'Java': ['java', 'jdk', 'jre', 'spring', 'hibernate', 'maven', 'gradle'],
                'JavaScript': ['javascript', 'js', 'es6', 'es2015', 'node', 'express', 'react'],
                'TypeScript': ['typescript', 'ts', 'tsx'],
                'C++': ['c++', 'cpp', 'cplusplus', 'stl', 'boost'],
                'C': ['c', 'c programming', 'gcc', 'clang'],
                'C#': ['c#', 'csharp', '.net', 'asp.net', 'entity framework'],
                'Go': ['go', 'golang'],
                'Rust': ['rust', 'cargo'],
                'PHP': ['php', 'laravel', 'symfony', 'wordpress', 'drupal'],
                'Ruby': ['ruby', 'rails', 'ruby on rails', 'sinatra'],
                'Swift': ['swift', 'ios', 'xcode', 'cocoa'],
                'Kotlin': ['kotlin', 'android', 'kotlin android'],
                'Scala': ['scala', 'akka', 'play framework'],
                'R': ['r', 'r programming', 'rstudio', 'tidyverse'],
                'MATLAB': ['matlab', 'octave'],
                'Perl': ['perl', 'cpan'],
                'Shell': ['shell', 'bash', 'zsh', 'fish', 'powershell'],
                'VBA': ['vba', 'excel vba', 'access vba'],
                'Assembly': ['assembly', 'asm', 'x86', 'arm assembly'],
                'Fortran': ['fortran', 'fortran90', 'fortran95'],
                'COBOL': ['cobol', 'mainframe']
            },
            'frameworks_libraries': {
                'React': ['react', 'reactjs', 'react.js', 'jsx', 'redux', 'hooks'],
                'Angular': ['angular', 'angularjs', 'ng', 'angular cli'],
                'Vue.js': ['vue', 'vuejs', 'vue.js', 'nuxt', 'vuex'],
                'Node.js': ['node', 'nodejs', 'node.js', 'npm', 'yarn'],
                'Express.js': ['express', 'expressjs', 'express.js'],
                'Django': ['django', 'djangorest', 'django orm'],
                'Flask': ['flask', 'flask-restful', 'jinja2'],
                'FastAPI': ['fastapi', 'pydantic', 'uvicorn'],
                'Spring Boot': ['spring boot', 'spring', 'spring framework'],
                'Laravel': ['laravel', 'php artisan', 'blade'],
                'Ruby on Rails': ['rails', 'ruby on rails', 'activerecord'],
                'ASP.NET': ['asp.net', 'aspnet', '.net core', 'blazor'],
                'jQuery': ['jquery', 'jq'],
                'Bootstrap': ['bootstrap', 'bootstrap 4', 'bootstrap 5'],
                'Tailwind CSS': ['tailwind', 'tailwindcss', 'tailwind ui'],
                'Material-UI': ['material-ui', 'mui', 'material design'],
                'Ant Design': ['antd', 'ant design']
            },
            'databases': {
                'MySQL': ['mysql', 'mariadb', 'innodb', 'myisam'],
                'PostgreSQL': ['postgresql', 'postgres', 'psql', 'pgadmin'],
                'MongoDB': ['mongodb', 'mongo', 'mongoose', 'nosql'],
                'Redis': ['redis', 'redis cache', 'redis cluster'],
                'SQLite': ['sqlite', 'sqlite3'],
                'Oracle': ['oracle', 'oracle db', 'pl/sql', 'sql developer'],
                'SQL Server': ['sql server', 'mssql', 't-sql', 'ssms'],
                'Cassandra': ['cassandra', 'apache cassandra'],
                'DynamoDB': ['dynamodb', 'aws dynamodb'],
                'Firebase': ['firebase', 'firestore', 'realtime database'],
                'Elasticsearch': ['elasticsearch', 'elastic', 'kibana', 'logstash'],
                'Neo4j': ['neo4j', 'graph database', 'cypher']
            },
            'cloud_platforms': {
                'AWS': ['aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds'],
                'Azure': ['azure', 'microsoft azure', 'azure devops', 'azure functions'],
                'Google Cloud Platform': ['gcp', 'google cloud', 'cloud functions', 'bigquery'],
                'IBM Cloud': ['ibm cloud', 'watson', 'bluemix'],
                'Oracle Cloud': ['oracle cloud', 'oci'],
                'DigitalOcean': ['digitalocean', 'droplet', 'spaces'],
                'Heroku': ['heroku', 'dyno', 'addons'],
                'Vercel': ['vercel', 'vercel deploy'],
                'Netlify': ['netlify', 'netlify functions'],
                'Firebase': ['firebase', 'google firebase'],
                'Cloudflare': ['cloudflare', 'cloudflare workers', 'pages']
            },
            'ai_ml_tools': {
                'TensorFlow': ['tensorflow', 'tf', 'keras', 'tensorboard'],
                'PyTorch': ['pytorch', 'torch', 'torchvision', 'torchaudio'],
                'Scikit-learn': ['scikit-learn', 'sklearn', 'scikit learn'],
                'Keras': ['keras', 'tensorflow keras'],
                'OpenAI': ['openai', 'gpt', 'chatgpt', 'dall-e'],
                'Hugging Face': ['hugging face', 'transformers', 'datasets'],
                'LangChain': ['langchain', 'lang chain'],
                'Claude': ['claude', 'anthropic'],
                'YOLO': ['yolo', 'yolov5', 'yolov8', 'object detection'],
                'OpenCV': ['opencv', 'cv2', 'computer vision'],
                'InsightFace': ['insightface', 'face recognition'],
                'Pandas': ['pandas', 'pd', 'dataframe'],
                'NumPy': ['numpy', 'np', 'array'],
                'Matplotlib': ['matplotlib', 'plt', 'plotting'],
                'Seaborn': ['seaborn', 'sns', 'statistical plotting'],
                'Plotly': ['plotly', 'interactive plots'],
                'Jupyter': ['jupyter', 'jupyter notebook', 'jupyter lab']
            },
            'devops_tools': {
                'Docker': ['docker', 'dockerfile', 'docker compose', 'kubernetes'],
                'Kubernetes': ['kubernetes', 'k8s', 'helm', 'kubectl'],
                'Jenkins': ['jenkins', 'ci/cd', 'pipeline'],
                'GitLab CI': ['gitlab ci', 'gitlab pipelines', '.gitlab-ci.yml'],
                'GitHub Actions': ['github actions', 'workflows', '.github/workflows'],
                'Terraform': ['terraform', 'iac', 'infrastructure as code'],
                'Ansible': ['ansible', 'playbook', 'automation'],
                'Chef': ['chef', 'chef cookbook'],
                'Puppet': ['puppet', 'puppet manifest'],
                'Vagrant': ['vagrant', 'virtual machine'],
                'Prometheus': ['prometheus', 'monitoring', 'metrics'],
                'Grafana': ['grafana', 'dashboards', 'visualization']
            },
            'version_control': {
                'Git': ['git', 'github', 'gitlab', 'bitbucket', 'git flow'],
                'GitHub': ['github', 'pull request', 'issues', 'actions'],
                'GitLab': ['gitlab', 'merge request', 'gitlab ci'],
                'Bitbucket': ['bitbucket', 'bitbucket pipelines'],
                'SVN': ['svn', 'subversion'],
                'Mercurial': ['mercurial', 'hg']
            },
            'operating_systems': {
                'Linux': ['linux', 'ubuntu', 'centos', 'red hat', 'debian', 'fedora'],
                'Windows': ['windows', 'windows server', 'powershell', 'cmd'],
                'macOS': ['macos', 'mac os', 'terminal', 'homebrew'],
                'Unix': ['unix', 'bsd', 'freebsd', 'openbsd']
            }
        }
    
    def extract_skills(self, text: str, method: str = "hybrid") -> List[str]:
        """
        Extract skills from text using specified method
        
        Args:
            text: Input text to extract skills from
            method: Extraction method ('exact', 'fuzzy', 'hybrid')
            
        Returns:
            List of extracted skills
        """
        if not text:
            return []
        
        try:
            if method == "exact":
                return self._extract_skills_exact(text)
            elif method == "fuzzy":
                return self._extract_skills_fuzzy(text)
            elif method == "hybrid":
                return self._extract_skills_hybrid(text)
            else:
                logger.warning(f"Unknown method '{method}', using hybrid")
                return self._extract_skills_hybrid(text)
                
        except Exception as e:
            logger.error(f"Error extracting skills: {e}")
            return []
    
    def _extract_skills_exact(self, text: str) -> List[str]:
        """
        Extract skills using exact string matching
        
        Args:
            text: Input text
            
        Returns:
            List of matched skills
        """
        found_skills = []
        text_lower = text.lower()
        
        for category, skills_dict in self.skills_database.items():
            for skill, synonyms in skills_dict.items():
                # Check main skill name
                if skill.lower() in text_lower:
                    found_skills.append(skill)
                # Check synonyms
                elif any(syn.lower() in text_lower for syn in synonyms):
                    found_skills.append(skill)
        
        return list(set(found_skills))  # Remove duplicates
    
    def _extract_skills_fuzzy(self, text: str) -> List[str]:
        """
        Extract skills using fuzzy matching with TF-IDF
        
        Args:
            text: Input text
            
        Returns:
            List of matched skills
        """
        try:
            # Prepare skills corpus
            skills_corpus = []
            skill_names = []
            
            for category, skills_dict in self.skills_database.items():
                for skill, synonyms in skills_dict.items():
                    skills_corpus.append(f"{skill} {' '.join(synonyms)}")
                    skill_names.append(skill)
            
            # Add input text to corpus
            skills_corpus.append(text)
            
            # Calculate TF-IDF
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(skills_corpus)
            
            # Calculate similarity between text and each skill
            text_vector = tfidf_matrix[-1:]  # Last vector is our text
            skill_vectors = tfidf_matrix[:-1]  # All vectors except last
            
            similarities = cosine_similarity(text_vector, skill_vectors).flatten()
            
            # Find skills above threshold
            threshold = 0.1
            matched_skills = []
            
            for idx, similarity in enumerate(similarities):
                if similarity > threshold:
                    matched_skills.append(skill_names[idx])
            
            return matched_skills
            
        except Exception as e:
            logger.error(f"Error in fuzzy skill extraction: {e}")
            return []
    
    def _extract_skills_hybrid(self, text: str) -> List[str]:
        """
        Combine exact and fuzzy matching for better results
        
        Args:
            text: Input text
            
        Returns:
            List of matched skills
        """
        exact_skills = self._extract_skills_exact(text)
        fuzzy_skills = self._extract_skills_fuzzy(text)
        
        # Combine and remove duplicates
        all_skills = exact_skills + fuzzy_skills
        unique_skills = list(dict.fromkeys(all_skills))  # Preserve order
        
        return unique_skills
    
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
            # Convert to sets for comparison
            set1 = set(skills1)
            set2 = set(skills2)
            
            # Calculate Jaccard similarity
            intersection = len(set1.intersection(set2))
            union = len(set1.union(set2))
            
            if union == 0:
                return 0.0
            
            jaccard_similarity = intersection / union
            
            # Calculate weighted similarity based on skill importance
            weighted_similarity = self._calculate_weighted_similarity(skills1, skills2)
            
            # Combine both metrics
            final_similarity = (jaccard_similarity * 0.6) + (weighted_similarity * 0.4)
            
            return min(final_similarity, 1.0)
            
        except Exception as e:
            logger.error(f"Error calculating skills similarity: {e}")
            return 0.0
    
    def _calculate_weighted_similarity(self, skills1: List[str], skills2: List[str]) -> float:
        """
        Calculate weighted similarity based on skill categories and importance
        
        Args:
            skills1: First skill list
            skills2: Second skill list
            
        Returns:
            Weighted similarity score
        """
        try:
            # Define category weights (higher = more important)
            category_weights = {
                'programming_languages': 1.0,
                'frameworks_libraries': 0.9,
                'databases': 0.8,
                'cloud_platforms': 0.7,
                'ai_ml_tools': 0.9,
                'devops_tools': 0.8,
                'version_control': 0.6,
                'operating_systems': 0.5
            }
            
            total_weight = 0
            weighted_score = 0
            
            for category, skills_dict in self.skills_database.items():
                weight = category_weights.get(category, 0.5)
                
                # Count skills from this category in both lists
                cat_skills1 = [s for s in skills1 if s in skills_dict]
                cat_skills2 = [s for s in skills2 if s in skills_dict]
                
                if cat_skills1 or cat_skills2:
                    # Calculate category similarity
                    if cat_skills1 and cat_skills2:
                        cat_similarity = len(set(cat_skills1) & set(cat_skills2)) / len(set(cat_skills1) | set(cat_skills2))
                    else:
                        cat_similarity = 0.0
                    
                    weighted_score += cat_similarity * weight
                    total_weight += weight
            
            if total_weight == 0:
                return 0.0
            
            return weighted_score / total_weight
            
        except Exception as e:
            logger.error(f"Error calculating weighted similarity: {e}")
            return 0.0
    
    def get_skills_by_category(self, skills: List[str]) -> Dict[str, List[str]]:
        """
        Organize skills by their categories
        
        Args:
            skills: List of skills
            
        Returns:
            Dictionary with categories as keys and skill lists as values
        """
        categorized_skills = {}
        
        for category, skills_dict in self.skills_database.items():
            category_skills = [skill for skill in skills if skill in skills_dict]
            if category_skills:
                categorized_skills[category] = category_skills
        
        return categorized_skills
    
    def add_custom_skill(self, skill: str, category: str, synonyms: List[str] = None):
        """
        Add a custom skill to the database
        
        Args:
            skill: Skill name
            category: Skill category
            synonyms: List of synonyms for the skill
        """
        if category not in self.skills_database:
            self.skills_database[category] = {}
        
        if synonyms is None:
            synonyms = []
        
        self.skills_database[category][skill] = synonyms
        logger.info(f"Added custom skill '{skill}' to category '{category}'")
    
    def get_skill_statistics(self, text: str) -> Dict:
        """
        Get comprehensive statistics about skills in text
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with skill statistics
        """
        try:
            skills = self.extract_skills(text)
            categorized = self.get_skills_by_category(skills)
            
            stats = {
                'total_skills': len(skills),
                'categories_found': len(categorized),
                'skills_by_category': categorized,
                'most_common_skills': Counter(skills).most_common(5),
                'category_distribution': {cat: len(skills_list) for cat, skills_list in categorized.items()}
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting skill statistics: {e}")
            return {}
    
    def export_skills_database(self) -> Dict:
        """
        Export the current skills database
        
        Returns:
            Copy of the skills database
        """
        return self.skills_database.copy()
    
    def extract_skills_regex(self, text: str, custom_patterns: Dict[str, str] = None) -> List[str]:
        """
        Extract skills using regex patterns for more flexible matching
        
        Args:
            text: Input text to extract skills from
            custom_patterns: Dictionary of custom regex patterns {skill_name: pattern}
            
        Returns:
            List of extracted skills
        """
        if not text:
            return []
        
        try:
            found_skills = []
            
            # Default regex patterns for common skill variations
            default_patterns = {
                'Python': r'\b(?:python|py|python3|python2|django|flask|fastapi|pandas|numpy)\b',
                'Java': r'\b(?:java|jdk|jre|spring|hibernate|maven|gradle|junit)\b',
                'JavaScript': r'\b(?:javascript|js|es6|es2015|node|express|react|vue|angular)\b',
                'SQL': r'\b(?:sql|mysql|postgresql|oracle|sqlite|tsql|plsql)\b',
                'Git': r'\b(?:git|github|gitlab|bitbucket|pull.?request|merge.?request)\b',
                'Docker': r'\b(?:docker|dockerfile|docker.?compose|kubernetes|k8s)\b',
                'AWS': r'\b(?:aws|amazon.?web.?services|ec2|s3|lambda|rds|cloudfront)\b',
                'Azure': r'\b(?:azure|microsoft.?azure|azure.?devops|azure.?functions)\b',
                'Machine Learning': r'\b(?:ml|machine.?learning|ai|artificial.?intelligence|deep.?learning)\b',
                'Data Science': r'\b(?:data.?science|data.?analysis|statistics|analytics|bi)\b'
            }
            
            # Merge custom patterns with defaults
            if custom_patterns:
                default_patterns.update(custom_patterns)
            
            # Apply regex patterns
            for skill_name, pattern in default_patterns.items():
                matches = re.findall(pattern, text, re.IGNORECASE)
                if matches:
                    found_skills.append(skill_name)
                    logger.debug(f"Found skill '{skill_name}' using regex pattern")
            
            return list(set(found_skills))  # Remove duplicates
            
        except Exception as e:
            logger.error(f"Error in regex skill extraction: {e}")
            return []
    
    def extract_skills_keywords(self, text: str, keyword_weights: Dict[str, float] = None) -> List[str]:
        """
        Extract skills using keyword matching with configurable weights
        
        Args:
            text: Input text to extract skills from
            keyword_weights: Dictionary of keyword weights {keyword: weight}
            
        Returns:
            List of extracted skills with confidence scores
        """
        if not text:
            return []
        
        try:
            found_skills = []
            text_lower = text.lower()
            
            # Default keyword weights (higher = more important)
            default_weights = {
                'python': 1.0, 'java': 1.0, 'javascript': 1.0, 'react': 0.9,
                'sql': 0.8, 'git': 0.7, 'docker': 0.8, 'aws': 0.9,
                'machine learning': 0.9, 'data science': 0.9, 'devops': 0.8
            }
            
            # Merge custom weights
            if keyword_weights:
                default_weights.update(keyword_weights)
            
            # Find keywords in text
            for keyword, weight in default_weights.items():
                if keyword.lower() in text_lower:
                    # Count occurrences for confidence scoring
                    occurrences = text_lower.count(keyword.lower())
                    confidence = min(weight * occurrences, 1.0)
                    
                    found_skills.append({
                        'skill': keyword,
                        'confidence': confidence,
                        'occurrences': occurrences
                    })
                    logger.debug(f"Found keyword '{keyword}' with confidence {confidence:.2f}")
            
            # Sort by confidence and return skill names
            found_skills.sort(key=lambda x: x['confidence'], reverse=True)
            return [skill['skill'] for skill in found_skills]
            
        except Exception as e:
            logger.error(f"Error in keyword skill extraction: {e}")
            return []
    
    def add_skill_pattern(self, skill_name: str, pattern: str, category: str = "custom"):
        """
        Add a custom skill with regex pattern for easy extension
        
        Args:
            skill_name: Name of the skill
            pattern: Regex pattern to match the skill
            category: Category for the skill
        """
        if category not in self.skills_database:
            self.skills_database[category] = {}
        
        # Add to skills database
        self.skills_database[category][skill_name] = [pattern]
        
        # Also add to regex patterns for future use
        if not hasattr(self, '_custom_regex_patterns'):
            self._custom_regex_patterns = {}
        
        self._custom_regex_patterns[skill_name] = pattern
        logger.info(f"Added custom skill pattern '{skill_name}' with pattern '{pattern}'")
    
    def add_skill_keywords(self, skill_name: str, keywords: List[str], category: str = "custom"):
        """
        Add a custom skill with keywords for easy extension
        
        Args:
            skill_name: Name of the skill
            keywords: List of keywords associated with the skill
            category: Category for the skill
        """
        if category not in self.skills_database:
            self.skills_database[category] = {}
        
        # Add to skills database
        self.skills_database[category][skill_name] = keywords
        
        # Also add to keyword weights
        if not hasattr(self, '_custom_keyword_weights'):
            self._custom_keyword_weights = {}
        
        for keyword in keywords:
            self._custom_keyword_weights[keyword] = 0.8  # Default weight
        
        logger.info(f"Added custom skill '{skill_name}' with keywords: {keywords}")
    
    def extract_skills_advanced(self, text: str, methods: List[str] = None) -> Dict[str, List[str]]:
        """
        Extract skills using multiple methods and return comprehensive results
        
        Args:
            text: Input text to extract skills from
            methods: List of methods to use ('exact', 'fuzzy', 'regex', 'keywords', 'hybrid')
            
        Returns:
            Dictionary with method names as keys and skill lists as values
        """
        if methods is None:
            methods = ['exact', 'fuzzy', 'regex', 'keywords', 'hybrid']
        
        results = {}
        
        try:
            for method in methods:
                if method == 'exact':
                    results['exact'] = self._extract_skills_exact(text)
                elif method == 'fuzzy':
                    results['fuzzy'] = self._extract_skills_fuzzy(text)
                elif method == 'regex':
                    results['regex'] = self.extract_skills_regex(text)
                elif method == 'keywords':
                    results['keywords'] = self.extract_skills_keywords(text)
                elif method == 'hybrid':
                    results['hybrid'] = self._extract_skills_hybrid(text)
            
            # Add combined results
            all_skills = []
            for skill_list in results.values():
                all_skills.extend(skill_list)
            
            results['combined'] = list(dict.fromkeys(all_skills))  # Remove duplicates, preserve order
            
            return results
            
        except Exception as e:
            logger.error(f"Error in advanced skill extraction: {e}")
            return {method: [] for method in methods}
    
    def get_skill_extraction_summary(self, text: str) -> Dict[str, Any]:
        """
        Get comprehensive summary of skill extraction from text
        
        Args:
            text: Input text
            
        Returns:
            Dictionary with extraction summary
        """
        try:
            # Extract skills using all methods
            all_results = self.extract_skills_advanced(text)
            
            # Get statistics
            stats = self.get_skill_statistics(text)
            
            # Calculate method effectiveness
            method_effectiveness = {}
            for method, skills in all_results.items():
                if method != 'combined':
                    method_effectiveness[method] = {
                        'skills_found': len(skills),
                        'unique_skills': len(set(skills)),
                        'coverage': len(skills) / max(len(all_results['combined']), 1)
                    }
            
            summary = {
                'text_length': len(text),
                'total_unique_skills': len(all_results['combined']),
                'method_results': all_results,
                'method_effectiveness': method_effectiveness,
                'skill_statistics': stats,
                'recommended_method': max(method_effectiveness.items(), 
                                       key=lambda x: x[1]['coverage'])[0] if method_effectiveness else 'hybrid'
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"Error getting skill extraction summary: {e}")
            return {}


# Example usage and testing
if __name__ == "__main__":
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    
    # Test the skill extractor
    extractor = SkillExtractor()
    
    # Sample text
    sample_text = """
    I am a Python developer with experience in Django, Flask, and FastAPI.
    I also work with JavaScript, React, and Node.js. For databases, I use
    PostgreSQL and MongoDB. I have experience with AWS and Docker.
    """
    
    print("=== Skill Extraction Test ===")
    
    # Extract skills using different methods
    exact_skills = extractor.extract_skills(sample_text, "exact")
    fuzzy_skills = extractor.extract_skills(sample_text, "fuzzy")
    hybrid_skills = extractor.extract_skills(sample_text, "hybrid")
    
    print(f"Exact matching: {exact_skills}")
    print(f"Fuzzy matching: {fuzzy_skills}")
    print(f"Hybrid matching: {hybrid_skills}")
    
    # Test new regex and keyword methods
    regex_skills = extractor.extract_skills_regex(sample_text)
    keyword_skills = extractor.extract_skills_keywords(sample_text)
    
    print(f"Regex matching: {regex_skills}")
    print(f"Keyword matching: {keyword_skills}")
    
    # Test advanced extraction with all methods
    print("\n=== Advanced Skill Extraction ===")
    advanced_results = extractor.extract_skills_advanced(sample_text)
    for method, skills in advanced_results.items():
        print(f"{method.capitalize()}: {skills}")
    
    # Get comprehensive summary
    summary = extractor.get_skill_extraction_summary(sample_text)
    print(f"\nExtraction Summary:")
    print(f"Text length: {summary['text_length']} characters")
    print(f"Total unique skills: {summary['total_unique_skills']}")
    print(f"Recommended method: {summary['recommended_method']}")
    
    # Test custom skill addition
    print("\n=== Testing Custom Skill Extension ===")
    extractor.add_skill_pattern("GraphQL", r"\b(?:graphql|gql|apollo)\b", "frameworks_libraries")
    extractor.add_skill_keywords("Blockchain", ["blockchain", "ethereum", "solidity", "smart contracts"], "emerging_tech")
    
    # Test with custom skills
    custom_text = "I have experience with GraphQL and blockchain development using Solidity."
    custom_skills = extractor.extract_skills_regex(custom_text)
    print(f"Custom skills found: {custom_skills}")
    
    # Get statistics
    stats = extractor.get_skill_statistics(sample_text)
    print(f"\nSkill Statistics: {stats}")
    
    # Test similarity calculation
    skills1 = ["Python", "Django", "JavaScript"]
    skills2 = ["Python", "Flask", "React"]
    similarity = extractor.calculate_skills_similarity(skills1, skills2)
    print(f"\nSkills similarity: {similarity:.2f}")
