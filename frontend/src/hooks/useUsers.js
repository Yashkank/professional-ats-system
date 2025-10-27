/**
 * React Query hooks for user data fetching
 */
import { useQuery, useMutation, useQueryClient } from '@tantml:parameter>@tanstack/react-query'
import { userAPI } from '../services/api'
import { queryKeys } from '../lib/queryClient'
import toast from 'react-hot-toast'

// ============================================================
// QUERIES
// ============================================================

/**
 * Get current user profile
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => userAPI.getProfile().then(res => res.data),
    staleTime: 10 * 60 * 1000, // 10 minutes (user data doesn't change often)
    cacheTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Get all users (admin only)
 */
export function useUsers(filters = {}) {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => userAPI.getAllUsers().then(res => res.data),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: true, // Only fetch if user is admin (add check if needed)
  })
}

/**
 * Get single user by ID
 */
export function useUser(id) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => userAPI.getUser(id).then(res => res.data),
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000,
  })
}

// ============================================================
// MUTATIONS
// ============================================================

/**
 * Update user profile
 */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }) => userAPI.updateUser(id, data).then(res => res.data),
    onSuccess: (updatedUser) => {
      // Invalidate and refetch user queries
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      queryClient.setQueryData(queryKeys.users.detail(updatedUser.id), updatedUser)
      
      toast.success('User updated successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to update user')
    },
  })
}

/**
 * Create new user
 */
export function useCreateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (userData) => userAPI.createUser(userData).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User created successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to create user')
    },
  })
}

/**
 * Delete user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id) => userAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User deleted successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Failed to delete user')
    },
  })
}

