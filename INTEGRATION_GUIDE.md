# 🔧 Integration Guide: Adding Token Display to Your App

Quick guide to integrate the token management system into your existing app.

---

## ✅ **What's Already Done**

1. ✅ **Route Added** - `/tokens-and-plans` route is configured in `src/router/index.ts`
2. ✅ **Components Created** - All components are ready to use
3. ✅ **Backend Ready** - Payment server is configured
4. ✅ **Navigation Works** - HeaderTokenDisplay already navigates to tokens page

---

## 🚀 **Quick Integration Steps**

### **Step 1: Add Header Token Display to Your App**

The `HeaderTokenDisplay` component shows the user's token balance and is clickable to navigate to the tokens page.

#### **Option A: Add to HomeHeader Component**

<augment_code_snippet path="src/components/home/HomeHeader.vue" mode="EXCERPT">
````vue
<!-- User Profile (Authenticated) -->
<div v-if="authStore.isAuthenticated" class="user-profile-header">
  <!-- Add Token Display Here -->
  <HeaderTokenDisplay />
  
  <div class="user-avatar" @click="handleUserProfileClick">
    <!-- ... existing code ... -->
  </div>
</div>
````
</augment_code_snippet>

**Import the component:**

<augment_code_snippet path="src/components/home/HomeHeader.vue" mode="EXCERPT">
````vue
<script setup lang="ts">
import HeaderTokenDisplay from '@/components/HeaderTokenDisplay.vue'
// ... other imports ...
</script>
````
</augment_code_snippet>

---

#### **Option B: Add to Main App Header**

If you have a global header component, add it there:

```vue
<template>
  <header class="app-header">
    <div class="logo">My App</div>
    
    <nav>
      <!-- Navigation links -->
    </nav>
    
    <!-- Add Token Display -->
    <HeaderTokenDisplay v-if="authStore.isAuthenticated" />
    
    <div class="user-menu">
      <!-- User menu -->
    </div>
  </header>
</template>

<script setup lang="ts">
import HeaderTokenDisplay from '@/components/HeaderTokenDisplay.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
```

---

### **Step 2: Add Navigation Link to Menu**

Add a link to the Tokens & Plans page in your navigation menu.

#### **Option A: Add to HomeHeader Navigation**

<augment_code_snippet path="src/components/home/HomeHeader.vue" mode="EXCERPT">
````vue
<nav class="nav-menu">
  <a href="#home" class="nav-link">Home</a>
  <a href="#portfolio" class="nav-link">Portfolio</a>
  <a href="#services" class="nav-link">Services</a>
  
  <!-- Add Tokens & Plans Link -->
  <router-link 
    v-if="authStore.isAuthenticated" 
    to="/tokens-and-plans" 
    class="nav-link tokens-link"
  >
    <span class="icon">💎</span>
    <span>Tokens & Plans</span>
  </router-link>
  
  <!-- ... other links ... -->
</nav>
````
</augment_code_snippet>

**Add styles:**

```vue
<style scoped>
.tokens-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: transform 0.2s;
}

.tokens-link:hover {
  transform: translateY(-2px);
}

.tokens-link .icon {
  font-size: 1.2rem;
}
</style>
```

---

#### **Option B: Add to More Menu Modal**

<augment_code_snippet path="src/components/home/MoreMenuModal.vue" mode="EXCERPT">
````vue
<div class="menu-items">
  <!-- Existing menu items -->
  
  <!-- Add Tokens & Plans -->
  <div class="menu-item" @click="navigate('/tokens-and-plans')">
    <span class="icon">💎</span>
    <div class="item-content">
      <h3>Tokens & Plans</h3>
      <p>Manage your tokens and subscription</p>
    </div>
  </div>
</div>
````
</augment_code_snippet>

---

#### **Option C: Add to User Profile Dropdown**

If you have a user profile dropdown menu:

```vue
<div class="user-dropdown" v-if="showDropdown">
  <router-link to="/settings" class="dropdown-item">
    <span class="icon">⚙️</span>
    <span>Settings</span>
  </router-link>
  
  <!-- Add Tokens & Plans -->
  <router-link to="/tokens-and-plans" class="dropdown-item">
    <span class="icon">💎</span>
    <span>Tokens & Plans</span>
  </router-link>
  
  <button @click="logout" class="dropdown-item">
    <span class="icon">🚪</span>
    <span>Logout</span>
  </button>
</div>
```

---

### **Step 3: Integrate with Auth System**

Currently, the components use a placeholder user ID. Update to use your actual auth system.

#### **Update HeaderTokenDisplay.vue**

<augment_code_snippet path="src/components/HeaderTokenDisplay.vue" mode="EXCERPT">
````vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userStore = useUserStore()

onMounted(async () => {
  if (!userStore.user && authStore.user) {
    try {
      // Use actual user ID from auth store
      await userStore.fetchUser(authStore.user.id)
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }
  loading.value = false
})
</script>
````
</augment_code_snippet>

---

#### **Update TokensAndPlans.vue**

<augment_code_snippet path="src/views/TokensAndPlans.vue" mode="EXCERPT">
````vue
<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const userStore = useUserStore()

onMounted(async () => {
  // Use actual user ID from auth store
  const userId = authStore.user?.id
  if (userId) {
    await loadUserData()
  }
})

async function loadUserData() {
  try {
    loading.value = true
    await userStore.fetchUser(authStore.user!.id)
  } catch (error) {
    console.error('Failed to load user data:', error)
  } finally {
    loading.value = false
  }
}
</script>
````
</augment_code_snippet>

---

### **Step 4: Add Paystack Script to index.html**

Add the Paystack inline script before the closing `</body>` tag:

<augment_code_snippet path="index.html" mode="EXCERPT">
````html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ... existing head content ... -->
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
  
  <!-- Add Paystack Script -->
  <script src="https://js.paystack.co/v1/inline.js"></script>
</body>
</html>
````
</augment_code_snippet>

---

### **Step 5: Configure Environment Variables**

#### **Backend .env**

Create `.env` in the root directory:

```env
# Payment Server Configuration
PAYMENT_PORT=3006

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret_here

# CORS Configuration
APP_URL=http://localhost:8100
CORS_ORIGINS=http://localhost:5173,http://localhost:8100,http://localhost:3000

# Environment
NODE_ENV=development
```

---

#### **Frontend .env**

Create `.env` in the root directory (or update existing):

```env
# Payment API Configuration
VITE_PAYMENT_API_URL=http://localhost:3006

# Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here
```

---

### **Step 6: Start the Servers**

#### **Terminal 1: Payment Server**

```powershell
# Install dependencies (first time only)
cd .
npm install --prefix . express cors better-sqlite3 dotenv

# Start payment server
node payment-server.js
```

You should see:
```
✅ Payment server running on http://localhost:3006
✅ Database initialized
✅ Paystack configured
```

---

#### **Terminal 2: Frontend Dev Server**

```powershell
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

### **Step 7: Test the Integration**

1. ✅ **Navigate to home page** - `http://localhost:8100`
2. ✅ **Login** - Authenticate with your account
3. ✅ **Check header** - You should see **💎 1,250 tokens** in the header
4. ✅ **Click token display** - Should navigate to `/tokens-and-plans`
5. ✅ **Try purchasing tokens** - Use test card: `4084 0840 8408 4081`
6. ✅ **Verify balance updates** - Header should update automatically
7. ✅ **Try upgrading plan** - Test Premium or Pro upgrade

---

## 🎨 **Styling Integration**

### **Match Your App's Theme**

The components use CSS variables for easy theming:

```css
/* In your global styles or theme file */
:root {
  /* Token Display Colors */
  --token-primary: #667eea;
  --token-accent: #764ba2;
  --token-success: #10b981;
  --token-warning: #f59e0b;
  
  /* Card Colors */
  --card-background: #ffffff;
  --card-border: #e5e7eb;
  --card-shadow: rgba(0, 0, 0, 0.1);
}

/* Dark mode */
[data-theme="dark"] {
  --card-background: #1f2937;
  --card-border: #374151;
  --card-shadow: rgba(0, 0, 0, 0.3);
}
```

---

### **Customize Token Display**

You can customize the HeaderTokenDisplay component:

```vue
<HeaderTokenDisplay 
  class="custom-token-display"
  :show-icon="true"
  :show-label="true"
/>

<style>
.custom-token-display {
  /* Your custom styles */
}
</style>
```

---

## 📱 **Mobile Responsiveness**

The components are already responsive, but you can adjust breakpoints:

```css
/* Adjust mobile breakpoint */
@media (max-width: 768px) {
  .header-token-display {
    /* Mobile styles */
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .header-token-display {
    /* Tablet styles */
  }
}
```

---

## 🔗 **Navigation Examples**

### **Programmatic Navigation**

Navigate to tokens page from anywhere in your app:

```typescript
import { useRouter } from 'vue-router'

const router = useRouter()

// Navigate to tokens page
function goToTokens() {
  router.push('/tokens-and-plans')
}

// Navigate with query params
function goToTokensWithTab(tab: string) {
  router.push({
    path: '/tokens-and-plans',
    query: { tab }
  })
}
```

---

### **Router Link**

Use router-link for declarative navigation:

```vue
<router-link to="/tokens-and-plans">
  View Tokens & Plans
</router-link>

<!-- With custom styling -->
<router-link 
  to="/tokens-and-plans" 
  class="btn btn-primary"
  active-class="active"
>
  💎 Manage Tokens
</router-link>
```

---

## ✅ **Integration Checklist**

- [ ] HeaderTokenDisplay added to header
- [ ] Navigation link added to menu
- [ ] Auth system integrated (replace `user_123`)
- [ ] Paystack script added to index.html
- [ ] Environment variables configured
- [ ] Payment server running
- [ ] Frontend dev server running
- [ ] Test token purchase works
- [ ] Test plan upgrade works
- [ ] Header updates in real-time
- [ ] Mobile responsive design verified

---

## 🎉 **You're Done!**

Your token management system is now fully integrated! Users can:

1. ✅ See their token balance in the header
2. ✅ Click to navigate to Tokens & Plans page
3. ✅ Purchase tokens with Paystack
4. ✅ Upgrade to Premium or Pro plans
5. ✅ View their current plan and expiry
6. ✅ Track token usage statistics

---

**Need Help?** Check the documentation:
- `USER_GUIDE_TOKENS_AND_PLANS.md` - User guide
- `TOKEN_MANAGEMENT_README.md` - Complete documentation
- `TOKEN_MANAGEMENT_QUICK_START.md` - Quick start guide

