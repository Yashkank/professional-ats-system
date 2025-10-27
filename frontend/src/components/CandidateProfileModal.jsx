import React from 'react';
import { X, CheckCircle, XCircle, Star, GraduationCap, Briefcase, MapPin, Mail, Phone } from 'lucide-react';

const CandidateProfileModal = ({ candidate, isOpen, onClose, onShortlist, onReject, shortlistedCandidates, rejectedCandidates }) => {
  if (!isOpen || !candidate) return null;

  const isShortlisted = shortlistedCandidates.includes(candidate.id);
  const isRejected = rejectedCandidates.includes(candidate.id);

  const getScoreBreakdown = (candidate) => {
    const totalSkills = candidate.skillsMatched + candidate.skillsMissing;
    const skillsMatchPercent = totalSkills > 0 ? (candidate.skillsMatched / totalSkills) * 100 : 0;
    
    return {
      skillsMatch: Math.round(skillsMatchPercent),
      educationMatch: Math.round(candidate.score * 0.3), // Mock calculation
      experienceMatch: Math.round(candidate.score * 0.4) // Mock calculation
    };
  };

  const breakdown = getScoreBreakdown(candidate);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {candidate.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{candidate.name}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  candidate.matchType === 'Strong' ? 'bg-green-100 text-green-800' :
                  candidate.matchType === 'Moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {candidate.matchType} Match
                </span>
                <span className="text-lg font-semibold text-blue-600">{candidate.score}%</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {candidate.email}
                </div>
                <div className="flex items-center text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {candidate.phone || '+1 (555) 123-4567'}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {candidate.location || 'San Francisco, CA'}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Briefcase className="h-5 w-5 mr-2" />
                Experience
              </h3>
              <div className="text-gray-600">
                <p className="font-medium">{candidate.experience || '5+ years'}</p>
                <p className="text-sm mt-1">
                  {candidate.experienceDetails || 'Senior Software Engineer with expertise in full-stack development, machine learning, and cloud architecture.'}
                </p>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
              <GraduationCap className="h-5 w-5 mr-2" />
              Education
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium text-gray-900">
                {candidate.education || 'Master of Science in Computer Science'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {candidate.university || 'Stanford University'} • {candidate.graduationYear || '2020'}
              </p>
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-3">
              <Star className="h-5 w-5 mr-2" />
              AI-Generated Summary
            </h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-gray-700">
                {candidate.aiSummary || 'This candidate demonstrates strong technical skills in Python, machine learning, and cloud technologies. Their experience aligns well with the AI Engineer role, showing expertise in TensorFlow, PyTorch, and AWS. The candidate has a solid educational background and 5+ years of relevant experience in AI/ML projects.'}
              </p>
            </div>
          </div>

          {/* Skills Analysis */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Skills Matched ({candidate.skillsMatched})
                </h4>
                <div className="space-y-1">
                  {candidate.matchedSkills?.map((skill, index) => (
                    <span key={index} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-sm mr-1 mb-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium text-red-700 mb-2 flex items-center">
                  <XCircle className="h-4 w-4 mr-1" />
                  Skills Missing ({candidate.skillsMissing})
                </h4>
                <div className="space-y-1">
                  {candidate.missingSkills?.map((skill, index) => (
                    <span key={index} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-sm mr-1 mb-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Explainability Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Why this score?</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Skills Match</span>
                  <span className="text-sm text-gray-600">{breakdown.skillsMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.skillsMatch}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Education Match</span>
                  <span className="text-sm text-gray-600">{breakdown.educationMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.educationMatch}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">Experience Match</span>
                  <span className="text-sm text-gray-600">{breakdown.experienceMatch}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${breakdown.experienceMatch}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
            {!isShortlisted && !isRejected && (
              <>
                <button
                  onClick={() => onReject(candidate.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => onShortlist(candidate.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Shortlist
                </button>
              </>
            )}
            {isShortlisted && (
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Shortlisted
              </span>
            )}
            {isRejected && (
              <span className="px-4 py-2 bg-red-100 text-red-800 rounded-lg flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfileModal;
