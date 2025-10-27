import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Filter, X, Save, Star, Clock, MapPin, 
  DollarSign, Briefcase, GraduationCap, Award, 
  Users, CheckCircle, XCircle, AlertCircle, 
  ChevronDown, ChevronUp, Zap, Target, 
  Bookmark, Trash2, Edit, Copy, Download
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdvancedSearch({ 
  candidates = [], 
  jobs = [], 
  onSearch, 
  onSaveSearch,
  onLoadSearch,
  onDeleteSearch 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [savedSearches, setSavedSearches] = useState([])
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const [searchHistory, setSearchHistory] = useState([])
  
  // Advanced filters
  const [filters, setFilters] = useState({
    skills: [],
    experience: { min: '', max: '' },
    location: '',
    salaryRange: { min: '', max: '' },
    education: '',
    jobTitle: '',
    status: [],
    dateRange: { start: '', end: '' },
    rating: { min: '', max: '' },
    availability: '',
    languages: [],
    certifications: []
  })

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Mock saved searches - in real app, this would come from API
  useEffect(() => {
    const mockSavedSearches = [
      {
        id: 1,
        name: 'Senior React Developers',
        query: 'React JavaScript TypeScript senior',
        filters: { skills: ['React', 'JavaScript', 'TypeScript'], experience: { min: '5', max: '10' } },
        createdAt: new Date().toISOString(),
        resultCount: 12
      },
      {
        id: 2,
        name: 'Remote Python Engineers',
        query: 'Python Django Flask remote',
        filters: { skills: ['Python', 'Django', 'Flask'], location: 'Remote' },
        createdAt: new Date().toISOString(),
        resultCount: 8
      },
      {
        id: 3,
        name: 'Data Scientists NYC',
        query: 'data science machine learning NYC',
        filters: { skills: ['Python', 'Machine Learning', 'Data Science'], location: 'New York' },
        createdAt: new Date().toISOString(),
        resultCount: 15
      }
    ]
    setSavedSearches(mockSavedSearches)
  }, [])

  // Mock AI suggestions - in real app, this would come from AI service
  useEffect(() => {
    if (searchQuery.length > 2) {
      const mockSuggestions = [
        { type: 'skill', value: 'React', count: 45 },
        { type: 'skill', value: 'JavaScript', count: 38 },
        { type: 'location', value: 'San Francisco', count: 23 },
        { type: 'job', value: 'Software Engineer', count: 67 },
        { type: 'experience', value: '5+ years', count: 34 }
      ]
      setAiSuggestions(mockSuggestions)
    } else {
      setAiSuggestions([])
    }
  }, [searchQuery])

  const skillOptions = [
    'React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go',
    'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'PHP',
    'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'Tailwind CSS', 'Material-UI',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch', 'Docker', 'Kubernetes',
    'AWS', 'Azure', 'Google Cloud', 'Firebase', 'GraphQL', 'REST API', 'Microservices',
    'Machine Learning', 'Data Science', 'AI', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy',
    'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins', 'Agile', 'Scrum', 'DevOps'
  ]

  const locationOptions = [
    'Remote', 'New York', 'San Francisco', 'Los Angeles', 'Chicago', 'Boston', 'Seattle',
    'Austin', 'Denver', 'Miami', 'Atlanta', 'Dallas', 'Phoenix', 'Portland', 'San Diego'
  ]

  const educationOptions = [
    'High School', 'Associate Degree', 'Bachelor\'s Degree', 'Master\'s Degree', 'PhD', 'Bootcamp'
  ]

  const statusOptions = [
    'Active', 'Inactive', 'Pending', 'Accepted', 'Rejected', 'Interview Scheduled', 'On Hold'
  ]

  const handleSearch = () => {
    const searchData = {
      query: searchQuery,
      filters,
      timestamp: new Date().toISOString()
    }
    
    if (onSearch) {
      onSearch(searchData)
    }
    
    // Add to search history
    setSearchHistory(prev => [
      { ...searchData, id: Date.now() },
      ...prev.slice(0, 9) // Keep only last 10 searches
    ])
    
    toast.success('Search completed')
  }

  const handleSaveSearch = () => {
    const searchName = prompt('Enter a name for this search:')
    if (!searchName) return

    const newSearch = {
      id: Date.now(),
      name: searchName,
      query: searchQuery,
      filters: { ...filters },
      createdAt: new Date().toISOString(),
      resultCount: 0 // This would be calculated from actual results
    }

    setSavedSearches(prev => [newSearch, ...prev])
    
    if (onSaveSearch) {
      onSaveSearch(newSearch)
    }
    
    toast.success('Search saved successfully')
  }

  const handleLoadSearch = (search) => {
    setSearchQuery(search.query)
    setFilters(search.filters)
    
    if (onLoadSearch) {
      onLoadSearch(search)
    }
    
    toast.success(`Loaded search: ${search.name}`)
  }

  const handleDeleteSearch = (searchId) => {
    if (window.confirm('Are you sure you want to delete this saved search?')) {
      setSavedSearches(prev => prev.filter(search => search.id !== searchId))
      
      if (onDeleteSearch) {
        onDeleteSearch(searchId)
      }
      
      toast.success('Search deleted successfully')
    }
  }

  const handleSuggestionClick = (suggestion) => {
    if (suggestion.type === 'skill') {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, suggestion.value]
      }))
    } else if (suggestion.type === 'location') {
      setFilters(prev => ({
        ...prev,
        location: suggestion.value
      }))
    } else if (suggestion.type === 'job') {
      setFilters(prev => ({
        ...prev,
        jobTitle: suggestion.value
      }))
    }
    
    setShowSuggestions(false)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const handleArrayFilterChange = (filterType, value, action) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: action === 'add' 
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value)
    }))
  }

  const clearFilters = () => {
    setFilters({
      skills: [],
      experience: { min: '', max: '' },
      location: '',
      salaryRange: { min: '', max: '' },
      education: '',
      jobTitle: '',
      status: [],
      dateRange: { start: '', end: '' },
      rating: { min: '', max: '' },
      availability: '',
      languages: [],
      certifications: []
    })
    setSearchQuery('')
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (searchQuery) count++
    if (filters.skills.length > 0) count++
    if (filters.location) count++
    if (filters.experience.min || filters.experience.max) count++
    if (filters.salaryRange.min || filters.salaryRange.max) count++
    if (filters.education) count++
    if (filters.jobTitle) count++
    if (filters.status.length > 0) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.rating.min || filters.rating.max) count++
    if (filters.availability) count++
    if (filters.languages.length > 0) count++
    if (filters.certifications.length > 0) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Advanced Search</h2>
            <p className="text-gray-600">Find the perfect candidates with AI-powered search</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSavedSearches(!showSavedSearches)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Saved Searches
            </button>
            <button
              onClick={handleSaveSearch}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Search
            </button>
          </div>
        </div>

        {/* Main Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search candidates by name, skills, experience, or use natural language..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <button
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        {showSuggestions && aiSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <Zap className="h-4 w-4 text-yellow-500 mr-3" />
                  <span className="text-gray-900">{suggestion.value}</span>
                </div>
                <span className="text-sm text-gray-500">{suggestion.count} candidates</span>
              </button>
            ))}
          </div>
        )}

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Recent searches:</span>
              {searchHistory.slice(0, 3).map((search, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchQuery(search.query)
                    setFilters(search.filters)
                  }}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {search.query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters */}
      {isAdvancedOpen && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Skills Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {filters.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {skill}
                      <button
                        onClick={() => handleArrayFilterChange('skills', skill, 'remove')}
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <select
                  onChange={(e) => {
                    if (e.target.value && !filters.skills.includes(e.target.value)) {
                      handleArrayFilterChange('skills', e.target.value, 'add')
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Add a skill...</option>
                  {skillOptions.map(skill => (
                    <option key={skill} value={skill}>{skill}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any location</option>
                {locationOptions.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (years)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.experience.min}
                  onChange={(e) => handleFilterChange('experience', { ...filters.experience, min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.experience.max}
                  onChange={(e) => handleFilterChange('experience', { ...filters.experience, max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Salary Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range ($)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryRange.min}
                  onChange={(e) => handleFilterChange('salaryRange', { ...filters.salaryRange, min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryRange.max}
                  onChange={(e) => handleFilterChange('salaryRange', { ...filters.salaryRange, max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Education Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Education
              </label>
              <select
                value={filters.education}
                onChange={(e) => handleFilterChange('education', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any education</option>
                {educationOptions.map(education => (
                  <option key={education} value={education}>{education}</option>
                ))}
              </select>
            </div>

            {/* Job Title Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title
              </label>
              <input
                type="text"
                value={filters.jobTitle}
                onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
                placeholder="e.g., Software Engineer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Clear All
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </div>
      )}

      {/* Saved Searches Modal */}
      {showSavedSearches && (
        <div className="absolute z-20 right-0 mt-2 w-80 bg-white border border-gray-300 rounded-lg shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Saved Searches</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {savedSearches.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {savedSearches.map((search) => (
                  <div key={search.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">{search.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{search.query}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {search.resultCount} results • {new Date(search.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleLoadSearch(search)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="Load search"
                        >
                          <Target className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSearch(search.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete search"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved searches yet</p>
                <p className="text-sm text-gray-400 mt-1">Save your searches for quick access</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
