import React, { useState, useEffect } from 'react'
import { 
  Brain, 
  FileText, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Download, 
  Eye, 
  Filter,
  TrendingUp,
  Clock,
  Target,
  Zap,
  BarChart3,
  Users,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Languages,
  MapPin,
  Calendar
} from 'lucide-react'

const AIResumeScreening = ({ 
  applications = [], 
  jobRequirements = {},
  onScreeningComplete,
  onBulkAction 
}) => {
  const [screenedApplications, setScreenedApplications] = useState([])
  const [isScreening, setIsScreening] = useState(false)
  const [screeningProgress, setScreeningProgress] = useState(0)
  const [selectedApplications, setSelectedApplications] = useState([])
  const [filters, setFilters] = useState({
    minScore: 0,
    maxScore: 100,
    showBiasFlags: false,
    showHighPotential: false,
    sortBy: 'score' // score, name, date, experience
  })
  const [screeningStats, setScreeningStats] = useState({
    totalScreened: 0,
    averageScore: 0,
    highPotential: 0,
    biasFlags: 0,
    timeSaved: 0
  })

  // AI Scoring Algorithm
  const calculateAIScore = (application, jobReq) => {
    let score = 0
    const factors = {
      skills: 0,
      experience: 0,
      education: 0,
      keywords: 0,
      format: 0,
      completeness: 0
    }

    const resume = application.resume_text || ''
    const candidate = application.candidate || {}

    // Skills Matching (40% weight)
    if (jobReq.required_skills && jobReq.required_skills.length > 0) {
      const requiredSkills = jobReq.required_skills.map(skill => skill.toLowerCase())
      const resumeSkills = extractSkillsFromResume(resume)
      const matchedSkills = requiredSkills.filter(skill => 
        resumeSkills.some(resumeSkill => resumeSkill.includes(skill))
      )
      factors.skills = (matchedSkills.length / requiredSkills.length) * 40
    }

    // Experience Level (25% weight)
    const experienceYears = extractExperienceYears(resume)
    const requiredExperience = jobReq.experience_years || 0
    if (experienceYears >= requiredExperience) {
      factors.experience = 25
    } else if (experienceYears > 0) {
      factors.experience = (experienceYears / requiredExperience) * 25
    }

    // Education Match (15% weight)
    if (jobReq.education_requirements) {
      const educationLevel = extractEducationLevel(resume)
      const requiredLevel = jobReq.education_requirements.toLowerCase()
      if (educationLevel.includes(requiredLevel) || educationLevel.includes('degree')) {
        factors.education = 15
      } else if (educationLevel.includes('diploma') || educationLevel.includes('certificate')) {
        factors.education = 10
      }
    }

    // Keyword Density (10% weight)
    const keywords = jobReq.keywords || []
    const keywordMatches = keywords.filter(keyword => 
      resume.toLowerCase().includes(keyword.toLowerCase())
    ).length
    factors.keywords = keywords.length > 0 ? (keywordMatches / keywords.length) * 10 : 0

    // Resume Format Quality (5% weight)
    factors.format = assessResumeFormat(resume)

    // Completeness (5% weight)
    factors.completeness = assessResumeCompleteness(resume, candidate)

    score = Object.values(factors).reduce((sum, factor) => sum + factor, 0)

    return {
      score: Math.round(score),
      factors,
      biasFlags: detectBias(resume, candidate),
      strengths: extractStrengths(resume, jobReq),
      weaknesses: extractWeaknesses(resume, jobReq),
      recommendations: generateRecommendations(resume, jobReq, factors)
    }
  }

  // Helper Functions
  const extractSkillsFromResume = (resume) => {
    const commonSkills = [
      'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
      'kubernetes', 'git', 'agile', 'scrum', 'leadership', 'management', 'analytics',
      'machine learning', 'data analysis', 'project management', 'communication'
    ]
    
    return commonSkills.filter(skill => 
      resume.toLowerCase().includes(skill)
    )
  }

  const extractExperienceYears = (resume) => {
    const experienceRegex = /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi
    const matches = resume.match(experienceRegex)
    if (matches) {
      const years = matches.map(match => parseInt(match.match(/\d+/)[0]))
      return Math.max(...years)
    }
    return 0
  }

  const extractEducationLevel = (resume) => {
    const educationKeywords = [
      'phd', 'doctorate', 'master', 'bachelor', 'degree', 'diploma', 'certificate',
      'mba', 'ms', 'bs', 'ba', 'associate', 'high school'
    ]
    
    return educationKeywords.filter(keyword => 
      resume.toLowerCase().includes(keyword)
    ).join(', ')
  }

  const assessResumeFormat = (resume) => {
    let score = 0
    if (resume.length > 500) score += 1
    if (resume.includes('experience') || resume.includes('work history')) score += 1
    if (resume.includes('education') || resume.includes('academic')) score += 1
    if (resume.includes('skills') || resume.includes('technical')) score += 1
    if (resume.includes('contact') || resume.includes('email')) score += 1
    return (score / 5) * 5
  }

  const assessResumeCompleteness = (resume, candidate) => {
    let score = 0
    if (candidate.full_name) score += 1
    if (candidate.email) score += 1
    if (candidate.phone) score += 1
    if (resume.length > 200) score += 1
    if (candidate.experience && candidate.experience.length > 0) score += 1
    return (score / 5) * 5
  }

  const detectBias = (resume, candidate) => {
    const flags = []
    
    // Age bias detection
    const ageKeywords = ['fresh graduate', 'recent graduate', 'young', 'senior', 'veteran', 'retired']
    if (ageKeywords.some(keyword => resume.toLowerCase().includes(keyword))) {
      flags.push({ type: 'age', severity: 'medium', message: 'Potential age-related language detected' })
    }

    // Gender bias detection
    const genderKeywords = ['he', 'she', 'his', 'her', 'him', 'himself', 'herself']
    const genderCount = genderKeywords.reduce((count, keyword) => 
      count + (resume.toLowerCase().match(new RegExp(keyword, 'g')) || []).length, 0
    )
    if (genderCount > 3) {
      flags.push({ type: 'gender', severity: 'low', message: 'Gender-specific pronouns detected' })
    }

    // Location bias
    if (candidate.location && candidate.location.includes('remote')) {
      flags.push({ type: 'location', severity: 'low', message: 'Remote work preference noted' })
    }

    return flags
  }

  const extractStrengths = (resume, jobReq) => {
    const strengths = []
    const resumeLower = resume.toLowerCase()
    
    if (jobReq.required_skills) {
      const matchedSkills = jobReq.required_skills.filter(skill => 
        resumeLower.includes(skill.toLowerCase())
      )
      if (matchedSkills.length > 0) {
        strengths.push(`Strong match with required skills: ${matchedSkills.join(', ')}`)
      }
    }

    if (resumeLower.includes('leadership') || resumeLower.includes('managed')) {
      strengths.push('Leadership experience demonstrated')
    }

    if (resumeLower.includes('certification') || resumeLower.includes('certified')) {
      strengths.push('Professional certifications present')
    }

    return strengths
  }

  const extractWeaknesses = (resume, jobReq) => {
    const weaknesses = []
    
    if (jobReq.required_skills) {
      const missingSkills = jobReq.required_skills.filter(skill => 
        !resume.toLowerCase().includes(skill.toLowerCase())
      )
      if (missingSkills.length > 0) {
        weaknesses.push(`Missing key skills: ${missingSkills.join(', ')}`)
      }
    }

    if (resume.length < 200) {
      weaknesses.push('Resume appears too brief')
    }

    return weaknesses
  }

  const generateRecommendations = (resume, jobReq, factors) => {
    const recommendations = []
    
    if (factors.skills < 20) {
      recommendations.push('Consider additional training in required technical skills')
    }
    
    if (factors.experience < 15) {
      recommendations.push('Look for candidates with more relevant experience')
    }
    
    if (factors.education < 10) {
      recommendations.push('Education requirements may not be met')
    }

    return recommendations
  }

  // Screening Process
  const startScreening = async () => {
    setIsScreening(true)
    setScreeningProgress(0)
    
    const screened = []
    const total = applications.length
    
    for (let i = 0; i < applications.length; i++) {
      const application = applications[i]
      const aiAnalysis = calculateAIScore(application, jobRequirements)
      
      screened.push({
        ...application,
        ai_analysis: aiAnalysis,
        screening_date: new Date().toISOString()
      })
      
      setScreeningProgress(Math.round(((i + 1) / total) * 100))
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    setScreenedApplications(screened)
    setIsScreening(false)
    setScreeningProgress(100)
    
    // Calculate stats
    const scores = screened.map(app => app.ai_analysis.score)
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const highPotential = screened.filter(app => app.ai_analysis.score >= 80).length
    const biasFlags = screened.reduce((count, app) => count + app.ai_analysis.biasFlags.length, 0)
    
    setScreeningStats({
      totalScreened: screened.length,
      averageScore: Math.round(avgScore),
      highPotential,
      biasFlags,
      timeSaved: Math.round(screened.length * 0.5) // Estimated 30 minutes saved per resume
    })
    
    if (onScreeningComplete) {
      onScreeningComplete(screened)
    }
  }

  // Filter and sort applications
  const filteredApplications = screenedApplications
    .filter(app => {
      const score = app.ai_analysis?.score || 0
      const hasBiasFlags = app.ai_analysis?.biasFlags?.length > 0
      
      return score >= filters.minScore && 
             score <= filters.maxScore &&
             (!filters.showBiasFlags || hasBiasFlags) &&
             (!filters.showHighPotential || score >= 80)
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return (b.ai_analysis?.score || 0) - (a.ai_analysis?.score || 0)
        case 'name':
          return (a.candidate?.full_name || '').localeCompare(b.candidate?.full_name || '')
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'experience':
          return (b.candidate?.experience?.length || 0) - (a.candidate?.experience?.length || 0)
        default:
          return 0
      }
    })

  const handleSelectApplication = (applicationId) => {
    setSelectedApplications(prev => 
      prev.includes(applicationId) 
        ? prev.filter(id => id !== applicationId)
        : [...prev, applicationId]
    )
  }

  const handleSelectAll = () => {
    if (selectedApplications.length === filteredApplications.length) {
      setSelectedApplications([])
    } else {
      setSelectedApplications(filteredApplications.map(app => app.id))
    }
  }

  const handleBulkAction = (action) => {
    if (onBulkAction) {
      onBulkAction(action, selectedApplications)
    }
    setSelectedApplications([])
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Poor Match'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 mr-2 text-blue-600" />
            AI Resume Screening
          </h2>
          <p className="text-gray-600">Automatically score and analyze candidate resumes</p>
        </div>
        <button
          onClick={startScreening}
          disabled={isScreening || applications.length === 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          <Zap className="h-4 w-4 mr-2" />
          {isScreening ? 'Screening...' : 'Start AI Screening'}
        </button>
      </div>

      {/* Progress Bar */}
      {isScreening && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Screening Progress</span>
            <span className="text-sm text-gray-600">{screeningProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${screeningProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {screenedApplications.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Screened</p>
                <p className="text-2xl font-bold text-gray-900">{screeningStats.totalScreened}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{screeningStats.averageScore}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Star className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">High Potential</p>
                <p className="text-2xl font-bold text-gray-900">{screeningStats.highPotential}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Bias Flags</p>
                <p className="text-2xl font-bold text-gray-900">{screeningStats.biasFlags}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Time Saved</p>
                <p className="text-2xl font-bold text-gray-900">{screeningStats.timeSaved}h</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {screenedApplications.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Score Range:</label>
              <input
                type="range"
                min="0"
                max="100"
                value={filters.minScore}
                onChange={(e) => setFilters(prev => ({ ...prev, minScore: parseInt(e.target.value) }))}
                className="w-20"
              />
              <span className="text-sm text-gray-600">{filters.minScore}%</span>
            </div>
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
              <option value="date">Sort by Date</option>
              <option value="experience">Sort by Experience</option>
            </select>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showBiasFlags}
                onChange={(e) => setFilters(prev => ({ ...prev, showBiasFlags: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">Show Bias Flags Only</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.showHighPotential}
                onChange={(e) => setFilters(prev => ({ ...prev, showHighPotential: e.target.checked }))}
                className="mr-2"
              />
              <span className="text-sm text-gray-600">High Potential Only</span>
            </label>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedApplications.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              {selectedApplications.length} applications selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('shortlist')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                Shortlist
              </button>
              <button
                onClick={() => handleBulkAction('reject')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reject
              </button>
              <button
                onClick={() => handleBulkAction('schedule')}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
              >
                Schedule Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications to screen</h3>
            <p className="text-gray-600">Start the AI screening process to analyze candidate resumes</p>
          </div>
        ) : (
          filteredApplications.map((application) => {
            const analysis = application.ai_analysis
            const score = analysis?.score || 0
            
            return (
              <div key={application.id} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedApplications.includes(application.id)}
                            onChange={() => handleSelectApplication(application.id)}
                            className="rounded"
                          />
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.candidate?.full_name || 'Unknown Candidate'}
                          </h3>
                          <p className="text-gray-600">{application.candidate?.email}</p>
                        </div>
                        
                        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(score)}`}>
                          {score}% - {getScoreLabel(score)}
                        </div>
                      </div>
                      
                      {/* Score Breakdown */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{analysis?.factors?.skills || 0}</div>
                          <div className="text-xs text-gray-500">Skills</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{analysis?.factors?.experience || 0}</div>
                          <div className="text-xs text-gray-500">Experience</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{analysis?.factors?.education || 0}</div>
                          <div className="text-xs text-gray-500">Education</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{analysis?.factors?.keywords || 0}</div>
                          <div className="text-xs text-gray-500">Keywords</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-indigo-600">{analysis?.factors?.format || 0}</div>
                          <div className="text-xs text-gray-500">Format</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-pink-600">{analysis?.factors?.completeness || 0}</div>
                          <div className="text-xs text-gray-500">Complete</div>
                        </div>
                      </div>
                      
                      {/* Strengths and Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Strengths
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {analysis?.strengths?.map((strength, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-2">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                            <XCircle className="h-4 w-4 mr-1" />
                            Areas for Improvement
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {analysis?.weaknesses?.map((weakness, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-red-500 mr-2">•</span>
                                {weakness}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      {/* Bias Flags */}
                      {analysis?.biasFlags?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-orange-700 mb-2 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Bias Detection Flags
                          </h4>
                          <div className="space-y-1">
                            {analysis.biasFlags.map((flag, index) => (
                              <div key={index} className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
                                <strong>{flag.type}:</strong> {flag.message}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Recommendations */}
                      {analysis?.recommendations?.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-1" />
                            AI Recommendations
                          </h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {analysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View Resume
                      </button>
                      <button className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Shortlist
                      </button>
                      <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default AIResumeScreening
