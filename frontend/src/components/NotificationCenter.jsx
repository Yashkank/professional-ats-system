import React, { useState, useEffect, useCallback } from 'react'
import {
  Bell,
  BellDot,
  Check,
  CheckCheck,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Search,
  Archive,
  Trash2,
  Clock,
  Users,
  Server,
  Shield,
  Database,
  Download,
  RefreshCw,
  Mail,
  Activity,
  Briefcase,
  FileText,
  Building2
} from 'lucide-react'
import { userAPI, jobAPI, applicationAPI, companyAPI, adminAnalyticsAPI } from '../services/api'
import toast from 'react-hot-toast'

const NotificationCenter = ({ onExportData }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('all')
  const [showSettings, setShowSettings] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Build notifications from real system data
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    try {
      const [overview, usersRes, jobsRes, appsRes, companiesRes] = await Promise.all([
        adminAnalyticsAPI.getOverview('24h'),
        userAPI.getAllUsers(),
        jobAPI.getJobs(),
        applicationAPI.getApplications(),
        companyAPI.getCompanies()
      ])

      const notificationsList = []

      // New user notifications
      const recentUsers = usersRes.data
        .filter(u => {
          const hoursSinceJoin = (new Date() - new Date(u.created_at)) / (1000 * 60 * 60)
          return hoursSinceJoin < 24
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      recentUsers.slice(0, 5).forEach(user => {
        notificationsList.push({
          id: `user-${user.id}`,
          title: 'New User Registration',
          message: `${user.full_name || user.username} (${user.role}) joined the platform`,
          type: 'info',
          priority: 'medium',
          category: 'users',
          timestamp: new Date(user.created_at),
          read: false,
          metadata: {
            userId: user.id,
            email: user.email,
            role: user.role
          }
        })
      })

      // New job notifications
      const recentJobs = jobsRes.data
        .filter(j => {
          const hoursSincePost = (new Date() - new Date(j.created_at)) / (1000 * 60 * 60)
          return hoursSincePost < 24
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      recentJobs.slice(0, 5).forEach(job => {
        notificationsList.push({
          id: `job-${job.id}`,
          title: 'New Job Posted',
          message: `${job.title} at ${job.company?.name || 'Company'} - ${job.location || 'Location TBD'}`,
          type: 'success',
          priority: 'medium',
          category: 'jobs',
          timestamp: new Date(job.created_at),
          read: false,
          metadata: {
            jobId: job.id,
            title: job.title,
            company: job.company?.name
          }
        })
      })

      // New application notifications
      const recentApps = appsRes.data
        .filter(a => {
          const hoursSinceSubmit = (new Date() - new Date(a.created_at)) / (1000 * 60 * 60)
          return hoursSinceSubmit < 24
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

      recentApps.slice(0, 5).forEach(app => {
        notificationsList.push({
          id: `app-${app.id}`,
          title: 'New Application Received',
          message: `${app.candidate_name} applied for ${app.job?.title || 'position'}`,
          type: 'info',
          priority: 'medium',
          category: 'applications',
          timestamp: new Date(app.created_at),
          read: false,
          metadata: {
            applicationId: app.id,
            candidateName: app.candidate_name,
            jobTitle: app.job?.title
          }
        })
      })

      // System health notifications
      if (overview.data.active_users > 0) {
        notificationsList.push({
          id: 'system-health',
          title: 'System Status: Healthy',
          message: `All systems operational. ${overview.data.active_users} active users, ${overview.data.active_jobs} active jobs`,
          type: 'success',
          priority: 'low',
          category: 'system',
          timestamp: new Date(),
          read: false,
          metadata: {
            activeUsers: overview.data.active_users,
            activeJobs: overview.data.active_jobs
          }
        })
      }

      // Growth notifications
      if (overview.data.growth_rate > 10) {
        notificationsList.push({
          id: 'growth-milestone',
          title: 'Growth Milestone Achieved',
          message: `User growth at ${overview.data.growth_rate.toFixed(1)}%! Platform is expanding rapidly.`,
          type: 'success',
          priority: 'high',
          category: 'analytics',
          timestamp: new Date(),
          read: false,
          metadata: {
            growthRate: overview.data.growth_rate,
            newUsers: overview.data.new_users
          }
        })
      }

      // Pending applications alert
      if (overview.data.pending_applications > 10) {
        notificationsList.push({
          id: 'pending-apps',
          title: 'High Pending Applications',
          message: `${overview.data.pending_applications} applications are pending review. Consider prioritizing reviews.`,
          type: 'warning',
          priority: 'high',
          category: 'applications',
          timestamp: new Date(),
          read: false,
          metadata: {
            pendingCount: overview.data.pending_applications
          }
        })
      }

      // Inactive users warning
      const inactiveUsers = usersRes.data.filter(u => !u.is_active).length
      if (inactiveUsers > 0) {
        notificationsList.push({
          id: 'inactive-users',
          title: 'Inactive User Accounts Detected',
          message: `${inactiveUsers} inactive user accounts found. Consider reviewing and cleaning up.`,
          type: 'warning',
          priority: 'low',
          category: 'security',
          timestamp: new Date(),
          read: false,
          metadata: {
            inactiveCount: inactiveUsers
          }
        })
      }

      // Sort by timestamp (newest first)
      notificationsList.sort((a, b) => b.timestamp - a.timestamp)

      setNotifications(notificationsList)
      setFilteredNotifications(notificationsList)
      setUnreadCount(notificationsList.filter(n => !n.read).length)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Filter notifications
  useEffect(() => {
    let result = notifications

    // Tab filter
    if (activeTab !== 'all') {
      result = result.filter(n => n.category === activeTab)
    }

    // Priority filter
    if (selectedPriority !== 'all') {
      result = result.filter(n => n.priority === selectedPriority)
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(n =>
        n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredNotifications(result)
  }, [notifications, activeTab, selectedPriority, searchTerm])

  const handleRefresh = () => {
    fetchNotifications()
    toast.success('Notifications refreshed')
  }

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    ))
    setUnreadCount(prev => Math.max(0, prev - 1))
    toast.success('Marked as read')
  }

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    toast.success('All notifications marked as read')
  }

  const handleArchive = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    toast.success('Notification archived')
  }

  const handleExport = () => {
    const csvData = filteredNotifications.map(n => ({
      Timestamp: n.timestamp.toISOString(),
      Title: n.title,
      Message: n.message,
      Type: n.type,
      Priority: n.priority,
      Category: n.category,
      Read: n.read ? 'Yes' : 'No'
    }))

    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notifications_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    if (onExportData) onExportData()
    toast.success('Notifications exported successfully')
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimeAgo = (timestamp) => {
    const seconds = Math.floor((new Date() - timestamp) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (isLoading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'all', label: 'All', icon: Bell },
    { id: 'system', label: 'System', icon: Server },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: Activity }
  ]

  return (
    <div className="space-y-6 max-h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl relative">
                <Bell className="h-8 w-8 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-3xl font-bold">Notification Center</h2>
                <p className="text-blue-100">System alerts and updates</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 text-sm text-blue-200">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All Read</span>
            </button>
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

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto max-h-[calc(100vh-300px)] pr-2 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Notifications</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-2">
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                const count = activeTab === tab.id ? filteredNotifications.length :
                             tab.id === 'all' ? notifications.length :
                             notifications.filter(n => n.category === tab.id).length
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-white/50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                    {count > 0 && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`rounded-xl border shadow-sm p-6 transition-all duration-200 ${
                  notification.read ? 'bg-white' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`flex-shrink-0 p-3 rounded-lg border ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityBadge(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        {!notification.read && (
                          <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full capitalize">
                          {notification.category}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleArchive(notification.id)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      title="Archive"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedPriority !== 'all' || activeTab !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No new notifications at this time'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter
