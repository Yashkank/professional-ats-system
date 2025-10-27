import React, { useState } from 'react'
import {
  Star, ThumbsUp, ThumbsDown, MessageSquare, 
  CheckCircle, XCircle, AlertCircle, User,
  Clock, Target, Award, FileText, Send
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function InterviewFeedback({ 
  interview, 
  onSubmitFeedback,
  onSaveDraft 
}) {
  const [feedback, setFeedback] = useState({
    overallRating: 0,
    technicalSkills: 0,
    communication: 0,
    problemSolving: 0,
    culturalFit: 0,
    recommendation: 'hire', // hire, no_hire, maybe
    strengths: '',
    weaknesses: '',
    notes: '',
    nextSteps: '',
    salaryExpectation: '',
    availability: '',
    references: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const ratingLabels = {
    1: 'Poor',
    2: 'Fair', 
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  }

  const recommendationOptions = [
    { value: 'hire', label: 'Strong Hire', color: 'green', icon: CheckCircle },
    { value: 'maybe', label: 'Maybe', color: 'yellow', icon: AlertCircle },
    { value: 'no_hire', label: 'No Hire', color: 'red', icon: XCircle }
  ]

  const handleRatingChange = (category, rating) => {
    setFeedback(prev => ({
      ...prev,
      [category]: rating
    }))
  }

  const handleInputChange = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async () => {
    if (feedback.overallRating === 0) {
      toast.error('Please provide an overall rating')
      return
    }

    setIsSubmitting(true)
    try {
      if (onSubmitFeedback) {
        await onSubmitFeedback(interview.id, feedback)
      }
      toast.success('Feedback submitted successfully')
    } catch (error) {
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    if (onSaveDraft) {
      onSaveDraft(interview.id, feedback)
    }
    toast.success('Draft saved successfully')
  }

  const getRecommendationIcon = (value) => {
    const option = recommendationOptions.find(opt => opt.value === value)
    return option ? option.icon : CheckCircle
  }

  const getRecommendationColor = (value) => {
    const option = recommendationOptions.find(opt => opt.value === value)
    return option ? option.color : 'green'
  }

  if (!interview) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Select an interview to provide feedback</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Interview Feedback</h2>
            <p className="text-gray-600">{interview.candidateName} - {interview.jobTitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {new Date(interview.start).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Overall Rating */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Rating *</h3>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange('overallRating', rating)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  feedback.overallRating >= rating
                    ? 'text-yellow-400 bg-yellow-50'
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                <Star className="h-6 w-6 fill-current" />
              </button>
            ))}
            <span className="ml-3 text-sm text-gray-600">
              {feedback.overallRating > 0 && ratingLabels[feedback.overallRating]}
            </span>
          </div>
        </div>

        {/* Detailed Ratings */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { key: 'technicalSkills', label: 'Technical Skills', icon: Target },
              { key: 'communication', label: 'Communication', icon: MessageSquare },
              { key: 'problemSolving', label: 'Problem Solving', icon: Award },
              { key: 'culturalFit', label: 'Cultural Fit', icon: User }
            ].map(({ key, label, icon: Icon }) => (
              <div key={key}>
                <div className="flex items-center mb-2">
                  <Icon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingChange(key, rating)}
                      className={`p-1 rounded transition-colors duration-200 ${
                        feedback[key] >= rating
                          ? 'text-yellow-400 bg-yellow-50'
                          : 'text-gray-300 hover:text-yellow-400'
                      }`}
                    >
                      <Star className="h-4 w-4 fill-current" />
                    </button>
                  ))}
                  <span className="ml-2 text-xs text-gray-500">
                    {feedback[key] > 0 && ratingLabels[feedback[key]]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendation */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendation *</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendationOptions.map((option) => {
              const Icon = option.icon
              return (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('recommendation', option.value)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    feedback.recommendation === option.value
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Icon className={`h-5 w-5 ${
                      feedback.recommendation === option.value
                        ? `text-${option.color}-600`
                        : 'text-gray-400'
                    }`} />
                    <span className={`font-medium ${
                      feedback.recommendation === option.value
                        ? `text-${option.color}-700`
                        : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Strengths</h3>
            <textarea
              value={feedback.strengths}
              onChange={(e) => handleInputChange('strengths', e.target.value)}
              placeholder="What did the candidate do well? Key strengths and positive attributes..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas for Improvement</h3>
            <textarea
              value={feedback.weaknesses}
              onChange={(e) => handleInputChange('weaknesses', e.target.value)}
              placeholder="What areas need improvement? Constructive feedback..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        {/* Additional Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Notes
              </label>
              <textarea
                value={feedback.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Additional observations, specific examples, or important details..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps
                </label>
                <select
                  value={feedback.nextSteps}
                  onChange={(e) => handleInputChange('nextSteps', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select next steps</option>
                  <option value="final_interview">Final Interview</option>
                  <option value="technical_round">Technical Round</option>
                  <option value="reference_check">Reference Check</option>
                  <option value="offer">Make Offer</option>
                  <option value="reject">Reject Candidate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salary Expectation
                </label>
                <input
                  type="text"
                  value={feedback.salaryExpectation}
                  onChange={(e) => handleInputChange('salaryExpectation', e.target.value)}
                  placeholder="e.g., $80,000 - $90,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>
                <input
                  type="text"
                  value={feedback.availability}
                  onChange={(e) => handleInputChange('availability', e.target.value)}
                  placeholder="e.g., 2 weeks notice, immediate start"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  References
                </label>
                <input
                  type="text"
                  value={feedback.references}
                  onChange={(e) => handleInputChange('references', e.target.value)}
                  placeholder="Reference contact information"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Save Draft
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || feedback.overallRating === 0}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
