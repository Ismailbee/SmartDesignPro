/**
 * Letterhead Chat Composable
 * Handles conversational letterhead creation with AI extraction
 */

import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user.store'
import { renderLetterHead, downloadSVG, downloadAsPng, downloadAsJpeg, downloadAsPdf, updateLetterHeadBrandColor, type LetterHeadData } from '@/services/svgTemplateService'

export interface ChatMessage {
  id: number
  text: string
  sender: 'user' | 'ai'
  time: string
  type?: 'preview' | 'normal'
  actions?: Array<{ type: string; label: string; variant?: string }>
}

export interface ExtractedLetterHeadInfo {
  organizationName: string
  registrationNumber: string
  rcNumberAttempts: number // Track validation attempts
  headOffice: string
  otherAddress: string
  phones: string[]
  emails: string[]
  motto: string // Motto field above description
  description: string // Description field when optional fields are not included
  logoDataUrl?: string
  includeOptionalFields?: boolean // Control whether to show Our Ref, Your Ref, Date
  referenceFields: {
    ourRef: string
    yourRef: string
    date: string
  }
}

// Enhanced field confidence and validation system
export interface FieldClassification {
  value: string
  confidence: number // 0-1 score
  type: 'organization' | 'rc_number' | 'office_address' | 'head_office' | 'email' | 'phone' | 'unknown'
  originalSegment: string
  needsConfirmation: boolean
}

export interface ExtractedFieldsWithConfidence {
  organizationName: FieldClassification | null
  registrationNumber: FieldClassification | null
  headOffice: FieldClassification | null
  otherAddress: FieldClassification | null
  description: FieldClassification | null
  motto: FieldClassification | null
  phones: FieldClassification[]
  emails: FieldClassification[]
  unclassified: FieldClassification[]
  needsUserConfirmation: boolean
}

export interface FieldValidationState {
  confirmed: Set<string> // Field names that are confirmed
  pending: Map<string, FieldClassification[]> // Fields awaiting user clarification
  rejected: Set<string> // Fields user has rejected
}

// Stage tracking for strict workflow
export interface StageStatus {
  currentStage: 1 | 2 | 3
  step: 'initial' | 'collecting' | 'confirming' | 'format_selection'
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
    let cleanText = text
      .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // All emojis
      .replace(/[\u{2600}-\u{27BF}]/gu, '')   // Misc symbols
      .replace(/\n+/g, '. ')                   // Newlines to pauses
      .replace(/\s+/g, ' ')
      .trim()
    
    // Extract only the first sentence/line/statement
    const firstSentenceMatch = cleanText.match(/^[^.!?\n]+[.!?]?/)
    if (firstSentenceMatch) {
      cleanText = firstSentenceMatch[0].trim()
    }
    
    if (!cleanText) return
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    utterance.lang = 'en-US'
    
    // Always use Samantha's voice
    const voices = window.speechSynthesis.getVoices()
    const samanthaVoice = voices.find(v => v.name.includes('Samantha'))
    
    if (samanthaVoice) utterance.voice = samanthaVoice
    
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
  const messageQueue = ref<Array<{text: string, actions?: ChatMessage['actions'], type?: 'preview' | 'normal'}>>([]) // Queue for delayed messages
  const isGeneratingPreview = ref(false)
  const isVoiceEnabled = ref(true) // TTS enabled by default
  const showLetterHeadPreview = ref(false)
  const letterHeadChatRequestId = ref(0)
  const generatingMessage = ref('')
  const previewImageUrl = ref<string>('')
  const selectedFormat = ref<'png' | 'jpeg' | 'pdf'>('png')
  
  // Color configuration state
  const primaryBrandColor = ref('#058A6C')
  const showColorPalette = ref(false)
  const showCorrectionBlock = ref(false)
  const showDownloadMenu = ref(false)
  
  // Font configuration state
  const showFontSelector = ref(false)
  const selectedOrgFont = ref('Montserrat ExtraBold')
  
  // Background configuration state
  const currentBackgroundId = ref<number | null>(null)
  const currentTemplateName = ref<string>('letter head') // Track current template
  
  // Stage tracking state
  const stageStatus = ref<StageStatus>({
    currentStage: 1,
    step: 'initial'
  })
  
  // Track if logo message has been shown
  const logoMessageShown = ref(false)

  // Track if user used manual entry
  const usedManualEntry = ref(false)

  // Correction state for Stage 1
  const stage1Corrections = ref({
    organizationName: '',
    registrationNumber: '',
    headOffice: '',
    otherAddress: '',
    emails: [] as string[],
    phones: [] as string[],
    description: '',
    motto: '',
    isEditing: false,
    showMenu: false,
    editedFields: new Set<string>()
  })
  
  const extractedInfo = ref<ExtractedLetterHeadInfo>({
    organizationName: '',
    registrationNumber: '',
    rcNumberAttempts: 0,
    headOffice: '',
    otherAddress: '',
    phones: [],
    emails: [],
    motto: '',
    description: '',
    includeOptionalFields: true,
    referenceFields: {
      ourRef: '',
      yourRef: '',
      date: ''
    }
  })

  // Field validation and confidence tracking
  const fieldValidation = ref<FieldValidationState>({
    confirmed: new Set<string>(),
    pending: new Map<string, FieldClassification[]>(),
    rejected: new Set<string>()
  })

  const lastExtractedFields = ref<ExtractedFieldsWithConfidence | null>(null)

  // Computed
  const isAuthenticated = computed(() => !!authStore.isAuthenticated)
  const userName = computed(() => userStore.user?.name?.split(' ')[0] || '')
  const userTokens = computed(() => userStore.user?.tokens ?? 0)
  
  // Check if we have minimum required info
  const hasMinimumInfo = computed(() => {
    const info = extractedInfo.value
    return !!(info.organizationName && (info.headOffice || info.emails.length > 0 || info.phones.length > 0))
  })

  // Generate specific missing field message
  function generateMissingFieldMessage(): string {
    const info = extractedInfo.value
    const missing: string[] = []
    
    if (!info.organizationName) {
      missing.push('organization name')
    }
    
    const hasContact = info.headOffice || info.emails.length > 0 || info.phones.length > 0
    if (!hasContact) {
      const contactMethods: string[] = []
      if (!info.headOffice) contactMethods.push('address')
      if (info.emails.length === 0) contactMethods.push('email')
      if (info.phones.length === 0) contactMethods.push('phone')
      
      if (contactMethods.length === 3) {
        missing.push('at least one contact method (address, email, or phone)')
      } else {
        missing.push(contactMethods.join(' or '))
      }
    }
    
    if (missing.length === 1) {
      return `I need your ${missing[0]} to generate the letterhead.`
    } else if (missing.length === 2) {
      return `I need your ${missing.join(' and ')} to generate the letterhead.`
    }
    
    return "I need at least your organization name and one contact method (address, phone, or email) to generate the letterhead."
  }
  
  // Build context for AI
  function buildChatContext(): string {
    const info = extractedInfo.value
    const parts: string[] = []
    
    if (info.organizationName) parts.push(`Organization: ${info.organizationName}`)
    if (info.registrationNumber) parts.push(`RC No: ${info.registrationNumber}`)
    if (info.headOffice) parts.push(`Head Office: ${info.headOffice}`)
    if (info.otherAddress) parts.push(`Address: ${info.otherAddress}`)
    if (info.phones.length > 0) parts.push(`Phones: ${info.phones.join(', ')}`)
    if (info.emails.length > 0) parts.push(`Email(s): ${info.emails.join(', ')}`)
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
  
  // Add AI message with optional TTS
  function addAiMessage(text: string, actions?: ChatMessage['actions'], type?: 'preview' | 'normal') {
    // If currently analyzing, queue the message instead of adding immediately
    if (isAnalyzing.value) {
      messageQueue.value.push({ text, actions, type })
      return
    }
    
    // Otherwise add immediately
    chatMessages.value.push({
      id: Date.now(),
      text,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: type || 'normal',
      actions
    })
    
    // Speak the message if voice is enabled and it's not a preview message
    if (isVoiceEnabled.value && type !== 'preview' && text) {
      speakText(text)
    }
  }
  
  // Flush queued messages to chat
  function flushMessageQueue() {
    const messages = [...messageQueue.value]
    messageQueue.value = []
    
    messages.forEach(msg => {
      chatMessages.value.push({
        id: Date.now() + Math.random(), // Ensure unique IDs
        text: msg.text,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: msg.type || 'normal',
        actions: msg.actions
      })
      
      // Speak the message if voice is enabled and it's not a preview message
      if (isVoiceEnabled.value && msg.type !== 'preview' && msg.text) {
        speakText(msg.text)
      }
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

  // Detect if message contains letterhead-related information
  function detectLetterheadIntent(message: string): boolean {
    const lowerMsg = message.toLowerCase()
    
    // Keywords that indicate letterhead intent
    const letterheadKeywords = [
      'organization', 'company', 'business', 'firm', 'corp', 'ltd', 'limited',
      'rc number', 'registration', 'office address', 'head office', 
      'email', 'phone', 'contact', 'letterhead', '@'
    ]
    
    // Patterns that suggest letterhead data
    const patterns = [
      /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/, // Email
      /\+?[0-9-()+\s]{7,}/, // Phone number
      /\brc\s*[0-9]+\b/i, // RC number
      /\b[0-9]{6,}\b/, // Potential RC number
    ]
    
    // Check for keywords
    const hasKeywords = letterheadKeywords.some(keyword => lowerMsg.includes(keyword))
    
    // Check for patterns
    const hasPatterns = patterns.some(pattern => pattern.test(message))
    
    // Check if message has comma-separated structure (like letterhead data)
    const commaSeparated = message.includes(',') && message.split(',').length >= 3
    
    return hasKeywords || hasPatterns || commaSeparated
  }

  // Detect color request in user message
  function detectColorRequest(message: string): { hasColorRequest: boolean; backgroundId: number | null; colorName: string | null } {
    const lowerMsg = message.toLowerCase()
    
    // Color keywords that trigger color request detection
    const colorTriggers = ['color', 'colour', 'background', 'design', 'theme']
    const hasColorTrigger = colorTriggers.some(trigger => lowerMsg.includes(trigger))
    
    if (!hasColorTrigger) {
      return { hasColorRequest: false, backgroundId: null, colorName: null }
    }
    
    // Map color names to background IDs
    const colorMap: Record<string, number[]> = {
      'green': [1, 3, 10, 17],
      'blue': [2, 11, 18, 19],
      'navy': [11],
      'cyan': [18, 19],
      'teal': [6, 17],
      'orange': [4, 5],
      'red': [7, 9],
      'purple': [12, 13],
      'brown': [14],
      'gold': [15, 16],
      'tan': [14, 15, 16]
    }
    
    // Check for color mentions
    for (const [colorName, bgIds] of Object.entries(colorMap)) {
      if (lowerMsg.includes(colorName)) {
        // Return the first background ID for this color
        return { hasColorRequest: true, backgroundId: bgIds[0], colorName }
      }
    }
    
    return { hasColorRequest: false, backgroundId: null, colorName: null }
  }

  // Handle color change request
  async function handleColorRequest(backgroundId: number, colorName: string) {
    const { getBackgroundColor } = await import('@/services/svgTemplateService')
    
    // Set the new background and matching color
    currentBackgroundId.value = backgroundId
    primaryBrandColor.value = getBackgroundColor(backgroundId)
    
    // If preview exists, regenerate with new color
    if (previewImageUrl.value) {
      // Clear preview and show loading
      previewImageUrl.value = ''
      isGeneratingPreview.value = true
      generatingMessage.value = `Changing to ${colorName} design...`
      
      try {
        // Wait 3 seconds
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        // Prepare data with new background
        const data: LetterHeadData = {
          organizationName: extractedInfo.value.organizationName,
          registrationNumber: extractedInfo.value.registrationNumber,
          headOffice: extractedInfo.value.headOffice,
          otherAddress: extractedInfo.value.otherAddress,
          phones: extractedInfo.value.phones,
          emails: extractedInfo.value.emails,
          motto: extractedInfo.value.motto,
          description: extractedInfo.value.description,
          logoDataUrl: extractedInfo.value.logoDataUrl,
          primaryBrandColor: primaryBrandColor.value,
          backgroundId: currentBackgroundId.value,
          includeOptionalFields: extractedInfo.value.includeOptionalFields,
          selectedOrgFont: selectedOrgFont.value,
          referenceFields: {
            ref: extractedInfo.value.referenceFields.ourRef,
            date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
          }
        }
        
        // Render the SVG with new background
        const { svg: renderedSvg, backgroundId, templateName } = await renderLetterHead(data)
        
        // Save the background ID and template name
        currentBackgroundId.value = backgroundId
        currentTemplateName.value = templateName
        
        // Create blob URL for preview
        const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
        previewImageUrl.value = URL.createObjectURL(blob)
        
        messageQueue.value.push({ text: `I've changed your letterhead to ${colorName}!` })
      } catch (error) {
        console.error('Color change error:', error)
        messageQueue.value.push({ text: "Sorry, I couldn't change the color. Please try again." })
      } finally {
        isGeneratingPreview.value = false
        generatingMessage.value = ''
      }
    } else {
      // No preview yet - color will be used when generating
      messageQueue.value.push({ text: `Great! I'll use a ${colorName} design for your letterhead.` })
    }
  }

  // Enhanced letterhead information extraction with label-based extraction
  function extractLetterheadInfo(message: string): ExtractedFieldsWithConfidence {
    // STEP 1 — Label-Based Extraction (Priority)
    const labelExtracted = extractUsingLabels(message)
    
    // STEP 2 — Strong patterns for remaining unlabeled data
    const normalizedText = normalizeText(message)
    const strongPatterns = extractStrongPatterns(normalizedText)
    
    // STEP 3 — Merge labeled and pattern-based results
    const mergedResults = mergeLabeledAndPatterns(labelExtracted, strongPatterns)
    
    return assembleExtractedFields(mergedResults)
  }

  // STEP 1: Label-Based Extraction Rules
  function extractUsingLabels(text: string): {
    organizationName: string | null
    headOffice: string | null
    otherAddress: string | null
    emails: string[]
    phones: string[]
    rcNumbers: string[]
    description: string | null
    motto: string | null
  } {
    // Recognized Labels (case-insensitive)
    const labels = {
      organization: /\b(organization\s+name|company\s+name|business\s+name|my\s+organization\s+name\s+is|my\s+organization\s+is|organization|company|business)\s*:?\s*/gi,
      phone: /\b(tel|tell|phone|mobile|phone\s+number|telephone)\s*:?\s*/gi,
      address: /\b(address|location|branch|head\s+office|headquarters)\s*:?\s*/gi,
      email: /\b(email|emails|e-mail|mail)\s*:?\s*/gi,
      rc: /\b(rc|rc\s+number|registration\s+number|registration|reg\s+number|reg)\s*:?\s*/gi,
      description: /\b(description)\s*:?\s*/gi,
      motto: /\b(motto)\s*:?\s*/gi
    }

    let organizationName: string | null = null
    let headOffice: string | null = null
    let otherAddress: string | null = null
    let description: string | null = null
    let motto: string | null = null
    const emails: string[] = []
    const phones: string[] = []
    const rcNumbers: string[] = []

    // Find all label positions in order
    const labelMatches: Array<{
      type: keyof typeof labels
      start: number
      end: number
      label: string
    }> = []

    Object.entries(labels).forEach(([type, regex]) => {
      let match
      regex.lastIndex = 0 // Reset regex
      while ((match = regex.exec(text)) !== null) {
        labelMatches.push({
          type: type as keyof typeof labels,
          start: match.index,
          end: match.index + match[0].length,
          label: match[0]
        })
      }
    })

    // Sort by position in text
    labelMatches.sort((a, b) => a.start - b.start)

    // Extract text between labels
    for (let i = 0; i < labelMatches.length; i++) {
      const currentLabel = labelMatches[i]
      const nextLabel = labelMatches[i + 1]
      
      const startPos = currentLabel.end
      const endPos = nextLabel ? nextLabel.start : text.length
      
      let extractedValue = text.slice(startPos, endPos).trim()
      
      // Clean up extracted value - remove trailing punctuation and extra spaces
      // But preserve periods in organization names and addresses as they might be intentional
      extractedValue = extractedValue
        .replace(/[,;!?]*$/, '') // Remove trailing punctuation but keep periods
        .replace(/\s+/g, ' ')
        .trim()

      if (!extractedValue) continue

      // Assign to appropriate field based on label type
      switch (currentLabel.type) {
        case 'organization':
          if (!organizationName) {
            // Organization Name Disambiguation Rules
            const cleanOrgName = applyOrganizationRules(extractedValue)
            if (cleanOrgName.organizationName) {
              organizationName = cleanOrgName.organizationName
              // If there's remaining address text, add it to address
              if (cleanOrgName.remainingAddress && !otherAddress) {
                otherAddress = cleanOrgName.remainingAddress
              }
            }
          }
          break
        case 'phone':
          const phoneMatches = extractPhonesFromText(extractedValue)
          phones.push(...phoneMatches)
          break
        case 'address':
          // Check if the label specifically says "head office" or "headquarters"
          const isHeadOfficeLabel = /head\s+office|headquarters/i.test(currentLabel.label)
          
          if (isHeadOfficeLabel) {
            // If labeled as "Head Office", always use headOffice field
            if (!headOffice) {
              headOffice = extractedValue
            }
          } else {
            // Otherwise treat as branch/other address
            if (!otherAddress) {
              otherAddress = extractedValue
            } else if (!headOffice) {
              headOffice = extractedValue
            }
          }
          break
        case 'email':
          const emailMatches = extractEmailsFromText(extractedValue)
          emails.push(...emailMatches)
          break
        case 'rc':
          const rcMatches = extractRCFromText(extractedValue)
          rcNumbers.push(...rcMatches)
          break
        case 'description':
          if (!description) {
            description = extractedValue
          }
          break
        case 'motto':
          if (!motto) {
            motto = extractedValue
          }
          break
      }
    }

    return {
      organizationName,
      headOffice,
      otherAddress,
      emails,
      phones,
      rcNumbers,
      description,
      motto
    }
  }

  // Organization Name Disambiguation Rules
  function applyOrganizationRules(text: string): {
    organizationName: string | null
    remainingAddress: string | null
  } {
    // Business keywords for validation
    const businessKeywords = ['enterprise', 'enterprises', 'ventures', 'ltd', 'limited', 'global', 'services', 'company', 'corp', 'corporation', 'inc', 'incorporated', 'plc', 'group', 'holdings', 'solutions', 'technologies', 'tech', 'consulting']
    
    // Address stop words - organization name must STOP when these appear
    const addressStopWords = ['road', 'street', 'close', 'estate', 'avenue', 'drive', 'lane', 'crescent', 'square', 'place', 'way', 'boulevard', 'building', 'floor', 'suite', 'apartment', 'unit', 'block', 'plot', 'complex', 'state', 'city', 'town', 'village', 'area', 'district', 'zone', 'minna', 'sale', 'market', 'plaza', 'center', 'centre', 'barikin']
    
    const words = text.split(/\s+/)
    let organizationWords = []
    let addressWords = []
    let foundAddressSignal = false
    
    // Process words one by one
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase()
      
      // Check if this word is an address signal
      const isAddressSignal = addressStopWords.some(stopWord => word.includes(stopWord))
      const hasNumber = /\d/.test(word)
      
      // If we hit an address signal or number, stop organization extraction
      if (isAddressSignal || hasNumber) {
        foundAddressSignal = true
        addressWords.push(words[i])
        continue
      }
      
      // If we haven't hit an address signal and haven't reached 6 words
      if (!foundAddressSignal && organizationWords.length < 6) {
        organizationWords.push(words[i])
      } else {
        // Everything else goes to address
        addressWords.push(words[i])
      }
    }
    
    // Validate organization name
    const potentialOrgName = organizationWords.join(' ').trim()
    
    // Check if it contains business keywords
    const hasBusinessKeywords = businessKeywords.some(keyword => 
      potentialOrgName.toLowerCase().includes(keyword)
    )
    
    // Organization name must:
    // 1. Contain business keywords
    // 2. Be reasonable length (2-6 words)
    // 3. Not contain address stop words
    // 4. Not contain numbers
    const isValidOrgName = hasBusinessKeywords && 
                          organizationWords.length >= 2 && 
                          organizationWords.length <= 6 &&
                          !addressStopWords.some(stopWord => potentialOrgName.toLowerCase().includes(stopWord)) &&
                          !/\d/.test(potentialOrgName)
    
    return {
      organizationName: isValidOrgName ? potentialOrgName : null,
      remainingAddress: addressWords.length > 0 ? addressWords.join(' ').trim() : null
    }
  }

  // Helper functions for extracting specific data types from labeled text
  function extractPhonesFromText(text: string): string[] {
    const phonePattern = /\b(?:\+?234)?\s*(?:070|071|080|081|090|091)\s*\d{8}\b/g
    const matches = text.match(phonePattern) || []
    return [...new Set(matches.map(phone => phone.replace(/\s+/g, '').trim()))]
  }

  function extractEmailsFromText(text: string): string[] {
    const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g
    return text.match(emailPattern) || []
  }

  function extractRCFromText(text: string): string[] {
    const rcPattern = /\b\d{6,8}\b/g
    return text.match(rcPattern) || []
  }

  // STEP 2: Merge labeled results with pattern-based extraction
  function mergeLabeledAndPatterns(labeled: any, patterns: any): any {
    return {
      organizationName: labeled.organizationName,
      headOffice: labeled.headOffice,
      otherAddress: labeled.otherAddress,
      emails: labeled.emails.length > 0 ? labeled.emails : patterns.emails,
      phones: labeled.phones.length > 0 ? labeled.phones : patterns.phones,
      rcNumbers: labeled.rcNumbers.length > 0 ? labeled.rcNumbers : patterns.rcNumbers,
      description: labeled.description,
      motto: labeled.motto
    }
  }

  // STEP 1: Normalize text (preserve labels for label-based extraction)
  function normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s@.+()-]/g, ' ') // Keep essential characters for emails, phones
      .replace(/\s+/g, ' ')
      .trim()
  }

  // STEP 2: Extract using strong patterns (regex-style thinking)
  function extractStrongPatterns(text: string): {
    emails: string[]
    phones: string[]
    rcNumbers: string[]
  } {
    const emails: string[] = []
    const phones: string[] = []
    const rcNumbers: string[] = []

    // Extract emails - anything matching valid email pattern
    const emailPattern = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g
    const emailMatches = text.match(emailPattern)
    if (emailMatches) {
      emails.push(...emailMatches)
    }

    // Extract phone numbers - Nigerian numbers with specific prefixes
    const phonePatterns = [
      /\b(070|071|080|081|090|091)\d{8}\b/g, // Local format
      /\b\+?234(70|71|80|81|90|91)\d{8}\b/g, // International format
      /\b(070|071|080|081|090|091)[\s\-]?\d{4}[\s\-]?\d{4}\b/g, // Formatted
      /\b\+?234[\s\-]?(70|71|80|81|90|91)[\s\-]?\d{4}[\s\-]?\d{4}\b/g // Formatted international
    ]
    
    const phoneSet = new Set<string>() // Use Set to avoid duplicates
    
    phonePatterns.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(phone => {
          // Normalize phone number by removing spaces and dashes for comparison
          const normalizedPhone = phone.replace(/[\s\-]/g, '')
          phoneSet.add(normalizedPhone.trim())
        })
      }
    })
    
    phones.push(...Array.from(phoneSet))

    // Extract RC numbers - digits with RC keywords or 7-digit numeric values
    const rcPatterns = [
      /\b(?:rc|registration)[\s:]*(\d{1,7})\b/g, // With RC keyword
      /\b(\d{7})\b/g // Exactly 7 digits (could be RC number)
    ]
    
    rcPatterns.forEach(pattern => {
      const matches = [...text.matchAll(pattern)]
      matches.forEach(match => {
        const number = match[1]
        if (number && number.length <= 7 && !phones.some(phone => phone.includes(number))) {
          rcNumbers.push(number)
        }
      })
    })

    return { emails, phones, rcNumbers }
  }

  // STEP 3: Remove extracted data from text
  function removeExtractedData(text: string, extracted: {
    emails: string[]
    phones: string[]
    rcNumbers: string[]
  }): string {
    let cleanedText = text

    // Remove emails
    extracted.emails.forEach(email => {
      cleanedText = cleanedText.replace(new RegExp(email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), ' ')
    })

    // Remove phone numbers (need to handle formatted versions)
    extracted.phones.forEach(phone => {
      const cleanPhone = phone.replace(/[^\d+]/g, '')
      // Remove various formatted versions
      const phoneRegexes = [
        new RegExp(phone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        new RegExp(cleanPhone.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
      ]
      phoneRegexes.forEach(regex => {
        cleanedText = cleanedText.replace(regex, ' ')
      })
    })

    // Remove RC numbers and their keywords
    extracted.rcNumbers.forEach(rc => {
      cleanedText = cleanedText.replace(new RegExp(`\\b(?:rc|registration)[\\s:]*${rc}\\b`, 'g'), ' ')
      cleanedText = cleanedText.replace(new RegExp(`\\b${rc}\\b`, 'g'), ' ')
    })

    return cleanedText.replace(/\s+/g, ' ').trim()
  }

  // STEP 4: Infer remaining fields using heuristics
  function inferRemainingFields(remainingText: string, strongPatterns: {
    emails: string[]
    phones: string[]
    rcNumbers: string[]
  }): {
    organizationName: string | null
    headOffice: string | null
    otherAddress: string | null
    emails: string[]
    phones: string[]
    rcNumbers: string[]
  } {
    let organizationName: string | null = null
    let headOffice: string | null = null
    let otherAddress: string | null = null

    if (!remainingText.trim()) {
      return {
        organizationName,
        headOffice,
        otherAddress,
        emails: strongPatterns.emails,
        phones: strongPatterns.phones,
        rcNumbers: strongPatterns.rcNumbers
      }
    }

    // Split remaining text into potential segments
    const segments = remainingText.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 0)
    
    // If no clear segments, treat as one piece
    const workingSegments = segments.length > 0 ? segments : [remainingText]

    // Organization Name Disambiguation Rules
    // Organization names are compact - must STOP at address signals
    const orgKeywords = ['enterprise', 'enterprises', 'ventures', 'ltd', 'limited', 'global', 'services', 'company', 'corp', 'corporation', 'inc', 'incorporated', 'plc', 'group', 'holdings', 'solutions', 'technologies', 'tech', 'consulting']
    
    // Address stop words - organization name must STOP when these appear
    const addressStopWords = ['road', 'street', 'close', 'estate', 'avenue', 'drive', 'lane', 'crescent', 'square', 'place', 'way', 'boulevard', 'building', 'floor', 'suite', 'apartment', 'unit', 'block', 'plot', 'complex', 'state', 'city', 'town', 'village', 'area', 'district', 'zone', 'minna', 'sale', 'market', 'plaza', 'center', 'centre']
    
    // Split text into words for more granular analysis
    const allWords = remainingText.split(/\s+/)
    
    // Find organization name using strict rules
    for (const segment of workingSegments) {
      const words = segment.toLowerCase().split(/\s+/)
      
      // Check if segment has business keywords
      const hasOrgKeywords = orgKeywords.some(keyword => 
        words.some(word => word.includes(keyword))
      )
      
      // Check if segment contains address stop words
      const hasAddressStopWords = addressStopWords.some(stopWord => 
        words.some(word => word.includes(stopWord))
      )
      
      // Check if segment contains numbers
      const hasNumbers = /\d/.test(segment)
      
      // Strict organization name rules:
      // 1. Must contain business keywords
      // 2. Must be shorter than 6 words (compact)
      // 3. Must NOT contain address stop words
      // 4. Must NOT contain numbers
      if (hasOrgKeywords && words.length <= 6 && !hasAddressStopWords && !hasNumbers) {
        if (!organizationName) {
          organizationName = segment.trim()
        }
      }
      
      // If we found a business keyword but the segment is too long or has address words,
      // try to extract just the business part
      if (hasOrgKeywords && !organizationName) {
        const businessPart = extractBusinessPortion(segment, orgKeywords, addressStopWords)
        if (businessPart) {
          organizationName = businessPart
        }
      }
    }
    
    // Helper function to extract business portion before address signals
    function extractBusinessPortion(segment: string, orgKeywords: string[], addressStopWords: string[]): string | null {
      const words = segment.split(/\s+/)
      let businessPortion = []
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i].toLowerCase()
        
        // Stop if we hit an address stop word
        if (addressStopWords.some(stopWord => word.includes(stopWord))) {
          break
        }
        
        // Stop if we hit a number
        if (/\d/.test(word)) {
          break
        }
        
        businessPortion.push(words[i])
        
        // If we've accumulated a business portion and hit 6 words, stop
        if (businessPortion.length >= 6) {
          break
        }
      }
      
      // Only return if it contains business keywords and is reasonable length
      const hasBusinessKeyword = orgKeywords.some(keyword => 
        businessPortion.some(word => word.toLowerCase().includes(keyword))
      )
      
      if (hasBusinessKeyword && businessPortion.length >= 2 && businessPortion.length <= 6) {
        return businessPortion.join(' ')
      }
      
      return null
    }

    // Address detection - collect remaining location-related text
    const addressSegments = workingSegments.filter(segment => {
      // Skip if this segment was used as organization name
      if (organizationName && segment.includes(organizationName)) {
        // If organization name is part of this segment, extract the remaining address part
        const remaining = segment.replace(organizationName, '').trim()
        if (remaining.length > 2) {
          return true // This segment has address data
        }
        return false
      }
      
      // Include segments that contain location keywords
      const locationKeywords = ['road', 'street', 'close', 'estate', 'avenue', 'drive', 'lane', 'crescent', 'square', 'place', 'way', 'boulevard', 'building', 'floor', 'suite', 'apartment', 'unit', 'block', 'plot', 'complex', 'state', 'city', 'town', 'village', 'area', 'district', 'zone', 'lagos', 'abuja', 'kano', 'rivers', 'ogun', 'kaduna', 'katsina', 'oyo', 'niger', 'borno', 'minna', 'sale', 'market', 'plaza', 'center', 'centre']
      
      const hasLocationKeywords = locationKeywords.some(keyword => 
        segment.toLowerCase().includes(keyword)
      )
      
      const hasAddressPattern = /\b\d+\s+[a-zA-Z]/.test(segment) // Number followed by text
      
      // Include if it has location indicators or substantial remaining text that's not organization
      return hasLocationKeywords || hasAddressPattern || (segment.length > 10 && !organizationName)
    })
    
    // Clean up address segments - remove organization name portions
    const cleanedAddressSegments = addressSegments.map(segment => {
      if (organizationName && segment.includes(organizationName)) {
        return segment.replace(organizationName, '').trim()
      }
      return segment
    }).filter(segment => segment.length > 0)

    // Assign addresses - first address goes to other address, additional ones to head office
    if (cleanedAddressSegments.length > 0) {
      otherAddress = cleanedAddressSegments[0].trim()
      if (cleanedAddressSegments.length > 1) {
        headOffice = cleanedAddressSegments.slice(1).join(', ').trim()
      }
    }

    return {
      organizationName,
      headOffice,
      otherAddress,
      emails: strongPatterns.emails,
      phones: strongPatterns.phones,
      rcNumbers: strongPatterns.rcNumbers
    }
  }

  // Assemble final extracted fields
  function assembleExtractedFields(fields: {
    organizationName: string | null
    headOffice: string | null
    otherAddress: string | null
    emails: string[]
    phones: string[]
    rcNumbers: string[]
    description: string | null
    motto: string | null
  }): ExtractedFieldsWithConfidence {
    const result: ExtractedFieldsWithConfidence = {
      organizationName: fields.organizationName ? {
        value: fields.organizationName,
        confidence: 0.8,
        type: 'organization',
        originalSegment: fields.organizationName,
        needsConfirmation: false
      } : null,
      registrationNumber: fields.rcNumbers.length > 0 ? {
        value: fields.rcNumbers[0],
        confidence: 0.9,
        type: 'rc_number',
        originalSegment: fields.rcNumbers[0],
        needsConfirmation: false
      } : null,
      headOffice: fields.headOffice ? {
        value: fields.headOffice,
        confidence: 0.7,
        type: 'head_office',
        originalSegment: fields.headOffice,
        needsConfirmation: false
      } : null,
      otherAddress: fields.otherAddress ? {
        value: fields.otherAddress,
        confidence: 0.6,
        type: 'office_address',
        originalSegment: fields.otherAddress,
        needsConfirmation: false
      } : null,
      description: fields.description ? {
        value: fields.description,
        confidence: 0.8,
        type: 'description',
        originalSegment: fields.description,
        needsConfirmation: false
      } : null,
      motto: fields.motto ? {
        value: fields.motto,
        confidence: 0.8,
        type: 'motto',
        originalSegment: fields.motto,
        needsConfirmation: false
      } : null,
      phones: fields.phones.map(phone => ({
        value: phone,
        confidence: 0.95,
        type: 'phone',
        originalSegment: phone,
        needsConfirmation: false
      })),
      emails: fields.emails.map(email => ({
        value: email,
        confidence: 0.95,
        type: 'email',
        originalSegment: email,
        needsConfirmation: false
      })),
      unclassified: [],
      needsUserConfirmation: false
    }

    return result
  }

  // Validate completeness of extracted data
  function validateExtractedData(data: any): { isComplete: boolean; missingFields: string[] } {
    const required = [
      { field: 'organizationName', label: 'Organization Name' },
      { field: 'headOffice', label: 'Head Office Address' },
      { field: 'emails', label: 'Email Address' },
      { field: 'phones', label: 'Phone Number' }
    ]
    
    const missingFields: string[] = []
    
    for (const { field, label } of required) {
      if (field === 'emails' || field === 'phones') {
        if (!data[field] || data[field].length === 0) {
          missingFields.push(label)
        }
      } else {
        if (!data[field] || data[field].trim() === '') {
          missingFields.push(label)
        }
      }
    }
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    }
  }
  
  // Convert classified fields to extractedInfo format
  function convertClassifiedToExtracted(classified: ExtractedFieldsWithConfidence): Partial<ExtractedLetterHeadInfo> {
    return {
      organizationName: classified.organizationName?.value || '',
      registrationNumber: classified.registrationNumber?.value || '',
      headOffice: classified.headOffice?.value || '',
      otherAddress: classified.otherAddress?.value || '',
      description: classified.description?.value || '',
      motto: classified.motto?.value || '',
      emails: classified.emails.map(e => e.value),
      phones: classified.phones.map(p => p.value)
    }
  }
  
  // Ask user for field clarifications
  function requestFieldClarification(classified: ExtractedFieldsWithConfidence): void {
    let clarificationMsg = `🤔 **I need to clarify some information:**\n\n`
    const actions: Array<{ type: string; label: string; variant?: string; data?: any }> = []
    
    // Check for unclassified segments
    if (classified.unclassified.length > 0) {
      clarificationMsg += `**Unclassified information:**\n`
      classified.unclassified.forEach((item, index) => {
        clarificationMsg += `• "${item.value}"\n`
        actions.push({
          type: 'classify_field',
          label: `Classify "${item.value.substring(0, 20)}${item.value.length > 20 ? '...' : ''}"`,
          variant: 'secondary',
          data: { segment: item.value, index }
        })
      })
      clarificationMsg += '\n'
    }
    
    // Check for low confidence fields needing confirmation
    const lowConfidenceFields: Array<{ field: string; classification: FieldClassification }> = []
    
    if (classified.organizationName?.needsConfirmation) {
      lowConfidenceFields.push({ field: 'Organization Name', classification: classified.organizationName })
    }
    if (classified.headOffice?.needsConfirmation) {
      lowConfidenceFields.push({ field: 'Head Office', classification: classified.headOffice })
    }
    if (classified.otherAddress?.needsConfirmation) {
      lowConfidenceFields.push({ field: 'Address', classification: classified.otherAddress })
    }
    
    if (lowConfidenceFields.length > 0) {
      clarificationMsg += `**Please confirm these assignments:**\n`
      lowConfidenceFields.forEach(({ field, classification }) => {
        clarificationMsg += `• **${field}**: "${classification.value}"\n`
      })
      clarificationMsg += '\n'
      
      actions.push({
        type: 'confirm_field_assignments',
        label: 'Confirm All',
        variant: 'primary'
      })
    }
    
    actions.push({
      type: 'manual_field_entry',
      label: 'Enter Manually',
      variant: 'secondary'
    })
    
    addAiMessage(clarificationMsg, actions)
  }
  
  // Validate that all required fields are present and confirmed
  function validateFieldCompleteness(classified: ExtractedFieldsWithConfidence): { isComplete: boolean; missingFields: string[] } {
    const missingFields: string[] = []
    
    // Since we're skipping confirmation, just check if we have the data
    if (!classified.organizationName || !classified.organizationName.value) {
      missingFields.push('Organization Name')
    }
    
    // At least one contact method required - check for valid fields (ignore confirmation requirement)
    const hasValidEmail = classified.emails.some(email => email && email.value)
    const hasValidPhone = classified.phones.some(phone => phone && phone.value)
    const hasValidAddress = classified.headOffice && classified.headOffice.value
    
    if (!hasValidEmail && !hasValidPhone && !hasValidAddress) {
      missingFields.push('Contact Information (Email, Phone, or Address)')
    }
    
    return {
      isComplete: missingFields.length === 0,
      missingFields
    }
  }
  
// Handle main chat input with intelligent letterhead detection
  async function handleSendMessage() {
    if (!chatInputText.value.trim() || isAnalyzing.value) return

    const message = chatInputText.value.trim()
    chatInputText.value = ''

    // Add user message
    addUserMessage(message)
    
    // Check for confirmation/agreement to proceed (ok, yes, sure, etc.)
    const confirmationWords = ['ok', 'okay', 'yes', 'sure', 'proceed', 'continue', 'go ahead', 'sounds good', 'perfect', 'great', 'alright']
    const lowerMsg = message.toLowerCase().trim()
    const isConfirmation = confirmationWords.some(word => lowerMsg === word || lowerMsg.includes(word))
    
    // If user confirms and we have minimum info but no preview yet, generate it
    if (isConfirmation && hasMinimumInfo.value && !previewImageUrl.value) {
      isAnalyzing.value = true
      const startTime = Date.now()
      try {
        generateLetterHeadPreview()
        const elapsed = Date.now() - startTime
        const baseDelay = 1200
        const charDelay = message.length * 15
        const calculatedDelay = Math.min(baseDelay + charDelay, 4500)
        if (elapsed < calculatedDelay) {
          await new Promise(resolve => setTimeout(resolve, calculatedDelay - elapsed))
        }
      } catch (error) {
        console.error('Preview generation error:', error)
        messageQueue.value.push({ text: "I encountered an error. Please try again." })
      } finally {
        isAnalyzing.value = false
        flushMessageQueue()
      }
      return
    }
    
    // Check for color request first (can happen anytime)
    const colorRequest = detectColorRequest(message)
    if (colorRequest.hasColorRequest && colorRequest.backgroundId && colorRequest.colorName) {
      isAnalyzing.value = true
      const startTime = Date.now()
      try {
        await handleColorRequest(colorRequest.backgroundId, colorRequest.colorName)
        const elapsed = Date.now() - startTime
        const baseDelay = 1200
        const charDelay = message.length * 15
        const calculatedDelay = Math.min(baseDelay + charDelay, 4500)
        if (elapsed < calculatedDelay) {
          await new Promise(resolve => setTimeout(resolve, calculatedDelay - elapsed))
        }
      } catch (error) {
        console.error('Color request error:', error)
        messageQueue.value.push({ text: "I encountered an error. Please try again." })
      } finally {
        isAnalyzing.value = false
        flushMessageQueue()
      }
      return
    } else if (colorRequest.hasColorRequest && !colorRequest.backgroundId) {
      // Color requested but not available
      isAnalyzing.value = true
      const startTime = Date.now()
      messageQueue.value.push({ text: "I don't have that color in my backgrounds. You can use the 'Change Color' button in the preview to manually select your preferred color." })
      const elapsed = Date.now() - startTime
      const baseDelay = 1200
      const charDelay = message.length * 15
      const calculatedDelay = Math.min(baseDelay + charDelay, 4500)
      if (elapsed < calculatedDelay) {
        await new Promise(resolve => setTimeout(resolve, calculatedDelay - elapsed))
      }
      isAnalyzing.value = false
      flushMessageQueue()
      return
    }

    // Check if this is first interaction
    const hasAIMessage = chatMessages.value.some(msg => !msg.isUser)
    if (!hasAIMessage) {
      // Detect letterhead intent in first message
      const hasLetterheadIntent = detectLetterheadIntent(message)
      
      if (!hasLetterheadIntent) {
        // Show normal introductory guide
        showWelcomeMessage()
        return
      }
      
      // Process letterhead data directly
      isAnalyzing.value = true
      const startTime = Date.now()
      try {
        await handleLetterheadData(message, true)
        // Calculate dynamic delay based on message length
        const elapsed = Date.now() - startTime
        const baseDelay = 1200 // Base delay in ms
        const charDelay = message.length * 15 // 15ms per character
        const calculatedDelay = Math.min(baseDelay + charDelay, 4500) // Cap at 4.5s
        if (elapsed < calculatedDelay) {
          await new Promise(resolve => setTimeout(resolve, calculatedDelay - elapsed))
        }
      } catch (error) {
        console.error('Letterhead processing error:', error)
        messageQueue.value.push({ text: "I encountered an error. Please try again." })
      } finally {
        isAnalyzing.value = false
        flushMessageQueue() // Show queued messages after typing animation
      }
      return
    }
    
    // For subsequent messages, check for letterhead intent
    const hasLetterheadIntent = detectLetterheadIntent(message)
    
    if (hasLetterheadIntent) {
      // Process letterhead data
      isAnalyzing.value = true
      const startTime = Date.now()
      try {
        await handleLetterheadData(message)
        // Calculate dynamic delay based on message length
        const elapsed = Date.now() - startTime
        const baseDelay = 1200 // Base delay in ms
        const charDelay = message.length * 15 // 15ms per character
        const calculatedDelay = Math.min(baseDelay + charDelay, 4500) // Cap at 4.5s
        if (elapsed < calculatedDelay) {
          await new Promise(resolve => setTimeout(resolve, calculatedDelay - elapsed))
        }
      } catch (error) {
        console.error('Letterhead processing error:', error)
        messageQueue.value.push({ text: "I encountered an error. Please try again." })
      } finally {
        isAnalyzing.value = false
        flushMessageQueue() // Show queued messages after typing animation
      }
      return
    }
    
    // Process based on current stage for non-letterhead messages
    isAnalyzing.value = true
    const startTime = Date.now()
    
    try {
      if (stageStatus.value.currentStage === 1) {
        await handleStage1(message)
      } else if (stageStatus.value.currentStage === 3) {
        await handleStage3(message)
      } else {
        // Default response for unrecognized messages
        messageQueue.value.push({ text: "I'm here to help you create a letterhead. Please provide your organization details or type 'help' for guidance." })
      }
      // Calculate dynamic delay based on message length
      const elapsed = Date.now() - startTime
      const baseDelay = 1200 // Base delay in ms
      const charDelay = message.length * 15 // 15ms per character
      const calculatedDelay = Math.min(baseDelay + charDelay, 4500) // Cap at 4.5s
      if (elapsed < calculatedDelay) {
        await new Promise(resolve => setTimeout(resolve, calculatedDelay - elapsed))
      }
    } catch (error) {
      console.error('Stage processing error:', error)
      messageQueue.value.push({ text: "I encountered an error. Please try again." })
    } finally {
      isAnalyzing.value = false
      flushMessageQueue() // Show queued messages after typing animation
    }
  }
  
  // Handle letterhead data with enhanced field validation
  async function handleLetterheadData(message: string, isFirstMessage = false) {
    try {
      // Use enhanced extraction with confidence scoring
      const classifiedFields = extractLetterheadInfo(message)
      lastExtractedFields.value = classifiedFields
      
      // Skip clarification step - proceed directly with extracted data
      // Even if needsUserConfirmation is true, we'll use what we have
      
      // Convert classified fields to extracted format
      const extractedData = convertClassifiedToExtracted(classifiedFields)
      
      // Validate completeness
      const validation = validateFieldCompleteness(classifiedFields)
      
      if (!validation.isComplete) {
        // Some required fields are missing
        if (isFirstMessage) {
          // Show welcome and ask for missing fields
          showWelcomeMessage()
        }
        
        // Store partial data (only confirmed fields)
        updateExtractedInfoFromClassified(classifiedFields, true) // preserveExisting = true
        
        // Initialize correction state for potential editing
        initializeCorrectionState()
        
        // Show confirmation message with missing fields
        const confirmMsg = `I've captured some information, but I need you to clarify some fields.`
        
        addAiMessage(confirmMsg, [
          {
            label: 'Type Manually',
            action: 'show_correction_block',
            variant: 'primary'
          }
        ])
        
        // Set to collecting state
        stageStatus.value = {
          currentStage: 1,
          step: 'collecting'
        }
        
        return
      }
      
      // All required fields are present and confirmed - proceed with complete data
    updateExtractedInfoFromClassified(classifiedFields, false) // Don't preserve existing
    
    // Initialize correction state
    initializeCorrectionState()
    
    // Build confirmation message
    const confirmMsg = buildConfirmationMessage()
    
    addAiMessage(confirmMsg, [
      {
        label: 'Looks Good',
        action: 'skip_missing_fields',
        variant: 'primary'
      },
      {
        label: 'Edit Details',
        action: 'show_correction_block',
        variant: 'secondary'
      }
    ])
    
    stageStatus.value = {
      currentStage: 3,
      step: 'initial'
    }
    } catch (error) {
      console.error('Error in handleLetterheadData:', error)
      throw error // Re-throw to be caught by outer try-catch
    }
  }
  
  // Update extractedInfo from classified fields
  function updateExtractedInfoFromClassified(classified: ExtractedFieldsWithConfidence, preserveExisting: boolean) {
    if (!preserveExisting || !extractedInfo.value.organizationName) {
      extractedInfo.value.organizationName = classified.organizationName?.value || ''
    }
    if (!preserveExisting || !extractedInfo.value.registrationNumber) {
      extractedInfo.value.registrationNumber = classified.registrationNumber?.value || ''
    }
    if (!preserveExisting || !extractedInfo.value.headOffice) {
      extractedInfo.value.headOffice = classified.headOffice?.value || ''
    }
    if (!preserveExisting || !extractedInfo.value.otherAddress) {
      extractedInfo.value.otherAddress = classified.otherAddress?.value || ''
    }
    if (!preserveExisting || !extractedInfo.value.description) {
      extractedInfo.value.description = classified.description?.value || ''
    }
    if (!preserveExisting || !extractedInfo.value.motto) {
      extractedInfo.value.motto = classified.motto?.value || ''
    }
    if (!preserveExisting || extractedInfo.value.emails.length === 0) {
      extractedInfo.value.emails = classified.emails.map(e => e.value)
    }
    if (!preserveExisting || extractedInfo.value.phones.length === 0) {
      extractedInfo.value.phones = classified.phones.map(p => p.value)
    }
  }
  
  // Initialize correction state with current data
  function initializeCorrectionState() {
    stage1Corrections.value = {
      organizationName: extractedInfo.value.organizationName,
      registrationNumber: extractedInfo.value.registrationNumber || 'N/A',
      headOffice: extractedInfo.value.headOffice,
      otherAddress: extractedInfo.value.otherAddress || 'N/A',
      emails: [...extractedInfo.value.emails],
      phones: [...extractedInfo.value.phones],
      description: extractedInfo.value.description || '',
      motto: extractedInfo.value.motto || '',
      isEditing: true,
      showMenu: false,
      editedFields: new Set()
    }
  }
  
  // Build confirmation message showing extracted data
  function buildConfirmationMessage(): string {
    const lines = ['I\'ve extracted the following information:\n']
    
    if (extractedInfo.value.organizationName) {
      lines.push(`Organization/Business name: ${extractedInfo.value.organizationName}`)
    }
    if (extractedInfo.value.description) {
      lines.push(`Description: ${extractedInfo.value.description}`)
    }
    if (extractedInfo.value.motto) {
      lines.push(`Motto: ${extractedInfo.value.motto}`)
    }
    if (extractedInfo.value.registrationNumber) {
      lines.push(`RC Number: ${extractedInfo.value.registrationNumber}`)
    }
    if (extractedInfo.value.headOffice) {
      lines.push(`Head Office: ${extractedInfo.value.headOffice}`)
    }
    if (extractedInfo.value.otherAddress) {
      // Use "Branch Address:" if both addresses provided, otherwise just "Address:"
      const addressLabel = extractedInfo.value.headOffice ? 'Branch Address:' : 'Address:'
      lines.push(`${addressLabel} ${extractedInfo.value.otherAddress}`)
    }
    if (extractedInfo.value.emails.length > 0) {
      lines.push(`Email(s): ${extractedInfo.value.emails.join(', ')}`)
    }
    if (extractedInfo.value.phones.length > 0) {
      lines.push(`Phone(s): ${extractedInfo.value.phones.join(', ')}`)
    }
    
    return lines.join('\n')
  }
  
  // Show logo upload option
  function showLogoUploadOption() {
    // Check if logo already exists
    if (extractedInfo.value.logoDataUrl) {
      // Logo already exists, skip directly to letterhead generation
      generateLetterHeadPreview()
      return
    }
    
    // Check if logo message has already been shown
    if (logoMessageShown.value) {
      // Logo message already shown, don't show it again and don't auto-generate
      return
    }
    
    const logoMsg = `Would you like to add your company logo to the letterhead?`
    
    addAiMessage(logoMsg, [
      {
        label: 'Add Logo',
        action: 'upload_logo',
        variant: 'primary'
      },
      {
        label: 'Skip',
        action: 'skip_logo',
        variant: 'secondary'
      }
    ])
    
    // Mark logo message as shown
    logoMessageShown.value = true
  }
  
  // Show format selection message
  function showFormatSelection() {
    const formatMsg = `🎨 **Select Letterhead Format**

Choose your preferred file format:`
    
    addAiMessage(formatMsg, [
      {
        label: 'PNG',
        action: 'select_format',
        data: { format: 'png' },
        variant: 'primary'
      },
      {
        label: 'JPEG', 
        action: 'select_format',
        data: { format: 'jpeg' },
        variant: 'primary'
      },
      {
        label: 'PDF',
        action: 'select_format', 
        data: { format: 'pdf' },
        variant: 'primary'
      }
    ])
    
    // Move to Stage 3
    stageStatus.value = {
      currentStage: 3,
      step: 'format_selection'
    }
  }
  
  // Stage 1: Organization & Contact Details (merged with former Stage 2)
  async function handleStage1(message: string) {
    if (stageStatus.value.step === 'initial') {
      // Build actions array conditionally
      const actions = []
      
      // Only show "Type Manually" button if no preview has been generated yet
      if (!previewImageUrl.value) {
        actions.push({
          label: 'Type Manually',
          action: 'show_correction_block',
          variant: 'secondary'
        })
      }
      
      addAiMessage(`Kindly provide the required details in your next message.

For example:
"My organization name is Maxrange Enterprises Description: General printing Contracts Motto: Bringing Your Ideas To Life Branch: Garki Area 11, Abuja. Head Office: Plot 22, Adeola Odeku Street, Victoria Island, Lagos. RC: 1549321 Tel: 090****, 081**** Email: info@maxrange.com, maxrange@gmail.com"`, actions)
      
      stageStatus.value.step = 'collecting'
      return
    }
    
    if (stageStatus.value.step === 'collecting') {
      const stage1Data = extractStage1Data(message)
      
      if (!stage1Data.isValid) {
        addAiMessage(`❌ I need all 6 details in one message. Please include all details separated by commas.

Try again with all details.`)
        return
      }
      
      // Store extracted data and initialize correction state
      extractedInfo.value.organizationName = stage1Data.organizationName
      extractedInfo.value.registrationNumber = stage1Data.registrationNumber
      extractedInfo.value.headOffice = stage1Data.headOffice
      extractedInfo.value.otherAddress = stage1Data.otherAddress
      extractedInfo.value.emails = stage1Data.emails
      extractedInfo.value.phones = stage1Data.phones
      
      // Initialize correction state with current values
      stage1Corrections.value = {
        organizationName: stage1Data.organizationName,
        registrationNumber: stage1Data.registrationNumber,
        headOffice: stage1Data.headOffice,
        otherAddress: stage1Data.otherAddress,
        emails: stage1Data.emails,
        phones: stage1Data.phones,
        motto: extractedInfo.value.motto || '',
        description: extractedInfo.value.description || '',
        isEditing: true,
        showMenu: false,
        editedFields: new Set()
      }
      
      // Move directly to Stage 3 after confirmation
      stageStatus.value.currentStage = 3
      stageStatus.value.step = 'initial'
      // Immediately start Stage 3
      await handleStage3('')
      return
    }
  }
  

  
  // Stage 3: Preview Generation
  async function handleStage3(message: string) {
    if (stageStatus.value.step === 'initial') {
      // Directly generate preview without showing format selection message
      generateLetterHeadPreview()
      return
    }
    
    addAiMessage('Please select a format using the buttons above.')
  }
  
  // Extract Stage 1 data (Organization, Address & Contact)
  function extractStage1Data(text: string) {
    const parts = text.split(',').map(p => p.trim())
    
    if (parts.length < 5) {
      return { isValid: false }
    }
    
    const organizationName = parts[0]
    const rcPart = parts[1].toLowerCase()
    const headOffice = parts[2]
    const otherAddress = parts.length > 3 ? parts[3] : 'skip'
    
    // Extract emails and phones from remaining parts
    const remainingParts = parts.slice(4).join(', ')
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
    const phonePattern = /[+]?[0-9-()\s]{7,}/g
    
    const emailMatches = remainingParts.match(emailPattern)
    const phoneMatches = remainingParts.match(phonePattern)
    
    // Validate organization name
    if (!organizationName || organizationName.length < 2) {
      return { isValid: false }
    }
    
    // Validate email and phone presence
    if (!emailMatches || !phoneMatches) {
      return { isValid: false }
    }
    
    // Process RC number
    let registrationNumber = 'N/A'
    if (!rcPart.includes('skip') && !rcPart.includes('none')) {
      const rcMatch = rcPart.match(/(?:rc\s*)?([0-9]+)/i)
      if (rcMatch) {
        registrationNumber = rcMatch[1]
      } else if (/^[0-9]+$/.test(rcPart)) {
        registrationNumber = rcPart
      }
    }
    
    // Process other address
    const processedOtherAddress = otherAddress.toLowerCase().includes('skip') || 
                                  otherAddress.toLowerCase().includes('none') ? 'N/A' : otherAddress
    
    return {
      isValid: true,
      organizationName,
      registrationNumber,
      headOffice, 
      otherAddress: processedOtherAddress,
      emails: emailMatches.map(e => e.trim()),
      phones: phoneMatches.map(p => p.trim())
    }
  }
  


  // Stage 1 Correction Management
  function toggleStage1Menu() {
    stage1Corrections.value.showMenu = !stage1Corrections.value.showMenu
  }

  function startStage1Editing() {
    stage1Corrections.value.isEditing = true
    stage1Corrections.value.showMenu = false
  }

  function updateStage1Field(field: string, value: string | string[] | boolean | null) {
    if (field === 'isEditing' || field === 'showMenu' || field === 'editedFields') return
    
    // Handle includeOptionalFields separately - store directly in extractedInfo
    if (field === 'includeOptionalFields') {
      extractedInfo.value.includeOptionalFields = value as boolean
      return
    }
    
    const corrections = stage1Corrections.value
    let originalValue: any
    
    if (field === 'emails' || field === 'phones') {
      originalValue = extractedInfo.value[field as keyof ExtractedLetterHeadInfo]
      // Handle array fields
      if (Array.isArray(value)) {
        corrections[field as 'emails' | 'phones'] = value
      } else if (value && typeof value === 'string') {
        // Convert string to array - support both commas and spaces as separators
        corrections[field as 'emails' | 'phones'] = value
          .split(/[,\s]+/) // Split on both commas and spaces
          .map(v => v.trim())
          .filter(v => v && v.length > 0) // Filter out empty values
      } else {
        // Handle null case for arrays
        corrections[field as 'emails' | 'phones'] = []
      }
    } else {
      originalValue = extractedInfo.value[field as keyof ExtractedLetterHeadInfo]
      // Update the field value for string fields - handle null by setting to empty string
      corrections[field as 'organizationName' | 'registrationNumber' | 'headOffice' | 'otherAddress' | 'motto' | 'description'] = value as string || ''
    }
    
    // Track edited fields
    const currentValue = corrections[field as keyof typeof corrections]
    if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
      corrections.editedFields.add(field)
    } else {
      corrections.editedFields.delete(field)
    }
  }

  async function confirmStage1Corrections() {
    // Apply corrections to extracted info
    extractedInfo.value.organizationName = stage1Corrections.value.organizationName
    extractedInfo.value.registrationNumber = stage1Corrections.value.registrationNumber
    extractedInfo.value.headOffice = stage1Corrections.value.headOffice
    extractedInfo.value.otherAddress = stage1Corrections.value.otherAddress
    extractedInfo.value.emails = [...stage1Corrections.value.emails]
    extractedInfo.value.phones = [...stage1Corrections.value.phones]
    extractedInfo.value.motto = stage1Corrections.value.motto
    extractedInfo.value.description = stage1Corrections.value.description
    
    // Reset correction state
    stage1Corrections.value.isEditing = false
    stage1Corrections.value.editedFields.clear()
    
    // Close correction popup
    showCorrectionBlock.value = false
    
    // If there's already a preview, update the existing letterhead content only
    if (previewImageUrl.value) {
      // Update the existing letterhead with new content without regenerating the design
      const success = await updateExistingLetterHeadContent()
      if (success) {
        // Message removed - letterhead updates silently
      }
    } else {
      // If no preview exists yet, proceed to logo upload step
      showLogoUploadOption()
    }
  }

  // Update existing letterhead content without regenerating the design
  async function updateExistingLetterHeadContent(): Promise<boolean> {
    try {
      // Clear preview to show loading animation
      previewImageUrl.value = ''
      
      // Generate the updated letterhead
      isGeneratingPreview.value = true
      generatingMessage.value = 'Updating letterhead content...'
      
      // Wait 3 seconds before updating
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update the existing letterhead content with new information
      const updatedData: LetterHeadData = {
        organizationName: extractedInfo.value.organizationName,
        registrationNumber: extractedInfo.value.registrationNumber,
        headOffice: extractedInfo.value.headOffice,
        otherAddress: extractedInfo.value.otherAddress,
        emails: extractedInfo.value.emails,
        phones: extractedInfo.value.phones,
        motto: extractedInfo.value.motto,
        description: extractedInfo.value.description,
        logoDataUrl: extractedInfo.value.logoDataUrl,
        primaryBrandColor: primaryBrandColor.value,
        backgroundId: currentBackgroundId.value, // Preserve current background
        includeOptionalFields: extractedInfo.value.includeOptionalFields,
        referenceFields: {
          ref: extractedInfo.value.referenceFields.ourRef,
          date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
        },
        selectedOrgFont: selectedOrgFont.value
      }
      
      // Render the SVG with updated data, preserving current template
      const { svg: renderedSvg } = await renderLetterHead(updatedData, false, currentTemplateName.value)
      
      // Create blob URL for preview
      const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
      previewImageUrl.value = URL.createObjectURL(blob)
      
      return true
      
    } catch (error) {
      console.error('Error updating letterhead content:', error)
      addAiMessage('Failed to update letterhead content. Please try again.')
      return false
    } finally {
      isGeneratingPreview.value = false
      generatingMessage.value = ''
    }
  }

  function cancelStage1Editing() {
    // Reset correction values to original
    stage1Corrections.value.organizationName = extractedInfo.value.organizationName
    stage1Corrections.value.registrationNumber = extractedInfo.value.registrationNumber
    stage1Corrections.value.headOffice = extractedInfo.value.headOffice
    stage1Corrections.value.otherAddress = extractedInfo.value.otherAddress
    stage1Corrections.value.emails = [...extractedInfo.value.emails]
    stage1Corrections.value.phones = [...extractedInfo.value.phones]
    
    // Reset state
    stage1Corrections.value.isEditing = false
    stage1Corrections.value.editedFields.clear()
  }
  
  // Handle message actions (button clicks)
  async function handleMessageAction(actionType: string, data?: any) {
    if (actionType === 'confirm_field_assignments') {
      // User confirms all field assignments
      if (lastExtractedFields.value) {
        // Mark all fields as confirmed
        if (lastExtractedFields.value.organizationName) {
          fieldValidation.value.confirmed.add('organizationName')
        }
        if (lastExtractedFields.value.headOffice) {
          fieldValidation.value.confirmed.add('headOffice')
        }
        if (lastExtractedFields.value.otherAddress) {
          fieldValidation.value.confirmed.add('otherAddress')
        }
        
        // Re-process with confirmations
        const message = lastExtractedFields.value.organizationName?.originalSegment || ''
        await handleLetterheadData(message, false)
      }
    } else if (actionType === 'classify_field') {
      // User wants to manually classify a field
      const segment = data?.segment
      if (segment) {
        addAiMessage(`Please tell me what "${segment}" should be classified as:`, [
          { type: 'set_field_type', label: 'Organization Name', data: { segment, type: 'organization' }, variant: 'secondary' },
          { type: 'set_field_type', label: 'RC Number', data: { segment, type: 'rc_number' }, variant: 'secondary' },
          { type: 'set_field_type', label: 'Head Office', data: { segment, type: 'head_office' }, variant: 'secondary' },
          { type: 'set_field_type', label: 'Address', data: { segment, type: 'office_address' }, variant: 'secondary' },
          { type: 'set_field_type', label: 'Email', data: { segment, type: 'email' }, variant: 'secondary' },
          { type: 'set_field_type', label: 'Phone', data: { segment, type: 'phone' }, variant: 'secondary' }
        ])
      }
    } else if (actionType === 'set_field_type') {
      // User manually sets field type
      const { segment, type } = data
      if (segment && type && lastExtractedFields.value) {
        // Update the classification
        const classification: FieldClassification = {
          value: segment,
          confidence: 1.0, // User confirmed = highest confidence
          type: type,
          originalSegment: segment,
          needsConfirmation: false
        }
        
        // Update the appropriate field in lastExtractedFields
        switch (type) {
          case 'organization':
            lastExtractedFields.value.organizationName = classification
            break
          case 'rc_number':
            lastExtractedFields.value.registrationNumber = classification
            break
          case 'head_office':
            lastExtractedFields.value.headOffice = classification
            break
          case 'office_address':
            lastExtractedFields.value.otherAddress = classification
            break
          case 'email':
            lastExtractedFields.value.emails.push(classification)
            break
          case 'phone':
            lastExtractedFields.value.phones.push(classification)
            break
        }
        
        // Remove from unclassified
        lastExtractedFields.value.unclassified = lastExtractedFields.value.unclassified.filter(
          item => item.value !== segment
        )
        
        // Re-process the data
        const validation = validateFieldCompleteness(lastExtractedFields.value)
        if (validation.isComplete) {
          updateExtractedInfoFromClassified(lastExtractedFields.value, false)
          initializeCorrectionState()
          const confirmMsg = buildConfirmationMessage()
          addAiMessage(confirmMsg, [
            { label: 'Looks Good', action: 'skip_missing_fields', variant: 'primary' },
            { label: 'Edit Details', action: 'show_correction_block', variant: 'secondary' }
          ])
        } else {
          addAiMessage(`Thank you! "${segment}" has been classified as ${type.replace('_', ' ')}. Do you have any other information to add?`)
        }
      }
    } else if (actionType === 'manual_field_entry') {
      // User wants to enter fields manually
      showCorrectionBlock.value = true
    } else if (actionType === 'select_format') {
      const format = data?.format
      if (format) {
        selectedFormat.value = format
        // Directly generate preview instead of showing intermediate message
        generateLetterHeadPreview()
      }
    } else if (actionType === 'generate') {
      generateLetterHeadPreview()
    } else if (actionType === 'download') {
      // Show download menu instead of direct download
      showDownloadMenu.value = true
    } else if (actionType === 'close_download_menu') {
      // Close download menu
      showDownloadMenu.value = false
    } else if (actionType === 'download_format') {
      // Download in selected format and close menu
      const format = data?.format
      if (format) {
        showDownloadMenu.value = false
        await downloadLetterHead(format)
      }
    } else if (actionType === 'download_svg') {
      downloadLetterHead('svg')
    } else if (actionType === 'download_png') {
      downloadLetterHead('png')
    } else if (actionType === 'download_jpeg') {
      downloadLetterHead('jpeg')
    } else if (actionType === 'download_pdf') {
      downloadLetterHead('pdf')
    } else if (actionType === 'stage1_correction_block') {
      // This action type is used to render the correction block
      return
    } else if (actionType === 'stage1_toggle_menu') {
      toggleStage1Menu()
    } else if (actionType === 'stage1_start_edit') {
      startStage1Editing()
    } else if (actionType === 'stage1_confirm_corrections') {
      await confirmStage1Corrections()
    } else if (actionType === 'stage1_cancel_edit') {
      cancelStage1Editing()
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
    } else if (actionType === 'skip_logo') {
      // Skip logo and go directly to letterhead generation
      generateLetterHeadPreview()
    } else if (actionType === 'show_correction_block') {
      // Show correction popup (only set state, don't add message)
      showCorrectionBlock.value = true
      usedManualEntry.value = true
    } else if (actionType === 'close_correction_popup') {
      // Close correction popup
      showCorrectionBlock.value = false
    } else if (actionType === 'skip_missing_fields') {
      // User chose to skip missing fields and continue
      const confirmMsg = `I'll create your letterhead with the information you provided.`
      
      addAiMessage(confirmMsg)
      
      // Show logo upload option
      showLogoUploadOption()
    } else if (actionType === 'regenerate_preview') {
      // Change background without regenerating preview
      // Generate new random background ID
      currentBackgroundId.value = null // This will trigger random background generation
      
      // Clear preview to show loading animation on existing preview
      previewImageUrl.value = ''
      
      // Set the generating message and state
      isGeneratingPreview.value = true
      generatingMessage.value = 'Regenerating'
      
      // Update the existing letterhead with new background
      try {
        
        // Wait 6 seconds before regenerating
        await new Promise(resolve => setTimeout(resolve, 6000))
        
        // Generate new random background ID and matching color
        const { getRandomBackgroundId, getBackgroundColor } = await import('@/services/svgTemplateService')
        const newBackgroundId = getRandomBackgroundId()
        currentBackgroundId.value = newBackgroundId
        primaryBrandColor.value = getBackgroundColor(newBackgroundId)
        
        // Prepare data with new background and matching color
        const data: LetterHeadData = {
          organizationName: extractedInfo.value.organizationName,
          registrationNumber: extractedInfo.value.registrationNumber,
          headOffice: extractedInfo.value.headOffice,
          otherAddress: extractedInfo.value.otherAddress,
          phones: extractedInfo.value.phones,
          emails: extractedInfo.value.emails,
          motto: extractedInfo.value.motto,
          description: extractedInfo.value.description,
          logoDataUrl: extractedInfo.value.logoDataUrl,
          primaryBrandColor: primaryBrandColor.value,
          backgroundId: currentBackgroundId.value,
          includeOptionalFields: extractedInfo.value.includeOptionalFields,
          selectedOrgFont: selectedOrgFont.value,
          referenceFields: {
            ref: extractedInfo.value.referenceFields.ourRef,
            date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
          }
        }
        
        // Render the SVG with new background
        const { svg: renderedSvg, backgroundId: usedBackgroundId, templateName } = await renderLetterHead(data, false, currentTemplateName.value)
        
        // Save the new background ID and template name
        currentBackgroundId.value = usedBackgroundId
        currentTemplateName.value = templateName
        
        // Create blob URL for preview
        const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
        previewImageUrl.value = URL.createObjectURL(blob)
        
      } catch (error) {
        console.error('Background change error:', error)
        addAiMessage("Sorry, I couldn't change the background. Please try again.")
      } finally {
        isGeneratingPreview.value = false
        generatingMessage.value = ''
      }
    } else if (actionType === 'change_style') {
      // Change letterhead template style
      // Clear preview to show loading animation
      previewImageUrl.value = ''
      
      // Set the generating message and state
      isGeneratingPreview.value = true
      generatingMessage.value = 'Changing style...'
      
      // Update the existing letterhead with different template
      try {
        
        // Wait 4 seconds before changing style
        await new Promise(resolve => setTimeout(resolve, 4000))
        
        // Determine which template to switch to (toggle between 'letter head' and 'headed')
        const newTemplate = currentTemplateName.value === 'headed' ? 'letter head' : 'headed'
        
        // Prepare data for rendering with same background
        const data: LetterHeadData = {
          organizationName: extractedInfo.value.organizationName,
          registrationNumber: extractedInfo.value.registrationNumber,
          headOffice: extractedInfo.value.headOffice,
          otherAddress: extractedInfo.value.otherAddress,
          phones: extractedInfo.value.phones,
          emails: extractedInfo.value.emails,
          motto: extractedInfo.value.motto,
          description: extractedInfo.value.description,
          logoDataUrl: extractedInfo.value.logoDataUrl,
          primaryBrandColor: primaryBrandColor.value,
          backgroundId: currentBackgroundId.value, // Keep same background
          includeOptionalFields: extractedInfo.value.includeOptionalFields,
          selectedOrgFont: selectedOrgFont.value,
          referenceFields: {
            ref: extractedInfo.value.referenceFields.ourRef,
            date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
          }
        }
        
        // Render the SVG with specific template (toggle between templates, keep background)
        const { svg: renderedSvg, backgroundId: usedBackgroundId, templateName } = await renderLetterHead(data, true, newTemplate)
        
        // Save the template name used (background ID stays the same)
        currentTemplateName.value = templateName
        
        // Create blob URL for preview
        const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
        previewImageUrl.value = URL.createObjectURL(blob)
        
      } catch (error) {
        console.error('Style change error:', error)
        addAiMessage("Sorry, I couldn't change the style. Please try again.")
      } finally {
        isGeneratingPreview.value = false
        generatingMessage.value = ''
      }
    } else if (actionType === 'edit') {
      // Directly show correction popup for editing
      showCorrectionBlock.value = true
    } else if (actionType === 'change_color') {
      // Show color palette
      showColorPalette.value = true
    } else if (actionType === 'close_color_palette') {
      // Hide color palette
      showColorPalette.value = false
    } else if (actionType === 'apply_color') {
      // Apply color and update existing letterhead instead of regenerating
      showColorPalette.value = false
      
      // Update the existing letterhead with the new color
      const success = await updateExistingLetterHeadContent()
      if (success) {
        // Message removed - color updates silently
      }
    } else if (actionType === 'change_font') {
      // Show font selector
      showFontSelector.value = true
    } else if (actionType === 'close_font_selector') {
      // Hide font selector
      showFontSelector.value = false
    } else if (actionType === 'select_font') {
      // Apply selected font
      const font = data?.font
      if (font) {
        selectedOrgFont.value = font
        showFontSelector.value = false
        // Update existing letterhead with new font
        const success = await updateExistingLetterHeadContent()
        if (success) {
          // Font updates silently
        }
      }
    } else if (actionType === 'edit') {
      // Show correction block for editing
      addAiMessage('Edit your organization details below:', [
        { type: 'stage1_correction_block', label: '', variant: 'secondary' }
      ])
    }
  }
  
  // Generate letterhead preview
  async function generateLetterHeadPreview() {
    if (!hasMinimumInfo.value) {
      // Only show missing field message if user didn't use manual entry
      if (!usedManualEntry.value) {
        addAiMessage(generateMissingFieldMessage())
      }
      return
    }
    
    isGeneratingPreview.value = true
    showLetterHeadPreview.value = true
    
    try {
      // Check if preview message already exists
      const hasPreviewMessage = chatMessages.value.some(msg => msg.type === 'preview')
      
      // Only add preview message if it doesn't exist
      if (!hasPreviewMessage) {
        addAiMessage('', undefined, 'preview')
      }
      
      // Wait 7 seconds before generating
      await new Promise(resolve => setTimeout(resolve, 7000))
      
      // If no background ID is set, determine it now and set matching color
      if (!currentBackgroundId.value) {
        const { getRandomBackgroundId, getBackgroundColor } = await import('@/services/svgTemplateService')
        const newBackgroundId = getRandomBackgroundId()
        currentBackgroundId.value = newBackgroundId
        primaryBrandColor.value = getBackgroundColor(newBackgroundId)
      }
      
      // Prepare data for rendering
      const data: LetterHeadData = {
        organizationName: extractedInfo.value.organizationName,
        registrationNumber: extractedInfo.value.registrationNumber,
        headOffice: extractedInfo.value.headOffice,
        otherAddress: extractedInfo.value.otherAddress,
        phones: extractedInfo.value.phones,
        emails: extractedInfo.value.emails,
        motto: extractedInfo.value.motto,
        description: extractedInfo.value.description,
        logoDataUrl: extractedInfo.value.logoDataUrl,
        primaryBrandColor: primaryBrandColor.value,
        backgroundId: currentBackgroundId.value, // Include background ID
        includeOptionalFields: extractedInfo.value.includeOptionalFields,
        selectedOrgFont: selectedOrgFont.value,
        referenceFields: {
          ref: extractedInfo.value.referenceFields.ourRef,
          date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
        }
      }
      
      // Render the SVG with data
      const { svg: renderedSvg, backgroundId: usedBackgroundId, templateName } = await renderLetterHead(data, false, currentTemplateName.value)
      
      // Save the background ID and template name that was used
      currentBackgroundId.value = usedBackgroundId
      currentTemplateName.value = templateName
      
      // Create blob URL for preview
      const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
      previewImageUrl.value = URL.createObjectURL(blob)
      
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
        emails: extractedInfo.value.emails,
        motto: extractedInfo.value.motto,
        description: extractedInfo.value.description,
        logoDataUrl: extractedInfo.value.logoDataUrl,
        primaryBrandColor: primaryBrandColor.value,
        backgroundId: currentBackgroundId.value, // Include background ID
        includeOptionalFields: extractedInfo.value.includeOptionalFields,
        selectedOrgFont: selectedOrgFont.value,
        referenceFields: {
          ref: extractedInfo.value.referenceFields.ourRef,
          date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
        }
      }
      
      // Render the SVG
      const { svg: renderedSvg } = await renderLetterHead(data, false, currentTemplateName.value)
      
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
      reader.onload = async (e) => {
        extractedInfo.value.logoDataUrl = e.target?.result as string
        
        // Check if correction block is open - if so, don't auto-generate
        if (showCorrectionBlock.value) {
          // Just store the logo, don't generate - wait for user to click confirm
          return
        }
        
        // Update the existing letterhead with the new logo instead of regenerating
        if (previewImageUrl.value) {
          await updateExistingLetterheadLogo()
        } else {
          // If no existing letterhead, generate new one
          generateLetterHeadPreview()
        }
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Logo upload error:', error)
      addAiMessage("Sorry, I couldn't upload the logo. Please try again.")
    }
  }
  
  // Update existing letterhead with new logo
  async function updateExistingLetterheadLogo() {
    try {
      // Clear preview to show loading animation
      previewImageUrl.value = ''
      
      isGeneratingPreview.value = true
      generatingMessage.value = 'Adding logo to your letterhead...'
      
      // Wait 3 seconds before updating
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Prepare data for rendering with updated logo
      const updatedData: LetterHeadData = {
        organizationName: extractedInfo.value.organizationName,
        registrationNumber: extractedInfo.value.registrationNumber,
        headOffice: extractedInfo.value.headOffice,
        otherAddress: extractedInfo.value.otherAddress,
        phones: extractedInfo.value.phones,
        emails: extractedInfo.value.emails,
        motto: extractedInfo.value.motto,
        description: extractedInfo.value.description,
        logoDataUrl: extractedInfo.value.logoDataUrl,
        primaryBrandColor: primaryBrandColor.value,
        backgroundId: currentBackgroundId.value,
        includeOptionalFields: extractedInfo.value.includeOptionalFields,
        selectedOrgFont: selectedOrgFont.value,
        referenceFields: {
          ref: extractedInfo.value.referenceFields.ourRef,
          date: extractedInfo.value.referenceFields.date || new Date().toLocaleDateString()
        }
      }
      
      // Render the updated SVG
      const { svg: renderedSvg } = await renderLetterHead(updatedData)
      
      // Update the existing preview URL
      if (previewImageUrl.value) {
        URL.revokeObjectURL(previewImageUrl.value)
      }
      
      const blob = new Blob([renderedSvg], { type: 'image/svg+xml' })
      previewImageUrl.value = URL.createObjectURL(blob)
      
      // Add success message after preview is updated
      addAiMessage("✓ Logo uploaded successfully!")
      
    } catch (error) {
      console.error('Logo update error:', error)
      addAiMessage("Sorry, I couldn't update the logo. Please try again.")
    } finally {
      isGeneratingPreview.value = false
      generatingMessage.value = ''
    }
  }
  
  // Initialize with welcome message (only when user starts typing)
  function initializeChat() {
    // Don't show welcome message automatically
    // It will be triggered when user sends first message
  }
  
  // Show welcome message when user first interacts
  function showWelcomeMessage() {
    // Only add welcome message once - check if AI has spoken yet
    const hasAIMessage = chatMessages.value.some(msg => !msg.isUser)
    if (!hasAIMessage) {
      const name = userName.value ? ` ${userName.value}` : ''
      addAiMessage(`Hello${name}! 👋

I'm your **Letterhead Designer Assistant**. I'll help you create your professional letterhead.

Let's begin!`)
      
      // Initialize stage status
      stageStatus.value = {
        currentStage: 1,
        step: 'initial'
      }
    }
  }

  // Handle color selection
  const selectColor = (color: string) => {
    primaryBrandColor.value = color
    console.log('Selected color:', color)
    // Keep color palette open until user clicks Apply/OK
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
    stageStatus,
    stage1Corrections,
    showColorPalette,
    showCorrectionBlock,
    showDownloadMenu,
    showFontSelector,
    selectedOrgFont,
    fieldValidation,
    lastExtractedFields,
    
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
    updateStage1Field,
    toggleStage1Menu,
    startStage1Editing,
    confirmStage1Corrections,
    cancelStage1Editing,
    toggleVoice,
    selectColor,
    currentBackgroundId // Export background ID for use in components
  }
}