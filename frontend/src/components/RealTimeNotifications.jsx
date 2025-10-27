import React, { useState, useEffect } from 'react'
import { 
  Bell, X, CheckCircle, AlertCircle, Info, 
  User, Briefcase, Clock, TrendingUp, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function RealTimeNotifications({ 
  applications = [], 
  jobs = [], 
  onMarkAsRead,
  onClearAll 
}) {
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Generate notifications based on recent activity
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = []
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

      // Recent applications
      const recentApplications = applications.filter(app => 
        new Date(app.created_at) > oneHourAgo
      )

      recentApplications.forEach(app => {
        newNotifications.push({
          id: `app-${app.id}`,
          type: 'new_application',
          title: 'New Application Received',
          message: `${app.candidate_name} applied for ${app.job?.title || 'a job'}`,
          timestamp: app.created_at,
          read: false,
          icon: User,
          color: 'blue'
        })
      })

      // Jobs expiring soon (mock data for demo)
      const expiringJobs = jobs.filter(job => {
        const jobDate = new Date(job.created_at)
        const daysSincePosted = Math.floor((now - jobDate) / (1000 * 60 * 60 * 24))
        return daysSincePosted >= 25 && job.status === 'active' // Expiring in 5 days
      })

      expiringJobs.forEach(job => {
        newNotifications.push({
          id: `expire-${job.id}`,
          type: 'job_expiring',
          title: 'Job Expiring Soon',
          message: `${job.title} will expire in 5 days`,
          timestamp: job.created_at,
          read: false,
          icon: Clock,
          color: 'orange'
        })
      })

      // High application volume (mock data)
      const highVolumeJobs = jobs.filter(job => {
        const jobApplications = applications.filter(app => app.job_id === job.id)
        return jobApplications.length >= 10 && job.status === 'active'
      })

      highVolumeJobs.forEach(job => {
        const jobApplications = applications.filter(app => app.job_id === job.id)
        newNotifications.push({
          id: `volume-${job.id}`,
          type: 'high_volume',
          title: 'High Application Volume',
          message: `${job.title} has ${jobApplications.length} applications`,
          timestamp: job.created_at,
          read: false,
          icon: TrendingUp,
          color: 'green'
        })
      })

      // Pending applications reminder
      const pendingCount = applications.filter(app => app.status === 'pending').length
      if (pendingCount > 5) {
        newNotifications.push({
          id: 'pending-reminder',
          type: 'pending_reminder',
          title: 'Pending Applications Alert',
          message: `You have ${pendingCount} applications pending review`,
          timestamp: new Date().toISOString(),
          read: false,
          icon: AlertCircle,
          color: 'yellow'
        })
      }

      // Sort by timestamp (newest first)
      newNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      setNotifications(newNotifications)
      setUnreadCount(newNotifications.filter(n => !n.read).length)
    }

    generateNotifications()
    
    // Simulate real-time updates every 30 seconds
    const interval = setInterval(generateNotifications, 30000)
    
    return () => clearInterval(interval)
  }, [applications, jobs])

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
    
    if (onMarkAsRead) {
      onMarkAsRead(notificationId)
    }
  }

  const handleClearAll = () => {
    setNotifications([])
    setUnreadCount(0)
    
    if (onClearAll) {
      onClearAll()
    }
    
    toast.success('All notifications cleared')
  }

  const getNotificationIcon = (notification) => {
    const Icon = notification.icon
    const colorClasses = {
      blue: 'text-blue-500 bg-blue-100',
      green: 'text-green-500 bg-green-100',
      orange: 'text-orange-500 bg-orange-100',
      yellow: 'text-yellow-500 bg-yellow-100',
      red: 'text-red-500 bg-red-100'
    }
    
    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses[notification.color]}`}>
        <Icon className="h-4 w-4" />
      </div>
    )
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now - time) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors duration-200"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {getNotificationIcon(notification)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Mark as read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">
                  You're all caught up!
                </p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleClearAll}
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                Clear all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
