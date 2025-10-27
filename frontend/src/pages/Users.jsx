import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { userAPI, companyAPI } from '../services/api'
import { Plus, Search, Edit, Trash2, Shield, User, Mail, Building } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Users() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    password: '',
    role: 'candidate',
    company_id: '',
    is_active: true
  })

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await userAPI.getAllUsers()
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to fetch users')
      console.error('Users fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await companyAPI.getCompanies()
      setCompanies(response.data)
    } catch (error) {
      toast.error('Failed to fetch companies')
      console.error('Companies fetch error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate that recruiters must have a company assigned
    if (formData.role === 'recruiter' && !formData.company_id) {
      toast.error('Recruiters must be assigned to a company')
      return
    }
    
    try {
      if (editingUser) {
        await userAPI.updateUser(editingUser.id, formData)
        toast.success('User updated successfully!')
      } else {
        await userAPI.createUser(formData)
        toast.success('User created successfully!')
      }
      
      setShowCreateForm(false)
      setEditingUser(null)
      setFormData({
        username: '',
        email: '',
        full_name: '',
        password: '',
        role: 'candidate',
        company_id: '',
        is_active: true
      })
      fetchUsers()
    } catch (error) {
      toast.error(editingUser ? 'Failed to update user' : 'Failed to create user')
      console.error('User operation error:', error)
    }
  }

  const handleEdit = (userToEdit) => {
    setEditingUser(userToEdit)
    setFormData({
      username: userToEdit.username,
      email: userToEdit.email,
      full_name: userToEdit.full_name,
      password: '', // Don't pre-fill password
      role: userToEdit.role,
      company_id: userToEdit.company_id || '',
      is_active: userToEdit.is_active
    })
    setShowCreateForm(true)
  }

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId)
        toast.success('User deleted successfully!')
        fetchUsers()
      } catch (error) {
        toast.error('Failed to delete user')
        console.error('User deletion error:', error)
      }
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and roles</p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setShowCreateForm(!showCreateForm)
              setEditingUser(null)
              setFormData({
                username: '',
                email: '',
                full_name: '',
                password: '',
                role: 'candidate',
                company_id: '',
                is_active: true
              })
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create New User</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search users by name, email, or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {/* Create/Edit User Form */}
      {showCreateForm && (
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., john_doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'recruiter' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company *</label>
                  <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    className="input-field"
                    required={formData.role === 'recruiter'}
                  >
                    <option value="">Select a company...</option>
                    {companies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Recruiters must be assigned to a company
                  </p>
                </div>
              )}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    name="password"
                    required={!editingUser}
                    value={formData.password}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter password"
                  />
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">Active User</label>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingUser(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((userItem) => (
            <div key={userItem.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary-600 flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {userItem.full_name?.charAt(0) || userItem.username?.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{userItem.full_name}</h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userItem.role === 'admin' 
                          ? 'bg-red-100 text-red-800'
                          : userItem.role === 'recruiter'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {userItem.role}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        userItem.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {userItem.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {userItem.username}
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {userItem.email}
                      </div>
                      {userItem.company && (
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-1" />
                          {userItem.company.name}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Shield className="h-4 w-4 mr-1" />
                        Joined: {new Date(userItem.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="ml-4 flex space-x-2">
                  {user?.role === 'admin' && (
                    <>
                      <button
                        onClick={() => handleEdit(userItem)}
                        className="btn-secondary text-sm flex items-center space-x-1"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(userItem.id)}
                        className="btn-danger text-sm flex items-center space-x-1"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users available.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}






