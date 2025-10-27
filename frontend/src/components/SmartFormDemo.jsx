import React, { useState } from 'react'
import SmartApplicationForm from './SmartApplicationForm'
import ApplicationButton from './ApplicationButton'

const SmartFormDemo = () => {
  const [showForm, setShowForm] = useState(false)
  const [submittedApplications, setSubmittedApplications] = useState([])

  // Mock job data
  const mockJob = {
    id: 'demo-job-1',
    title: 'Senior Python Developer',
    company_name: 'TechCorp Solutions',
    location: 'San Francisco, CA',
    description: 'We are looking for a senior Python developer to join our growing team. You will be responsible for building scalable web applications and working with modern technologies.',
    requirements: '5+ years Python experience, Django/FastAPI, PostgreSQL, AWS, Docker',
    required_skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'AWS', 'Docker', 'React', 'TypeScript'],
    salary_range: '$120,000 - $150,000',
    job_type: 'Full-time',
    experience_level: 'Senior',
    status: 'active'
  }

  const handleApplicationSubmit = async (applicationData) => {
    console.log('Demo: Application submitted:', applicationData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmittedApplications(prev => [...prev, {
      id: Date.now(),
      job: mockJob,
      data: applicationData,
      submittedAt: new Date()
    }])
    
    setShowForm(false)
  }

  const handleSaveDraft = async (draftData) => {
    console.log('Demo: Draft saved:', draftData)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Smart Application Form Demo
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Experience the AI-powered job application system with resume parsing, 
            skill matching, and intelligent cover letter generation.
          </p>
          
          <div className="flex justify-center space-x-4">
            <ApplicationButton
              job={mockJob}
              onApply={() => setShowForm(true)}
              variant="smart"
              size="lg"
            />
            <ApplicationButton
              job={mockJob}
              onApply={() => setShowForm(true)}
              variant="outline"
              size="lg"
            />
          </div>
        </div>

        {/* Job Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Preview</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{mockJob.title}</h3>
              <p className="text-gray-600">{mockJob.company_name} • {mockJob.location}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700">{mockJob.description}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {mockJob.required_skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resume Upload</h3>
            <p className="text-gray-600 text-sm">
              Drag & drop PDF/DOC files with automatic text extraction and parsing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Cover Letter</h3>
            <p className="text-gray-600 text-sm">
              Generate personalized cover letters using AI based on your resume and job description.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Skill Matching</h3>
            <p className="text-gray-600 text-sm">
              Visual skill match indicator showing how well you fit the job requirements.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">💾</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Save</h3>
            <p className="text-gray-600 text-sm">
              Automatic draft saving every few seconds so you never lose your progress.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Step Form</h3>
            <p className="text-gray-600 text-sm">
              Intuitive step-by-step process with progress tracking and validation.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">♿</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Accessible</h3>
            <p className="text-gray-600 text-sm">
              Built with accessibility in mind, supporting screen readers and keyboard navigation.
            </p>
          </div>
        </div>

        {/* Submitted Applications */}
        {submittedApplications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Submitted Applications ({submittedApplications.length})
            </h2>
            <div className="space-y-4">
              {submittedApplications.map((app) => (
                <div key={app.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{app.job.title}</h3>
                      <p className="text-sm text-gray-600">{app.job.company_name}</p>
                      <p className="text-xs text-gray-500">
                        Submitted: {app.submittedAt.toLocaleString()}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Submitted
                    </span>
                  </div>
                  
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Skills:</strong> {app.data.skills?.join(', ') || 'None'}</p>
                    <p><strong>Resume:</strong> {app.data.resumeUrl ? 'Uploaded' : 'Not provided'}</p>
                    <p><strong>Cover Letter:</strong> {app.data.coverLetter ? 'Provided' : 'Not provided'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Smart Application Form Modal */}
        {showForm && (
          <SmartApplicationForm
            job={mockJob}
            onClose={() => setShowForm(false)}
            onSubmit={handleApplicationSubmit}
            onSaveDraft={handleSaveDraft}
          />
        )}
      </div>
    </div>
  )
}

export default SmartFormDemo

