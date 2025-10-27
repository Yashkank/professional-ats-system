import React, { useState, useEffect } from 'react'
import { 
  Linkedin, 
  Search, 
  Filter, 
  Download, 
  Users, 
  MapPin, 
  Briefcase, 
  CheckCircle, 
  ExternalLink,
  RefreshCw,
  Settings,
  Target,
  Clock,
  BarChart3
} from 'lucide-react'

const LinkedInIntegration = ({ 
  onImportCandidates,
  onSaveCandidates,
  jobs = []
}) => {
  const [isConnected, setIsConnected] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    industry: '',
    experience: '',
    skills: '',
    company: '',
    education: '',
    connections: '',
    availability: 'all'
  })
  const [sortBy, setSortBy] = useState('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [importedCandidates, setImportedCandidates] = useState([])
  const [importStats, setImportStats] = useState({
    totalSearched: 0,
    totalImported: 0,
    totalMatched: 0,
    averageMatchScore: 0
  })

  // Mock LinkedIn API service
  const linkedInAPI = {
    connect: async () => {
      // Simulate LinkedIn OAuth connection
      await new Promise(resolve => setTimeout(resolve, 2000))
      return { success: true, accessToken: 'mock_token_123' }
    },
    
    searchCandidates: async (query, filters) => {
      // Simulate LinkedIn search API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Mock search results
      const mockResults = [
        {
          id: 'li_1',
          name: 'Sarah Johnson',
          headline: 'Senior Software Engineer | React, Node.js, Python',
          location: 'San Francisco, CA',
          industry: 'Technology',
          experience: '5+ years',
          currentCompany: 'Google',
          profileUrl: 'https://linkedin.com/in/sarah-johnson',
          profileImage: 'https://via.placeholder.com/150/4F46E5/FFFFFF?text=SJ',
          connections: '500+',
          summary: 'Passionate software engineer with 5+ years of experience in full-stack development. Expert in React, Node.js, and Python with a strong background in building scalable web applications.',
          skills: ['React', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'AWS', 'Docker', 'Kubernetes'],
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Google',
              duration: '2020 - Present',
              description: 'Leading development of scalable web applications using React and Node.js'
            },
            {
              title: 'Software Engineer',
              company: 'Microsoft',
              duration: '2018 - 2020',
              description: 'Developed and maintained enterprise software solutions'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science in Computer Science',
              school: 'Stanford University',
              year: '2018'
            }
          ],
          matchScore: 92,
          availability: 'open_to_work',
          lastActive: '2 days ago'
        },
        {
          id: 'li_2',
          name: 'Michael Chen',
          headline: 'Full Stack Developer | JavaScript, Python, AWS',
          location: 'Seattle, WA',
          industry: 'Technology',
          experience: '4+ years',
          currentCompany: 'Amazon',
          profileUrl: 'https://linkedin.com/in/michael-chen',
          profileImage: 'https://via.placeholder.com/150/059669/FFFFFF?text=MC',
          connections: '750+',
          summary: 'Full-stack developer with expertise in modern web technologies. Passionate about creating efficient and user-friendly applications.',
          skills: ['JavaScript', 'Python', 'AWS', 'React', 'Vue.js', 'PostgreSQL', 'MongoDB', 'Docker'],
          experience: [
            {
              title: 'Full Stack Developer',
              company: 'Amazon',
              duration: '2019 - Present',
              description: 'Building scalable web applications and microservices'
            },
            {
              title: 'Frontend Developer',
              company: 'Netflix',
              duration: '2017 - 2019',
              description: 'Developed user interfaces for streaming platform'
            }
          ],
          education: [
            {
              degree: 'Master of Science in Software Engineering',
              school: 'University of Washington',
              year: '2017'
            }
          ],
          matchScore: 88,
          availability: 'open_to_work',
          lastActive: '1 day ago'
        },
        {
          id: 'li_3',
          name: 'Emily Rodriguez',
          headline: 'Data Scientist | Machine Learning, Python, SQL',
          location: 'New York, NY',
          industry: 'Technology',
          experience: '6+ years',
          currentCompany: 'Meta',
          profileUrl: 'https://linkedin.com/in/emily-rodriguez',
          profileImage: 'https://via.placeholder.com/150/DC2626/FFFFFF?text=ER',
          connections: '1200+',
          summary: 'Data scientist with expertise in machine learning and statistical analysis. Passionate about using data to drive business decisions.',
          skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn'],
          experience: [
            {
              title: 'Senior Data Scientist',
              company: 'Meta',
              duration: '2021 - Present',
              description: 'Leading ML projects and data analysis initiatives'
            },
            {
              title: 'Data Scientist',
              company: 'Uber',
              duration: '2018 - 2021',
              description: 'Developed ML models for ride-sharing optimization'
            }
          ],
          education: [
            {
              degree: 'PhD in Data Science',
              school: 'MIT',
              year: '2018'
            }
          ],
          matchScore: 85,
          availability: 'passive',
          lastActive: '3 days ago'
        },
        {
          id: 'li_4',
          name: 'David Kim',
          headline: 'Product Manager | Agile, User Research, Strategy',
          location: 'Austin, TX',
          industry: 'Technology',
          experience: '7+ years',
          currentCompany: 'Apple',
          profileUrl: 'https://linkedin.com/in/david-kim',
          profileImage: 'https://via.placeholder.com/150/7C3AED/FFFFFF?text=DK',
          connections: '900+',
          summary: 'Product manager with a strong technical background and passion for creating user-centered products. Expert in agile methodologies and user research.',
          skills: ['Product Management', 'Agile', 'User Research', 'Strategy', 'Analytics', 'Figma', 'SQL', 'Python'],
          experience: [
            {
              title: 'Senior Product Manager',
              company: 'Apple',
              duration: '2020 - Present',
              description: 'Leading product strategy and development for iOS applications'
            },
            {
              title: 'Product Manager',
              company: 'Spotify',
              duration: '2017 - 2020',
              description: 'Managed music streaming features and user experience'
            }
          ],
          education: [
            {
              degree: 'MBA in Technology Management',
              school: 'University of Texas',
              year: '2017'
            }
          ],
          matchScore: 78,
          availability: 'not_open',
          lastActive: '1 week ago'
        },
        {
          id: 'li_5',
          name: 'Lisa Wang',
          headline: 'UX Designer | User Experience, UI Design, Research',
          location: 'Los Angeles, CA',
          industry: 'Design',
          experience: '4+ years',
          currentCompany: 'Adobe',
          profileUrl: 'https://linkedin.com/in/lisa-wang',
          profileImage: 'https://via.placeholder.com/150/EA580C/FFFFFF?text=LW',
          connections: '600+',
          summary: 'UX designer passionate about creating intuitive and beautiful user experiences. Expert in user research and design systems.',
          skills: ['UX Design', 'UI Design', 'User Research', 'Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'Design Systems'],
          experience: [
            {
              title: 'Senior UX Designer',
              company: 'Adobe',
              duration: '2021 - Present',
              description: 'Leading UX design for creative software products'
            },
            {
              title: 'UX Designer',
              company: 'Airbnb',
              duration: '2019 - 2021',
              description: 'Designed user experiences for travel platform'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Fine Arts in Design',
              school: 'Art Center College of Design',
              year: '2019'
            }
          ],
          matchScore: 82,
          availability: 'open_to_work',
          lastActive: '4 days ago'
        }
      ]
      
      return mockResults
    },
    
    importCandidate: async (candidateId) => {
      // Simulate importing a candidate
      await new Promise(resolve => setTimeout(resolve, 1000))
      return { success: true, candidateId }
    }
  }

  // Connect to LinkedIn
  const handleConnect = async () => {
    try {
      const result = await linkedInAPI.connect()
      if (result.success) {
        setIsConnected(true)
      }
    } catch (error) {
      console.error('LinkedIn connection failed:', error)
    }
  }

  // Search candidates
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      const results = await linkedInAPI.searchCandidates(searchQuery, filters)
      setSearchResults(results)
      setImportStats(prev => ({
        ...prev,
        totalSearched: prev.totalSearched + results.length
      }))
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Import candidate
  const handleImportCandidate = async (candidate) => {
    try {
      const result = await linkedInAPI.importCandidate(candidate.id)
      if (result.success) {
        setImportedCandidates(prev => [...prev, candidate])
        setImportStats(prev => ({
          ...prev,
          totalImported: prev.totalImported + 1,
          totalMatched: prev.totalMatched + (candidate.matchScore > 80 ? 1 : 0),
          averageMatchScore: prev.averageMatchScore === 0 ? candidate.matchScore : 
            (prev.averageMatchScore + candidate.matchScore) / 2
        }))
        
        if (onImportCandidates) {
          onImportCandidates([candidate])
        }
      }
    } catch (error) {
      console.error('Import failed:', error)
    }
  }

  // Import multiple candidates
  const handleBulkImport = async () => {
    const selectedCandidatesToImport = searchResults.filter(c => selectedCandidates.includes(c.id))
    
    for (const candidate of selectedCandidatesToImport) {
      await handleImportCandidate(candidate)
    }
    
    setSelectedCandidates([])
  }

  // Select/deselect candidate
  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => 
      prev.includes(candidateId) 
        ? prev.filter(id => id !== candidateId)
        : [...prev, candidateId]
    )
  }

  // Select all candidates
  const handleSelectAll = () => {
    if (selectedCandidates.length === searchResults.length) {
      setSelectedCandidates([])
    } else {
      setSelectedCandidates(searchResults.map(c => c.id))
    }
  }

  // Get availability color
  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'open_to_work': return 'bg-green-100 text-green-800'
      case 'passive': return 'bg-yellow-100 text-yellow-800'
      case 'not_open': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get availability label
  const getAvailabilityLabel = (availability) => {
    switch (availability) {
      case 'open_to_work': return 'Open to Work'
      case 'passive': return 'Passive'
      case 'not_open': return 'Not Open'
      default: return 'Unknown'
    }
  }

  // Get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Linkedin className="h-6 w-6 mr-2 text-blue-600" />
            LinkedIn Integration
          </h2>
          <p className="text-gray-600">Import and manage candidates from LinkedIn</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isConnected ? (
            <button
              onClick={handleConnect}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Linkedin className="h-4 w-4 mr-2" />
              Connect LinkedIn
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Connected</span>
              </div>
              <button className="text-gray-600 hover:text-gray-800">
                <Settings className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Search className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Searched</p>
              <p className="text-2xl font-bold text-gray-900">{importStats.totalSearched}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Download className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Imported</p>
              <p className="text-2xl font-bold text-gray-900">{importStats.totalImported}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Matched</p>
              <p className="text-2xl font-bold text-gray-900">{importStats.totalMatched}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Avg Score</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(importStats.averageMatchScore)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      {isConnected && (
        <div className="bg-white p-6 rounded-lg border">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for candidates (e.g., 'React developer', 'Data scientist', 'Product manager')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </button>
              <button
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {isSearching ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g., San Francisco"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                <select
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">All Industries</option>
                  <option value="technology">Technology</option>
                  <option value="finance">Finance</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="">Any Experience</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6+ years)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <input
                  type="text"
                  placeholder="e.g., React, Python"
                  value={filters.skills}
                  onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  placeholder="e.g., Google, Microsoft"
                  value={filters.company}
                  onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All</option>
                  <option value="open_to_work">Open to Work</option>
                  <option value="passive">Passive</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Search Results ({searchResults.length} candidates)
            </h3>
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              >
                <option value="relevance">Relevance</option>
                <option value="match_score">Match Score</option>
                <option value="experience">Experience</option>
                <option value="connections">Connections</option>
              </select>
              {selectedCandidates.length > 0 && (
                <button
                  onClick={handleBulkImport}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Import Selected ({selectedCandidates.length})
                </button>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {searchResults.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={selectedCandidates.includes(candidate.id)}
                            onChange={() => handleSelectCandidate(candidate.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                        
                        <img
                          src={candidate.profileImage}
                          alt={candidate.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{candidate.name}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(candidate.availability)}`}>
                              {getAvailabilityLabel(candidate.availability)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                              {candidate.matchScore}% Match
                            </span>
                          </div>
                          
                          <p className="text-gray-600 mb-2">{candidate.headline}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {candidate.location}
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="h-4 w-4 mr-1" />
                              {candidate.currentCompany}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {candidate.connections}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {candidate.lastActive}
                            </div>
                          </div>
                          
                          <p className="text-gray-600 text-sm mb-3">{candidate.summary}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {candidate.skills.slice(0, 6).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {candidate.skills.length > 6 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{candidate.skills.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => handleImportCandidate(candidate)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Import
                      </button>
                      <a
                        href={candidate.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded text-sm border border-gray-300 hover:bg-gray-50 flex items-center"
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Profile
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Imported Candidates */}
      {importedCandidates.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Imported Candidates ({importedCandidates.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {importedCandidates.map((candidate) => (
                <div key={candidate.id} className="border rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={candidate.profileImage}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                      <p className="text-sm text-gray-600">{candidate.headline}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(candidate.matchScore)}`}>
                      {candidate.matchScore}% Match
                    </span>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LinkedInIntegration
