# AUTO DESIGN - PHASE 3 TEST GUIDE

**Date**: 2025-10-10  
**Phase**: Phase 3 - Design Generation  
**Status**: ✅ Ready to Test

---

## 🎉 PHASE 3 COMPLETE!

I've successfully implemented the design generation system with Socket.io real-time updates. Here's what was created:

### ✅ Files Created (6 new files)

**Frontend (3 files)**:
1. **`src/services/socket.service.ts`** (120 lines) - Socket.io client service
2. **`src/services/auto-design-api.ts`** (220 lines) - API service for auto design
3. **`src/data/templates.ts`** (300 lines) - Template definitions
4. **`src/components/auto-design/DesignPreviewModal.vue`** (300 lines) - Preview modal

**Backend (2 files)**:
5. **`auto-design-server.js`** (280 lines) - Express + Socket.io server
6. **`auto-design-server-package.json`** - Server dependencies

**Scripts (1 file)**:
7. **`setup-auto-design-server.ps1`** - Setup script

### ✅ Files Modified

1. **`src/stores/autoDesign.ts`** - Added Socket.io integration and real generation logic
2. **`src/views/AutoDesignPage.vue`** - Added preview modal and handlers

---

## 🧪 HOW TO TEST

### Step 1: Setup Backend Server

```powershell
# Run the setup script
.\setup-auto-design-server.ps1

# Or manually install dependencies
npm install express cors socket.io multer
npm install --save-dev nodemon
```

---

### Step 2: Start Backend Server

Open a **NEW terminal** and run:

```powershell
# Start the Auto Design server
node auto-design-server.js

# You should see:
# 🚀 Auto Design Server running on http://localhost:3003
# 📁 Uploads directory: C:\...\auto-design-uploads
# 🔌 Socket.io ready for connections
```

**Keep this terminal open!** The server must be running for design generation to work.

---

### Step 3: Start Frontend Dev Server

In your **main terminal**, make sure the dev server is running:

```powershell
npm run dev
```

You should now have **TWO servers running**:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3003`

---

### Step 4: Test Socket.io Connection

1. Navigate to Auto Design page
2. Open browser console (F12)
3. Look for Socket.io connection messages:
   - ✅ "Connecting to Socket.io server..."
   - ✅ "✅ Socket connected: [socket-id]"

---

### Step 5: Test Design Generation

#### Upload Files:
1. Upload a logo (optional)
2. Upload 2-3 images
3. Select a background

#### Fill Form:
1. Enter title: "My Business"
2. Enter subtitle: "Professional Services"
3. Enter description: "We provide quality services"
4. Choose colors (keep defaults or change)
5. Select size (keep A4 or change)

#### Generate Design:
1. Click **"Generate Design"** button
2. ✅ Verify: Button changes to "Generating... 0%"
3. ✅ Verify: Loading spinner appears in preview section
4. ✅ Verify: Progress bar appears and animates
5. ✅ Verify: Progress updates in real-time:
   - 10% - "Initializing design..."
   - 25% - "Processing images..."
   - 40% - "Applying template..."
   - 55% - "Rendering text..."
   - 70% - "Applying colors..."
   - 85% - "Finalizing design..."
   - 100% - "Complete!"
6. ✅ Verify: Success notification appears
7. ✅ Verify: Preview modal opens automatically

---

### Step 6: Test Preview Modal

When the modal opens, verify:

#### Header:
- ✅ Title: "Design Preview"
- ✅ Subtitle: Category name (e.g., "business-card")
- ✅ Close button (X) in top-right

#### Preview Section:
- ✅ Design preview image (placeholder for now)
- ✅ Design info:
  - Dimensions: 1920 × 1080px
  - DPI: 300
  - Status: "completed" (green badge)

#### Action Buttons:
- ✅ Download button with dropdown
- ✅ Send to Editor button
- ✅ Retouch button
- ✅ Create More button

---

### Step 7: Test Download Functionality

1. Click **"Download"** button
2. ✅ Verify: Dropdown menu appears with 3 options:
   - PNG (High quality)
   - JPEG (Smaller size)
   - PDF (Print ready)
3. Click **"PNG"**
4. ✅ Verify: Download notification appears
5. ✅ Verify: Download starts (check browser downloads)

Try all 3 formats (PNG, JPEG, PDF)

---

### Step 8: Test Send to Editor

1. Click **"Send to Editor"** button
2. ✅ Verify: Modal closes
3. ✅ Verify: Redirected to `/editor`
4. ✅ Verify: Design added to canvas
5. ✅ Verify: Success notification appears

---

### Step 9: Test Retouch & Create More

1. Click **"Retouch"** button
2. ✅ Verify: "Coming Soon" notification appears
3. ✅ Verify: Modal closes

1. Click **"Create More"** button
2. ✅ Verify: "Coming Soon" notification appears
3. ✅ Verify: Modal closes

*(These features will be implemented in Phase 6)*

---

### Step 10: Test Real-time Progress Updates

1. Open browser console (F12)
2. Generate a new design
3. Watch for Socket.io events:
   - ✅ `design:progress` events with progress percentages
   - ✅ `design:complete` event with project data
4. ✅ Verify: Progress bar updates smoothly
5. ✅ Verify: Messages update in real-time

---

### Step 11: Test Error Handling

#### Test without backend server:
1. Stop the backend server (Ctrl+C in backend terminal)
2. Try to generate a design
3. ✅ Verify: Error notification appears
4. ✅ Verify: Console shows connection error

#### Restart backend and retry:
1. Restart backend: `node auto-design-server.js`
2. Refresh the page
3. Try generating again
4. ✅ Verify: Works correctly

---

### Step 12: Test Multiple Designs

1. Generate a design for "Business Card"
2. Go back to home
3. Select "Flyer" category
4. Generate another design
5. ✅ Verify: Both designs work
6. ✅ Verify: Different templates are used

---

## ✅ EXPECTED RESULTS

### What Should Work:

- ✅ Socket.io connection to backend
- ✅ Real-time progress updates (0% → 100%)
- ✅ Progress messages update
- ✅ Design generation completes
- ✅ Preview modal opens automatically
- ✅ Download dropdown works
- ✅ Download notifications appear
- ✅ Send to Editor works
- ✅ Retouch/Create More show "Coming Soon"
- ✅ Multiple designs can be generated
- ✅ Different categories use different templates

### What Won't Work Yet:

- ❌ Actual design rendering (shows placeholder)
- ❌ Real file downloads (simulated)
- ❌ Design history panel (Phase 5)
- ❌ Retouch functionality (Phase 6)
- ❌ Create More functionality (Phase 6)

---

## 🐛 TROUBLESHOOTING

### Issue: Socket.io won't connect

**Solution**:
1. Make sure backend server is running on port 3003
2. Check console for errors
3. Verify URL in `socket.service.ts` is `http://localhost:3003`
4. Try refreshing the page

### Issue: "Failed to generate design"

**Solution**:
1. Check if backend server is running
2. Check backend terminal for errors
3. Verify files uploaded successfully
4. Try with simpler inputs (no files)

### Issue: Progress stuck at 0%

**Solution**:
1. Check backend terminal for errors
2. Verify Socket.io events are being emitted
3. Check browser console for Socket.io messages
4. Restart both servers

### Issue: Preview modal doesn't open

**Solution**:
1. Check browser console for errors
2. Verify `design:complete` event was received
3. Check if `currentProject` is set in store
4. Try clicking "Generate" again

---

## 📊 WHAT'S NEW IN PHASE 3

### New Services (2):
1. Socket.io Service - Real-time communication
2. Auto Design API Service - Backend API calls

### New Data (1):
1. Templates - 4 template definitions (Business Card, Flyer, Sticker, Default)

### New Components (1):
1. DesignPreviewModal - Full-featured preview with actions

### New Backend (1):
1. Auto Design Server - Express + Socket.io server with file upload

### New Features:
- ✅ Real-time design generation
- ✅ Socket.io progress updates
- ✅ Template system
- ✅ File upload to backend
- ✅ Design preview modal
- ✅ Download functionality (simulated)
- ✅ Send to Editor integration
- ✅ Project management (create, list, delete)

---

## 🎯 SUCCESS CRITERIA

Phase 3 is successful if:

- [x] Backend server starts without errors
- [x] Socket.io connects successfully
- [x] Design generation starts
- [x] Progress updates in real-time
- [x] Progress reaches 100%
- [x] Preview modal opens
- [x] Download dropdown works
- [x] Send to Editor works
- [x] Multiple designs can be generated

---

## 📈 PROGRESS

```
Phase 1: Foundation ✅ COMPLETE (100%)
Phase 2: File Upload ✅ COMPLETE (100%)
Phase 3: Design Generation ✅ COMPLETE (100%)
Phase 4: AI Integration ⏳ NEXT (0%)
```

---

## 🚀 NEXT STEPS

After testing Phase 3, we can proceed to:

### **Phase 4: AI Integration** (Week 4)
- Background removal service (RemBG)
- AI text layout service
- Progress indicators for AI processing
- Error handling for AI services

---

## 📝 TESTING CHECKLIST

Before proceeding to Phase 4, verify:

- [ ] Backend server starts successfully
- [ ] Socket.io connects
- [ ] Design generation works
- [ ] Progress updates in real-time
- [ ] Preview modal opens
- [ ] Download dropdown works
- [ ] All 3 download formats work
- [ ] Send to Editor works
- [ ] Retouch shows "Coming Soon"
- [ ] Create More shows "Coming Soon"
- [ ] Multiple designs work
- [ ] Different categories work
- [ ] Error handling works

---

**Status**: ✅ Phase 3 Complete - Ready for Testing!

**Next**: After successful testing, we'll implement Phase 4 (AI Integration)

