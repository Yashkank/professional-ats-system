import React, { useState, useEffect, useRef } from 'react'
import { 
  MessageCircle, Send, Phone, Video, Calendar, Bell, 
  Users, Clock, CheckCircle, XCircle, AlertCircle, MoreVertical,
  Paperclip, Smile, Mic, MicOff, Volume2, VolumeX, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const CommunicationHub = ({ candidateId, onClose }) => {
  const [activeTab, setActiveTab] = useState('messages')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [scheduledInterviews, setScheduledInterviews] = useState([])
  const messagesEndRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)

  // Mock data - replace with real API calls
  useEffect(() => {
    // Load messages
    setMessages([
      {
        id: 1,
        sender: 'recruiter',
        senderName: 'Sarah Johnson',
        senderRole: 'Senior Recruiter',
        content: 'Hi! I reviewed your application for the Python Developer position. Your experience looks great!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: true,
        type: 'text'
      },
      {
        id: 2,
        sender: 'candidate',
        content: 'Thank you! I\'m very excited about this opportunity.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isRead: true,
        type: 'text'
      },
      {
        id: 3,
        sender: 'recruiter',
        senderName: 'Sarah Johnson',
        senderRole: 'Senior Recruiter',
        content: 'Would you be available for a technical interview next week?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isRead: false,
        type: 'text'
      }
    ])

    // Load notifications
    setNotifications([
      {
        id: 1,
        type: 'message',
        title: 'New message from Sarah Johnson',
        content: 'Would you be available for a technical interview next week?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false
      },
      {
        id: 2,
        type: 'application',
        title: 'Application Status Update',
        content: 'Your application for Senior Python Developer has moved to "Under Review"',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: true
      },
      {
        id: 3,
        type: 'interview',
        title: 'Interview Scheduled',
        content: 'Technical interview scheduled for tomorrow at 2:00 PM',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isRead: true
      }
    ])

    // Load scheduled interviews
    setScheduledInterviews([
      {
        id: 1,
        title: 'Technical Interview - Python Developer',
        company: 'TechCorp Solutions',
        recruiter: 'Sarah Johnson',
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        time: '14:00',
        duration: '60 minutes',
        type: 'video',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        status: 'scheduled'
      },
      {
        id: 2,
        title: 'HR Interview - Culture Fit',
        company: 'TechCorp Solutions',
        recruiter: 'Mike Chen',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '10:00',
        duration: '45 minutes',
        type: 'phone',
        phoneNumber: '+1 (555) 123-4567',
        status: 'scheduled'
      }
    ])
  }, [candidateId])

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      sender: 'candidate',
      content: newMessage.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    
    // Simulate typing indicator
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      // Simulate recruiter response
      const response = {
        id: Date.now() + 1,
        sender: 'recruiter',
        senderName: 'Sarah Johnson',
        senderRole: 'Senior Recruiter',
        content: 'Thanks for your message! I\'ll get back to you soon.',
        timestamp: new Date(),
        isRead: false,
        type: 'text'
      }
      setMessages(prev => [...prev, response])
    }, 2000)

    toast.success('Message sent!')
  }

  // Handle voice recording
  const handleVoiceRecord = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      toast.success('Recording started...')
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false)
        toast.success('Voice message recorded!')
      }, 3000)
    }
  }

  // Mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    )
  }

  // Join interview
  const joinInterview = (interview) => {
    if (interview.type === 'video') {
      window.open(interview.meetingLink, '_blank')
    } else if (interview.type === 'phone') {
      window.open(`tel:${interview.phoneNumber}`)
    }
    toast.success('Joining interview...')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Communication Hub</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close Communication Hub"
            title="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-120px)]">
          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('messages')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'messages'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="h-4 w-4 inline mr-2" />
                Messages
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'notifications'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Bell className="h-4 w-4 inline mr-2" />
                Notifications
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('interviews')}
                className={`flex-1 px-4 py-3 text-sm font-medium ${
                  activeTab === 'interviews'
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="h-4 w-4 inline mr-2" />
                Interviews
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-4 h-full overflow-y-auto">
              {activeTab === 'messages' && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900 mb-3">Recent Conversations</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                          SJ
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
                          <p className="text-xs text-gray-500">Senior Recruiter</p>
                          <p className="text-xs text-gray-400 truncate">Would you be available for...</p>
                        </div>
                        <div className="text-xs text-gray-400">30m</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 ${
                        notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                      onClick={() => markNotificationAsRead(notification.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.content}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'interviews' && (
                <div className="space-y-3">
                  {scheduledInterviews.map((interview) => (
                    <div key={interview.id} className="p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{interview.title}</h4>
                          <p className="text-xs text-gray-600">{interview.company}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {interview.date.toLocaleDateString()} at {interview.time}
                          </p>
                          <p className="text-xs text-gray-500">{interview.duration}</p>
                        </div>
                        <button
                          onClick={() => joinInterview(interview)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
                        >
                          {interview.type === 'video' ? 'Join' : 'Call'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'messages' && (
              <>
                {/* Messages Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                      SJ
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Sarah Johnson</h3>
                      <p className="text-sm text-gray-500">Senior Recruiter • Online</p>
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'candidate' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'candidate'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {message.sender === 'recruiter' && (
                          <p className="text-xs font-medium mb-1">{message.senderName}</p>
                        )}
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'candidate' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type your message..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={handleVoiceRecord}
                      className={`p-2 ${isRecording ? 'text-red-500' : 'text-gray-400'} hover:text-gray-600`}
                    >
                      {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'notifications' && (
              <div className="flex-1 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">All Notifications</h3>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.isRead ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-3 h-3 rounded-full mt-2 ${
                          notification.isRead ? 'bg-gray-300' : 'bg-blue-500'
                        }`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{notification.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{notification.content}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'interviews' && (
              <div className="flex-1 p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduled Interviews</h3>
                <div className="space-y-4">
                  {scheduledInterviews.map((interview) => (
                    <div key={interview.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{interview.title}</h4>
                          <p className="text-sm text-gray-600">{interview.company}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Recruiter: {interview.recruiter}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-1" />
                              {interview.date.toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-1" />
                              {interview.time}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              {interview.type === 'video' ? <Video className="h-4 w-4 mr-1" /> : <Phone className="h-4 w-4 mr-1" />}
                              {interview.type === 'video' ? 'Video Call' : 'Phone Call'}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => joinInterview(interview)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            {interview.type === 'video' ? 'Join Meeting' : 'Call Now'}
                          </button>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            interview.status === 'scheduled' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {interview.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Close Button - Alternative */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 shadow-lg"
            title="Close Communication Hub"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CommunicationHub
