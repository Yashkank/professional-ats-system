import React, { useState } from 'react'
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, 
  Award, GraduationCap, FileText, Download, 
  Eye, CheckCircle, XCircle, MessageCircle, Star,
  ExternalLink, Edit, Trash2, Clock, Building
} from 'lucide-react'

export default function CandidateProfile({ 
  candidate, 
  applications = [], 
  onStatusUpdate, 
  onAddNote,
  onDownloadResume,
  onScheduleInterview,
  onSendMessage 
}) {
  const [showResume, setShowResume] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [notes, setNotes] = useState(candidate?.notes || [])

  const handleAddNote = () => {
    if (newNote.trim()) {
      const note = {
        id: Date.now(),
        content: newNote,
        author: 'Recruiter',
        timestamp: new Date().toISOString(),
        type: 'note'
      }
      setNotes(prev => [note, ...prev])
      setNewNote('')
      
      if (onAddNote) {
        onAddNote(candidate.id, note)
      }
    }
  }

  const handleStatusUpdate = (newStatus) => {
    if (onStatusUpdate) {
      onStatusUpdate(candidate.id, newStatus)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'interview':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return CheckCircle
      case 'rejected':
        return XCircle
      case 'pending':
        return Clock
      case 'interview':
        return Calendar
      default:
        return Clock
    }
  }

  if (!candidate) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select a candidate to view profile</p>
        </div>
      </div>
    )
  }

  const StatusIcon = getStatusIcon(candidate.status)

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{candidate.candidate_name}</h2>
              <p className="text-gray-600">{candidate.job?.title || 'Unknown Position'}</p>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate.status)}`}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {candidate.status}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResume(!showResume)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{candidate.email || 'Not provided'}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{candidate.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{candidate.location || 'Not provided'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  Applied {new Date(candidate.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{candidate.job?.title || 'Unknown Job'}</span>
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">{candidate.job?.company?.name || 'Unknown Company'}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  {candidate.experience || 'Not specified'} years experience
                </span>
              </div>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-gray-400 mr-3" />
                <span className="text-gray-600">
                  Match Score: {candidate.match_score || 'N/A'}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Cover Letter */}
        {candidate.cover_letter && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{candidate.cover_letter}</p>
            </div>
          </div>
        )}

        {/* Resume Section */}
        {showResume && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resume</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onDownloadResume?.(candidate.resume_url)}
                  className="inline-flex items-center px-3 py-1 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
                <button
                  onClick={() => setShowResume(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              {candidate.resume_url ? (
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Resume available for download</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {candidate.resume_url.split('/').pop()}
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No resume uploaded</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes Section */}
        {showNotes && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notes & Comments</h3>
              <button
                onClick={() => setShowNotes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
            
            {/* Add Note Form */}
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about this candidate..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddNote}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Add Note
                </button>
              </div>
            </div>

            {/* Notes List */}
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{note.author}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{note.content}</p>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-center py-4">
                  <MessageCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No notes yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {candidate.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate('accepted')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors duration-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept Application
              </button>
              <button
                onClick={() => handleStatusUpdate('rejected')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject Application
              </button>
              <button
                onClick={() => handleStatusUpdate('interview')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Interview
              </button>
            </>
          )}
          
          <button
            onClick={() => onSendMessage?.(candidate.id)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Message
          </button>
          
          <button
            onClick={() => onDownloadResume?.(candidate.resume_url)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Resume
          </button>
        </div>
      </div>
    </div>
  )
}
