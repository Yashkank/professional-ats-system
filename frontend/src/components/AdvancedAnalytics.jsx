import React, { useState, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import { format, subDays, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import {
  BarChart3, PieChart, TrendingUp, TrendingDown, Download, 
  Calendar, Filter, Users, Briefcase, Clock, Target, Award,
  ArrowUpRight, ArrowDownRight, Activity, Eye, CheckCircle, XCircle
} from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export default function AdvancedAnalytics({ 
  jobs = [], 
  applications = [], 
  onExportReport 
}) {
  const [dateRange, setDateRange] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('applications')
  const [isLoading, setIsLoading] = useState(false)

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date()
    switch (dateRange) {
      case '7d':
        return { start: subDays(now, 7), end: now }
      case '30d':
        return { start: subDays(now, 30), end: now }
      case '90d':
        return { start: subDays(now, 90), end: now }
      case '1y':
        return { start: subMonths(now, 12), end: now }
      default:
        return { start: subDays(now, 30), end: now }
    }
  }

  // Filter data based on date range
  const { start, end } = getDateRange()
  const filteredApplications = applications.filter(app => {
    const appDate = new Date(app.created_at)
    return appDate >= start && appDate <= end
  })

  const filteredJobs = jobs.filter(job => {
    const jobDate = new Date(job.created_at)
    return jobDate >= start && jobDate <= end
  })

  // Calculate comprehensive metrics
  const calculateMetrics = () => {
    const totalJobs = filteredJobs.length
    const activeJobs = filteredJobs.filter(job => job.status === 'active').length
    const totalApplications = filteredApplications.length
    const pendingApplications = filteredApplications.filter(app => app.status === 'pending').length
    const acceptedApplications = filteredApplications.filter(app => app.status === 'accepted').length
    const rejectedApplications = filteredApplications.filter(app => app.status === 'rejected').length

    // Calculate rates
    const applicationRate = totalJobs > 0 ? (totalApplications / totalJobs) : 0
    const acceptanceRate = totalApplications > 0 ? (acceptedApplications / totalApplications) : 0
    const rejectionRate = totalApplications > 0 ? (rejectedApplications / totalApplications) : 0

    // Calculate time metrics
    const avgResponseTime = calculateAvgResponseTime()
    const timeToHire = calculateTimeToHire()

    // Calculate trends (comparing with previous period)
    const previousPeriod = getPreviousPeriodMetrics()
    const applicationTrend = calculateTrend(totalApplications, previousPeriod.applications)
    const acceptanceTrend = calculateTrend(acceptanceRate, previousPeriod.acceptanceRate)

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications,
      rejectedApplications,
      applicationRate: Math.round(applicationRate * 100),
      acceptanceRate: Math.round(acceptanceRate * 100),
      rejectionRate: Math.round(rejectionRate * 100),
      avgResponseTime,
      timeToHire,
      applicationTrend,
      acceptanceTrend
    }
  }

  const calculateAvgResponseTime = () => {
    // Mock calculation - in real app, this would be based on actual response times
    return Math.round(Math.random() * 3 + 1) // 1-4 days
  }

  const calculateTimeToHire = () => {
    // Mock calculation - in real app, this would be based on actual hire times
    return Math.round(Math.random() * 14 + 7) // 7-21 days
  }

  const getPreviousPeriodMetrics = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365
    const prevStart = subDays(start, days)
    const prevEnd = subDays(end, days)
    
    const prevApplications = applications.filter(app => {
      const appDate = new Date(app.created_at)
      return appDate >= prevStart && appDate <= prevEnd
    })
    
    const prevAccepted = prevApplications.filter(app => app.status === 'accepted').length
    const prevAcceptanceRate = prevApplications.length > 0 ? (prevAccepted / prevApplications.length) : 0
    
    return {
      applications: prevApplications.length,
      acceptanceRate: prevAcceptanceRate
    }
  }

  const calculateTrend = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  // Generate chart data
  const generateApplicationsOverTimeData = () => {
    const days = eachDayOfInterval({ start, end })
    const labels = days.map(day => format(day, 'MMM dd'))
    
    const applicationsByDay = days.map(day => {
      return filteredApplications.filter(app => {
        const appDate = new Date(app.created_at)
        return format(appDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      }).length
    })

    return {
      labels,
      datasets: [
        {
          label: 'Applications',
          data: applicationsByDay,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  }

  const generateStatusDistributionData = () => {
    const metrics = calculateMetrics()
    return {
      labels: ['Pending', 'Accepted', 'Rejected'],
      datasets: [
        {
          data: [metrics.pendingApplications, metrics.acceptedApplications, metrics.rejectedApplications],
          backgroundColor: [
            'rgb(251, 191, 36)', // Yellow for pending
            'rgb(34, 197, 94)',  // Green for accepted
            'rgb(239, 68, 68)'   // Red for rejected
          ],
          borderWidth: 0
        }
      ]
    }
  }

  const generateJobPerformanceData = () => {
    const jobStats = filteredJobs.map(job => {
      const jobApplications = filteredApplications.filter(app => app.job_id === job.id)
      return {
        title: job.title,
        applications: jobApplications.length,
        accepted: jobApplications.filter(app => app.status === 'accepted').length
      }
    }).sort((a, b) => b.applications - a.applications).slice(0, 10)

    return {
      labels: jobStats.map(job => job.title.length > 20 ? job.title.substring(0, 20) + '...' : job.title),
      datasets: [
        {
          label: 'Applications',
          data: jobStats.map(job => job.applications),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1
        },
        {
          label: 'Accepted',
          data: jobStats.map(job => job.accepted),
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }
      ]
    }
  }

  const metrics = calculateMetrics()

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  }

  const handleExportReport = () => {
    if (onExportReport) {
      onExportReport({
        dateRange,
        metrics,
        applications: filteredApplications,
        jobs: filteredJobs
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
          <p className="text-gray-600">Comprehensive insights and performance metrics</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Date Range Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportReport}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalApplications}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            {metrics.applicationTrend >= 0 ? (
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+{metrics.applicationTrend}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span>{metrics.applicationTrend}%</span>
              </div>
            )}
            <span className="text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Acceptance Rate</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.acceptanceRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            {metrics.acceptanceTrend >= 0 ? (
              <div className="flex items-center text-green-600">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                <span>+{metrics.acceptanceTrend}%</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <ArrowDownRight className="h-4 w-4 mr-1" />
                <span>{metrics.acceptanceTrend}%</span>
              </div>
            )}
            <span className="text-gray-500 ml-2">vs previous period</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.avgResponseTime} days</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span>-0.5 days</span>
            <span className="text-gray-500 ml-2">improvement</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Time to Hire</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.timeToHire} days</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-green-600">
            <ArrowDownRight className="h-4 w-4 mr-1" />
            <span>-2 days</span>
            <span className="text-gray-500 ml-2">improvement</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Applications Over Time */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Applications Over Time</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Applications</span>
            </div>
          </div>
          <div className="h-80">
            <Line data={generateApplicationsOverTimeData()} options={chartOptions} />
          </div>
        </div>

        {/* Application Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Application Status Distribution</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Accepted</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Rejected</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <Doughnut data={generateStatusDistributionData()} options={doughnutOptions} />
          </div>
        </div>
      </div>

      {/* Job Performance Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Performing Jobs</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Total Applications</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Accepted</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <Bar data={generateJobPerformanceData()} options={chartOptions} />
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Metrics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{metrics.applicationRate}%</div>
              <div className="text-sm text-gray-500">Application Rate</div>
              <div className="text-xs text-gray-400 mt-1">Applications per job posting</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{metrics.acceptanceRate}%</div>
              <div className="text-sm text-gray-500">Acceptance Rate</div>
              <div className="text-xs text-gray-400 mt-1">Accepted applications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{metrics.rejectionRate}%</div>
              <div className="text-sm text-gray-500">Rejection Rate</div>
              <div className="text-xs text-gray-400 mt-1">Rejected applications</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{metrics.activeJobs}</div>
              <div className="text-sm text-gray-500">Active Jobs</div>
              <div className="text-xs text-gray-400 mt-1">Currently open positions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{metrics.pendingApplications}</div>
              <div className="text-sm text-gray-500">Pending Review</div>
              <div className="text-xs text-gray-400 mt-1">Awaiting decision</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">{metrics.timeToHire}</div>
              <div className="text-sm text-gray-500">Days to Hire</div>
              <div className="text-xs text-gray-400 mt-1">Average hiring time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
