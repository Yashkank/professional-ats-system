import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { jobAPI, applicationAPI, candidateAPI } from '../services/api'
import ApplicationTimeline from '../components/ApplicationTimeline'
import JobRecommendations from '../components/JobRecommendations'
import ProfileStrengthMeter from '../components/ProfileStrengthMeter'
import SavedJobsAlerts from '../components/SavedJobsAlerts'
import SmartApplicationForm from '../components/SmartApplicationForm'
import AIPersonalization from '../components/AIPersonalization'
import ProfileEditor from '../components/ProfileEditor'
import { 
  Search, Briefcase, FileText, Clock, CheckCircle, XCircle, Eye, X, 
  MapPin, Building, DollarSign, Calendar, Bell, Settings, User, 
  Brain, Bookmark, TrendingUp, ChevronRight, Star, Plus, Filter,
  MessageSquare, Phone, Video, AlertCircle, CheckCircle2, RefreshCw, Download
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  })
  const [recentApplications, setRecentApplications] = useState([])
  const [featuredJobs, setFeaturedJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [showSmartApplicationForm, setShowSmartApplicationForm] = useState(false)
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    resume_url: ''
  })

  // Enhanced features state
  const [profileAnalysis, setProfileAnalysis] = useState(null)
  const [savedJobsData, setSavedJobsData] = useState([])
  const [jobAlertsData, setJobAlertsData] = useState([])
  // Navigation for core sections
  const [activeSection, setActiveSection] = useState('overview')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileSettings, setShowProfileSettings] = useState(false)
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [profileEditorTab, setProfileEditorTab] = useState('basic')
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
    
    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.log('⚠️ Fallback timeout triggered - stopping loading state')
      setIsLoading(false)
      toast.error('Loading took too long. Please refresh the page.')
    }, 15000) // 15 second fallback
    
    return () => clearTimeout(fallbackTimeout)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      console.log('🔄 Starting dashboard data fetch...')
      
      // Add timeout to prevent hanging
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        console.log('⏰ Request timeout - aborting')
        controller.abort()
      }, 10000) // 10 second timeout
      
      console.log('📡 Making API calls...')
      
      // Fetch applications and jobs with timeout
      const [applicationsResponse, jobsResponse] = await Promise.all([
        applicationAPI.getApplications({ signal: controller.signal }),
        jobAPI.getJobs({ signal: controller.signal })
      ])

      clearTimeout(timeoutId)
      console.log('📡 API calls completed')
      
      const applications = applicationsResponse.data || []
      const jobs = jobsResponse.data || []

      // Fetch candidate feature data (no abort to avoid interfering with core load)
      try {
        const [profileRes, savedRes, alertsRes] = await Promise.all([
          candidateAPI.getProfileAnalysis(),
          candidateAPI.getSavedJobs(),
          candidateAPI.getJobAlerts(),
        ])
        setProfileAnalysis(profileRes.data || null)
        setSavedJobsData(savedRes.data || [])
        setJobAlertsData(alertsRes.data || [])
      } catch (e) {
        console.warn('⚠️ Optional candidate features failed to load', e?.response?.status)
      }

      console.log('✅ Dashboard data fetched:', { 
        applications: applications.length, 
        jobs: jobs.length,
        applicationsData: applications,
        jobsData: jobs
      })

      // Calculate stats
      const totalApplications = applications.length
      const pendingApplications = applications.filter(app => app.status === 'pending').length
      const acceptedApplications = applications.filter(app => app.status === 'accepted').length
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length

      console.log('📊 Stats calculated:', { totalApplications, pendingApplications, acceptedApplications, rejectedApplications })

      setStats({ totalApplications, pendingApplications, acceptedApplications, rejectedApplications })
      setRecentApplications(applications.slice(0, 5))
      // Only show active jobs from the database
      setFeaturedJobs(jobs.filter(job => job.status === 'active').slice(0, 3))
      setLastUpdated(new Date())
      
      console.log('✅ Dashboard state updated successfully')
    } catch (error) {
      console.error('❌ Dashboard fetch error:', error)
      
      if (error.name === 'AbortError') {
        toast.error('Request timed out. Please try again.')
        console.error('⏰ Dashboard data fetch timed out')
      } else {
        toast.error('Failed to fetch dashboard data')
        console.error('❌ Dashboard data fetch error:', error)
        console.error('Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
      }
      
      // Set default values to prevent UI freezing
      setStats({ totalApplications: 0, pendingApplications: 0, acceptedApplications: 0, rejectedApplications: 0 })
      setRecentApplications([])
      setFeaturedJobs([])
    } finally {
      console.log('🏁 Setting loading to false')
      setIsLoading(false)
    }
  }

  const handleViewJobDetails = (job) => {
    setSelectedJob(job)
    setShowJobModal(true)
  }

  const closeJobModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
  }

  const handleApplyToJob = (job) => {
    setSelectedJob(job)
    setShowSmartApplicationForm(true)
  }

  const handleExportApplications = () => {
    try {
      // Prepare data for export
      const exportData = recentApplications.map(app => ({
        'Job Title': app.job?.title || 'N/A',
        'Company': app.job?.company || 'N/A',
        'Applied Date': new Date(app.created_at).toLocaleDateString(),
        'Status': app.status.charAt(0).toUpperCase() + app.status.slice(1),
        'Location': app.job?.location || 'N/A',
        'Salary': app.job?.salary ? `$${app.job.salary.toLocaleString()}` : 'N/A'
      }))

      // Convert to CSV
      const headers = Object.keys(exportData[0] || {})
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => headers.map(header => `"${row[header]}"`).join(','))
      ].join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `my-applications-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Exported ${exportData.length} applications`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export applications')
    }
  }

  const handleApplicationSubmit = async (e) => {
    e.preventDefault()
    
    try {
      console.log('🚀 Submitting application:', {
        job_id: selectedJob.id,
        cover_letter: applicationData.cover_letter,
        resume_url: applicationData.resume_url
      })
      
      const response = await applicationAPI.createApplication({
        job_id: selectedJob.id,
        cover_letter: applicationData.cover_letter,
        resume_url: applicationData.resume_url
      })
      
      console.log('✅ Application submitted successfully:', response.data)
      toast.success('Application submitted successfully!')
      setShowApplicationForm(false)
      setApplicationData({ cover_letter: '', resume_url: '' })
      fetchDashboardData() // Refresh data to show new application
    } catch (error) {
      console.error('❌ Application submission error:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to submit application: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleSmartApplicationSubmit = async (applicationData) => {
    try {
      console.log('🚀 Submitting smart application:', applicationData)
      
      const response = await applicationAPI.createApplication(applicationData)
      
      console.log('✅ Smart application submitted successfully:', response.data)
      toast.success('Application submitted successfully!')
      setShowSmartApplicationForm(false)
      setSelectedJob(null)
      fetchDashboardData() // Refresh data to show new application
    } catch (error) {
      console.error('❌ Smart application submission error:', error)
      toast.error('Failed to submit application: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleSaveDraft = async (draftData) => {
    try {
      console.log('💾 Saving draft:', draftData)
      // Implement draft saving logic here
      toast.success('Draft saved successfully!')
    } catch (error) {
      console.error('❌ Draft save error:', error)
      toast.error('Failed to save draft')
    }
  }

  const handleApplicationChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    })
  }

  const handleProfileUpdate = (updatedProfile) => {
    setProfileAnalysis(updatedProfile)
    // Here you would typically save to backend
    console.log('Profile updated:', updatedProfile)
    toast.success('Profile updated successfully!')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto shadow-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard</h2>
            <p className="text-gray-600">Fetching your applications and job opportunities</p>
            <div className="flex items-center justify-center space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Gradient Header - Matching Admin & Recruiter Style */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-none sm:rounded-2xl shadow-xl sm:m-6 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center shadow-sm">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Candidate Dashboard</h1>
                  <p className="text-blue-100 mt-1">Welcome back, {user?.full_name || 'Candidate'}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-3 text-sm text-blue-200">
                <Clock className="h-4 w-4" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowNotifications(true)}
                className="relative px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                <span className="hidden sm:inline">Notifications</span>
              </button>
              
              <button
                onClick={() => {
                  fetchDashboardData()
                  toast.success('Dashboard refreshed')
                }}
                disabled={isLoading}
                className="px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              
              <button
                onClick={() => setShowProfileSettings(true)}
                className="px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
                title="Profile Settings"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </button>
              
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
              >
                <Search className="h-5 w-5 mr-2" />
                <span>Browse Jobs</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Core Navigation */}
        <div className="mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-1 shadow-sm">
            <div className="flex space-x-1">
              {[
                { id: 'overview', label: 'Overview', icon: FileText },
                { id: 'ai', label: 'AI Insights', icon: Brain },
                { id: 'applications', label: 'Applications', icon: CheckCircle2 },
                { id: 'saved', label: 'Saved Jobs & Alerts', icon: Bookmark }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === id 
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeSection === 'overview' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Applications</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalApplications}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingApplications}</p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Accepted</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.acceptedApplications}</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Rejected</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.rejectedApplications}</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <XCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Job Opportunities */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Featured Jobs</h2>
                  <p className="text-gray-600">Discover your next career opportunity</p>
                </div>
                <Link 
                  to="/jobs" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <span>View all jobs</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              {featuredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all duration-200 cursor-pointer bg-gradient-to-br from-white to-gray-50/50" onClick={() => handleViewJobDetails(job)}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {job.title}
                          </h3>
                          <p className="text-blue-600 font-medium">
                            {job.company?.name || job.company_name || 'Unknown Company'}
                          </p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="h-4 w-4 mr-2" />
                          <span>{job.salary_range || 'Salary not specified'}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {job.description?.substring(0, 100)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1">
                          <span>View Details</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Featured Jobs</h3>
                  <p className="text-gray-600 mb-6">Check back later for new opportunities</p>
                  <Link 
                    to="/jobs" 
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center space-x-2 shadow-sm hover:shadow-md"
                  >
                    <Search className="h-4 w-4" />
                    <span>Browse All Jobs</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Application Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Application Timeline</h2>
                  <p className="text-gray-600">Track your application progress</p>
                </div>
                <Link 
                  to="/applications" 
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md"
                >
                  <span>View all applications</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
              
              <ApplicationTimeline applications={recentApplications} />
            </div>

            {/* AI Job Recommendations */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">AI Job Recommendations</h2>
                  <p className="text-gray-600">Personalized job matches based on your profile</p>
                </div>
              </div>
              <JobRecommendations
                candidateProfile={{
                  skills: profileAnalysis?.skills || [],
                  experience: profileAnalysis?.experience || [],
                }}
                onSaveJob={async (jobId, saved) => {
                  try {
                    if (saved) {
                      await candidateAPI.saveJob(jobId)
                    } else {
                      await candidateAPI.removeSavedJob(jobId)
                    }
                    fetchDashboardData()
                  } catch (e) {
                    toast.error('Failed to update saved job')
                  }
                }}
                onApplyJob={(job) => {
                  setSelectedJob(job)
                  setShowSmartApplicationForm(true)
                }}
              />
            </div>

            {/* Profile Strength */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Strength</h2>
              <ProfileStrengthMeter 
                profile={profileAnalysis || {}} 
                onProfileUpdate={handleProfileUpdate}
              />
            </div>
          </div>
        )}

        {/* AI Insights Section */}
        {activeSection === 'ai' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">AI Insights</h2>
                <p className="text-gray-600">Smart recommendations powered by artificial intelligence</p>
              </div>
              <AIPersonalization candidateProfile={profileAnalysis} applications={recentApplications} />
            </div>
          </div>
        )}

        {/* Applications Section */}
        {activeSection === 'applications' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="flex justify-between items-start mb-8">
                <div className="text-center flex-1">
                  <div className="h-16 w-16 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Application Management</h2>
                  <p className="text-gray-600">Track and manage your job applications</p>
                </div>
                <button
                  onClick={handleExportApplications}
                  disabled={recentApplications.length === 0}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Export applications to CSV"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </button>
              </div>
              <ApplicationTimeline applications={recentApplications} />
            </div>
          </div>
        )}

        {/* Saved Jobs & Alerts Section */}
        {activeSection === 'saved' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Saved Jobs & Alerts</h2>
                <p className="text-gray-600">Manage your saved jobs and job alerts</p>
              </div>
              <SavedJobsAlerts
                onApplyJob={(job) => {
                  setSelectedJob(job)
                  setShowSmartApplicationForm(true)
                }}
                onRemoveJob={async (jobId) => {
                  try {
                    await candidateAPI.removeSavedJob(jobId)
                    fetchDashboardData()
                  } catch (e) {
                    toast.error('Failed to remove saved job')
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
              <button
                onClick={closeJobModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Job Header */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-1" />
                        {selectedJob.company?.name || selectedJob.company_name || 'Unknown Company'}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-1" />
                        {selectedJob.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(selectedJob.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    selectedJob.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedJob.status}
                  </span>
                </div>
              </div>

              {/* Job Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Job Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Experience Level</p>
                      <p className="text-gray-900 capitalize">{selectedJob.experience_level}</p>
                    </div>
                    {selectedJob.salary_range && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Salary Range</p>
                        <p className="text-gray-900">{selectedJob.salary_range}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">Posted Date</p>
                      <p className="text-gray-900">
                        {new Date(selectedJob.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        closeJobModal()
                        handleApplyToJob(selectedJob)
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 shadow-sm hover:shadow-md"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Apply Now</span>
                    </button>
                    <button
                      onClick={closeJobModal}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Job Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Requirements</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No new notifications</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Settings Panel */}
      {showProfileSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
              <button
                onClick={() => setShowProfileSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">Edit your profile information</p>
                <button
                  onClick={() => {
                    setShowProfileSettings(false)
                    setProfileEditorTab('basic')
                    setShowProfileEditor(true)
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Apply to {selectedJob.title}
              </h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleApplicationSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Letter
                </label>
                <textarea
                  name="cover_letter"
                  rows={6}
                  value={applicationData.cover_letter}
                  onChange={handleApplicationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your cover letter here..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume URL (Optional)
                </label>
                <input
                  type="url"
                  name="resume_url"
                  value={applicationData.resume_url}
                  onChange={handleApplicationChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/your-resume.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can upload your resume to a file sharing service and paste the link here
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow-md">
                  <Briefcase className="h-4 w-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Application Form */}
      {showSmartApplicationForm && selectedJob && (
        <SmartApplicationForm
          job={selectedJob}
          onClose={() => {
            setShowSmartApplicationForm(false)
            setSelectedJob(null)
          }}
          onSubmit={handleSmartApplicationSubmit}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditor
          profile={profileAnalysis || {}}
          onClose={() => setShowProfileEditor(false)}
          onSave={handleProfileUpdate}
          initialTab={profileEditorTab}
        />
      )}
    </div>
  )
}





















