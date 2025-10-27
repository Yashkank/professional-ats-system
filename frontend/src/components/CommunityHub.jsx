import React, { useState, useEffect } from 'react'
import { 
  Users, MessageCircle, Star, UserPlus, Search, 
  Filter, Globe, MapPin, Briefcase, Award,
  TrendingUp, Heart, Share2, Flag, MoreVertical, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'

const CommunityHub = ({ candidateProfile }) => {
  console.log('CommunityHub component rendering...', { candidateProfile })
  
  const [activeTab, setActiveTab] = useState('peers')
  const [peers, setPeers] = useState([])
  const [mentors, setMentors] = useState([])
  const [networkingEvents, setNetworkingEvents] = useState([])
  const [discussions, setDiscussions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    location: '',
    skills: [],
    experience: 'all'
  })

  useEffect(() => {
    fetchCommunityData()
  }, [candidateProfile])

  const fetchCommunityData = async () => {
    try {
      console.log('Fetching community data...')
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock peers data
      setPeers([
        {
          id: 1,
          name: 'Alex Chen',
          title: 'Senior Python Developer',
          company: 'Google',
          location: 'San Francisco, CA',
          skills: ['Python', 'Django', 'AWS', 'Machine Learning'],
          experience: '5 years',
          avatar: 'https://via.placeholder.com/100x100',
          mutualConnections: 12,
          isConnected: false,
          mutualSkills: ['Python', 'AWS'],
          lastActive: '2 hours ago',
          bio: 'Passionate about building scalable applications and mentoring junior developers.',
          achievements: ['AWS Certified', 'Open Source Contributor'],
          rating: 4.8,
          reviews: 24
        },
        {
          id: 2,
          name: 'Sarah Johnson',
          title: 'Full Stack Engineer',
          company: 'Microsoft',
          location: 'Seattle, WA',
          skills: ['React', 'Node.js', 'TypeScript', 'Docker'],
          experience: '4 years',
          avatar: 'https://via.placeholder.com/100x100',
          mutualConnections: 8,
          isConnected: true,
          mutualSkills: ['React', 'Node.js'],
          lastActive: '1 day ago',
          bio: 'Love creating beautiful user experiences and sharing knowledge with the community.',
          achievements: ['React Expert', 'Tech Speaker'],
          rating: 4.9,
          reviews: 31
        },
        {
          id: 3,
          name: 'Mike Rodriguez',
          title: 'DevOps Engineer',
          company: 'Netflix',
          location: 'Los Gatos, CA',
          skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform'],
          experience: '6 years',
          avatar: 'https://via.placeholder.com/100x100',
          mutualConnections: 15,
          isConnected: false,
          mutualSkills: ['AWS'],
          lastActive: '3 hours ago',
          bio: 'DevOps enthusiast helping teams scale their infrastructure efficiently.',
          achievements: ['Kubernetes Certified', 'DevOps Leader'],
          rating: 4.7,
          reviews: 18
        }
      ])

      // Mock mentors data
      setMentors([
        {
          id: 1,
          name: 'Dr. Emily Watson',
          title: 'VP of Engineering',
          company: 'Stripe',
          location: 'San Francisco, CA',
          skills: ['Leadership', 'System Design', 'Python', 'Architecture'],
          experience: '15 years',
          avatar: 'https://via.placeholder.com/100x100',
          isMentor: true,
          mentorshipAreas: ['Career Growth', 'Technical Leadership', 'System Design'],
          availability: '2 hours/week',
          rate: '$150/hour',
          rating: 4.9,
          reviews: 45,
          bio: 'Experienced engineering leader passionate about developing the next generation of tech talent.',
          achievements: ['Forbes 30 Under 30', 'TechCrunch Speaker', 'Open Source Maintainer']
        },
        {
          id: 2,
          name: 'James Wilson',
          title: 'Principal Engineer',
          company: 'Amazon',
          location: 'Seattle, WA',
          skills: ['Distributed Systems', 'Java', 'AWS', 'Microservices'],
          experience: '12 years',
          avatar: 'https://via.placeholder.com/100x100',
          isMentor: true,
          mentorshipAreas: ['Distributed Systems', 'Career Transition', 'Interview Prep'],
          availability: '1 hour/week',
          rate: '$120/hour',
          rating: 4.8,
          reviews: 32,
          bio: 'Principal engineer with expertise in building large-scale distributed systems.',
          achievements: ['AWS Hero', 'Conference Speaker', 'Patent Holder']
        }
      ])

      // Mock networking events
      setNetworkingEvents([
        {
          id: 1,
          title: 'Tech Meetup: AI & Machine Learning',
          organizer: 'SF Tech Community',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          location: 'San Francisco, CA',
          type: 'Meetup',
          attendees: 120,
          maxAttendees: 150,
          isRegistered: false,
          description: 'Join us for an evening of AI and ML discussions with industry experts.',
          speakers: ['Dr. Sarah Kim', 'Alex Chen', 'Mike Johnson'],
          tags: ['AI', 'Machine Learning', 'Networking']
        },
        {
          id: 2,
          title: 'Women in Tech Conference 2024',
          organizer: 'Women in Tech SF',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: 'Virtual',
          type: 'Conference',
          attendees: 500,
          maxAttendees: 1000,
          isRegistered: true,
          description: 'Annual conference celebrating women in technology and promoting diversity.',
          speakers: ['CEO of GitHub', 'VP of Engineering at Slack', 'CTO of Stripe'],
          tags: ['Diversity', 'Leadership', 'Career Growth']
        }
      ])

      // Mock discussions
      setDiscussions([
        {
          id: 1,
          title: 'Best practices for React performance optimization',
          author: 'Alex Chen',
          authorAvatar: 'https://via.placeholder.com/40x40',
          content: 'I\'ve been working on optimizing a large React application and wanted to share some techniques that have worked well...',
          tags: ['React', 'Performance', 'JavaScript'],
          likes: 24,
          comments: 8,
          views: 156,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isLiked: false
        },
        {
          id: 2,
          title: 'Career advice: How to transition from junior to senior developer',
          author: 'Sarah Johnson',
          authorAvatar: 'https://via.placeholder.com/40x40',
          content: 'After 4 years in the industry, I\'ve learned some valuable lessons about career growth. Here are my top tips...',
          tags: ['Career', 'Advice', 'Growth'],
          likes: 42,
          comments: 15,
          views: 289,
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          isLiked: true
        }
      ])

    } catch (error) {
      console.error('Community data fetch error:', error)
      toast.error('Failed to load community data')
      // Set some default data to prevent blank screen
      setPeers([])
      setMentors([])
      setNetworkingEvents([])
      setDiscussions([])
    } finally {
      setIsLoading(false)
    }
  }

  const connectWithPeer = async (peerId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPeers(prev => 
        prev.map(peer => 
          peer.id === peerId 
            ? { ...peer, isConnected: true }
            : peer
        )
      )
      
      toast.success('Connection request sent!')
    } catch (error) {
      toast.error('Failed to send connection request')
    }
  }

  const requestMentorship = async (mentorId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.success('Mentorship request sent!')
    } catch (error) {
      toast.error('Failed to send mentorship request')
    }
  }

  const registerForEvent = async (eventId) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setNetworkingEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: true, attendees: event.attendees + 1 }
            : event
        )
      )
      
      toast.success('Successfully registered for event!')
    } catch (error) {
      toast.error('Failed to register for event')
    }
  }

  const likeDiscussion = async (discussionId) => {
    try {
      setDiscussions(prev => 
        prev.map(discussion => 
          discussion.id === discussionId 
            ? { 
                ...discussion, 
                isLiked: !discussion.isLiked,
                likes: discussion.isLiked ? discussion.likes - 1 : discussion.likes + 1
              }
            : discussion
        )
      )
    } catch (error) {
      toast.error('Failed to like discussion')
    }
  }

  const filteredPeers = peers.filter(peer => {
    const matchesSearch = peer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         peer.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesLocation = !filters.location || peer.location.toLowerCase().includes(filters.location.toLowerCase())
    
    const matchesSkills = filters.skills.length === 0 || 
                         filters.skills.some(skill => peer.skills.includes(skill))
    
    return matchesSearch && matchesLocation && matchesSkills
  })

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading community...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Community & Networking
          </h3>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search peers, mentors, events..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'peers', label: 'Peers', icon: Users },
            { id: 'mentors', label: 'Mentors', icon: Award },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'discussions', label: 'Discussions', icon: MessageCircle }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Peers Tab */}
      {activeTab === 'peers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-gray-900">
              Recommended Peers ({filteredPeers.length})
            </h4>
            <div className="flex items-center space-x-2">
              <select
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Locations</option>
                <option value="san francisco">San Francisco</option>
                <option value="seattle">Seattle</option>
                <option value="new york">New York</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPeers.map((peer) => (
              <div key={peer.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={peer.avatar}
                    alt={peer.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{peer.name}</h5>
                    <p className="text-sm text-gray-600">{peer.title}</p>
                    <p className="text-sm text-gray-500">{peer.company}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {peer.location}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{peer.bio}</p>

                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-900 mb-2">Skills</h6>
                  <div className="flex flex-wrap gap-1">
                    {peer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded ${
                          peer.mutualSkills.includes(skill)
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {peer.mutualConnections} mutual connections
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    {peer.rating} ({peer.reviews} reviews)
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Last active {peer.lastActive}</span>
                  <button
                    onClick={() => connectWithPeer(peer.id)}
                    disabled={peer.isConnected}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      peer.isConnected
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {peer.isConnected ? 'Connected' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mentors Tab */}
      {activeTab === 'mentors' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Available Mentors ({mentors.length})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900">{mentor.name}</h5>
                    <p className="text-sm text-gray-600">{mentor.title}</p>
                    <p className="text-sm text-gray-500">{mentor.company}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <MapPin className="h-3 w-3 mr-1" />
                      {mentor.location}
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-4">{mentor.bio}</p>

                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-900 mb-2">Mentorship Areas</h6>
                  <div className="flex flex-wrap gap-1">
                    {mentor.mentorshipAreas.map((area, index) => (
                      <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Availability:</span>
                    <span className="ml-1 font-medium">{mentor.availability}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Rate:</span>
                    <span className="ml-1 font-medium">{mentor.rate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span className="text-sm font-medium">{mentor.rating}</span>
                    <span className="text-sm text-gray-500 ml-1">({mentor.reviews} reviews)</span>
                  </div>
                </div>

                <button
                  onClick={() => requestMentorship(mentor.id)}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Request Mentorship
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Upcoming Events ({networkingEvents.length})
          </h4>

          <div className="space-y-4">
            {networkingEvents.map((event) => (
              <div key={event.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 mb-2">{event.title}</h5>
                    <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {event.date.toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {event.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {event.attendees}/{event.maxAttendees} attendees
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    event.type === 'Conference' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {event.type}
                  </span>
                </div>

                <div className="mb-4">
                  <h6 className="text-sm font-medium text-gray-900 mb-2">Speakers</h6>
                  <div className="flex flex-wrap gap-1">
                    {event.speakers.map((speaker, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        {speaker}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {event.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => registerForEvent(event.id)}
                    disabled={event.isRegistered}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      event.isRegistered
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {event.isRegistered ? 'Registered' : 'Register'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">
            Community Discussions ({discussions.length})
          </h4>

          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div key={discussion.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <img
                    src={discussion.authorAvatar}
                    alt={discussion.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-medium text-gray-900">{discussion.author}</h5>
                      <span className="text-sm text-gray-500">
                        {discussion.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <h6 className="font-medium text-gray-900 mb-2">{discussion.title}</h6>
                    <p className="text-sm text-gray-600 mb-4">{discussion.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => likeDiscussion(discussion.id)}
                      className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-sm ${
                        discussion.isLiked
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${discussion.isLiked ? 'fill-current' : ''}`} />
                      <span>{discussion.likes}</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
                      <MessageCircle className="h-4 w-4" />
                      <span>{discussion.comments}</span>
                    </button>
                    <button className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm hover:bg-gray-200">
                      <Share2 className="h-4 w-4" />
                      <span>Share</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-wrap gap-1">
                      {discussion.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Error boundary wrapper
const CommunityHubWithErrorBoundary = (props) => {
  try {
    return <CommunityHub {...props} />
  } catch (error) {
    console.error('CommunityHub error:', error)
    return (
      <div className="card">
        <div className="p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Community Hub</h3>
          <p className="text-gray-600 mb-4">Something went wrong loading the community features.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }
}

export default CommunityHubWithErrorBoundary
