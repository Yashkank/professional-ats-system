import axios from 'axios'

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for all requests
})

// Request interceptor (cookies are automatically included with withCredentials: true)
api.interceptors.request.use(
  (config) => {
    // Cookies are automatically included, no need to manually add tokens
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('🔒 401 Unauthorized - Token invalid or expired')
      // Clear any stored authentication data
      // The ProtectedRoute component will handle the redirect
    }
    return Promise.reject(error)
  }
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  signup: (userData) => api.post('/auth/signup', userData),
  logout: () => api.post('/auth/logout'),
}

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
  getAllUsers: () => api.get('/users/'),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (userData) => api.post('/users/', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
}

export const jobAPI = {
  getJobs: () => api.get('/jobs/'),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs/', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
}

export const applicationAPI = {
  getApplications: () => api.get('/applications/'),
  getApplication: (id) => api.get(`/applications/${id}`),
  createApplication: (applicationData) => api.post('/applications/', applicationData),
  updateApplication: (id, applicationData) => api.put(`/applications/${id}`, applicationData),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
}

export const companyAPI = {
  getCompanies: () => api.get('/companies/'),
  getCompany: (id) => api.get(`/companies/${id}`),
  createCompany: (companyData) => api.post('/companies/', companyData),
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
  deleteCompany: (id) => api.delete(`/companies/${id}`),
}

export const aiMatchingAPI = {
  // Manual file upload matching
  matchResume: (formData) => api.post('/ai/match-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  // Job-based automatic matching
  getAvailableJobs: () => api.get('/ai/jobs/available'),
  matchResumesForJob: (jobId, requestData) => api.post(`/ai/match-resumes/${jobId}`, requestData),
}

// Candidate features (recommendations, saved jobs, alerts, profile analysis)
export const candidateAPI = {
  getRecommendations: () => api.get('/candidate/recommendations'),
  getSavedJobs: () => api.get('/candidate/saved-jobs'),
  saveJob: (jobId) => api.post('/candidate/saved-jobs', null, { params: { job_id: jobId } }),
  removeSavedJob: (jobId) => api.delete(`/candidate/saved-jobs/${jobId}`),
  getJobAlerts: () => api.get('/candidate/job-alerts'),
  createJobAlert: (data) => api.post('/candidate/job-alerts', data),
  toggleJobAlert: (alertId) => api.put(`/candidate/job-alerts/${alertId}/toggle`),
  deleteJobAlert: (alertId) => api.delete(`/candidate/job-alerts/${alertId}`),
  getProfileAnalysis: () => api.get('/candidate/profile-analysis'),
}

// Admin analytics API - Real-time data from database
export const adminAnalyticsAPI = {
  getOverview: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/overview', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
  getUserMetrics: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/users', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
  getJobMetrics: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/jobs', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
  getApplicationMetrics: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/applications', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
  getSystemMetrics: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/system', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
  getGeographicMetrics: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/geographic', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
  getPerformanceMetrics: (timeRange = '30d', customStart = null, customEnd = null) => 
    api.get('/admin/analytics/performance', { 
      params: { time_range: timeRange, custom_start: customStart, custom_end: customEnd } 
    }),
}