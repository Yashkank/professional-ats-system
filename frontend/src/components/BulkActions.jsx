import React, { useState } from 'react'
import {
  CheckSquare, Square, Users, Mail, FileText, Download,
  Trash2, Edit, Star, Clock, Send, AlertCircle, CheckCircle,
  XCircle, MoreHorizontal, Copy, Archive, Tag, Filter
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function BulkActions({ 
  selectedItems = [], 
  onSelectAll, 
  onSelectItem, 
  onBulkAction,
  totalItems = 0,
  isAllSelected = false,
  isIndeterminate = false 
}) {
  const [showActions, setShowActions] = useState(false)
  const [selectedAction, setSelectedAction] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const bulkActions = [
    {
      id: 'email',
      label: 'Send Email',
      icon: Mail,
      color: 'blue',
      description: 'Send email to selected candidates'
    },
    {
      id: 'status_update',
      label: 'Update Status',
      icon: CheckCircle,
      color: 'green',
      description: 'Change application status'
    },
    {
      id: 'schedule_interview',
      label: 'Schedule Interview',
      icon: Clock,
      color: 'purple',
      description: 'Schedule interviews for selected candidates'
    },
    {
      id: 'export',
      label: 'Export Data',
      icon: Download,
      color: 'gray',
      description: 'Export candidate information'
    },
    {
      id: 'add_tags',
      label: 'Add Tags',
      icon: Tag,
      color: 'yellow',
      description: 'Add tags to candidates'
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      color: 'orange',
      description: 'Archive selected candidates'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      color: 'red',
      description: 'Remove candidates from system'
    }
  ]

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'reviewing', label: 'Reviewing', color: 'blue' },
    { value: 'interview_scheduled', label: 'Interview Scheduled', color: 'purple' },
    { value: 'accepted', label: 'Accepted', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' },
    { value: 'on_hold', label: 'On Hold', color: 'gray' }
  ]

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!isAllSelected)
    }
  }

  const handleSelectItem = (itemId) => {
    if (onSelectItem) {
      onSelectItem(itemId)
    }
  }

  const handleBulkAction = async (actionId) => {
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    setIsProcessing(true)
    setSelectedAction(actionId)

    try {
      if (onBulkAction) {
        await onBulkAction(actionId, selectedItems, customMessage)
      }
      
      toast.success(`Action completed for ${selectedItems.length} items`)
      setShowActions(false)
      setCustomMessage('')
    } catch (error) {
      toast.error('Failed to perform bulk action')
    } finally {
      setIsProcessing(false)
      setSelectedAction('')
    }
  }

  const handleStatusUpdate = (newStatus) => {
    handleBulkAction('status_update')
  }

  const handleEmailSend = () => {
    if (!customMessage.trim()) {
      toast.error('Please enter a message')
      return
    }
    handleBulkAction('email')
  }

  const getActionIcon = (actionId) => {
    const action = bulkActions.find(a => a.id === actionId)
    return action ? action.icon : MoreHorizontal
  }

  const getActionColor = (actionId) => {
    const action = bulkActions.find(a => a.id === actionId)
    return action ? action.color : 'gray'
  }

  if (selectedItems.length === 0 && !isAllSelected) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Selection Summary */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {isIndeterminate ? (
                <div className="w-4 h-4 border-2 border-blue-600 bg-blue-100 rounded flex items-center justify-center">
                  <div className="w-2 h-0.5 bg-blue-600"></div>
                </div>
              ) : isAllSelected ? (
                <CheckSquare className="w-4 h-4 text-blue-600" />
              ) : (
                <Square className="w-4 h-4 text-gray-400" />
              )}
              <span>
                {isAllSelected ? 'All selected' : `${selectedItems.length} selected`}
                {totalItems > 0 && ` of ${totalItems}`}
              </span>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions Panel */}
      {showActions && (
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bulk Actions ({selectedItems.length} items)
          </h3>
          
          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {bulkActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.id}
                  onClick={() => {
                    if (action.id === 'status_update') {
                      // Show status selection modal
                      return
                    }
                    if (action.id === 'email') {
                      // Show email composition modal
                      return
                    }
                    handleBulkAction(action.id)
                  }}
                  disabled={isProcessing}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedAction === action.id
                      ? `border-${action.color}-500 bg-${action.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  } ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`h-5 w-5 ${
                      selectedAction === action.id
                        ? `text-${action.color}-600`
                        : 'text-gray-400'
                    }`} />
                    <div className="text-left">
                      <p className={`font-medium ${
                        selectedAction === action.id
                          ? `text-${action.color}-700`
                          : 'text-gray-700'
                      }`}>
                        {action.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Custom Message for Email */}
          {selectedAction === 'email' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Message
              </label>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Enter your message to the selected candidates..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}

          {/* Status Update Options */}
          {selectedAction === 'status_update' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusUpdate(status.value)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      `border-${status.color}-200 hover:border-${status.color}-300`
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                      <span className="text-sm font-medium text-gray-700">
                        {status.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowActions(false)
                setSelectedAction('')
                setCustomMessage('')
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            {selectedAction && (
              <button
                onClick={() => {
                  if (selectedAction === 'email') {
                    handleEmailSend()
                  } else {
                    handleBulkAction(selectedAction)
                  }
                }}
                disabled={isProcessing}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-200 ${
                  isProcessing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `bg-${getActionColor(selectedAction)}-600 hover:bg-${getActionColor(selectedAction)}-700`
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {React.createElement(getActionIcon(selectedAction), { className: "h-4 w-4 mr-2" })}
                    Execute Action
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Quick actions for {selectedItems.length} selected items
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleBulkAction('email')}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
            >
              <Mail className="h-4 w-4 mr-1" />
              Email
            </button>
            <button
              onClick={() => handleBulkAction('export')}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </button>
            <button
              onClick={() => handleBulkAction('schedule_interview')}
              className="inline-flex items-center px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 transition-colors duration-200"
            >
              <Clock className="h-4 w-4 mr-1" />
              Schedule
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
