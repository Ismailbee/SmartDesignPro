/**
 * Letterhead Chat Composable
 * Handles conversational letterhead creation with AI extraction
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { renderLetterHead, downloadSVG, downloadAsPng, downloadAsJpeg, downloadAsPdf, type LetterHeadData } from '@/services/svgTemplateService'

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

export function useLetterHeadChat() {
  const authStore = useAuthStore()
  const userStore = useUserStore()
  
  // State
  const chatMessages = ref<ChatMessage[]>([])
  const chatInputText = ref('')
  const isAnalyzing = ref(false)
  const isGeneratingPreview = ref(false)
  const showLetterHeadPreview = ref(false)
  const letterHeadChatRequestId = ref(0)
  const generatingMessage = ref('')
  const previewImageUrl = ref<string>('')
  const selectedFormat = ref<'png' | 'jpeg' | 'pdf'>('png')
  
  const extractedInfo = ref<ExtractedLetterHeadInfo>({
    organizationName: '',
    registrationNumber: '',
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
      else if (hour >= 17 && hour < 22) greet = 'Good evening!'
      
      const name = userName.value ? ` ${userName.value}` : ''
      return `${greet}${name}! 👋\n\nI'm your Letterhead Designer Assistant. I'll help you create a professional letterhead for your organization.\n\nLet's start with the basics. What's your organization name?`
    }
    
    // Thanks
    if (/^(thanks?|thank\s*you|thx|appreciated?)[\s!.?]*$/i.test(lowerMsg)) {
      return "You're very welcome! 😊 Let me know if you need anything else!"
    }
    
    // Help requests
    if (/^(help|what|how)[\s!.?]*$/i.test(lowerMsg)) {
      return "I'll guide you step-by-step to create your letterhead. I'll ask for your organization name, address, phone, email, and other details one at a time."
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
      const hasPhones = info.phones.length > 0
      const hasEmail = !!info.email
      
      // Step 1: Organization name
      if (!hasOrgName) {
        // Try to extract organization name from message
        const orgMatch = message.match(/(?:company|organization|org|business|firm)\s+(?:is|name)?\s*:?\s*([A-Za-z0-9\s&.,'-]+?)(?:\.|,|$|\s+in\s+|\s+at\s+)/i)
        if (orgMatch) {
          info.organizationName = orgMatch[1].trim()
          responseText = `Great! I've noted "${info.organizationName}" as your organization name.\n\nNow, what's your registration number (RC number)? If you don't have one, just say 'skip'.`
        } else if (message.toLowerCase().includes('skip')) {
          responseText = "No problem! What's your organization name?"
        } else {
          // Assume entire message is org name if it's short
          if (message.length < 50 && !message.toLowerCase().includes('address') && !message.toLowerCase().includes('phone')) {
            info.organizationName = message
            responseText = `Perfect! "${info.organizationName}" it is.\n\nDo you have a registration number (RC number)? If not, just say 'skip'.`
          } else {
            responseText = "Thank you! Let me start by getting your organization name. What's your organization or company name?"
          }
        }
      }
      // Step 2: Registration number
      else if (!hasRC) {
        const lowerMsg = message.toLowerCase().trim()
        
        // Check if user is skipping or doesn't have RC
        if (lowerMsg === 'skip' || 
            lowerMsg === 'no' || 
            lowerMsg === 'none' ||
            lowerMsg === 'nope' ||
            lowerMsg.includes('don\'t have') || 
            lowerMsg.includes('do not have') ||
            lowerMsg.includes('dont have') ||
            lowerMsg.includes('no rc') ||
            lowerMsg.includes('not registered')) {
          info.registrationNumber = 'N/A'  // Mark as skipped
          responseText = "No problem! Now, what's your head office address?"
        } else {
          const rcMatch = message.match(/(?:RC\.?\s*)?([0-9]+)/i)
          if (rcMatch) {
            info.registrationNumber = rcMatch[1]
            responseText = `Got it! RC ${info.registrationNumber}.\n\nWhat's your head office address?`
          } else {
            info.registrationNumber = message.trim()
            responseText = `Noted! RC ${info.registrationNumber}.\n\nWhat's your head office address?`
          }
        }
      }
      // Step 3: Head office address
      else if (!hasHeadOffice) {
        const lowerMsg = message.toLowerCase().trim()
        
        if (lowerMsg === 'skip' || lowerMsg === 'no' || lowerMsg === 'none' || lowerMsg === 'nope' || lowerMsg.includes('dont have') || lowerMsg.includes("don't have") || lowerMsg.includes('i dont') || lowerMsg.includes("i don't") || lowerMsg.includes('no head') || lowerMsg.includes('no office')) {
          info.headOffice = 'N/A'
          responseText = "No problem! Do you have another office address? If not, say 'skip'."
        } else {
          info.headOffice = message.trim()
          responseText = `Perfect! I've saved your head office address.\n\nDo you have another office address? If not, say 'skip'.`
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
          responseText = "Understood! Now, what are your phone numbers? You can provide one or more."
        } else {
          info.otherAddress = message.trim()
          responseText = `Great! I've added the second address.\n\nWhat are your phone numbers?`
        }
      }
      // Step 5: Phone numbers
      else if (!hasPhones) {
        const phoneNumbers = message.match(/[+]?[0-9-()\s]+/g)
        if (phoneNumbers) {
          info.phones = phoneNumbers.map(p => p.trim())
          responseText = `Perfect! I've saved ${info.phones.length} phone number${info.phones.length > 1 ? 's' : ''}.\n\nWhat's your email address?`
        } else {
          info.phones = [message.trim()]
          responseText = `Got it!\n\nNow, what's your email address?`
        }
      }
      // Step 6: Email address
      else if (!hasEmail) {
        info.email = message.trim()
        
        // Filter out N/A values for display
        const displayRC = info.registrationNumber !== 'N/A' ? info.registrationNumber : ''
        const displayHeadOffice = info.headOffice !== 'N/A' ? info.headOffice : ''
        const displayOther = info.otherAddress !== 'N/A' ? info.otherAddress : ''
        
        responseText = `Excellent! I now have all your information:\n\n📋 Organization: ${info.organizationName}\n${displayRC ? `📝 RC: ${displayRC}\n` : ''}${displayHeadOffice ? `📍 Head Office: ${displayHeadOffice}\n` : ''}${displayOther ? `📍 Other: ${displayOther}\n` : ''}📞 Phone: ${info.phones.join(', ')}\n📧 Email: ${info.email}\n\nWhat format would you like for your letterhead?`
        addAiMessage(responseText, [
          { type: 'format_png', label: 'PNG', variant: 'secondary' },
          { type: 'format_jpeg', label: 'JPEG', variant: 'secondary' },
          { type: 'format_pdf', label: 'PDF', variant: 'secondary' }
        ])
        return
      }
      // Already have all info
      else {
        responseText = "I already have all your information. What format would you like for your letterhead?"
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
      addAiMessage('Great! PNG format selected. Would you like to generate your letterhead now?', [
        { type: 'generate', label: 'Generate Letterhead', variant: 'primary' },
        { type: 'upload_logo', label: 'Add Logo First', variant: 'secondary' }
      ])
    } else if (actionType === 'format_jpeg') {
      selectedFormat.value = 'jpeg'
      addAiMessage('Great! JPEG format selected. Would you like to generate your letterhead now?', [
        { type: 'generate', label: 'Generate Letterhead', variant: 'primary' },
        { type: 'upload_logo', label: 'Add Logo First', variant: 'secondary' }
      ])
    } else if (actionType === 'format_pdf') {
      selectedFormat.value = 'pdf'
      addAiMessage('Great! PDF format selected. Would you like to generate your letterhead now?', [
        { type: 'generate', label: 'Generate Letterhead', variant: 'primary' },
        { type: 'upload_logo', label: 'Add Logo First', variant: 'secondary' }
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
    generatingMessage.value = 'Generating your letterhead...'
    
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
      
      addAiMessage(
        "✅ Your letterhead is ready! Here's a preview below.\n\nWould you like to download it?",
        [
          { type: `download_${selectedFormat.value}`, label: `Download ${selectedFormat.value.toUpperCase()}`, variant: 'primary' }
        ]
      )
      
    } catch (error) {
      console.error('Preview generation error:', error)
      addAiMessage("Sorry, I couldn't generate the preview. Please try again.")
    } finally {
      isGeneratingPreview.value = false
    }
  }
  // Download letterhead
  async function downloadLetterHead(format: 'svg' | 'png' | 'jpeg' | 'pdf') {
    try {
      addAiMessage(`Preparing your letterhead in ${format.toUpperCase()} format...`)
      
      // Prepare data for rendering
      const data: LetterHeadData = {
        organizationName: extractedInfo.value.organizationName,
        registrationNumber: extractedInfo.value.registrationNumber,
        headOffice: extractedInfo.value.headOffice,
        otherAddress: extractedInfo.value.otherAddress,
        phones: extractedInfo.value.phones,
        email: extractedInfo.value.email,
        logoDataUrl: extractedInfo.value.logoDataUrl,
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
      
      addAiMessage(`✅ Your letterhead ${format.toUpperCase()} is downloading!`)
      
    } catch (error) {
      console.error('Download error:', error)
      addAiMessage(`Sorry, I couldn't download the ${format.toUpperCase()}. Please try again.`)
    }
  }
  
  // Handle logo upload
  async function uploadLogo(file: File) {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        extractedInfo.value.logoDataUrl = e.target?.result as string
        addAiMessage("✓ Logo uploaded successfully! Your letterhead will include your logo.")
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
    
    // Computed
    isAuthenticated,
    userName,
    userTokens,
    hasMinimumInfo,
    
    // Methods
    handleSendMessage,
    handleMessageAction,
    initializeChat,
    handleLogoUpload: uploadLogo
  }
}
