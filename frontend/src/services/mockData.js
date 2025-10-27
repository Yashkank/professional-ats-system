// Mock candidate data for AI Matching Dashboard
export const mockCandidates = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    score: 92,
    matchType: 'Strong',
    skillsMatched: 8,
    skillsMissing: 2,
    matchedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'Git'],
    missingSkills: ['React', 'TypeScript'],
    experience: '6+ years',
    experienceDetails: 'Senior AI Engineer with expertise in machine learning, deep learning, and cloud architecture. Led multiple ML projects from conception to production.',
    education: 'Master of Science in Computer Science',
    university: 'Stanford University',
    graduationYear: '2018',
    aiSummary: 'Exceptional candidate with strong technical background in AI/ML. Demonstrates deep expertise in Python, TensorFlow, and cloud technologies. Proven track record of leading complex ML projects and excellent problem-solving skills.'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@email.com',
    phone: '+1 (555) 234-5678',
    location: 'Austin, TX',
    score: 78,
    matchType: 'Moderate',
    skillsMatched: 6,
    skillsMissing: 4,
    matchedSkills: ['Python', 'Machine Learning', 'AWS', 'Docker', 'SQL', 'Git'],
    missingSkills: ['TensorFlow', 'React', 'TypeScript', 'Kubernetes'],
    experience: '4+ years',
    experienceDetails: 'Software Engineer with focus on data science and machine learning. Experience in building scalable data pipelines and ML models.',
    education: 'Bachelor of Science in Computer Science',
    university: 'University of Texas',
    graduationYear: '2019',
    aiSummary: 'Solid candidate with good technical skills in Python and machine learning. Shows strong analytical thinking and experience with data science projects. Would benefit from additional cloud and deep learning experience.'
  },
  {
    id: '3',
    name: 'Emily Johnson',
    email: 'emily.johnson@email.com',
    phone: '+1 (555) 345-6789',
    location: 'Seattle, WA',
    score: 85,
    matchType: 'Strong',
    skillsMatched: 7,
    skillsMissing: 3,
    matchedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'Docker', 'SQL', 'Git'],
    missingSkills: ['React', 'TypeScript', 'Kubernetes'],
    experience: '5+ years',
    experienceDetails: 'AI Research Engineer with expertise in computer vision and natural language processing. Published research papers and contributed to open-source ML projects.',
    education: 'PhD in Computer Science',
    university: 'University of Washington',
    graduationYear: '2020',
    aiSummary: 'Highly qualified candidate with advanced degree and research experience. Strong technical skills in AI/ML with focus on computer vision and NLP. Excellent academic background and proven research capabilities.'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '+1 (555) 456-7890',
    location: 'New York, NY',
    score: 65,
    matchType: 'Weak',
    skillsMatched: 4,
    skillsMissing: 6,
    matchedSkills: ['Python', 'AWS', 'SQL', 'Git'],
    missingSkills: ['Machine Learning', 'TensorFlow', 'React', 'TypeScript', 'Docker', 'Kubernetes'],
    experience: '3+ years',
    experienceDetails: 'Software Developer with experience in web development and basic data analysis. Looking to transition into AI/ML roles.',
    education: 'Bachelor of Science in Software Engineering',
    university: 'NYU',
    graduationYear: '2021',
    aiSummary: 'Junior candidate with basic programming skills but limited AI/ML experience. Shows enthusiasm for learning and has solid foundation in Python and cloud technologies. Would require significant training for AI Engineer role.'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    email: 'lisa.wang@email.com',
    phone: '+1 (555) 567-8901',
    location: 'Los Angeles, CA',
    score: 88,
    matchType: 'Strong',
    skillsMatched: 7,
    skillsMissing: 3,
    matchedSkills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'Docker', 'SQL', 'Git'],
    missingSkills: ['React', 'TypeScript', 'Kubernetes'],
    experience: '5+ years',
    experienceDetails: 'Senior Data Scientist with expertise in machine learning and big data processing. Experience in building ML pipelines and deploying models at scale.',
    education: 'Master of Science in Data Science',
    university: 'UCLA',
    graduationYear: '2019',
    aiSummary: 'Strong candidate with excellent data science background and ML expertise. Demonstrates deep understanding of machine learning algorithms and experience with large-scale data processing. Well-suited for AI Engineer role.'
  },
  {
    id: '6',
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '+1 (555) 678-9012',
    location: 'Chicago, IL',
    score: 72,
    matchType: 'Moderate',
    skillsMatched: 5,
    skillsMissing: 5,
    matchedSkills: ['Python', 'Machine Learning', 'AWS', 'SQL', 'Git'],
    missingSkills: ['TensorFlow', 'React', 'TypeScript', 'Docker', 'Kubernetes'],
    experience: '4+ years',
    experienceDetails: 'Backend Developer with some experience in data analysis and basic machine learning. Interested in transitioning to AI-focused roles.',
    education: 'Bachelor of Science in Computer Science',
    university: 'Northwestern University',
    graduationYear: '2020',
    aiSummary: 'Moderate candidate with good programming fundamentals and some ML experience. Shows potential for growth in AI/ML domain but would need additional training in deep learning frameworks and modern development practices.'
  }
];

// Mock job data
export const mockJob = {
  id: 'job-1',
  title: 'Senior AI Engineer',
  company: 'TechCorp Solutions',
  location: 'San Francisco, CA',
  description: 'We are looking for a Senior AI Engineer to join our team and help build cutting-edge AI solutions.',
  requirements: 'Python, Machine Learning, TensorFlow, AWS, Docker, Kubernetes, SQL, Git, React, TypeScript',
  skills: ['Python', 'Machine Learning', 'TensorFlow', 'AWS', 'Docker', 'Kubernetes', 'SQL', 'Git', 'React', 'TypeScript']
};

// Function to get candidates with applied filters
export const getFilteredCandidates = (filters = {}) => {
  let filtered = [...mockCandidates];
  
  if (filters.matchType) {
    filtered = filtered.filter(candidate => candidate.matchType === filters.matchType);
  }
  
  if (filters.minScore) {
    filtered = filtered.filter(candidate => candidate.score >= filters.minScore);
  }
  
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(candidate => 
      candidate.name.toLowerCase().includes(searchLower) ||
      candidate.email.toLowerCase().includes(searchLower) ||
      candidate.matchedSkills.some(skill => skill.toLowerCase().includes(searchLower))
    );
  }
  
  return filtered;
};

// Function to get candidate by ID
export const getCandidateById = (id) => {
  return mockCandidates.find(candidate => candidate.id === id);
};
