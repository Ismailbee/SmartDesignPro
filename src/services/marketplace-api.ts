/**
 * Template Marketplace API Service
 */

import type {
  Template,
  TemplateFilters,
  TemplateSearchResponse,
  TemplateUploadData,
  UserTemplateLibrary
} from '@/types/marketplace'

const API_BASE_URL = import.meta.env.VITE_MARKETPLACE_API_URL || 'http://localhost:3004/api'

/**
 * Fetch templates with filters
 */
export async function fetchTemplates(filters: TemplateFilters = {}): Promise<TemplateSearchResponse> {
  const params = new URLSearchParams()
  
  if (filters.category) params.append('category', filters.category)
  if (filters.accessLevel) params.append('accessLevel', filters.accessLevel)
  if (filters.sortBy) params.append('sortBy', filters.sortBy)
  if (filters.search) params.append('search', filters.search)
  if (filters.tags) filters.tags.forEach(tag => params.append('tags', tag))
  if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString())
  if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString())
  if (filters.isPremium !== undefined) params.append('isPremium', filters.isPremium.toString())
  if (filters.isFeatured !== undefined) params.append('isFeatured', filters.isFeatured.toString())

  const response = await fetch(`${API_BASE_URL}/templates?${params}`)
  if (!response.ok) throw new Error('Failed to fetch templates')
  
  return response.json()
}

/**
 * Fetch single template by ID
 */
export async function fetchTemplate(id: string): Promise<{ template: Template }> {
  const response = await fetch(`${API_BASE_URL}/templates/${id}`)
  if (!response.ok) throw new Error('Failed to fetch template')
  
  return response.json()
}

/**
 * Upload new template
 */
export async function uploadTemplate(data: TemplateUploadData, userId: string, userName: string): Promise<{ message: string; template: Template }> {
  const formData = new FormData()
  
  formData.append('title', data.title)
  formData.append('description', data.description)
  formData.append('category', data.category)
  formData.append('tags', JSON.stringify(data.tags))
  formData.append('accessLevel', data.accessLevel)
  formData.append('price', data.price.toString())
  formData.append('width', data.width.toString())
  formData.append('height', data.height.toString())
  formData.append('userId', userId)
  formData.append('userName', userName)
  formData.append('file', data.file)
  
  if (data.thumbnail) {
    formData.append('thumbnail', data.thumbnail)
  }

  const response = await fetch(`${API_BASE_URL}/templates/upload`, {
    method: 'POST',
    body: formData
  })
  
  if (!response.ok) throw new Error('Failed to upload template')
  
  return response.json()
}

/**
 * Update template
 */
export async function updateTemplate(
  id: string,
  updates: Partial<Template>
): Promise<{ message: string; template: Template }> {
  const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  })
  
  if (!response.ok) throw new Error('Failed to update template')
  
  return response.json()
}

/**
 * Delete template
 */
export async function deleteTemplate(id: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
    method: 'DELETE'
  })
  
  if (!response.ok) throw new Error('Failed to delete template')
  
  return response.json()
}

/**
 * Like/unlike template
 */
export async function toggleLikeTemplate(templateId: string, userId: string): Promise<{ message: string; liked: boolean }> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  
  if (!response.ok) throw new Error('Failed to like template')
  
  return response.json()
}

/**
 * Purchase template
 */
export async function purchaseTemplate(templateId: string, userId: string): Promise<{ message: string; purchaseId: string }> {
  const response = await fetch(`${API_BASE_URL}/templates/${templateId}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to purchase template')
  }
  
  return response.json()
}

/**
 * Get user's template library
 */
export async function getUserLibrary(userId: string): Promise<UserTemplateLibrary> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/library`)
  if (!response.ok) throw new Error('Failed to fetch library')
  
  return response.json()
}

/**
 * Save template to library
 */
export async function saveTemplateToLibrary(userId: string, templateId: string): Promise<{ message: string }> {
  const response = await fetch(`${API_BASE_URL}/user/${userId}/library/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ templateId })
  })
  
  if (!response.ok) throw new Error('Failed to save template')
  
  return response.json()
}

/**
 * Check server health
 */
export async function checkHealth(): Promise<{ status: string; service: string; timestamp: string }> {
  const response = await fetch('http://localhost:3004/health')
  return response.json()
}

