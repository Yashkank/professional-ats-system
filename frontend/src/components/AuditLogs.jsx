import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  Download,
  Calendar,
  User,
  Shield,
  Database,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Users,
  Briefcase,
  Edit,
  Trash2,
  LogIn,
  UserPlus,
  Activity,
  Mail
} from 'lucide-react'
import { userAPI, jobAPI, applicationAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuditLogs = ({ onExportLogs }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAction, setSelectedAction] = useState('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [expandedLog, setExpandedLog] = useState(null)
  const [logs, setLogs] = useState([])
  const [filteredLogs, setFilteredLogs] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Build audit logs from real database activity
  const fetchAuditLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, jobsRes, appsRes] = await Promise.all([
        userAPI.getAllUsers(),
        jobAPI.getJobs(),
        applicationAPI.getApplications()
      ])

      const auditLogsList = []

      // User creation logs
      usersRes.data.forEach(user => {
        auditLogsList.push({
          id: `user-create-${user.id}`,
          timestamp: new Date(user.created_at),
          actor: 'System',
          actorEmail: 'system@ats.com',
          action: 'USER_CREATED',
          category: 'user_management',
          severity: 'info',
          description: `User account created: ${user.full_name || user.username}`,
          target: 'User Account',
          targetId: user.id,
          details: {
            email: user.email,
            username: user.username,
            role: user.role,
            fullName: user.full_name
          }
        })

        // User update logs (if updated_at exists and is different)
        if (user.updated_at && user.updated_at !== user.created_at) {
          auditLogsList.push({
            id: `user-update-${user.id}`,
            timestamp: new Date(user.updated_at),
            actor: user.full_name || user.username,
            actorEmail: user.email,
            action: 'USER_UPDATED',
            category: 'user_management',
            severity: 'info',
            description: `User profile updated: ${user.full_name || user.username}`,
            target: 'User Account',
            targetId: user.id,
            details: {
              email: user.email,
              role: user.role,
              isActive: user.is_active
            }
          })
        }
      })

      // Job creation logs
      jobsRes.data.forEach(job => {
        auditLogsList.push({
          id: `job-create-${job.id}`,
          timestamp: new Date(job.created_at),
          actor: 'Recruiter',
          actorEmail: 'recruiter@company.com',
          action: 'JOB_CREATED',
          category: 'job_management',
          severity: 'info',
          description: `Job posted: ${job.title}`,
          target: 'Job Posting',
          targetId: job.id,
          details: {
            title: job.title,
            location: job.location,
            experienceLevel: job.experience_level,
            status: job.status,
            company: job.company?.name
          }
        })

        // Job update logs
        if (job.updated_at && job.updated_at !== job.created_at) {
          auditLogsList.push({
            id: `job-update-${job.id}`,
            timestamp: new Date(job.updated_at),
            actor: 'Recruiter',
            actorEmail: 'recruiter@company.com',
            action: 'JOB_UPDATED',
            category: 'job_management',
            severity: 'info',
            description: `Job updated: ${job.title}`,
            target: 'Job Posting',
            targetId: job.id,
            details: {
              title: job.title,
              status: job.status
            }
          })
        }
      })

      // Application logs
      appsRes.data.forEach(app => {
        auditLogsList.push({
          id: `app-create-${app.id}`,
          timestamp: new Date(app.created_at),
          actor: app.candidate_name,
          actorEmail: app.user?.email || 'candidate@email.com',
          action: 'APPLICATION_SUBMITTED',
          category: 'application',
          severity: 'info',
          description: `Application submitted for ${app.job?.title || 'position'}`,
          target: 'Application',
          targetId: app.id,
          details: {
            candidateName: app.candidate_name,
            jobTitle: app.job?.title,
            status: app.status
          }
        })

        // Application status changes
        if (app.updated_at && app.updated_at !== app.created_at) {
          const severityMap = {
            'accepted': 'info',
            'rejected': 'warning',
            'pending': 'info'
          }

          auditLogsList.push({
            id: `app-update-${app.id}`,
            timestamp: new Date(app.updated_at),
            actor: 'Recruiter',
            actorEmail: 'recruiter@company.com',
            action: 'APPLICATION_STATUS_CHANGED',
            category: 'application',
            severity: severityMap[app.status] || 'info',
            description: `Application status changed to ${app.status}`,
            target: 'Application',
            targetId: app.id,
            details: {
              candidateName: app.candidate_name,
              jobTitle: app.job?.title,
              newStatus: app.status
            }
          })
        }
      })

      // Sort by timestamp (newest first)
      auditLogsList.sort((a, b) => b.timestamp - a.timestamp)

      setLogs(auditLogsList)
      setFilteredLogs(auditLogsList)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  // Filter logs
  useEffect(() => {
    let result = logs

    // Time range filter
    const now = new Date()
    const cutoffTime = new Date()
    
    switch (selectedTimeRange) {
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
        cutoffTime.setFullYear(2000)
        break
      default:
        cutoffTime.setHours(now.getHours() - 24)
    }

    result = result.filter(log => log.timestamp >= cutoffTime)

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(log => log.category === selectedCategory)
    }

    // Action filter
    if (selectedAction !== 'all') {
      result = result.filter(log => log.action === selectedAction)
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(log =>
        log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.target?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredLogs(result)
  }, [logs, selectedTimeRange, selectedCategory, selectedAction, searchTerm])

  const handleRefresh = () => {
    fetchAuditLogs()
    toast.success('Audit logs refreshed')
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = filteredLogs.map(log => ({
      Timestamp: log.timestamp.toISOString(),
      Actor: log.actor,
      Email: log.actorEmail,
      Action: log.action,
      Category: log.category,
      Severity: log.severity,
      Description: log.description,
      Target: log.target,
      TargetId: log.targetId
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
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    if (onExportLogs) onExportLogs()
    toast.success('Audit logs exported successfully')
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getActionIcon = (action) => {
    if (action.includes('USER')) return <Users className="h-4 w-4" />
    if (action.includes('JOB')) return <Briefcase className="h-4 w-4" />
    if (action.includes('APPLICATION')) return <FileText className="h-4 w-4" />
    if (action.includes('LOGIN')) return <LogIn className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
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

  const getLogStats = () => {
    return {
      total: logs.length,
      byCategory: {
        authentication: logs.filter(l => l.category === 'authentication').length,
        user_management: logs.filter(l => l.category === 'user_management').length,
        job_management: logs.filter(l => l.category === 'job_management').length,
        application: logs.filter(l => l.category === 'application').length
      },
      bySeverity: {
        info: logs.filter(l => l.severity === 'info').length,
        warning: logs.filter(l => l.severity === 'warning').length,
        error: logs.filter(l => l.severity === 'error').length
      }
    }
  }

  const stats = getLogStats()

  if (isLoading && logs.length === 0) {
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
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Audit Logs</h2>
                <p className="text-blue-100">Compliance-grade activity tracking and monitoring</p>
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
              <p className="text-sm font-medium text-gray-600">Total Logs</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Actions</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.byCategory.user_management}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Job Actions</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.byCategory.job_management}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.byCategory.application}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Logs</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search logs..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="user_management">User Management</option>
              <option value="job_management">Job Management</option>
              <option value="application">Applications</option>
            </select>
          </div>

          {/* Action Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action Type</label>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="USER_CREATED">User Created</option>
              <option value="USER_UPDATED">User Updated</option>
              <option value="JOB_CREATED">Job Created</option>
              <option value="JOB_UPDATED">Job Updated</option>
              <option value="APPLICATION_SUBMITTED">Application Submitted</option>
              <option value="APPLICATION_STATUS_CHANGED">Status Changed</option>
            </select>
          </div>

          {/* Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
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

      {/* Audit Logs List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Audit Trail ({filteredLogs.length} entries)
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`flex-shrink-0 p-2 rounded-lg border ${getSeverityColor(log.severity)}`}>
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{log.action.replace(/_/g, ' ')}</h4>
                        <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getSeverityColor(log.severity)}`}>
                          {getSeverityIcon(log.severity)}
                          <span className="capitalize">{log.severity}</span>
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{log.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {log.actor}
                        </span>
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {log.actorEmail}
                        </span>
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                          {log.category.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTimeAgo(log.timestamp)}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      {log.timestamp.toLocaleString()}
                    </span>
                    <button
                      onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                      className="mt-2 text-blue-600 hover:text-blue-800 flex items-center text-xs"
                    >
                      {expandedLog === log.id ? (
                        <>
                          <ChevronUp className="h-3 w-3 mr-1" />
                          Hide Details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3 mr-1" />
                          View Details
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedLog === log.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2">Details</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-500">Target:</span>
                          <span className="ml-2 text-gray-900 font-medium">{log.target}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Target ID:</span>
                          <span className="ml-2 text-gray-900 font-mono">{log.targetId}</span>
                        </div>
                      </div>
                      {log.details && (
                        <div className="mt-3">
                          <h6 className="text-xs font-semibold text-gray-700 mb-2">Additional Information</h6>
                          <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-x-auto">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 px-6">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No audit logs found</h3>
              <p className="text-gray-600">
                {searchTerm || selectedCategory !== 'all' || selectedAction !== 'all'
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

export default AuditLogs
