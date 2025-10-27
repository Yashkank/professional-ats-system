import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  MapPin,
  Phone,
  Mail,
  Globe,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  FileText,
  TrendingUp,
  XCircle
} from 'lucide-react'
import { companyAPI, jobAPI, userAPI } from '../services/api'
import toast from 'react-hot-toast'

const CompanyManagement = ({ onExportData }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState('all')
  const [selectedSize, setSelectedSize] = useState('all')
  const [expandedCompany, setExpandedCompany] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [companies, setCompanies] = useState([])
  const [filteredCompanies, setFilteredCompanies] = useState([])
  const [jobs, setJobs] = useState([])
  const [users, setUsers] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch real company data
  const fetchCompanies = useCallback(async () => {
    setIsLoading(true)
    try {
      const [companiesRes, jobsRes, usersRes] = await Promise.all([
        companyAPI.getCompanies(),
        jobAPI.getJobs(),
        userAPI.getAllUsers()
      ])

      const companiesData = companiesRes.data.map(company => {
        // Get jobs for this company
        const companyJobs = jobsRes.data.filter(job => job.company_id === company.id)
        const activeJobs = companyJobs.filter(job => job.status === 'active')

        // Get users (recruiters) for this company
        const companyUsers = usersRes.data.filter(user => user.company_id === company.id)
        const recruiters = companyUsers.filter(user => user.role === 'recruiter')

        return {
          ...company,
          stats: {
            totalJobs: companyJobs.length,
            activeJobs: activeJobs.length,
            totalRecruiters: recruiters.length,
            totalUsers: companyUsers.length
          },
          users: companyUsers
        }
      })

      setCompanies(companiesData)
      setFilteredCompanies(companiesData)
      setJobs(jobsRes.data)
      setUsers(usersRes.data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching companies:', error)
      toast.error('Failed to load companies')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompanies()
  }, [fetchCompanies])

  // Filter companies
  useEffect(() => {
    let result = companies

    // Search filter
    if (searchTerm) {
      result = result.filter(company =>
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.website?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Industry filter
    if (selectedIndustry !== 'all') {
      result = result.filter(company => company.industry === selectedIndustry)
    }

    // Size filter
    if (selectedSize !== 'all') {
      result = result.filter(company => company.size === selectedSize)
    }

    setFilteredCompanies(result)
  }, [companies, searchTerm, selectedIndustry, selectedSize])

  const handleRefresh = () => {
    fetchCompanies()
    toast.success('Companies refreshed')
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = filteredCompanies.map(company => ({
      Name: company.name,
      Industry: company.industry || 'N/A',
      Size: company.size || 'N/A',
      Website: company.website || 'N/A',
      'Total Jobs': company.stats.totalJobs,
      'Active Jobs': company.stats.activeJobs,
      'Recruiters': company.stats.totalRecruiters,
      'Created': new Date(company.created_at).toLocaleDateString()
    }))

    // Convert to CSV
    const headers = Object.keys(csvData[0])
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `companies_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    if (onExportData) onExportData()
    toast.success('Companies exported successfully')
  }

  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This will also delete all associated jobs and data.')) {
      return
    }

    try {
      await companyAPI.deleteCompany(companyId)
      setCompanies(prev => prev.filter(c => c.id !== companyId))
      toast.success('Company deleted successfully')
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Failed to delete company')
    }
  }

  const getCompanyStats = () => {
    return {
      total: companies.length,
      totalJobs: companies.reduce((sum, c) => sum + c.stats.totalJobs, 0),
      totalRecruiters: companies.reduce((sum, c) => sum + c.stats.totalRecruiters, 0),
      totalUsers: companies.reduce((sum, c) => sum + c.stats.totalUsers, 0)
    }
  }

  const stats = getCompanyStats()

  // Get unique industries and sizes for filters
  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))]
  const sizes = [...new Set(companies.map(c => c.size).filter(Boolean))]

  if (isLoading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">Company Management</h2>
                <p className="text-blue-100">Manage organizations and their users</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 mt-4 text-sm text-blue-200">
              <Clock className="h-4 w-4" />
              <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.totalJobs}</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Recruiters</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">{stats.totalRecruiters}</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-orange-600 mt-1">{stats.totalUsers}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Companies</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, industry, or website..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Size Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Size</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Sizes</option>
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="space-y-4">
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Company Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        {company.industry && (
                          <span className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {company.industry}
                          </span>
                        )}
                        {company.size && (
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {company.size} employees
                          </span>
                        )}
                        {company.website && (
                          <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:text-blue-800"
                          >
                            <Globe className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        )}
                      </div>
                      {company.description && (
                        <p className="mt-2 text-sm text-gray-600">{company.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setExpandedCompany(expandedCompany === company.id ? null : company.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCompany(company)
                        setShowEditModal(true)
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                      title="Edit Company"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCompany(company.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Company"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Company Stats */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{company.stats.totalJobs}</p>
                    <p className="text-xs text-gray-600">Total Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{company.stats.activeJobs}</p>
                    <p className="text-xs text-gray-600">Active Jobs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{company.stats.totalRecruiters}</p>
                    <p className="text-xs text-gray-600">Recruiters</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{company.stats.totalUsers}</p>
                    <p className="text-xs text-gray-600">Total Users</p>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedCompany === company.id && (
                <div className="p-6 border-t border-gray-200 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Company Info */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Company Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900 font-medium">
                            {new Date(company.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {company.updated_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="text-gray-900 font-medium">
                              {new Date(company.updated_at).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Users in Company */}
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Company Users ({company.users?.length || 0})
                      </h4>
                      {company.users && company.users.length > 0 ? (
                        <div className="space-y-2">
                          {company.users.slice(0, 5).map(user => (
                            <div key={user.id} className="flex items-center justify-between text-sm">
                              <div>
                                <p className="text-gray-900 font-medium">{user.full_name || user.username}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'recruiter' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {user.role}
                              </span>
                            </div>
                          ))}
                          {company.users.length > 5 && (
                            <p className="text-xs text-gray-500 mt-2">
                              +{company.users.length - 5} more users
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No users associated with this company</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedIndustry !== 'all' || selectedSize !== 'all'
                ? 'Try adjusting your filters'
                : 'No companies registered yet'}
            </p>
          </div>
        )}
      </div>

      {/* Edit Company Modal */}
      {showEditModal && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Company Details</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedCompany(null)
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Company Name</label>
                <p className="text-lg font-semibold text-gray-900">{selectedCompany.name}</p>
              </div>
              {selectedCompany.industry && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Industry</label>
                  <p className="text-lg text-gray-900">{selectedCompany.industry}</p>
                </div>
              )}
              {selectedCompany.size && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Company Size</label>
                  <p className="text-lg text-gray-900">{selectedCompany.size} employees</p>
                </div>
              )}
              {selectedCompany.website && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Website</label>
                  <a 
                    href={selectedCompany.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg text-blue-600 hover:text-blue-800"
                  >
                    {selectedCompany.website}
                  </a>
                </div>
              )}
              {selectedCompany.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Description</label>
                  <p className="text-sm text-gray-900">{selectedCompany.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Jobs</label>
                  <p className="text-2xl font-bold text-gray-900">{selectedCompany.stats.totalJobs}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Active Jobs</label>
                  <p className="text-2xl font-bold text-green-600">{selectedCompany.stats.activeJobs}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Recruiters</label>
                  <p className="text-2xl font-bold text-purple-600">{selectedCompany.stats.totalRecruiters}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Total Users</label>
                  <p className="text-2xl font-bold text-blue-600">{selectedCompany.stats.totalUsers}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-500 mb-2">Account Created</label>
                <p className="text-sm text-gray-900">{new Date(selectedCompany.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CompanyManagement
