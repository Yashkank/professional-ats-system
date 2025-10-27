import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { userAPI, jobAPI, applicationAPI } from '../services/api'
import { Users, Briefcase, FileText, TrendingUp, Shield, Settings, BarChart3, Activity, Server, Zap, Globe, Building2, Database, Bell, FileSpreadsheet, RefreshCw, Clock, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminAnalytics from '../components/AdminAnalytics'
import SystemMonitoring from '../components/SystemMonitoring'
import AuditLogs from '../components/AuditLogs'
import CompanyManagement from '../components/CompanyManagement'
import DataManagement from '../components/DataManagement'
import SecurityMonitoring from '../components/SecurityMonitoring'
import NotificationCenter from '../components/NotificationCenter'
import ReportsSystem from '../components/ReportsSystem'
import PerformanceMetrics from '../components/PerformanceMetrics'
import UserManagementAdmin from '../components/UserManagementAdmin'
import ActivityFeedAdmin from '../components/ActivityFeedAdmin'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeUsers: 0,
    activeJobs: 0
  })
  const [recentUsers, setRecentUsers] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [systemHealth, setSystemHealth] = useState({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch all data for admin overview
      const [usersResponse, jobsResponse, applicationsResponse] = await Promise.all([
        userAPI.getAllUsers(),
        jobAPI.getJobs(),
        applicationAPI.getApplications()
      ])

      const users = usersResponse.data
      const jobs = jobsResponse.data
      const applications = applicationsResponse.data

      // Calculate stats
      const totalUsers = users.length
      const totalJobs = jobs.length
      const totalApplications = applications.length
      const activeUsers = users.filter(user => user.is_active).length
      const activeJobs = jobs.filter(job => job.status === 'active').length

      setStats({ totalUsers, totalJobs, totalApplications, activeUsers, activeJobs })
      
      // Get most recent users (sorted by created_at)
      const sortedUsers = [...users].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
      setRecentUsers(sortedUsers.slice(0, 5))

      // Get most recent applications (sorted by created_at)
      const sortedApplications = [...applications].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      )
      setRecentApplications(sortedApplications.slice(0, 5))

      setLastUpdated(new Date())
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
      console.error('Dashboard data fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'system', name: 'System', icon: Server },
    { id: 'performance', name: 'Performance', icon: Zap },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'activity', name: 'Activity', icon: Activity },
    { id: 'audit', name: 'Audit Logs', icon: Shield },
    { id: 'companies', name: 'Companies', icon: Building2 },
    { id: 'data', name: 'Data Management', icon: Database },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'reports', name: 'Reports', icon: FileSpreadsheet }
  ]

  const handleExportData = (timeRange, metric) => {
    console.log('Exporting data:', { timeRange, metric })
    toast.success(`Exporting ${metric} data for ${timeRange}`)
  }

  const handleRefreshData = () => {
    fetchDashboardData()
    toast.success('Analytics data refreshed')
  }

  const handleConfigureAlerts = () => {
    console.log('Opening alert configuration')
    toast.success('Alert configuration opened')
  }

  const handleExportLogs = () => {
    console.log('Exporting system logs')
    toast.success('System logs exported successfully')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100">System overview and management</p>
            <div className="flex items-center space-x-2 mt-4 text-sm text-blue-200">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                fetchDashboardData()
                toast.success('Dashboard refreshed')
              }}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/settings"
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-8 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              <p className="text-xs text-gray-500 mt-1">All registered users</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
              <p className="text-xs text-gray-500 mt-1">Currently active users</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Briefcase className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-xs text-gray-500 mt-1">All job postings</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <div className="p-2 bg-orange-50 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
              <p className="text-xs text-gray-500 mt-1">Currently open positions</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-xs text-gray-500 mt-1">Total submissions</p>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="font-semibold text-gray-900">Database</p>
                  <p className="text-sm text-green-700">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="font-semibold text-gray-900">API Service</p>
                  <p className="text-sm text-green-700">Operational</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-3 animate-pulse"></div>
                <div>
                  <p className="font-semibold text-gray-900">File Storage</p>
                  <p className="text-sm text-green-700">Operational</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users and Applications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                <button
                  onClick={() => setActiveTab('users')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all →
                </button>
              </div>
              
              {recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                            <span className="text-sm font-bold text-white">
                              {user.full_name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{user.full_name || user.username}</p>
                          <p className="text-sm text-gray-600 truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : user.role === 'recruiter'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {user.role}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No users found</p>
              )}
            </div>

            {/* Recent Applications */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <button
                  onClick={() => setActiveTab('activity')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all →
                </button>
              </div>
              
              {recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center shadow-md">
                            <FileText className="h-5 w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {application.candidate_name || 'Unknown Candidate'}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {application.job?.title || 'Job Position'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          application.status === 'pending' 
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : application.status === 'accepted'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : application.status === 'rejected'
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {application.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No applications found</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-200 group"
              >
                <div className="p-3 bg-blue-500 rounded-lg w-fit mb-3 group-hover:bg-blue-600 transition-colors">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">User Management</h3>
                <p className="text-sm text-gray-600">Manage system users and roles</p>
              </button>
              
              <button
                onClick={() => setActiveTab('analytics')}
                className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-200 group"
              >
                <div className="p-3 bg-green-500 rounded-lg w-fit mb-3 group-hover:bg-green-600 transition-colors">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
                <p className="text-sm text-gray-600">View detailed analytics reports</p>
              </button>
              
              <button
                onClick={() => setActiveTab('activity')}
                className="p-5 bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-200 group"
              >
                <div className="p-3 bg-purple-500 rounded-lg w-fit mb-3 group-hover:bg-purple-600 transition-colors">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Activity Feed</h3>
                <p className="text-sm text-gray-600">Monitor recent system activity</p>
              </button>
              
              <button
                onClick={() => setActiveTab('security')}
                className="p-5 bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-xl hover:shadow-md hover:scale-105 transition-all duration-200 group"
              >
                <div className="p-3 bg-red-500 rounded-lg w-fit mb-3 group-hover:bg-red-600 transition-colors">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Security</h3>
                <p className="text-sm text-gray-600">Monitor security and threats</p>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AdminAnalytics
          onExportData={handleExportData}
          onRefreshData={handleRefreshData}
          realTimeData={true}
        />
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <SystemMonitoring
          onConfigureAlerts={handleConfigureAlerts}
          onExportLogs={handleExportLogs}
          realTimeMonitoring={true}
        />
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <PerformanceMetrics />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <UserManagementAdmin />
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <ActivityFeedAdmin />
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <AuditLogs onExportLogs={handleExportData} />
      )}

      {/* Company Management Tab */}
      {activeTab === 'companies' && (
        <CompanyManagement onExportData={handleExportData} />
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <DataManagement onExportData={handleExportData} />
      )}

      {/* Security Monitoring Tab */}
      {activeTab === 'security' && (
        <SecurityMonitoring onExportData={handleExportData} />
      )}

      {/* Notification Center Tab */}
      {activeTab === 'notifications' && (
        <NotificationCenter onExportData={handleExportData} />
      )}

      {/* Reports System Tab */}
      {activeTab === 'reports' && (
        <ReportsSystem onExportData={handleExportData} />
      )}
    </div>
  )
}





















