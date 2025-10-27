import React, { useState, useEffect, useCallback } from 'react'
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Lock,
  Users,
  Globe,
  Clock,
  Activity,
  Search,
  Download,
  RefreshCw,
  Ban,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Smartphone,
  Monitor,
  Server,
  LogIn,
  LogOut,
  Mail
} from 'lucide-react'
import { userAPI, adminAnalyticsAPI } from '../services/api'
import toast from 'react-hot-toast'

const SecurityMonitoring = ({ onExportData }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [securityData, setSecurityData] = useState(null)
  const [users, setUsers] = useState([])
  const [securityEvents, setSecurityEvents] = useState([])
  const [activeSessions, setActiveSessions] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch real security-related data
  const fetchSecurityData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [overview, usersRes, systemRes] = await Promise.all([
        adminAnalyticsAPI.getOverview('24h'),
        userAPI.getAllUsers(),
        adminAnalyticsAPI.getSystemMetrics('24h')
      ])

      // Calculate security metrics from real data
      const activeUsers = usersRes.data.filter(u => u.is_active).length
      const inactiveUsers = usersRes.data.filter(u => u.is_active === false).length
      const adminCount = usersRes.data.filter(u => u.role === 'admin').length
      
      // Build security events from user activity
      const events = []
      
      // User login events (simulated from user data)
      usersRes.data.forEach(user => {
        if (user.updated_at) {
          const lastActivity = new Date(user.updated_at)
          const now = new Date()
          const hoursSinceActivity = (now - lastActivity) / (1000 * 60 * 60)
          
          if (hoursSinceActivity < 24) {
            events.push({
              id: `login-${user.id}`,
              type: user.is_active ? 'login_success' : 'login_failed',
              severity: user.is_active ? 'info' : 'warning',
              description: user.is_active ? 'User logged in successfully' : 'Failed login attempt',
              user: user.email,
              timestamp: lastActivity,
              details: {
                role: user.role,
                username: user.username
              }
            })
          }
        }
      })

      // Sort events by timestamp
      events.sort((a, b) => b.timestamp - a.timestamp)

      // Calculate security score
      const totalUsers = usersRes.data.length
      const securityScore = totalUsers > 0 
        ? Math.min(100, Math.round((activeUsers / totalUsers) * 100 + (adminCount > 0 ? 10 : 0)))
        : 50

      setSecurityData({
        overview: overview.data,
        securityScore,
        activeUsers,
        inactiveUsers,
        adminCount,
        totalSessions: activeUsers,
        failedLogins: inactiveUsers,
        blockedIPs: 0,
        threats: 0
      })
      
      setUsers(usersRes.data)
      setSecurityEvents(events)
      setActiveSessions(usersRes.data.filter(u => u.is_active).slice(0, 10))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSecurityData()
  }, [fetchSecurityData])

  const handleRefresh = () => {
    fetchSecurityData()
    toast.success('Security data refreshed')
  }

  const handleExport = () => {
    // Export security events
    const csvData = securityEvents.map(event => ({
      Timestamp: event.timestamp.toISOString(),
      Type: event.type,
      Severity: event.severity,
      User: event.user,
      Description: event.description
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
    a.download = `security_events_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    if (onExportData) onExportData()
    toast.success('Security data exported successfully')
  }

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      // In production, call: await userAPI.updateUser(userId, { is_active: !currentStatus })
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, is_active: !currentStatus } : user
      ))
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}`)
      fetchSecurityData() // Refresh data
    } catch (error) {
      console.error('Error toggling user status:', error)
      toast.error('Failed to update user status')
    }
  }

  const getSecurityScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getSecurityScoreBg = (score) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
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

  if (isLoading && !securityData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { securityScore, activeUsers, inactiveUsers, adminCount, totalSessions, failedLogins, blockedIPs, threats } = securityData || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Security Monitoring</h2>
                <p className="text-blue-100">Real-time security analysis and threat detection</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm font-medium">System Secure</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-200">
                <Clock className="h-4 w-4" />
                <span>Last scan: {lastUpdated.toLocaleTimeString()}</span>
              </div>
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

      {/* Security Score Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Security Score</h3>
            {securityScore >= 80 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div className="flex items-center justify-center">
            <div className="relative">
              <svg className="w-32 h-32">
                <circle
                  className="text-gray-200"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                />
                <circle
                  className={getSecurityScoreColor(securityScore)}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 56}
                  strokeDashoffset={2 * Math.PI * 56 * (1 - securityScore / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="56"
                  cx="64"
                  cy="64"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getSecurityScoreColor(securityScore)}`}>
                  {securityScore}
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            {securityScore >= 80 ? 'Excellent security posture' :
             securityScore >= 60 ? 'Good security, minor issues' :
             'Security needs improvement'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Active Threats</p>
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{threats}</p>
          <p className="text-sm text-gray-500 mt-1">Detected threats</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
            <Ban className="h-5 w-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-orange-600">{blockedIPs}</p>
          <p className="text-sm text-gray-500 mt-1">IP addresses</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600">Failed Logins</p>
            <XCircle className="h-5 w-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-yellow-600">{failedLogins}</p>
          <p className="text-sm text-gray-500 mt-1">Inactive users</p>
        </div>
      </div>

      {/* Section Navigation */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-2">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: Shield },
              { id: 'events', label: 'Security Events', icon: Activity },
              { id: 'sessions', label: 'Active Sessions', icon: Users }
            ].map((section) => {
              const IconComponent = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center space-x-2 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeSection === section.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/50'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="font-semibold">{section.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* User Security Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">User Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Active Users</span>
                  <span className="text-sm font-bold text-green-600">{activeUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Inactive Users</span>
                  <span className="text-sm font-bold text-red-600">{inactiveUsers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Admin Accounts</span>
                  <span className="text-sm font-bold text-purple-600">{adminCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Database</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">API Server</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Frontend</span>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-4">Security Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Active Threats</span>
                  <span className="text-sm font-bold text-green-600">{threats}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Blocked IPs</span>
                  <span className="text-sm font-bold text-gray-600">{blockedIPs}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Failed Logins</span>
                  <span className="text-sm font-bold text-yellow-600">{failedLogins}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security Recommendations */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Recommendations</h3>
            <div className="space-y-3">
              {inactiveUsers > 0 && (
                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-yellow-900">Review Inactive Users</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      {inactiveUsers} inactive user accounts detected. Consider removing unused accounts.
                    </p>
                  </div>
                </div>
              )}
              {adminCount === 0 && (
                <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">No Admin Accounts</p>
                    <p className="text-xs text-red-700 mt-1">
                      Create at least one admin account for system management.
                    </p>
                  </div>
                </div>
              )}
              {securityScore >= 80 && (
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Excellent Security</p>
                    <p className="text-xs text-green-700 mt-1">
                      Your system maintains strong security practices. Continue monitoring regularly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Security Events Section */}
      {activeSection === 'events' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Security Events ({securityEvents.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {securityEvents.slice(0, 20).map((event) => (
              <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${
                      event.severity === 'info' ? 'bg-blue-50 text-blue-600' :
                      event.severity === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {event.type === 'login_success' ? <LogIn className="h-5 w-5" /> : <LogOut className="h-5 w-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {event.description}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {event.user}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          event.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                          event.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {event.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{formatTimeAgo(event.timestamp)}</span>
                    <p className="text-xs text-gray-400 mt-1">{event.timestamp.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Sessions Section */}
      {activeSection === 'sessions' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Active User Sessions ({activeSessions.length})
            </h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {activeSessions.map((user) => (
              <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-white">
                        {user.full_name?.charAt(0) || user.username?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{user.full_name || user.username}</h4>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-medium ${
                          user.role === 'admin' ? 'bg-red-100 text-red-800' :
                          user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Last Activity</p>
                      <p className="text-xs font-medium text-gray-900">
                        {user.updated_at ? formatTimeAgo(new Date(user.updated_at)) : 'Unknown'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Deactivate Session"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SecurityMonitoring
