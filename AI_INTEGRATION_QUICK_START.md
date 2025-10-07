# 🚀 AI Integration - Quick Start Guide

## ⚡ Get Started in 3 Minutes

### Step 1: Install Backend Dependencies (30 seconds)

```bash
npm install express cors multer uuid qrcode
```

### Step 2: Start Backend Server (10 seconds)

```bash
node ai-server.js
```

You should see:
```
🚀 AI Integration Server running on http://localhost:3002
📊 Health check: http://localhost:3002/health
```

### Step 3: Start Frontend (10 seconds)

```bash
npm run dev
```

### Step 4: Open AI Panel (5 seconds)

**Option A:** Click the purple "AI Assistant" button in the toolbar

**Option B:** Press `Ctrl + K` (or `Cmd + K` on Mac)

---

## 🎯 Try These Examples

### Example 1: Generate a Headline (30 seconds)

1. Open AI Panel → **Text** tab
2. Enter: `"Coffee shop grand opening"`
3. Type: **Headline**
4. Tone: **Playful**
5. Click **Generate Text**
6. Click **Use** on your favorite result

### Example 2: Create an AI Image (1 minute)

1. Open AI Panel → **Images** tab
2. Enter: `"A cozy coffee shop interior with warm lighting"`
3. Style: **Realistic Photo**
4. Resolution: **Medium**
5. Click **Generate Image**
6. Wait for generation
7. Click **Use** to add to canvas

### Example 3: Remove Background (30 seconds)

1. Open AI Panel → **BG Remove** tab
2. Upload an image (drag & drop or click)
3. Output Type: **Transparent**
4. Click **Remove Background**
5. Click **Use** or **Download**

### Example 4: Generate QR Code (30 seconds)

1. Open AI Panel → **QR Code** tab
2. Type: **Website URL**
3. Enter: `https://your-website.com`
4. Size: **Medium**
5. Customize colors if desired
6. Click **Generate QR Code**
7. Click **Use** to add to canvas

---

## 🎨 Quick Tips

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Open/Close AI Panel
- `Esc` - Close AI Panel

### Best Practices

**Text Generation:**
- Be specific in your prompts
- Try different tones for variety
- Use the language selector for multilingual content

**Image Generation:**
- Add details to your prompt (lighting, mood, style)
- Use negative prompts to avoid unwanted elements
- Start with Medium resolution, upgrade to High if needed

**Background Removal:**
- Use high-contrast images for best results
- Try edge refinement if edges look rough
- Use feathering for softer edges

**QR Codes:**
- Test QR codes before printing
- Use High error correction for logos
- Keep foreground/background contrast high

---

## 📊 Usage Statistics

View your AI usage in the panel footer:
- ✍️ Text generations
- 🖼️ Image generations
- 🎨 Background removals
- 🔲 QR codes generated
- 💰 Total cost

---

## 🐛 Quick Troubleshooting

### Panel won't open?
- Check browser console for errors
- Try refreshing the page
- Verify backend server is running

### Backend server error?
```bash
# Check if port is in use
netstat -ano | findstr :3002

# Restart server
node ai-server.js
```

### Upload fails?
- Check file size (max 10MB)
- Verify file type (JPEG, PNG, GIF, WebP)
- Check server logs

---

## 🔗 Useful Links

- [Full Implementation Guide](./AI_INTEGRATION_IMPLEMENTATION.md)
- [API Documentation](./AI_INTEGRATION_IMPLEMENTATION.md#api-integration)
- [Customization Guide](./AI_INTEGRATION_IMPLEMENTATION.md#customization)

---

## 🎉 You're Ready!

Start creating amazing content with AI! 🚀

**Need help?** Check the full implementation guide or open an issue.

