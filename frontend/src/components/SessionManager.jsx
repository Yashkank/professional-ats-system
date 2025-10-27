import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContextEnhanced'
import { 
  Monitor, 
  MapPin, 
  Clock, 
  Trash2, 
  LogOut, 
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

const SessionManager = ({ isOpen, onClose }) => {
  const { sessions, logoutAllDevices, revokeSession, fetchSessions } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen, fetchSessions])

  const handleLogoutAll = async () => {
    if (!confirm('Are you sure you want to logout from all devices? This will end all active sessions.')) {
      return
    }

    setIsLoading(true)
    const result = await logoutAllDevices()
    if (result.success) {
      onClose()
    } else {
      alert(result.error || 'Failed to logout from all devices')
    }
    setIsLoading(false)
  }

  const handleRevokeSession = async (sessionId) => {
    if (!confirm('Are you sure you want to revoke this session?')) {
      return
    }

    setActionLoading(sessionId)
    const result = await revokeSession(sessionId)
    if (!result.success) {
      alert(result.error || 'Failed to revoke session')
    }
    setActionLoading(null)
  }

  const getDeviceInfo = (clientInfo) => {
    const userAgent = clientInfo.user_agent || ''
    const ip = clientInfo.ip || 'Unknown'
    
    // Simple device detection
    let device = 'Unknown Device'
    if (userAgent.includes('Windows')) device = 'Windows PC'
    else if (userAgent.includes('Mac')) device = 'Mac'
    else if (userAgent.includes('Linux')) device = 'Linux PC'
    else if (userAgent.includes('iPhone')) device = 'iPhone'
    else if (userAgent.includes('Android')) device = 'Android Phone'
    else if (userAgent.includes('iPad')) device = 'iPad'
    
    return { device, ip }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    try {
      return new Date(dateString).toLocaleString()
    } catch {
      return 'Unknown'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Active Sessions</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Manage your active sessions across different devices and locations.
          </p>
        </div>

        {/* Sessions List */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="text-center py-8">
              <Monitor className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => {
                const { device, ip } = getDeviceInfo(session.client_info || {})
                const isCurrent = index === 0 // Assume first session is current
                
                return (
                  <div
                    key={session.session_id}
                    className={`border rounded-lg p-4 ${
                      isCurrent ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          isCurrent ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Monitor className={`h-5 w-5 ${
                            isCurrent ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{device}</h3>
                            {isCurrent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Current Session
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-2 space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              IP: {ip}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Last Active: {formatDate(session.last_activity)}
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              Created: {formatDate(session.created_at)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {!isCurrent && (
                        <button
                          onClick={() => handleRevokeSession(session.session_id)}
                          disabled={actionLoading === session.session_id}
                          className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          {actionLoading === session.session_id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Revoke
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Revoking a session will immediately log out that device.
            </div>
            
            <button
              onClick={handleLogoutAll}
              disabled={isLoading || sessions.length === 0}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <LogOut className="h-4 w-4 mr-2" />
              )}
              Logout All Devices
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SessionManager
