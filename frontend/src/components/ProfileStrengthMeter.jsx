import React, { useState } from 'react'
import { User, FileText, Award, Briefcase, GraduationCap, Star, CheckCircle, AlertCircle, Edit3 } from 'lucide-react'
import ProfileEditor from './ProfileEditor'

const ProfileStrengthMeter = ({ profile = {}, onProfileUpdate }) => {
  const [showProfileEditor, setShowProfileEditor] = useState(false)
  const [editorTab, setEditorTab] = useState('basic')
  const calculateProfileStrength = (profile) => {
    let score = 0
    let maxScore = 0
    const sections = []

    // Basic Information (20 points)
    const basicInfo = {
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      location: 'Location'
    }
    
    let basicScore = 0
    Object.entries(basicInfo).forEach(([key, label]) => {
      maxScore += 5
      if (profile[key] && profile[key].trim()) {
        basicScore += 5
        score += 5
      }
    })
    
    sections.push({
      name: 'Basic Information',
      score: basicScore,
      maxScore: 20,
      icon: User,
      color: 'blue'
    })

    // Resume Upload (25 points)
    const resumeScore = profile.resume_url ? 25 : 0
    score += resumeScore
    maxScore += 25
    
    sections.push({
      name: 'Resume Upload',
      score: resumeScore,
      maxScore: 25,
      icon: FileText,
      color: 'green'
    })

    // Skills (20 points)
    const skillsCount = profile.skills?.length || 0
    const skillsScore = Math.min(skillsCount * 2, 20) // 2 points per skill, max 20
    score += skillsScore
    maxScore += 20
    
    sections.push({
      name: 'Skills',
      score: skillsScore,
      maxScore: 20,
      icon: Award,
      color: 'purple'
    })

    // Experience (20 points)
    const experienceScore = profile.experience?.length ? 20 : 0
    score += experienceScore
    maxScore += 20
    
    sections.push({
      name: 'Work Experience',
      score: experienceScore,
      maxScore: 20,
      icon: Briefcase,
      color: 'orange'
    })

    // Education (10 points)
    const educationScore = profile.education?.length ? 10 : 0
    score += educationScore
    maxScore += 10
    
    sections.push({
      name: 'Education',
      score: educationScore,
      maxScore: 10,
      icon: GraduationCap,
      color: 'indigo'
    })

    // Certifications (5 points)
    const certScore = profile.certifications?.length ? 5 : 0
    score += certScore
    maxScore += 5
    
    sections.push({
      name: 'Certifications',
      score: certScore,
      maxScore: 5,
      icon: Star,
      color: 'yellow'
    })

    return {
      totalScore: score,
      maxScore: maxScore,
      percentage: Math.round((score / maxScore) * 100),
      sections
    }
  }

  const profileData = calculateProfileStrength(profile)
  const { totalScore, maxScore, percentage, sections } = profileData

  const getColorClass = (percentage) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getSectionColor = (color) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      orange: 'text-orange-600 bg-orange-100',
      indigo: 'text-indigo-600 bg-indigo-100',
      yellow: 'text-yellow-600 bg-yellow-100'
    }
    return colors[color] || 'text-gray-600 bg-gray-100'
  }

  const getRecommendations = (sections) => {
    const incomplete = sections.filter(section => section.score < section.maxScore)
    if (incomplete.length === 0) {
      return ['Your profile is complete! Great job! 🎉']
    }
    
    return incomplete.map(section => {
      const missing = section.maxScore - section.score
      const points = missing === 1 ? 'point' : 'points'
      return `Add ${missing} more ${points} to complete ${section.name}`
    })
  }

  const recommendations = getRecommendations(sections)

  const handleProfileSave = (updatedProfile) => {
    onProfileUpdate?.(updatedProfile)
    setShowProfileEditor(false)
  }

  const openEditor = (tab) => {
    setEditorTab(tab)
    setShowProfileEditor(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Profile Strength</h3>
        <div className="flex items-center space-x-3">
          <div className={`text-2xl font-bold ${getColorClass(percentage)}`}>
            {percentage}%
          </div>
          <button
            onClick={() => openEditor('basic')}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Profile"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Profile Completion</span>
          <span>{totalScore}/{maxScore} points</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Sections Breakdown */}
      <div className="space-y-4 mb-6">
        {sections.map((section, index) => {
          const Icon = section.icon
          const sectionPercentage = Math.round((section.score / section.maxScore) * 100)
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${getSectionColor(section.color)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{section.name}</p>
                  <p className="text-xs text-gray-500">{section.score}/{section.maxScore} points</p>
                </div>
              </div>
              <div className="flex items-center">
                {sectionPercentage === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Next Steps</h4>
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
              <p className="text-sm text-gray-600">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => openEditor('resume')}
            className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
          >
            Upload Resume
          </button>
          <button 
            onClick={() => openEditor('skills')}
            className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
          >
            Add Skills
          </button>
        </div>
      </div>

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditor
          profile={profile}
          onClose={() => setShowProfileEditor(false)}
          onSave={handleProfileSave}
          initialTab={editorTab}
        />
      )}
    </div>
  )
}

export default ProfileStrengthMeter
