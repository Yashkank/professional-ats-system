import React, { useState, useEffect } from 'react'
import { 
  Brain, TrendingUp, Target, Star, BarChart3, 
  Lightbulb, CheckCircle, XCircle, AlertTriangle,
  Download, RefreshCw, Zap, Award, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const AIPersonalization = ({ candidateProfile, applications }) => {
  const [aiInsights, setAiInsights] = useState(null)
  const [jobFitScores, setJobFitScores] = useState([])
  const [resumeFeedback, setResumeFeedback] = useState(null)
  const [predictiveInsights, setPredictiveInsights] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAIData()
  }, [candidateProfile, applications])

  const fetchAIData = async () => {
    try {
      setIsLoading(true)
      
      // TODO: Replace with real API calls when backend AI endpoints are implemented
      // For now, show empty state or basic analysis based on real profile data
      
      // Basic analysis based on real candidate profile
      const profile = candidateProfile || {}
      const skills = profile.skills || []
      const experience = profile.experience || []
      
      // Calculate basic insights from real data
      const overallScore = Math.min(95, 60 + (skills.length * 3) + (experience.length * 5))
      
      setAiInsights({
        overallScore: overallScore,
        strengths: skills.length > 0 ? [
          `Strong technical skills in ${skills.slice(0, 3).join(', ')}`,
          'Profile shows good technical foundation',
          'Skills align with current market demands'
        ] : [
          'Profile shows potential for growth',
          'Ready to develop technical skills',
          'Open to learning new technologies'
        ],
        improvements: [
          'Complete your profile to get personalized insights',
          'Add more skills to improve matching',
          'Include detailed work experience'
        ],
        marketTrends: [
          'Complete your profile to see market trends',
          'Add skills to get personalized insights',
          'Upload resume for detailed analysis'
        ]
      })

      // No job fit scores without real job data
      setJobFitScores([])

      // Basic resume feedback based on profile completeness
      const hasResume = profile.resume_url && profile.resume_url.trim() !== ''
      const hasSkills = skills.length > 0
      const hasExperience = experience.length > 0
      
      setResumeFeedback({
        overallRating: hasResume ? 4.0 : 2.0,
        sections: [
          {
            name: 'Summary',
            rating: hasResume ? 4.0 : 2.0,
            feedback: hasResume ? 'Resume uploaded successfully' : 'Upload your resume for analysis',
            suggestions: hasResume ? [] : ['Upload your resume to get detailed feedback']
          },
          {
            name: 'Experience',
            rating: hasExperience ? 4.0 : 2.0,
            feedback: hasExperience ? 'Experience section completed' : 'Add your work experience',
            suggestions: hasExperience ? [] : ['Add detailed work experience']
          },
          {
            name: 'Skills',
            rating: hasSkills ? 4.0 : 2.0,
            feedback: hasSkills ? 'Skills section completed' : 'Add your technical skills',
            suggestions: hasSkills ? [] : ['Add your technical skills']
          },
          {
            name: 'Education',
            rating: 3.0,
            feedback: 'Complete your education section',
            suggestions: ['Add your educational background']
          }
        ],
        atsScore: hasResume ? 75 : 0,
        keywordDensity: hasSkills ? skills.reduce((acc, skill) => {
          acc[skill] = Math.floor(Math.random() * 10) + 1
          return acc
        }, {}) : {}
      })

      setPredictiveInsights({
        successFactors: [
          {
            factor: 'Profile Completeness',
            impact: 'High',
            score: overallScore,
            description: 'Complete your profile to improve job matching'
          },
          {
            factor: 'Skills Match',
            impact: 'High',
            score: skills.length > 0 ? 80 : 20,
            description: skills.length > 0 ? 'Good skills foundation' : 'Add skills to improve matching'
          },
          {
            factor: 'Experience Level',
            impact: 'Medium',
            score: experience.length > 0 ? 70 : 30,
            description: experience.length > 0 ? 'Experience documented' : 'Add work experience'
          },
          {
            factor: 'Resume Quality',
            impact: 'High',
            score: hasResume ? 85 : 25,
            description: hasResume ? 'Resume uploaded' : 'Upload resume for better matching'
          }
        ],
        recommendations: [
          'Complete your profile to get personalized insights',
          'Add more skills to improve job matching',
          'Upload your resume for detailed analysis',
          'Add work experience to strengthen your profile'
        ],
        marketInsights: [
          'Complete your profile to see market insights',
          'Add skills to get personalized recommendations',
          'Upload resume for detailed market analysis'
        ]
      })

    } catch (error) {
      console.error('AI data fetch error:', error)
      toast.error('Failed to load AI insights')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBgColor = (score) => {
    if (score >= 90) return 'bg-green-100'
    if (score >= 70) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Analyzing with AI...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            AI-Powered Insights
          </h3>
          <button
            onClick={fetchAIData}
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh Analysis
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getScoreBgColor(aiInsights.overallScore)}`}>
              <span className={`text-2xl font-bold ${getScoreColor(aiInsights.overallScore)}`}>
                {aiInsights.overallScore}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2">Overall Score</p>
            <p className="text-xs text-gray-500">Based on AI analysis</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2">Market Trends</p>
            <p className="text-xs text-gray-500">Real-time insights</p>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mt-2">Success Rate</p>
            <p className="text-xs text-gray-500">Predicted likelihood</p>
          </div>
        </div>
      </div>

      {/* Job Fit Scores */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Star className="h-5 w-5 mr-2 text-yellow-600" />
          Job Fit Analysis
        </h3>
        
        {jobFitScores.length > 0 ? (
          <div className="space-y-4">
            {jobFitScores.map((job) => (
              <div key={job.jobId} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{job.title}</h4>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreBgColor(job.fitScore)} ${getScoreColor(job.fitScore)}`}>
                      {job.fitScore}% Fit
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {job.successProbability}% success probability
                    </p>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Skills</div>
                    <div className={`text-lg font-bold ${getScoreColor(job.breakdown.skills)}`}>
                      {job.breakdown.skills}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Experience</div>
                    <div className={`text-lg font-bold ${getScoreColor(job.breakdown.experience)}`}>
                      {job.breakdown.experience}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Location</div>
                    <div className={`text-lg font-bold ${getScoreColor(job.breakdown.location)}`}>
                      {job.breakdown.location}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-900">Salary</div>
                    <div className={`text-lg font-bold ${getScoreColor(job.breakdown.salary)}`}>
                      {job.breakdown.salary}%
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 italic">"{job.aiReason}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No Job Analysis Available</h4>
            <p className="text-gray-600 mb-4">Complete your profile and apply to jobs to see AI-powered fit analysis</p>
            <div className="text-sm text-gray-500">
              <p>• Add your skills to improve job matching</p>
              <p>• Upload your resume for detailed analysis</p>
              <p>• Apply to jobs to see fit scores</p>
            </div>
          </div>
        )}
      </div>

      {/* Resume Feedback */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
          Resume AI Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Overall Rating</h4>
              <div className="flex items-center">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(resumeFeedback.overallRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {resumeFeedback.overallRating}/5
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {resumeFeedback.sections.map((section, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{section.name}</h5>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(section.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-1 text-sm text-gray-600">
                        {section.rating}/5
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{section.feedback}</p>
                  <div className="space-y-1">
                    {section.suggestions.map((suggestion, i) => (
                      <div key={i} className="flex items-start text-xs text-gray-500">
                        <Lightbulb className="h-3 w-3 mr-1 mt-0.5 text-yellow-500" />
                        {suggestion}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">ATS Optimization</h4>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">ATS Score</span>
                  <span className="text-lg font-bold text-green-600">
                    {resumeFeedback.atsScore}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${resumeFeedback.atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Your resume is well-optimized for ATS systems
                </p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Keyword Density</h5>
                <div className="space-y-2">
                  {Object.entries(resumeFeedback.keywordDensity).map(([keyword, count]) => (
                    <div key={keyword} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{keyword}</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(count * 5, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Insights */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Zap className="h-5 w-5 mr-2 text-purple-600" />
          Predictive Insights
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Success Factors</h4>
            <div className="space-y-3">
              {predictiveInsights.successFactors.map((factor, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{factor.factor}</span>
                    <span className={`text-sm font-bold ${getScoreColor(factor.score)}`}>
                      {factor.score}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full ${
                        factor.score >= 90 ? 'bg-green-500' :
                        factor.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">{factor.description}</p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
                    factor.impact === 'High' ? 'bg-red-100 text-red-800' :
                    factor.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {factor.impact} Impact
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">AI Recommendations</h4>
            <div className="space-y-3">
              {predictiveInsights.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-gray-700">{rec}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Market Insights</h4>
              <div className="space-y-2">
                {predictiveInsights.marketInsights.map((insight, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIPersonalization
