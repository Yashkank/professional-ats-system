import React, { useState, useEffect } from 'react'
import { 
  Mail, 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Pause, 
  Send, 
  Clock, 
  Users, 
  BarChart3, 
  Eye, 
  EyeOff, 
  Calendar,
  Filter,
  Search,
  Download,
  Upload,
  Copy,
  Settings,
  Target,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  FileText,
  Image,
  Link,
  List,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code
} from 'lucide-react'

const EmailCampaigns = ({ 
  candidates = [], 
  jobs = [],
  onCampaignSent,
  onCampaignScheduled 
}) => {
  const [campaigns, setCampaigns] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedCampaign, setSelectedCampaign] = useState(null)
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false)
  const [showCampaignBuilder, setShowCampaignBuilder] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedCandidates, setSelectedCandidates] = useState([])
  const [emailContent, setEmailContent] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateRange: 'all'
  })
  const [campaignStats, setCampaignStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalEmails: 0,
    openRate: 0,
    clickRate: 0,
    responseRate: 0
  })

  // Email Templates
  const defaultTemplates = [
    {
      id: 1,
      name: 'Job Application Acknowledgment',
      subject: 'Thank you for your application - {{job_title}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Thank you for your application!</h2>
          <p>Dear {{candidate_name}},</p>
          <p>Thank you for your interest in the <strong>{{job_title}}</strong> position at {{company_name}}.</p>
          <p>We have received your application and our team will review it carefully. We will be in touch within 5-7 business days with next steps.</p>
          <p>In the meantime, feel free to explore more opportunities on our careers page.</p>
          <p>Best regards,<br>{{recruiter_name}}<br>{{company_name}} HR Team</p>
        </div>
      `,
      type: 'acknowledgment',
      category: 'application'
    },
    {
      id: 2,
      name: 'Interview Invitation',
      subject: 'Interview Invitation - {{job_title}} at {{company_name}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Invitation</h2>
          <p>Dear {{candidate_name}},</p>
          <p>Congratulations! We were impressed by your application for the <strong>{{job_title}}</strong> position.</p>
          <p>We would like to invite you for an interview:</p>
          <ul>
            <li><strong>Date:</strong> {{interview_date}}</li>
            <li><strong>Time:</strong> {{interview_time}}</li>
            <li><strong>Location:</strong> {{interview_location}}</li>
            <li><strong>Interviewer:</strong> {{interviewer_name}}</li>
          </ul>
          <p>Please confirm your availability by replying to this email.</p>
          <p>Best regards,<br>{{recruiter_name}}<br>{{company_name}} HR Team</p>
        </div>
      `,
      type: 'interview',
      category: 'interview'
    },
    {
      id: 3,
      name: 'Rejection Letter',
      subject: 'Update on your application - {{job_title}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Application Update</h2>
          <p>Dear {{candidate_name}},</p>
          <p>Thank you for your interest in the <strong>{{job_title}}</strong> position at {{company_name}}.</p>
          <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
          <p>We encourage you to apply for other positions that may be a better fit for your skills and experience.</p>
          <p>Thank you again for your interest in {{company_name}}.</p>
          <p>Best regards,<br>{{recruiter_name}}<br>{{company_name}} HR Team</p>
        </div>
      `,
      type: 'rejection',
      category: 'application'
    },
    {
      id: 4,
      name: 'Follow-up Reminder',
      subject: 'Reminder: {{action_required}} - {{job_title}}',
      content: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Friendly Reminder</h2>
          <p>Dear {{candidate_name}},</p>
          <p>This is a friendly reminder regarding your application for the <strong>{{job_title}}</strong> position.</p>
          <p><strong>Action Required:</strong> {{action_required}}</p>
          <p>Please complete this step by {{deadline}} to continue in our process.</p>
          <p>If you have any questions, please don't hesitate to reach out.</p>
          <p>Best regards,<br>{{recruiter_name}}<br>{{company_name}} HR Team</p>
        </div>
      `,
      type: 'followup',
      category: 'followup'
    }
  ]

  // Campaign Types
  const campaignTypes = [
    { id: 'single', name: 'Single Email', icon: Mail },
    { id: 'sequence', name: 'Email Sequence', icon: Clock },
    { id: 'broadcast', name: 'Broadcast', icon: Users },
    { id: 'automated', name: 'Automated', icon: Zap }
  ]

  // Initialize templates
  useEffect(() => {
    setTemplates(defaultTemplates)
  }, [])

  // Template Builder Functions
  const handleCreateTemplate = () => {
    setShowTemplateBuilder(true)
    setSelectedTemplate(null)
  }

  const handleEditTemplate = (template) => {
    setSelectedTemplate(template)
    setShowTemplateBuilder(true)
  }

  const handleSaveTemplate = (templateData) => {
    if (selectedTemplate) {
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? { ...t, ...templateData } : t))
    } else {
      const newTemplate = {
        id: Date.now(),
        ...templateData,
        created_at: new Date().toISOString()
      }
      setTemplates(prev => [...prev, newTemplate])
    }
    setShowTemplateBuilder(false)
    setSelectedTemplate(null)
  }

  const handleDeleteTemplate = (templateId) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId))
  }

  // Campaign Builder Functions
  const handleCreateCampaign = () => {
    setShowCampaignBuilder(true)
    setSelectedCampaign(null)
  }

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign)
    setShowCampaignBuilder(true)
  }

  const handleSaveCampaign = (campaignData) => {
    if (selectedCampaign) {
      setCampaigns(prev => prev.map(c => c.id === selectedCampaign.id ? { ...c, ...campaignData } : c))
    } else {
      const newCampaign = {
        id: Date.now(),
        ...campaignData,
        created_at: new Date().toISOString(),
        status: 'draft',
        sent_count: 0,
        open_count: 0,
        click_count: 0,
        response_count: 0
      }
      setCampaigns(prev => [...prev, newCampaign])
    }
    setShowCampaignBuilder(false)
    setSelectedCampaign(null)
  }

  const handleDeleteCampaign = (campaignId) => {
    setCampaigns(prev => prev.filter(c => c.id !== campaignId))
  }

  // Email Sending Functions
  const handleSendEmail = async (campaign) => {
    setIsSending(true)
    try {
      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update campaign status
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id 
          ? { ...c, status: 'sent', sent_at: new Date().toISOString() }
          : c
      ))
      
      if (onCampaignSent) {
        onCampaignSent(campaign)
      }
      
      // Update stats
      setCampaignStats(prev => ({
        ...prev,
        totalEmails: prev.totalEmails + (campaign.recipients?.length || 0),
        totalCampaigns: prev.totalCampaigns + 1
      }))
      
    } catch (error) {
      console.error('Error sending email:', error)
    } finally {
      setIsSending(false)
    }
  }

  const handleScheduleEmail = async (campaign) => {
    try {
      const scheduledDate = new Date(`${scheduleDate}T${scheduleTime}`)
      
      setCampaigns(prev => prev.map(c => 
        c.id === campaign.id 
          ? { ...c, status: 'scheduled', scheduled_at: scheduledDate.toISOString() }
          : c
      ))
      
      if (onCampaignScheduled) {
        onCampaignScheduled(campaign, scheduledDate)
      }
      
    } catch (error) {
      console.error('Error scheduling email:', error)
    }
  }

  // Template Processing
  const processTemplate = (template, candidate, job) => {
    let content = template.content
    let subject = template.subject
    
    const variables = {
      candidate_name: candidate?.full_name || candidate?.name || 'Candidate',
      job_title: job?.title || 'Position',
      company_name: job?.company?.name || 'Our Company',
      recruiter_name: 'John Smith', // This would come from user context
      interview_date: 'TBD',
      interview_time: 'TBD',
      interview_location: 'TBD',
      interviewer_name: 'TBD',
      action_required: 'Complete your application',
      deadline: 'Within 3 days'
    }
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(regex, value)
      subject = subject.replace(regex, value)
    })
    
    return { content, subject }
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filters.status !== 'all' && campaign.status !== filters.status) return false
    if (filters.type !== 'all' && campaign.type !== filters.type) return false
    return true
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return Edit
      case 'scheduled': return Clock
      case 'sent': return Send
      case 'paused': return Pause
      case 'completed': return CheckCircle
      default: return Mail
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Mail className="h-6 w-6 mr-2 text-blue-600" />
            Email Campaigns
          </h2>
          <p className="text-gray-600">Automate candidate communication and follow-ups</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleCreateTemplate}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center"
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </button>
          <button
            onClick={handleCreateCampaign}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Mail className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.totalCampaigns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Play className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.activeCampaigns}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.totalEmails}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.openRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Target className="h-8 w-8 text-indigo-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Click Rate</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.clickRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <MessageSquare className="h-8 w-8 text-pink-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">{campaignStats.responseRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="sent">Sent</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="border border-gray-300 rounded px-3 py-1 text-sm"
          >
            <option value="all">All Types</option>
            <option value="single">Single Email</option>
            <option value="sequence">Email Sequence</option>
            <option value="broadcast">Broadcast</option>
            <option value="automated">Automated</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="space-y-4">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600">Create your first email campaign to get started</p>
          </div>
        ) : (
          filteredCampaigns.map((campaign) => {
            const StatusIcon = getStatusIcon(campaign.status)
            return (
              <div key={campaign.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {campaign.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{campaign.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium">{campaign.type}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Recipients:</span>
                          <span className="ml-2 font-medium">{campaign.recipients?.length || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Sent:</span>
                          <span className="ml-2 font-medium">{campaign.sent_count || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Open Rate:</span>
                          <span className="ml-2 font-medium">{campaign.open_count || 0}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditCampaign(campaign)}
                        className="text-blue-600 hover:text-blue-800 p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleSendEmail(campaign)}
                          disabled={isSending}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 flex items-center"
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </button>
                      )}
                      
                      {campaign.status === 'draft' && (
                        <button
                          onClick={() => handleScheduleEmail(campaign)}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Schedule
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        className="text-red-600 hover:text-red-800 p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <TemplateBuilder
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setShowTemplateBuilder(false)}
        />
      )}

      {/* Campaign Builder Modal */}
      {showCampaignBuilder && (
        <CampaignBuilder
          campaign={selectedCampaign}
          templates={templates}
          candidates={candidates}
          jobs={jobs}
          onSave={handleSaveCampaign}
          onClose={() => setShowCampaignBuilder(false)}
        />
      )}
    </div>
  )
}

// Template Builder Component
const TemplateBuilder = ({ template, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    subject: template?.subject || '',
    content: template?.content || '',
    type: template?.type || 'acknowledgment',
    category: template?.category || 'application'
  })

  const handleSave = () => {
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Email Template Builder</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter template name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="acknowledgment">Acknowledgment</option>
                <option value="interview">Interview</option>
                <option value="rejection">Rejection</option>
                <option value="followup">Follow-up</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholder="Enter email subject"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2 h-64"
              placeholder="Enter email content (HTML supported)"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Campaign Builder Component
const CampaignBuilder = ({ campaign, templates, candidates, jobs, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    type: campaign?.type || 'single',
    template_id: campaign?.template_id || '',
    recipients: campaign?.recipients || [],
    subject: campaign?.subject || '',
    content: campaign?.content || ''
  })

  const handleSave = () => {
    onSave(formData)
  }

  const handleTemplateSelect = (templateId) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        subject: template.subject,
        content: template.content
      }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Campaign Builder</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter campaign name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 h-20"
                placeholder="Enter campaign description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="single">Single Email</option>
                <option value="sequence">Email Sequence</option>
                <option value="broadcast">Broadcast</option>
                <option value="automated">Automated</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
              <select
                value={formData.template_id}
                onChange={(e) => handleTemplateSelect(parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Choose a template...</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Enter email subject"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2 h-64"
                placeholder="Enter email content"
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Campaign
          </button>
        </div>
      </div>
    </div>
  )
}

export default EmailCampaigns
