import React from 'react'
import { CheckCircle, Clock, XCircle, User, Calendar, Building } from 'lucide-react'

const ApplicationTimeline = ({ applications = [] }) => {
  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'under_review':
        return <User className="h-5 w-5 text-yellow-500" />
      case 'interview':
        return <Calendar className="h-5 w-5 text-purple-500" />
      case 'offer':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'bg-blue-100 text-blue-800'
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview':
        return 'bg-purple-100 text-purple-800'
      case 'offer':
        return 'bg-green-100 text-green-800'
      case 'accepted':
        return 'bg-green-200 text-green-900'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (status) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 20
      case 'under_review':
        return 40
      case 'interview':
        return 70
      case 'offer':
        return 90
      case 'accepted':
        return 100
      case 'rejected':
        return 0
      default:
        return 20
    }
  }

  const statusSteps = [
    { key: 'applied', label: 'Applied', icon: Clock },
    { key: 'under_review', label: 'Under Review', icon: User },
    { key: 'interview', label: 'Interview', icon: Calendar },
    { key: 'offer', label: 'Offer', icon: CheckCircle },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle }
  ]

  if (!applications || applications.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No applications yet</p>
          <p className="text-sm text-gray-400">Start applying to jobs to see your timeline</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Application Timeline</h3>
      
      <div className="space-y-6">
        {applications.map((application, index) => (
          <div key={application.id || index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{application.job_title || 'Job Title'}</h4>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Building className="h-4 w-4 mr-1" />
                  {application.company_name || 'Company Name'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Applied on {new Date(application.applied_at || Date.now()).toLocaleDateString()}
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                {application.status?.replace('_', ' ').toUpperCase() || 'APPLIED'}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>Progress</span>
                <span>{getProgressPercentage(application.status)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    application.status === 'rejected' ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${getProgressPercentage(application.status)}%` }}
                />
              </div>
            </div>

            {/* Status Steps */}
            <div className="flex items-center justify-between">
              {statusSteps.map((step, stepIndex) => {
                const isActive = statusSteps.findIndex(s => s.key === application.status) >= stepIndex
                const isCurrent = step.key === application.status
                const StepIcon = step.icon
                
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                    } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}>
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span className={`text-xs text-center ${
                      isActive ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Additional Info */}
            {application.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{application.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ApplicationTimeline
