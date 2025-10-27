import React, { useState } from 'react'
import {
  Mail, Send, Clock, Calendar, MapPin, Video, Phone,
  CheckCircle, AlertCircle, XCircle, User, Building
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EmailNotifications({ 
  interview, 
  onSendEmail,
  onSendReminder 
}) {
  const [emailType, setEmailType] = useState('confirmation')
  const [customMessage, setCustomMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const emailTemplates = {
    confirmation: {
      subject: 'Interview Confirmation - {jobTitle}',
      body: `Dear {candidateName},

Thank you for your interest in the {jobTitle} position at {companyName}. We are pleased to confirm your interview scheduled for:

Date: {interviewDate}
Time: {interviewTime}
Duration: {duration} minutes
Type: {interviewType}
Location: {location}

Please arrive 10 minutes early and bring a copy of your resume. If you have any questions or need to reschedule, please contact us at {contactEmail}.

We look forward to meeting you!

Best regards,
{interviewerName}
{companyName}`
    },
    reminder: {
      subject: 'Interview Reminder - {jobTitle}',
      body: `Dear {candidateName},

This is a friendly reminder about your upcoming interview for the {jobTitle} position:

Date: {interviewDate}
Time: {interviewTime}
Duration: {duration} minutes
Type: {interviewType}
Location: {location}

Please ensure you have the necessary materials ready and test your equipment if it's a video interview.

If you need to reschedule, please contact us immediately at {contactEmail}.

We look forward to speaking with you!

Best regards,
{interviewerName}
{companyName}`
    },
    reschedule: {
      subject: 'Interview Reschedule Request - {jobTitle}',
      body: `Dear {candidateName},

We need to reschedule your interview for the {jobTitle} position. We apologize for any inconvenience this may cause.

Please let us know your availability for the following times:
- [New time option 1]
- [New time option 2]
- [New time option 3]

We will confirm the new time as soon as possible. If none of these times work for you, please suggest alternative times.

Thank you for your understanding.

Best regards,
{interviewerName}
{companyName}`
    },
    cancellation: {
      subject: 'Interview Cancellation - {jobTitle}',
      body: `Dear {candidateName},

We regret to inform you that we need to cancel your interview for the {jobTitle} position scheduled for {interviewDate}.

We apologize for any inconvenience this may cause. We will keep your application on file and may contact you in the future if a suitable position becomes available.

Thank you for your interest in our company.

Best regards,
{interviewerName}
{companyName}`
    }
  }

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return Video
      case 'phone':
        return Phone
      case 'in-person':
        return MapPin
      default:
        return Calendar
    }
  }

  const getInterviewTypeLabel = (type) => {
    switch (type) {
      case 'video':
        return 'Video Interview'
      case 'phone':
        return 'Phone Interview'
      case 'in-person':
        return 'In-Person Interview'
      case 'technical':
        return 'Technical Interview'
      default:
        return 'Interview'
    }
  }

  const formatEmailContent = (template) => {
    if (!interview) return template

    const replacements = {
      '{candidateName}': interview.candidateName || 'Candidate',
      '{jobTitle}': interview.jobTitle || 'Position',
      '{companyName}': 'Your Company', // This would come from user context
      '{interviewDate}': new Date(interview.start).toLocaleDateString(),
      '{interviewTime}': new Date(interview.start).toLocaleTimeString(),
      '{duration}': Math.round((new Date(interview.end) - new Date(interview.start)) / (1000 * 60)),
      '{interviewType}': getInterviewTypeLabel(interview.interviewType),
      '{location}': interview.location || 'TBD',
      '{contactEmail}': 'hr@yourcompany.com', // This would come from user context
      '{interviewerName}': interview.interviewer || 'Interviewer'
    }

    let content = template
    Object.entries(replacements).forEach(([key, value]) => {
      content = content.replace(new RegExp(key, 'g'), value)
    })

    return content
  }

  const handleSendEmail = async () => {
    if (!interview) return

    setIsSending(true)
    try {
      const template = emailTemplates[emailType]
      const subject = formatEmailContent(template.subject)
      const body = formatEmailContent(template.body)

      const emailData = {
        to: interview.candidateEmail || 'candidate@email.com',
        subject,
        body: customMessage || body,
        interviewId: interview.id,
        type: emailType
      }

      if (onSendEmail) {
        await onSendEmail(emailData)
      }

      toast.success('Email sent successfully')
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setIsSending(false)
    }
  }

  const handleSendReminder = async () => {
    if (!interview) return

    setIsSending(true)
    try {
      if (onSendReminder) {
        await onSendReminder(interview)
      }
      toast.success('Reminder sent successfully')
    } catch (error) {
      toast.error('Failed to send reminder')
    } finally {
      setIsSending(false)
    }
  }

  if (!interview) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an interview to send notifications</p>
        </div>
      </div>
    )
  }

  const currentTemplate = emailTemplates[emailType]

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
            <p className="text-gray-600">{interview.candidateName} - {interview.jobTitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">
              {new Date(interview.start).toLocaleDateString()} at {new Date(interview.start).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Interview Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interview Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Date & Time</p>
                <p className="text-sm text-gray-600">
                  {new Date(interview.start).toLocaleDateString()} at {new Date(interview.start).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {React.createElement(getInterviewTypeIcon(interview.interviewType), { className: "h-5 w-5 text-gray-400" })}
              <div>
                <p className="text-sm font-medium text-gray-900">Type</p>
                <p className="text-sm text-gray-600">{getInterviewTypeLabel(interview.interviewType)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Location</p>
                <p className="text-sm text-gray-600">{interview.location || 'TBD'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">Interviewer</p>
                <p className="text-sm text-gray-600">{interview.interviewer || 'TBD'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Email Type Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(emailTemplates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => setEmailType(key)}
                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                  emailType === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-left">
                  <p className={`font-medium ${
                    emailType === key ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {template.subject.split(' - ')[0]}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {key === 'confirmation' && 'Send after scheduling'}
                    {key === 'reminder' && 'Send 24h before interview'}
                    {key === 'reschedule' && 'When rescheduling needed'}
                    {key === 'cancellation' && 'When cancelling interview'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Email Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Email Preview</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700">Subject:</p>
              <p className="text-sm text-gray-900 font-mono">
                {formatEmailContent(currentTemplate.subject)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Body:</p>
              <div className="bg-white rounded border p-3 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap font-sans">
                  {formatEmailContent(currentTemplate.body)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Custom Message */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Custom Message (Optional)</h3>
          <textarea
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add any additional message or modify the email content..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to use the template as-is, or add custom content to append to the email.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleSendReminder}
            disabled={isSending}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            Send Reminder
          </button>
          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
