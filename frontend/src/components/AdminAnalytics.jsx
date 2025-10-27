import React, { useState, useEffect, useCallback } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  Clock, 
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Minus,
  Target,
  Zap,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import { adminAnalyticsAPI } from '../services/api'
import toast from 'react-hot-toast'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const AdminAnalytics = ({ 
  onExportData,
  onRefreshData,
  realTimeData = false 
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [showDetails, setShowDetails] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Real data state
  const [overviewData, setOverviewData] = useState(null)
  const [userMetrics, setUserMetrics] = useState(null)
  const [jobMetrics, setJobMetrics] = useState(null)
  const [applicationMetrics, setApplicationMetrics] = useState(null)
  const [systemMetrics, setSystemMetrics] = useState(null)
  const [geographicMetrics, setGeographicMetrics] = useState(null)
  const [performanceMetrics, setPerformanceMetrics] = useState(null)

  const timeRanges = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ]

  const metricCategories = [
    { value: 'overview', label: 'Overview', icon: BarChart3 },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'jobs', label: 'Jobs', icon: Briefcase },
    { value: 'applications', label: 'Applications', icon: FileText },
    { value: 'system', label: 'System', icon: Server },
    { value: 'performance', label: 'Performance', icon: Zap },
    { value: 'geographic', label: 'Geographic', icon: Globe }
  ]

  // Fetch all analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch all metrics in parallel
      const [overview, users, jobs, applications, system, geographic, performance] = await Promise.all([
        adminAnalyticsAPI.getOverview(selectedTimeRange),
        adminAnalyticsAPI.getUserMetrics(selectedTimeRange),
        adminAnalyticsAPI.getJobMetrics(selectedTimeRange),
        adminAnalyticsAPI.getApplicationMetrics(selectedTimeRange),
        adminAnalyticsAPI.getSystemMetrics(selectedTimeRange),
        adminAnalyticsAPI.getGeographicMetrics(selectedTimeRange),
        adminAnalyticsAPI.getPerformanceMetrics(selectedTimeRange)
      ])

      setOverviewData(overview.data)
      setUserMetrics(users.data)
      setJobMetrics(jobs.data)
      setApplicationMetrics(applications.data)
      setSystemMetrics(system.data)
      setGeographicMetrics(geographic.data)
      setPerformanceMetrics(performance.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching analytics data:', error)
      toast.error('Failed to load analytics data')
    } finally {
      setIsLoading(false)
    }
  }, [selectedTimeRange])

  // Initial load and time range changes
  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  // Auto-refresh
  useEffect(() => {
    let interval
    if (autoRefresh && realTimeData) {
      interval = setInterval(() => {
        fetchAnalyticsData()
      }, 30000) // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, realTimeData, fetchAnalyticsData])

  const handleRefresh = () => {
    fetchAnalyticsData()
    if (onRefreshData) onRefreshData()
    toast.success('Analytics data refreshed')
  }

  const handleExport = () => {
    if (onExportData) onExportData(selectedTimeRange, selectedMetric)
    toast.success('Exporting analytics data...')
  }

  const getTrendIcon = (value) => {
    if (value > 0) return <ArrowUp className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getTrendColor = (value) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  // Render functions for different metric categories
  const renderOverview = () => {
    if (!overviewData) return null

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{overviewData.total_users}</p>
                <div className="flex items-center mt-2 text-sm">
                  {getTrendIcon(overviewData.growth_rate)}
                  <span className={`ml-1 font-medium ${getTrendColor(overviewData.growth_rate)}`}>
                    {Math.abs(overviewData.growth_rate)}%
                  </span>
                  <span className="ml-1 text-gray-500">vs previous period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{overviewData.active_jobs}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {overviewData.total_jobs} total jobs
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{overviewData.total_applications}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {overviewData.period_applications} this period
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{overviewData.active_users}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {((overviewData.active_users / overviewData.total_users) * 100).toFixed(1)}% of total
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Pending</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {overviewData.pending_applications}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{overviewData.pending_applications}</div>
            <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Accepted</h3>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {overviewData.accepted_applications}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{overviewData.accepted_applications}</div>
            <p className="text-sm text-gray-500 mt-1">Successfully hired</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Rejected</h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
                {overviewData.rejected_applications}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{overviewData.rejected_applications}</div>
            <p className="text-sm text-gray-500 mt-1">Not selected</p>
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Companies</span>
                <span className="text-sm font-semibold text-gray-900">{overviewData.total_companies}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Users (Period)</span>
                <span className="text-sm font-semibold text-gray-900">{overviewData.new_users}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Jobs (Period)</span>
                <span className="text-sm font-semibold text-gray-900">{overviewData.new_jobs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg Apps per Job</span>
                <span className="text-sm font-semibold text-gray-900">{overviewData.avg_applications_per_job}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">User Growth Rate</span>
                  <span className={`text-sm font-semibold ${getTrendColor(overviewData.growth_rate)}`}>
                    {overviewData.growth_rate}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${overviewData.growth_rate > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(Math.abs(overviewData.growth_rate), 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderUsers = () => {
    if (!userMetrics) return null

    const userGrowthData = {
      labels: userMetrics.user_growth?.map(item => item.date) || [],
      datasets: [
        {
          label: 'New Users',
          data: userMetrics.user_growth?.map(item => item.count) || [],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }

    const roleDistributionData = {
      labels: userMetrics.role_distribution?.map(item => item.role) || [],
      datasets: [
        {
          data: userMetrics.role_distribution?.map(item => item.count) || [],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderWidth: 0
        }
      ]
    }

    return (
      <div className="space-y-6">
        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Active Users</h3>
            <p className="text-3xl font-bold text-gray-900">{userMetrics.active_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Inactive Users</h3>
            <p className="text-3xl font-bold text-gray-900">{userMetrics.inactive_count}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Retention Rate</h3>
            <p className="text-3xl font-bold text-gray-900">
              {((userMetrics.active_count / (userMetrics.active_count + userMetrics.inactive_count)) * 100).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend</h3>
            <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Role Distribution</h3>
            <Doughnut data={roleDistributionData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {userMetrics.recent_users?.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const renderJobs = () => {
    if (!jobMetrics) return null

    const jobPostingsData = {
      labels: jobMetrics.job_postings?.map(item => item.date) || [],
      datasets: [
        {
          label: 'Jobs Posted',
          data: jobMetrics.job_postings?.map(item => item.count) || [],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
          borderColor: 'rgb(16, 185, 129)',
          borderWidth: 1
        }
      ]
    }

    const statusData = {
      labels: jobMetrics.status_distribution?.map(item => item.status) || [],
      datasets: [
        {
          data: jobMetrics.status_distribution?.map(item => item.count) || [],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ]
        }
      ]
    }

    return (
      <div className="space-y-6">
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Postings Trend</h3>
            <Bar data={jobPostingsData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Status Distribution</h3>
            <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        {/* Top Companies */}
        {jobMetrics.top_companies && jobMetrics.top_companies.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies by Job Count</h3>
            <div className="space-y-3">
              {jobMetrics.top_companies.slice(0, 5).map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{company.company}</span>
                  <span className="text-sm font-semibold text-gray-900">{company.job_count} jobs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Jobs by Applications */}
        {jobMetrics.top_jobs_by_applications && jobMetrics.top_jobs_by_applications.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Applied Jobs</h3>
            <div className="space-y-3">
              {jobMetrics.top_jobs_by_applications.slice(0, 5).map((job, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{job.job_title}</span>
                  <span className="text-sm font-semibold text-gray-900">{job.application_count} apps</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderApplications = () => {
    if (!applicationMetrics) return null

    const applicationTrendsData = {
      labels: applicationMetrics.application_trends?.map(item => item.date) || [],
      datasets: [
        {
          label: 'Applications',
          data: applicationMetrics.application_trends?.map(item => item.count) || [],
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    }

    const statusData = {
      labels: applicationMetrics.status_distribution?.map(item => item.status) || [],
      datasets: [
        {
          data: applicationMetrics.status_distribution?.map(item => item.count) || [],
          backgroundColor: [
            'rgba(251, 191, 36, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ]
        }
      ]
    }

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{applicationMetrics.conversion_rate}%</p>
            <p className="text-sm text-gray-500 mt-1">Accepted / Total</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Processing Time</h3>
            <p className="text-3xl font-bold text-gray-900">{applicationMetrics.avg_processing_time_hours.toFixed(1)}h</p>
            <p className="text-sm text-gray-500 mt-1">Hours to process</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Trends</h3>
            <Line data={applicationTrendsData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
            <Doughnut data={statusData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>
      </div>
    )
  }

  const renderSystem = () => {
    if (!systemMetrics) return null

    return (
      <div className="space-y-6">
        {/* Database Stats */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Records</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.database_stats.total_records.users}</p>
              <p className="text-sm text-gray-600">Users</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.database_stats.total_records.jobs}</p>
              <p className="text-sm text-gray-600">Jobs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.database_stats.total_records.applications}</p>
              <p className="text-sm text-gray-600">Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.database_stats.total_records.companies}</p>
              <p className="text-sm text-gray-600">Companies</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{systemMetrics.database_stats.total_records.matching_results}</p>
              <p className="text-sm text-gray-600">Matches</p>
            </div>
          </div>
        </div>

        {/* Most Active Users */}
        {systemMetrics.most_active_users && systemMetrics.most_active_users.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Active Users</h3>
            <div className="space-y-3">
              {systemMetrics.most_active_users.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{user.activity_count} activities</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderGeographic = () => {
    if (!geographicMetrics) return null

    return (
      <div className="space-y-6">
        {/* Jobs by Location */}
        {geographicMetrics.jobs_by_location && geographicMetrics.jobs_by_location.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Location</h3>
            <div className="space-y-3">
              {geographicMetrics.jobs_by_location.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{item.location}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.job_count} jobs</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applications by Location */}
        {geographicMetrics.applications_by_location && geographicMetrics.applications_by_location.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Applications by Location</h3>
            <div className="space-y-3">
              {geographicMetrics.applications_by_location.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-700">{item.location}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.application_count} applications</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderPerformance = () => {
    if (!performanceMetrics) return null

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Match Score</h3>
            <p className="text-3xl font-bold text-gray-900">{performanceMetrics.avg_match_score}</p>
            <p className="text-sm text-gray-500 mt-1">Out of 100</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Job Fill Rate</h3>
            <p className="text-3xl font-bold text-gray-900">{performanceMetrics.job_fill_rate}%</p>
            <p className="text-sm text-gray-500 mt-1">Jobs with hires</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Time to Hire</h3>
            <p className="text-3xl font-bold text-gray-900">{performanceMetrics.avg_time_to_hire_days}</p>
            <p className="text-sm text-gray-500 mt-1">Days average</p>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading && !overviewData) {
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
            <h2 className="text-3xl font-bold mb-2">Analytics Dashboard</h2>
            <p className="text-blue-100">Real-time insights and performance metrics</p>
            <p className="text-sm text-blue-200 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
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

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Time Range:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Categories */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-2">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide">
          <div className="flex space-x-2 min-w-max">
            {metricCategories.map((category) => {
              const IconComponent = category.icon
              return (
                <button
                  key={category.value}
                  onClick={() => setSelectedMetric(category.value)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl transition-all duration-300 whitespace-nowrap ${
                    selectedMetric === category.value
                      ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-700 hover:bg-white/50 hover:shadow-md'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    selectedMetric === category.value 
                      ? 'bg-white/20' 
                      : 'bg-gray-100'
                  }`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <span className="font-semibold">{category.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        {selectedMetric === 'overview' && renderOverview()}
        {selectedMetric === 'users' && renderUsers()}
        {selectedMetric === 'jobs' && renderJobs()}
        {selectedMetric === 'applications' && renderApplications()}
        {selectedMetric === 'system' && renderSystem()}
        {selectedMetric === 'geographic' && renderGeographic()}
        {selectedMetric === 'performance' && renderPerformance()}
      </div>
    </div>
  )
}

export default AdminAnalytics
