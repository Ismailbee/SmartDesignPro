# Real-Time Collaboration - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly test the collaboration features that have been implemented.

---

## Step 1: View the Demo

The easiest way to see the collaboration features is to use the demo application.

### Option A: Add Demo Route (Recommended)

1. **Add route to your router** (if you have one):

```typescript
// src/router/index.ts
import CollaborationDemo from '@/examples/CollaborationDemo.vue'

const routes = [
  // ... your existing routes
  {
    path: '/collaboration-demo',
    name: 'CollaborationDemo',
    component: CollaborationDemo
  }
]
```

2. **Navigate to** `http://localhost:5173/collaboration-demo`

### Option B: Import Directly

Add to your main app component:

```vue
<template>
  <div>
    <!-- Your existing app -->
    
    <!-- Collaboration Demo -->
    <CollaborationDemo />
  </div>
</template>

<script setup>
import CollaborationDemo from '@/examples/CollaborationDemo.vue'
</script>
```

---

## Step 2: Test Without Backend (UI Only)

You can test the UI components without a backend server:

1. **Open the demo page**
2. **Try to connect** - it will fail gracefully
3. **Explore the UI**:
   - See the connection status
   - View the form controls
   - Check out the glassmorphic design

---

## Step 3: Set Up Backend Server (Optional)

To test real-time features, you need a WebSocket server.

### Quick Backend Setup:

1. **Create a new directory** for the server:
```bash
mkdir collaboration-server
cd collaboration-server
npm init -y
```

2. **Install dependencies**:
```bash
npm install express socket.io cors
```

3. **Create `server.js`**:

```javascript
const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
})

// Store active users per project
const projectRooms = new Map()

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id)
  
  // Join project
  socket.on('project:join', (payload) => {
    console.log('📍 User joining project:', payload.projectId, payload.userName)
    socket.join(payload.projectId)
    
    // Add user to room
    if (!projectRooms.has(payload.projectId)) {
      projectRooms.set(payload.projectId, [])
    }
    const room = projectRooms.get(payload.projectId)
    room.push({
      id: payload.userId,
      name: payload.userName,
      color: payload.color,
      role: payload.role,
      isOnline: true
    })
    
    // Broadcast to others in room
    socket.to(payload.projectId).emit('user:join', payload)
    
    // Send current users list to new user
    socket.emit('user:list', room)
  })
  
  // Leave project
  socket.on('project:leave', (payload) => {
    console.log('📍 User leaving project:', payload.projectId, payload.userName)
    socket.leave(payload.projectId)
    socket.to(payload.projectId).emit('user:leave', payload)
    
    // Remove user from room
    if (projectRooms.has(payload.projectId)) {
      const room = projectRooms.get(payload.projectId)
      const index = room.findIndex(u => u.id === payload.userId)
      if (index !== -1) {
        room.splice(index, 1)
      }
    }
  })
  
  // Canvas updates
  socket.on('canvas:update', (payload) => {
    console.log('📝 Canvas update:', payload.updateType, payload.objectType)
    socket.to(payload.projectId).emit('canvas:update', payload)
  })
  
  // Cursor tracking
  socket.on('cursor:move', (payload) => {
    socket.to(payload.projectId).emit('cursor:move', payload)
  })
  
  socket.on('cursor:hide', (data) => {
    socket.to(data.projectId).emit('cursor:hide', data)
  })
  
  // Comments
  socket.on('comment:add', (payload) => {
    console.log('💬 Comment added')
    io.to(payload.projectId).emit('comment:add', payload)
  })
  
  socket.on('comment:resolve', (payload) => {
    console.log('✅ Comment resolved')
    io.to(payload.projectId).emit('comment:resolve', payload)
  })
  
  // Disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id)
  })
})

const PORT = 3000
server.listen(PORT, () => {
  console.log(`🚀 WebSocket server running on http://localhost:${PORT}`)
})
```

4. **Start the server**:
```bash
node server.js
```

You should see: `🚀 WebSocket server running on http://localhost:3000`

---

## Step 4: Test Real-Time Features

Now with the backend running:

1. **Open your app** in the first browser window
2. **Navigate to the demo page**
3. **Click "Connect to Server"** - should show "Connected"
4. **Enter project details**:
   - Project ID: `demo-project-123`
   - Your Name: `Alice`
   - Role: `Owner`
5. **Click "Join Project"**

6. **Open a second browser window** (or incognito mode)
7. **Repeat steps 2-5** with different name: `Bob`

8. **Test features**:
   - ✅ See both users in the "Active Users" list
   - ✅ Move mouse in the cursor demo area
   - ✅ See the other user's cursor in real-time
   - ✅ Check the activity log for join events

---

## Step 5: Integrate with Your App

Once you've tested the demo, integrate collaboration into your main app:

### Add to WhiteboardCanvas.vue:

```vue
<template>
  <div class="whiteboard-canvas">
    <!-- Your existing canvas -->
    
    <!-- Remote Cursors Overlay -->
    <div class="remote-cursors-overlay">
      <RemoteCursor
        v-for="cursor in remoteCursorsList"
        :key="cursor.userId"
        :cursor="cursor"
      />
    </div>
  </div>
</template>

<script setup>
import { useCollaborationStore } from '@/stores/collaboration'
import { storeToRefs } from 'pinia'
import RemoteCursor from '@/components/collaboration/RemoteCursor.vue'

const collaborationStore = useCollaborationStore()
const { remoteCursorsList } = storeToRefs(collaborationStore)

// Track cursor on mouse move
function handleMouseMove(e) {
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  collaborationStore.updateCursorPosition(x, y)
}

// Hide cursor when leaving canvas
function handleMouseLeave() {
  collaborationStore.hideCursor()
}
</script>

<style scoped>
.remote-cursors-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1000;
}
</style>
```

### Add CollaborationPanel to DesignEditor.vue:

```vue
<template>
  <div class="design-editor">
    <!-- Your existing UI -->
    
    <!-- Collaboration Panel (Right Sidebar) -->
    <div class="collaboration-sidebar">
      <CollaborationPanel />
    </div>
  </div>
</template>

<script setup>
import CollaborationPanel from '@/components/collaboration/CollaborationPanel.vue'
</script>

<style scoped>
.collaboration-sidebar {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 100;
}
</style>
```

### Initialize on App Mount:

```typescript
// In your main app component or DesignEditor.vue
import { useCollaborationStore } from '@/stores/collaboration'
import { getRandomUserColor } from '@/types/collaboration'
import { onMounted, onUnmounted } from 'vue'

const collaborationStore = useCollaborationStore()

onMounted(async () => {
  // Initialize collaboration
  await collaborationStore.initialize('http://localhost:3000')
  
  // Join project (use actual user data from your auth system)
  const currentUser = {
    id: 'user-' + Date.now(), // Replace with actual user ID
    name: 'Current User', // Replace with actual user name
    email: 'user@example.com', // Replace with actual email
    color: getRandomUserColor(),
    role: 'owner', // Replace with actual role
    isOnline: true,
  }
  
  const projectId = 'project-123' // Replace with actual project ID
  collaborationStore.joinProject(projectId, currentUser)
})

onUnmounted(() => {
  collaborationStore.cleanup()
})
```

---

## 📋 Checklist

- [ ] Dependencies installed (`socket.io-client`, `uuid`)
- [ ] Demo page accessible
- [ ] Backend server created (optional)
- [ ] Backend server running on port 3000
- [ ] Can connect to server from demo
- [ ] Can join project from demo
- [ ] Can see multiple users in different windows
- [ ] Cursor tracking works
- [ ] Activity log shows events
- [ ] CollaborationPanel integrated in main app
- [ ] RemoteCursor component added to canvas

---

## 🐛 Troubleshooting

### "Failed to connect" error
- Make sure backend server is running: `node server.js`
- Check server is on port 3000
- Verify CORS settings in server.js

### Users not appearing
- Check browser console for errors
- Verify both windows joined the same project ID
- Check server logs for connection events

### Cursors not showing
- Make sure you're moving mouse in the cursor demo area
- Check that both users are in the same project
- Verify WebSocket connection is active

### TypeScript errors
- Run `npm run type-check` to see errors
- Make sure all imports are correct
- Check that types are imported properly

---

## 📚 Next Steps

1. ✅ Test the demo
2. ✅ Set up backend server
3. ✅ Test with multiple windows
4. ⏳ Integrate with WhiteboardCanvas
5. ⏳ Create CommentSystem component
6. ⏳ Create ActivityFeed component
7. ⏳ Implement REST API for collaborator management
8. ⏳ Add email invitation system

---

## 🎯 Quick Commands

```bash
# Install dependencies
npm install socket.io-client uuid

# Type check
npm run type-check

# Run dev server
npm run dev

# Run backend server (in separate terminal)
cd collaboration-server
node server.js
```

---

## 📞 Support

If you encounter issues:
1. Check the full documentation: `COLLABORATION_FEATURE_IMPLEMENTATION.md`
2. Review the demo code: `src/examples/CollaborationDemo.vue`
3. Check type definitions: `src/types/collaboration.ts`

---

**Happy Collaborating! 🎉**

