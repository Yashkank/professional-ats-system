import React, { useState, useEffect, useCallback } from 'react'
import {
  Activity,
  Users,
  Briefcase,
  FileText,
  Shield,
  RefreshCw,
  Download,
  Filter,
  Search,
  Clock,
  Calendar,
  TrendingUp,
  UserPlus,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Building2
} from 'lucide-react'
import { userAPI, jobAPI, applicationAPI } from '../services/api'
import toast from 'react-hot-toast'

const ActivityFeedAdmin = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState([])
  const [filteredActivities, setFilteredActivities] = useState([])
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [timeRange, setTimeRange] = useState('24h')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch all data and build activity timeline
  const fetchActivities = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        userAPI.getAllUsers(),
        jobAPI.getJobs(),
        applicationAPI.getApplications()
      ])

      setUsers(usersRes.data)
      setJobs(jobsRes.data)
      setApplications(appsRes.data)

      // Build activity timeline from real data
      const activityList = []

      // User registrations
      usersRes.data.forEach(user => {
        activityList.push({
          id: `user-${user.id}`,
          type: 'user_registered',
          icon: UserPlus,
          color: 'blue',
          title: 'New User Registered',
          description: `${user.full_name || user.username} (${user.role}) joined the platform`,
          user: user.full_name || user.username,
          email: user.email,
          role: user.role,
          timestamp: new Date(user.created_at),
          metadata: { userId: user.id }
        })
      })

      // Job postings
      jobsRes.data.forEach(job => {
        activityList.push({
          id: `job-${job.id}`,
          type: 'job_posted',
          icon: Briefcase,
          color: 'green',
          title: 'New Job Posted',
          description: `${job.title} at ${job.company?.name || 'Company'}`,
          user: 'Recruiter',
          location: job.location,
          status: job.status,
          timestamp: new Date(job.created_at),
          metadata: { jobId: job.id }
        })
      })

      // Application submissions
      appsRes.data.forEach(app => {
        activityList.push({
          id: `app-${app.id}`,
          type: 'application_submitted',
          icon: FileText,
          color: 'purple',
          title: 'New Application Submitted',
          description: `${app.candidate_name} applied for ${app.job?.title || 'a position'}`,
          user: app.candidate_name,
          status: app.status,
          timestamp: new Date(app.created_at),
          metadata: { applicationId: app.id, jobId: app.job_id }
        })

        // Application status changes (if updated)
        if (app.updated_at && app.updated_at !== app.created_at) {
          activityList.push({
            id: `app-update-${app.id}`,
            type: 'application_status_changed',
            icon: app.status === 'accepted' ? CheckCircle : 
                  app.status === 'rejected' ? XCircle : AlertCircle,
            color: app.status === 'accepted' ? 'green' :
                   app.status === 'rejected' ? 'red' : 'yellow',
            title: 'Application Status Updated',
            description: `Application for ${app.job?.title || 'position'} marked as ${app.status}`,
            user: app.candidate_name,
            status: app.status,
            timestamp: new Date(app.updated_at),
            metadata: { applicationId: app.id }
          })
        }
      })

      // Sort by timestamp (newest first)
      activityList.sort((a, b) => b.timestamp - a.timestamp)

      setActivities(activityList)
      setFilteredActivities(activityList)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching activities:', error)
      toast.error('Failed to load activity feed')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActivities()
  }, [fetchActivities])

  // Filter activities
  useEffect(() => {
    let result = activities

    // Time range filter
    const now = new Date()
    const cutoffTime = new Date()
    
    switch (timeRange) {
      case '1h':
        cutoffTime.setHours(now.getHours() - 1)
        break
      case '24h':
        cutoffTime.setHours(now.getHours() - 24)
        break
      case '7d':
        cutoffTime.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffTime.setDate(now.getDate() - 30)
        break
      case 'all':
        cutoffTime.setFullYear(2000) // Show all
        break
      default:
        cutoffTime.setHours(now.getHours() - 24)
    }

    result = result.filter(activity => activity.timestamp >= cutoffTime)

    // Type filter
    if (typeFilter !== 'all') {
      result = result.filter(activity => activity.type === typeFilter)
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(activity =>
        activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.user?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredActivities(result)
  }, [activities, timeRange, typeFilter, searchTerm])

  const handleRefresh = () => {
    fetchActivities()
    toast.success('Activity feed refreshed')
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = filteredActivities.map(activity => ({
      Timestamp: activity.timestamp.toLocaleString(),
      Type: activity.title,
      Description: activity.description,
      User: activity.user,
      Status: activity.status || 'N/A'
    }))

    // Convert to CSV
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activity_feed_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    toast.success('Activity feed exported successfully')
  }

  const getActivityStats = () => {
    const now = new Date()
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    return {
      total: activities.length,
      last24h: activities.filter(a => a.timestamp >= last24h).length,
      byType: {
        users: activities.filter(a => a.type === 'user_registered').length,
        jobs: activities.filter(a => a.type === 'job_posted').length,
        applications: activities.filter(a => a.type === 'application_submitted').length
      }
    }
  }

  const stats = getActivityStats()

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000)
    
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks}w ago`
    const months = Math.floor(days / 30)
    return `${months}mo ago`
  }

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      green: 'bg-green-100 text-green-600 border-green-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200',
      red: 'bg-red-100 text-red-600 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-600 border-yellow-200',
      orange: 'bg-orange-100 text-orange-600 border-orange-200'
    }
    return colors[color] || colors.blue
  }

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Activity Feed</h2>
                <p className="text-blue-100">Real-time system events and user actions</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 text-sm text-blue-200">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Activities</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Last 24 Hours</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.last24h}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Users</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.byType.users}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.byType.applications}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Activities</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, user, or description..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Activity Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="user_registered">User Registrations</option>
              <option value="job_posted">Job Postings</option>
              <option value="application_submitted">Applications Submitted</option>
              <option value="application_status_changed">Status Changes</option>
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity ({filteredActivities.length})
          </h3>
        </div>

        <div className="p-6">
          {filteredActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredActivities.map((activity) => {
                const IconComponent = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className={`flex-shrink-0 p-3 rounded-lg border ${getColorClasses(activity.color)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">
                            {activity.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {activity.user}
                            </span>
                            {activity.status && (
                              <span className={`px-2 py-0.5 rounded-full font-medium ${
                                activity.status === 'accepted' || activity.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : activity.status === 'rejected' 
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {activity.status}
                              </span>
                            )}
                            {activity.location && (
                              <span className="flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {activity.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end ml-4">
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                          <span className="text-xs text-gray-400 mt-1">
                            {activity.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
              <p className="text-gray-600">
                {searchTerm || typeFilter !== 'all' || timeRange !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No activities recorded yet'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ActivityFeedAdmin

