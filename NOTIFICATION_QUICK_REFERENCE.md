# 🚀 Firebase Notifications - Quick Reference

## 📝 Import Statements

```typescript
// Main service
import { 
  createNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToNotifications,
  sendBulkNotifications
} from '@/services/notification.service'

// Helper functions
import {
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyCurrentUser,
  notifyDesignApproved,
  notifyTokenPurchase,
  notifyLowTokens,
  notifyWelcome
} from '@/utils/notificationHelpers'

// Store
import { useNotificationStore } from '@/stores/notification.store'
```

---

## ⚡ Quick Commands

### Send Notification
```typescript
// Simple success notification
await notifySuccess(userId, 'Success!', 'Operation completed')

// Custom notification
await createNotification({
  userId: 'user-123',
  title: 'Hello',
  message: 'Test message',
  type: 'info',
  link: '/page'
})
```

### Mark as Read
```typescript
const store = useNotificationStore()

// Single notification
await store.markRead('notification-id')

// All notifications
await store.markAllRead()
```

### Subscribe to Notifications
```typescript
const store = useNotificationStore()
await store.subscribeToUserNotifications(userId)
```

---

## 📊 Notification Types

| Type | Visual | Use For |
|------|--------|---------|
| `'info'` | 🔵 Blue | General updates, announcements |
| `'success'` | 🟢 Green | Completed actions, approvals |
| `'warning'` | 🟡 Yellow | Alerts, warnings, low balance |
| `'error'` | 🔴 Red | Errors, failures, critical issues |

---

## 🎯 Common Patterns

### After User Action
```typescript
try {
  await performAction()
  await notifySuccess(userId, 'Done!', 'Action completed')
} catch (error) {
  await notifyError(userId, 'Failed', error.message)
}
```

### Background Process Complete
```typescript
// When async job finishes
await notifyInfo(userId, 'Ready!', 'Your file is ready to download', '/downloads')
```

### Warning Before Action
```typescript
if (tokens < 5) {
  await notifyLowTokens(userId, tokens)
}
```

---

## 🔥 Firestore Structure

```javascript
notifications/{notificationId}
{
  userId: string           // "H4KTd7KUhpNtCq8BSFK7Ro2kVaU2"
  title: string           // "Design Uploaded!"
  message: string         // "Your design is ready"
  type: string            // "success" | "info" | "warning" | "error"
  read: boolean           // false
  createdAt: Timestamp    // Firebase.Timestamp
  readAt: Timestamp       // (optional) Firebase.Timestamp
  link: string            // "/designs/123"
  metadata: object        // { designId: "123", ... }
}
```

---

## 🛠️ Preset Functions

```typescript
// Welcome new user
await notifyWelcome(userId, userName)

// Design events
await notifyDesignApproved(userId, 'Poster', 'design-123')
await notifyDesignRejected(userId, 'Poster', 'Quality issues')

// Token management
await notifyTokenPurchase(userId, 49.99, 100)
await notifyLowTokens(userId, 5)
await notifyMonthlyTokens(userId, 50)

// Social interactions
await notifyNewComment(userId, 'John', 'My Design', 'design-123')
await notifyCollaborationInvite(userId, 'Sarah', 'Project X', 'proj-456')

// System events
await notifyAutoDesignComplete(userId, 'Business Card', 'design-789')
await notifyAccountVerified(userId)
await notifyRoleUpdated(userId, 'Premium Member')
```

---

## 🔐 Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /notifications/{notificationId} {
      allow read: if request.auth.uid == resource.data.userId;
      allow update: if request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
      allow delete: if request.auth.uid == resource.data.userId;
    }
  }
}
```

---

## 🧪 Testing Commands

### Browser Console
```javascript
// Import service
import { createNotification } from '@/services/notification.service'

// Send test notification
await createNotification({
  userId: 'YOUR_USER_ID',
  title: 'Test',
  message: 'Hello World!',
  type: 'success'
})

// Check unread count
import { useNotificationStore } from '@/stores/notification.store'
const store = useNotificationStore()
console.log('Unread:', store.unreadCount)
```

---

## 📍 Integration Points

| Event | Function to Call |
|-------|------------------|
| User signs up | `notifyWelcome()` |
| Design uploaded | `notifySuccess()` |
| Design approved | `notifyDesignApproved()` |
| Token purchased | `notifyTokenPurchase()` |
| Token balance low | `notifyLowTokens()` |
| Comment added | `notifyNewComment()` |
| Upload failed | `notifyError()` |
| Collaboration invite | `notifyCollaborationInvite()` |
| Auto-design done | `notifyAutoDesignComplete()` |

---

## 🐛 Debug Checklist

❓ Notifications not appearing?
- [ ] Firestore database enabled?
- [ ] Security rules added?
- [ ] User authenticated? Check `authStore.user?.id`
- [ ] Correct userId in notification?
- [ ] Console errors?

❓ Badge not updating?
- [ ] Subscription active? Check `store.isSubscribed`
- [ ] `read` field is boolean?
- [ ] Browser cache cleared?

❓ Real-time not working?
- [ ] Check Firestore connection
- [ ] Verify onSnapshot listener
- [ ] Check browser network tab

---

## 💾 Store Methods

```typescript
const store = useNotificationStore()

// Subscribe to real-time updates
await store.subscribeToUserNotifications(userId)

// Mark as read
await store.markRead(notificationId)
await store.markAllRead()

// Unsubscribe (cleanup)
store.unsubscribeFromNotifications()

// Access data
store.items          // All notifications
store.sorted         // Sorted by date (newest first)
store.unreadCount    // Number of unread
```

---

## 📦 File Locations

```
src/
├── services/notification.service.ts    → Main Firebase logic
├── stores/notification.store.ts        → Pinia store
├── utils/notificationHelpers.ts        → Preset functions
├── components/NotificationBell.vue     → Badge icon
└── views/NotificationsPage.vue         → Full list view
```

---

## 🎨 UI Components

### NotificationBell
- Shows unread count badge
- Navigates to `/notifications`
- Auto-subscribes on mount

### NotificationsPage
- Lists all notifications
- Mark as read buttons
- Mark all as read
- Click to navigate to `link`
- Beautiful type-based styling

---

## ⚙️ Configuration

### Subscription Limit
```typescript
// Default: 50 notifications
await store.subscribeToUserNotifications(userId, 100)
```

### Auto-Cleanup
```typescript
// Delete notifications older than 30 days
import { deleteOldNotifications } from '@/services/notification.service'
await deleteOldNotifications(userId, 30)
```

---

## 🚨 Error Handling

```typescript
try {
  await createNotification({ ... })
} catch (error) {
  console.error('Notification failed:', error)
  // Fallback: show toast message
}
```

---

## 📚 Documentation Files

- `FIREBASE_NOTIFICATIONS_GUIDE.md` → Complete setup guide
- `NOTIFICATION_INTEGRATION_EXAMPLES.md` → Code examples
- `FIREBASE_NOTIFICATIONS_COMPLETE.md` → Summary
- `NOTIFICATION_QUICK_REFERENCE.md` → This file

---

**Pro Tip:** Bookmark this file for quick reference while coding! 🔖
