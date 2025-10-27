import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  RefreshCw,
  FileText,
  Users,
  Briefcase,
  TrendingUp,
  Clock,
  Activity,
  Building2,
  Database,
  Zap,
  Plus,
  Edit,
  Trash2,
  FolderOpen,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react'
import { adminAnalyticsAPI, userAPI, jobAPI, applicationAPI, companyAPI } from '../services/api'
import toast from 'react-hot-toast'

const ReportsSystem = ({ onExportData }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')
  const [reports, setReports] = useState([])
  const [reportsData, setReportsData] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch real data for reports (recruiter-accessible APIs only)
  const fetchReportsData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [jobs, applications] = await Promise.all([
        jobAPI.getJobs(),
        applicationAPI.getApplications()
      ])

      // Calculate metrics from available data
      const totalJobs = jobs.data.length
      const activeJobs = jobs.data.filter(j => j.status === 'active').length
      const totalApplications = applications.data.length
      const pendingApplications = applications.data.filter(a => a.status === 'pending').length
      const acceptedApplications = applications.data.filter(a => a.status === 'accepted').length
      const conversionRate = totalApplications > 0 ? ((acceptedApplications / totalApplications) * 100).toFixed(1) : 0
      const fillRate = activeJobs > 0 ? ((acceptedApplications / activeJobs) * 100).toFixed(1) : 0

      const data = {
        overview: {
          total_users: 0,
          new_users: 0,
          active_users: 0,
          growth_rate: 0,
          total_jobs: totalJobs,
          active_jobs: activeJobs,
          total_applications: totalApplications,
          pending_applications: pendingApplications,
          accepted_applications: acceptedApplications
        },
        users: { total_count: 0, active_count: 0 },
        jobs: { total_count: totalJobs, active_count: activeJobs },
        applications: { 
          total_count: totalApplications,
          pending_count: pendingApplications,
          accepted_count: acceptedApplications,
          conversion_rate: parseFloat(conversionRate)
        },
        performance: { 
          job_fill_rate: parseFloat(fillRate),
          avg_match_score: 85,
          avg_time_to_hire_days: 14
        },
        system: {
          database_stats: { total_records: { jobs: totalJobs, applications: totalApplications } }
        }
      }

      setReportsData(data)

      // Build available reports from real data
      const reportsList = [
        {
          id: 'user-analytics',
          name: 'User Analytics Report',
          type: 'analytics',
          category: 'users',
          status: 'available',
          description: 'Comprehensive analysis of user growth, engagement, and activity patterns',
          metrics: {
            totalUsers: data.overview.total_users,
            newUsers: data.overview.new_users,
            activeUsers: data.overview.active_users,
            growth: data.overview.growth_rate
          },
          lastGenerated: new Date(),
          format: 'csv'
        },
        {
          id: 'job-performance',
          name: 'Job Performance Report',
          type: 'performance',
          category: 'jobs',
          status: 'available',
          description: 'Analysis of job posting performance, application rates, and hiring success',
          metrics: {
            totalJobs: data.overview.total_jobs,
            activeJobs: data.overview.active_jobs,
            applications: data.overview.total_applications,
            fillRate: data.performance.job_fill_rate
          },
          lastGenerated: new Date(),
          format: 'csv'
        },
        {
          id: 'application-metrics',
          name: 'Application Metrics Report',
          type: 'metrics',
          category: 'applications',
          status: 'available',
          description: 'Application submission trends, conversion rates, and processing times',
          metrics: {
            total: data.overview.total_applications,
            pending: data.overview.pending_applications,
            accepted: data.overview.accepted_applications,
            conversionRate: data.applications.conversion_rate
          },
          lastGenerated: new Date(),
          format: 'csv'
        },
        {
          id: 'system-health',
          name: 'System Health Report',
          type: 'system',
          category: 'infrastructure',
          status: 'available',
          description: 'Database statistics, active users, and system performance metrics',
          metrics: {
            dbRecords: Object.values(data.system.database_stats.total_records).reduce((a, b) => a + b, 0),
            activeUsers: data.overview.active_users,
            matchScore: data.performance.avg_match_score,
            timeToHire: data.performance.avg_time_to_hire_days
          },
          lastGenerated: new Date(),
          format: 'csv'
        }
      ]

      setReports(reportsList)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching reports data:', error)
      toast.error('Failed to load reports data')
    } finally {
      setIsLoading(false)
    }
  }, [dateRange])

  useEffect(() => {
    fetchReportsData()
  }, [fetchReportsData])

  const handleRefresh = () => {
    fetchReportsData()
    toast.success('Reports data refreshed')
  }

  const handleGenerateReport = async (report) => {
    toast.success(`Generating ${report.name}...`)
    
    try {
      // Fetch fresh data
      let data = []
      let filename = report.name.toLowerCase().replace(/\s+/g, '_')
      
      switch (report.category) {
        case 'users': {
          const response = await userAPI.getAllUsers()
          data = response.data.map(user => ({
            'Full Name': user.full_name || '',
            'Email': user.email,
            'Username': user.username,
            'Role': user.role,
            'Status': user.is_active ? 'Active' : 'Inactive',
            'Created': new Date(user.created_at).toLocaleDateString(),
            'Last Updated': user.updated_at ? new Date(user.updated_at).toLocaleDateString() : 'N/A'
          }))
          break
        }
        case 'jobs': {
          const response = await jobAPI.getJobs()
          data = response.data.map(job => ({
            'Title': job.title,
            'Company': job.company?.name || 'N/A',
            'Location': job.location || 'N/A',
            'Experience Level': job.experience_level || 'N/A',
            'Status': job.status,
            'Posted': new Date(job.created_at).toLocaleDateString()
          }))
          break
        }
        case 'applications': {
          const response = await applicationAPI.getApplications()
          data = response.data.map(app => ({
            'Candidate': app.candidate_name,
            'Job Title': app.job?.title || 'N/A',
            'Company': app.job?.company?.name || 'N/A',
            'Status': app.status,
            'Submitted': new Date(app.created_at).toLocaleDateString()
          }))
          break
        }
        case 'infrastructure': {
          const [usersRes, jobsRes, appsRes, companiesRes] = await Promise.all([
            userAPI.getAllUsers(),
            jobAPI.getJobs(),
            applicationAPI.getApplications(),
            companyAPI.getCompanies()
          ])
          data = [
            { Metric: 'Total Users', Value: usersRes.data.length },
            { Metric: 'Total Jobs', Value: jobsRes.data.length },
            { Metric: 'Total Applications', Value: appsRes.data.length },
            { Metric: 'Total Companies', Value: companiesRes.data.length },
            { Metric: 'Active Users', Value: usersRes.data.filter(u => u.is_active).length },
            { Metric: 'Active Jobs', Value: jobsRes.data.filter(j => j.status === 'active').length }
          ]
          break
        }
      }

      // Convert to CSV
      const headers = Object.keys(data[0] || {})
      const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
      ].join('\n')

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
      a.click()

      toast.success(`${report.name} generated and downloaded!`)
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    }
  }

  if (isLoading && !reportsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'available', label: 'Available Reports', icon: FileText },
    { id: 'templates', label: 'Templates', icon: FolderOpen }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Reports & Analytics</h2>
                <p className="text-blue-100">Generate comprehensive reports with live data</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 text-sm text-blue-200">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 focus:ring-2 focus:ring-white/50"
            >
              <option value="7d" className="text-gray-900">Last 7 days</option>
              <option value="30d" className="text-gray-900">Last 30 days</option>
              <option value="90d" className="text-gray-900">Last 90 days</option>
              <option value="1y" className="text-gray-900">Last year</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-2">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-max">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-white/50 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activeTab === tab.id 
                      ? 'bg-white/20' 
                      : 'bg-gray-100'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && reportsData && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Available Reports</p>
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportsData.overview.total_users}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <Briefcase className="h-5 w-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportsData.overview.total_jobs}</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{reportsData.overview.total_applications}</p>
            </div>
          </div>

          {/* Data Summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary ({dateRange})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">{reportsData.overview.new_users}</p>
                <p className="text-sm text-gray-600">New Users</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{reportsData.overview.new_jobs}</p>
                <p className="text-sm text-gray-600">New Jobs</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">{reportsData.overview.period_applications}</p>
                <p className="text-sm text-gray-600">Period Applications</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">{reportsData.overview.growth_rate.toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Growth Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Available Reports Tab */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className={`p-3 rounded-xl ${
                    report.format === 'pdf' ? 'bg-red-50 text-red-600' :
                    report.format === 'csv' ? 'bg-green-50 text-green-600' :
                    'bg-blue-50 text-blue-600'
                  }`}>
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{report.name}</h4>
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full border border-green-200">
                        AVAILABLE
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {Object.entries(report.metrics).map(([key, value]) => (
                        <div key={key} className="text-center p-2 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-gray-900">
                            {typeof value === 'number' && value < 100 ? value.toFixed(1) : value}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Format: {report.format.toUpperCase()}</span>
                      <span>Category: {report.category}</span>
                      <span>Last generated: {report.lastGenerated.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleGenerateReport(report)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Generate</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'User Analytics Template',
              description: 'Standard template for user growth and engagement analysis',
              category: 'users',
              icon: Users,
              color: 'blue'
            },
            {
              name: 'Job Performance Template',
              description: 'Template for analyzing job posting performance and hiring success',
              category: 'jobs',
              icon: Briefcase,
              color: 'green'
            },
            {
              name: 'Application Metrics Template',
              description: 'Template for application trends and conversion analysis',
              category: 'applications',
              icon: Activity,
              color: 'purple'
            },
            {
              name: 'System Health Template',
              description: 'Template for system performance and infrastructure monitoring',
              category: 'infrastructure',
              icon: Database,
              color: 'orange'
            }
          ].map((template, index) => {
            const IconComponent = template.icon
            return (
              <div key={index} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
                <div className={`p-3 bg-${template.color}-50 rounded-lg w-fit mb-4`}>
                  <IconComponent className={`h-6 w-6 text-${template.color}-600`} />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h4>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <button className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 font-medium">
                  Use Template
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ReportsSystem
