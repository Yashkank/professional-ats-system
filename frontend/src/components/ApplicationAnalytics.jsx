import React, { useState, useEffect } from 'react'
import { 
  BarChart3, Download, Filter, Search, Calendar, 
  TrendingUp, TrendingDown, Target, Clock, CheckCircle,
  XCircle, AlertCircle, FileText, Eye, Edit, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

const ApplicationAnalytics = ({ applications, onUpdateApplication }) => {
  const [filteredApplications, setFilteredApplications] = useState([])
  const [filters, setFilters] = useState({
    status: 'all',
    company: '',
    dateRange: 'all',
    skills: []
  })
  const [analytics, setAnalytics] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [applicationNotes, setApplicationNotes] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setFilteredApplications(applications)
    fetchAnalytics()
  }, [applications])

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Calculate analytics from applications
      const totalApplications = applications.length
      const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
      }, {})
      
      const responseRate = totalApplications > 0 
        ? ((statusCounts.accepted + statusCounts.rejected) / totalApplications * 100).toFixed(1)
        : 0
      
      const averageResponseTime = calculateAverageResponseTime(applications)
      
      setAnalytics({
        totalApplications,
        responseRate: parseFloat(responseRate),
        averageResponseTime,
        statusBreakdown: statusCounts,
        monthlyTrends: generateMonthlyTrends(applications),
        topCompanies: getTopCompanies(applications),
        skillTrends: getSkillTrends(applications),
        successRate: totalApplications > 0 
          ? ((statusCounts.accepted || 0) / totalApplications * 100).toFixed(1)
          : 0
      })

    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast.error('Failed to load analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateAverageResponseTime = (apps) => {
    const respondedApps = apps.filter(app => 
      app.status === 'accepted' || app.status === 'rejected'
    )
    
    if (respondedApps.length === 0) return 0
    
    const totalDays = respondedApps.reduce((total, app) => {
      const appliedDate = new Date(app.created_at)
      const responseDate = new Date(app.updated_at)
      const daysDiff = Math.ceil((responseDate - appliedDate) / (1000 * 60 * 60 * 24))
      return total + daysDiff
    }, 0)
    
    return Math.round(totalDays / respondedApps.length)
  }

  const generateMonthlyTrends = (apps) => {
    const trends = {}
    apps.forEach(app => {
      const month = new Date(app.created_at).toISOString().slice(0, 7)
      trends[month] = (trends[month] || 0) + 1
    })
    return trends
  }

  const getTopCompanies = (apps) => {
    const companyCounts = {}
    apps.forEach(app => {
      const company = app.company_name || 'Unknown'
      companyCounts[company] = (companyCounts[company] || 0) + 1
    })
    
    return Object.entries(companyCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => ({ company, count }))
  }

  const getSkillTrends = (apps) => {
    // Mock skill trends - in real app, this would come from job analysis
    return [
      { skill: 'Python', demand: 85, applications: 12 },
      { skill: 'React', demand: 78, applications: 8 },
      { skill: 'AWS', demand: 92, applications: 15 },
      { skill: 'JavaScript', demand: 88, applications: 10 },
      { skill: 'SQL', demand: 75, applications: 6 }
    ]
  }

  const applyFilters = () => {
    let filtered = [...applications]

    if (filters.status !== 'all') {
      filtered = filtered.filter(app => app.status === filters.status)
    }

    if (filters.company) {
      filtered = filtered.filter(app => 
        app.company_name?.toLowerCase().includes(filters.company.toLowerCase())
      )
    }

    if (filters.dateRange !== 'all') {
      const now = new Date()
      const cutoffDate = new Date()
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7)
          break
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1)
          break
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3)
          break
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1)
          break
      }
      
      filtered = filtered.filter(app => new Date(app.created_at) >= cutoffDate)
    }

    setFilteredApplications(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [filters, applications])

  const exportToCSV = () => {
    const csvContent = [
      ['Job Title', 'Company', 'Status', 'Applied Date', 'Response Date', 'Notes'],
      ...filteredApplications.map(app => [
        app.job_title || '',
        app.company_name || '',
        app.status || '',
        new Date(app.created_at).toLocaleDateString(),
        app.updated_at ? new Date(app.updated_at).toLocaleDateString() : '',
        app.notes || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `applications_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
    
    toast.success('Applications exported to CSV')
  }

  const exportToPDF = () => {
    // Mock PDF export
    toast.success('PDF export feature coming soon!')
  }

  const openNotesModal = (application) => {
    setSelectedApplication(application)
    setApplicationNotes(application.notes || '')
    setShowNotesModal(true)
  }

  const saveNotes = async () => {
    if (!selectedApplication) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update application with notes
      const updatedApplication = {
        ...selectedApplication,
        notes: applicationNotes
      }
      
      onUpdateApplication?.(updatedApplication)
      setShowNotesModal(false)
      toast.success('Notes saved successfully')
    } catch (error) {
      toast.error('Failed to save notes')
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading analytics...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
            Application Analytics
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportToCSV}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </button>
            <button
              onClick={exportToPDF}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <FileText className="h-4 w-4 mr-1" />
              PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.totalApplications}</p>
            <p className="text-sm text-gray-500">Total Applications</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.successRate}%</p>
            <p className="text-sm text-gray-500">Success Rate</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.averageResponseTime}</p>
            <p className="text-sm text-gray-500">Avg Response (days)</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{analytics.responseRate}%</p>
            <p className="text-sm text-gray-500">Response Rate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Filter className="h-5 w-5 mr-2 text-gray-600" />
          Filters & Search
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input
              type="text"
              value={filters.company}
              onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
              placeholder="Search companies..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={applyFilters}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Applications ({filteredApplications.length})
          </h3>
        </div>

        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{application.job_title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{application.company_name}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Applied {new Date(application.created_at).toLocaleDateString()}
                    </div>
                    {application.updated_at && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        Updated {new Date(application.updated_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {application.notes && (
                    <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Notes:</strong> {application.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openNotesModal(application)}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Add/Edit Notes"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {/* View details */}}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredApplications.length === 0 && (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No applications found matching your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Skill Trends */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
          Skill Trends
        </h3>

        <div className="space-y-3">
          {analytics.skillTrends.map((skill, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                  <span className="text-sm text-gray-600">{skill.applications} applications</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${skill.demand}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{skill.demand}% market demand</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add Notes</h3>
              <button
                onClick={() => setShowNotesModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">{selectedApplication.job_title}</h4>
                <p className="text-sm text-gray-600">{selectedApplication.company_name}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={applicationNotes}
                  onChange={(e) => setApplicationNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add your notes about this application..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowNotesModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNotes}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationAnalytics
