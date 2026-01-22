/**
 * Letterhead Chat Composable
 * Handles conversational letterhead creation with AI extraction
 */

import { ref, computed, watch, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { renderLetterHead, downloadSVG, downloadAsPng, downloadAsJpeg, downloadAsPdf, updateLetterHeadBrandColor, type LetterHeadData } from '@/services/svgTemplateService'

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  actions?: Array<{ type: string; label: string; variant?: string }>
}

export interface ExtractedLetterHeadInfo {
  organizationName: string
  registrationNumber: string
  rcNumberAttempts: number // Track validation attempts
  headOffice: string
  otherAddress: string
  phones: string[]
  email: string
  logoDataUrl?: string
  referenceFields: {
    ourRef: string
    yourRef: string
    date: string
  }
}

export interface LetterHeadAssistantDecision {
  message: string
  action: {
    name: LetterHeadAssistantActionName
    args?: Record<string, unknown>
  }
  updates?: Partial<ExtractedLetterHeadInfo>
  buttons?: Array<{ type: string; label: string; variant?: string }>
}

export type LetterHeadAssistantActionName = 
  | 'none'
  | 'open_login'
  | 'ask_upload_logo'
  | 'generate_preview'
  | 'download_pdf'
  | 'download_png'
  | 'edit_details'

// JSON parsing utilities
function safeJsonParse<T>(text: string): { ok: true; value: T } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

function extractFirstJsonBlock(text: string): string | null {
  const objMatch = text.match(/\{[\s\S]*\}/)
  if (objMatch) return objMatch[0]
  
  const arrMatch = text.match(/\[[\s\S]*\]/)
  if (arrMatch) return arrMatch[0]
  
  return null
}

// Text-to-Speech helper for web
function speakText(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  
  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel()
    
    // Clean text - remove emojis and special chars
    const cleanText = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // All emojis
      .replace(/[\u{2600}-\u{27BF}]/gu, '')   // Misc symbols
      .replace(/\n+/g, '. ')                   // Newlines to pauses
      .replace(/\s+/g, ' ')
      .trim()
    
    if (!cleanText) return
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'
    
    // Try to get a good voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha'))
    ) || voices.find(v => v.lang.startsWith('en'))
    
    if (preferredVoice) utterance.voice = preferredVoice
    
    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.warn('TTS failed:', e)
  }
}

export function useLetterHeadChat() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  
  // State
  const chatMessages = ref<ChatMessage[]>([])
  const chatInputText = ref('')
  const isAnalyzing = ref(false)
  const isGeneratingPreview = ref(false)
  const isVoiceEnabled = ref(true) // TTS enabled by default
  const showLetterHeadPreview = ref(false)
  const letterHeadChatRequestId = ref(0)
  const generatingMessage = ref('')
  const previewImageUrl = ref<string>('')
  const selectedFormat = ref<'png' | 'jpeg' | 'pdf'>('png')
  
  // Color configuration state
  const primaryBrandColor = ref('#058A6C')
  
  const extractedInfo = ref<ExtractedLetterHeadInfo>({
    organizationName: '',
    registrationNumber: '',
    rcNumberAttempts: 0,
    headOffice: '',
    otherAddress: '',
    phones: [],
    email: '',
    referenceFields: {
      ourRef: '',
      yourRef: '',
      date: ''
    }
  })

  // Computed
  const isAuthenticated = computed(() => !!authStore.isAuthenticated)
  const userName = computed(() => userStore.user?.name?.split(' ')[0] || '')
  const userTokens = computed(() => userStore.user?.tokens ?? 0)
  
  // Check if we have minimum required info
  const hasMinimumInfo = computed(() => {
    const info = extractedInfo.value
    return !!(info.organizationName && (info.headOffice || info.email || info.phones.length > 0))
  })
  
  // Build context for AI
  function buildChatContext(): string {
    const info = extractedInfo.value
    const parts: string[] = []
    
    if (info.organizationName) parts.push(`Organization: ${info.organizationName}`)
    if (info.registrationNumber) parts.push(`RC No: ${info.registrationNumber}`)
    if (info.headOffice) parts.push(`Head Office: ${info.headOffice}`)
    if (info.otherAddress) parts.push(`Other Address: ${info.otherAddress}`)
    if (info.phones.length > 0) parts.push(`Phones: ${info.phones.join(', ')}`)
    if (info.email) parts.push(`Email: ${info.email}`)
    if (info.logoDataUrl) parts.push('Logo: Uploaded ✓')
    
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
  
  // Add AI message with character-by-character typing animation
  function addAiMessage(text: string, actions?: ChatMessage['actions']): Promise<void> {
    return new Promise((resolve) => {
      const messageId = Date.now()
      const charDelay = 20 // 20ms per character
      const startDelay = 300 // initial delay before typing
      
      // First add a loading message (typing indicator)
      chatMessages.value.push({
        id: messageId,
        text: '',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      
      // Start typing after initial delay
      setTimeout(() => {
        const index = chatMessages.value.findIndex(m => m.id === messageId)
        if (index === -1) {
          resolve()
          return
        }
        
        let currentIndex = 0
        const fullText = text
        
        // Type character by character
        const typeNextChar = () => {
          if (currentIndex < fullText.length) {
            chatMessages.value[index].text = fullText.substring(0, currentIndex + 1)
            currentIndex++
            
            // Variable delay for natural feel
            const nextDelay = fullText[currentIndex - 1] === '.' || fullText[currentIndex - 1] === '!' || fullText[currentIndex - 1] === '?' 
              ? charDelay * 5 
              : fullText[currentIndex - 1] === ',' 
                ? charDelay * 2 
                : charDelay
            
            setTimeout(typeNextChar, nextDelay)
          } else {
            // Typing complete - add actions if any
            if (actions) {
              chatMessages.value[index].actions = actions
            }
            
            // Speak the message if voice is enabled
            if (isVoiceEnabled.value) {
              speakText(text)
            }
            resolve()
          }
        }
        
        typeNextChar()
      }, startDelay)
    })
  }
  
  // Toggle voice on/off
  function toggleVoice() {
    isVoiceEnabled.value = !isVoiceEnabled.value
    if (!isVoiceEnabled.value && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
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
      else if (hour >= 17 && hour < 22) greet = 'Good evening!'
      
      const name = userName.value ? ` ${userName.value}` : ''
      return `${greet}${name}! I'll help you create your letterhead. What's your organization name?`
    }
    
    // Thanks
    if (/^(thanks?|thank\s*you|thx|appreciated?)[\s!.?]*$/i.test(lowerMsg)) {
      return "You're welcome! Need anything else?"
    }
    
    // Help requests
    if (/^(help|what|how)[\s!.?]*$/i.test(lowerMsg)) {
      return "I'll ask for your organization details step by step. Let's start!"
    }
    
    return null
  }
  
  // Extract letterhead info from AI response
  function parseAiDecision(aiText: string): LetterHeadAssistantDecision {
    const jsonBlock = extractFirstJsonBlock(aiText)
    
    if (jsonBlock) {
      const parsed = safeJsonParse<LetterHeadAssistantDecision>(jsonBlock)
      if (parsed.ok) {
        return parsed.value
      }
    }
    
    // Fallback: treat entire text as message
    return {
      message: aiText,
      action: { name: 'none' }
    }
  }
  
  // Handle main chat input
  async function handleSendMessage() {
    if (!chatInputText.value.trim() || isAnalyzing.value) return
    
    const message = chatInputText.value.trim()
    chatInputText.value = ''
    
    // Add user message
    addUserMessage(message)
    
    // Check for quick response first
    const quickReply = handleQuickResponse(message)
    if (quickReply) {
      setTimeout(() => addAiMessage(quickReply), 300)
      return
    }
    
    // Analyze with AI
    isAnalyzing.value = true
    letterHeadChatRequestId.value++
    const currentRequestId = letterHeadChatRequestId.value
    
    try {
      // TODO: Implement AI service call
      // For now, show a placeholder response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (currentRequestId !== letterHeadChatRequestId.value) return
      
      // Step-by-step information gathering
      const info = extractedInfo.value
      let responseText = ''
      
      // Track which step we're on - check if field has actual value or has been explicitly skipped
      const hasOrgName = !!info.organizationName
      const hasRC = !!info.registrationNumber // Will be true if set to actual value or 'N/A'
      const hasHeadOffice = !!info.headOffice
      const hasOtherAddress = !!info.otherAddress // Will be true if set to actual value or 'N/A'
      const hasLogo = !!info.logoDataUrl || info.logoDataUrl === 'skipped' // Check if logo is uploaded or skipped
      const hasPhones = info.phones.length > 0
      const hasEmail = !!info.email
      
      // Step 1: Organization name
      if (!hasOrgName) {
        // Try to extract organization name from message
        const orgMatch = message.match(/(?:company|organization|org|business|firm)\s+(?:is|name)?\s*:?\s*([A-Za-z0-9\s&.,'-]+?)(?:\.|,|$|\s+in\s+|\s+at\s+)/i)
        if (orgMatch) {
          info.organizationName = orgMatch[1].trim()
          responseText = `Got "${info.organizationName}". RC number? (say 'skip' if none)`
        } else if (message.toLowerCase().includes('skip')) {
          responseText = "What's your organization name?"
        } else {
          // Assume entire message is org name if not just numbers
          const isJustNumbers = /^[0-9\s]+$/.test(message.trim())
          const trimmedMessage = message.trim()
          
          // Accept the full message as organization name if it contains letters
          if (!isJustNumbers && trimmedMessage.length > 0) {
            info.organizationName = trimmedMessage
            responseText = `Got it! RC number? (say 'skip' if none)`
          } else {
            responseText = "What's your organization name?"
          }
        }
      }
      // Step 2: Registration number (RC or BN)
      else if (!hasRC) {
        const lowerMsg = message.toLowerCase().trim()
        
        // Check if user is skipping or doesn't have RC/BN
        if (lowerMsg === 'skip' || 
            lowerMsg === 'no' || 
            lowerMsg === 'none' ||
            lowerMsg === 'nope' ||
            lowerMsg.includes('don\'t have') || 
            lowerMsg.includes('do not have') ||
            lowerMsg.includes('dont have') ||
            lowerMsg.includes('no rc') ||
            lowerMsg.includes('no bn') ||
            lowerMsg.includes('not registered')) {
          info.registrationNumber = 'N/A'  // Mark as skipped
          info.rcNumberAttempts = 0
          responseText = "OK. Head office address?"
        } else {
          // Extract RC number
          const rcMatch = message.match(/RC\.?\s*([0-9]+)/i)
          const numberOnly = message.match(/^([0-9]+)$/)
          
          let extractedNumber = ''
          if (rcMatch) {
            extractedNumber = rcMatch[1]
          } else if (numberOnly) {
            extractedNumber = numberOnly[1]
          } else {
            extractedNumber = message.trim()
          }
          
          // Initialize attempts if not set
          if (!info.rcNumberAttempts) {
            info.rcNumberAttempts = 0
          }
          info.rcNumberAttempts++
          
          // Validate: should be exactly 7 digits
          const isValid = /^[0-9]{7}$/.test(extractedNumber)
          
          if (!isValid && info.rcNumberAttempts === 1) {
            // First attempt with invalid number - ask to verify
            responseText = `⚠️ RC numbers are typically 7 digits. You entered "${extractedNumber}". Please check and re-enter your RC number, or type 'skip' if you don't have one.`
          } else {
            // Either valid on first try, or second attempt (accept regardless)
            info.registrationNumber = extractedNumber
            if (!isValid && info.rcNumberAttempts > 1) {
              responseText = `RC ${info.registrationNumber} saved. Head office address?`
            } else {
              responseText = `RC ${info.registrationNumber}. Head office address?`
            }
          }
        }
      }
      // Step 3: Head office address
      else if (!hasHeadOffice) {
        const lowerMsg = message.toLowerCase().trim()
        
        if (lowerMsg === 'skip' || lowerMsg === 'no' || lowerMsg === 'none' || lowerMsg === 'nope' || lowerMsg.includes('dont have') || lowerMsg.includes("don't have") || lowerMsg.includes('i dont') || lowerMsg.includes("i don't") || lowerMsg.includes('no head') || lowerMsg.includes('no office')) {
          info.headOffice = 'N/A'
          responseText = "Other address? (say 'skip' if none)"
        } else {
          info.headOffice = message.trim()
          responseText = "Other address? (say 'skip' if none)"
        }
      }
      // Step 4: Other address (optional)
      else if (!hasOtherAddress) {
        const lowerMsg = message.toLowerCase().trim()
        if (lowerMsg === 'skip' || 
            lowerMsg === 'no' || 
            lowerMsg === 'none' ||
            lowerMsg === 'nope' ||
            lowerMsg.includes('no other')) {
          info.otherAddress = 'N/A'  // Mark as skipped
          responseText = "Want to add a logo? (say 'no' or 'skip' if you don't want to)"
        } else {
          info.otherAddress = message.trim()
          responseText = "Want to add a logo? (say 'no' or 'skip' if you don't want to)"
        }
      }
      // Step 5: Logo (optional)
      else if (!hasLogo) {
        const lowerMsg = message.toLowerCase().trim()
        if (lowerMsg === 'skip' || 
            lowerMsg === 'no' || 
            lowerMsg === 'none' ||
            lowerMsg === 'nope' ||
            lowerMsg.includes('no logo') ||
            lowerMsg.includes("don't want")) {
          info.logoDataUrl = 'skipped'  // Mark as skipped
          responseText = "Phone number(s)?"
        } else if (lowerMsg === 'yes' || lowerMsg.includes('add logo') || lowerMsg.includes('upload')) {
          responseText = "Great! Click the button below to upload your logo."
          addAiMessage(responseText, [
            { type: 'upload_logo', label: 'Upload Logo', variant: 'primary' }
          ])
          return
        } else {
          // User sent a message but didn't upload - remind them
          responseText = "Use the logo button (📎) at the bottom to upload your logo, or type 'skip' to continue without a logo."
          addAiMessage(responseText)
          return
        }
      }
      // Step 6: Phone numbers
      else if (!hasPhones) {
        const phoneNumbers = message.match(/[+]?[0-9-()\s]+/g)
        if (phoneNumbers) {
          info.phones = phoneNumbers.map(p => p.trim())
          responseText = "Email address?"
        } else {
          info.phones = [message.trim()]
          responseText = "Email address?"
        }
      }
      // Step 7: Email address
      else if (!hasEmail) {
        const trimmedEmail = message.trim()
        const lowerMsg = message.toLowerCase().trim()
        
        // Check if user is skipping
        if (lowerMsg === 'skip' || 
            lowerMsg === 'no' || 
            lowerMsg === 'none' ||
            lowerMsg === 'nope' ||
            lowerMsg.includes('no email') ||
            lowerMsg.includes("don't have")) {
          info.email = 'N/A'
        } else if (!trimmedEmail.includes('@')) {
          // Invalid email - doesn't have @ symbol
          responseText = "⚠️ Please provide a valid email address with '@' symbol, or type 'skip' if you don't have one."
          addAiMessage(responseText)
          return
        } else {
          info.email = trimmedEmail
        }
        
        // Filter out N/A values for display
        const displayRC = info.registrationNumber !== 'N/A' ? info.registrationNumber : ''
        const displayHeadOffice = info.headOffice !== 'N/A' ? info.headOffice : ''
        const displayOther = info.otherAddress !== 'N/A' ? info.otherAddress : ''
        const displayEmail = info.email !== 'N/A' ? info.email : ''
        
        responseText = `All set!\n${info.organizationName}${displayRC ? ` • RC: ${displayRC}` : ''}${displayHeadOffice ? `\n📍 ${displayHeadOffice}` : ''}${displayOther ? `\n📍 ${displayOther}` : ''}\n📞 ${info.phones.join(', ')}${displayEmail ? `\n📧 ${displayEmail}` : ''}\n\nChoose format:`
        addAiMessage(responseText, [
          { type: 'format_png', label: 'PNG', variant: 'secondary' },
          { type: 'format_jpeg', label: 'JPEG', variant: 'secondary' },
          { type: 'format_pdf', label: 'PDF', variant: 'secondary' }
        ])
        return
      }
      // Already have all info
      else {
        responseText = "Ready! Choose format:"
        addAiMessage(responseText, [
          { type: 'format_png', label: 'PNG', variant: 'secondary' },
          { type: 'format_jpeg', label: 'JPEG', variant: 'secondary' },
          { type: 'format_pdf', label: 'PDF', variant: 'secondary' }
        ])
        return
      }
      
      addAiMessage(responseText)
      
    } catch (error) {
      console.error('Chat error:', error)
      addAiMessage("Sorry, I encountered an error. Please try again.")
    } finally {
      isAnalyzing.value = false
    }
  }
  
  // Handle message actions (button clicks)
  function handleMessageAction(actionType: string) {
    if (actionType === 'generate') {
      generateLetterHeadPreview()
    } else if (actionType === 'download_svg') {
      downloadLetterHead('svg')
    } else if (actionType === 'download_png') {
      downloadLetterHead('png')
    } else if (actionType === 'download_jpeg') {
      downloadLetterHead('jpeg')
    } else if (actionType === 'download_pdf') {
      downloadLetterHead('pdf')
    } else if (actionType === 'format_png') {
      selectedFormat.value = 'png'
      addAiMessage('PNG selected. Ready to generate!', [
        { type: 'generate', label: 'Generate', variant: 'primary' }
      ])
    } else if (actionType === 'format_jpeg') {
      selectedFormat.value = 'jpeg'
      addAiMessage('JPEG selected. Ready to generate!', [
        { type: 'generate', label: 'Generate', variant: 'primary' }
      ])
    } else if (actionType === 'format_pdf') {
      selectedFormat.value = 'pdf'
      addAiMessage('PDF selected. Ready to generate!', [
        { type: 'generate', label: 'Generate', variant: 'primary' }
      ])
    } else if (actionType === 'upload_logo') {
      // Trigger logo upload
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = 'image/*'
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (file) {
          uploadLogo(file)
        }
      }
      input.click()
    }
  }
  
  // Generate letterhead preview
  async function generateLetterHeadPreview() {
    if (!hasMinimumInfo.value) {
      addAiMessage("I need at least your organization name and one contact method (address, phone, or email) to generate the letterhead.")
      return
    }
    
    isGeneratingPreview.value = true
    generatingMessage.value = `Generating your letterhead as ${selectedFormat.value.toUpperCase()}...`
    
    try {
      // Prepare data for rendering
      const data: LetterHeadData = {
        organizationName: extractedInfo.value.organizationName,
        registrationNumber: extractedInfo.value.registrationNumber,
        headOffice: extractedInfo.value.headOffice,
        otherAddress: extractedInfo.value.otherAddress,
        phones: extractedInfo.value.phones,
        email: extractedInfo.value.email,
        logoDataUrl: extractedInfo.value.logoDataUrl,
        primaryBrandColor: primaryBrandColor.value,
        referenceFields: {
          ref: extractedInfo.value.referenceFields.ourRef,
          date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
        }
      }
      
      // Render the SVG with data
      const renderedSvg = await renderLetterHead(data)
      
      // Create blob URL for preview
      const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
      previewImageUrl.value = URL.createObjectURL(blob)
      showLetterHeadPreview.value = true
      
    } catch (error) {
      console.error('Preview generation error:', error)
      addAiMessage("Sorry, I couldn't generate the letterhead. Please try again.")
    } finally {
      isGeneratingPreview.value = false
    }
  }
  // Download letterhead
  async function downloadLetterHead(format: 'svg' | 'png' | 'jpeg' | 'pdf') {
    try {
      // Prepare data for rendering
      const data: LetterHeadData = {
        organizationName: extractedInfo.value.organizationName,
        registrationNumber: extractedInfo.value.registrationNumber,
        headOffice: extractedInfo.value.headOffice,
        otherAddress: extractedInfo.value.otherAddress,
        phones: extractedInfo.value.phones,
        email: extractedInfo.value.email,
        logoDataUrl: extractedInfo.value.logoDataUrl,
        primaryBrandColor: primaryBrandColor.value,
        referenceFields: {
          ref: extractedInfo.value.referenceFields.ourRef,
          date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
        }
      }
      
      // Render the SVG
      const renderedSvg = await renderLetterHead(data)
      
      // Download based on format
      const filename = `${extractedInfo.value.organizationName || 'letterhead'}_${Date.now()}`
      if (format === 'svg') {
        downloadSVG(renderedSvg, `${filename}.svg`)
      } else if (format === 'png') {
        await downloadAsPng(renderedSvg, `${filename}.png`)
      } else if (format === 'jpeg') {
        await downloadAsJpeg(renderedSvg, `${filename}.jpg`)
      } else if (format === 'pdf') {
        await downloadAsPdf(renderedSvg, `${filename}.pdf`)
      }
      
    } catch (error) {
      console.error('Download error:', error)
      addAiMessage(`Sorry, I couldn't download the ${format.toUpperCase()}. Please try again.`)
    }
  }
  
  // Update brand color using CSS variables
  function updateBrandColor() {
    updateLetterHeadBrandColor(primaryBrandColor.value)
  }
  
  // Handle logo upload
  async function uploadLogo(file: File) {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        extractedInfo.value.logoDataUrl = e.target?.result as string
        addAiMessage("✓ Logo uploaded successfully! Now, what's your phone number(s)?")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Logo upload error:', error)
      addAiMessage("Sorry, I couldn't upload the logo. Please try again.")
    }
  }
  
  // Initialize with welcome message
  function initializeChat() {
    if (chatMessages.value.length === 0) {
      const name = userName.value ? ` ${userName.value}` : ''
      addAiMessage(
        `Hello${name}! 👋\n\nI'm your Letterhead Designer Assistant. I'll guide you step-by-step to create a professional letterhead for your organization.\n\nLet's start with the first question: What's your organization or company name?`
      )
    }
  }
  
  return {
    // State
    chatMessages,
    chatInputText,
    isAnalyzing,
    isGeneratingPreview,
    showLetterHeadPreview,
    extractedInfo,
    previewImageUrl,
    generatingMessage,
    isVoiceEnabled,
    selectedFormat,
    primaryBrandColor,
    
    // Computed
    isAuthenticated,
    userName,
    userTokens,
    hasMinimumInfo,
    
    // Methods
    handleSendMessage,
    handleMessageAction,
    initializeChat,
    handleLogoUpload: uploadLogo,
    updateBrandColor,
    toggleVoice
  }
}
