# 🤖 AI Integration Feature - Complete Implementation Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features Implemented](#features-implemented)
3. [Architecture](#architecture)
4. [Installation & Setup](#installation--setup)
5. [API Integration](#api-integration)
6. [Usage Guide](#usage-guide)
7. [Customization](#customization)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The AI Integration feature adds powerful AI capabilities to your design editor, including:

- **Text Generation**: AI-powered copywriting with tone control
- **Image Generation**: Text-to-image with style presets
- **Background Removal**: One-click background removal
- **QR Code Generation**: Customizable QR codes with styling

All features are accessible through a beautiful glassmorphic sidebar panel with keyboard shortcut support (`Ctrl/Cmd + K`).

---

## ✅ Features Implemented

### 1. AI Text Assistant ✍️

**Capabilities:**
- Generate marketing copy (headlines, captions, descriptions, ad copy, social posts)
- 6 tone options: Friendly, Professional, Playful, Formal, Casual, Persuasive
- 10+ language support
- 3 length options: Short, Medium, Long
- Text rewriting and translation

**UI Components:**
- Prompt input with character limit
- Tone selector dropdown
- Language selector with flags
- Length selector
- Results grid with copy/use/delete actions

### 2. AI Image Generator 🖼️

**Capabilities:**
- Text-to-image generation
- 10 style presets (Illustration, Realistic, 3D Render, Vector, Watercolor, Oil Painting, Sketch, Anime, Cyberpunk, Retro)
- 4 resolution presets (Low 512px, Medium 1024px, High 2048px, Custom)
- Advanced options: Guidance scale, steps, seed, batch size
- Negative prompts support

**UI Components:**
- Prompt and negative prompt inputs
- Style preset grid with icons
- Resolution tabs
- Custom dimensions inputs
- Advanced options (collapsible)
- Cost estimation display

### 3. Background Removal 🎨

**Capabilities:**
- One-click background removal
- 4 output types: Transparent, Solid Color, Blur, AI-Generated Background
- Edge refinement controls
- Feathering options
- Before/after comparison

**UI Components:**
- Drag-and-drop image upload
- Output type selector grid
- Color picker for solid backgrounds
- Blur amount slider
- AI background prompt input
- Advanced edge refinement controls

### 4. QR Code Generator 🔲

**Capabilities:**
- 8 QR code types: URL, Text, Email, Phone, SMS, WiFi, vCard, Event
- 4 size presets: Small (256px), Medium (512px), Large (1024px), Print (2048px)
- Customizable colors (foreground/background)
- 4 dot styles: Square, Rounded, Circular, Diamond
- 3 corner styles: Square, Rounded, Extra-rounded
- 4 error correction levels: L, M, Q, H
- Optional logo upload

**UI Components:**
- Type selector dropdown
- Dynamic data input based on type
- Size preset grid
- Color pickers
- Style selectors
- Logo upload
- QR code preview

---

## 🏗️ Architecture

### Frontend Structure

```
src/
├── components/
│   └── ai/
│       ├── AIPanel.vue              # Main panel container
│       ├── AITextTab.vue            # Text generation tab
│       ├── AIImageTab.vue           # Image generation tab
│       ├── AIBackgroundTab.vue      # Background removal tab
│       ├── AIQRCodeTab.vue          # QR code generation tab
│       └── AIResultCard.vue         # Reusable result card
├── stores/
│   └── ai.ts                        # Pinia store for AI state
├── services/
│   └── ai-api.ts                    # API service layer
├── types/
│   └── ai.ts                        # TypeScript type definitions
└── utils/
    └── ai-helpers.ts                # Helper utilities
```

### Backend Structure

```
ai-server.js                         # Express server
ai-server-package.json               # Server dependencies
uploads/                             # Uploaded images directory
```

### State Management

**Pinia Store (`src/stores/ai.ts`):**
- Panel state (open/closed, active tab)
- Generation state (loading, errors)
- Input options for each feature
- Results storage
- Usage statistics

### API Layer

**Service (`src/services/ai-api.ts`):**
- `generateText()` - Text generation
- `rewriteText()` - Text rewriting
- `translateText()` - Translation
- `generateImage()` - Image generation
- `getImageStatus()` - Poll image status
- `removeBackground()` - Background removal
- `generateQRCode()` - QR code generation
- `uploadImage()` - Image upload
- `getUsageStats()` - Usage statistics

---

## 🚀 Installation & Setup

### 1. Install Frontend Dependencies

The frontend dependencies are already included in your main `package.json`. No additional installation needed.

### 2. Install Backend Dependencies

```bash
# Navigate to project root
cd "c:\ProgramData\Corel\Messages\540111125_707000\EN\MessageCache1\Messages\the real project"

# Install backend dependencies
npm install express cors multer uuid qrcode
```

### 3. Start Backend Server

```bash
# Start the AI server
node ai-server.js
```

Expected output:
```
🚀 AI Integration Server running on http://localhost:3002
📊 Health check: http://localhost:3002/health
📁 Uploads directory: C:\...\uploads
```

### 4. Configure Environment Variables (Optional)

Create a `.env` file in your project root:

```env
# AI API Configuration
VITE_AI_API_URL=http://localhost:3002/api/ai

# OpenAI API Key (for production)
OPENAI_API_KEY=your_openai_api_key_here

# Replicate API Key (for image generation)
REPLICATE_API_KEY=your_replicate_api_key_here

# Remove.bg API Key (for background removal)
REMOVEBG_API_KEY=your_removebg_api_key_here
```

### 5. Start Frontend

```bash
npm run dev
```

---

## 🔌 API Integration

### Current Implementation (Simulated)

The current backend uses **simulated AI responses** for development and testing. This allows you to test the full UI/UX without API costs.

### Production Integration

To integrate real AI services, modify `ai-server.js`:

#### OpenAI GPT-4 (Text Generation)

```javascript
const OpenAI = require('openai')
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.post('/api/ai/text/generate', async (req, res) => {
  const { prompt, tone, type } = req.body
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [
      {
        role: 'system',
        content: `You are a ${tone} copywriter. Generate ${type} content.`
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500
  })
  
  const result = {
    id: uuidv4(),
    text: completion.choices[0].message.content,
    prompt,
    type,
    tone,
    createdAt: new Date(),
    tokens: completion.usage.total_tokens,
    cost: (completion.usage.total_tokens / 1000) * 0.01
  }
  
  res.json({ results: [result] })
})
```

#### Stable Diffusion (Image Generation)

```javascript
const Replicate = require('replicate')
const replicate = new Replicate({ auth: process.env.REPLICATE_API_KEY })

app.post('/api/ai/image/generate', async (req, res) => {
  const { prompt, style, width, height } = req.body
  
  const output = await replicate.run(
    'stability-ai/sdxl:latest',
    {
      input: {
        prompt: `${prompt}, ${style} style`,
        width,
        height,
        num_outputs: 1
      }
    }
  )
  
  const result = {
    id: uuidv4(),
    imageUrl: output[0],
    prompt,
    style,
    width,
    height,
    status: 'complete',
    createdAt: new Date(),
    cost: 0.02
  }
  
  res.json(result)
})
```

#### Remove.bg (Background Removal)

```javascript
const FormData = require('form-data')
const axios = require('axios')

app.post('/api/ai/bg-remove', async (req, res) => {
  const { imageUrl } = req.body
  
  const formData = new FormData()
  formData.append('image_url', imageUrl)
  formData.append('size', 'auto')
  
  const response = await axios.post(
    'https://api.remove.bg/v1.0/removebg',
    formData,
    {
      headers: {
        'X-Api-Key': process.env.REMOVEBG_API_KEY,
        ...formData.getHeaders()
      },
      responseType: 'arraybuffer'
    }
  )
  
  // Save processed image
  const fileName = `bg-removed-${uuidv4()}.png`
  const filePath = path.join(__dirname, 'uploads', fileName)
  fs.writeFileSync(filePath, response.data)
  
  const result = {
    id: uuidv4(),
    originalImageUrl: imageUrl,
    processedImageUrl: `http://localhost:${PORT}/uploads/${fileName}`,
    outputType: 'transparent',
    createdAt: new Date(),
    cost: 0.01
  }
  
  res.json(result)
})
```

---

## 📖 Usage Guide

### Opening the AI Panel

**Method 1: Toolbar Button**
- Click the "AI Assistant" button in the toolbar (purple gradient button)

**Method 2: Keyboard Shortcut**
- Press `Ctrl + K` (Windows/Linux) or `Cmd + K` (Mac)

### Generating Text

1. Open AI Panel → Text tab
2. Enter your prompt (e.g., "Write a catchy headline for a coffee shop")
3. Select content type (Headline, Caption, Description, etc.)
4. Choose tone (Friendly, Professional, etc.)
5. Select length (Short, Medium, Long)
6. Choose language
7. Click "Generate Text"
8. Review results and click "Use" to add to canvas or "Copy" to clipboard

### Generating Images

1. Open AI Panel → Images tab
2. Enter your prompt (e.g., "A futuristic city at sunset")
3. (Optional) Add negative prompt (e.g., "blurry, low quality")
4. Select style preset
5. Choose resolution
6. (Optional) Adjust advanced options
7. Click "Generate Image"
8. Wait for generation (progress bar shown)
9. Click "Use" to add to canvas or "Download" to save

### Removing Backgrounds

1. Open AI Panel → BG Remove tab
2. Click upload area or drag-and-drop image
3. Select output type (Transparent, Solid Color, Blur, AI Background)
4. Configure options based on output type
5. (Optional) Adjust edge refinement and feathering
6. Click "Remove Background"
7. Review result and click "Use" or "Download"

### Generating QR Codes

1. Open AI Panel → QR Code tab
2. Select QR code type (URL, Text, Email, etc.)
3. Enter data (format depends on type)
4. Choose size preset
5. Customize colors
6. (Optional) Adjust dot/corner styles and upload logo
7. Click "Generate QR Code"
8. Click "Use" to add to canvas or "Download" to save

---

## 🎨 Customization

### Changing Panel Width

Edit `src/components/ai/AIPanel.vue`:

```css
.ai-panel {
  width: 500px; /* Change from 420px */
}
```

### Adding New Style Presets

Edit `src/types/ai.ts`:

```typescript
export const STYLE_PRESETS: Record<AIImageStyle, StylePresetConfig> = {
  // ... existing presets
  'your-new-style': {
    style: 'your-new-style',
    name: 'Your Style Name',
    description: 'Description here',
    icon: '🎨',
    examplePrompt: 'example prompt'
  }
}
```

### Customizing Colors

Edit the glassmorphic styles in `src/components/ai/AIPanel.vue`:

```css
.ai-panel {
  background: rgba(255, 255, 255, 0.15); /* Adjust transparency */
  backdrop-filter: blur(20px); /* Adjust blur amount */
}

.ai-tab-button.active {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}
```

---

## 🐛 Troubleshooting

### Issue: AI Panel doesn't open

**Solution:**
- Check browser console for errors
- Verify AI store is properly initialized
- Ensure keyboard shortcut isn't conflicting

### Issue: Backend server won't start

**Solution:**
```bash
# Check if port 3002 is already in use
netstat -ano | findstr :3002

# Kill the process if needed
taskkill /PID <process_id> /F

# Restart server
node ai-server.js
```

### Issue: Image upload fails

**Solution:**
- Check file size (max 10MB)
- Verify file type (JPEG, PNG, GIF, WebP only)
- Ensure `uploads/` directory exists
- Check server logs for errors

### Issue: QR code generation fails

**Solution:**
- Verify data format matches QR type
- Check QR code size (must be 256, 512, 1024, or 2048)
- Ensure `qrcode` package is installed

### Issue: TypeScript errors

**Solution:**
```bash
# Run type check
npm run type-check

# If errors persist, rebuild
npm run build
```

---

## 📊 Performance Optimization

### Caching

Implement Redis caching for repeated prompts:

```javascript
const redis = require('redis')
const client = redis.createClient()

app.post('/api/ai/text/generate', async (req, res) => {
  const cacheKey = `text:${JSON.stringify(req.body)}`
  
  // Check cache
  const cached = await client.get(cacheKey)
  if (cached) {
    return res.json(JSON.parse(cached))
  }
  
  // Generate and cache
  const result = await generateText(req.body)
  await client.setEx(cacheKey, 86400, JSON.stringify(result)) // 24h TTL
  
  res.json(result)
})
```

### Rate Limiting

```javascript
const rateLimit = require('express-rate-limit')

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many requests, please try again later'
})

app.use('/api/ai', limiter)
```

---

## 🔐 Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use environment variables for sensitive data**
3. **Implement user authentication**
4. **Add request validation**
5. **Sanitize user inputs**
6. **Implement CORS properly**
7. **Add rate limiting**
8. **Monitor API usage and costs**

---

## 📈 Next Steps

1. **Integrate real AI APIs** (OpenAI, Replicate, Remove.bg)
2. **Add user authentication** and API key management
3. **Implement usage quotas** and billing
4. **Add more style presets** and customization options
5. **Optimize performance** with caching and CDN
6. **Add analytics** to track feature usage
7. **Implement batch processing** for multiple items
8. **Add export templates** for common use cases

---

**🎉 Congratulations! Your AI Integration feature is fully implemented and ready to use!**

