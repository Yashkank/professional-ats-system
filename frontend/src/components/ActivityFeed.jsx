import React, { useState, useEffect } from 'react'
import {
  Activity, User, Briefcase, MessageSquare, Calendar, 
  CheckCircle, XCircle, Plus, Edit, Trash2, Eye,
  ArrowRight, Clock, Filter, Search, RefreshCw
} from 'lucide-react'

export default function ActivityFeed({ 
  activities = [], 
  onLoadMore,
  onFilterChange,
  onSearch 
}) {
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Activities are passed from parent component via props
  // Parent (RecruiterDashboard) fetches real data from API

  const activityTypes = [
    { value: 'all', label: 'All Activities', color: 'gray', icon: Activity },
    { value: 'candidate_added', label: 'New Candidates', color: 'blue', icon: User },
    { value: 'interview_scheduled', label: 'Interviews', color: 'purple', icon: Calendar },
    { value: 'status_changed', label: 'Status Changes', color: 'yellow', icon: CheckCircle },
    { value: 'job_created', label: 'Job Postings', color: 'green', icon: Briefcase },
    { value: 'comment_added', label: 'Comments', color: 'indigo', icon: MessageSquare },
    { value: 'assignment_created', label: 'Assignments', color: 'orange', icon: ArrowRight }
  ]

  const getActivityIcon = (type) => {
    const activityType = activityTypes.find(t => t.value === type)
    return activityType ? activityType.icon : Activity
  }

  const getActivityColor = (type) => {
    const activityType = activityTypes.find(t => t.value === type)
    return activityType ? activityType.color : 'gray'
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const activityTime = new Date(timestamp)
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`
    return activityTime.toLocaleDateString()
  }

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter
    const matchesSearch = searchTerm === '' || 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleLoadMore = () => {
    setIsLoading(true)
    if (onLoadMore) {
      onLoadMore()
    }
    // Simulate loading
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter)
    if (onFilterChange) {
      onFilterChange(newFilter)
    }
  }

  const handleSearch = (term) => {
    setSearchTerm(term)
    if (onSearch) {
      onSearch(term)
    }
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Feed</h2>
          <p className="text-gray-600">Track team activities and updates</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {activityTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Activity Types Quick Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {activityTypes.map(type => {
            const Icon = type.icon
            const isActive = filter === type.value
            return (
              <button
                key={type.value}
                onClick={() => handleFilterChange(type.value)}
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? `bg-${type.color}-100 text-${type.color}-700 border border-${type.color}-200`
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {type.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-4">
        {filteredActivities.map((activity) => {
          const ActivityIcon = getActivityIcon(activity.type)
          const activityColor = getActivityColor(activity.type)
          
          return (
            <div key={activity.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-start space-x-4">
                <div className={`w-10 h-10 bg-${activityColor}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <ActivityIcon className={`h-5 w-5 text-${activityColor}-600`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-sm text-gray-500 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-gray-600" />
                      </div>
                      <span className="text-sm text-gray-600">{activity.user.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {activity.metadata && (
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          {activity.metadata.candidateName && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {activity.metadata.candidateName}
                            </span>
                          )}
                          {activity.metadata.jobTitle && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                              {activity.metadata.jobTitle}
                            </span>
                          )}
                          {activity.metadata.newStatus && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                              {activity.metadata.newStatus}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Load More */}
      {filteredActivities.length > 0 && (
        <div className="text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                Loading...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Load More Activities
              </>
            )}
          </button>
        </div>
      )}

      {filteredActivities.length === 0 && !isLoading && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No activities found</p>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm ? 'Try adjusting your search terms' : 'Activities will appear here as your team works'}
          </p>
        </div>
      )}
    </div>
  )
}
