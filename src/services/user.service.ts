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
  const params = new URLSearchParams()
  if (email) params.append('email', email)
  if (name) params.append('name', name)

  const url = `${API_BASE_URL}/api/users/${userId}${params.toString() ? '?' + params.toString() : ''}`
  const response = await fetch(url)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch user data')
  }

  return response.json()
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

