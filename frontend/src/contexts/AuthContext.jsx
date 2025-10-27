import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [sessions, setSessions] = useState([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Auto-refresh token before expiry
  const refreshToken = useCallback(async () => {
    if (isRefreshing) return false
    
    try {
      setIsRefreshing(true)
      const response = await api.post('/auth/refresh', {}, {
        withCredentials: true // Include cookies
      })
      
      console.log('✅ Token refreshed successfully')
      return true
    } catch (error) {
      console.error('❌ Token refresh failed:', error)
      logout()
      return false
    } finally {
      setIsRefreshing(false)
    }
  }, [isRefreshing])

  // Set up auto-refresh interval
  useEffect(() => {
    if (!user) return

    // Refresh token every 10 minutes (before 15-minute expiry)
    const interval = setInterval(() => {
      refreshToken()
    }, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [user, refreshToken])

  // Check for idle timeout
  useEffect(() => {
    if (!user) return

    let idleTimer
    const resetIdleTimer = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => {
        console.log('🕐 User idle timeout reached')
        logout()
      }, 30 * 60 * 1000) // 30 minutes idle timeout
    }

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true)
    })

    resetIdleTimer()

    return () => {
      clearTimeout(idleTimer)
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true)
      })
    }
  }, [user])

  useEffect(() => {
    // Check if user is logged in on app start
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      console.log('Fetching user data...')
      const response = await api.get('/users/me', { 
        withCredentials: true // Include cookies
      })
      
      console.log('User data fetched successfully:', response.data)
      setUser(response.data)
      
      // Fetch active sessions
      fetchSessions()
    } catch (error) {
      console.error('Failed to fetch user:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSessions = async () => {
    try {
      const response = await api.get('/auth/sessions', {
        withCredentials: true
      })
      setSessions(response.data)
    } catch (error) {
      console.error('Failed to fetch sessions:', error)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('Attempting login for:', email)
      const response = await api.post('/auth/login', { email, password }, {
        withCredentials: true // Include cookies
      })
      const { user: userData } = response.data
      
      console.log('Login successful, setting user')
      setUser(userData)
      
      // Fetch sessions after login
      fetchSessions()
      
      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Login failed' 
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData, {
        withCredentials: true // Include cookies
      })
      const { user: newUser } = response.data
      
      setUser(newUser)
      
      // Fetch sessions after signup
      fetchSessions()
      
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Signup failed' 
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setSessions([])
    }
  }

  const logoutAllDevices = async () => {
    try {
      await api.post('/auth/logout-all', {}, {
        withCredentials: true
      })
      setUser(null)
      setSessions([])
      return { success: true }
    } catch (error) {
      console.error('Logout all devices error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Logout failed' 
      }
    }
  }

  const revokeSession = async (sessionId) => {
    try {
      await api.delete(`/auth/sessions/${sessionId}`, {
        withCredentials: true
      })
      fetchSessions() // Refresh sessions list
      return { success: true }
    } catch (error) {
      console.error('Revoke session error:', error)
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Revoke failed' 
      }
    }
  }

  const value = {
    user,
    isLoading,
    sessions,
    isRefreshing,
    login,
    signup,
    logout,
    logoutAllDevices,
    revokeSession,
    fetchSessions,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}