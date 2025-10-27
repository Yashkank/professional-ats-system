import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { applicationAPI } from '../services/api'
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, X, User, Mail, Calendar, Building } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      const response = await applicationAPI.getApplications()
      setApplications(response.data)
    } catch (error) {
      toast.error('Failed to fetch applications')
      console.error('Applications fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      await applicationAPI.updateApplication(applicationId, { status: newStatus })
      toast.success('Application status updated successfully!')
      fetchApplications()
    } catch (error) {
      toast.error('Failed to update application status')
      console.error('Status update error:', error)
    }
  }

  const handleViewDetails = (application) => {
    setSelectedApplication(application)
    setShowDetailsModal(true)
  }

  const closeDetailsModal = () => {
    setShowDetailsModal(false)
    setSelectedApplication(null)
  }

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600">
          {user?.role === 'recruiter' 
            ? 'Review and manage job applications' 
            : 'Track your job applications'
          }
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search applications by candidate, job, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <div key={application.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.candidate_name || 'Unknown Candidate'}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Job Title</p>
                      <p className="text-gray-900">{application.job_title || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Company</p>
                      <p className="text-gray-900">{application.company_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Applied Date</p>
                      <p className="text-gray-900">
                        {new Date(application.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Last Updated</p>
                      <p className="text-gray-900">
                        {new Date(application.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {application.cover_letter && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter</p>
                      <p className="text-gray-600 text-sm line-clamp-3">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}
                  
                  {application.resume_url && (
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Resume</p>
                      <a
                        href={application.resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                      >
                        View Resume
                      </a>
                    </div>
                  )}
                </div>
                
                <div className="ml-4 flex flex-col space-y-2">
                  {(user?.role === 'recruiter' || user?.role === 'admin') && (
                    <>
                      {application.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                            className="btn-secondary text-sm"
                          >
                            Mark as Reviewed
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                            className="btn-primary text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="btn-danger text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {application.status === 'reviewed' && (
                        <>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'accepted')}
                            className="btn-primary text-sm"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            className="btn-danger text-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </>
                  )}
                  
                  <button 
                    onClick={() => handleViewDetails(application)}
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
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No applications found matching your criteria.' 
                : 'No applications found.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {applications.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Application Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
              <p className="text-sm text-gray-600">Total Applications</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {applications.filter(app => app.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600">Pending Review</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {applications.filter(app => app.status === 'accepted').length}
              </p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {applications.filter(app => app.status === 'rejected').length}
              </p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Application Details</h2>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Candidate Information */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Candidate Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Full Name</p>
                    <p className="text-gray-900">{selectedApplication.candidate_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Application Status</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApplication.status)}`}>
                      {getStatusIcon(selectedApplication.status)}
                      <span className="ml-1 capitalize">{selectedApplication.status}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Job Information */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Job Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Job Title</p>
                    <p className="text-gray-900">{selectedApplication.job_title || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Company</p>
                    <p className="text-gray-900">{selectedApplication.company_name || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Application Timeline */}
              <div className="card">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Application Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Applied Date</p>
                    <p className="text-gray-900">
                      {new Date(selectedApplication.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Last Updated</p>
                    <p className="text-gray-900">
                      {new Date(selectedApplication.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              {selectedApplication.cover_letter && (
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Cover Letter
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedApplication.cover_letter}
                    </p>
                  </div>
                </div>
              )}

              {/* Resume */}
              {selectedApplication.resume_url && (
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Resume
                  </h3>
                  <div className="flex items-center space-x-4">
                    <a
                      href={selectedApplication.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>View Resume</span>
                    </a>
                    <a
                      href={selectedApplication.resume_url}
                      download
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FileText className="h-4 w-4" />
                      <span>Download Resume</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {(user?.role === 'recruiter' || user?.role === 'admin') && (
                <div className="card">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                  <div className="flex space-x-3">
                    {selectedApplication.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            updateApplicationStatus(selectedApplication.id, 'accepted')
                            closeDetailsModal()
                          }}
                          className="btn-primary flex items-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Accept Application</span>
                        </button>
                        <button
                          onClick={() => {
                            updateApplicationStatus(selectedApplication.id, 'rejected')
                            closeDetailsModal()
                          }}
                          className="btn-danger flex items-center space-x-2"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject Application</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={closeDetailsModal}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}





















