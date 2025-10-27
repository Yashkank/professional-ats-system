import React, { useState, useEffect } from 'react'
import {
  MessageSquare, Send, Edit, Trash2, Reply, 
  MoreHorizontal, User, Clock, AlertCircle, 
  CheckCircle, XCircle, Star, Flag, ThumbsUp,
  AtSign, Hash, Paperclip, Smile, Image
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function TeamComments({ 
  candidateId, 
  jobId, 
  onAddComment,
  onUpdateComment,
  onDeleteComment,
  onReplyToComment 
}) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [editingComment, setEditingComment] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock comments data - in real app, this would come from API
  useEffect(() => {
    const mockComments = [
      {
        id: 1,
        content: 'Initial phone screening went very well. Candidate has strong technical background and good communication skills.',
        author: {
          id: 'user-1',
          name: 'Sarah Johnson',
          avatar: null,
          role: 'admin'
        },
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        type: 'general',
        priority: 'normal',
        isEdited: false,
        likes: 3,
        replies: [
          {
            id: 11,
            content: 'Agreed! I think we should move to technical interview.',
            author: {
              id: 'user-2',
              name: 'Mike Chen',
              avatar: null,
              role: 'recruiter'
            },
            createdAt: '2024-01-15T11:15:00Z',
            updatedAt: '2024-01-15T11:15:00Z',
            isEdited: false,
            likes: 1
          }
        ],
        mentions: ['@mike.chen'],
        tags: ['#screening', '#positive']
      },
      {
        id: 2,
        content: 'Technical interview scheduled for tomorrow at 2 PM. Please review the candidate\'s GitHub profile before the interview.',
        author: {
          id: 'user-2',
          name: 'Mike Chen',
          avatar: null,
          role: 'recruiter'
        },
        createdAt: '2024-01-15T14:20:00Z',
        updatedAt: '2024-01-15T14:20:00Z',
        type: 'action',
        priority: 'high',
        isEdited: false,
        likes: 2,
        replies: [],
        mentions: ['@sarah.johnson'],
        tags: ['#interview', '#technical', '#urgent']
      },
      {
        id: 3,
        content: 'Candidate showed excellent problem-solving skills during the technical interview. Strong recommendation for next round.',
        author: {
          id: 'user-3',
          name: 'Emily Rodriguez',
          avatar: null,
          role: 'recruiter'
        },
        createdAt: '2024-01-16T16:45:00Z',
        updatedAt: '2024-01-16T16:45:00Z',
        type: 'feedback',
        priority: 'normal',
        isEdited: false,
        likes: 5,
        replies: [],
        mentions: [],
        tags: ['#feedback', '#positive', '#recommendation']
      }
    ]
    setComments(mockComments)
  }, [candidateId, jobId])

  const commentTypes = [
    { value: 'general', label: 'General', color: 'gray', icon: MessageSquare },
    { value: 'action', label: 'Action Required', color: 'red', icon: AlertCircle },
    { value: 'feedback', label: 'Feedback', color: 'blue', icon: CheckCircle },
    { value: 'question', label: 'Question', color: 'yellow', icon: MessageSquare }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'green' },
    { value: 'normal', label: 'Normal', color: 'gray' },
    { value: 'high', label: 'High', color: 'red' },
    { value: 'urgent', label: 'Urgent', color: 'red' }
  ]

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    const comment = {
      id: Date.now(),
      content: newComment,
      author: {
        id: 'current-user',
        name: 'Current User',
        avatar: null,
        role: 'recruiter'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      type: 'general',
      priority: 'normal',
      isEdited: false,
      likes: 0,
      replies: [],
      mentions: extractMentions(newComment),
      tags: extractTags(newComment)
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')

    if (onAddComment) {
      onAddComment(comment)
    }

    toast.success('Comment added successfully')
  }

  const handleUpdateComment = (commentId, newContent) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              content: newContent,
              updatedAt: new Date().toISOString(),
              isEdited: true,
              mentions: extractMentions(newContent),
              tags: extractTags(newContent)
            }
          : comment
      )
    )

    if (onUpdateComment) {
      onUpdateComment(commentId, newContent)
    }

    setEditingComment(null)
    toast.success('Comment updated successfully')
  }

  const handleDeleteComment = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      setComments(prev => prev.filter(comment => comment.id !== commentId))
      
      if (onDeleteComment) {
        onDeleteComment(commentId)
      }

      toast.success('Comment deleted successfully')
    }
  }

  const handleReply = (commentId, replyContent) => {
    const reply = {
      id: Date.now(),
      content: replyContent,
      author: {
        id: 'current-user',
        name: 'Current User',
        avatar: null,
        role: 'recruiter'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isEdited: false,
      likes: 0
    }

    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      )
    )

    if (onReplyToComment) {
      onReplyToComment(commentId, reply)
    }

    setReplyTo(null)
    setShowReplyForm(false)
    toast.success('Reply added successfully')
  }

  const handleLike = (commentId) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      )
    )
  }

  const extractMentions = (text) => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[0])
    }
    return mentions
  }

  const extractTags = (text) => {
    const tagRegex = /#(\w+)/g
    const tags = []
    let match
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[0])
    }
    return tags
  }

  const formatTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getTypeColor = (type) => {
    const typeData = commentTypes.find(t => t.value === type)
    return typeData ? typeData.color : 'gray'
  }

  const getPriorityColor = (priority) => {
    const priorityData = priorities.find(p => p.value === priority)
    return priorityData ? priorityData.color : 'gray'
  }

  const filteredComments = comments.filter(comment => {
    const matchesFilter = filter === 'all' || comment.type === filter
    const matchesSearch = searchTerm === '' || 
      comment.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comment.author.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Comments</h2>
          <p className="text-gray-600">Collaborate with your team on candidates and jobs</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {comments.length} comments
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search comments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {commentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex space-x-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @username to mention someone or #tag for categorization"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Use @ to mention someone</span>
                <span>•</span>
                <span>Use # to add tags</span>
              </div>
              <button
                onClick={handleAddComment}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Send className="h-4 w-4 mr-2" />
                Post Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {filteredComments.map((comment) => {
          const typeColor = getTypeColor(comment.type)
          const priorityColor = getPriorityColor(comment.priority)
          
          return (
            <div key={comment.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{comment.author.name}</h4>
                      <span className="text-sm text-gray-500">{comment.author.role}</span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-${typeColor}-100 text-${typeColor}-800`}>
                        {commentTypes.find(t => t.value === comment.type)?.label}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-${priorityColor}-100 text-${priorityColor}-800`}>
                        {comment.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                      {comment.isEdited && (
                        <span className="text-xs text-gray-400">(edited)</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-gray-700 mb-3">
                    {editingComment === comment.id ? (
                      <textarea
                        value={comment.content}
                        onChange={(e) => setComments(prev => 
                          prev.map(c => c.id === comment.id ? { ...c, content: e.target.value } : c)
                        )}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{comment.content}</p>
                    )}
                  </div>
                  
                  {/* Mentions and Tags */}
                  {(comment.mentions.length > 0 || comment.tags.length > 0) && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {comment.mentions.map((mention, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          <AtSign className="h-3 w-3 mr-1" />
                          {mention}
                        </span>
                      ))}
                      {comment.tags.map((tag, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(comment.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        <span>{comment.likes}</span>
                      </button>
                      <button
                        onClick={() => {
                          setReplyTo(comment.id)
                          setShowReplyForm(true)
                        }}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Reply className="h-4 w-4" />
                        <span>Reply</span>
                      </button>
                      <button
                        onClick={() => setEditingComment(comment.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors duration-200"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                    
                    {editingComment === comment.id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id, comment.content)}
                          className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingComment(null)}
                          className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Replies */}
                  {comment.replies.length > 0 && (
                    <div className="mt-4 ml-6 space-y-3">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-sm font-medium text-gray-900">{reply.author.name}</h5>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(reply.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Reply Form */}
                  {showReplyForm && replyTo === comment.id && (
                    <div className="mt-4 ml-6">
                      <div className="flex space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <textarea
                            placeholder="Write a reply..."
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && e.ctrlKey) {
                                handleReply(comment.id, e.target.value)
                                e.target.value = ''
                              }
                            }}
                          />
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              Press Ctrl+Enter to reply
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  const textarea = document.querySelector('textarea[placeholder="Write a reply..."]')
                                  handleReply(comment.id, textarea.value)
                                  textarea.value = ''
                                }}
                                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors duration-200"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => {
                                  setShowReplyForm(false)
                                  setReplyTo(null)
                                }}
                                className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors duration-200"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredComments.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No comments yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Start the conversation by adding a comment above
          </p>
        </div>
      )}
    </div>
  )
}
