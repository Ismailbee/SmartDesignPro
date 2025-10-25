# 🔧 Fix: User Not Found Error (404)

## Problem

When clicking the token display and navigating to `/tokens-and-plans`, the page showed nothing because the payment server returned a 404 error:

```
GET http://localhost:3006/api/users/user_123 404 (Not Found)
Error: User not found
```

The issue was:
1. **Hardcoded User ID**: The code was using `'user_123'` instead of the actual Firebase user ID
2. **User Not Created**: The user didn't exist in the database because they hadn't made a payment yet

---

## Solution

### **Part 1: Use Actual Firebase User ID**

**Files Modified:**
- `src/views/TokensAndPlans.vue`
- `src/components/HeaderTokenDisplay.vue`

**Changes:**
```typescript
// Before
const userId = 'user_123' // TODO: Get from auth store

// After
const userId = authStore.user?.id
if (!userId) {
  throw new Error('User not authenticated')
}
```

**Added Imports:**
```typescript
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
```

---

### **Part 2: Auto-Create User on First Access**

**File Modified:** `payment-server.cjs`

**Changes to GET /api/users/:userId endpoint:**
```javascript
// Before: Returned 404 if user not found
if (!user) {
  return res.status(404).json({ error: 'User not found' })
}

// After: Creates user if they don't exist
if (!user && email) {
  user = getOrCreateUser(userId, email, name)
  console.log(`✅ Created new user: ${userId}`)
}
```

Now accepts optional query parameters:
- `email` - User's email address
- `name` - User's name

---

### **Part 3: Pass User Info to Backend**

**File Modified:** `src/services/user.service.ts`

**Changes:**
```typescript
// Before
export async function getUser(userId: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/api/users/${userId}`)
  ...
}

// After
export async function getUser(userId: string, email?: string, name?: string): Promise<User> {
  const params = new URLSearchParams()
  if (email) params.append('email', email)
  if (name) params.append('name', name)
  
  const url = `${API_BASE_URL}/api/users/${userId}${params.toString() ? '?' + params.toString() : ''}`
  const response = await fetch(url)
  ...
}
```

---

### **Part 4: Update User Store**

**File Modified:** `src/stores/user.store.ts`

**Changes:**
```typescript
// Before
async function fetchUser(userId: string) {
  user.value = await getUser(userId)
}

// After
async function fetchUser(userId: string, email?: string, name?: string) {
  user.value = await getUser(userId, email, name)
}
```

---

### **Part 5: Pass User Data from Components**

**Files Modified:**
- `src/views/TokensAndPlans.vue`
- `src/components/HeaderTokenDisplay.vue`

**Changes:**
```typescript
// Before
await userStore.fetchUser(userId)

// After
const email = authStore.user?.email
const name = authStore.user?.name || authStore.user?.firstName
await userStore.fetchUser(userId, email, name)
```

---

## How It Works Now

### **Flow:**

1. **User Logs In**
   - Firebase authenticates user
   - Auth store has user ID, email, name

2. **User Clicks Token Display**
   - Component gets user ID from auth store
   - Calls `userStore.fetchUser(userId, email, name)`

3. **Frontend Calls Backend**
   - Sends: `GET /api/users/{userId}?email={email}&name={name}`

4. **Backend Processes Request**
   - Checks if user exists in database
   - If not, creates user with provided email and name
   - Returns user data

5. **Frontend Displays Data**
   - Shows token balance
   - Shows current plan
   - Shows plan expiry date

---

## Testing

### **Step 1: Start Payment Server**
```bash
node payment-server.cjs
```

**Expected Output:**
```
🚀 Payment Server running on port 3006
💳 Paystack mode: LIVE
✅ Ready to process payments!
```

### **Step 2: Start Frontend**
```bash
npm run dev
```

### **Step 3: Test**
1. Open: `http://localhost:8101`
2. Login with your account
3. Click token display (💎 1,250)
4. Should navigate to `/tokens-and-plans`
5. Should show token balance and plan info

### **Step 4: Check Server Logs**
```
✅ Created new user: VwXPosv5R8dAfUFdE513DqV1dUd2
```

---

## Files Changed

| File | Changes |
|------|---------|
| `payment-server.cjs` | Modified GET /api/users/:userId to auto-create users |
| `src/services/user.service.ts` | Added email and name parameters |
| `src/stores/user.store.ts` | Updated fetchUser to accept email and name |
| `src/views/TokensAndPlans.vue` | Use actual Firebase user ID, pass email and name |
| `src/components/HeaderTokenDisplay.vue` | Use actual Firebase user ID, pass email and name |

---

## Benefits

✅ **No More 404 Errors** - Users are auto-created on first access  
✅ **Real User IDs** - Using Firebase user IDs instead of hardcoded values  
✅ **Automatic User Creation** - No need for separate registration endpoint  
✅ **Seamless Experience** - Users can access tokens page immediately after login  
✅ **Proper Data** - User email and name are stored correctly  

---

## Verification

**Check if user was created:**
```bash
# In payment server logs, you should see:
✅ Created new user: {userId}
```

**Check database:**
```bash
# The user should now exist in the SQLite database
# with their Firebase ID, email, and name
```

---

## Next Steps

1. ✅ Test payment flow with real user ID
2. ✅ Verify tokens are added correctly
3. ✅ Test plan upgrades
4. ✅ Monitor Paystack dashboard

---

## Summary

The issue was that the code was using a hardcoded user ID (`'user_123'`) instead of the actual Firebase user ID, and the user didn't exist in the database. 

**The fix:**
1. Use the actual Firebase user ID from the auth store
2. Auto-create users in the database when they first access the tokens page
3. Pass user email and name to the backend for user creation

Now users can seamlessly access the tokens page immediately after login! 🎉

