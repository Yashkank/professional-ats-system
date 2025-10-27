import React, { useState, useEffect } from 'react'
import { 
  User, FileText, Award, Briefcase, GraduationCap, Star, 
  X, Upload, Plus, Trash2, Save, Edit3, CheckCircle, AlertCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const ProfileEditor = ({ profile, onClose, onSave, initialTab = 'basic' }) => {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    // Basic Information
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    
    // Resume
    resume_url: profile?.resume_url || '',
    resume_file: null,
    
    // Skills
    skills: profile?.skills || [],
    newSkill: '',
    
    // Work Experience
    experience: profile?.experience || [],
    
    // Education
    education: profile?.education || [],
    
    // Certifications
    certifications: profile?.certifications || []
  })

  const [newExperience, setNewExperience] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    current: false,
    description: ''
  })

  const [newEducation, setNewEducation] = useState({
    institution: '',
    degree: '',
    field: '',
    start_date: '',
    end_date: '',
    current: false,
    gpa: ''
  })

  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date_earned: '',
    expiry_date: '',
    credential_id: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('File size must be less than 5MB')
        return
      }
      setFormData(prev => ({
        ...prev,
        resume_file: file,
        resume_url: URL.createObjectURL(file)
      }))
      toast.success('Resume uploaded successfully!')
    }
  }

  const handleAddSkill = () => {
    if (formData.newSkill.trim() && !formData.skills.includes(formData.newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, formData.newSkill.trim()],
        newSkill: ''
      }))
      toast.success('Skill added!')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
    toast.success('Skill removed!')
  }

  const handleAddExperience = () => {
    if (newExperience.company && newExperience.position) {
      setFormData(prev => ({
        ...prev,
        experience: [...prev.experience, { ...newExperience, id: Date.now() }]
      }))
      setNewExperience({
        company: '',
        position: '',
        start_date: '',
        end_date: '',
        current: false,
        description: ''
      })
      toast.success('Experience added!')
    }
  }

  const handleRemoveExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
    toast.success('Experience removed!')
  }

  const handleAddEducation = () => {
    if (newEducation.institution && newEducation.degree) {
      setFormData(prev => ({
        ...prev,
        education: [...prev.education, { ...newEducation, id: Date.now() }]
      }))
      setNewEducation({
        institution: '',
        degree: '',
        field: '',
        start_date: '',
        end_date: '',
        current: false,
        gpa: ''
      })
      toast.success('Education added!')
    }
  }

  const handleRemoveEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
    toast.success('Education removed!')
  }

  const handleAddCertification = () => {
    if (newCertification.name && newCertification.issuer) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...newCertification, id: Date.now() }]
      }))
      setNewCertification({
        name: '',
        issuer: '',
        date_earned: '',
        expiry_date: '',
        credential_id: ''
      })
      toast.success('Certification added!')
    }
  }

  const handleRemoveCertification = (id) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }))
    toast.success('Certification removed!')
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Validate required fields
      if (!formData.full_name.trim()) {
        toast.error('Please enter your full name')
        setIsLoading(false)
        return
      }
      
      if (!formData.email.trim()) {
        toast.error('Please enter your email address')
        setIsLoading(false)
        return
      }

      // Here you would typically send the data to your API
      console.log('Saving profile data:', formData)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onSave(formData)
      toast.success('Profile updated successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving profile:', error)
      toast.error('Failed to save profile')
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'certifications', label: 'Certifications', icon: Star }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Information */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your location"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resume Upload */}
            {activeTab === 'resume' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resume Upload</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Upload your resume (PDF format, max 5MB)</p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors inline-flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Choose File</span>
                    </label>
                    {formData.resume_file && (
                      <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 font-medium">✓ {formData.resume_file.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                  <div className="flex space-x-2 mb-4">
                    <input
                      type="text"
                      value={formData.newSkill}
                      onChange={(e) => setFormData(prev => ({ ...prev, newSkill: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add a skill (e.g., Python, React, JavaScript)"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                    />
                    <button
                      onClick={handleAddSkill}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {skill}
                        <button
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Work Experience */}
            {activeTab === 'experience' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                  
                  {/* Add New Experience Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Experience</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                        <input
                          type="text"
                          value={newExperience.company}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, company: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Company name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <input
                          type="text"
                          value={newExperience.position}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Job title"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newExperience.start_date}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={newExperience.end_date}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, end_date: e.target.value }))}
                          disabled={newExperience.current}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newExperience.current}
                            onChange={(e) => setNewExperience(prev => ({ ...prev, current: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">I currently work here</span>
                        </label>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={newExperience.description}
                          onChange={(e) => setNewExperience(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Describe your role and achievements"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddExperience}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Experience</span>
                    </button>
                  </div>

                  {/* Experience List */}
                  <div className="space-y-4">
                    {formData.experience.map((exp) => (
                      <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{exp.position}</h4>
                            <p className="text-blue-600 font-medium">{exp.company}</p>
                            <p className="text-sm text-gray-600">
                              {exp.start_date} - {exp.current ? 'Present' : exp.end_date}
                            </p>
                            {exp.description && (
                              <p className="text-sm text-gray-700 mt-2">{exp.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveExperience(exp.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Education */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                  
                  {/* Add New Education Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                        <input
                          type="text"
                          value={newEducation.institution}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, institution: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="University/School name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                        <input
                          type="text"
                          value={newEducation.degree}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, degree: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Bachelor's, Master's, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                        <input
                          type="text"
                          value={newEducation.field}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, field: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Computer Science, Business, etc."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                        <input
                          type="text"
                          value={newEducation.gpa}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, gpa: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3.8"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={newEducation.start_date}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, start_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={newEducation.end_date}
                          onChange={(e) => setNewEducation(prev => ({ ...prev, end_date: e.target.value }))}
                          disabled={newEducation.current}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newEducation.current}
                            onChange={(e) => setNewEducation(prev => ({ ...prev, current: e.target.checked }))}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">I am currently studying here</span>
                        </label>
                      </div>
                    </div>
                    <button
                      onClick={handleAddEducation}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Education</span>
                    </button>
                  </div>

                  {/* Education List */}
                  <div className="space-y-4">
                    {formData.education.map((edu) => (
                      <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                            <p className="text-blue-600 font-medium">{edu.institution}</p>
                            <p className="text-sm text-gray-600">
                              {edu.field} • {edu.start_date} - {edu.current ? 'Present' : edu.end_date}
                              {edu.gpa && ` • GPA: ${edu.gpa}`}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveEducation(edu.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Certifications */}
            {activeTab === 'certifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Certifications</h3>
                  
                  {/* Add New Certification Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium text-gray-900 mb-4">Add New Certification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                        <input
                          type="text"
                          value={newCertification.name}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="AWS Certified Solutions Architect"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                        <input
                          type="text"
                          value={newCertification.issuer}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, issuer: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Amazon Web Services"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date Earned</label>
                        <input
                          type="date"
                          value={newCertification.date_earned}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, date_earned: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                        <input
                          type="date"
                          value={newCertification.expiry_date}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, expiry_date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID (Optional)</label>
                        <input
                          type="text"
                          value={newCertification.credential_id}
                          onChange={(e) => setNewCertification(prev => ({ ...prev, credential_id: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Credential ID or verification URL"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleAddCertification}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Certification</span>
                    </button>
                  </div>

                  {/* Certifications List */}
                  <div className="space-y-4">
                    {formData.certifications.map((cert) => (
                      <div key={cert.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                            <p className="text-blue-600 font-medium">{cert.issuer}</p>
                            <p className="text-sm text-gray-600">
                              Earned: {cert.date_earned}
                              {cert.expiry_date && ` • Expires: ${cert.expiry_date}`}
                            </p>
                            {cert.credential_id && (
                              <p className="text-sm text-gray-500">ID: {cert.credential_id}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveCertification(cert.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer - Always visible at bottom */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl disabled:opacity-50 ring-2 ring-blue-200"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProfileEditor
