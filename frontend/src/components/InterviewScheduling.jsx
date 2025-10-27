import React, { useState, useEffect } from 'react'
import { Calendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import {
  Calendar as CalendarIcon, Clock, Video, Phone, MapPin, 
  User, Plus, Edit, Trash2, Send, CheckCircle, XCircle,
  AlertCircle, Mail, MessageSquare, FileText, Users,
  Settings, Filter, Search, Download, BarChart3
} from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'

const localizer = momentLocalizer(moment)

export default function InterviewScheduling({ 
  candidates = [], 
  onScheduleInterview,
  onUpdateInterview,
  onCancelInterview,
  onSendReminder 
}) {
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState(null)
  const [interviews, setInterviews] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Interview form state
  const [interviewForm, setInterviewForm] = useState({
    candidateId: '',
    candidateName: '',
    jobTitle: '',
    interviewType: 'video',
    scheduledDate: new Date(),
    duration: 60,
    location: '',
    meetingLink: '',
    interviewer: '',
    notes: '',
    status: 'scheduled'
  })

  // Mock interview data - in real app, this would come from API
  useEffect(() => {
    const mockInterviews = [
      {
        id: 1,
        title: 'John Doe - Software Engineer',
        start: new Date(2024, 11, 15, 10, 0),
        end: new Date(2024, 11, 15, 11, 0),
        candidateId: 'candidate-1',
        candidateName: 'John Doe',
        jobTitle: 'Software Engineer',
        interviewType: 'video',
        location: 'Zoom Meeting',
        meetingLink: 'https://zoom.us/j/123456789',
        interviewer: 'Sarah Johnson',
        status: 'scheduled',
        notes: 'Technical interview focusing on React and Node.js'
      },
      {
        id: 2,
        title: 'Jane Smith - Product Manager',
        start: new Date(2024, 11, 16, 14, 0),
        end: new Date(2024, 11, 16, 15, 0),
        candidateId: 'candidate-2',
        candidateName: 'Jane Smith',
        jobTitle: 'Product Manager',
        interviewType: 'in-person',
        location: 'Office - Conference Room A',
        meetingLink: '',
        interviewer: 'Mike Wilson',
        status: 'scheduled',
        notes: 'Behavioral and product strategy discussion'
      },
      {
        id: 3,
        title: 'Alex Johnson - Data Scientist',
        start: new Date(2024, 11, 17, 9, 0),
        end: new Date(2024, 11, 17, 10, 30),
        candidateId: 'candidate-3',
        candidateName: 'Alex Johnson',
        jobTitle: 'Data Scientist',
        interviewType: 'phone',
        location: 'Phone Call',
        meetingLink: '',
        interviewer: 'Lisa Chen',
        status: 'completed',
        notes: 'Initial screening call'
      }
    ]
    setInterviews(mockInterviews)
  }, [])

  const interviewTypes = [
    { value: 'phone', label: 'Phone Interview', icon: Phone, color: 'blue' },
    { value: 'video', label: 'Video Interview', icon: Video, color: 'green' },
    { value: 'in-person', label: 'In-Person Interview', icon: MapPin, color: 'purple' },
    { value: 'technical', label: 'Technical Interview', icon: Settings, color: 'orange' }
  ]

  const getInterviewTypeIcon = (type) => {
    const interviewType = interviewTypes.find(t => t.value === type)
    return interviewType ? interviewType.icon : CalendarIcon
  }

  const getInterviewTypeColor = (type) => {
    const interviewType = interviewTypes.find(t => t.value === type)
    return interviewType ? interviewType.color : 'gray'
  }

  const handleSelectSlot = ({ start, end }) => {
    setInterviewForm(prev => ({
      ...prev,
      scheduledDate: start,
      duration: moment(end).diff(moment(start), 'minutes')
    }))
    setShowScheduleModal(true)
  }

  const handleSelectEvent = (event) => {
    setSelectedInterview(event)
    setShowInterviewModal(true)
  }

  const handleScheduleInterview = () => {
    if (!interviewForm.candidateId || !interviewForm.scheduledDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const newInterview = {
      id: Date.now(),
      title: `${interviewForm.candidateName} - ${interviewForm.jobTitle}`,
      start: interviewForm.scheduledDate,
      end: moment(interviewForm.scheduledDate).add(interviewForm.duration, 'minutes').toDate(),
      ...interviewForm
    }

    setInterviews(prev => [...prev, newInterview])
    setShowScheduleModal(false)
    setInterviewForm({
      candidateId: '',
      candidateName: '',
      jobTitle: '',
      interviewType: 'video',
      scheduledDate: new Date(),
      duration: 60,
      location: '',
      meetingLink: '',
      interviewer: '',
      notes: '',
      status: 'scheduled'
    })

    if (onScheduleInterview) {
      onScheduleInterview(newInterview)
    }

    toast.success('Interview scheduled successfully')
  }

  const handleUpdateInterview = (interviewId, updates) => {
    setInterviews(prev => 
      prev.map(interview => 
        interview.id === interviewId 
          ? { ...interview, ...updates }
          : interview
      )
    )

    if (onUpdateInterview) {
      onUpdateInterview(interviewId, updates)
    }

    toast.success('Interview updated successfully')
  }

  const handleCancelInterview = (interviewId) => {
    if (window.confirm('Are you sure you want to cancel this interview?')) {
      setInterviews(prev => prev.filter(interview => interview.id !== interviewId))
      
      if (onCancelInterview) {
        onCancelInterview(interviewId)
      }

      toast.success('Interview cancelled successfully')
    }
  }

  const handleSendReminder = (interviewId) => {
    const interview = interviews.find(i => i.id === interviewId)
    if (interview) {
      if (onSendReminder) {
        onSendReminder(interview)
      }
      toast.success('Reminder sent successfully')
    }
  }

  const filteredInterviews = interviews.filter(interview => {
    const matchesFilter = filter === 'all' || interview.status === filter
    const matchesSearch = searchTerm === '' || 
      interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const eventStyleGetter = (event) => {
    const color = getInterviewTypeColor(event.interviewType)
    const colorMap = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      gray: '#6B7280'
    }
    
    return {
      style: {
        backgroundColor: colorMap[color] || colorMap.gray,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    }
  }

  const getInterviewStats = () => {
    const total = interviews.length
    const scheduled = interviews.filter(i => i.status === 'scheduled').length
    const completed = interviews.filter(i => i.status === 'completed').length
    const cancelled = interviews.filter(i => i.status === 'cancelled').length
    
    return { total, scheduled, completed, cancelled }
  }

  const stats = getInterviewStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Interview Scheduling</h2>
          <p className="text-gray-600">Manage and schedule candidate interviews</p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Interview
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Interviews</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Scheduled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.cancelled}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Interviews</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="month">Month</option>
              <option value="week">Week</option>
              <option value="day">Day</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Calendar
          localizer={localizer}
          events={filteredInterviews}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          view={view}
          date={date}
          onNavigate={setDate}
          onView={setView}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          popup
        />
      </div>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Schedule Interview</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Candidate *
                  </label>
                  <select
                    value={interviewForm.candidateId}
                    onChange={(e) => {
                      const candidate = candidates.find(c => c.id === e.target.value)
                      setInterviewForm(prev => ({
                        ...prev,
                        candidateId: e.target.value,
                        candidateName: candidate?.candidate_name || '',
                        jobTitle: candidate?.job?.title || ''
                      }))
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a candidate</option>
                    {candidates.map(candidate => (
                      <option key={candidate.id} value={candidate.id}>
                        {candidate.candidate_name} - {candidate.job?.title || 'Unknown Job'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interview Type *
                  </label>
                  <select
                    value={interviewForm.interviewType}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {interviewTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time *
                  </label>
                  <DatePicker
                    selected={interviewForm.scheduledDate}
                    onChange={(date) => setInterviewForm(prev => ({ ...prev, scheduledDate: date }))}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="MMMM d, yyyy h:mm aa"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <select
                    value={interviewForm.duration}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={90}>1.5 hours</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location/Meeting Link
                  </label>
                  <input
                    type="text"
                    value={interviewForm.location}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, location: e.target.value }))}
                    placeholder={interviewForm.interviewType === 'video' ? 'Zoom/Teams link' : 'Office address'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Interviewer
                  </label>
                  <input
                    type="text"
                    value={interviewForm.interviewer}
                    onChange={(e) => setInterviewForm(prev => ({ ...prev, interviewer: e.target.value }))}
                    placeholder="Interviewer name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={interviewForm.notes}
                  onChange={(e) => setInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Interview notes, agenda, or special instructions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleInterview}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview Details Modal */}
      {showInterviewModal && selectedInterview && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Interview Details</h3>
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900">{selectedInterview.candidateName}</h4>
                  <p className="text-gray-600">{selectedInterview.jobTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {moment(selectedInterview.start).format('MMMM D, YYYY [at] h:mm A')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Duration</p>
                    <p className="text-sm text-gray-600">
                      {moment(selectedInterview.end).diff(moment(selectedInterview.start), 'minutes')} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {React.createElement(getInterviewTypeIcon(selectedInterview.interviewType), { className: "h-5 w-5 text-gray-400" })}
                  <div>
                    <p className="text-sm font-medium text-gray-900">Type</p>
                    <p className="text-sm text-gray-600 capitalize">{selectedInterview.interviewType}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Location</p>
                    <p className="text-sm text-gray-600">{selectedInterview.location}</p>
                  </div>
                </div>
              </div>

              {selectedInterview.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">Notes</p>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedInterview.notes}
                  </p>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedInterview.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  selectedInterview.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedInterview.status}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {selectedInterview.status === 'scheduled' && (
                <>
                  <button
                    onClick={() => handleSendReminder(selectedInterview.id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminder
                  </button>
                  <button
                    onClick={() => handleUpdateInterview(selectedInterview.id, { status: 'completed' })}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Complete
                  </button>
                  <button
                    onClick={() => handleCancelInterview(selectedInterview.id)}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
