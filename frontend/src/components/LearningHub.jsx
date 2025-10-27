import React, { useState, useEffect } from 'react'
import { 
  BookOpen, Award, Play, Clock, CheckCircle, 
  ExternalLink, Star, TrendingUp, Target, 
  Download, Upload, Calendar, Users, Globe
} from 'lucide-react'
import toast from 'react-hot-toast'

const LearningHub = ({ candidateProfile, applications }) => {
  const [skillGaps, setSkillGaps] = useState([])
  const [recommendedCourses, setRecommendedCourses] = useState([])
  const [certifications, setCertifications] = useState([])
  const [learningProgress, setLearningProgress] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLearningData()
  }, [candidateProfile, applications])

  const fetchLearningData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock skill gaps data
      setSkillGaps([
        {
          skill: 'AWS Cloud Services',
          demand: 95,
          gap: 60,
          priority: 'high',
          description: 'Cloud computing skills are in high demand',
          courses: [
            {
              title: 'AWS Certified Solutions Architect',
              provider: 'Amazon Web Services',
              duration: '40 hours',
              cost: '$300',
              rating: 4.8,
              students: 125000,
              type: 'certification'
            },
            {
              title: 'Complete AWS Course for Beginners',
              provider: 'Udemy',
              duration: '25 hours',
              cost: '$89',
              rating: 4.6,
              students: 45000,
              type: 'course'
            }
          ]
        },
        {
          skill: 'Docker & Kubernetes',
          demand: 88,
          gap: 70,
          priority: 'high',
          description: 'Containerization and orchestration skills',
          courses: [
            {
              title: 'Docker and Kubernetes: The Complete Guide',
              provider: 'Udemy',
              duration: '35 hours',
              cost: '$94',
              rating: 4.7,
              students: 78000,
              type: 'course'
            },
            {
              title: 'Certified Kubernetes Administrator (CKA)',
              provider: 'Linux Foundation',
              duration: '60 hours',
              cost: $395,
              rating: 4.9,
              students: 15000,
              type: 'certification'
            }
          ]
        },
        {
          skill: 'Machine Learning',
          demand: 82,
          gap: 85,
          priority: 'medium',
          description: 'AI and ML skills for advanced roles',
          courses: [
            {
              title: 'Machine Learning A-Z',
              provider: 'Udemy',
              duration: '42 hours',
              cost: '$94',
              rating: 4.6,
              students: 95000,
              type: 'course'
            },
            {
              title: 'Deep Learning Specialization',
              provider: 'Coursera',
              duration: '120 hours',
              cost: '$49/month',
              rating: 4.8,
              students: 200000,
              type: 'specialization'
            }
          ]
        }
      ])

      // Mock recommended courses
      setRecommendedCourses([
        {
          id: 1,
          title: 'Advanced Python Programming',
          provider: 'Coursera',
          instructor: 'Dr. Sarah Chen',
          duration: '6 weeks',
          hours: 30,
          cost: '$49/month',
          rating: 4.7,
          students: 45000,
          difficulty: 'Intermediate',
          skills: ['Python', 'OOP', 'Data Structures'],
          description: 'Master advanced Python concepts and best practices',
          thumbnail: 'https://via.placeholder.com/300x200',
          type: 'course',
          progress: 0,
          enrolled: false
        },
        {
          id: 2,
          title: 'React Native Mobile Development',
          provider: 'Udemy',
          instructor: 'Mike Rodriguez',
          duration: '8 weeks',
          hours: 45,
          cost: '$89',
          rating: 4.8,
          students: 67000,
          difficulty: 'Advanced',
          skills: ['React Native', 'JavaScript', 'Mobile Development'],
          description: 'Build cross-platform mobile apps with React Native',
          thumbnail: 'https://via.placeholder.com/300x200',
          type: 'course',
          progress: 0,
          enrolled: false
        },
        {
          id: 3,
          title: 'AWS Solutions Architect Professional',
          provider: 'Amazon Web Services',
          instructor: 'AWS Training Team',
          duration: '12 weeks',
          hours: 80,
          cost: '$300',
          rating: 4.9,
          students: 25000,
          difficulty: 'Expert',
          skills: ['AWS', 'Cloud Architecture', 'DevOps'],
          description: 'Professional-level AWS certification preparation',
          thumbnail: 'https://via.placeholder.com/300x200',
          type: 'certification',
          progress: 0,
          enrolled: false
        }
      ])

      // Mock certifications data
      setCertifications([
        {
          id: 1,
          name: 'AWS Certified Cloud Practitioner',
          issuer: 'Amazon Web Services',
          issueDate: new Date('2023-06-15'),
          expiryDate: new Date('2026-06-15'),
          credentialId: 'AWS-CCP-123456',
          verificationUrl: 'https://aws.amazon.com/verification',
          status: 'active',
          skills: ['AWS', 'Cloud Computing', 'Security'],
          description: 'Foundational understanding of AWS Cloud concepts'
        },
        {
          id: 2,
          name: 'Google Cloud Professional Developer',
          issuer: 'Google Cloud',
          issueDate: new Date('2023-03-20'),
          expiryDate: new Date('2025-03-20'),
          credentialId: 'GCP-PD-789012',
          verificationUrl: 'https://cloud.google.com/certification',
          status: 'active',
          skills: ['Google Cloud', 'Python', 'API Development'],
          description: 'Professional certification for Google Cloud development'
        },
        {
          id: 3,
          name: 'Certified Kubernetes Administrator',
          issuer: 'Linux Foundation',
          issueDate: new Date('2022-11-10'),
          expiryDate: new Date('2025-11-10'),
          credentialId: 'CKA-345678',
          verificationUrl: 'https://www.cncf.io/certification/cka',
          status: 'active',
          skills: ['Kubernetes', 'Container Orchestration', 'DevOps'],
          description: 'Administrator-level Kubernetes certification'
        }
      ])

      // Mock learning progress
      setLearningProgress([
        {
          courseId: 1,
          courseName: 'Python for Data Science',
          provider: 'DataCamp',
          progress: 75,
          lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          timeSpent: 12,
          totalTime: 16,
          nextLesson: 'Pandas Data Manipulation',
          status: 'in_progress'
        },
        {
          courseId: 2,
          courseName: 'React Advanced Patterns',
          provider: 'Frontend Masters',
          progress: 100,
          lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          timeSpent: 20,
          totalTime: 20,
          nextLesson: null,
          status: 'completed'
        },
        {
          courseId: 3,
          courseName: 'System Design Fundamentals',
          provider: 'Educative',
          progress: 30,
          lastAccessed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          timeSpent: 6,
          totalTime: 20,
          nextLesson: 'Load Balancing Strategies',
          status: 'in_progress'
        }
      ])

    } catch (error) {
      console.error('Learning data fetch error:', error)
      toast.error('Failed to load learning data')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100'
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100'
      case 'Advanced': return 'text-orange-600 bg-orange-100'
      case 'Expert': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'expired': return 'text-red-600 bg-red-100'
      case 'expiring': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const enrollInCourse = (courseId) => {
    setRecommendedCourses(prev => 
      prev.map(course => 
        course.id === courseId 
          ? { ...course, enrolled: true, progress: 0 }
          : course
      )
    )
    toast.success('Successfully enrolled in course!')
  }

  const uploadCertification = () => {
    // Simulate file upload
    toast.success('Certification uploaded successfully!')
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading learning resources...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Learning Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
            Learning & Development
          </h3>
          <button
            onClick={uploadCertification}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Certification
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{learningProgress.length}</p>
            <p className="text-sm text-gray-500">Active Courses</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Award className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{certifications.length}</p>
            <p className="text-sm text-gray-500">Certifications</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{skillGaps.length}</p>
            <p className="text-sm text-gray-500">Skill Gaps</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {learningProgress.reduce((total, course) => total + course.timeSpent, 0)}
            </p>
            <p className="text-sm text-gray-500">Hours Learned</p>
          </div>
        </div>
      </div>

      {/* Skill Gap Analysis */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-red-600" />
          Skill Gap Analysis
        </h3>

        <div className="space-y-4">
          {skillGaps.map((gap, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{gap.skill}</h4>
                  <p className="text-sm text-gray-600">{gap.description}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getPriorityColor(gap.priority)}`}>
                  {gap.priority} priority
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Market Demand</span>
                    <span>{gap.demand}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${gap.demand}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Your Gap</span>
                    <span>{gap.gap}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${gap.gap}%` }}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-900 mb-2">Recommended Courses</h5>
                <div className="space-y-2">
                  {gap.courses.map((course, courseIndex) => (
                    <div key={courseIndex} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <h6 className="font-medium text-gray-900">{course.title}</h6>
                        <p className="text-sm text-gray-600">{course.provider}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {course.duration}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="h-3 w-3 mr-1" />
                            {course.rating}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            {course.students.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{course.cost}</span>
                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Play className="h-5 w-5 mr-2 text-green-600" />
          Recommended Courses
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 line-clamp-2">{course.title}</h4>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(course.difficulty)}`}>
                    {course.difficulty}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{course.instructor} • {course.provider}</p>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {course.hours}h
                  </div>
                  <div className="flex items-center">
                    <Star className="h-3 w-3 mr-1" />
                    {course.rating}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {course.students.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {course.skills.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">{course.cost}</span>
                  <button
                    onClick={() => enrollInCourse(course.id)}
                    disabled={course.enrolled}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      course.enrolled
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {course.enrolled ? 'Enrolled' : 'Enroll Now'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Progress */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <CheckCircle className="h-5 w-5 mr-2 text-purple-600" />
          Learning Progress
        </h3>

        <div className="space-y-4">
          {learningProgress.map((course) => (
            <div key={course.courseId} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{course.courseName}</h4>
                  <p className="text-sm text-gray-600">{course.provider}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                  course.status === 'completed' ? 'text-green-600 bg-green-100' :
                  course.status === 'in_progress' ? 'text-blue-600 bg-blue-100' :
                  'text-gray-600 bg-gray-100'
                }`}>
                  {course.status.replace('_', ' ')}
                </span>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      course.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {course.timeSpent}/{course.totalTime} hours
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Last accessed {course.lastAccessed.toLocaleDateString()}
                </div>
              </div>

              {course.nextLesson && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">
                    <strong>Next:</strong> {course.nextLesson}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-600" />
          My Certifications
        </h3>

        <div className="space-y-4">
          {certifications.map((cert) => (
            <div key={cert.id} className="p-4 bg-white rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.issuer}</p>
                  <p className="text-sm text-gray-500 mt-1">{cert.description}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(cert.status)}`}>
                  {cert.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">Credential ID</p>
                  <p className="text-sm text-gray-600 font-mono">{cert.credentialId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Issue Date</p>
                  <p className="text-sm text-gray-600">{cert.issueDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Expiry Date</p>
                  <p className="text-sm text-gray-600">{cert.expiryDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Verification</p>
                  <a
                    href={cert.verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Verify Online
                  </a>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {cert.skills.map((skill, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LearningHub
