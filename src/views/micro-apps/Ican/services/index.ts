/**
 * ICAN Micro-App Services Export Index
 * Centralizes service exports for clean imports
 */

// Import from main SmartDesignPro Firebase service
export * from '@/services/ican-firebase.service'
export * from './ican-sso.service'

// Service types
export type { ICANFirebaseService } from '../types/service.types'