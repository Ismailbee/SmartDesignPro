/**
 * Wedding Chat Composable
 * Handles chat messages, AI analysis, and sticker generation flow
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  actions?: Array<{ type: string; label: string; variant?: string }>
}

export interface ExtractedWeddingInfo {
  names: {
    name1: string
    name2: string
  }
  date: string
  courtesy: string
  size: string | null
}

export interface WeddingAssistantDecision {
  message: string
  action: {
    name: WeddingAssistantActionName
    args?: Record<string, unknown>
  }
  updates?: {
    name1?: string | null
    name2?: string | null
    date?: string | null
    courtesy?: string | null
    heading?: string | null
    size?: string | null
  }
  buttons?: Array<{ type: string; label: string; variant?: string }>
}

export type WeddingAssistantActionName = 
  | 'none'
  | 'open_login'
  | 'ask_upload'
  | 'set_size'
  | 'generate_preview'
  | 'open_edit'
  | 'download_png'
  | 'regenerate'

// JSON parsing utilities
function safeJsonParse<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

function extractFirstJsonBlock(text: string): string | null {
  // Try to find JSON object
  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) return objMatch[0]
  
  // Try to find JSON array
  const arrMatch = text.match(/\[[\s\S]*\]/)
  if (arrMatch) return arrMatch[0]
  
  return null
}

export function useWeddingChat() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  
  // State
  const chatMessages = ref<ChatMessage[]>([])
  const chatInputText = ref('')
  const isAnalyzing = ref(false)
  const isGeneratingPreview = ref(false)
  const showWeddingStickerPreview = ref(false)
  const weddingChatRequestId = ref(0)
  const generatingMessage = ref('')
  
  const extractedInfo = ref<ExtractedWeddingInfo>({
    names: { name1: '', name2: '' },
    date: '',
    courtesy: '',
    size: null
  })

  // Computed
  const isAuthenticated = computed(() => !!authStore.isAuthenticated)
  const userName = computed(() => userStore.user?.name?.split(' ')[0] || '')
  const userTokens = computed(() => userStore.user?.tokens ?? 0)
  
  // Build context for AI
  function buildChatContext(): string {
    const info = extractedInfo.value
    const parts: string[] = []
    
    if (info.names.name1) parts.push(`Name 1: ${info.names.name1}`)
    if (info.names.name2) parts.push(`Name 2: ${info.names.name2}`)
    if (info.date) parts.push(`Date: ${info.date}`)
    if (info.courtesy) parts.push(`Courtesy: ${info.courtesy}`)
    if (info.size) parts.push(`Size: ${info.size}`)
    
    return parts.length > 0 ? parts.join('\n') : 'No info collected yet.'
  }
  
  // Build chat transcript for AI context
  function buildChatTranscript(limit = 6): string {
    const recent = chatMessages.value.slice(-limit)
    return recent.map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n')
  }
  
  // Add user message
  function addUserMessage(text: string) {
    chatMessages.value.push({
      id: Date.now(),
      text,
      sender: 'user',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
  }
  
  // Add AI message
  function addAiMessage(text: string, actions?: ChatMessage['actions']) {
    chatMessages.value.push({
      id: Date.now(),
      text,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actions
    })
  }
  
  // Check for quick responses that don't need AI
  function handleQuickResponse(message: string): string | null {
    const lowerMsg = message.trim().toLowerCase()
    
    // Greetings
    if (/^(hi|hello|hey|good\s*(morning|afternoon|evening)|assalamualaikum|salam)[\s!.?]*$/i.test(lowerMsg)) {
      const hour = new Date().getHours()
      let greet = 'Hello!'
      if (hour >= 5 && hour < 12) greet = 'Good morning!'
      else if (hour >= 12 && hour < 17) greet = 'Good afternoon!'
      else if (hour >= 17 && hour < 21) greet = 'Good evening!'
      if (/salam/i.test(lowerMsg)) greet = 'Wa alaikum assalam!'
      
      return `${greet} I'm your Wedding Sticker Designer assistant. Would you like to create a wedding sticker today?`
    }
    
    // Affirmative responses
    if (/^(yes|yeah|yep|yup|sure|ok|okay|alright|definitely|of course|absolutely|let'?s go|let'?s do it)[\s!.?]*$/i.test(lowerMsg)) {
      const hasName = !!extractedInfo.value.names.name1
      const hasDate = !!extractedInfo.value.date
      const hasCourtesy = !!extractedInfo.value.courtesy
      
      if (showWeddingStickerPreview.value) {
        return 'Your sticker is ready! Would you like to download it, make edits, or generate a new design?'
      } else if (hasName && hasDate && hasCourtesy) {
        return 'I have all your details. Let me generate your wedding sticker now!'
      } else if (hasName || hasDate || hasCourtesy) {
        const missing: string[] = []
        if (!hasName) missing.push('names (e.g., "John & Sarah")')
        if (!hasDate) missing.push('wedding date')
        if (!hasCourtesy) missing.push('courtesy message')
        return `Great! I still need: ${missing.join(', ')}. Please share these details.`
      } else {
        return 'Wonderful! Let\'s create your wedding sticker. Please tell me:\n\n1. **Names** - The couple\'s names\n2. **Date** - Wedding date\n3. **Message** - A courtesy message'
      }
    }
    
    // Negative responses
    if (/^(no|nope|nah|not now|not yet|maybe later|later|never mind|nevermind)[\s!.?]*$/i.test(lowerMsg)) {
      return 'No problem! Let me know whenever you\'re ready to create a wedding sticker. I\'m here to help! 😊'
    }
    
    // Thanks
    if (/^(thanks?|thank you|thx|ty|cheers|appreciate it|awesome|great|perfect|cool)[\s!.?]*$/i.test(lowerMsg)) {
      return showWeddingStickerPreview.value 
        ? 'You\'re welcome! Your sticker looks great. Feel free to download it or let me know if you\'d like any changes!'
        : 'You\'re welcome! Let me know if you need anything else for your wedding sticker.'
    }
    
    // Help
    if (/^(help|what can you do|how does this work|instructions?)[\s!.?]*$/i.test(lowerMsg)) {
      return 'I can help you create beautiful wedding stickers! Here\'s how:\n\n1. **Tell me the details** - Share the couple\'s names, wedding date, and a courtesy message\n2. **I\'ll generate a design** - A beautiful sticker preview will appear\n3. **Customize if needed** - You can edit colors, fonts, and layout\n4. **Download** - Save as PNG or PDF\n\nJust say "Let\'s start" or share your wedding details!'
    }
    
    return null
  }
  
  // Generate contextual fallback when AI fails
  function getContextualFallback(): string {
    const hasName = !!extractedInfo.value.names.name1
    const hasDate = !!extractedInfo.value.date
    const hasCourtesy = !!extractedInfo.value.courtesy
    
    if (hasName && hasDate && hasCourtesy) {
      return 'I have all your details! Ready to generate your wedding sticker?'
    }
    
    const need: string[] = []
    if (!hasName) need.push('names')
    if (!hasDate) need.push('date')
    if (!hasCourtesy) need.push('courtesy message')
    
    return need.length > 0 
      ? `Please share the ${need.join(', ')} for your wedding sticker.`
      : 'How can I help with your wedding sticker?'
  }
  
  // Check if text looks like garbage/JSON output
  function isGarbageResponse(text: string): boolean {
    const badPatterns = /^(your reply|your response|<write|message here|here is|revised|json|structure|\{|\[|```)/i
    return badPatterns.test(text)
  }
  
  // Parse AI response into decision
  function parseAiResponse(aiText: string): WeddingAssistantDecision | null {
    // Try direct parse
    const direct = safeJsonParse<any>(aiText)
    if (direct.ok) {
      return normalizeDecision(direct.value)
    }
    
    // Try extracting JSON block
    const extracted = extractFirstJsonBlock(aiText)
    if (extracted) {
      const parsed = safeJsonParse<any>(extracted)
      if (parsed.ok) {
        return normalizeDecision(parsed.value)
      }
    }
    
    // Try to extract just the message
    const msgMatch = aiText.match(/"message"\s*:\s*"([^"]+)"/i)
    if (msgMatch?.[1] && !isGarbageResponse(msgMatch[1])) {
      return {
        message: msgMatch[1],
        action: { name: 'none' }
      }
    }
    
    return null
  }
  
  // Normalize raw decision from AI
  function normalizeDecision(raw: any): WeddingAssistantDecision {
    return {
      message: String(raw?.message ?? raw?.text ?? raw?.reply ?? raw?.answer ?? ''),
      action: {
        name: (raw?.action?.name ?? 'none') as WeddingAssistantActionName,
        args: raw?.action?.args ?? {}
      },
      updates: raw?.updates ?? raw?.update,
      buttons: raw?.buttons ?? raw?.button
    }
  }
  
  // Apply extracted updates to state
  function applyUpdates(updates: WeddingAssistantDecision['updates']) {
    if (!updates) return
    
    if (updates.name1 !== undefined) extractedInfo.value.names.name1 = updates.name1 || ''
    if (updates.name2 !== undefined) extractedInfo.value.names.name2 = updates.name2 || ''
    if (updates.date !== undefined) extractedInfo.value.date = updates.date || ''
    if (updates.courtesy !== undefined) extractedInfo.value.courtesy = updates.courtesy || ''
    if (updates.size !== undefined) extractedInfo.value.size = updates.size || null
  }
  
  // Clear chat
  function clearChat() {
    chatMessages.value = []
    extractedInfo.value = {
      names: { name1: '', name2: '' },
      date: '',
      courtesy: '',
      size: null
    }
    showWeddingStickerPreview.value = false
  }
  
  // Check if all required info is collected
  const hasAllRequiredInfo = computed(() => {
    return !!extractedInfo.value.names.name1 && 
           !!extractedInfo.value.date && 
           !!extractedInfo.value.courtesy
  })

  return {
    // State
    chatMessages,
    chatInputText,
    isAnalyzing,
    isGeneratingPreview,
    showWeddingStickerPreview,
    weddingChatRequestId,
    generatingMessage,
    extractedInfo,
    
    // Computed
    isAuthenticated,
    userName,
    userTokens,
    hasAllRequiredInfo,
    
    // Methods
    buildChatContext,
    buildChatTranscript,
    addUserMessage,
    addAiMessage,
    handleQuickResponse,
    getContextualFallback,
    isGarbageResponse,
    parseAiResponse,
    applyUpdates,
    clearChat
  }
}
