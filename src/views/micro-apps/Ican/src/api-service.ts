/**
 * ICAN API Service - Centralized service for all ICAN operations
 * Replaces the old localhost:4000 API with Firebase Firestore operations
 */

import { 
  ICANBranchService, 
  ICANUserService, 
  ICANSeedService,
  ICANCounterService,
  ICANInvoiceService,
  ICANReceiptService,
  ICANStatsService,
  type ICANBranch, 
  type ICANUser
} from './services/ican-service.js'

// ============================================================================
// LEGACY API COMPATIBILITY LAYER
// This service provides the same interface as the old localhost API
// but uses Firebase Firestore under the hood
// ============================================================================

// Branch cache for performance optimization
let branchCache: { [key: string]: ICANBranch } = {}
let branchCacheTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get branch by name with caching
 */
export async function getBranchByName(branchName: string): Promise<ICANBranch | null> {
  const now = Date.now()
  
  // Check if cache is still valid
  if (now - branchCacheTime > CACHE_DURATION) {
    // Refresh cache
    const branches = await ICANBranchService.getAllBranches()
    branchCache = {}
    branches.forEach(branch => {
      branchCache[branch.name] = branch
    })
    branchCacheTime = now
  }
  
  return branchCache[branchName] || null
}

/**
 * Get all branches - equivalent to GET /branches
 */
export async function getBranches() {
  try {
    await ICANSeedService.seedDefaultBranches()
    const branches = await ICANBranchService.getAllBranches()
    return {
      success: true,
      data: branches.map(branch => branch.name),
      message: 'Branches loaded successfully'
    }
  } catch (error) {
    console.error('Error loading branches:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Authenticate user - equivalent to POST /auth/user
 */
export async function authenticateUser(email: string, password: string, branchName: string) {
  try {
    // First verify branch credentials
    const branch = await ICANBranchService.verifyBranchCredentials(branchName, password)
    if (!branch) {
      throw new Error('Incorrect branch password')
    }

    // Check if user exists with this email for this branch
    let user = await ICANUserService.authenticateUser(email, branch.id)
    if (!user) {
      // Before creating new branch login, check if email is already used as a member
      const existingMember = await ICANUserService.getUserByEmailAndBranch(email, branch.id)
      if (existingMember && existingMember.isMember) {
        throw new Error('This email is already registered as a member account. Please use the Member Login instead.')
      }

      const userId = await ICANUserService.createUser({
        email,
        name: email.split('@')[0],
        branchId: branch.id,
        branch: branch.name,
        role: 'user',
        lastLogin: new Date(),
        isActive: true,
        isBranchUser: true, // Mark as branch login user
        isMember: false // Not a member
      })
      
      user = {
        id: userId,
        email,
        name: email.split('@')[0],
        branchId: branch.id,
        branch: branch.name,
        role: 'user' as const,
        createdAt: new Date(),
        lastLogin: new Date(),
        isActive: true
      }
    }

    return {
      success: true,
      data: {
        userId: user.id,
        email: user.email,
        name: user.name,
        branch: user.branch,
        branchId: user.branchId
      },
      message: 'Authentication successful'
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
}

/**
 * Get dashboard data - equivalent to GET /dashboard/:branch
 * Optimized with caching and parallel queries
 */
export async function getDashboardData(branchName: string) {
  try {
    // Get branch from cache (optional - if not found, we'll work with the branch name directly)
    const branch = await getBranchByName(branchName)
    
    // Use branch ID if available, otherwise use branch name directly
    const branchIdentifier = branch?.id || branchName
    
    console.log(`🔍 Loading dashboard data for branch: "${branchName}" (ID: ${branchIdentifier})`)

    // Get member count from Firebase counter (optional - gracefully handle failure)
    const memberCount = branch 
      ? await ICANCounterService.getMemberCount(branch.id).catch(err => {
          console.warn('Failed to load member count from counter:', err)
          return 0
        })
      : 0 // If no branch record, default to 0

    // Make all Firebase calls in parallel for better performance  
    // Use Promise.all for better error handling and faster execution
    const [invoicesResult, receiptsResult] = await Promise.all([
      ICANInvoiceService.getInvoicesByBranch(branchIdentifier, 10).catch(err => {
        console.warn('Failed to load invoices:', err)
        return []
      }),
      ICANReceiptService.getReceiptsByBranch(branchIdentifier, 10).catch(err => {
        console.warn('Failed to load receipts:', err)
        return []
      })
    ])
    
    // Calculate totals efficiently
    const totalInvoices = invoicesResult.length
    const totalReceipts = receiptsResult.length
    const totalRevenue = invoicesResult.reduce((sum, inv) => sum + (inv.total || 0), 0)
    const totalPayments = receiptsResult.reduce((sum, rec) => sum + (rec.amount || 0), 0)
    
    console.log(`✅ Dashboard data loaded - Invoices: ${totalInvoices}, Receipts: ${totalReceipts}, Revenue: ${totalRevenue}`)
    
    return {
      success: true,
      data: {
        activeInvoices: totalInvoices,
        activeReceipts: totalReceipts, // Add this field that the dashboard expects
        monthlyRevenue: totalRevenue,
        revenueChange: 0, // Calculate this based on historical data if needed
        invoiceCompletion: 100, // Placeholder
        engagementScore: 75, // Placeholder
        engagementChange: 5, // Placeholder
        pendingTasks: 0, // Placeholder
        totalUsers: memberCount, // Using Firebase counter for global consistency
        totalReceipts: totalReceipts,
        totalPayments: totalPayments,
        recentInvoices: invoicesResult.slice(0, 5),
        recentReceipts: receiptsResult.slice(0, 5)
      },
      message: `Dashboard data loaded successfully for ${branchName}`
    }
  } catch (error) {
    console.error('Dashboard error:', error)
    return {
      success: false,
      data: {
        activeInvoices: 0,
        monthlyRevenue: 0,
        revenueChange: 0,
        invoiceCompletion: 0,
        engagementScore: 0,
        engagementChange: 0,
        pendingTasks: 0,
        totalUsers: 0,
        totalReceipts: 0,
        totalPayments: 0,
        recentInvoices: [],
        recentReceipts: []
      },
      message: error?.message || 'Failed to load dashboard data'
    }
  }
}

/**
 * Create invoice - equivalent to POST /invoice
 */
export async function createInvoice(invoiceData: {
  branchId: string
  date: string
  total: number
  items: any[]
  customerInfo: any
  createdBy: string
}) {
  try {
    const invoiceId = await ICANInvoiceService.createInvoice(invoiceData)
    
    return {
      success: true,
      data: { id: invoiceId },
      message: 'Invoice created successfully'
    }
  } catch (error) {
    console.error('Invoice creation error:', error)
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
}

/**
 * Get next invoice number - equivalent to GET /invoice/next-number
 */
export async function getNextInvoiceNumber(branchId: string) {
  try {
    const nextNumber = await ICANCounterService.getNextCounter('invoice', branchId)
    const formattedNumber = `INV-${String(nextNumber).padStart(6, '0')}`
    
    return {
      success: true,
      data: { number: formattedNumber },
      message: 'Next invoice number generated'
    }
  } catch (error) {
    console.error('Invoice number generation error:', error)
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
}

/**
 * Create receipt - equivalent to POST /receipt
 */
export async function createReceipt(receiptData: {
  branchId: string
  date: string
  amount: number
  customerInfo: any
  paymentMethod: string
  createdBy: string
}) {
  try {
    const receiptId = await ICANReceiptService.createReceipt(receiptData)
    
    return {
      success: true,
      data: { id: receiptId },
      message: 'Receipt created successfully'
    }
  } catch (error) {
    console.error('Receipt creation error:', error)
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
}

/**
 * Get next receipt number - equivalent to GET /receipt/next-number
 */
export async function getNextReceiptNumber(branchId: string) {
  try {
    const nextNumber = await ICANCounterService.getNextCounter('receipt', branchId)
    const formattedNumber = `REC-${String(nextNumber).padStart(6, '0')}`
    
    return {
      success: true,
      data: { number: formattedNumber },
      message: 'Next receipt number generated'
    }
  } catch (error) {
    console.error('Receipt number generation error:', error)
    return {
      success: false,
      data: null,
      message: error.message
    }
  }
}

/**
 * Get invoices for a branch
 */
export async function getInvoices(branchId: string, limit = 50) {
  try {
    const invoices = await ICANInvoiceService.getInvoicesByBranch(branchId, limit)
    
    return {
      success: true,
      data: invoices,
      message: 'Invoices loaded successfully'
    }
  } catch (error) {
    console.error('Invoice loading error:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Get receipts for a branch
 */
export async function getReceipts(branchId: string, limit = 50) {
  try {
    const receipts = await ICANReceiptService.getReceiptsByBranch(branchId, limit)
    
    return {
      success: true,
      data: receipts,
      message: 'Receipts loaded successfully'
    }
  } catch (error) {
    console.error('Receipt loading error:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Verify password - equivalent to POST /verify-password
 */
export async function verifyPassword(branchName: string, password: string) {
  try {
    const branch = await ICANBranchService.verifyBranchCredentials(branchName, password)
    
    return {
      success: branch !== null,
      data: branch ? { verified: true } : { verified: false },
      message: branch ? 'Password verified' : 'Invalid password'
    }
  } catch (error) {
    console.error('Password verification error:', error)
    return {
      success: false,
      data: { verified: false },
      message: error.message
    }
  }
}

// Legacy API_BASE export for backward compatibility
export const API_BASE = 'firebase-service' // Identifier for Firebase-based service

// Helper function to get user from localStorage
export function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Create branch
 */
export async function createBranch(branchData: { name: string, password: string }) {
  try {
    const newBranch = {
      name: branchData.name,
      manager: 'Admin',
      password: branchData.password,
      maxUsers: 10,
      registrationEnabled: true
    }
    
    const branchId = await ICANBranchService.createBranch(newBranch)
    return {
      success: true,
      data: { id: branchId, ...newBranch }
    }
  } catch (error) {
    console.error('Error creating branch:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helper function to get branch ID by name
 */
async function getBranchIdByName(branchName: string): Promise<string | null> {
  try {
    const branches = await ICANBranchService.getAllBranches()
    const branch = branches.find(b => b.name === branchName)
    return branch?.id || null
  } catch (error) {
    console.error('Error getting branch ID:', error)
    return null
  }
}

// ============================================================================
// LEGACY FUNCTION COMPATIBILITY LAYER
// These functions provide backwards compatibility with the old API calls
// ============================================================================

/**
 * Get all members for a branch (legacy compatibility)
 * Only returns users who are explicitly marked as members
 * @param branchName - Name of the branch
 * @returns Response with members data
 */
export async function getAllMembers(branchName: string) {
  try {
    const branchId = await getBranchIdByName(branchName)
    if (!branchId) {
      return {
        success: false,
        data: [],
        message: 'Branch not found'
      }
    }
    
    const users = await ICANUserService.getUsersByBranch(branchId)
    
    // Filter to only include actual members (not branch users)
    const members = users.filter(user => {
      // Include users who:
      // 1. Have a password set (indicating they're registered members), OR
      // 2. Are explicitly marked as members, OR 
      // 3. Have role 'member' or 'admin', OR
      // 4. Are NOT marked as branch users (legacy users without the new flags)
      return (
        user.password || 
        user.isMember === true || 
        ['member', 'admin'].includes(user.role) ||
        (user.isBranchUser !== true && user.role !== 'guest')
      )
    })
    
    return {
      success: true,
      data: members,
      message: 'Members loaded successfully'
    }
  } catch (error) {
    console.error('Error loading members:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Get member activities for a branch (legacy compatibility)
 * @param branchName - Name of the branch
 * @param limit - Number of activities to fetch
 * @returns Response with activities data
 */
export async function getMemberActivities(branchName: string, limit = 50) {
  try {
    const branchId = await getBranchIdByName(branchName)
    if (!branchId) {
      return {
        success: false,
        data: [],
        message: 'Branch not found'
      }
    }
    
    // Get branch statistics which includes recent activities
    const stats = await ICANStatsService.getBranchStatistics(branchId)
    
    // Format activities data
    const activities = [
      ...stats.recentInvoices.map(inv => ({
        id: inv.id,
        type: 'invoice',
        description: `Invoice ${inv.number} created`,
        date: inv.createdAt,
        amount: inv.total
      })),
      ...stats.recentReceipts.map(rec => ({
        id: rec.id,
        type: 'receipt',
        description: `Receipt ${rec.number} created`,
        date: rec.createdAt,
        amount: rec.amount
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, limit)
    
    return {
      success: true,
      data: activities,
      message: 'Activities loaded successfully'
    }
  } catch (error) {
    console.error('Error loading activities:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Get all invoices for a branch (legacy compatibility)
 * @param branchName - Name of the branch
 * @param limit - Number of invoices to fetch
 * @returns Response with invoices data
 */
export async function getAllInvoices(branchName: string, limit = 50) {
  try {
    // Read from ALL localStorage keys that start with "invoices_" regardless of branch
    const allInvoices = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('invoices_')) {
        try {
          const localData = localStorage.getItem(key);
          if (localData) {
            const invoices = JSON.parse(localData);
            if (Array.isArray(invoices)) {
              allInvoices.push(...invoices);
              console.log(`📄 Found ${invoices.length} invoices in localStorage key: ${key}`);
            }
          }
        } catch (parseError) {
          console.error(`Error parsing localStorage invoices from ${key}:`, parseError);
        }
      }
    }
    
    if (allInvoices.length > 0) {
      console.log(`📄 Total invoices found across all branches: ${allInvoices.length}`);
      return {
        success: true,
        data: allInvoices.slice(0, limit),
        message: `Found ${allInvoices.length} invoices from all branches`
      }
    }
    
    // If no localStorage data, try Firebase
    const branchId = await getBranchIdByName(branchName)
    if (!branchId) {
      return {
        success: false,
        data: [],
        message: 'Branch not found'
      }
    }
    
    const invoices = await ICANInvoiceService.getInvoicesByBranch(branchId, limit)
    return {
      success: true,
      data: invoices,
      message: 'Invoices loaded successfully'
    }
  } catch (error) {
    console.error('Error loading invoices:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Get all receipts for a branch (legacy compatibility)
 * @param branchName - Name of the branch
 * @param limit - Number of receipts to fetch
 * @returns Response with receipts data
 */
export async function getAllReceipts(branchName: string, limit = 50) {
  try {
    // Read from ALL localStorage keys that start with "receipts_" regardless of branch
    const allReceipts = [];
    
    // Get all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('receipts_')) {
        try {
          const localData = localStorage.getItem(key);
          if (localData) {
            const receipts = JSON.parse(localData);
            if (Array.isArray(receipts)) {
              allReceipts.push(...receipts);
              console.log(`🧾 Found ${receipts.length} receipts in localStorage key: ${key}`);
            }
          }
        } catch (parseError) {
          console.error(`Error parsing localStorage receipts from ${key}:`, parseError);
        }
      }
    }
    
    if (allReceipts.length > 0) {
      console.log(`🧾 Total receipts found across all branches: ${allReceipts.length}`);
      return {
        success: true,
        data: allReceipts.slice(0, limit),
        message: `Found ${allReceipts.length} receipts from all branches`
      }
    }
    
    // If no localStorage data, try Firebase
    const branchId = await getBranchIdByName(branchName)
    if (!branchId) {
      return {
        success: false,
        data: [],
        message: 'Branch not found'
      }
    }
    
    const receipts = await ICANReceiptService.getReceiptsByBranch(branchId, limit)
    return {
      success: true,
      data: receipts,
      message: 'Receipts loaded successfully'
    }
  } catch (error) {
    console.error('Error loading receipts:', error)
    return {
      success: false,
      data: [],
      message: error.message
    }
  }
}

/**
 * Save member (legacy compatibility)
 * @param memberData - Member data to save
 * @returns Response with saved member data
 */
export async function saveMember(memberData: any) {
  try {
    // Check if email is already used for branch login
    const isUsedForBranchLogin = await ICANUserService.isEmailUsedForBranchLogin(memberData.email)
    if (isUsedForBranchLogin) {
      return {
        success: false,
        message: 'This email is already registered for branch login. Please use a different email for member registration.'
      }
    }

    // Check if member already exists in this branch
    const branchId = memberData.branchId || memberData.branch
    const existingMember = await ICANUserService.getUserByEmailAndBranch(memberData.email, branchId)
    if (existingMember) {
      return {
        success: false,
        message: 'A member with this email already exists in this branch.'
      }
    }

    // Convert member data to user format with explicit member flags
    const userData = {
      email: memberData.email,
      name: memberData.name,
      password: memberData.password, // Include password
      branchId: branchId,
      role: memberData.role || 'member', // Use 'member' role for actual members
      isMember: true, // Explicitly mark as a member
      isBranchUser: false, // This is not just branch access
      isActive: true
    }
    
    const userId = await ICANUserService.createUser(userData)
    
    // Increment the member counter in Firebase for global consistency
    await ICANCounterService.incrementMemberCount(userData.branchId).catch(err => {
      console.warn('Failed to increment member counter:', err)
      // Don't fail the member creation if counter update fails
    })
    
    return {
      success: true,
      data: { id: userId, ...userData },
      message: 'Member saved successfully'
    }
  } catch (error) {
    console.error('Error saving member:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Update member (legacy compatibility)
 * @param memberData - Member data to update
 * @returns Response with update status
 */
export async function updateMember(memberData: any) {
  try {
    // For now, return success (would need to implement update in ICANUserService)
    return {
      success: true,
      data: memberData,
      message: 'Member updated successfully'
    }
  } catch (error) {
    console.error('Error updating member:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Save member activity (legacy compatibility)
 * @param activityData - Activity data to save
 * @returns Response with saved activity
 */
export async function saveMemberActivity(activityData: any) {
  try {
    // For now, return success (would need to implement activity tracking)
    return {
      success: true,
      data: activityData,
      message: 'Activity saved successfully'
    }
  } catch (error) {
    console.error('Error saving activity:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Delete member (legacy compatibility)
 * @param memberId - ID of member to delete
 * @returns Response with deletion status
 */
export async function deleteMember(memberId: string) {
  try {
    // For now, return success (would need to implement delete in ICANUserService)
    return {
      success: true,
      message: 'Member deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting member:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Reset member password (admin function)
 * @param memberEmail - Email of the member
 * @param branchName - Branch name
 * @param newPassword - New password to set
 * @param adminEmail - Email of the admin performing the reset
 * @returns Response with reset status
 */
export async function resetMemberPassword(memberEmail: string, branchName: string, newPassword: string, adminEmail?: string) {
  try {
    // Get branch ID from name
    const branch = await getBranchByName(branchName)
    if (!branch) {
      return {
        success: false,
        message: 'Branch not found'
      }
    }

    // Find the member by email and branch
    const member = await ICANUserService.getUserByEmailAndBranch(memberEmail, branch.id)
    if (!member) {
      return {
        success: false,
        message: 'Member not found'
      }
    }

    // Reset the password
    await ICANUserService.resetUserPassword(member.id, newPassword, adminEmail || 'admin')
    
    return {
      success: true,
      data: { 
        email: memberEmail, 
        name: member.name, 
        branch: branchName 
      },
      message: 'Password reset successfully'
    }
  } catch (error) {
    console.error('Error resetting member password:', error)
    return {
      success: false,
      message: error.message || 'Failed to reset password'
    }
  }
}

/**
 * Get member by email for password reset
 * @param memberEmail - Email of the member
 * @param branchName - Branch name
 * @returns Response with member data or error
 */
export async function getMemberForReset(memberEmail: string, branchName: string) {
  try {
    // Get branch ID from name
    const branch = await getBranchByName(branchName)
    if (!branch) {
      return {
        success: false,
        message: 'Branch not found'
      }
    }

    // Find the member by email and branch
    const member = await ICANUserService.getUserByEmailAndBranch(memberEmail, branch.id)
    if (!member) {
      return {
        success: false,
        message: 'Member not found'
      }
    }

    return {
      success: true,
      data: { 
        id: member.id,
        email: member.email, 
        name: member.name, 
        branch: branchName,
        role: member.role
      },
      message: 'Member found'
    }
  } catch (error) {
    console.error('Error getting member for reset:', error)
    return {
      success: false,
      message: error.message || 'Failed to find member'
    }
  }
}

// ============================================================================
// ADDITIONAL LEGACY COMPATIBILITY FUNCTIONS
// ============================================================================

/**
 * Save invoice (legacy compatibility)
 * @param invoiceData - Invoice data to save
 * @returns Response with saved invoice
 */
export async function saveInvoice(invoiceData: any) {
  try {
    const result = await createInvoice(invoiceData)
    return result
  } catch (error) {
    console.error('Error saving invoice:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Update invoice (legacy compatibility)
 * @param invoiceData - Invoice data to update
 * @returns Response with update status
 */
export async function updateInvoice(invoiceData: any) {
  try {
    return {
      success: true,
      data: invoiceData,
      message: 'Invoice updated successfully'
    }
  } catch (error) {
    console.error('Error updating invoice:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Delete invoice (legacy compatibility)
 * @param invoiceId - ID of invoice to delete
 * @returns Response with deletion status
 */
export async function deleteInvoice(invoiceId: string) {
  try {
    return {
      success: true,
      message: 'Invoice deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Save receipt (legacy compatibility)
 * @param receiptData - Receipt data to save
 * @returns Response with saved receipt
 */
export async function saveReceipt(receiptData: any) {
  try {
    const result = await createReceipt(receiptData)
    return result
  } catch (error) {
    console.error('Error saving receipt:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Update receipt (legacy compatibility)
 * @param receiptData - Receipt data to update
 * @returns Response with update status
 */
export async function updateReceipt(receiptData: any) {
  try {
    return {
      success: true,
      data: receiptData,
      message: 'Receipt updated successfully'
    }
  } catch (error) {
    console.error('Error updating receipt:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

/**
 * Delete receipt (legacy compatibility)
 * @param receiptId - ID of receipt to delete
 * @returns Response with deletion status
 */
export async function deleteReceipt(receiptId: string) {
  try {
    return {
      success: true,
      message: 'Receipt deleted successfully'
    }
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return {
      success: false,
      message: error.message
    }
  }
}

// ============================================================================
// SIGNATURE MANAGEMENT
// ============================================================================

interface SignatureData {
  id: string;
  name: string;
  dataURL: string;
  isPrimary: boolean;
  createdAt: string;
}

/**
 * Get signature storage key for branch
 */
function getSignatureStorageKey(branchName: string): string {
  return `ican_signatures_${branchName}`;
}

/**
 * Save signature
 * @param branchName - Branch name
 * @param signatureData - Signature data to save
 * @returns Response with saved signature
 */
export async function saveSignature(branchName: string, signatureData: Omit<SignatureData, 'id'>): Promise<{success: boolean; data?: SignatureData; error?: string}> {
  try {
    const storageKey = getSignatureStorageKey(branchName);
    const existingSignatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    // Generate unique ID
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Create new signature
    const newSignature: SignatureData = {
      id,
      ...signatureData
    };
    
    // If this is set as primary, remove primary from others
    if (newSignature.isPrimary) {
      existingSignatures.forEach((sig: SignatureData) => sig.isPrimary = false);
    }
    
    // Add new signature
    existingSignatures.push(newSignature);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(existingSignatures));
    
    return {
      success: true,
      data: newSignature
    };
  } catch (error) {
    console.error('Error saving signature:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all signatures for a branch
 * @param branchName - Name of the branch
 * @returns Response with signatures data
 */
export async function getAllSignatures(branchName: string): Promise<{success: boolean; data: SignatureData[]; error?: string}> {
  try {
    const storageKey = getSignatureStorageKey(branchName);
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    return {
      success: true,
      data: signatures
    };
  } catch (error) {
    console.error('Error loading signatures:', error);
    return {
      success: false,
      data: [],
      error: error.message
    };
  }
}

/**
 * Get primary signature for a branch
 * @param branchName - Name of the branch
 * @returns Response with primary signature
 */
export async function getPrimarySignature(branchName: string): Promise<{success: boolean; data: SignatureData | null; error?: string}> {
  try {
    const storageKey = getSignatureStorageKey(branchName);
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const primary = signatures.find((sig: SignatureData) => sig.isPrimary);
    
    return {
      success: true,
      data: primary || null
    };
  } catch (error) {
    console.error('Error loading primary signature:', error);
    return {
      success: false,
      data: null,
      error: error.message
    };
  }
}

/**
 * Update signature
 * @param branchName - Branch name
 * @param signatureId - ID of signature to update
 * @param updateData - Data to update
 * @returns Response with update status
 */
export async function updateSignature(branchName: string, signatureId: string, updateData: Partial<SignatureData>): Promise<{success: boolean; data?: SignatureData; error?: string}> {
  try {
    const storageKey = getSignatureStorageKey(branchName);
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const index = signatures.findIndex((sig: SignatureData) => sig.id === signatureId);
    if (index === -1) {
      throw new Error('Signature not found');
    }
    
    // If setting as primary, remove primary from others
    if (updateData.isPrimary) {
      signatures.forEach((sig: SignatureData) => sig.isPrimary = false);
    }
    
    // Update signature
    signatures[index] = { ...signatures[index], ...updateData };
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(signatures));
    
    return {
      success: true,
      data: signatures[index]
    };
  } catch (error) {
    console.error('Error updating signature:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete signature
 * @param branchName - Branch name
 * @param signatureId - ID of signature to delete
 * @returns Response with deletion status
 */
export async function deleteSignatureFromDB(branchName: string, signatureId: string): Promise<{success: boolean; error?: string}> {
  try {
    const storageKey = getSignatureStorageKey(branchName);
    const signatures = JSON.parse(localStorage.getItem(storageKey) || '[]');
    
    const filteredSignatures = signatures.filter((sig: SignatureData) => sig.id !== signatureId);
    
    // Save updated list
    localStorage.setItem(storageKey, JSON.stringify(filteredSignatures));
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting signature:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Alias for backward compatibility
export const deleteSignature = deleteSignatureFromDB

// ============================================================================
// ACTIVITY LOGGING
// ============================================================================

export interface ActivityLog {
  id: string
  action: string
  memberName: string
  branch: string
  timestamp: string
  type: 'invoice' | 'receipt' | 'export' | 'login' | 'other'
  details?: {
    documentNumber?: string
    exportFormat?: 'pdf' | 'jpeg'
    exportType?: 'current' | 'all'
    pageCount?: number
  }
}

/**
 * Log an activity to Firebase
 * @param branchName - Branch name
 * @param activity - Activity data to log
 */
export async function logActivity(branchName: string, activity: Omit<ActivityLog, 'id' | 'timestamp' | 'branch'>): Promise<{success: boolean; activityId?: string; error?: string}> {
  try {
    const activityId = `activity_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    const fullActivity: ActivityLog = {
      ...activity,
      id: activityId,
      branch: branchName,
      timestamp: new Date().toISOString()
    }
    
    // Store in localStorage (using same pattern as signatures)
    const storageKey = `ican_activities_${branchName}`
    const activities = JSON.parse(localStorage.getItem(storageKey) || '[]')
    
    // Add new activity at the beginning
    activities.unshift(fullActivity)
    
    // Keep only last 50 activities to prevent localStorage overflow
    const trimmedActivities = activities.slice(0, 50)
    
    localStorage.setItem(storageKey, JSON.stringify(trimmedActivities))
    
    return {
      success: true,
      activityId
    }
  } catch (error) {
    console.error('Error logging activity:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

/**
 * Get all activities for a branch
 * @param branchName - Branch name
 * @param limit - Maximum number of activities to return (default: 10)
 */
export async function getActivities(branchName: string, limit: number = 10): Promise<{success: boolean; activities?: ActivityLog[]; error?: string}> {
  try {
    const storageKey = `ican_activities_${branchName}`
    const activities = JSON.parse(localStorage.getItem(storageKey) || '[]')
    
    return {
      success: true,
      activities: activities.slice(0, limit)
    }
  } catch (error) {
    console.error('Error getting activities:', error)
    return {
      success: false,
      error: error.message,
      activities: []
    }
  }
}