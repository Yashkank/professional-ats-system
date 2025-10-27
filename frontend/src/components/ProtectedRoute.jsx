import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../services/api'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isLoading, logout } = useAuth()
  const location = useLocation()
  const [isValidating, setIsValidating] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)

  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsValidating(true)
        
        // Check if user is already authenticated
        if (user) {
          setIsTokenValid(true)
          setIsValidating(false)
          return
        }

        // If no user, try to validate token from cookies
        const response = await api.get('/users/me', {
          withCredentials: true
        })
        
        if (response.status === 200) {
          setIsTokenValid(true)
        } else {
          setIsTokenValid(false)
        }
      } catch (error) {
        console.log('🔒 Token validation failed:', error.response?.status)
        setIsTokenValid(false)
        
        // If token is invalid, clear any stored data
        if (error.response?.status === 401) {
          logout()
        }
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [user, logout])

  // Show loading spinner while validating
  if (isLoading || isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating authentication...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isTokenValid || !user) {
    console.log('🔒 Redirecting to login - not authenticated')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access if required
  if (requiredRole && user.role !== requiredRole && user.role !== 'admin') {
    console.log(`🔒 Access denied - required role: ${requiredRole}, user role: ${user.role}`)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Access Denied!</strong>
            <p>You don't have permission to access this page.</p>
            <p>Required role: <strong>{requiredRole}</strong></p>
            <p>Your role: <strong>{user.role}</strong></p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // User is authenticated and has proper role
  console.log('✅ Access granted to protected route')
  return children
}

export default ProtectedRoute
