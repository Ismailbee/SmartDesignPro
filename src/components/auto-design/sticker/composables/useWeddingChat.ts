/**
 * Wedding Chat Composable
 * 
 * Main composable for the wedding sticker chat assistant.
 * Combines offline responses and local extraction for a complete chat experience.
 */

import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type { ChatMessage, ExtractedInfo, LocalExtractionResult, OfflineResponseContext } from '../types'
import { extractWeddingDetails, isCommonWeddingTitle } from './useLocalExtraction'
import { addAIMessageWithTypingUtil } from '../utils/chatUtils'
import {
  offlineDelay,
  isGreeting,
  getGreetingResponse,
  isWhoAreYou,
  getWhoAreYouResponse,
  isHowAreYou,
  getHowAreYouResponse,
  isCapabilityQuestion,
  getCapabilityResponse,
  isNonWeddingRequest,
  getNonWeddingResponse,
  isVagueDesignRequest,
  getVagueDesignResponse,
  isAffirmative,
  getAffirmativeResponse,
  isChangeRequest,
  getChangeResponse,
  isNegative,
  getNegativeResponse,
  isThanks,
  getThanksResponse,
  isHelp,
  getHelpResponse,
  isStartRequest,
  getStartResponse,
  isPricingQuestion,
  getPricingResponse,
  isConfused,
  getConfusedResponse,
  getFallbackResponse,
  getExtractionSuccessResponse,
  isTitleOnly,
  getTitleOnlyResponse,
  isNamesOnly,
  getNamesOnlyResponse,
  isDateOnly,
  getDateOnlyResponse,
  isCourtesyOnly,
} from './useOfflineResponses'

export interface UseWeddingChatOptions {
  extractedInfo: Ref<ExtractedInfo>
  chatMessages: Ref<ChatMessage[]>
  isAnalyzing: Ref<boolean>
  showPreview: Ref<boolean>
  hasPhoto?: Ref<boolean>
  awaitingPictureDecision?: Ref<boolean>
  awaitingSizeDecision?: Ref<boolean>
  awaitingBackgroundRemovalDecision?: Ref<boolean>
  awaitingTitleConfirmation?: Ref<boolean>
  pendingTitle?: Ref<string | null>
  templateDefaultTitle?: Ref<string | null>
  onGenerate: () => void
  onScrollToBottom: () => void
  onUploadPicture?: () => void
  onSetSize?: (size: string) => void
  onBackgroundRemovalDecision?: (removeBackground: boolean) => void
  onTitleConfirmed?: (title: string) => void  // Called when title is confirmed to apply SVG with color
}

export function useWeddingChat(options: UseWeddingChatOptions) {
  const {
    extractedInfo,
    chatMessages,
    isAnalyzing,
    showPreview,
    hasPhoto,
    awaitingPictureDecision,
    awaitingSizeDecision,
    awaitingBackgroundRemovalDecision,
    awaitingTitleConfirmation,
    pendingTitle,
    templateDefaultTitle,
    onGenerate,
    onScrollToBottom,
    onUploadPicture,
    onSetSize,
    onBackgroundRemovalDecision,
    onTitleConfirmed,
  } = options

  // Track request ID to ignore stale responses
  let requestId = 0

  // Low-confidence name confirmation state (kept internal to this composable)
  const awaitingNameConfirmation = ref(false)
  const pendingNames = ref<{ name1: string; name2: string | null } | null>(null)

  // Build context for offline responses
  const getContext = (): OfflineResponseContext => ({
    hasTitle: !!extractedInfo.value.title,
    hasName: !!extractedInfo.value.names.name1,
    hasDate: !!extractedInfo.value.date,
    hasCourtesy: !!extractedInfo.value.courtesy,
    hasPreview: showPreview.value,
    hasPhoto: !!hasPhoto?.value,
    title: extractedInfo.value.title,
    name1: extractedInfo.value.names.name1,
    name2: extractedInfo.value.names.name2,
    date: extractedInfo.value.date,
    courtesy: extractedInfo.value.courtesy,
  })

  /**
   * Check if user's title differs from the template's default title
   * Normalizes both titles for comparison (lowercase, trim, remove extra spaces)
   */
  const titlesDiffer = (userTitle: string, templateTitle: string | null | undefined): boolean => {
    if (!templateTitle) return false
    const normalizeTitle = (t: string) => t.toLowerCase().trim().replace(/\s+/g, ' ')
    return normalizeTitle(userTitle) !== normalizeTitle(templateTitle)
  }

  // Add a message to chat - AI messages use typing animation
  const addMessage = (message: ChatMessage) => {
    if (message.sender === 'ai') {
      // Use typing animation for AI messages
      addAIMessageWithTypingUtil(
        message.text,
        chatMessages,
        onScrollToBottom,
        {
          actions: message.actions,
          image: message.image,
          type: message.type
        }
      )
    } else {
      // User messages are added instantly
      chatMessages.value.push(message)
      onScrollToBottom()
    }
  }

  // Apply extracted data to state
  const applyExtraction = (result: LocalExtractionResult) => {
    if (result.title) extractedInfo.value.title = result.title
    if (result.name1) extractedInfo.value.names.name1 = result.name1
    if (result.name2) extractedInfo.value.names.name2 = result.name2
    // A month/year-only date (e.g. "January 2026") isn't specific enough.
    // Keep it in the chat summary, but don't store it as the required wedding date.
    if (result.date && !result.dateIsPartial) extractedInfo.value.date = result.date
    if (result.courtesy) extractedInfo.value.courtesy = result.courtesy
  }

  /**
   * Process a user message and generate a response
   * This handles all offline shortcuts and local extraction
   */
  async function processMessage(message: string): Promise<boolean> {
    const reqId = ++requestId
    // Ensure message is a string before calling trim/toLowerCase
    if (!message || typeof message !== 'string') {
      console.error('processMessage called with non-string:', message)
      return false
    }
    const lowerMsg = message.trim().toLowerCase()
    const ctx = getContext()

    // If we previously extracted names with low confidence, require confirmation before applying.
    if (awaitingNameConfirmation.value && pendingNames.value) {
      // User confirmed
      if (isAffirmative(lowerMsg)) {
        extractedInfo.value.names.name1 = pendingNames.value.name1
        extractedInfo.value.names.name2 = pendingNames.value.name2
        awaitingNameConfirmation.value = false
        pendingNames.value = null

        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false

        const updatedCtx = getContext()
        addMessage(getExtractionSuccessResponse({
          name1: extractedInfo.value.names.name1 || undefined,
          name2: extractedInfo.value.names.name2 || undefined,
        }, updatedCtx))
        return true
      }

      // User rejected
      if (isNegative(lowerMsg)) {
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        addMessage({
          id: Date.now(),
          text: 'No problem — please type the two names inside brackets like “(Aisha & Suleiman)”.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        return true
      }

      // Try to parse new names from whatever the user typed
      const extraction = extractWeddingDetails(message)
      if (extraction.name1 && extraction.name2) {
        extractedInfo.value.names.name1 = extraction.name1
        extractedInfo.value.names.name2 = extraction.name2
        awaitingNameConfirmation.value = false
        pendingNames.value = null

        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        const updatedCtx = getContext()
        addMessage(getExtractionSuccessResponse({
          name1: extraction.name1,
          name2: extraction.name2,
        }, updatedCtx))
        return true
      }

      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage({
        id: Date.now(),
        text: 'I didn’t catch the two names clearly. Please type them inside brackets like “(Name1 & Name2)”.',
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      return true
    }

    // Picture/upload intent
    if (/(\bphoto\b|\bpicture\b|\bimage\b)/i.test(lowerMsg)) {
      const looksLikeRequest = /(upload|add|attach|include|put|send|share|don'?t\s+forget|remember)/i.test(lowerMsg)
      if (looksLikeRequest) {
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        addMessage({
          id: Date.now(),
          text: `Sure — you can add a picture now. Tap “Add Picture” and choose your image.`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ type: 'upload', label: 'Add Picture', variant: 'primary' }]
        } as any)
        return true
      }
    }

    // --- Quick Shortcuts (no extraction needed) ---

    // Greetings
    if (isGreeting(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getGreetingResponse(lowerMsg, ctx))
      return true
    }

    // Who are you?
    if (isWhoAreYou(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getWhoAreYouResponse())
      return true
    }

    // How are you?
    if (isHowAreYou(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getHowAreYouResponse())
      return true
    }

    // Capabilities question
    if (isCapabilityQuestion(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getCapabilityResponse())
      return true
    }

    // Non-wedding request
    if (isNonWeddingRequest(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getNonWeddingResponse())
      return true
    }

    // Vague design request
    if (isVagueDesignRequest(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getVagueDesignResponse())
      return true
    }

    // Affirmative (yes/yeah/ok) - handle picture decision first
    if (isAffirmative(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      
      // If awaiting title confirmation, "yes" means user wants to use their provided title
      if (awaitingTitleConfirmation?.value && pendingTitle?.value) {
        awaitingTitleConfirmation.value = false
        // Apply the user's title
        extractedInfo.value.title = pendingTitle.value
        const userTitle = pendingTitle.value
        pendingTitle.value = null
        
        // Trigger title SVG replacement with correct color
        if (onTitleConfirmed) {
          onTitleConfirmed(userTitle)
        }
        
        // Ask for next missing info
        const updatedCtx = getContext()
        if (!updatedCtx.hasName) {
          addMessage({
            id: Date.now(),
            text: `Got it! Using "${userTitle}" as your title. Now, what are the names of the couple?`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else if (!updatedCtx.hasDate) {
          addMessage({
            id: Date.now(),
            text: `Got it! Using "${userTitle}" as your title. What's the wedding date?`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else if (!updatedCtx.hasCourtesy) {
          addMessage({
            id: Date.now(),
            text: `Got it! Using "${userTitle}" as your title. What courtesy text would you like? (e.g., "With love from the family")`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else {
          // All text details complete - ask about picture
          const hasAnyPhoto = !!hasPhoto?.value
          if (!hasAnyPhoto) {
            if (awaitingPictureDecision) awaitingPictureDecision.value = true
            addMessage({
              id: Date.now(),
              text: `Got it! Using "${userTitle}" as your title. Would you like to add a picture?`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'upload', label: 'Add Picture', variant: 'secondary' },
                { type: 'generate_preview', label: 'No, Generate', variant: 'primary' }
              ]
            } as any)
          } else {
            addMessage({
              id: Date.now(),
              text: `Got it! Using "${userTitle}" as your title. All details are ready!`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [{ type: 'generate_preview', label: 'Generate', variant: 'primary' }]
            } as any)
          }
        }
        return true
      }
      
      // If awaiting picture decision, "yes" means user wants to add a picture
      if (awaitingPictureDecision?.value) {
        awaitingPictureDecision.value = false
        addMessage({
          id: Date.now(),
          text: 'Great! Tap "Add Picture" below to upload your image.',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [{ type: 'upload', label: 'Add Picture', variant: 'primary' }]
        } as any)
        return true
      }
      
      // If awaiting background removal decision, "yes" means user wants to remove background
      if (awaitingBackgroundRemovalDecision?.value) {
        awaitingBackgroundRemovalDecision.value = false
        if (onBackgroundRemovalDecision) {
          onBackgroundRemovalDecision(true)
        }
        return true
      }
      
      // Otherwise, normal affirmative response
      addMessage(getAffirmativeResponse(ctx, onGenerate))
      return true
    }

    // Size input - handle when user provides size like "3x3", "4x4", "4 by 2.5", "default"
    // Matches: "3x3", "4X4", "4 by 2.5", "3.5x4", "4 x 3", etc.
    const sizeMatch = message.match(/^(\d+(?:\.\d+)?)\s*(?:[xX×]|by)\s*(\d+(?:\.\d+)?)$/i)
    if (sizeMatch || lowerMsg === 'default') {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      
      // Always handle size input if it matches the pattern
      // (this prevents it from being treated as courtesy)
      // Normalize size format to "WxH"
      let sizeValue: string
      if (lowerMsg === 'default') {
        sizeValue = '4x4'
      } else if (sizeMatch) {
        sizeValue = `${sizeMatch[1]}x${sizeMatch[2]}`
      } else {
        sizeValue = message.trim()
      }
      
      // Reset the awaiting flag if it was set
      if (awaitingSizeDecision?.value) {
        awaitingSizeDecision.value = false
      }
      
      // Call the size handler
      if (onSetSize) {
        onSetSize(sizeValue)
      }
      
      addMessage({
        id: Date.now(),
        text: `Perfect! Size set to ${sizeValue} inches. Creating your sticker now! ✨`,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      
      // Trigger generation after a short delay
      setTimeout(() => {
        onGenerate()
      }, 500)
      
      return true
    }

    // Change request
    const changeResult = isChangeRequest(lowerMsg)
    if (changeResult.match && changeResult.field) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getChangeResponse(changeResult.field))
      return true
    }

    // Negative (no/nope) - if all details complete, generate the sticker
    if (isNegative(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      
      // If awaiting title confirmation, "no" means user wants to keep the template's default title
      if (awaitingTitleConfirmation?.value) {
        awaitingTitleConfirmation.value = false
        pendingTitle!.value = null
        // Use the template's default title
        const defaultTitle = templateDefaultTitle?.value || 'Alhamdulillah On Your Wedding Ceremony'
        extractedInfo.value.title = defaultTitle
        
        // Trigger title SVG replacement with correct color
        if (onTitleConfirmed) {
          onTitleConfirmed(defaultTitle)
        }
        
        // Ask for next missing info
        const updatedCtx = getContext()
        if (!updatedCtx.hasName) {
          addMessage({
            id: Date.now(),
            text: `Alright! Keeping the current title. What are the names of the couple?`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else if (!updatedCtx.hasDate) {
          addMessage({
            id: Date.now(),
            text: `Alright! Keeping the current title. What's the wedding date?`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else if (!updatedCtx.hasCourtesy) {
          addMessage({
            id: Date.now(),
            text: `Alright! Keeping the current title. What courtesy text would you like?`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        } else {
          // All text details complete - ask about picture
          const hasAnyPhoto = !!hasPhoto?.value
          if (!hasAnyPhoto) {
            if (awaitingPictureDecision) awaitingPictureDecision.value = true
            addMessage({
              id: Date.now(),
              text: `Alright! Keeping the current title. Would you like to add a picture?`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'upload', label: 'Add Picture', variant: 'secondary' },
                { type: 'generate_preview', label: 'No, Generate', variant: 'primary' }
              ]
            } as any)
          } else {
            addMessage({
              id: Date.now(),
              text: `Alright! Keeping the current title. All details are ready!`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [{ type: 'generate_preview', label: 'Generate', variant: 'primary' }]
            } as any)
          }
        }
        return true
      }
      
      // If awaiting background removal decision, "no" means user wants to keep background
      if (awaitingBackgroundRemovalDecision?.value) {
        awaitingBackgroundRemovalDecision.value = false
        if (onBackgroundRemovalDecision) {
          onBackgroundRemovalDecision(false)
        }
        return true
      }
      
      addMessage(getNegativeResponse(ctx, onGenerate))
      return true
    }

    // Thanks
    if (isThanks(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getThanksResponse(ctx.hasPreview))
      return true
    }

    // Help
    if (isHelp(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getHelpResponse())
      return true
    }

    // Start request
    if (isStartRequest(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getStartResponse())
      return true
    }

    // Pricing question
    if (isPricingQuestion(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getPricingResponse())
      return true
    }

    // Confusion
    if (isConfused(lowerMsg)) {
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      addMessage(getConfusedResponse())
      return true
    }

    // --- Partial Input Detection (Title-only, Names-only, Date-only) ---

    // Title-only: user sent just a title like "wedding ceremony" or "graduation"
    if (isTitleOnly(message)) {
      const extraction = extractWeddingDetails(message, { hasName: ctx.hasName, hasDate: ctx.hasDate })
      if (extraction.title) {
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        
        // Check if it's a common wedding title - apply directly without confirmation
        const isCommonTitle = isCommonWeddingTitle(extraction.title)
        
        // Only ask for confirmation if:
        // 1. Title differs from template AND
        // 2. It's NOT a common/known wedding title
        if (!isCommonTitle && templateDefaultTitle?.value && titlesDiffer(extraction.title, templateDefaultTitle.value)) {
          // Store the user's title and ask for confirmation
          if (awaitingTitleConfirmation && pendingTitle) {
            awaitingTitleConfirmation.value = true
            pendingTitle.value = extraction.title
            addMessage({
              id: Date.now(),
              text: `You've entered "${extraction.title}" as the title. Would you like to use this title? (Yes/No)`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            return true
          }
        }
        
        // Common title OR titles match OR no template title - apply directly
        applyExtraction(extraction)
        
        // Trigger title SVG replacement with correct color
        if (onTitleConfirmed && extraction.title) {
          onTitleConfirmed(extraction.title)
        }
        
        const updatedCtx = getContext()
        
        // Check if all info is complete after setting title
        if (updatedCtx.hasName && updatedCtx.hasDate && updatedCtx.hasCourtesy) {
          // All text details complete - ask about picture
          const hasAnyPhoto = !!hasPhoto?.value
          if (!hasAnyPhoto) {
            if (awaitingPictureDecision) awaitingPictureDecision.value = true
            addMessage({
              id: Date.now(),
              text: `Perfect — I'll use "${extraction.title}" as the title. Would you like to add a picture?`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'upload', label: 'Add Picture', variant: 'secondary' },
                { type: 'generate_preview', label: 'No, Generate', variant: 'primary' }
              ]
            } as any)
          } else {
            addMessage({
              id: Date.now(),
              text: `Perfect — I'll use "${extraction.title}" as the title. All details are ready!`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [{ type: 'generate_preview', label: 'Generate', variant: 'primary' }]
            } as any)
          }
        } else {
          // Still missing info - use standard response
          addMessage(getTitleOnlyResponse(extraction.title, updatedCtx))
        }
        return true
      }
    }

    // --- Fallback Title Detection ---
    // If we don't have a title yet, and the message is a short phrase (2-5 words)
    // that doesn't look like names, date, or courtesy, treat it as a custom title
    if (!ctx.hasTitle && !isNamesOnly(message) && !isDateOnly(message)) {
      const trimmed = message.trim()
      const wordCount = trimmed.split(/\s+/).length
      const hasNamesPattern = /\b[A-Z][a-z]+\s*(?:&|and|with)\s*[A-Z][a-z]+\b/i.test(trimmed)
      const hasDatePattern = /\d{1,2}(?:st|nd|rd|th)?\s+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(trimmed)
      const hasCourtesyPattern = /^(?:courtesy|from|by)\s*[:\-]/i.test(trimmed)
      const isQuestion = /\?$/.test(trimmed)
      
      // If it's 1-6 words and doesn't match other patterns, treat as custom title
      if (wordCount >= 1 && wordCount <= 6 && !hasNamesPattern && !hasDatePattern && !hasCourtesyPattern && !isQuestion) {
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        
        // Capitalize the title
        const customTitle = trimmed.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        
        // Apply the custom title
        extractedInfo.value.title = customTitle
        
        // Trigger title SVG replacement
        if (onTitleConfirmed) {
          onTitleConfirmed(customTitle)
        }
        
        const updatedCtx = getContext()
        
        // Check if all info is complete after setting title
        if (updatedCtx.hasName && updatedCtx.hasDate && updatedCtx.hasCourtesy) {
          // All text details complete - ask about picture
          const hasAnyPhoto = !!hasPhoto?.value
          if (!hasAnyPhoto) {
            if (awaitingPictureDecision) awaitingPictureDecision.value = true
            addMessage({
              id: Date.now(),
              text: `Perfect — I'll use "${customTitle}" as the title. Would you like to add a picture?`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [
                { type: 'upload', label: 'Add Picture', variant: 'secondary' },
                { type: 'generate_preview', label: 'No, Generate', variant: 'primary' }
              ]
            } as any)
          } else {
            addMessage({
              id: Date.now(),
              text: `Perfect — I'll use "${customTitle}" as the title. All details are ready!`,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actions: [{ type: 'generate_preview', label: 'Generate', variant: 'primary' }]
            } as any)
          }
        } else {
          // Still missing info - use standard response
          addMessage(getTitleOnlyResponse(customTitle, updatedCtx))
        }
        return true
      }
    }

    // Names-only: user sent just names like "Suleiman & Aisha"
    if (isNamesOnly(message)) {
      const extraction = extractWeddingDetails(message, { hasName: ctx.hasName, hasDate: ctx.hasDate })
      if (extraction.name1 && extraction.name2) {
        applyExtraction(extraction)
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        const updatedCtx = getContext()
        addMessage(getNamesOnlyResponse(extraction.name1, extraction.name2, updatedCtx))
        return true
      }
    }

    // Date-only: user sent just a date like "6th January, 2025"
    if (isDateOnly(message)) {
      const extraction = extractWeddingDetails(message, { hasName: ctx.hasName, hasDate: ctx.hasDate })
      if (extraction.date) {
        applyExtraction(extraction)
        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false
        const updatedCtx = getContext()
        addMessage(getDateOnlyResponse(extraction.date, updatedCtx))
        return true
      }
    }

    // Courtesy-only: user sent just courtesy when we already have title, names, date
    if (isCourtesyOnly(message, ctx)) {
      // Treat the whole message as courtesy
      extractedInfo.value.courtesy = message.trim()
      await offlineDelay()
      if (reqId !== requestId) return true
      isAnalyzing.value = false
      const updatedCtx = getContext()
      // All details complete - ask about picture
      const hasAnyPhoto = !!hasPhoto?.value
      if (!hasAnyPhoto) {
        // Set flag so "yes" response triggers picture upload
        if (awaitingPictureDecision) awaitingPictureDecision.value = true
        addMessage({
          id: Date.now(),
          text: `Got it! Would you like to add a picture?`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'upload', label: 'Add Picture', variant: 'secondary' },
            { type: 'generate_preview', label: 'Generate', variant: 'primary' }
          ]
        } as any)
      } else {
        addMessage({
          id: Date.now(),
          text: `Got the courtesy: "${message.trim()}". What size would you like? (e.g., 3x3, 4x4, or type "default")`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
      return true
    }

    // --- Try Local Extraction ---
    const extraction = extractWeddingDetails(message, {
      hasName: ctx.hasName,
      hasDate: ctx.hasDate,
    })

    if (extraction.foundSomething) {
      // Check if the extracted title differs from template - ask for confirmation first
      // BUT skip confirmation if it's a common/known wedding title
      const isCommonTitle = extraction.title ? isCommonWeddingTitle(extraction.title) : false
      
      if (extraction.title && !isCommonTitle && templateDefaultTitle?.value && titlesDiffer(extraction.title, templateDefaultTitle.value)) {
        if (awaitingTitleConfirmation && pendingTitle) {
          await offlineDelay()
          if (reqId !== requestId) return true
          isAnalyzing.value = false
          
          // Store the pending title and all other extracted data for later
          awaitingTitleConfirmation.value = true
          pendingTitle.value = extraction.title
          
          // Apply non-title extraction (names, date, courtesy) immediately
          if (extraction.name1) extractedInfo.value.names.name1 = extraction.name1
          if (extraction.name2) extractedInfo.value.names.name2 = extraction.name2
          if (extraction.date && !extraction.dateIsPartial) extractedInfo.value.date = extraction.date
          if (extraction.courtesy) extractedInfo.value.courtesy = extraction.courtesy
          
          addMessage({
            id: Date.now(),
            text: `You've entered "${extraction.title}" as the title. Would you like to use this title? (Yes/No)`,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          return true
        }
      }
      
      // If names were extracted but flagged as low-confidence, ask for confirmation before applying.
      if (extraction.nameNeedsConfirmation && extraction.name1) {
        // Apply everything except the names
        if (extraction.title) extractedInfo.value.title = extraction.title
        if (extraction.date && !extraction.dateIsPartial) extractedInfo.value.date = extraction.date
        if (extraction.courtesy) extractedInfo.value.courtesy = extraction.courtesy

        // If a title was extracted, still trigger SVG replacement with correct color
        if (onTitleConfirmed && extraction.title) {
          onTitleConfirmed(extraction.title)
        }

        pendingNames.value = { name1: extraction.name1, name2: extraction.name2 ?? null }
        awaitingNameConfirmation.value = true

        await offlineDelay()
        if (reqId !== requestId) return true
        isAnalyzing.value = false

        const maybeSecond = extraction.name2 ? ` & "${extraction.name2}"` : ''
        addMessage({
          id: Date.now(),
          text: `I found these names: "${extraction.name1}"${maybeSecond}. Reply “yes” to confirm, or type the correct names in brackets (example: “(Aisha & Suleiman)”).`,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        return true
      }

      // Apply extracted info
      applyExtraction(extraction)
      
      // If a title was extracted, trigger SVG replacement with correct color
      if (onTitleConfirmed && extraction.title) {
        onTitleConfirmed(extraction.title)
      }

      // If names are still missing AND this message didn't include names,
      // let the caller try Ollama instead of replying offline.
      const updatedCtxPreReply = getContext()
      const messageHadNames = !!(extraction.name1 || extraction.name2)
      if (!updatedCtxPreReply.hasName && !messageHadNames) {
        return false
      }

      await offlineDelay()
      if (reqId !== requestId) return true
      
      isAnalyzing.value = false
      
      // Get updated context after applying extraction
      const updatedCtx = getContext()
      
      // Check if we have all required details (title is optional if explicitly skipped)
      if (updatedCtx.hasTitle && updatedCtx.hasName && updatedCtx.hasDate && updatedCtx.hasCourtesy) {
        // All details complete - ask about picture
        const hasAnyPhoto = !!hasPhoto?.value
        if (!hasAnyPhoto) {
          // Set flag so "yes" response triggers picture upload
          if (awaitingPictureDecision) awaitingPictureDecision.value = true
          addMessage({
            id: Date.now(),
            text: 'Would you like to add a picture?',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actions: [
              { type: 'upload', label: 'Add Picture', variant: 'secondary' },
              { type: 'generate_preview', label: 'Generate', variant: 'primary' }
            ]
          } as any)
        } else {
          // Has photo - ask for size
          addMessage({
            id: Date.now(),
            text: 'What size would you like? (e.g., 3x3, 4x4, or type "default")',
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
        }
      } else {
        // Need more info - ask for what's missing
        addMessage(getExtractionSuccessResponse(extraction, updatedCtx))
      }
      
      return true
    }

    // Nothing matched - return false to let caller try Ollama or fallback
    return false
  }

  /**
   * Generate a fallback response when nothing was understood
   */
  async function generateFallbackResponse(): Promise<void> {
    await offlineDelay()
    isAnalyzing.value = false
    addMessage(getFallbackResponse(getContext()))
  }

  /**
   * Handle offline extraction when Ollama fails
   */
  async function handleOfflineExtraction(message: string): Promise<void> {
    const ctx = getContext()
    const extraction = extractWeddingDetails(message, {
      hasName: ctx.hasName,
      hasDate: ctx.hasDate,
    })

    await offlineDelay()
    
    // Apply extracted data
    applyExtraction(extraction)
    
    // If a title was extracted, trigger SVG replacement with correct color
    if (onTitleConfirmed && extraction.title) {
      onTitleConfirmed(extraction.title)
    }

    isAnalyzing.value = false
    
    // Get updated context
    const updatedCtx = getContext()

    // Check if all required details are present (title is optional if explicitly skipped)
    if (updatedCtx.hasTitle && updatedCtx.hasName && updatedCtx.hasDate && updatedCtx.hasCourtesy && !updatedCtx.hasPreview) {
      const hasAnyPhoto = !!hasPhoto?.value
      if (!hasAnyPhoto) {
        // Set flag so "yes" response triggers picture upload
        if (awaitingPictureDecision) awaitingPictureDecision.value = true
        // Ask about picture
        addMessage({
          id: Date.now(),
          text: 'Would you like to add a picture?',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actions: [
            { type: 'upload', label: 'Add Picture', variant: 'secondary' },
            { type: 'generate_preview', label: 'Generate', variant: 'primary' }
          ]
        } as any)
      } else {
        // Has photo - ask for size
        addMessage({
          id: Date.now(),
          text: 'What size would you like? (e.g., 3x3, 4x4, or type "default")',
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
      }
      return
    }

    if (extraction.foundSomething) addMessage(getExtractionSuccessResponse(extraction, updatedCtx))
    else addMessage(getFallbackResponse(updatedCtx))
  }

  return {
    processMessage,
    generateFallbackResponse,
    handleOfflineExtraction,
    applyExtraction,
    getContext,
  }
}
