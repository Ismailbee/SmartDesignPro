# 🚀 Export & Share Feature - Quick Start Guide

## ⚡ Get Started in 3 Minutes!

---

## 📋 Prerequisites

- Node.js installed (v16+)
- Project already running (`npm run dev`)
- Basic understanding of the whiteboard canvas

---

## 🎯 Quick Setup

### Step 1: Install Backend Dependencies (30 seconds)

```bash
# In your project root
npm install express cors multer uuid
```

### Step 2: Start Export Server (10 seconds)

```bash
# In a new terminal window
node export-server.js
```

You should see:
```
🚀 Export & Share Server running on http://localhost:3001
📊 Health check: http://localhost:3001/health
```

### Step 3: Start Frontend (if not already running)

```bash
npm run dev
```

---

## 🎨 Using the Export Feature

### Quick Export (2 clicks)

1. **Click** "Export & Share" button in toolbar
2. **Click** "Export Now" (uses default settings)
3. **Done!** File downloads automatically

### Custom Export (5 clicks)

1. Click "Export & Share" button
2. Select format (PNG, JPEG, PDF, SVG)
3. Choose resolution (Low, Medium, High)
4. Adjust background (Canvas, Transparent, Solid)
5. Click "Export Now"

---

## 🔗 Using the Share Feature

### Generate Share Link (3 clicks)

1. Export your design first
2. Open Share Panel
3. Click "Generate Link"
4. Click "Copy" to copy link

### Share to Social Media (2 clicks)

1. Open Share Panel
2. Click social platform button (Facebook, Twitter, etc.)

### Send via Email (3 steps)

1. Open Share Panel
2. Enter recipient email
3. Click "Send Email"

---

## 🎯 Common Use Cases

### Use Case 1: Quick PNG Export for Social Media

```
1. Click "Export & Share"
2. Select "PNG"
3. Select "Low (Web)" resolution
4. Click "Export Now"
```

**Result:** Optimized PNG for social media (72 DPI, ~500KB)

### Use Case 2: High-Quality Print Export

```
1. Click "Export & Share"
2. Select "PDF"
3. Select "High (Print)" resolution
4. Enable "Include bleed/crop marks"
5. Click "Export Now"
```

**Result:** Print-ready PDF (300 DPI, professional quality)

### Use Case 3: Share with View-Only Access

```
1. Export your design
2. Open Share Panel
3. Select "View Only" permission
4. Set expiration to "7 Days"
5. Click "Generate Link"
6. Copy and share link
```

**Result:** Secure link that expires in 7 days, view-only access

### Use Case 4: Password-Protected Share

```
1. Open Share Panel
2. Check "Password protect link"
3. Enter password
4. Click "Generate Link"
5. Share link + password separately
```

**Result:** Secure, password-protected share link

---

## 🔧 Troubleshooting

### Export Panel Won't Open

**Problem:** Clicking button does nothing

**Solution:**
```bash
# Check browser console for errors
# Verify ExportPanel.vue is imported correctly
# Check if showExportPanel state is defined
```

### Export Server Not Running

**Problem:** "Failed to connect" error

**Solution:**
```bash
# Check if server is running
node export-server.js

# Check port 3001 is not in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Mac/Linux
```

### File Not Downloading

**Problem:** Export completes but no download

**Solution:**
```bash
# Check browser download settings
# Check browser console for errors
# Verify export server is responding
curl http://localhost:3001/health
```

### Share Link Not Working

**Problem:** Generated link returns 404

**Solution:**
```bash
# Verify export server is running
# Check share link is active
# Verify link hasn't expired
```

---

## 📊 Feature Matrix

| Feature | Status | How to Use |
|---------|--------|------------|
| PNG Export | ✅ | Select PNG format |
| JPEG Export | ✅ | Select JPEG format |
| PDF Export | ✅ | Select PDF format |
| SVG Export | ✅ | Select SVG format |
| Resolution Presets | ✅ | Choose Low/Medium/High |
| Custom Dimensions | ✅ | Select "Custom" resolution |
| Transparent Background | ✅ | Select "Transparent" (PNG only) |
| Quality Control | ✅ | Adjust slider (JPEG) |
| Share Links | ✅ | Click "Generate Link" |
| Social Sharing | ✅ | Click platform button |
| Email Sharing | ✅ | Enter email, click send |
| Password Protection | ✅ | Check "Password protect" |
| Link Expiration | ✅ | Select expiration option |
| Analytics | ✅ | View in active links |

---

## 🎨 UI Overview

### Export Panel

```
┌─────────────────────────────────────┐
│  Export Design                   ✕  │
├─────────────────────────────────────┤
│                                     │
│  File Format                        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │PNG │ │JPEG│ │PDF │ │SVG │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  Resolution                         │
│  [Low] [Medium] [High] [Custom]    │
│                                     │
│  Background                         │
│  ○ Canvas  ○ Transparent  ● Solid  │
│  [Color Picker: #ffffff]           │
│                                     │
│  Quality: 90%                       │
│  [━━━━━━━━━━━━━━━━━━━━━━━━━━━━━] │
│                                     │
│  Estimated size: 2.4 MB            │
│  Dimensions: 1920 × 1080 px        │
│                                     │
├─────────────────────────────────────┤
│  [Cancel]  [Export Now]            │
└─────────────────────────────────────┘
```

### Share Panel

```
┌─────────────────────────────────────┐
│  Share Design                    ✕  │
├─────────────────────────────────────┤
│                                     │
│  Share to Social Media              │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │ f  │ │ t  │ │ in │ │ wa │      │
│  └────┘ └────┘ └────┘ └────┘      │
│                                     │
│  Get Shareable Link                 │
│  Permission: [View Only ▼]         │
│  Expiration: [7 Days ▼]            │
│  ☑ Password protect link           │
│  [Generate Link]                    │
│                                     │
│  Generated Link:                    │
│  [http://localhost:5173/shared/...] │
│  [Copy]                             │
│                                     │
│  📊 42 views  📥 12 downloads      │
│                                     │
│  Share via Email                    │
│  [recipient@example.com]           │
│  [Optional message...]             │
│  [Send Email]                       │
│                                     │
├─────────────────────────────────────┤
│  [Close]                            │
└─────────────────────────────────────┘
```

---

## 💡 Pro Tips

### Tip 1: Keyboard Shortcuts (Future)
```
Ctrl/Cmd + E  - Open Export Panel
Ctrl/Cmd + S  - Quick Save
Ctrl/Cmd + Shift + E  - Export with last settings
```

### Tip 2: Batch Export (Future)
```
Select multiple projects
Click "Export All"
Choose format and settings
All projects export to ZIP
```

### Tip 3: Export Presets (Future)
```
Save your favorite export settings
Name them (e.g., "Instagram Post", "Print Flyer")
One-click export with saved presets
```

### Tip 4: Share Link Management
```
View all active links in Share Panel
Track views and downloads
Revoke links when no longer needed
Set expiration dates for automatic cleanup
```

---

## 📞 Support

### Need Help?

1. **Check Documentation:** `EXPORT_SHARE_IMPLEMENTATION.md`
2. **Check API Docs:** `EXPORT_SHARE_API.md` (if created)
3. **Check Console:** Browser DevTools → Console
4. **Check Server Logs:** Terminal running export-server.js

### Common Questions

**Q: Can I export multiple formats at once?**
A: Not yet, but planned for Phase 3

**Q: Where are exported files stored?**
A: Currently in `exports/` folder, will move to cloud storage

**Q: Can I customize the share link URL?**
A: Not yet, but custom domains planned for Phase 3

**Q: Is there a file size limit?**
A: Yes, 50MB for uploads, no limit for exports

**Q: Can I share without exporting first?**
A: No, you must export before sharing

---

## 🎉 You're Ready!

You now have a fully functional export and sharing system!

**Next Steps:**
1. Try exporting a design
2. Generate a share link
3. Share on social media
4. Send via email
5. Explore advanced options

**Happy Exporting! 🚀**

