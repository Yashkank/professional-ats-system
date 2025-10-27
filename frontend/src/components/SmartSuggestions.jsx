import React, { useState, useEffect } from 'react'
import {
  Zap, Target, Star, TrendingUp, Users, Briefcase,
  MapPin, Clock, Award, CheckCircle, XCircle, 
  ArrowRight, Filter, Search, Bookmark, Share
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function SmartSuggestions({ 
  jobRequirements = {}, 
  candidates = [], 
  onSelectCandidate,
  onSaveSuggestion,
  onRejectSuggestion 
}) {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('match_score')

  // Mock AI suggestions - in real app, this would come from AI service
  useEffect(() => {
    const generateSuggestions = () => {
      setIsLoading(true)
      
      // Simulate AI processing delay
      setTimeout(() => {
        const mockSuggestions = [
          {
            id: 1,
            candidate: {
              id: 'candidate-1',
              name: 'Sarah Johnson',
              title: 'Senior React Developer',
              location: 'San Francisco, CA',
              experience: '5 years',
              skills: ['React', 'TypeScript', 'Node.js', 'AWS'],
              matchScore: 95,
              availability: 'Available in 2 weeks',
              salary: '$120,000 - $140,000',
              rating: 4.8,
              lastActive: '2 days ago'
            },
            reasons: [
              'Perfect skill match with React and TypeScript',
              '5+ years experience in frontend development',
              'Previous experience with similar company size',
              'Located in preferred location'
            ],
            aiInsights: {
              technicalFit: 98,
              culturalFit: 92,
              experienceLevel: 95,
              locationMatch: 100
            },
            type: 'perfect_match',
            confidence: 0.95
          },
          {
            id: 2,
            candidate: {
              id: 'candidate-2',
              name: 'Michael Chen',
              title: 'Full Stack Developer',
              location: 'Remote',
              experience: '4 years',
              skills: ['React', 'Python', 'Django', 'PostgreSQL'],
              matchScore: 87,
              availability: 'Available immediately',
              salary: '$100,000 - $120,000',
              rating: 4.6,
              lastActive: '1 week ago'
            },
            reasons: [
              'Strong React skills with backend experience',
              'Remote work experience',
              'Good cultural fit based on previous roles',
              'Within salary range'
            ],
            aiInsights: {
              technicalFit: 85,
              culturalFit: 88,
              experienceLevel: 80,
              locationMatch: 90
            },
            type: 'good_match',
            confidence: 0.87
          },
          {
            id: 3,
            candidate: {
              id: 'candidate-3',
              name: 'Emily Rodriguez',
              title: 'Frontend Developer',
              location: 'New York, NY',
              experience: '3 years',
              skills: ['Vue.js', 'JavaScript', 'CSS', 'Figma'],
              matchScore: 72,
              availability: 'Available in 1 month',
              salary: '$90,000 - $110,000',
              rating: 4.4,
              lastActive: '3 days ago'
            },
            reasons: [
              'Strong frontend skills with Vue.js',
              'Good design sense with Figma experience',
              'Young talent with growth potential',
              'Located in major tech hub'
            ],
            aiInsights: {
              technicalFit: 70,
              culturalFit: 85,
              experienceLevel: 65,
              locationMatch: 95
            },
            type: 'potential_match',
            confidence: 0.72
          }
        ]
        
        setSuggestions(mockSuggestions)
        setIsLoading(false)
      }, 1500)
    }

    if (jobRequirements && Object.keys(jobRequirements).length > 0) {
      generateSuggestions()
    }
  }, [jobRequirements])

  const handleSelectCandidate = (suggestion) => {
    if (onSelectCandidate) {
      onSelectCandidate(suggestion.candidate)
    }
    toast.success(`Selected ${suggestion.candidate.name}`)
  }

  const handleSaveSuggestion = (suggestion) => {
    if (onSaveSuggestion) {
      onSaveSuggestion(suggestion)
    }
    toast.success('Suggestion saved to favorites')
  }

  const handleRejectSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
    if (onRejectSuggestion) {
      onRejectSuggestion(suggestionId)
    }
    toast.success('Suggestion removed')
  }

  const getMatchTypeColor = (type) => {
    switch (type) {
      case 'perfect_match':
        return 'green'
      case 'good_match':
        return 'blue'
      case 'potential_match':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getMatchTypeLabel = (type) => {
    switch (type) {
      case 'perfect_match':
        return 'Perfect Match'
      case 'good_match':
        return 'Good Match'
      case 'potential_match':
        return 'Potential Match'
      default:
        return 'Match'
    }
  }

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filterType === 'all') return true
    return suggestion.type === filterType
  })

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    switch (sortBy) {
      case 'match_score':
        return b.candidate.matchScore - a.candidate.matchScore
      case 'experience':
        return parseInt(b.candidate.experience) - parseInt(a.candidate.experience)
      case 'rating':
        return b.candidate.rating - a.candidate.rating
      case 'availability':
        return a.candidate.availability.localeCompare(b.candidate.availability)
      default:
        return 0
    }
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI is analyzing candidates...</p>
          <p className="text-sm text-gray-500 mt-2">Finding the best matches for your requirements</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                AI-Powered Suggestions
              </h2>
              <p className="text-gray-600 mt-1">
                {suggestions.length} candidates matched based on your job requirements
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">
                <Share className="h-4 w-4 mr-2" />
                Share Results
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Matches</option>
                  <option value="perfect_match">Perfect Matches</option>
                  <option value="good_match">Good Matches</option>
                  <option value="potential_match">Potential Matches</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="match_score">Match Score</option>
                <option value="experience">Experience</option>
                <option value="rating">Rating</option>
                <option value="availability">Availability</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4">
        {sortedSuggestions.map((suggestion) => {
          const matchColor = getMatchTypeColor(suggestion.type)
          const matchLabel = getMatchTypeLabel(suggestion.type)
          
          return (
            <div
              key={suggestion.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {suggestion.candidate.name}
                        </h3>
                        <p className="text-gray-600">{suggestion.candidate.title}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-${matchColor}-100 text-${matchColor}-800`}>
                          <Star className="h-3 w-3 mr-1" />
                          {suggestion.candidate.matchScore}% Match
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${matchColor}-50 text-${matchColor}-700`}>
                          {matchLabel}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {suggestion.candidate.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        {suggestion.candidate.experience}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Award className="h-4 w-4 mr-2 text-gray-400" />
                        {suggestion.candidate.rating}/5.0
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <TrendingUp className="h-4 w-4 mr-2 text-gray-400" />
                        {suggestion.candidate.availability}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {suggestion.candidate.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Why this candidate?</h4>
                      <ul className="space-y-1">
                        {suggestion.reasons.map((reason, index) => (
                          <li key={index} className="flex items-start text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {suggestion.aiInsights.technicalFit}%
                        </div>
                        <div className="text-xs text-gray-500">Technical Fit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {suggestion.aiInsights.culturalFit}%
                        </div>
                        <div className="text-xs text-gray-500">Cultural Fit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {suggestion.aiInsights.experienceLevel}%
                        </div>
                        <div className="text-xs text-gray-500">Experience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {suggestion.aiInsights.locationMatch}%
                        </div>
                        <div className="text-xs text-gray-500">Location</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleSelectCandidate(suggestion)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Select
                    </button>
                    <button
                      onClick={() => handleSaveSuggestion(suggestion)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </button>
                    <button
                      onClick={() => handleRejectSuggestion(suggestion.id)}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {suggestions.length === 0 && !isLoading && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No suggestions available</p>
            <p className="text-sm text-gray-400 mt-1">
              Try adjusting your job requirements or search criteria
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
