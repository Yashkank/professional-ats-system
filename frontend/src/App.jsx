import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RecruiterDashboard from './pages/RecruiterDashboard'
import CandidateDashboard from './pages/CandidateDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Jobs from './pages/Jobs'
import Applications from './pages/Applications'
import Users from './pages/Users'
import Settings from './pages/Settings'
import AIMatching from './pages/AIMatching'

function App() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ATS Application...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Navigate to="/dashboard" replace />
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Navigate to={`/${user?.role || 'candidate'}-dashboard`} replace />
        </ProtectedRoute>
      } />
      
      <Route path="/recruiter-dashboard" element={
        <ProtectedRoute requiredRole="recruiter">
          <Layout>
            <RecruiterDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/candidate-dashboard" element={
        <ProtectedRoute requiredRole="candidate">
          <Layout>
            <CandidateDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin-dashboard" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <AdminDashboard />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/jobs" element={
        <ProtectedRoute>
          <Layout>
            <Jobs />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/applications" element={
        <ProtectedRoute>
          <Layout>
            <Applications />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/users" element={
        <ProtectedRoute requiredRole="admin">
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <Layout>
            <Settings />
          </Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/ai-matching" element={
        <ProtectedRoute requiredRole="recruiter">
          <Layout>
            <AIMatching />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Catch all route - redirect to login if not authenticated */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App