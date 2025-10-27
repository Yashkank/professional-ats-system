import React, { useState, useEffect, useCallback, useRef } from 'react'
import { 
  Upload, FileText, Wand2, Save, Send, CheckCircle, XCircle, 
  AlertCircle, ExternalLink, Github, Linkedin, Globe, 
  ChevronLeft, ChevronRight, Clock, User, Mail, Phone,
  GraduationCap, Briefcase, Award, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'

const SmartApplicationForm = ({ 
  job, 
  onClose, 
  onSubmit, 
  onSaveDraft,
  initialData = null 
}) => {
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Resume & Basic Info
    resume: null,
    resumeUrl: '',
    resumeText: '',
    parsedData: null,
    
    // Step 2: Cover Letter & Professional Profiles
    coverLetter: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    
    // Step 3: Skills & Additional Info
    skills: [],
    experience: '',
    education: '',
    certifications: '',
    
    // Step 4: Job-specific Questions
    customAnswers: {},
    
    // Metadata
    isDraft: true,
    lastSaved: null
  })

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef(null)
  const [lastAutoSave, setLastAutoSave] = useState(null)

  // File upload refs
  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  // Initialize form with existing data or job info
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (formData.isDraft && onSaveDraft) {
      try {
        setIsSavingDraft(true)
        await onSaveDraft(formData)
        setLastAutoSave(new Date())
        toast.success('Draft saved automatically', { duration: 2000 })
      } catch (error) {
        console.error('Auto-save failed:', error)
      } finally {
        setIsSavingDraft(false)
      }
    }
  }, [formData, onSaveDraft])

  // Auto-save on form changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSave()
    }, 3000) // Auto-save every 3 seconds

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, autoSave])

  // Manual save draft
  const handleSaveDraft = async () => {
    try {
      setIsSavingDraft(true)
      await onSaveDraft?.(formData)
      setLastAutoSave(new Date())
      toast.success('Draft saved successfully')
    } catch (error) {
      toast.error('Failed to save draft')
    } finally {
      setIsSavingDraft(false)
    }
  }

  // File upload handlers
  const handleFileUpload = async (file) => {
    // Validate file
    if (!validateFile(file)) return

    try {
      // Show loading state
      toast.loading('Processing resume...', { id: 'resume-processing' })

      // Simulate file upload (replace with actual upload logic)
      const formData = new FormData()
      formData.append('resume', file)
      
      // Mock upload response
      const uploadResponse = {
        url: `https://example.com/resumes/${file.name}`,
        text: await extractTextFromFile(file)
      }

      // Parse resume text
      const parsedData = await parseResumeText(uploadResponse.text)

      // Update form data
      setFormData(prev => ({
        ...prev,
        resume: file,
        resumeUrl: uploadResponse.url,
        resumeText: uploadResponse.text,
        parsedData,
        skills: parsedData.skills || [],
        experience: parsedData.experience || '',
        education: parsedData.education || ''
      }))

      toast.success('Resume processed successfully', { id: 'resume-processing' })
      
      // Move to next step
      if (currentStep === 1) {
        setCurrentStep(2)
      }
    } catch (error) {
      toast.error('Failed to process resume', { id: 'resume-processing' })
      console.error('Resume processing error:', error)
    }
  }

  // File validation
  const validateFile = (file) => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB')
      return false
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOC, or DOCX file')
      return false
    }

    return true
  }

  // Extract text from file using real API
  const extractTextFromFile = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to extract text from file')
      }
      
      const result = await response.json()
      return result.extracted_text || "Could not extract text from file"
    } catch (error) {
      console.error('Error extracting text from file:', error)
      return "Error extracting text from file"
    }
  }

  // Parse resume text using real API
  const parseResumeText = async (text) => {
    try {
      const response = await fetch('/api/v1/ai/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ text })
      })
      
      if (!response.ok) {
        throw new Error('Failed to parse resume text')
      }
      
      const result = await response.json()
      return result.parsed_data || {
        name: '',
        email: '',
        phone: '',
        skills: [],
        experience: '',
        education: ''
      }
    } catch (error) {
      console.error('Error parsing resume text:', error)
      return {
        name: '',
        email: '',
        phone: '',
        skills: [],
        experience: '',
        education: ''
      }
    }
  }

  // AI Cover Letter Generation using real API
  const generateCoverLetter = async () => {
    if (!formData.resumeText || !job) {
      toast.error('Please upload a resume first')
      return
    }

    try {
      toast.loading('Generating cover letter...', { id: 'cover-letter' })
      
      const response = await fetch('/api/v1/ai/generate-cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          job_title: job.title,
          company_name: job.company_name,
          job_description: job.description,
          resume_text: formData.resumeText,
          candidate_name: formData.parsedData?.name || ''
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate cover letter')
      }
      
      const result = await response.json()
      const generatedLetter = result.cover_letter || 'Could not generate cover letter'

      setFormData(prev => ({
        ...prev,
        coverLetter: generatedLetter.trim()
      }))

      toast.success('Cover letter generated successfully', { id: 'cover-letter' })
    } catch (error) {
      console.error('Cover letter generation error:', error)
      toast.error('Failed to generate cover letter', { id: 'cover-letter' })
    }
  }

  // URL validation
  const validateUrl = (url, type) => {
    if (!url) return true
    
    const patterns = {
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
      github: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
      portfolio: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/
    }

    return patterns[type]?.test(url) || false
  }

  // Skill matching calculation
  const calculateSkillMatch = () => {
    if (!job?.required_skills || !formData.skills.length) return 0
    
    const jobSkills = job.required_skills.map(s => s.toLowerCase())
    const candidateSkills = formData.skills.map(s => s.toLowerCase())
    
    const matchedSkills = jobSkills.filter(skill => 
      candidateSkills.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    )
    
    return Math.round((matchedSkills.length / jobSkills.length) * 100)
  }

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (currentStep < 4) {
      toast.error('Please complete all steps before submitting')
      return
    }

    try {
      setIsSubmitting(true)
      
      const applicationData = {
        job_id: job.id,
        cover_letter: formData.coverLetter,
        resume_url: formData.resumeUrl,
        linkedin_url: formData.linkedinUrl,
        github_url: formData.githubUrl,
        portfolio_url: formData.portfolioUrl,
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
        certifications: formData.certifications,
        custom_answers: formData.customAnswers,
        is_draft: false
      }

      await onSubmit?.(applicationData)
      toast.success('Application submitted successfully!')
      onClose?.()
    } catch (error) {
      toast.error('Failed to submit application')
      console.error('Application submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step navigation
  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const skillMatch = calculateSkillMatch()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Apply to {job?.title}
              </h2>
              <p className="text-gray-600">{job?.company_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              {lastAutoSave && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" />
                  Saved {lastAutoSave.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`w-12 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Resume</span>
              <span>Cover Letter</span>
              <span>Skills & Info</span>
              <span>Review</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step 1: Resume Upload */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Upload Your Resume</h3>
              
              {/* Drag and Drop Zone */}
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  formData.resume 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {formData.resume ? (
                  <div className="space-y-4">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">{formData.resume.name}</p>
                      <p className="text-sm text-gray-500">
                        {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Upload Different File
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Drag and drop your resume here
                      </p>
                      <p className="text-sm text-gray-500">
                        or click to browse files
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        PDF, DOC, DOCX up to 5MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />

              {/* Parsed Data Preview */}
              {formData.parsedData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Resume Parsed Successfully!</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span> {formData.parsedData.name}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span> {formData.parsedData.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span> {formData.parsedData.phone}
                    </div>
                    <div>
                      <span className="font-medium">Skills:</span> {formData.parsedData.skills?.length || 0} found
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Cover Letter & Professional Profiles */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Cover Letter & Professional Profiles</h3>
              
              {/* Cover Letter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Cover Letter
                  </label>
                  <button
                    type="button"
                    onClick={generateCoverLetter}
                    className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <Wand2 className="h-4 w-4 mr-1" />
                    Generate with AI
                  </button>
                </div>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData(prev => ({ ...prev, coverLetter: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your cover letter here..."
                />
              </div>

              {/* Professional Profiles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Linkedin className="h-4 w-4 inline mr-1" />
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formData.linkedinUrl && !validateUrl(formData.linkedinUrl, 'linkedin')
                        ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://linkedin.com/in/yourname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Github className="h-4 w-4 inline mr-1" />
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, githubUrl: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formData.githubUrl && !validateUrl(formData.githubUrl, 'github')
                        ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://github.com/yourname"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={formData.portfolioUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, portfolioUrl: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formData.portfolioUrl && !validateUrl(formData.portfolioUrl, 'portfolio')
                        ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Skills & Additional Info */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Skills & Additional Information</h3>
              
              {/* Skill Match Indicator */}
              {job?.required_skills && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Skill Match</h4>
                    <span className="text-sm font-medium text-gray-600">
                      {skillMatch}% match
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        skillMatch >= 80 ? 'bg-green-500' :
                        skillMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${skillMatch}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-green-700 mb-1">✅ Your Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {formData.skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                        {formData.skills.length > 5 && (
                          <span className="text-gray-500">+{formData.skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 mb-1">Required Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {job.required_skills.slice(0, 5).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                            {skill}
                          </span>
                        ))}
                        {job.required_skills.length > 5 && (
                          <span className="text-gray-500">+{job.required_skills.length - 5} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Skills Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.skills.join(', ')}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Python, JavaScript, React, Node.js, SQL"
                />
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Experience
                </label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your relevant work experience..."
                />
              </div>

              {/* Education */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Education
                </label>
                <textarea
                  value={formData.education}
                  onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your educational background..."
                />
              </div>

              {/* Certifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certifications
                </label>
                <textarea
                  value={formData.certifications}
                  onChange={(e) => setFormData(prev => ({ ...prev, certifications: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any relevant certifications..."
                />
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Review Your Application</h3>
              
              {/* Application Summary */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="font-medium text-gray-900 mb-4">Application Summary</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Personal Information</h5>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Name:</span> {formData.parsedData?.name || 'Not provided'}</p>
                      <p><span className="font-medium">Email:</span> {formData.parsedData?.email || 'Not provided'}</p>
                      <p><span className="font-medium">Phone:</span> {formData.parsedData?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-700 mb-2">Professional Profiles</h5>
                    <div className="space-y-1 text-sm">
                      {formData.linkedinUrl && (
                        <p className="flex items-center">
                          <Linkedin className="h-4 w-4 mr-1" />
                          <a href={formData.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            LinkedIn Profile
                          </a>
                        </p>
                      )}
                      {formData.githubUrl && (
                        <p className="flex items-center">
                          <Github className="h-4 w-4 mr-1" />
                          <a href={formData.githubUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            GitHub Profile
                          </a>
                        </p>
                      )}
                      {formData.portfolioUrl && (
                        <p className="flex items-center">
                          <Globe className="h-4 w-4 mr-1" />
                          <a href={formData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Portfolio
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium text-gray-700 mb-2">Skills Match</h5>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                      <div
                        className={`h-2 rounded-full ${
                          skillMatch >= 80 ? 'bg-green-500' :
                          skillMatch >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${skillMatch}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-600">{skillMatch}%</span>
                  </div>
                </div>
              </div>

              {/* Cover Letter Preview */}
              {formData.coverLetter && (
                <div>
                  <h5 className="font-medium text-gray-700 mb-2">Cover Letter Preview</h5>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {formData.coverLetter}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </button>
              )}
              
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSavingDraft}
                className="flex items-center px-4 py-2 text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-1" />
                {isSavingDraft ? 'Saving...' : 'Save Draft'}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4 mr-1" />
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SmartApplicationForm

