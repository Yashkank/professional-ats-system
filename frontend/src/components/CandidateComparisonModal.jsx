import React from 'react';
import { X, CheckCircle, XCircle, Star, GraduationCap, Briefcase, MapPin, Mail, Phone } from 'lucide-react';

const CandidateComparisonModal = ({ candidates, isOpen, onClose }) => {
  if (!isOpen || !candidates || candidates.length === 0) return null;

  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case 'Strong': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Weak': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Comparison ({candidates.length} candidates)
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Comparison Grid */}
          <div className={`grid gap-6 ${candidates.length === 1 ? 'grid-cols-1' : candidates.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {candidates.map((candidate, index) => (
              <div key={candidate.id} className="border rounded-lg p-6 bg-gray-50">
                {/* Candidate Header */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-blue-600">
                      {candidate.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{candidate.name}</h3>
                  <div className="flex justify-center items-center space-x-2 mb-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchTypeColor(candidate.matchType)}`}>
                      {candidate.matchType} Match
                    </span>
                    <span className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                      {candidate.score}%
                    </span>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      {candidate.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      {candidate.phone || '+1 (555) 123-4567'}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-2" />
                      {candidate.location || 'San Francisco, CA'}
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Experience
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">{candidate.experience || '5+ years'}</p>
                    <p className="mt-1">
                      {candidate.experienceDetails || 'Senior Software Engineer with expertise in full-stack development.'}
                    </p>
                  </div>
                </div>

                {/* Education */}
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" />
                    Education
                  </h4>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">
                      {candidate.education || 'Master of Science in Computer Science'}
                    </p>
                    <p className="mt-1">
                      {candidate.university || 'Stanford University'} • {candidate.graduationYear || '2020'}
                    </p>
                  </div>
                </div>

                {/* Skills Analysis */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Skills Analysis</h4>
                  
                  {/* Skills Matched */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Matched ({candidate.skillsMatched})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {candidate.matchedSkills?.slice(0, 5).map((skill, skillIndex) => (
                        <span key={skillIndex} className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {skill}
                        </span>
                      ))}
                      {candidate.matchedSkills?.length > 5 && (
                        <span className="text-xs text-gray-500">
                          +{candidate.matchedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Skills Missing */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700 flex items-center">
                        <XCircle className="h-3 w-3 mr-1" />
                        Missing ({candidate.skillsMissing})
                      </span>
                    </div>
                    <div className="space-y-1">
                      {candidate.missingSkills?.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-1 mb-1">
                          {skill}
                        </span>
                      ))}
                      {candidate.missingSkills?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{candidate.missingSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Skills</span>
                      <span className="text-xs font-medium">{Math.round(candidate.score * 0.6)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full"
                        style={{ width: `${candidate.score * 0.6}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Experience</span>
                      <span className="text-xs font-medium">{Math.round(candidate.score * 0.3)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${candidate.score * 0.3}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Education</span>
                      <span className="text-xs font-medium">{Math.round(candidate.score * 0.1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-purple-500 h-1 rounded-full"
                        style={{ width: `${candidate.score * 0.1}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Comparison */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Comparison Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Math.round(candidates.reduce((sum, c) => sum + c.score, 0) / candidates.length)}%
                </div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {candidates.reduce((sum, c) => sum + c.skillsMatched, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Skills Matched</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {candidates.filter(c => c.matchType === 'Strong').length}
                </div>
                <div className="text-sm text-gray-600">Strong Matches</div>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateComparisonModal;
