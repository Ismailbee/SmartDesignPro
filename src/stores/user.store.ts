/**
 * User Store
 * Manages user state, tokens, and plan information
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, PlanType } from '@/types/payment.types'
import { getUser, deductTokens } from '@/services/user.service'

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const hasTokens = computed(() => {
    return user.value ? user.value.tokens > 0 : false
  })

  const isPremium = computed(() => {
    return user.value?.plan === 'Premium'
  })

  const isPro = computed(() => {
    return user.value?.plan === 'Pro'
  })

  const daysUntilExpiry = computed(() => {
    if (!user.value?.planExpiryDate) return null
    
    const expiryDate = new Date(user.value.planExpiryDate)
    const now = new Date()
    const diffTime = expiryDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  })

  const planExpired = computed(() => {
    if (!user.value?.planExpiryDate) return false
    
    const expiryDate = new Date(user.value.planExpiryDate)
    const now = new Date()
    
    return now > expiryDate
  })

  // Actions
  async function fetchUser(userId: string, email?: string, name?: string) {
    loading.value = true
    error.value = null

    try {
      user.value = await getUser(userId, email, name)
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch user data'
      console.error('Fetch user error:', err)
    } finally {
      loading.value = false
    }
  }

  function updateTokens(amount: number) {
    if (user.value) {
      user.value.tokens += amount
    }
  }

  async function deductUserTokens(userId: string, amount: number) {
    if (!user.value) {
      throw new Error('User not loaded')
    }

    if (user.value.tokens < amount) {
      throw new Error('Insufficient tokens')
    }

    try {
      const response = await deductTokens(userId, amount)
      
      // Update local state
      user.value.tokens = response.tokens
      user.value.totalDesignsGenerated = response.totalDesignsGenerated
      
      return response
    } catch (err: any) {
      error.value = err.message || 'Failed to deduct tokens'
      throw err
    }
  }

  function upgradePlan(plan: PlanType, expiryDate: string, freeTokens: number) {
    if (user.value) {
      user.value.plan = plan
      user.value.planExpiryDate = expiryDate
      user.value.tokens += freeTokens
    }
  }

  function resetUser() {
    user.value = null
    error.value = null
  }

  return {
    // State
    user,
    loading,
    error,

    // Getters
    hasTokens,
    isPremium,
    isPro,
    daysUntilExpiry,
    planExpired,

    // Actions
    fetchUser,
    updateTokens,
    deductUserTokens,
    upgradePlan,
    resetUser
  }
})

