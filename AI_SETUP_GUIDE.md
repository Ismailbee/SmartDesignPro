# 🤖 AI-Powered Text Parser Setup Guide

## Free AI APIs for Smart Text Parsing

Your SmartDesignPro app now includes AI-powered text parsing that can intelligently extract organization details from natural text without requiring special formatting. Here's how to set up free AI APIs:

## 🥇 Option 1: Hugging Face (Recommended - Completely Free)

**Why Choose Hugging Face:**
- ✅ Completely free with generous limits
- ✅ No credit card required
- ✅ 30 requests/minute, 1000/hour
- ✅ Easy setup
- ✅ Great for text analysis

**Setup Steps:**

1. **Create Account**: Go to [huggingface.co](https://huggingface.co) and sign up for free
2. **Get API Token**: 
   - Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
   - Click "New token"
   - Name it "SmartDesignPro Parser"
   - Select "Read" permission
   - Copy the token (starts with `hf_...`)

3. **Add to Environment**:
   ```bash
   # Create .env file in your project root
   VITE_HUGGING_FACE_TOKEN=hf_your_token_here
   ```

4. **Enable in Config**:
   ```javascript
   // src/config/aiConfig.js
   HUGGING_FACE: {
     enabled: true,
     apiKey: process.env.VITE_HUGGING_FACE_TOKEN || 'hf_your_token_here',
     // ... rest of config
   }
   ```

## 🥈 Option 2: OpenAI API (Paid but Powerful)

**Why Choose OpenAI:**
- ✅ $5 free credits (lasts months for text parsing)
- ✅ Extremely accurate
- ✅ Best for complex business documents
- ❌ Requires credit card

**Setup Steps:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create account and add payment method (for free credits)
3. Get API key from [API Keys section](https://platform.openai.com/api-keys)
4. Add to `.env`: `VITE_OPENAI_API_KEY=sk-...`

## 🥉 Option 3: Google Cloud Natural Language (Free Tier)

**Why Choose Google:**
- ✅ 5,000 units/month free
- ✅ Professional-grade accuracy
- ✅ Great entity recognition
- ❌ Requires Google Cloud account setup

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Natural Language API
3. Create service account and download JSON key
4. Add to `.env`: `VITE_GOOGLE_CLOUD_API_KEY=your_key`

## 🔧 Configuration

Edit `src/config/aiConfig.js` to enable your preferred service:

```javascript
export const AI_CONFIG = {
  HUGGING_FACE: {
    enabled: true, // Enable this
    apiKey: process.env.VITE_HUGGING_FACE_TOKEN || '',
    // ...
  },
  
  OPENAI: {
    enabled: false, // Enable if you have OpenAI key
    apiKey: process.env.VITE_OPENAI_API_KEY || '',
    // ...
  }
  
  // ... other services
};
```

## 🚀 How It Works

1. **User pastes text** into the Smart Text Parser
2. **AI analyzes** the text to identify:
   - Organization names
   - Addresses (without "Address:" labels)
   - Phone numbers (any format)
   - Emails and websites
   - Taglines/subtitles

3. **Automatic fallback** to regex parsing if AI fails
4. **Smart confidence** indicators show parsing quality

## 📝 Example Usage

**Natural Text Input:**
```
TechCorp Solutions is a leading software company based at 123 Innovation Drive, Silicon Valley, CA 94025. Our mission is "Transforming Ideas into Reality". You can reach us at (555) 123-TECH or email us at hello@techcorp.com.
```

**AI Automatically Extracts:**
- Organization: "TechCorp Solutions"
- Address: "123 Innovation Drive, Silicon Valley, CA 94025"
- Tagline: "Transforming Ideas into Reality"
- Phone: "(555) 123-TECH"
- Email: "hello@techcorp.com"

## 🛡️ Privacy & Security

- **No data storage**: AI APIs process text and return results without storing your data
- **Fallback system**: Works even if AI is unavailable
- **Local caching**: Results cached locally for better performance
- **Rate limiting**: Built-in rate limiting to prevent API overuse

## 💡 Tips for Best Results

1. **Natural Text**: Just paste business cards, websites, or documents as-is
2. **Multiple Formats**: Mix structured `(Company Name)` with natural text
3. **Complete Information**: Include all details in one paste for best extraction
4. **Confidence Levels**: Check AI confidence badges for parsing quality

## 🐛 Troubleshooting

**AI not working?**
- Check your API key in `.env` file
- Verify internet connection
- Check browser console for errors
- System automatically falls back to regex parsing

**Low accuracy?**
- Try Hugging Face + structured format combination
- Add more context to your text
- Use multiple services for comparison

**Rate limits?**
- Hugging Face: 30/min, 1000/hour
- OpenAI: Varies by plan
- Google Cloud: 5000/month free

## 🔄 Updating Your Parser

The AI parser is already integrated into your `ClassicProfessionalTemplate.vue`. Just add your API key and it will automatically enhance the existing text parsing!

---

**Need Help?** Check the browser console for detailed AI parsing logs and error messages.