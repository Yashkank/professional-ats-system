import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { jobAPI, applicationAPI, userAPI } from '../services/api'
import { Plus, Search, MapPin, Building, DollarSign, Calendar, Eye, X, Briefcase } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Jobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingJob, setEditingJob] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [applicationData, setApplicationData] = useState({
    cover_letter: '',
    resume_url: ''
  })
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    description: '',
    requirements: '',
    salary_range: '',
    experience_level: 'entry'
  })

  useEffect(() => {
    fetchJobs()
    fetchCurrentUser()
  }, [])

  const fetchJobs = async () => {
    try {
      setIsLoading(true)
      const response = await jobAPI.getJobs()
      setJobs(response.data)
    } catch (error) {
      toast.error('Failed to fetch jobs')
      console.error('Jobs fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCurrentUser = async () => {
    try {
      const response = await userAPI.getProfile()
      setCurrentUser(response.data)
    } catch (error) {
      console.error('User fetch error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingJob) {
        await jobAPI.updateJob(editingJob.id, formData)
        toast.success('Job updated successfully!')
      } else {
        await jobAPI.createJob(formData)
        toast.success('Job created successfully!')
      }
      
      setShowCreateForm(false)
      setEditingJob(null)
      setFormData({
        title: '',
        location: '',
        description: '',
        requirements: '',
        salary_range: '',
        experience_level: 'entry'
      })
      fetchJobs()
    } catch (error) {
      toast.error(editingJob ? 'Failed to update job' : 'Failed to create job')
      console.error('Job operation error:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleEdit = (job) => {
    setEditingJob(job)
    setFormData({
      title: job.title,
      location: job.location,
      description: job.description,
      requirements: job.requirements,
      salary_range: job.salary_range,
      experience_level: job.experience_level
    })
    setShowCreateForm(true)
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setEditingJob(null)
    setFormData({
      title: '',
      location: '',
      description: '',
      requirements: '',
      salary_range: '',
      experience_level: 'entry'
    })
  }

  const handleViewDetails = (job) => {
    setSelectedJob(job)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedJob(null)
  }

  const handleApplyToJob = (job) => {
    setSelectedJob(job)
    setShowApplicationForm(true)
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
    } catch (error) {
      console.error('❌ Application submission error:', error)
      console.error('Error response:', error.response?.data)
      toast.error('Failed to submit application: ' + (error.response?.data?.detail || error.message))
    }
  }

  const handleApplicationChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    })
  }

  const filteredJobs = jobs.filter(job =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.company_name && job.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (job.location && job.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
          <p className="text-gray-600">Browse and manage job opportunities</p>
        </div>
        {(user?.role === 'recruiter' || user?.role === 'admin') && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Post New Job</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Create/Edit Job Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingJob ? 'Edit Job' : 'Create New Job'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Display for Recruiters */}
            {user?.role === 'recruiter' && currentUser?.company && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Building className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Posting for Company</p>
                    <p className="text-lg font-semibold text-blue-800">{currentUser.company.name}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Senior Software Engineer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Experience Level</label>
                <select
                  name="experience_level"
                  value={formData.experience_level}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="executive">Executive Level</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                <input
                  type="text"
                  name="salary_range"
                  value={formData.salary_range}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., $80,000 - $120,000"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Description</label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="Detailed job description..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Requirements</label>
              <textarea
                name="requirements"
                rows={3}
                value={formData.requirements}
                onChange={handleChange}
                className="input-field"
                placeholder="Required skills and qualifications..."
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingJob ? 'Update Job' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      {job.company?.name || job.company_name || job.company || 'Unknown Company'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {job.location}
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {job.salary_range}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                  
                  {job.requirements && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Requirements:</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{job.requirements}</p>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {user?.role === 'candidate' && (
                    <button 
                      onClick={() => handleApplyToJob(job)}
                      className="btn-primary text-sm flex items-center space-x-1"
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Apply Now</span>
                    </button>
                  )}
                  {(user?.role === 'recruiter' || user?.role === 'admin') && (
                    <button 
                      onClick={() => handleEdit(job)}
                      className="btn-secondary text-sm"
                    >
                      Edit Job
                    </button>
                  )}
                  <button 
                    onClick={() => handleViewDetails(job)}
                    className="text-primary-600 hover:text-primary-500 text-sm font-medium flex items-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No jobs found matching your search.' : 'No jobs available at the moment.'}
            </p>
          </div>
        )}
      </div>

      {/* Job Details Modal */}
      {showDetailsModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Job Header */}
              <div className="card">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedJob.title}</h3>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center text-gray-600">
                        <Building className="h-4 w-4 mr-1" />
                        {selectedJob.company?.name || selectedJob.company_name || selectedJob.company || 'Unknown Company'}
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
                <div className="card">
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

                <div className="card">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-3">
                    {(user?.role === 'recruiter' || user?.role === 'admin') && (
                      <button
                        onClick={() => {
                          closeDetailsModal()
                          handleEdit(selectedJob)
                        }}
                        className="w-full btn-secondary flex items-center justify-center space-x-2"
                      >
                        <span>Edit Job</span>
                      </button>
                    )}
                    {user?.role === 'candidate' && (
                      <button 
                        onClick={() => {
                          closeDetailsModal()
                          handleApplyToJob(selectedJob)
                        }}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <Briefcase className="h-4 w-4" />
                        <span>Apply Now</span>
                      </button>
                    )}
                    <button
                      onClick={closeDetailsModal}
                      className="w-full btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Description */}
              <div className="card">
                <h4 className="text-lg font-medium text-gray-900 mb-3">Job Description</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedJob.description}</p>
                </div>
              </div>

              {/* Requirements */}
              {selectedJob.requirements && (
                <div className="card">
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

      {/* Application Form Modal */}
      {showApplicationForm && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Apply to {selectedJob.title}
              </h2>
              <button
                onClick={() => setShowApplicationForm(false)}
                className="text-gray-400 hover:text-gray-600"
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
                  className="input-field"
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
                  className="input-field"
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
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}





















