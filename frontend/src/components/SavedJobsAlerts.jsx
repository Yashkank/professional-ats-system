import React, { useState, useEffect } from 'react'
import { Bookmark, Bell, MapPin, Clock, DollarSign, Building, Trash2, Eye, ExternalLink, Plus } from 'lucide-react'
import { candidateAPI } from '../services/api'
import toast from 'react-hot-toast'

const SavedJobsAlerts = ({ onApplyJob, onRemoveJob }) => {
  const [activeTab, setActiveTab] = useState('saved')
  const [savedJobs, setSavedJobs] = useState([])
  const [jobAlerts, setJobAlerts] = useState([])
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [newAlert, setNewAlert] = useState({
    keywords: '',
    location: '',
    jobType: 'full-time',
    experience: 'any',
    salary: '',
    frequency: 'daily'
  })

  // Load saved jobs from API
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const response = await candidateAPI.getSavedJobs()
        setSavedJobs(response.data || [])
      } catch (error) {
        console.error('Error loading saved jobs:', error)
        setSavedJobs([])
      }
    }

    loadSavedJobs()
  }, [])

  // Load job alerts from API
  useEffect(() => {
    const loadJobAlerts = async () => {
      try {
        const response = await candidateAPI.getJobAlerts()
        setJobAlerts(response.data || [])
      } catch (error) {
        console.error('Error loading job alerts:', error)
        setJobAlerts([])
      }
    }

    loadJobAlerts()
  }, [])

  const handleRemoveSavedJob = async (jobId) => {
    try {
      await candidateAPI.removeSavedJob(jobId)
      setSavedJobs(prev => prev.filter(job => job.id !== jobId))
      onRemoveJob?.(jobId)
      toast.success('Job removed from saved jobs')
    } catch (error) {
      console.error('Error removing saved job:', error)
      toast.error('Failed to remove saved job')
    }
  }

  const handleCreateAlert = async () => {
    if (!newAlert.keywords.trim()) return

    try {
      const alertData = {
        name: newAlert.keywords,
        keywords: newAlert.keywords,
        location: newAlert.location,
        job_type: newAlert.jobType,
        experience_level: newAlert.experience,
        salary_range: newAlert.salary,
        frequency: newAlert.frequency
      }

      const response = await candidateAPI.createJobAlert(alertData)
      setJobAlerts(prev => [response.data, ...prev])
      setNewAlert({
        keywords: '',
        location: '',
        jobType: 'full-time',
        experience: 'any',
        salary: '',
        frequency: 'daily'
      })
      setShowCreateAlert(false)
      toast.success('Job alert created successfully')
    } catch (error) {
      console.error('Error creating job alert:', error)
      toast.error('Failed to create job alert')
    }
  }

  const toggleAlert = async (alertId) => {
    try {
      await candidateAPI.toggleJobAlert(alertId)
      setJobAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, isActive: !alert.isActive } : alert
      ))
      toast.success('Job alert updated')
    } catch (error) {
      console.error('Error toggling job alert:', error)
      toast.error('Failed to update job alert')
    }
  }

  const deleteAlert = async (alertId) => {
    try {
      await candidateAPI.deleteJobAlert(alertId)
      setJobAlerts(prev => prev.filter(alert => alert.id !== alertId))
      toast.success('Job alert deleted')
    } catch (error) {
      console.error('Error deleting job alert:', error)
      toast.error('Failed to delete job alert')
    }
  }

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'expired': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6 py-4">
          <button
            onClick={() => setActiveTab('saved')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'saved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bookmark className="h-4 w-4 inline mr-2" />
            Saved Jobs ({savedJobs.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Bell className="h-4 w-4 inline mr-2" />
            Job Alerts ({jobAlerts.length})
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Saved Jobs Tab */}
        {activeTab === 'saved' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Saved Jobs</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View All
              </button>
            </div>

            {savedJobs.length === 0 ? (
              <div className="text-center py-8">
                <Bookmark className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No saved jobs yet</p>
                <p className="text-sm text-gray-400">Start saving jobs you're interested in</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedJobs.map((job) => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 mr-3">{job.title}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(job.matchScore)}`}>
                            {job.matchScore}% Match
                          </span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                            {job.status}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Building className="h-4 w-4 mr-1" />
                          {job.company}
                          <span className="mx-2">•</span>
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                          <span className="mx-2">•</span>
                          <DollarSign className="h-4 w-4 mr-1" />
                          {job.salary}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          Saved on {new Date(job.savedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onApplyJob?.(job)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Apply
                        </button>
                        <button
                          onClick={() => handleRemoveSavedJob(job.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Job Alerts Tab */}
        {activeTab === 'alerts' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Job Alerts</h3>
              <button
                onClick={() => setShowCreateAlert(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Alert
              </button>
            </div>

            {/* Create Alert Modal */}
            {showCreateAlert && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Create Job Alert</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                      <input
                        type="text"
                        value={newAlert.keywords}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, keywords: e.target.value }))}
                        placeholder="e.g., Python, React, Data Scientist"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={newAlert.location}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., San Francisco, CA or Remote"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                        <select
                          value={newAlert.jobType}
                          onChange={(e) => setNewAlert(prev => ({ ...prev, jobType: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="full-time">Full-time</option>
                          <option value="part-time">Part-time</option>
                          <option value="contract">Contract</option>
                          <option value="any">Any</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                        <select
                          value={newAlert.experience}
                          onChange={(e) => setNewAlert(prev => ({ ...prev, experience: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="any">Any</option>
                          <option value="entry">Entry Level</option>
                          <option value="mid">Mid-level</option>
                          <option value="senior">Senior</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
                      <input
                        type="text"
                        value={newAlert.salary}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, salary: e.target.value }))}
                        placeholder="e.g., $80,000+ or $100,000 - $150,000"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                      <select
                        value={newAlert.frequency}
                        onChange={(e) => setNewAlert(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowCreateAlert(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateAlert}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Create Alert
                    </button>
                  </div>
                </div>
              </div>
            )}

            {jobAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No job alerts yet</p>
                <p className="text-sm text-gray-400">Create alerts to get notified about new jobs</p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobAlerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-semibold text-gray-900 mr-3">{alert.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            alert.isActive ? 'text-green-600 bg-green-100' : 'text-gray-600 bg-gray-100'
                          }`}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Keywords:</span> {alert.keywords}
                          </div>
                          <div>
                            <span className="font-medium">Location:</span> {alert.location}
                          </div>
                          <div>
                            <span className="font-medium">Type:</span> {alert.jobType}
                          </div>
                          <div>
                            <span className="font-medium">Experience:</span> {alert.experience}
                          </div>
                          <div>
                            <span className="font-medium">Salary:</span> {alert.salary || 'Any'}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {alert.frequency}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          Last sent: {alert.lastSent} • {alert.matchesFound} matches found
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => toggleAlert(alert.id)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            alert.isActive
                              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {alert.isActive ? 'Pause' : 'Activate'}
                        </button>
                        <button
                          onClick={() => deleteAlert(alert.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SavedJobsAlerts
