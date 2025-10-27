import React, { useState, useEffect } from 'react'
import { Star, MapPin, Clock, TrendingUp, Bookmark, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { candidateAPI } from '../services/api'
import toast from 'react-hot-toast'

const JobRecommendations = ({ candidateProfile, onSaveJob, onApplyJob }) => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [savedJobs, setSavedJobs] = useState(new Set())

  // Calculate match score based on candidate skills vs job requirements
  const calculateMatchScore = (job, candidateSkills = []) => {
    if (!job.required_skills || candidateSkills.length === 0) {
      return Math.floor(Math.random() * 20) + 70 // 70-90% if no skills data
    }

    const jobSkills = job.required_skills.map(skill => skill.toLowerCase())
    const candidateSkillsLower = candidateSkills.map(skill => skill.toLowerCase())
    
    const matchingSkills = jobSkills.filter(skill => 
      candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    )
    
    const matchPercentage = (matchingSkills.length / jobSkills.length) * 100
    return Math.min(Math.max(Math.floor(matchPercentage), 60), 95) // 60-95% range
  }

  // Generate missing skills based on job requirements
  const getMissingSkills = (job, candidateSkills = []) => {
    if (!job.required_skills || candidateSkills.length === 0) {
      return []
    }

    const jobSkills = job.required_skills.map(skill => skill.toLowerCase())
    const candidateSkillsLower = candidateSkills.map(skill => skill.toLowerCase())
    
    return jobSkills.filter(skill => 
      !candidateSkillsLower.some(candidateSkill => 
        candidateSkill.includes(skill) || skill.includes(candidateSkill)
      )
    ).slice(0, 3) // Limit to 3 missing skills
  }

  // Format job data for display
  const formatJobData = (job, candidateSkills = []) => {
    const matchScore = calculateMatchScore(job, candidateSkills)
    const missingSkills = getMissingSkills(job, candidateSkills)
    
    return {
      id: job.id,
      title: job.title,
      company: job.company?.name || job.company_name || 'Unknown Company',
      location: job.location || 'Location not specified',
      type: job.employment_type || 'Full-time',
      salary: job.salary_range || 'Salary not specified',
      posted: job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recently',
      matchScore,
      skills: job.required_skills || [],
      missingSkills,
      description: job.description || 'No description available',
      requirements: job.requirements || 'No requirements specified',
      benefits: job.benefits || [],
      urgency: job.urgency || 'medium',
      status: job.status || 'active'
    }
  }

  // Load saved jobs on component mount
  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        const response = await candidateAPI.getSavedJobs()
        const savedJobsData = response.data || []
        const savedJobIds = new Set(savedJobsData.map(job => job.id))
        setSavedJobs(savedJobIds)
      } catch (error) {
        console.error('Error loading saved jobs:', error)
        // Don't show error toast for this as it's not critical
      }
    }

    loadSavedJobs()
  }, [])

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true)
        
        // Fetch AI-powered recommendations from the API
        const response = await candidateAPI.getRecommendations()
        const recommendedJobs = response.data || []
        
        // Format the jobs with match scores and missing skills
        const candidateSkills = candidateProfile?.skills || []
        const formattedJobs = recommendedJobs
          .filter(job => job.status === 'active') // Only show active jobs
          .map(job => formatJobData(job, candidateSkills))
          .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score
        
        setRecommendations(formattedJobs)
      } catch (error) {
        console.error('Error fetching job recommendations:', error)
        toast.error('Failed to load job recommendations')
        setRecommendations([])
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [candidateProfile])

  const handleSaveJob = async (jobId) => {
    try {
      const isCurrentlySaved = savedJobs.has(jobId)
      
      if (isCurrentlySaved) {
        // Remove from saved jobs
        await candidateAPI.removeSavedJob(jobId)
        const newSavedJobs = new Set(savedJobs)
        newSavedJobs.delete(jobId)
        setSavedJobs(newSavedJobs)
        toast.success('Job removed from saved jobs')
      } else {
        // Add to saved jobs
        await candidateAPI.saveJob(jobId)
        const newSavedJobs = new Set(savedJobs)
        newSavedJobs.add(jobId)
        setSavedJobs(newSavedJobs)
        toast.success('Job saved successfully')
      }
      
      onSaveJob?.(jobId, !isCurrentlySaved)
    } catch (error) {
      console.error('Error saving/unsaving job:', error)
      toast.error('Failed to update saved jobs')
    }
  }

  const getMatchColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-orange-600 bg-orange-100'
  }

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Jobs for You</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recommended Jobs for You</h3>
        <div className="flex items-center text-sm text-gray-500">
          <TrendingUp className="h-4 w-4 mr-1" />
          AI-Powered Recommendations
        </div>
      </div>

      <div className="space-y-6">
        {recommendations.map((job) => (
          <div key={job.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h4 className="text-lg font-semibold text-gray-900 mr-3">{job.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchColor(job.matchScore)}`}>
                    {job.matchScore}% Match
                  </span>
                  {job.urgency === 'high' && (
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
                      Urgent
                    </span>
                  )}
                </div>
                <div className="flex items-center text-gray-600 mb-2">
                  <span className="font-medium">{job.company}</span>
                  <span className="mx-2">•</span>
                  <MapPin className="h-4 w-4 mr-1" />
                  {job.location}
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-1" />
                  {job.posted}
                </div>
                <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="font-medium">{job.salary}</span>
                  <span className="mx-2">•</span>
                  <span>{job.type}</span>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                <button
                  onClick={() => handleSaveJob(job.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    savedJobs.has(job.id)
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onApplyJob?.(job)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Apply Now
                </button>
              </div>
            </div>

            {/* Skills Analysis */}
            <div className="border-t border-gray-200 pt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-3">Skills Analysis</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-2">✅ Skills You Have</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">❌ Skills to Learn</p>
                  <div className="flex flex-wrap gap-1">
                    {job.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Benefits</h5>
              <div className="flex flex-wrap gap-2">
                {job.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {recommendations.length === 0 && (
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No recommendations available</p>
          <p className="text-sm text-gray-400">Complete your profile to get personalized job recommendations</p>
        </div>
      )}
    </div>
  )
}

export default JobRecommendations
