# 🚀 Real-Time Collaboration - Setup Instructions

## ✅ **Status: COMPLETE & READY TO USE!**

All collaboration features have been implemented and integrated. Follow these steps to start using them.

---

## 📦 **Step 1: Backend Server Setup**

### **Option A: Quick Setup (Recommended)**

1. **Create a new directory for the server:**
```bash
mkdir collaboration-server
cd collaboration-server
```

2. **Initialize npm:**
```bash
npm init -y
```

3. **Install dependencies:**
```bash
npm install express socket.io cors
npm install --save-dev nodemon
```

4. **Copy the server file:**
   - Copy `collaboration-server.js` from your project root to this directory

5. **Update package.json scripts:**
```json
{
  "scripts": {
    "start": "node collaboration-server.js",
    "dev": "nodemon collaboration-server.js"
  }
}
```

6. **Start the server:**
```bash
npm start
```

You should see:
```
🚀 Real-Time Collaboration Server Running!
📡 WebSocket server: http://localhost:3000
```

### **Option B: Use Provided Package File**

1. **Create directory:**
```bash
mkdir collaboration-server
cd collaboration-server
```

2. **Copy files:**
   - Copy `collaboration-server.js` to this directory
   - Copy `collaboration-server-package.json` and rename to `package.json`

3. **Install and run:**
```bash
npm install
npm start
```

---

## 🎨 **Step 2: Frontend is Already Integrated!**

The collaboration features are already integrated into your WhiteboardCanvas component. No additional setup needed!

**What's already done:**
- ✅ Dependencies installed (`socket.io-client`, `uuid`)
- ✅ Components created and imported
- ✅ Collaboration store initialized
- ✅ Remote cursors overlay added
- ✅ Activity feed integrated
- ✅ Comment system ready
- ✅ Cursor tracking enabled

---

## 🧪 **Step 3: Test the Features**

### **Test 1: Single User (No Backend)**

1. **Start your Vue app:**
```bash
npm run dev
```

2. **Open the app:**
```
http://localhost:5173
```

3. **What you'll see:**
   - ✅ UI components render correctly
   - ✅ No errors in console
   - ⚠️ Not connected (no backend)
   - ⚠️ No remote cursors (only you)

### **Test 2: Multiple Users (With Backend)**

1. **Start the backend server** (in separate terminal):
```bash
cd collaboration-server
npm start
```

2. **Start your Vue app:**
```bash
npm run dev
```

3. **Open the app in first browser window:**
```
http://localhost:5173
```

4. **Open the app in second browser window** (or incognito):
```
http://localhost:5173
```

5. **What you'll see:**
   - ✅ Activity feed appears (bottom-right)
   - ✅ "User joined" activity logged
   - ✅ Move mouse → see your cursor on other window
   - ✅ Other user's cursor appears with their name
   - ✅ Real-time synchronization

---

## 🎯 **Step 4: Initialize Collaboration in Your App**

The collaboration is already integrated in WhiteboardCanvas, but if you want to customize the initialization, here's how:

### **Option 1: Auto-Initialize (Recommended)**

Add to your main app component or DesignEditor.vue:

```vue
<script setup>
import { useCollaborationStore } from '@/stores/collaboration'
import { getRandomUserColor } from '@/types/collaboration'
import { onMounted, onUnmounted } from 'vue'

const collaborationStore = useCollaborationStore()

onMounted(async () => {
  try {
    // Connect to WebSocket server
    await collaborationStore.initialize('http://localhost:3000')
    
    // Join project with current user
    const currentUser = {
      id: 'user-' + Date.now(), // Replace with actual user ID from auth
      name: 'Current User',      // Replace with actual user name
      email: 'user@example.com', // Replace with actual email
      color: getRandomUserColor(),
      role: 'owner',             // or 'editor' or 'viewer'
      isOnline: true,
    }
    
    const projectId = 'project-123' // Replace with actual project ID
    collaborationStore.joinProject(projectId, currentUser)
    
    console.log('✅ Collaboration initialized!')
  } catch (error) {
    console.error('❌ Failed to initialize collaboration:', error)
  }
})

onUnmounted(() => {
  collaborationStore.cleanup()
})
</script>
```

### **Option 2: Manual Control**

Add buttons to connect/disconnect:

```vue
<template>
  <div>
    <button v-if="!isConnected" @click="connect">
      Connect to Collaboration
    </button>
    <button v-else @click="disconnect">
      Disconnect
    </button>
  </div>
</template>

<script setup>
import { useCollaborationStore } from '@/stores/collaboration'
import { storeToRefs } from 'pinia'

const collaborationStore = useCollaborationStore()
const { isConnected } = storeToRefs(collaborationStore)

async function connect() {
  await collaborationStore.initialize('http://localhost:3000')
  // ... join project
}

function disconnect() {
  collaborationStore.cleanup()
}
</script>
```

---

## 📋 **Features Checklist**

After setup, you should have:

### **✅ Live Cursor Tracking**
- [ ] Move mouse on canvas
- [ ] See cursor position update in other window
- [ ] Cursor has your name and color
- [ ] Cursor disappears when you leave canvas

### **✅ User Presence**
- [ ] See other users in CollaborationPanel (if added to UI)
- [ ] User avatars with colors
- [ ] Online status indicators
- [ ] Join/leave notifications in activity feed

### **✅ Activity Feed**
- [ ] Activity feed appears in bottom-right
- [ ] Shows "User joined" when someone connects
- [ ] Shows "User left" when someone disconnects
- [ ] Auto-scrolls to latest activity
- [ ] Activity icons and timestamps

### **✅ Comment System**
- [ ] Comment markers can be placed on canvas
- [ ] Comments sync across users
- [ ] Threaded discussions work
- [ ] Resolve/unresolve functionality

---

## 🔧 **Configuration Options**

### **Change Server URL**

For production, update the server URL:

```typescript
// Development
await collaborationStore.initialize('http://localhost:3000')

// Production
await collaborationStore.initialize('https://your-server.com')
```

### **Adjust Cursor Update Rate**

In `src/services/collaboration-socket.ts`:

```typescript
// Default: 60fps (16ms)
private cursorThrottle = 16

// Slower: 30fps (33ms) - better for slow networks
private cursorThrottle = 33

// Faster: 120fps (8ms) - requires good network
private cursorThrottle = 8
```

### **Change Activity Log Size**

In `src/stores/collaboration.ts`:

```typescript
// Default: 100 entries
if (activityLog.value.length > 100) {
  activityLog.value = activityLog.value.slice(0, 100)
}

// More entries: 200
if (activityLog.value.length > 200) {
  activityLog.value = activityLog.value.slice(0, 200)
}
```

---

## 🐛 **Troubleshooting**

### **Problem: "Failed to connect to server"**

**Solutions:**
1. Check backend server is running:
   ```bash
   cd collaboration-server
   npm start
   ```
2. Verify server URL is correct (http://localhost:3000)
3. Check CORS settings in `collaboration-server.js`
4. Look for errors in server terminal

### **Problem: "Users not appearing"**

**Solutions:**
1. Check both windows are connected (look for activity feed)
2. Verify both users joined the same project ID
3. Check browser console for errors
4. Look at server logs for join events

### **Problem: "Cursors not showing"**

**Solutions:**
1. Make sure you're moving mouse ON the canvas
2. Check that `isConnected` is true
3. Verify `canEdit` permission is true
4. Check browser console for WebSocket errors

### **Problem: "High CPU usage"**

**Solutions:**
1. Increase cursor throttle delay (see Configuration)
2. Reduce activity log size
3. Close unused browser windows
4. Check for memory leaks in DevTools

---

## 📊 **Performance Tips**

### **For Better Performance:**

1. **Throttle cursor updates** (already done at 60fps)
2. **Limit activity log entries** (already limited to 100)
3. **Use production build** for deployment
4. **Enable gzip compression** on server
5. **Use CDN** for static assets

### **For Large Teams:**

1. **Increase server resources**
2. **Use Redis** for session storage
3. **Implement rate limiting**
4. **Add load balancing**
5. **Monitor server metrics**

---

## 🎨 **Customization**

### **Change User Colors**

Edit `src/types/collaboration.ts`:

```typescript
export const USER_COLORS = [
  '#ef4444', // Red
  '#10b981', // Green
  '#3b82f6', // Blue
  // Add your custom colors here
]
```

### **Change Activity Icons**

Edit `src/components/collaboration/ActivityFeed.vue`:

```typescript
function getActivityIcon(action: ActivityAction): string {
  const icons: Record<ActivityAction, string> = {
    user_joined: '👋',  // Change to your preferred emoji
    user_left: '👋',
    object_added: '➕',
    // ... customize all icons
  }
  return icons[action] || '📝'
}
```

### **Change Glassmorphism Style**

Edit component styles:

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.15); /* Adjust transparency */
  backdrop-filter: blur(14px);            /* Adjust blur */
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;                    /* Adjust roundness */
}
```

---

## 📚 **Documentation Files**

- **COLLABORATION_README.md** - Complete feature documentation
- **COLLABORATION_FEATURE_IMPLEMENTATION.md** - Technical implementation details
- **COLLABORATION_SUMMARY.md** - Implementation summary
- **COLLABORATION_QUICK_START.md** - Quick start guide
- **SETUP_COLLABORATION.md** - This file

---

## ✅ **Final Checklist**

Before going live:

- [ ] Backend server tested and running
- [ ] Frontend connects successfully
- [ ] Tested with 2+ users
- [ ] All features working (cursors, activity, comments)
- [ ] No console errors
- [ ] Performance is acceptable
- [ ] Server URL configured for production
- [ ] Error handling tested
- [ ] Reconnection logic tested
- [ ] Documentation reviewed

---

## 🎉 **You're All Set!**

Your real-time collaboration system is now fully functional! 

**To start using it:**

1. **Terminal 1:** Start backend server
   ```bash
   cd collaboration-server
   npm start
   ```

2. **Terminal 2:** Start Vue app
   ```bash
   npm run dev
   ```

3. **Open multiple browser windows** and watch the magic happen! ✨

---

**Need help?** Check the documentation files or review the code comments.

**Happy Collaborating! 🚀**

