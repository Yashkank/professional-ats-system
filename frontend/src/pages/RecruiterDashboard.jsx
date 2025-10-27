import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { jobAPI, applicationAPI } from '../services/api'
import {
  Plus, Briefcase, Users, TrendingUp, Eye, Building,
  Calendar, MapPin, DollarSign, Clock, CheckCircle,
  XCircle, AlertCircle, Edit, Trash2, Filter,
  Search, BarChart3, PieChart, Activity, ArrowUpRight,
  ArrowDownRight, MoreHorizontal, ExternalLink, User,
  MessageSquare, Brain, Mail, Menu, X, Linkedin, Bell, RefreshCw,
  Zap, FileText
} from 'lucide-react'
import toast from 'react-hot-toast'
import AdvancedAnalytics from '../components/AdvancedAnalytics'
import RealTimeNotifications from '../components/RealTimeNotifications'
import CandidateProfile from '../components/CandidateProfile'
import InterviewScheduling from '../components/InterviewScheduling'
import InterviewFeedback from '../components/InterviewFeedback'
import EmailNotifications from '../components/EmailNotifications'
import AdvancedSearch from '../components/AdvancedSearch'
import BulkActions from '../components/BulkActions'
import SmartSuggestions from '../components/SmartSuggestions'
import AssignmentSystem from '../components/AssignmentSystem'
import TeamComments from '../components/TeamComments'
import ActivityFeed from '../components/ActivityFeed'
import AIMatching from '../pages/AIMatching'
import EmailCampaigns from '../components/EmailCampaigns'
import LinkedInIntegration from '../components/LinkedInIntegration'
import PerformanceMetrics from '../components/PerformanceMetrics'
import ReportsSystem from '../components/ReportsSystem'
import { generatePDFReport, generateExcelReport } from '../utils/reportExporter'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  
  // Dashboard state
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  
  // Stats and data
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    recentApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0
  })
  
  const [recentJobs, setRecentJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [allJobs, setAllJobs] = useState([])
  const [allApplications, setAllApplications] = useState([])
  
  // Filters and search
  const [jobFilter, setJobFilter] = useState('all')
  const [applicationFilter, setApplicationFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Modals
  const [showJobModal, setShowJobModal] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [showCandidateProfile, setShowCandidateProfile] = useState(false)
  const [showInterviewFeedback, setShowInterviewFeedback] = useState(false)
  const [showEmailNotifications, setShowEmailNotifications] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [selectedInterview, setSelectedInterview] = useState(null)

  // Search and bulk actions
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [isAllSelected, setIsAllSelected] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [currentSearch, setCurrentSearch] = useState(null)

  // Team collaboration
  const [teamMembers, setTeamMembers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [activities, setActivities] = useState([])
  const [comments, setComments] = useState([])
  const [teamSubTab, setTeamSubTab] = useState('assignments') // Separate state for team sub-tabs
  
  // Mobile optimization state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Last updated timestamp
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Mobile detection and responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])


  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch jobs and applications
      const [jobsResponse, applicationsResponse] = await Promise.all([
        jobAPI.getJobs(),
        applicationAPI.getApplications()
      ])

      const jobs = jobsResponse.data || []
      const applications = applicationsResponse.data || []

      // Calculate comprehensive stats
      const totalJobs = jobs.length
      const activeJobs = jobs.filter(job => job.status === 'active').length
      const totalApplications = applications.length
      const recentApplications = applications.filter(app => {
        const appDate = new Date(app.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return appDate > weekAgo
      }).length
      const pendingApplications = applications.filter(app => app.status === 'pending').length
      const acceptedApplications = applications.filter(app => app.status === 'accepted').length
      const rejectedApplications = applications.filter(app => app.status === 'rejected').length

      setStats({ 
        totalJobs, 
        activeJobs, 
        totalApplications, 
        recentApplications,
        pendingApplications,
        acceptedApplications,
        rejectedApplications
      })
      
      setAllJobs(jobs)
      setAllApplications(applications)
      setRecentJobs(jobs.slice(0, 5))
      setRecentApplications(applications.slice(0, 5))
      setLastUpdated(new Date())
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
      console.error('Dashboard data fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleJobStatusUpdate = async (jobId, newStatus) => {
    try {
      await jobAPI.updateJob(jobId, { status: newStatus })
      toast.success(`Job ${newStatus} successfully`)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update job status')
    }
  }

  const handleApplicationStatusUpdate = async (applicationId, newStatus) => {
    try {
      await applicationAPI.updateApplication(applicationId, { status: newStatus })
      toast.success(`Application ${newStatus} successfully`)
      fetchDashboardData()
    } catch (error) {
      toast.error('Failed to update application status')
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobAPI.deleteJob(jobId)
        toast.success('Job deleted successfully')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete job')
      }
    }
  }

  const handleExportReport = async (data) => {
    try {
      // Show export options
      const exportType = window.confirm('Export as PDF? (Cancel for Excel)') ? 'pdf' : 'excel'
      
      if (exportType === 'pdf') {
        await generatePDFReport(data)
        toast.success('PDF report exported successfully')
      } else {
        await generateExcelReport(data)
        toast.success('Excel report exported successfully')
      }
    } catch (error) {
      toast.error('Failed to export report')
      console.error('Export error:', error)
    }
  }

  const handleViewCandidate = (application) => {
    setSelectedCandidate(application)
    setShowCandidateProfile(true)
  }

  const handleCandidateStatusUpdate = async (candidateId, newStatus) => {
    try {
      await applicationAPI.updateApplication(candidateId, { status: newStatus })
      toast.success(`Application ${newStatus} successfully`)
      fetchDashboardData()
      setShowCandidateProfile(false)
    } catch (error) {
      toast.error('Failed to update application status')
    }
  }

  const handleAddCandidateNote = (candidateId, note) => {
    // In a real app, this would save to the backend
    console.log('Adding note for candidate:', candidateId, note)
    toast.success('Note added successfully')
  }

  const handleDownloadResume = (resumeUrl) => {
    if (resumeUrl) {
      // In a real app, this would trigger a download
      window.open(resumeUrl, '_blank')
      toast.success('Resume download started')
    } else {
      toast.error('No resume available')
    }
  }

  const handleSendMessage = (candidateId) => {
    // In a real app, this would open a messaging interface
    console.log('Sending message to candidate:', candidateId)
    toast.success('Message sent successfully')
  }

  const handleScheduleInterview = async (interviewData) => {
    try {
      // In a real app, this would save to the backend
      console.log('Scheduling interview:', interviewData)
      toast.success('Interview scheduled successfully')
    } catch (error) {
      toast.error('Failed to schedule interview')
    }
  }

  const handleUpdateInterview = async (interviewId, updates) => {
    try {
      // In a real app, this would update in the backend
      console.log('Updating interview:', interviewId, updates)
      toast.success('Interview updated successfully')
    } catch (error) {
      toast.error('Failed to update interview')
    }
  }

  const handleCancelInterview = async (interviewId) => {
    try {
      // In a real app, this would cancel in the backend
      console.log('Cancelling interview:', interviewId)
      toast.success('Interview cancelled successfully')
    } catch (error) {
      toast.error('Failed to cancel interview')
    }
  }

  const handleSendReminder = async (interview) => {
    try {
      // In a real app, this would send email/SMS reminder
      console.log('Sending reminder for interview:', interview)
      toast.success('Reminder sent successfully')
    } catch (error) {
      toast.error('Failed to send reminder')
    }
  }

  const handleSubmitFeedback = async (interviewId, feedback) => {
    try {
      // In a real app, this would save feedback to the backend
      console.log('Submitting feedback for interview:', interviewId, feedback)
      toast.success('Feedback submitted successfully')
      setShowInterviewFeedback(false)
    } catch (error) {
      toast.error('Failed to submit feedback')
    }
  }

  const handleSaveFeedbackDraft = async (interviewId, feedback) => {
    try {
      // In a real app, this would save draft to the backend
      console.log('Saving feedback draft for interview:', interviewId, feedback)
      toast.success('Draft saved successfully')
    } catch (error) {
      toast.error('Failed to save draft')
    }
  }

  const handleSendEmail = async (emailData) => {
    try {
      // In a real app, this would send email via backend
      console.log('Sending email:', emailData)
      toast.success('Email sent successfully')
    } catch (error) {
      toast.error('Failed to send email')
    }
  }

  // Search and bulk actions
  const handleSearch = (searchData) => {
    console.log('Performing search:', searchData)
    setCurrentSearch(searchData)
    
    // Mock search results - in real app, this would come from API
    const mockResults = allApplications.filter(app => {
      const query = searchData.query.toLowerCase()
      return app.candidate_name.toLowerCase().includes(query) ||
             app.job?.title.toLowerCase().includes(query) ||
             (app.cover_letter && app.cover_letter.toLowerCase().includes(query))
    })
    
    setSearchResults(mockResults)
    toast.success(`Found ${mockResults.length} candidates`)
  }

  const handleSaveSearch = async (searchData) => {
    try {
      // In a real app, this would save to backend
      console.log('Saving search:', searchData)
      toast.success('Search saved successfully')
    } catch (error) {
      toast.error('Failed to save search')
    }
  }

  const handleLoadSearch = (searchData) => {
    setCurrentSearch(searchData)
    handleSearch(searchData)
  }

  const handleDeleteSearch = async (searchId) => {
    try {
      // In a real app, this would delete from backend
      console.log('Deleting search:', searchId)
      toast.success('Search deleted successfully')
    } catch (error) {
      toast.error('Failed to delete search')
    }
  }

  const handleSelectAll = (selectAll) => {
    setIsAllSelected(selectAll)
    if (selectAll) {
      setSelectedCandidates(allApplications.map(app => app.id))
    } else {
      setSelectedCandidates([])
    }
  }

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidates(prev => {
      if (prev.includes(candidateId)) {
        return prev.filter(id => id !== candidateId)
      } else {
        return [...prev, candidateId]
      }
    })
  }

  const handleBulkAction = async (actionId, selectedItems, customMessage) => {
    try {
      console.log('Performing bulk action:', actionId, selectedItems, customMessage)
      
      switch (actionId) {
        case 'email':
          toast.success(`Email sent to ${selectedItems.length} candidates`)
          break
        case 'status_update':
          toast.success(`Status updated for ${selectedItems.length} candidates`)
          break
        case 'schedule_interview':
          toast.success(`Interviews scheduled for ${selectedItems.length} candidates`)
          break
        case 'export':
          toast.success(`Exported data for ${selectedItems.length} candidates`)
          break
        case 'add_tags':
          toast.success(`Tags added to ${selectedItems.length} candidates`)
          break
        case 'archive':
          toast.success(`Archived ${selectedItems.length} candidates`)
          break
        case 'delete':
          toast.success(`Deleted ${selectedItems.length} candidates`)
          break
        default:
          toast.success(`Action completed for ${selectedItems.length} candidates`)
      }
      
      // Clear selection after action
      setSelectedCandidates([])
      setIsAllSelected(false)
    } catch (error) {
      toast.error('Failed to perform bulk action')
    }
  }

  const handleSelectSuggestion = (candidate) => {
    console.log('Selected candidate from AI suggestions:', candidate)
    toast.success(`Selected ${candidate.name}`)
  }

  const handleSaveSuggestion = (suggestion) => {
    console.log('Saved suggestion:', suggestion)
    toast.success('Suggestion saved to favorites')
  }

  const handleRejectSuggestion = (suggestionId) => {
    console.log('Rejected suggestion:', suggestionId)
    toast.success('Suggestion removed')
  }

  // Team collaboration functions

  const handleAssignCandidate = async (candidateId, assigneeId, assignment) => {
    try {
      console.log('Assigning candidate:', candidateId, assigneeId, assignment)
      toast.success('Candidate assigned successfully')
    } catch (error) {
      toast.error('Failed to assign candidate')
    }
  }

  const handleAssignJob = async (jobId, assigneeId, assignment) => {
    try {
      console.log('Assigning job:', jobId, assigneeId, assignment)
      toast.success('Job assigned successfully')
    } catch (error) {
      toast.error('Failed to assign job')
    }
  }

  const handleReassign = async (assignmentId, newAssigneeId) => {
    try {
      console.log('Reassigning:', assignmentId, newAssigneeId)
      toast.success('Assignment updated successfully')
    } catch (error) {
      toast.error('Failed to reassign')
    }
  }

  const handleUnassign = async (assignmentId) => {
    try {
      console.log('Unassigning:', assignmentId)
      toast.success('Assignment cancelled successfully')
    } catch (error) {
      toast.error('Failed to unassign')
    }
  }

  const handleAddComment = async (comment) => {
    try {
      console.log('Adding comment:', comment)
      toast.success('Comment added successfully')
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      console.log('Updating comment:', commentId, newContent)
      toast.success('Comment updated successfully')
    } catch (error) {
      toast.error('Failed to update comment')
    }
  }

  const handleDeleteComment = async (commentId) => {
    try {
      console.log('Deleting comment:', commentId)
      toast.success('Comment deleted successfully')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const handleReplyToComment = async (commentId, reply) => {
    try {
      console.log('Replying to comment:', commentId, reply)
      toast.success('Reply added successfully')
    } catch (error) {
      toast.error('Failed to add reply')
    }
  }

  const handleLoadMoreActivities = async () => {
    try {
      console.log('Loading more activities')
      // In real app, this would load more activities from API
    } catch (error) {
      toast.error('Failed to load activities')
    }
  }

  const handleFilterActivities = async (filter) => {
    try {
      console.log('Filtering activities:', filter)
      // In real app, this would filter activities
    } catch (error) {
      toast.error('Failed to filter activities')
    }
  }

  const handleSearchActivities = async (searchTerm) => {
    try {
      console.log('Searching activities:', searchTerm)
      // In real app, this would search activities
    } catch (error) {
      toast.error('Failed to search activities')
    }
  }

  const filteredJobs = allJobs.filter(job => {
    const matchesFilter = jobFilter === 'all' || job.status === jobFilter
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.company?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const filteredApplications = allApplications.filter(app => {
    const matchesFilter = applicationFilter === 'all' || app.status === applicationFilter
    const matchesSearch = searchTerm === '' || 
      app.candidate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.job?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Gradient Style like Admin Dashboard */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-none sm:rounded-2xl shadow-xl sm:m-6 mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left side - Title and info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                {isMobile && (
                  <button
                    onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                    className="p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
                  >
                    <Menu className="h-6 w-6" />
                  </button>
                )}
        <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">Recruiter Dashboard</h1>
                  <p className="text-blue-100 mt-1">Welcome back, {user?.full_name}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mt-3">
          {user?.company && (
                  <div className="flex items-center text-sm text-blue-200">
                    <Building className="h-4 w-4 mr-2" />
              {user.company.name}
                  </div>
          )}
                <div className="flex items-center text-sm text-blue-200">
                  <Clock className="h-4 w-4 mr-2" />
                  Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
              </div>
            </div>
            
            {/* Right side - Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <RealTimeNotifications 
                applications={allApplications}
                jobs={allJobs}
                onMarkAsRead={(id) => console.log('Marked as read:', id)}
                onClearAll={() => console.log('Cleared all notifications')}
              />
              
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
              
              {isMobile ? (
        <Link
          to="/jobs"
                  className="bg-white/20 text-white p-2 rounded-lg hover:bg-white/30 flex items-center"
        >
                  <Plus className="h-4 w-4" />
        </Link>
              ) : (
                <Link
                  to="/jobs"
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200 font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Post New Job
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <nav className={`flex ${isMobile ? 'flex-wrap gap-2' : 'space-x-8'}`}>
                {[
                  { id: 'overview', name: 'Overview', icon: BarChart3 },
                  { id: 'analytics', name: 'Analytics', icon: PieChart },
                  { id: 'performance', name: 'Performance', icon: Zap },
                  { id: 'jobs', name: 'Job Management', icon: Briefcase },
                  { id: 'applications', name: 'Applications', icon: Users },
                  { id: 'ai-matching', name: 'AI Matching', icon: Brain },
                  { id: 'interviews', name: 'Interviews', icon: Calendar },
                  { id: 'team', name: 'Team Collaboration', icon: Users },
                  { id: 'notifications', name: 'Notifications', icon: Bell },
                  { id: 'email-campaigns', name: 'Email Campaigns', icon: Mail },
                  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
                  { id: 'reports', name: 'Reports', icon: FileText }
                ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.name}</span>
                  <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
                </button>
              )
            })}
          </nav>
      </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'}`}>
            <div className="flex-shrink-0">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-blue-100 rounded-lg flex items-center justify-center`}>
                      <Briefcase className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-blue-600`} />
            </div>
            </div>
            <div className={`${isMobile ? 'mt-2' : 'ml-4'}`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Total Jobs</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{stats.totalJobs}</p>
            </div>
          </div>
        </div>

              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'}`}>
            <div className="flex-shrink-0">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-green-100 rounded-lg flex items-center justify-center`}>
                      <TrendingUp className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-green-600`} />
            </div>
            </div>
            <div className={`${isMobile ? 'mt-2' : 'ml-4'}`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Active Jobs</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{stats.activeJobs}</p>
            </div>
          </div>
        </div>

              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'}`}>
            <div className="flex-shrink-0">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-purple-100 rounded-lg flex items-center justify-center`}>
                      <Users className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-purple-600`} />
            </div>
            </div>
            <div className={`${isMobile ? 'mt-2' : 'ml-4'}`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Total Applications</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{stats.totalApplications}</p>
            </div>
          </div>
        </div>

              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'}`}>
            <div className="flex-shrink-0">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} bg-orange-100 rounded-lg flex items-center justify-center`}>
                      <Clock className={`${isMobile ? 'h-4 w-4' : 'h-6 w-6'} text-orange-600`} />
            </div>
            </div>
            <div className={`${isMobile ? 'mt-2' : 'ml-4'}`}>
              <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Recent Applications</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-gray-900`}>{stats.recentApplications}</p>
            </div>
          </div>
        </div>
      </div>

            {/* Application Status Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm">
                <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center justify-between'}`}>
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Pending</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-yellow-600`}>{stats.pendingApplications}</p>
                  </div>
                  <AlertCircle className={`${isMobile ? 'h-6 w-6 mt-2' : 'h-8 w-8'} text-yellow-500`} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm">
                <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center justify-between'}`}>
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Accepted</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>{stats.acceptedApplications}</p>
                  </div>
                  <CheckCircle className={`${isMobile ? 'h-6 w-6 mt-2' : 'h-8 w-8'} text-green-500`} />
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-6 shadow-sm">
                <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center justify-between'}`}>
                  <div>
                    <p className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>Rejected</p>
                    <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-red-600`}>{stats.rejectedApplications}</p>
                  </div>
                  <XCircle className={`${isMobile ? 'h-6 w-6 mt-2' : 'h-8 w-8'} text-red-500`} />
                </div>
              </div>
            </div>

            {/* Recent Jobs and Applications */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
      {/* Recent Jobs */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Job Postings</h2>
                    <Link to="/jobs" className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
                </div>
                <div className="p-6">
        {recentJobs.length > 0 ? (
                    <div className="space-y-4">
            {recentJobs.map((job) => (
                        <div key={job.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company?.name || 'Unknown Company'}</p>
                            <div className="flex items-center mt-2 text-xs text-gray-500">
                              <MapPin className="h-3 w-3 mr-1" />
                              {job.location || 'Location not specified'}
                              <Calendar className="h-3 w-3 ml-3 mr-1" />
                              {new Date(job.created_at).toLocaleDateString()}
                </div>
                </div>
                          <div className="flex items-center space-x-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    job.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {job.status}
                  </span>
                            <button
                              onClick={() => handleJobStatusUpdate(job.id, job.status === 'active' ? 'inactive' : 'active')}
                              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No jobs posted yet</p>
                    </div>
        )}
                </div>
      </div>

      {/* Recent Applications */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
                    <Link to="/applications" className="text-blue-600 hover:text-blue-500 text-sm font-medium flex items-center">
                      View all
                      <ArrowUpRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
                </div>
                <div className="p-3 sm:p-6">
        {recentApplications.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
            {recentApplications.map((application) => (
                        <div key={application.id} className={`${isMobile ? 'flex flex-col space-y-2' : 'flex justify-between items-center'} p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200`}>
                          <div className="flex-1">
                            <div className={`flex ${isMobile ? 'flex-col items-center text-center' : 'items-center'}`}>
                              <div className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} bg-blue-100 rounded-full flex items-center justify-center ${isMobile ? 'mb-2' : 'mr-3'}`}>
                                <User className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} text-blue-600`} />
                              </div>
                <div>
                  <h3 className={`${isMobile ? 'text-sm' : ''} font-medium text-gray-900`}>{application.candidate_name}</h3>
                                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600`}>{application.job?.title || 'Unknown Job'}</p>
                </div>
                            </div>
                            <div className={`flex items-center ${isMobile ? 'justify-center' : ''} mt-2 text-xs text-gray-500`}>
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(application.created_at).toLocaleDateString()}
                            </div>
                </div>
                          <div className={`flex items-center ${isMobile ? 'justify-center' : ''} space-x-2`}>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    application.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : application.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {application.status}
                  </span>
                            <button
                              onClick={() => setSelectedApplication(application)}
                              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No applications received yet</p>
                    </div>
        )}
      </div>
    </div>
            </div>
          </div>
        )}

        {/* Job Management Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            {/* Job Management Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Job Management</h2>
                <p className="text-gray-600">Manage your job postings and track performance</p>
              </div>
              <Link
                to="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Job
              </Link>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search jobs..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={jobFilter}
                    onChange={(e) => setJobFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Jobs</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Jobs ({filteredJobs.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            job.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-gray-600 mt-1">{job.company?.name || 'Unknown Company'}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location || 'Location not specified'}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Posted {new Date(job.created_at).toLocaleDateString()}
                          </div>
                          {job.salary_range && (
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {job.salary_range}
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2 line-clamp-2">{job.description}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleJobStatusUpdate(job.id, job.status === 'active' ? 'inactive' : 'active')}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          {job.status === 'active' ? <Eye className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredJobs.length === 0 && (
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No jobs found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            {/* Applications Header */}
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Application Management</h2>
                <p className="text-gray-600">Review and manage candidate applications</p>
              </div>
            </div>

            {/* Advanced Search */}
            <AdvancedSearch
              candidates={allApplications}
              jobs={allJobs}
              onSearch={handleSearch}
              onSaveSearch={handleSaveSearch}
              onLoadSearch={handleLoadSearch}
              onDeleteSearch={handleDeleteSearch}
            />

            {/* Bulk Actions */}
            {selectedCandidates.length > 0 && (
              <BulkActions
                selectedItems={selectedCandidates}
                onSelectAll={handleSelectAll}
                onSelectItem={handleSelectCandidate}
                onBulkAction={handleBulkAction}
                totalItems={allApplications.length}
                isAllSelected={isAllSelected}
                isIndeterminate={selectedCandidates.length > 0 && selectedCandidates.length < allApplications.length}
              />
            )}

            {/* Smart Suggestions */}
            {currentSearch && (
              <SmartSuggestions
                jobRequirements={currentSearch.filters}
                candidates={searchResults}
                onSelectCandidate={handleSelectSuggestion}
                onSaveSuggestion={handleSaveSuggestion}
                onRejectSuggestion={handleRejectSuggestion}
              />
            )}

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={applicationFilter}
                    onChange={(e) => setApplicationFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Applications</option>
                    <option value="pending">Pending</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Applications List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">All Applications ({filteredApplications.length})</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedCandidates.includes(application.id)}
                              onChange={() => handleSelectCandidate(application.id)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                            />
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                              <User className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="text-lg font-medium text-gray-900">{application.candidate_name}</h4>
                              <p className="text-gray-600">{application.job?.title || 'Unknown Job'}</p>
                            </div>
                          </div>
                          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            application.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : application.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {application.status}
                          </span>
                        </div>
                        <div className="flex items-center mt-3 text-sm text-gray-500 space-x-4">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Applied {new Date(application.created_at).toLocaleDateString()}
                          </div>
                          <div className="flex items-center">
                            <Building className="h-4 w-4 mr-1" />
                            {application.job?.company?.name || 'Unknown Company'}
                          </div>
                        </div>
                        {application.cover_letter && (
                          <p className="text-gray-600 mt-3 line-clamp-2">{application.cover_letter}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleViewCandidate(application)}
                          className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                        >
                          <User className="h-4 w-4 mr-1" />
                          View Profile
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApplicationStatusUpdate(application.id, 'accepted')}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleApplicationStatusUpdate(application.id, 'rejected')}
                              className="inline-flex items-center px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedApplication(application)}
                          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredApplications.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No applications found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Matching Tab */}
        {activeTab === 'ai-matching' && (
          <div className="space-y-6">
            <AIMatching />
          </div>
        )}

        {/* Email Campaigns Tab */}
        {activeTab === 'email-campaigns' && (
          <div className="space-y-6">
            <EmailCampaigns
              candidates={allApplications}
              jobs={allJobs}
              onCampaignSent={(campaign) => {
                console.log('Campaign sent:', campaign)
                toast.success(`Email campaign "${campaign.name}" sent successfully!`)
              }}
              onCampaignScheduled={(campaign, scheduledDate) => {
                console.log('Campaign scheduled:', campaign, scheduledDate)
                toast.success(`Email campaign "${campaign.name}" scheduled for ${scheduledDate.toLocaleString()}`)
              }}
            />
          </div>
        )}

        {/* LinkedIn Tab */}
        {activeTab === 'linkedin' && (
          <div className="space-y-6">
            <LinkedInIntegration
              jobs={allJobs}
              onImportCandidates={(candidates) => {
                console.log('Candidates imported from LinkedIn:', candidates)
                toast.success(`Successfully imported ${candidates.length} candidates from LinkedIn!`)
              }}
              onSaveCandidates={(candidates) => {
                console.log('Candidates saved:', candidates)
                toast.success(`Saved ${candidates.length} candidates to database!`)
              }}
            />
          </div>
        )}

        {/* Interviews Tab */}
        {activeTab === 'interviews' && (
          <div className="space-y-6">
            <InterviewScheduling
              candidates={allApplications}
              onScheduleInterview={handleScheduleInterview}
              onUpdateInterview={handleUpdateInterview}
              onCancelInterview={handleCancelInterview}
              onSendReminder={handleSendReminder}
            />
          </div>
        )}

            {/* Team Collaboration Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                {/* Team Collaboration Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Team Collaboration</h2>
                    <p className="text-gray-600">Manage your team and collaborate on hiring</p>
                  </div>
                </div>


                {/* Team Collaboration Tabs */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                      {[
                        { id: 'assignments', name: 'Assignments', icon: Briefcase },
                        { id: 'comments', name: 'Comments', icon: MessageSquare },
                        { id: 'activity', name: 'Activity Feed', icon: Activity }
                      ].map((tab) => {
                        const Icon = tab.icon
                        const isActive = teamSubTab === tab.id
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setTeamSubTab(tab.id)}
                            className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                              isActive
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {tab.name}
                          </button>
                        )
                      })}
                    </nav>
                  </div>

                  <div className="p-6">
                    {/* Assignment System */}
                    {teamSubTab === 'assignments' && (
                      <div>
                        <AssignmentSystem
                          candidates={allApplications}
                          jobs={allJobs}
                          teamMembers={teamMembers}
                          onAssignCandidate={handleAssignCandidate}
                          onAssignJob={handleAssignJob}
                          onReassign={handleReassign}
                          onUnassign={handleUnassign}
                        />
                      </div>
                    )}

                    {/* Team Comments */}
                    {teamSubTab === 'comments' && (
                      <div>
                        <TeamComments
                          candidateId={selectedCandidate?.id}
                          jobId={selectedJob?.id}
                          onAddComment={handleAddComment}
                          onUpdateComment={handleUpdateComment}
                          onDeleteComment={handleDeleteComment}
                          onReplyToComment={handleReplyToComment}
                        />
                      </div>
                    )}

                    {/* Activity Feed */}
                    {teamSubTab === 'activity' && (
                      <div>
                        <ActivityFeed
                          activities={activities}
                          onLoadMore={handleLoadMoreActivities}
                          onFilterChange={handleFilterActivities}
                          onSearch={handleSearchActivities}
                        />
                      </div>
                    )}


                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <AdvancedAnalytics
                jobs={allJobs}
                applications={allApplications}
                onExportReport={handleExportReport}
              />
            )}

            {/* Performance Metrics Tab */}
            {activeTab === 'performance' && (
              <PerformanceMetrics />
            )}

            {/* Reports System Tab */}
            {activeTab === 'reports' && (
              <ReportsSystem onExportData={handleExportReport} />
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
                  <div className="flex items-center space-x-3">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Mark All Read
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                      Clear All
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {allApplications.slice(0, 5).map((app) => (
                    <div key={app.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          New application from {app.candidate_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Applied for a job • {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
      </div>

      {/* Candidate Profile Modal */}
      {showCandidateProfile && selectedCandidate && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Candidate Profile</h2>
              <button
                onClick={() => setShowCandidateProfile(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <CandidateProfile
                candidate={selectedCandidate}
                applications={allApplications.filter(app => app.candidate_name === selectedCandidate.candidate_name)}
                onStatusUpdate={handleCandidateStatusUpdate}
                onAddNote={handleAddCandidateNote}
                onDownloadResume={handleDownloadResume}
                onSendMessage={handleSendMessage}
              />
            </div>
          </div>
        </div>
      )}

      {/* Interview Feedback Modal */}
      {showInterviewFeedback && selectedInterview && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Interview Feedback</h2>
              <button
                onClick={() => setShowInterviewFeedback(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <InterviewFeedback
                interview={selectedInterview}
                onSubmitFeedback={handleSubmitFeedback}
                onSaveDraft={handleSaveFeedbackDraft}
              />
            </div>
          </div>
        </div>
      )}

      {/* Email Notifications Modal */}
      {showEmailNotifications && selectedInterview && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
              <button
                onClick={() => setShowEmailNotifications(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <EmailNotifications
                interview={selectedInterview}
                onSendEmail={handleSendEmail}
                onSendReminder={handleSendReminder}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'analytics', name: 'Analytics', icon: PieChart },
                { id: 'performance', name: 'Performance', icon: Zap },
                { id: 'jobs', name: 'Job Management', icon: Briefcase },
                { id: 'applications', name: 'Applications', icon: Users },
                { id: 'ai-matching', name: 'AI Matching', icon: Brain },
                { id: 'interviews', name: 'Interviews', icon: Calendar },
                { id: 'team', name: 'Team Collaboration', icon: Users },
                { id: 'notifications', name: 'Notifications', icon: Bell },
                { id: 'email-campaigns', name: 'Email Campaigns', icon: Mail },
                { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
                { id: 'reports', name: 'Reports', icon: FileText }
              ].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id)
                      setIsMobileSidebarOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-3" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
