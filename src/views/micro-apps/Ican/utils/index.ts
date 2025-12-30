/**
 * ICAN Micro-App Utility Functions
 * Common utility functions for the ICAN micro-app
 */

// Date utilities
export const formatDate = (date: Date | string, format: 'short' | 'long' | 'iso' = 'short'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  switch (format) {
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    case 'iso':
      return dateObj.toISOString()
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: '2-digit',
        month: 'short',
        day: 'numeric'
      })
  }
}

export const getRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - dateObj.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return formatDate(dateObj)
}

export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  const dateTime = date.getTime()
  return dateTime >= start.getTime() && dateTime <= end.getTime()
}

// Currency utilities
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export const parseCurrency = (currencyString: string): number => {
  const cleanString = currencyString.replace(/[^0-9.-]/g, '')
  return parseFloat(cleanString) || 0
}

// Number utilities
export const formatNumber = (num: number, decimals: number = 0): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export const formatPercentage = (num: number, decimals: number = 1): string => {
  return `${(num * 100).toFixed(decimals)}%`
}

// String utilities
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength - 3) + '...'
}

export const capitalizeFirst = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export const camelCaseToTitle = (str: string): string => {
  return str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
}

export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substr(2, 9)
  return `${prefix}${timestamp}${random}`
}

// Validation utilities
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  const cleanPhone = phone.replace(/[^\d\+]/g, '')
  return phoneRegex.test(cleanPhone)
}

export const isValidPassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Array utilities
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return array.reduce((groups, item) => {
    const group = String(item[key])
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export const sortBy = <T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1
    if (aValue > bValue) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const filterBy = <T>(array: T[], filters: Partial<Record<keyof T, any>>): T[] => {
  return array.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true
      return item[key as keyof T] === value
    })
  })
}

export const unique = <T>(array: T[], key?: keyof T): T[] => {
  if (!key) return [...new Set(array)]
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

// Object utilities
export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj))
}

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const isEmpty = (value: any): boolean => {
  if (value == null) return true
  if (typeof value === 'string') return value.trim().length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase()
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp']
  return imageExtensions.includes(getFileExtension(filename))
}

export const isDocumentFile = (filename: string): boolean => {
  const docExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  return docExtensions.includes(getFileExtension(filename))
}

// Storage utilities
export const setLocalStorage = (key: string, value: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

export const getLocalStorage = <T>(key: string, defaultValue?: T): T | null => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue ?? null
  } catch (error) {
    console.error('Failed to read from localStorage:', error)
    return defaultValue ?? null
  }
}

export const removeLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Failed to remove from localStorage:', error)
  }
}

// Error handling utilities
export const handleAsyncError = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<{ data?: R; error?: Error }> => {
    try {
      const data = await fn(...args)
      return { data }
    } catch (error) {
      console.error('Async operation failed:', error)
      return { error: error as Error }
    }
  }
}

export const retry = async <T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay))
      return retry(fn, retries - 1, delay * 2) // Exponential backoff
    }
    throw error
  }
}

// URL utilities
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

export const parseQueryString = (queryString: string): Record<string, string> => {
  const params = new URLSearchParams(queryString.startsWith('?') ? queryString.slice(1) : queryString)
  const result: Record<string, string> = {}
  
  params.forEach((value, key) => {
    result[key] = value
  })
  
  return result
}

// Color utilities
export const generateAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FFB347', '#87CEEB', '#F0E68C', '#FF69B4'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export const hexToRgba = (hex: string, alpha: number = 1): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return hex
  
  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// Export all utilities as default object for easier importing
export default {
  // Date utilities
  formatDate,
  getRelativeTime,
  isDateInRange,
  
  // Currency utilities
  formatCurrency,
  parseCurrency,
  
  // Number utilities
  formatNumber,
  formatPercentage,
  
  // String utilities
  truncateText,
  capitalizeFirst,
  camelCaseToTitle,
  generateId,
  
  // Validation utilities
  isValidEmail,
  isValidPhone,
  isValidPassword,
  isValidUrl,
  
  // Array utilities
  groupBy,
  sortBy,
  filterBy,
  unique,
  
  // Object utilities
  deepClone,
  omit,
  pick,
  isEmpty,
  
  // File utilities
  formatFileSize,
  getFileExtension,
  isImageFile,
  isDocumentFile,
  
  // Storage utilities
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,
  
  // Error handling utilities
  handleAsyncError,
  retry,
  
  // URL utilities
  buildQueryString,
  parseQueryString,
  
  // Color utilities
  generateAvatarColor,
  hexToRgba
}