/**
 * User Service
 * Handles user data and token operations
 */

import type { User, DeductTokensRequest, DeductTokensResponse } from '@/types/payment.types'

const API_BASE_URL = import.meta.env.VITE_PAYMENT_API_URL || 'http://localhost:3006'

/**
 * Get user data
 */
export async function getUser(userId: string, email?: string, name?: string): Promise<User> {
  const maxRetries = 3
  const retryDelay = 1000 // 1 second
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const params = new URLSearchParams()
      if (email) params.append('email', email)
      if (name) params.append('name', name)

      const url = `${API_BASE_URL}/api/users/${userId}${params.toString() ? '?' + params.toString() : ''}`
      const response = await fetch(url, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch user data')
      }

      return response.json()
      
    } catch (error: any) {
      console.warn(`👤 User service attempt ${attempt}/${maxRetries} failed:`, error.message)
      
      // If it's a connection/fetch error and we have more attempts, retry
      if ((error.name === 'TypeError' || error.name === 'AbortError') && attempt < maxRetries) {
        console.log(`🔄 Retrying user fetch in ${retryDelay}ms...`)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        continue
      }
      
      // Last attempt or non-retryable error
      if (attempt === maxRetries) {
        console.error('🚫 User service unavailable after all retries. Using offline mode.')
      }
      
      throw error
    }
  }
  
  // This should never be reached, but TypeScript requires it
  throw new Error('Maximum retries exceeded')
}

/**
 * Deduct tokens from user balance
 */
export async function deductTokens(
  userId: string,
  amount: number
): Promise<DeductTokensResponse> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}/tokens`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ deduct: amount } as DeductTokensRequest)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to deduct tokens')
  }

  return response.json()
}

