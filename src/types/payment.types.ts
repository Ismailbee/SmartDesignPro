/**
 * Payment and Token Management Types
 */

export type PlanType = 'Basic' | 'Premium' | 'Pro'

export type PaymentType = 'token_purchase' | 'plan_upgrade'

export type PaymentStatus = 'pending' | 'success' | 'failed'

export interface User {
  id: string
  name: string
  email: string
  plan: PlanType
  planExpiryDate: string | null
  tokens: number
  totalDesignsGenerated: number
}

export interface Payment {
  id: string
  amount: number
  type: PaymentType
  tokens: number | null
  plan: PlanType | null
  status: PaymentStatus
  reference: string
  createdAt: string
  verifiedAt: string | null
}

export interface PaymentHistory {
  payments: Payment[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface TokenPackage {
  amount: number
  tokens: number
  isBestValue?: boolean
}

export interface PlanConfig {
  name: PlanType
  icon: string
  price: number
  duration: string
  planId: string
  freeTokens: number
  features: string[]
  badge?: string
}

export interface PaymentConfig {
  email: string
  amount: number
  reference: string
  metadata: {
    userId: string
    type: PaymentType
    tokens?: number
    plan?: PlanType
    planId?: string
  }
  onSuccess: (response: any) => void
  onCancel: () => void
}

export interface InitializePaymentRequest {
  userId: string
  email: string
  amount: number
  type: PaymentType
  tokens?: number
  plan?: PlanType
  planId?: string
  name?: string
}

export interface InitializePaymentResponse {
  authorizationUrl: string
  reference: string
  accessCode: string
}

export interface VerifyPaymentResponse {
  status: PaymentStatus
  amount: number
  type: PaymentType
  tokens?: number
  plan?: PlanType
  verifiedAt?: string
}

export interface DeductTokensRequest {
  deduct: number
}

export interface DeductTokensResponse {
  tokens: number
  totalDesignsGenerated: number
}

// Token packages configuration
export const TOKEN_PACKAGES: TokenPackage[] = [
  { amount: 100, tokens: 100 },
  { amount: 200, tokens: 200 },
  { amount: 300, tokens: 300 },
  { amount: 500, tokens: 500 },
  { amount: 1000, tokens: 1000 },
  { amount: 1200, tokens: 1200, isBestValue: true }
]

// Plan configurations
export const PLAN_CONFIGS: PlanConfig[] = [
  {
    name: 'Basic',
    icon: '🆓',
    price: 0,
    duration: 'Forever',
    planId: '',
    freeTokens: 0,
    features: [
      '✓ Pay-per-design model',
      '✓ No monthly commitment',
      '✗ No free tokens',
      '✗ Standard support'
    ]
  },
  {
    name: 'Premium',
    icon: '⭐',
    price: 2500,
    duration: '2 months',
    planId: 'PLN_5x6n9kfpr8z34lu',
    freeTokens: 1000,
    features: [
      '✓ 1,000 free tokens on signup',
      '✓ Priority email support',
      '✓ Early access to new features',
      '✓ No ads'
    ],
    badge: 'Most Popular'
  },
  {
    name: 'Pro',
    icon: '💎',
    price: 5000,
    duration: '2 months',
    planId: 'PLN_31ofmv6h9jplglk',
    freeTokens: 1500,
    features: [
      '✓ 1,500 free tokens on signup',
      '✓ Unlimited designs',
      '✓ Priority 24/7 support',
      '✓ Advanced AI features',
      '✓ Custom branding options'
    ],
    badge: 'Best Value'
  }
]

