/**
 * Admin Utilities for ICAN App
 * These functions should only be used by administrators
 */

import { ICANUserService } from '../services/ican-service.js'

/**
 * Delete all members from all branches
 * USE WITH CAUTION - This will delete all member accounts!
 */
export async function deleteAllMembers(): Promise<void> {
  try {
    console.log('🗑️ Starting to delete all members...')
    const deletedCount = await ICANUserService.deleteAllMembers()
    console.log(`✅ Successfully deleted ${deletedCount} members`)
    alert(`Successfully deleted ${deletedCount} members. You can now create new members.`)
  } catch (error) {
    console.error('❌ Error deleting members:', error)
    alert(`Error deleting members: ${error.message}`)
  }
}

/**
 * Delete all members from a specific branch
 * @param branchId - The ID of the branch to delete members from
 */
export async function deleteAllMembersFromBranch(branchId: string): Promise<void> {
  try {
    console.log(`🗑️ Starting to delete all members from branch ${branchId}...`)
    const deletedCount = await ICANUserService.deleteAllMembersFromBranch(branchId)
    console.log(`✅ Successfully deleted ${deletedCount} members from branch ${branchId}`)
    alert(`Successfully deleted ${deletedCount} members from the branch. You can now create new members.`)
  } catch (error) {
    console.error('❌ Error deleting members:', error)
    alert(`Error deleting members: ${error.message}`)
  }
}

// Make functions available globally for console access
if (typeof window !== 'undefined') {
  (window as any).deleteAllMembers = deleteAllMembers;
  (window as any).deleteAllMembersFromBranch = deleteAllMembersFromBranch;
}
