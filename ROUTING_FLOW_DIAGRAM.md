# 🗺️ Application Routing Flow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER OPENS APPLICATION                       │
│                    http://localhost:8100                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Check Auth Status   │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│ NOT LOGGED IN   │            │  LOGGED IN      │
└────────┬────────┘            └────────┬────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  WELCOME PAGE   │            │   HOME PAGE     │
│      (/)        │            │    (/home)      │
│                 │            │                 │
│ • Logo          │            │ • User Profile  │
│ • Hero Section  │            │ • Dashboard     │
│ • Login Button  │            │ • Projects      │
│ • Register Btn  │            │ • Templates     │
│ • Features      │            │ • Start Project │
└────────┬────────┘            └────────┬────────┘
         │                               │
         │ Click "Login"                 │ Click "Start Project"
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│  LOGIN MODAL    │            │  EDITOR PAGE    │
│                 │            │    (/editor)    │
│ • Email         │            │                 │
│ • Password      │            │ • Canvas        │
│ • Submit        │            │ • Tools         │
└────────┬────────┘            │ • Layers        │
         │                     │ • Export        │
         │ Success             └─────────────────┘
         ▼
┌─────────────────┐
│ SUCCESS NOTIF   │
│ "Welcome back!" │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   HOME PAGE     │
│    (/home)      │
└─────────────────┘
```

---

## Route Protection Logic

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTE NAVIGATION                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  User navigates to   │
              │     any route        │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Router Guard Check  │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│ PUBLIC ROUTE    │            │ PROTECTED ROUTE │
│ (requiresAuth:  │            │ (requiresAuth:  │
│     false)      │            │     true)       │
└────────┬────────┘            └────────┬────────┘
         │                               │
         │                               ▼
         │                    ┌──────────────────────┐
         │                    │  Check if logged in  │
         │                    └──────────┬───────────┘
         │                               │
         │                ┌──────────────┴──────────────┐
         │                │                             │
         │                ▼                             ▼
         │       ┌─────────────────┐         ┌─────────────────┐
         │       │   LOGGED IN     │         │  NOT LOGGED IN  │
         │       └────────┬────────┘         └────────┬────────┘
         │                │                            │
         │                │                            ▼
         │                │                 ┌──────────────────────┐
         │                │                 │ Save intended route  │
         │                │                 │ to sessionStorage    │
         │                │                 └──────────┬───────────┘
         │                │                            │
         │                │                            ▼
         │                │                 ┌──────────────────────┐
         │                │                 │ Redirect to /welcome │
         │                │                 └──────────────────────┘
         │                │
         ▼                ▼
┌─────────────────────────────┐
│    ALLOW NAVIGATION         │
└─────────────────────────────┘
```

---

## Authentication State Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  User clicks Login   │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  Login Modal Opens   │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ User enters creds    │
              │ and submits          │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │ Firebase Auth        │
              └──────────┬───────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│    SUCCESS      │            │     FAILURE     │
└────────┬────────┘            └────────┬────────┘
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌─────────────────┐
│ Update Auth     │            │ Show Error      │
│ Store           │            │ Message         │
└────────┬────────┘            └─────────────────┘
         │
         ▼
┌─────────────────┐
│ Close Modal     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show Success    │
│ Notification    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check for       │
│ Intended Route  │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│ Found  │ │Not Found│
└───┬────┘ └───┬────┘
    │          │
    ▼          ▼
┌────────┐ ┌────────┐
│Redirect│ │Redirect│
│to that │ │to /home│
│route   │ │        │
└────────┘ └────────┘
```

---

## Route Table

| Route | Component | Auth Required | Description |
|-------|-----------|---------------|-------------|
| `/` | WelcomePage | ❌ No | Landing page for new visitors |
| `/home` | HomePage | ✅ Yes | Main dashboard after login |
| `/editor` | DesignEditor | ✅ Yes | Design tool/canvas |
| `/admin` | AdminDashboard | ✅ Yes + Admin | Admin panel |
| `/admin/users` | UserManagement | ✅ Yes + Admin | User management |
| `/admin/templates` | TemplateManagement | ✅ Yes + Admin | Template management |

---

## Redirect Rules

### **Rule 1: Authenticated User → Welcome Page**
```
IF user is logged in
AND navigates to /
THEN redirect to /home
```

### **Rule 2: Unauthenticated User → Protected Route**
```
IF user is NOT logged in
AND navigates to protected route (e.g., /home, /editor)
THEN save intended route
AND redirect to /
```

### **Rule 3: After Login**
```
IF login successful
AND intended route exists
THEN redirect to intended route
ELSE redirect to /home
```

### **Rule 4: After Registration**
```
IF registration successful
THEN redirect to /home
```

---

## Session Storage Usage

```javascript
// When user tries to access protected route while not logged in
sessionStorage.setItem('intendedRoute', '/editor')

// After successful login
const intendedRoute = sessionStorage.getItem('intendedRoute')
if (intendedRoute) {
  window.location.href = intendedRoute
  sessionStorage.removeItem('intendedRoute')
} else {
  window.location.href = '/home'
}
```

---

## Example Scenarios

### **Scenario A: First-Time Visitor**
```
1. Visit http://localhost:8100
2. See Welcome Page (/)
3. Click "Login to Get Started"
4. Login modal appears
5. Enter credentials
6. Success → Redirect to /home
7. Click "Start Your Project"
8. Navigate to /editor
```

### **Scenario B: Returning User**
```
1. Visit http://localhost:8100
2. App detects user is logged in
3. Auto-redirect to /home
4. User continues working
```

### **Scenario C: Direct Link to Editor**
```
1. User (not logged in) visits http://localhost:8100/editor
2. Router detects auth required
3. Saves '/editor' to sessionStorage
4. Redirects to /
5. User clicks "Login"
6. After login → Redirects to /editor
```

### **Scenario D: Logout**
```
1. User clicks logout
2. Auth state cleared
3. Redirect to /
4. User sees Welcome Page
```

---

## Code References

### **Router Guard (src/router/index.ts)**
```typescript
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  // Authenticated user trying to access welcome page
  if (to.name === 'welcome' && authStore.isAuthenticated) {
    next({ name: 'home' })
    return
  }

  // Unauthenticated user trying to access protected route
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    sessionStorage.setItem('intendedRoute', to.fullPath)
    next({ name: 'welcome' })
    return
  }

  next()
})
```

### **Login Redirect (src/stores/auth.ts)**
```typescript
const intendedRoute = sessionStorage.getItem('intendedRoute')
if (intendedRoute) {
  sessionStorage.removeItem('intendedRoute')
  window.location.href = intendedRoute
} else {
  window.location.href = '/home'
}
```

---

## 🎉 Summary

The routing system now provides:
- ✅ Clear entry point (Welcome Page)
- ✅ Protected routes with authentication
- ✅ Automatic redirects based on auth state
- ✅ Intended route preservation
- ✅ Smooth user experience
- ✅ Logical navigation flow

**Everything is working as designed! 🚀**

