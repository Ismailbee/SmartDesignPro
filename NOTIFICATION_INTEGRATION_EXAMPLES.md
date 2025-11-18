/**
 * INTEGRATION EXAMPLES - Firebase Notifications
 * 
 * Copy these examples into your actual components/services where you want to send notifications
 */

// ============================================
// Example 1: Send notification when design is uploaded
// ============================================
// File: src/services/design.service.ts

import { notifySuccess, notifyError } from '@/utils/notificationHelpers'

export async function uploadDesign(file: File, userId: string) {
  try {
    // ... your upload logic ...
    const designId = 'design-123'
    const designName = file.name

    // Send success notification
    await notifySuccess(
      userId,
      'Design Uploaded Successfully! ✅',
      `Your design "${designName}" is now available in your library.`,
      `/designs/${designId}`
    )

    return designId
  } catch (error) {
    // Send error notification
    await notifyError(
      userId,
      'Upload Failed',
      'Failed to upload your design. Please try again.',
      '/designs/upload'
    )
    throw error
  }
}

// ============================================
// Example 2: Notify user on token purchase
// ============================================
// File: src/services/payment.service.ts

import { notifyTokenPurchase } from '@/utils/notificationHelpers'

export async function handleTokenPurchase(userId: string, amount: number, tokens: number) {
  try {
    // ... process payment ...
    
    // Update user's token balance in database
    // await updateUserTokens(userId, tokens)
    
    // Send notification
    await notifyTokenPurchase(userId, amount, tokens)
    
    return { success: true }
  } catch (error) {
    console.error('Payment error:', error)
    throw error
  }
}

// ============================================
// Example 3: Auto-design completion notification
// ============================================
// File: src/services/auto-design.service.ts

import { notifyAutoDesignComplete } from '@/utils/notificationHelpers'

export async function generateAutoDesign(userId: string, templateId: string) {
  try {
    // ... AI generation logic ...
    
    const newDesign = {
      id: 'generated-design-456',
      name: 'Auto-Generated Business Card'
    }
    
    // Notify user that design is ready
    await notifyAutoDesignComplete(
      userId,
      newDesign.name,
      newDesign.id
    )
    
    return newDesign
  } catch (error) {
    console.error('Auto-design error:', error)
    throw error
  }
}

// ============================================
// Example 4: Welcome notification on signup
// ============================================
// File: src/stores/auth.ts or registration handler

import { notifyWelcome } from '@/utils/notificationHelpers'

export async function registerUser(email: string, name: string) {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const userId = userCredential.user.uid
    
    // Create user document in Firestore
    // await createUserDocument(userId, { name, email })
    
    // Send welcome notification
    await notifyWelcome(userId, name)
    
    return userId
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// ============================================
// Example 5: Comment notification
// ============================================
// File: src/services/comments.service.ts

import { notifyNewComment } from '@/utils/notificationHelpers'

export async function addComment(designId: string, designOwnerId: string, comment: string, commenterName: string) {
  try {
    // Save comment to database
    // await saveCommentToFirestore({ designId, comment, userId: currentUser.id })
    
    // Notify design owner (don't notify if commenting on own design)
    const currentUserId = useAuthStore().user?.id
    if (designOwnerId !== currentUserId) {
      await notifyNewComment(
        designOwnerId,
        commenterName,
        'Your Design',
        designId
      )
    }
    
    return { success: true }
  } catch (error) {
    console.error('Comment error:', error)
    throw error
  }
}

// ============================================
// Example 6: Low token warning
// ============================================
// File: src/services/token.service.ts

import { notifyLowTokens } from '@/utils/notificationHelpers'

export async function checkTokenBalance(userId: string) {
  // Get user's token balance
  const balance = await getUserTokenBalance(userId)
  
  // Warn if below threshold
  if (balance <= 5 && balance > 0) {
    await notifyLowTokens(userId, balance)
  }
  
  return balance
}

// ============================================
// Example 7: Collaboration invite
// ============================================
// File: src/services/collaboration.service.ts

import { notifyCollaborationInvite } from '@/utils/notificationHelpers'

export async function inviteCollaborator(
  projectId: string,
  projectName: string,
  inviteeUserId: string,
  inviterName: string
) {
  try {
    // Create collaboration invitation in database
    // await createCollaborationInvite({ projectId, inviteeUserId })
    
    // Notify the invited user
    await notifyCollaborationInvite(
      inviteeUserId,
      inviterName,
      projectName,
      projectId
    )
    
    return { success: true }
  } catch (error) {
    console.error('Invite error:', error)
    throw error
  }
}

// ============================================
// Example 8: Batch notifications (system maintenance)
// ============================================
// File: src/services/admin.service.ts

import { sendBulkNotifications } from '@/services/notification.service'

export async function notifyAllUsers(title: string, message: string) {
  try {
    // Get all user IDs from your database
    const allUserIds = await getAllUserIds()
    
    // Send notification to everyone
    await sendBulkNotifications(allUserIds, {
      title,
      message,
      type: 'info'
    })
    
    console.log(`Sent notification to ${allUserIds.length} users`)
  } catch (error) {
    console.error('Bulk notification error:', error)
    throw error
  }
}

// ============================================
// Example 9: Custom notification with metadata
// ============================================
// File: Anywhere in your app

import { createNotification } from '@/services/notification.service'

export async function sendCustomNotification(userId: string) {
  await createNotification({
    userId,
    title: 'Special Offer! 🎁',
    message: 'Get 50% off premium templates this week only!',
    type: 'success',
    link: '/templates/premium',
    metadata: {
      campaignId: 'summer-sale-2024',
      discountCode: 'SUMMER50',
      expiresAt: '2024-08-31'
    }
  })
}

// ============================================
// Example 10: Error handling with notification
// ============================================
// File: Any service with error handling

import { notifyError, notifyCurrentUser } from '@/utils/notificationHelpers'

export async function performOperation() {
  try {
    // ... some operation that might fail ...
    throw new Error('Something went wrong')
  } catch (error) {
    const userId = useAuthStore().user?.id
    
    if (userId) {
      await notifyError(
        userId,
        'Operation Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred',
        '/help/support'
      )
    }
    
    throw error
  }
}

// ============================================
// QUICK START: Test in Browser Console
// ============================================

/*
To test notifications immediately, open your browser console and run:

import { createNotification } from '@/services/notification.service'

await createNotification({
  userId: 'H4KTd7KUhpNtCq8BSFK7Ro2kVaU2',  // Your actual user ID
  title: 'Test Notification',
  message: 'This is a test message!',
  type: 'success',
  link: '/home'
})

The notification should appear instantly in your app!
*/
