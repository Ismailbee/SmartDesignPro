/**
 * ICAN Micro-App State Management Store
 * Centralized state management using Pinia
 */

import { defineStore } from 'pinia'
import type { 
  ICANUser, 
  ICANSettings, 
  ICANDashboardStats, 
  ICANActivity,
  ICANInvoice,
  ICANReceipt,
  ICANStoreState 
} from '../types'

export const useICANStore = defineStore('ican', {
  state: (): ICANStoreState => ({
    // User Authentication
    user: null,
    isAuthenticated: false,
    isLoading: false,
    
    // User Settings
    settings: null,
    
    // Dashboard Data
    dashboardStats: null,
    recentActivities: [],
    
    // Business Data
    invoices: [],
    receipts: [],
  }),

  getters: {
    // Authentication getters
    isLoggedIn: (state): boolean => state.isAuthenticated && !!state.user,
    userName: (state): string => state.user?.fullName || 'Guest',
    userRole: (state): string => state.user?.role || 'guest',
    userAvatar: (state): string | undefined => state.user?.avatar,
    
    // Dashboard getters
    totalMembers: (state): number => state.dashboardStats?.totalMembers || 0,
    activeInvoices: (state): number => state.dashboardStats?.activeInvoices || 0,
    pendingReceipts: (state): number => state.dashboardStats?.pendingReceipts || 0,
    monthlyRevenue: (state): number => state.dashboardStats?.monthlyRevenue || 0,
    
    // Business data getters
    totalInvoices: (state): number => state.invoices.length,
    totalReceipts: (state): number => state.receipts.length,
    pendingInvoices: (state): ICANInvoice[] => 
      state.invoices.filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue'),
    paidInvoices: (state): ICANInvoice[] => 
      state.invoices.filter(invoice => invoice.status === 'paid'),
    completedReceipts: (state): ICANReceipt[] => 
      state.receipts.filter(receipt => receipt.status === 'completed'),
    
    // Analytics getters
    recentInvoices: (state): ICANInvoice[] => 
      state.invoices
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    recentReceipts: (state): ICANReceipt[] => 
      state.receipts
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    thisMonthActivities: (state): ICANActivity[] => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return state.recentActivities.filter(activity => 
        new Date(activity.timestamp) >= startOfMonth
      )
    },
  },

  actions: {
    // Authentication actions
    async login(email: string, password: string) {
      this.isLoading = true
      try {
        // Simulate API call - replace with actual Firebase auth
        const mockUser: ICANUser = {
          id: 'user-' + Date.now(),
          email,
          firstName: 'John',
          lastName: 'Doe',
          fullName: 'John Doe',
          role: 'member',
          membershipType: 'premium',
          avatar: '/api/placeholder/100/100',
          phone: '+1 (555) 123-4567',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date(),
          lastLoginAt: new Date(),
          preferences: {
            theme: 'light',
            notifications: true,
            emailUpdates: true,
            language: 'en',
            currency: 'USD',
            timezone: 'America/New_York'
          }
        }
        
        this.user = mockUser
        this.isAuthenticated = true
        
        // Load user data
        await this.loadUserSettings()
        await this.loadDashboardData()
        
        console.log('✅ User logged in successfully:', email)
        return { success: true, user: mockUser }
      } catch (error) {
        console.error('❌ Login failed:', error)
        return { success: false, error: 'Invalid credentials' }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      this.isLoading = true
      try {
        // Clear user data
        this.user = null
        this.isAuthenticated = false
        this.settings = null
        this.dashboardStats = null
        this.recentActivities = []
        this.invoices = []
        this.receipts = []
        
        console.log('✅ User logged out successfully')
        return { success: true }
      } catch (error) {
        console.error('❌ Logout failed:', error)
        return { success: false, error: 'Logout failed' }
      } finally {
        this.isLoading = false
      }
    },

    // Settings actions
    async loadUserSettings() {
      if (!this.user) return
      
      try {
        // Simulate API call - replace with actual Firebase call
        const mockSettings: ICANSettings = {
          profile: {
            displayName: this.user.fullName,
            email: this.user.email,
            phone: this.user.phone,
            avatar: this.user.avatar,
            bio: 'ICAN member since 2024'
          },
          security: {
            twoFactorEnabled: false,
            passwordLastChanged: new Date('2024-01-15'),
            trustedDevices: [],
            loginNotifications: true,
            suspiciousActivityAlerts: true
          },
          notifications: {
            email: true,
            push: true,
            sms: false,
            invoiceReminders: true,
            paymentAlerts: true,
            systemUpdates: true,
            marketingEmails: false
          },
          preferences: this.user.preferences!,
          billing: {
            defaultCurrency: 'USD',
            taxSettings: {
              taxRate: 8.5,
              taxExempt: false,
              taxRegion: 'NY'
            },
            paymentMethods: [],
            billingAddress: {
              street: '123 Main St',
              city: 'New York',
              state: 'NY',
              zipCode: '10001',
              country: 'USA'
            },
            invoiceSettings: {
              defaultTemplate: 'standard',
              autoNumbering: true,
              numberPrefix: 'INV-',
              nextNumber: 1001,
              defaultTerms: 'Net 30 days',
              defaultNotes: 'Thank you for your business!'
            }
          }
        }
        
        this.settings = mockSettings
        console.log('✅ User settings loaded')
      } catch (error) {
        console.error('❌ Failed to load user settings:', error)
      }
    },

    async updateSettings(newSettings: Partial<ICANSettings>) {
      if (!this.settings) return
      
      try {
        // Simulate API call - replace with actual Firebase call
        this.settings = { ...this.settings, ...newSettings }
        console.log('✅ Settings updated successfully')
        return { success: true }
      } catch (error) {
        console.error('❌ Failed to update settings:', error)
        return { success: false, error: 'Update failed' }
      }
    },

    // Dashboard actions
    async loadDashboardData() {
      try {
        // Simulate API calls - replace with actual Firebase calls
        const mockStats: ICANDashboardStats = {
          totalMembers: 1247,
          activeInvoices: 23,
          pendingReceipts: 8,
          monthlyRevenue: 45680,
          newMembers: 12,
          completedTransactions: 156
        }
        
        const mockActivities: ICANActivity[] = [
          {
            id: '1',
            type: 'invoice',
            title: 'New invoice created',
            description: 'Invoice #INV-1001 for $1,250.00',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            status: 'completed'
          },
          {
            id: '2',
            type: 'member_join',
            title: 'New member joined',
            description: 'Sarah Johnson joined as Premium member',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            status: 'completed'
          },
          {
            id: '3',
            type: 'payment',
            title: 'Payment received',
            description: 'Payment for Invoice #INV-1000',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            status: 'completed',
            amount: 850
          }
        ]
        
        this.dashboardStats = mockStats
        this.recentActivities = mockActivities
        
        console.log('✅ Dashboard data loaded')
      } catch (error) {
        console.error('❌ Failed to load dashboard data:', error)
      }
    },

    // Invoice actions
    async loadInvoices() {
      try {
        // Simulate API call - replace with actual Firebase call
        const mockInvoices: ICANInvoice[] = [
          {
            id: '1',
            invoiceNumber: 'INV-1001',
            title: 'Consulting Services',
            description: 'Monthly consulting services',
            amount: 1250.00,
            currency: 'USD',
            status: 'sent',
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            updatedAt: new Date(),
            clientInfo: {
              name: 'Acme Corporation',
              email: 'billing@acme.com',
              company: 'Acme Corp'
            },
            items: [
              {
                id: '1',
                description: 'Consulting Hours',
                quantity: 25,
                unitPrice: 50,
                total: 1250
              }
            ],
            taxes: []
          }
        ]
        
        this.invoices = mockInvoices
        console.log('✅ Invoices loaded')
      } catch (error) {
        console.error('❌ Failed to load invoices:', error)
      }
    },

    async createInvoice(invoiceData: Partial<ICANInvoice>) {
      try {
        // Simulate API call - replace with actual Firebase call
        const newInvoice: ICANInvoice = {
          id: Date.now().toString(),
          invoiceNumber: `INV-${Date.now()}`,
          title: invoiceData.title || 'New Invoice',
          description: invoiceData.description || '',
          amount: invoiceData.amount || 0,
          currency: invoiceData.currency || 'USD',
          status: 'draft',
          dueDate: invoiceData.dueDate || new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
          createdAt: new Date(),
          updatedAt: new Date(),
          clientInfo: invoiceData.clientInfo || { name: '', email: '' },
          items: invoiceData.items || [],
          taxes: invoiceData.taxes || []
        }
        
        this.invoices.push(newInvoice)
        console.log('✅ Invoice created:', newInvoice.invoiceNumber)
        return { success: true, invoice: newInvoice }
      } catch (error) {
        console.error('❌ Failed to create invoice:', error)
        return { success: false, error: 'Failed to create invoice' }
      }
    },

    // Receipt actions
    async loadReceipts() {
      try {
        // Simulate API call - replace with actual Firebase call
        const mockReceipts: ICANReceipt[] = [
          {
            id: '1',
            receiptNumber: 'REC-1001',
            title: 'Service Payment',
            description: 'Payment for consulting services',
            amount: 850.00,
            currency: 'USD',
            paymentMethod: {
              type: 'card',
              details: {
                cardType: 'visa',
                last4: '4242'
              }
            },
            status: 'completed',
            transactionDate: new Date(),
            createdAt: new Date(),
            payerInfo: {
              name: 'John Smith',
              email: 'john.smith@email.com'
            },
            items: [
              {
                id: '1',
                description: 'Consulting Payment',
                quantity: 1,
                unitPrice: 850,
                total: 850
              }
            ]
          }
        ]
        
        this.receipts = mockReceipts
        console.log('✅ Receipts loaded')
      } catch (error) {
        console.error('❌ Failed to load receipts:', error)
      }
    },

    async createReceipt(receiptData: Partial<ICANReceipt>) {
      try {
        // Simulate API call - replace with actual Firebase call
        const newReceipt: ICANReceipt = {
          id: Date.now().toString(),
          receiptNumber: `REC-${Date.now()}`,
          title: receiptData.title || 'New Receipt',
          description: receiptData.description || '',
          amount: receiptData.amount || 0,
          currency: receiptData.currency || 'USD',
          paymentMethod: receiptData.paymentMethod || { type: 'cash' },
          status: 'pending',
          transactionDate: new Date(),
          createdAt: new Date(),
          payerInfo: receiptData.payerInfo || { name: '', email: '' },
          items: receiptData.items || []
        }
        
        this.receipts.push(newReceipt)
        console.log('✅ Receipt created:', newReceipt.receiptNumber)
        return { success: true, receipt: newReceipt }
      } catch (error) {
        console.error('❌ Failed to create receipt:', error)
        return { success: false, error: 'Failed to create receipt' }
      }
    },

    // Activity actions
    addActivity(activity: Partial<ICANActivity>) {
      const newActivity: ICANActivity = {
        id: Date.now().toString(),
        type: activity.type || 'login',
        title: activity.title || 'Activity',
        description: activity.description || '',
        timestamp: new Date(),
        status: activity.status || 'completed'
      }
      
      this.recentActivities.unshift(newActivity)
      
      // Keep only last 50 activities
      if (this.recentActivities.length > 50) {
        this.recentActivities = this.recentActivities.slice(0, 50)
      }
    },

    // Utility actions
    setLoading(loading: boolean) {
      this.isLoading = loading
    },

    async refreshData() {
      this.isLoading = true
      try {
        await Promise.all([
          this.loadDashboardData(),
          this.loadInvoices(),
          this.loadReceipts()
        ])
        console.log('✅ All data refreshed')
      } catch (error) {
        console.error('❌ Failed to refresh data:', error)
      } finally {
        this.isLoading = false
      }
    }
  },

  persist: {
    key: 'ican-store',
    storage: localStorage,
    paths: ['user', 'isAuthenticated', 'settings'] // Only persist essential data
  }
})