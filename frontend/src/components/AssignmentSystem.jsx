import React, { useState, useEffect } from 'react'
import {
  UserPlus, Users, Briefcase, Calendar, Clock, 
  CheckCircle, XCircle, AlertCircle, Filter, Search,
  ArrowRight, ArrowLeft, RefreshCw, Eye, Edit, Trash2
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AssignmentSystem({ 
  candidates = [], 
  jobs = [], 
  teamMembers = [],
  onAssignCandidate,
  onAssignJob,
  onReassign,
  onUnassign 
}) {
  const [assignments, setAssignments] = useState([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [assignmentType, setAssignmentType] = useState('candidate')
  const [selectedAssignee, setSelectedAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock assignments data - in real app, this would come from API
  useEffect(() => {
    const mockAssignments = [
      {
        id: 1,
        type: 'candidate',
        itemId: 'candidate-1',
        itemName: 'John Doe',
        itemTitle: 'Software Engineer',
        assigneeId: 'user-2',
        assigneeName: 'Mike Chen',
        assignedBy: 'Sarah Johnson',
        assignedAt: '2024-01-15T10:30:00Z',
        dueDate: '2024-01-22T17:00:00Z',
        status: 'active',
        priority: 'high',
        notes: 'Initial screening and technical interview'
      },
      {
        id: 2,
        type: 'job',
        itemId: 'job-1',
        itemName: 'Senior React Developer',
        itemTitle: 'Full-time position',
        assigneeId: 'user-2',
        assigneeName: 'Mike Chen',
        assignedBy: 'Sarah Johnson',
        assignedAt: '2024-01-14T14:20:00Z',
        dueDate: '2024-01-28T17:00:00Z',
        status: 'active',
        priority: 'medium',
        notes: 'Source and screen candidates for this role'
      },
      {
        id: 3,
        type: 'candidate',
        itemId: 'candidate-2',
        itemName: 'Jane Smith',
        itemTitle: 'Product Manager',
        assigneeId: 'user-3',
        assigneeName: 'Emily Rodriguez',
        assignedBy: 'Sarah Johnson',
        assignedAt: '2024-01-13T09:15:00Z',
        dueDate: '2024-01-20T17:00:00Z',
        status: 'completed',
        priority: 'high',
        notes: 'Final interview and decision'
      }
    ]
    setAssignments(mockAssignments)
  }, [])

  const priorityColors = {
    high: 'red',
    medium: 'yellow',
    low: 'green'
  }

  const statusColors = {
    active: 'blue',
    completed: 'green',
    overdue: 'red',
    cancelled: 'gray'
  }

  const handleAssign = () => {
    if (!selectedItem || !selectedAssignee) {
      toast.error('Please select an item and assignee')
      return
    }

    const assignment = {
      id: Date.now(),
      type: assignmentType,
      itemId: selectedItem.id,
      itemName: selectedItem.name || selectedItem.title,
      itemTitle: selectedItem.title || selectedItem.description,
      assigneeId: selectedAssignee,
      assigneeName: teamMembers.find(m => m.id === selectedAssignee)?.name || 'Unknown',
      assignedBy: 'Current User', // This would come from auth context
      assignedAt: new Date().toISOString(),
      dueDate: dueDate || null,
      status: 'active',
      priority: 'medium',
      notes: notes
    }

    setAssignments(prev => [assignment, ...prev])
    setShowAssignModal(false)
    setSelectedItem(null)
    setSelectedAssignee('')
    setDueDate('')
    setNotes('')

    if (onAssignCandidate && assignmentType === 'candidate') {
      onAssignCandidate(selectedItem.id, selectedAssignee, assignment)
    } else if (onAssignJob && assignmentType === 'job') {
      onAssignJob(selectedItem.id, selectedAssignee, assignment)
    }

    toast.success('Assignment created successfully')
  }

  const handleReassign = (assignmentId, newAssigneeId) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { 
              ...assignment, 
              assigneeId: newAssigneeId,
              assigneeName: teamMembers.find(m => m.id === newAssigneeId)?.name || 'Unknown',
              assignedAt: new Date().toISOString()
            }
          : assignment
      )
    )

    if (onReassign) {
      onReassign(assignmentId, newAssigneeId)
    }

    toast.success('Assignment updated successfully')
  }

  const handleUnassign = (assignmentId) => {
    if (window.confirm('Are you sure you want to unassign this item?')) {
      setAssignments(prev => 
        prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'cancelled' }
            : assignment
        )
      )

      if (onUnassign) {
        onUnassign(assignmentId)
      }

      toast.success('Assignment cancelled successfully')
    }
  }

  const handleComplete = (assignmentId) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === assignmentId 
          ? { ...assignment, status: 'completed' }
          : assignment
      )
    )

    toast.success('Assignment marked as completed')
  }

  const getStatus = (assignment) => {
    if (assignment.status === 'completed') return 'completed'
    if (assignment.status === 'cancelled') return 'cancelled'
    
    const due = new Date(assignment.dueDate)
    const now = new Date()
    
    if (due < now) return 'overdue'
    return 'active'
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' || getStatus(assignment) === filter
    const matchesSearch = searchTerm === '' || 
      assignment.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.notes.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getWorkloadStats = () => {
    const stats = {}
    teamMembers.forEach(member => {
      const activeAssignments = assignments.filter(a => 
        a.assigneeId === member.id && getStatus(a) === 'active'
      ).length
      stats[member.id] = activeAssignments
    })
    return stats
  }

  const workloadStats = getWorkloadStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Assignment System</h2>
          <p className="text-gray-600">Assign candidates and jobs to team members</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setAssignmentType('candidate')
              setShowAssignModal(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Assign Candidate
          </button>
          <button
            onClick={() => {
              setAssignmentType('job')
              setShowAssignModal(true)
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Assign Job
          </button>
        </div>
      </div>

      {/* Team Workload Overview */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Workload</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map(member => (
            <div key={member.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{member.name}</h4>
                <span className="text-sm text-gray-500">
                  {workloadStats[member.id] || 0} active
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (workloadStats[member.id] || 0) > 5 ? 'bg-red-500' :
                    (workloadStats[member.id] || 0) > 3 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((workloadStats[member.id] || 0) * 20, 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Assignments ({filteredAssignments.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredAssignments.map((assignment) => {
            const status = getStatus(assignment)
            const statusColor = statusColors[status]
            const priorityColor = priorityColors[assignment.priority]
            
            return (
              <div key={assignment.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {assignment.type === 'candidate' ? (
                          <Users className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Briefcase className="h-5 w-5 text-green-600" />
                        )}
                        <h4 className="text-lg font-medium text-gray-900">
                          {assignment.itemName}
                        </h4>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-${priorityColor}-100 text-${priorityColor}-800`}>
                        {assignment.priority}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-${statusColor}-100 text-${statusColor}-800`}>
                        {status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-2">{assignment.itemTitle}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Assigned to: {assignment.assigneeName}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Due: {assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTimeAgo(assignment.assignedAt)}
                      </div>
                    </div>
                    
                    {assignment.notes && (
                      <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                        {assignment.notes}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {status === 'active' && (
                      <>
                        <button
                          onClick={() => handleComplete(assignment.id)}
                          className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Mark as completed"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUnassign(assignment.id)}
                          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Cancel assignment"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      title="View details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign {assignmentType === 'candidate' ? 'Candidate' : 'Job'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select {assignmentType === 'candidate' ? 'Candidate' : 'Job'}
                </label>
                <select
                  onChange={(e) => {
                    const item = assignmentType === 'candidate' 
                      ? candidates.find(c => c.id === e.target.value)
                      : jobs.find(j => j.id === e.target.value)
                    setSelectedItem(item)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose {assignmentType === 'candidate' ? 'a candidate' : 'a job'}</option>
                  {(assignmentType === 'candidate' ? candidates : jobs).map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.title} - {item.title || item.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to Team Member
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select team member</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({workloadStats[member.id] || 0} active assignments)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any specific instructions or notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedItem(null)
                  setSelectedAssignee('')
                  setDueDate('')
                  setNotes('')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Create Assignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
