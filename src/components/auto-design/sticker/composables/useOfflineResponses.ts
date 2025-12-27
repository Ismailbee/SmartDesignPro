/**
 * Offline Response Handlers for Wedding Sticker Assistant
 * 
 * These handlers provide instant responses for common phrases
 * without needing to call Ollama AI. Works completely offline.
 */

import type { OfflineResponseContext } from '../types'

// Helper: Add natural delay for offline responses (feels less robotic)
export const offlineDelay = () => new Promise(resolve => setTimeout(resolve, 1000))

// Create a chat message object
function createMessage(
  text: string,
  actions?: Array<{ type: string; label: string; variant?: 'primary' | 'secondary' }>
) {
  return {
    id: Date.now(),
    text,
    sender: 'ai' as const,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    actions
  }
}

// Random response picker
function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Check if message is ONLY a title/heading (no names, date, or courtesy)
 * e.g., "wedding ceremony", "graduation", "happy birthday"
 */
export function isTitleOnly(msg: string): boolean {
  const titlePatterns = [
    /^(alhamdulillah[i]?\s*(on\s+your\s+)?(wedding\s+ceremony|wedding\s+nikkah|wedding|graduation|birthday|naming\s+ceremony)?)[\s!.?]*$/i,
    /^(congratulations?\s*(on\s+your\s+)?(wedding\s+ceremony|wedding\s+nikkah|wedding|graduation\s+ceremony|graduation|birthday|naming\s+ceremony|freedom)?)[\s!.?]*$/i,
    /^(wedding\s+ceremony|wedding\s+nikkah|wedding)[\s!.?]*$/i,
    /^(graduation\s+ceremony|graduation)[\s!.?]*$/i,
    /^(happy\s+birthday|birthday\s+ceremony|birthday)[\s!.?]*$/i,
    /^(naming\s+ceremony|naming)[\s!.?]*$/i,
    /^(quranic\s+walimat|walimat)[\s!.?]*$/i,
    /^(nikkah\s+ceremony|nikkah)[\s!.?]*$/i,
    /^(conjugal\s+bliss)[\s!.?]*$/i,
    /^(together\s+for\s*ever)[\s!.?]*$/i,
  ]
  const hasNames = /\b[A-Z][a-z]+\s*(&|and|with)\s*[A-Z][a-z]+\b/i.test(msg)
  const hasDate = /\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(msg)
  if (hasNames || hasDate) return false
  return titlePatterns.some(p => p.test(msg.trim()))
}

/**
 * Get response for title-only message - confirm and ask for rest
 */
export function getTitleOnlyResponse(title: string) {
  return createMessage(
    `Would you like to use "${title}" as your title? If yes, please also provide the names, date, and courtesy.`,
    [{ type: 'confirm_title', label: 'Yes, use this title', variant: 'primary' }]
  )
}

/**
 * Check if message is ONLY names (no title, date, or courtesy)
 * e.g., "Suleiman & Aisha", "John and Mary"
 */
export function isNamesOnly(msg: string): boolean {
  const namesPattern = /^\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*(&|and|with)\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*$/i
  const hasTitle = /(wedding|graduation|birthday|naming|ceremony|congratulation|alhamdulillah|nikkah)/i.test(msg)
  const hasDate = /\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/i.test(msg)
  const hasCourtesy = /(courtesy|from|by)\s*:/i.test(msg)
  if (hasTitle || hasDate || hasCourtesy) return false
  return namesPattern.test(msg.trim())
}

/**
 * Get response for names-only message - confirm and ask for rest
 */
export function getNamesOnlyResponse(name1: string, name2: string, ctx: OfflineResponseContext) {
  const missing: string[] = []
  if (!ctx.hasTitle) missing.push('title/heading')
  missing.push('date')
  missing.push('courtesy')
  return createMessage(
    `Excellent! I've got the names: ${name1} & ${name2}. Please provide the ${missing.join(', ')}.`
  )
}

/**
 * Check if message is ONLY a date
 */
export function isDateOnly(msg: string): boolean {
  const datePatterns = [
    /^\s*\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december),?\s+\d{4}\s*$/i,
    /^\s*(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\s*$/i,
    /^\s*\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\s*$/i,
  ]
  return datePatterns.some(p => p.test(msg.trim()))
}

/**
 * Get response for date-only message
 */
export function getDateOnlyResponse(date: string, ctx: OfflineResponseContext) {
  const missing: string[] = []
  if (!ctx.hasTitle) missing.push('title/heading')
  if (!ctx.hasName) missing.push('names')
  missing.push('courtesy')
  return createMessage(
    `Got the date: ${date}. Please provide the ${missing.join(', ')}.`
  )
}

/**
 * Check if message is ONLY courtesy
 */
export function isCourtesyOnly(msg: string, ctx: OfflineResponseContext): boolean {
  // Only treat as courtesy if we already have title, names, and date
  if (!ctx.hasTitle || !ctx.hasName || !ctx.hasDate) return false
  const hasNames = /\b[A-Z][a-z]+\s*(&|and|with)\s*[A-Z][a-z]+\b/i.test(msg)
  const hasDate = /\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(msg)
  if (hasNames || hasDate) return false
  // Short text likely a courtesy
  return msg.trim().length >= 3 && msg.trim().length < 60
}

/**
 * Check if message is a simple greeting
 */
export function isGreeting(msg: string): boolean {
  return /^(hi+|hello+|hey+|hiya|yo|good\s*(morning|afternoon|evening|day)|assalamualaikum|salam|greetings?)[\s!.?]*$/i.test(msg)
}

/**
 * Generate greeting response based on time of day and current state
 */
export function getGreetingResponse(msg: string, ctx: OfflineResponseContext) {
  const hour = new Date().getHours()
  let greet = 'Hello!'
  if (hour >= 5 && hour < 12) greet = 'Good morning!'
  else if (hour >= 12 && hour < 17) greet = 'Good afternoon!'
  else if (hour >= 17 && hour < 21) greet = 'Good evening!'
  if (/salam/i.test(msg)) greet = 'Wa alaikum assalam!'

  let responseText = ''
  if (ctx.hasTitle && ctx.hasName && ctx.hasDate && ctx.hasCourtesy) {
    responseText = `${greet} You can generate your sticker now.`
  } else {
    const missing = getMissingFields(ctx)
    responseText = `${greet} Please provide: ${missing.join(', ')}.`
  }

  return createMessage(responseText)
}

// Helper to get list of missing required fields
function getMissingFields(ctx: OfflineResponseContext): string[] {
  const missing: string[] = []
  if (!ctx.hasTitle) missing.push('title/heading')
  if (!ctx.hasName) missing.push('names')
  if (!ctx.hasDate) missing.push('date')
  if (!ctx.hasCourtesy) missing.push('courtesy')
  return missing
}

/**
 * Check if message is asking "who are you?"
 */
export function isWhoAreYou(msg: string): boolean {
  return /\b(who\s*(are\s*you|r\s*u|is\s*this)|what\s*(are\s*you|r\s*u|is\s*this(\s*app|\s*thing)?)|what\s*do\s*you\s*do|ur\s*name|your\s*name|introduce\s*yourself|tell\s*me\s*about\s*(you|yourself)|wats?\s*(dis|this))\b/i.test(msg)
}

export function getWhoAreYouResponse() {
  return createMessage("I create stickers for weddings, graduations, birthdays, naming ceremonies, and more. Send: title/heading, names, date, and courtesy.")
}

/**
 * Check if message is "how are you?"
 */
export function isHowAreYou(msg: string): boolean {
  return /\b(how\s*(are\s*you|r\s*u|u\s*doing|ya\s*doing)|how'?s\s*(it\s*going|things|life|everything)|what'?s\s*(up|good|new)|sup|wassup|how\s*do\s*you\s*do)\b/i.test(msg)
}

export function getHowAreYouResponse() {
  const responses = [
    `I'm doing wonderful, thanks for asking! 😊 Ready to help create something special for you!`,
    `Great, thank you! 💕 So excited to help with your sticker today!`,
    `Feeling creative and ready to help! 😊 Got a wedding to celebrate?`
  ]
  return createMessage(randomFrom(responses))
}

/**
 * Check if message is asking about capabilities
 */
export function isCapabilityQuestion(msg: string): boolean {
  return /\b(what\s*can\s*you\s*(do|make|create|help)|wha?t\s*(u|you)\s*do|your\s*capabilities|features|how\s*does\s*(this|it)\s*work|wat\s*can\s*u\s*do|show\s*me\s*what\s*you\s*can)\b/i.test(msg)
}

export function getCapabilityResponse() {
  return createMessage("I create stickers for weddings, graduations, birthdays, naming ceremonies, and more. Send: title/heading, names, date, and courtesy. You can also add a picture.")
}

/**
 * Check if message is requesting unsupported design types
 */
export function isNonWeddingRequest(msg: string): boolean {
  // These are NOT supported
  const unsupported = /\b(flyer|poster|logo|banner|business\s*card|brochure|menu|certificate|resume|cv|letterhead|book\s*cover|album|baby\s*shower|funeral)\b/i.test(msg)
  // These ARE supported
  const supported = /\b(wedding|graduation|birthday|naming|freedom|conjugal|together|walimat|nikkah)\b/i.test(msg)
  return unsupported && !supported
}

export function getNonWeddingResponse() {
  return createMessage("I create stickers for weddings, graduations, birthdays, naming ceremonies, and more. Please provide: title/heading, names, date, and courtesy.")
}

/**
 * Check if message is a vague design request
 */
export function isVagueDesignRequest(msg: string): boolean {
  return /\b(beautiful|nice|pretty|good|amazing|lovely|stunning|cool|awesome)\s*(design|sticker|thing|something|one)?\b/i.test(msg) && !/(name|bride|groom|date|wedding)/i.test(msg)
}

export function getVagueDesignResponse() {
  return createMessage(`Lovely! 💕 Please provide: title/heading, names, date, and courtesy.`)
}

/**
 * Check if message is affirmative (yes/yeah/sure)
 */
export function isAffirmative(msg: string): boolean {
  return /^(yes|yeah|yep|yup|sure|ok|okay|alright|definitely|of course|absolutely|let'?s go|let'?s do it)[\s!.?]*$/i.test(msg)
}

export function getAffirmativeResponse(ctx: OfflineResponseContext, shouldGenerate: () => void) {
  let responseText = ''
  
  if (ctx.hasPreview) {
    responseText = 'Your sticker is ready! You can download it or make edits. 😊'
  } else if (ctx.hasTitle && ctx.hasName && ctx.hasDate && ctx.hasCourtesy) {
    responseText = 'Got it! Generating your sticker now... 😊'
    setTimeout(shouldGenerate, 100)
  } else {
    const missing: string[] = []
    if (!ctx.hasTitle) missing.push('title/heading')
    if (!ctx.hasName) missing.push("couple's names")
    if (!ctx.hasDate) missing.push('wedding date')
    if (!ctx.hasCourtesy) missing.push('courtesy')
    responseText = missing.length > 0 
      ? `I still need: ${missing.join(', ')}. 😊`
      : 'Let\'s create your sticker!'
  }
  
  return createMessage(responseText)
}

/**
 * Check if message is a change request
 */
export function isChangeRequest(msg: string): { match: boolean; field?: string } {
  const match = msg.match(/(?:change|update|edit|modify)\s+(?:the\s+)?(\w+)/i)
  return { match: !!match, field: match?.[1]?.toLowerCase() }
}

export function getChangeResponse(field: string) {
  let responseText = ''
  
  if (field.includes('name')) {
    responseText = 'Sure! What are the new names? (e.g., "John & Sarah")'
  } else if (field.includes('date')) {
    responseText = 'Sure! What is the new date? (e.g., "June 15, 2025")'
  } else if (field.includes('message') || field.includes('courtesy') || field.includes('text')) {
    responseText = 'Sure! What is the new courtesy message?'
  } else {
    responseText = `Sure! Please share the new ${field} you'd like to use.`
  }
  
  return createMessage(responseText)
}

/**
 * Check if message is negative (no/nope)
 */
export function isNegative(msg: string): boolean {
  return /^(no|nope|nah|not now|not yet|maybe later|later|never mind|nevermind)[\s!.?]*$/i.test(msg)
}

export function getNegativeResponse(ctx: OfflineResponseContext, shouldGenerate?: () => void) {
  // If all details are complete, "no" likely means "no picture, just generate"
  if (ctx.hasTitle && ctx.hasName && ctx.hasDate && ctx.hasCourtesy && !ctx.hasPreview) {
    if (shouldGenerate) {
      setTimeout(shouldGenerate, 100)
    }
    return createMessage('Got it! Generating your sticker now... 😊')
  }
  return createMessage('No problem! Just let me know whenever you\'re ready to create a sticker. I\'m here to help! 😊')
}

/**
 * Check if message is thanks
 */
export function isThanks(msg: string): boolean {
  return /^(thanks?|thank you|thx|ty|cheers|appreciate it|awesome|great|perfect|cool|nice|love it|beautiful)[\s!.?]*$/i.test(msg)
}

export function getThanksResponse(hasPreview: boolean) {
  const responses = hasPreview 
    ? [
        'You\'re welcome! 😊 Feel free to download your sticker or let me know if you\'d like any changes!',
        'Glad you like it! 💕 Download anytime, or I can make tweaks if needed!',
        'My pleasure! Your sticker is ready to download. Need anything else?'
      ]
    : [
        'You\'re welcome! Ready to create your sticker whenever you are! 😊',
        'Anytime! Let me know the couple\'s names and date when you\'re ready! 💒',
        'Happy to help! Just share the details and I\'ll design something beautiful!'
      ]
  return createMessage(randomFrom(responses))
}

/**
 * Check if message is help request
 */
export function isHelp(msg: string): boolean {
  return /\b(help|help\s*me|i\s*need\s*help|instructions?|guide\s*me|how\s*to\s*use|how\s*does\s*this\s*work|what\s*can\s*you\s*do|what\s*(?:info|information|details)\s*do\s*i\s*need|what\s*do\s*i\s*need\s*(?:to\s*)?(?:provide|send|enter|write)|(?:who|what)\s*(?:info|information)\s*do\s*i\s*need\s*(?:to\s*)?(?:provide|send|enter|write))\b/i.test(msg)
}

export function getHelpResponse() {
  return createMessage("Send: title/heading, names, date, and courtesy. You can also add a picture.")
}

/**
 * Check if message is a start request
 */
export function isStartRequest(msg: string): boolean {
  return /\b(i\s*want\s*to\s*(start|begin|create|make)|let'?s\s*(start|begin|go|do\s*it)|create\s*(a\s*)?(wedding\s*)?(sticker)?|make\s*(a\s*)?(wedding\s*)?(sticker)?|new\s*sticker|start\s*over)\b/i.test(msg) && !/(name|bride|groom|\d)/i.test(msg)
}

export function getStartResponse() {
  return createMessage(
    "Please provide your sticker details: title/heading, names, date, and courtesy. If you're not sure about the title, tell me and I'll help you choose one."
  )
}

/**
 * Check if message is a pricing question
 */
export function isPricingQuestion(msg: string): boolean {
  return /\b(is\s*it\s*free|how\s*much|cost|price|pay|payment|subscription|premium)\b/i.test(msg)
}

export function getPricingResponse() {
  return createMessage(`Creating stickers is free! 🎉 Send the title/heading, names, date, and courtesy — and I'll design it for you.`)
}

/**
 * Check if message shows confusion
 */
export function isConfused(msg: string): boolean {
  return /\b(i\s*don'?t\s*(understand|get\s*it|know)|confused|what\s*do\s*i\s*do|how\s*do\s*i\s*start|what\s*should\s*i\s*say|what\s*now)\b/i.test(msg)
}

export function getConfusedResponse() {
  return createMessage("Just send your details: title/heading, couple's names, wedding date, and courtesy.")
}

/**
 * Generate a fallback response when nothing was extracted
 */
export function getFallbackResponse(ctx: OfflineResponseContext) {
  const missing: string[] = []
  if (!ctx.hasTitle) missing.push('title/heading')
  if (!ctx.hasName) missing.push('names')
  if (!ctx.hasDate) missing.push('date')
  if (!ctx.hasCourtesy) missing.push('courtesy')
  
  const responseText = missing.length > 0 
    ? `Please provide the ${missing.join(', ')} for your sticker.`
    : 'All details received! Would you like to add a picture?'
  
  return createMessage(responseText)
}

/**
 * Generate a response when local extraction found something
 */
export function getExtractionSuccessResponse(
  extracted: { title?: string; name1?: string; name2?: string; date?: string; dateIsPartial?: boolean; courtesy?: string },
  ctx: OfflineResponseContext
) {
  const needsExactDay = !!extracted.dateIsPartial
  
  const missing: string[] = []
  if (!ctx.hasTitle) missing.push('title/heading')
  if (!ctx.hasName) missing.push('names')
  if (!ctx.hasDate || needsExactDay) missing.push('date')
  if (!ctx.hasCourtesy) missing.push('courtesy')
  
  const complete = ctx.hasTitle && ctx.hasName && ctx.hasDate && ctx.hasCourtesy && !needsExactDay

  if (complete) return createMessage('All details received!')
  
  // Build an encouraging response based on what was found
  const found: string[] = []
  if (extracted.title) found.push(`title "${extracted.title}"`)
  if (extracted.name1 && extracted.name2) found.push(`names (${extracted.name1} & ${extracted.name2})`)
  else if (extracted.name1) found.push(`name "${extracted.name1}"`)
  if (extracted.date) found.push(`date "${extracted.date}"`)
  if (extracted.courtesy) found.push(`courtesy`)
  
  const prefix = found.length > 0 ? `Excellent! Got the ${found.join(', ')}. ` : 'Got it. '
  return createMessage(`${prefix}Please provide the ${missing.join(', ')}.`)
}
