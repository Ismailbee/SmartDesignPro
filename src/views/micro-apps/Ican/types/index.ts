/**
 * ICAN Micro-App TypeScript Type Definitions
 * Centralizes all type definitions for the ICAN micro-app
 */

// Component Props Types
export interface ICANComponentProps {
  title?: string
  subtitle?: string
  showHeader?: boolean
  className?: string
}

// User and Authentication Types
export interface ICANUser {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  role: 'member' | 'admin' | 'guest'
  membershipType?: 'basic' | 'premium' | 'enterprise'
  avatar?: string
  phone?: string
  address?: ICANAddress
  preferences?: ICANUserPreferences
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
}

export interface ICANAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface ICANUserPreferences {
  theme: 'light' | 'dark' | 'auto'
  notifications: boolean
  emailUpdates: boolean
  language: string
  currency: string
  timezone: string
}

// Dashboard Types
export interface ICANDashboardStats {
  totalMembers: number
  activeInvoices: number
  pendingReceipts: number
  monthlyRevenue: number
  newMembers: number
  completedTransactions: number
}

export interface ICANActivity {
  id: string
  type: 'login' | 'invoice' | 'receipt' | 'member_join' | 'payment'
  title: string
  description: string
  timestamp: Date
  user?: ICANUser
  status?: 'pending' | 'completed' | 'failed'
  amount?: number
}

// Invoice Types
export interface ICANInvoice {
  id: string
  invoiceNumber: string
  title: string
  description: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: Date
  createdAt: Date
  updatedAt: Date
  clientInfo: ICANClientInfo
  items: ICANInvoiceItem[]
  taxes: ICANTaxInfo[]
  notes?: string
  terms?: string
}

export interface ICANInvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category?: string
}

export interface ICANClientInfo {
  name: string
  email: string
  phone?: string
  address?: ICANAddress
  company?: string
  taxId?: string
}

export interface ICANTaxInfo {
  name: string
  rate: number
  amount: number
  type: 'percentage' | 'fixed'
}

// Receipt Types
export interface ICANReceipt {
  id: string
  receiptNumber: string
  title: string
  description: string
  amount: number
  currency: string
  paymentMethod: ICANPaymentMethod
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionDate: Date
  createdAt: Date
  payerInfo: ICANPayerInfo
  items: ICANReceiptItem[]
  reference?: string
  notes?: string
}

export interface ICANPaymentMethod {
  type: 'cash' | 'card' | 'bank_transfer' | 'digital_wallet' | 'check'
  details?: {
    cardType?: 'visa' | 'mastercard' | 'amex' | 'discover'
    last4?: string
    bankName?: string
    accountNumber?: string
    checkNumber?: string
    walletProvider?: string
  }
}

export interface ICANPayerInfo {
  name: string
  email?: string
  phone?: string
  address?: ICANAddress
  memberId?: string
}

export interface ICANReceiptItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  category?: string
}

// Settings Types
export interface ICANSettings {
  profile: ICANProfileSettings
  security: ICANSecuritySettings
  notifications: ICANNotificationSettings
  preferences: ICANUserPreferences
  billing: ICANBillingSettings
}

export interface ICANProfileSettings {
  displayName: string
  email: string
  phone?: string
  avatar?: string
  bio?: string
  socialLinks?: Record<string, string>
}

export interface ICANSecuritySettings {
  twoFactorEnabled: boolean
  passwordLastChanged: Date
  trustedDevices: ICANTrustedDevice[]
  loginNotifications: boolean
  suspiciousActivityAlerts: boolean
}

export interface ICANTrustedDevice {
  id: string
  name: string
  type: 'mobile' | 'desktop' | 'tablet'
  browser: string
  os: string
  lastUsed: Date
  isActive: boolean
}

export interface ICANNotificationSettings {
  email: boolean
  push: boolean
  sms: boolean
  invoiceReminders: boolean
  paymentAlerts: boolean
  systemUpdates: boolean
  marketingEmails: boolean
}

export interface ICANBillingSettings {
  defaultCurrency: string
  taxSettings: ICANTaxSettings
  paymentMethods: ICANStoredPaymentMethod[]
  billingAddress: ICANAddress
  invoiceSettings: ICANInvoiceSettings
}

export interface ICANTaxSettings {
  taxRate: number
  taxNumber?: string
  taxExempt: boolean
  taxRegion: string
}

export interface ICANStoredPaymentMethod {
  id: string
  type: 'card' | 'bank_account'
  isDefault: boolean
  last4: string
  expiryMonth?: number
  expiryYear?: number
  cardType?: string
  bankName?: string
}

export interface ICANInvoiceSettings {
  defaultTemplate: string
  autoNumbering: boolean
  numberPrefix: string
  nextNumber: number
  defaultTerms: string
  defaultNotes: string
}

// API Response Types
export interface ICANApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  timestamp: Date
}

export interface ICANPaginatedResponse<T = any> extends ICANApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Route Types
export interface ICANRouteParams {
  id?: string
  action?: string
  tab?: string
}

// State Management Types
export interface ICANStoreState {
  user: ICANUser | null
  isAuthenticated: boolean
  isLoading: boolean
  settings: ICANSettings | null
  dashboardStats: ICANDashboardStats | null
  recentActivities: ICANActivity[]
  invoices: ICANInvoice[]
  receipts: ICANReceipt[]
}

// Event Types
export interface ICANEventPayload {
  type: string
  data: any
  timestamp: Date
  source: 'user' | 'system' | 'api'
}

// Utility Types
export type ICANDateRange = {
  start: Date
  end: Date
}

export type ICANSortOrder = 'asc' | 'desc'

export interface ICANFilterOptions {
  status?: string[]
  dateRange?: ICANDateRange
  amount?: {
    min?: number
    max?: number
  }
  searchTerm?: string
  sortBy?: string
  sortOrder?: ICANSortOrder
}

// Form Types
export interface ICANFormError {
  field: string
  message: string
  code?: string
}

export interface ICANFormState {
  values: Record<string, any>
  errors: ICANFormError[]
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
}