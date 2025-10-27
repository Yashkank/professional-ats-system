import React, { useState, useEffect, useCallback } from 'react'
import {
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  RefreshCw,
  Download,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  Briefcase,
  FileText,
  Building2,
  TrendingUp,
  TrendingDown,
  Monitor
} from 'lucide-react'
import { adminAnalyticsAPI } from '../services/api'
import toast from 'react-hot-toast'

const SystemMonitoring = ({
  onConfigureAlerts,
  onExportLogs,
  realTimeMonitoring = true
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [systemData, setSystemData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Fetch real system metrics
  const fetchSystemMetrics = useCallback(async () => {
    setIsLoading(true)
    try {
      const [overview, system] = await Promise.all([
        adminAnalyticsAPI.getOverview('30d'),
        adminAnalyticsAPI.getSystemMetrics('30d')
      ])

      setSystemData({
        overview: overview.data,
        system: system.data
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching system metrics:', error)
      toast.error('Failed to load system metrics')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSystemMetrics()
  }, [fetchSystemMetrics])

  // Auto-refresh
  useEffect(() => {
    let interval
    if (autoRefresh && realTimeMonitoring) {
      interval = setInterval(() => {
        fetchSystemMetrics()
      }, 30000) // Every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, realTimeMonitoring, fetchSystemMetrics])

  const handleRefresh = () => {
    fetchSystemMetrics()
    toast.success('System metrics refreshed')
  }

  const handleExport = () => {
    if (onExportLogs) onExportLogs()
    toast.success('Exporting system metrics...')
  }

  // Calculate system health status
  const getSystemHealth = () => {
    if (!systemData) return { status: 'unknown', color: 'gray', label: 'Loading...' }
    
    const { overview } = systemData
    const totalRecords = overview.total_users + overview.total_jobs + overview.total_applications
    
    if (totalRecords > 0 && overview.active_users > 0) {
      return { status: 'healthy', color: 'green', label: 'All Systems Operational' }
    } else if (totalRecords > 0) {
      return { status: 'warning', color: 'yellow', label: 'Limited Activity' }
    } else {
      return { status: 'error', color: 'red', label: 'No Data' }
    }
  }

  const health = getSystemHealth()

  if (isLoading && !systemData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const { overview, system } = systemData || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Server className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">System Monitoring</h2>
                <p className="text-blue-100">Real-time platform health and performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                {health.status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-400" />}
                {health.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-400" />}
                {health.status === 'error' && <XCircle className="h-5 w-5 text-red-400" />}
                <span className="text-sm font-medium">{health.label}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-blue-200">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                autoRefresh 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}</span>
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

      {/* Database Statistics */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Database className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Database Health</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Users className="h-5 w-5 text-blue-500 mr-2" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {system?.database_stats?.total_records?.users || 0}
            </p>
            <p className="text-sm text-gray-600">Users</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Briefcase className="h-5 w-5 text-green-500 mr-2" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {system?.database_stats?.total_records?.jobs || 0}
            </p>
            <p className="text-sm text-gray-600">Jobs</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <FileText className="h-5 w-5 text-purple-500 mr-2" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {system?.database_stats?.total_records?.applications || 0}
            </p>
            <p className="text-sm text-gray-600">Applications</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Building2 className="h-5 w-5 text-orange-500 mr-2" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {system?.database_stats?.total_records?.companies || 0}
            </p>
            <p className="text-sm text-gray-600">Companies</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-5 w-5 text-indigo-500 mr-2" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {system?.database_stats?.total_records?.matching_results || 0}
            </p>
            <p className="text-sm text-gray-600">Matches</p>
          </div>
        </div>
      </div>

      {/* Platform Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview?.active_users || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-sm">
            {overview?.growth_rate >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span className={overview?.growth_rate >= 0 ? 'text-green-600' : 'text-red-600'}>
              {Math.abs(overview?.growth_rate || 0)}% growth
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview?.active_jobs || 0}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {overview?.total_jobs || 0} total jobs
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Apps</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview?.pending_applications || 0}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {overview?.total_applications || 0} total applications
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {overview?.total_companies || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Building2 className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Registered organizations
          </p>
        </div>
      </div>

      {/* Most Active Users */}
      {system?.most_active_users && system.most_active_users.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Activity className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Most Active Users</h3>
          </div>
          
          <div className="space-y-3">
            {system.most_active_users.slice(0, 10).map((user, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 rounded-full font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{user.activity_count}</p>
                    <p className="text-xs text-gray-500">activities</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Monitor className="h-6 w-6 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Backend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Server</span>
                <span className="font-medium text-gray-900">FastAPI + Uvicorn</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database</span>
                <span className="font-medium text-gray-900">PostgreSQL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Session Storage</span>
                <span className="font-medium text-gray-900">In-Memory (Fallback)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Frontend</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Framework</span>
                <span className="font-medium text-gray-900">React 18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build Tool</span>
                <span className="font-medium text-gray-900">Vite</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">UI Library</span>
                <span className="font-medium text-gray-900">Tailwind CSS</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemMonitoring
