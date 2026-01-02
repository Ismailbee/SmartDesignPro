/**
 * Wedding Sticker Flow State Machine
 * 
 * Replaces the 8+ boolean flags (awaitingXXX) with a proper state machine.
 * This makes the flow predictable, debuggable, and easier to maintain.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue'

// ============================================================================
// TYPES
// ============================================================================

/**
 * All possible states in the wedding sticker flow
 */
export type WeddingFlowState =
  | 'idle'                        // Initial state - no info collected
  | 'collecting_info'             // Collecting names/date/courtesy
  | 'awaiting_names'              // Explicitly waiting for names
  | 'awaiting_date'               // Explicitly waiting for date
  | 'awaiting_courtesy'           // Explicitly waiting for courtesy
  | 'awaiting_size'               // Waiting for size confirmation
  | 'awaiting_picture_decision'   // Asked if user wants to add picture
  | 'awaiting_bg_removal'         // Asked if user wants background removed
  | 'awaiting_image_update'       // Asked if user wants to replace image
  | 'awaiting_image_choice'       // Multiple images - which to use?
  | 'awaiting_title_confirmation' // Confirming detected title
  | 'ready_to_generate'           // All info collected, ready to generate
  | 'generating'                  // Currently generating preview
  | 'preview_ready'               // Preview is displayed
  | 'editing'                     // User is editing the design

/**
 * Events that can trigger state transitions
 */
export type WeddingFlowEvent =
  | { type: 'RESET' }
  | { type: 'NAMES_PROVIDED'; name1: string; name2?: string }
  | { type: 'DATE_PROVIDED'; date: string }
  | { type: 'COURTESY_PROVIDED'; courtesy: string }
  | { type: 'TITLE_PROVIDED'; title: string }
  | { type: 'SIZE_PROVIDED'; size: string }
  | { type: 'SIZE_CONFIRMED' }
  | { type: 'PICTURE_UPLOADED'; file: File }
  | { type: 'PICTURE_DECISION_YES' }
  | { type: 'PICTURE_DECISION_NO' }
  | { type: 'BG_REMOVAL_YES' }
  | { type: 'BG_REMOVAL_NO' }
  | { type: 'IMAGE_UPDATE_YES' }
  | { type: 'IMAGE_UPDATE_NO' }
  | { type: 'IMAGE_CHOICE_FIRST' }
  | { type: 'IMAGE_CHOICE_LATEST' }
  | { type: 'TITLE_CONFIRMED' }
  | { type: 'TITLE_REJECTED' }
  | { type: 'GENERATE_REQUESTED' }
  | { type: 'GENERATION_STARTED' }
  | { type: 'GENERATION_COMPLETE' }
  | { type: 'GENERATION_FAILED' }
  | { type: 'EDIT_REQUESTED' }
  | { type: 'EDIT_COMPLETE' }
  | { type: 'USER_MESSAGE'; message: string }

/**
 * Collected information during the flow
 */
export interface CollectedInfo {
  title: string | null
  name1: string | null
  name2: string | null
  date: string | null
  courtesy: string | null
  size: string | null
  hasPhoto: boolean
  photoFile: File | null
  bgRemovalRequested: boolean
}

/**
 * State machine context
 */
export interface WeddingFlowContext {
  state: WeddingFlowState
  info: CollectedInfo
  pendingFile: File | null
  uploadedFiles: File[]
  errorMessage: string | null
  lastUserMessage: string | null
}

// ============================================================================
// STATE MACHINE
// ============================================================================

const initialInfo: CollectedInfo = {
  title: null,
  name1: null,
  name2: null,
  date: null,
  courtesy: null,
  size: '4x4', // default
  hasPhoto: false,
  photoFile: null,
  bgRemovalRequested: false,
}

const initialContext: WeddingFlowContext = {
  state: 'idle',
  info: { ...initialInfo },
  pendingFile: null,
  uploadedFiles: [],
  errorMessage: null,
  lastUserMessage: null,
}

/**
 * Create the wedding flow state machine composable
 */
export function useWeddingFlowMachine() {
  // Reactive state
  const context = ref<WeddingFlowContext>({ ...initialContext, info: { ...initialInfo } })
  
  // Computed helpers
  const state = computed(() => context.value.state)
  const info = computed(() => context.value.info)
  
  const hasNames = computed(() => !!(context.value.info.name1 || context.value.info.name2))
  const hasDate = computed(() => !!context.value.info.date)
  const hasCourtesy = computed(() => !!context.value.info.courtesy)
  const hasTitle = computed(() => !!context.value.info.title)
  const hasPhoto = computed(() => context.value.info.hasPhoto)
  const hasSize = computed(() => !!context.value.info.size)
  
  const canGenerate = computed(() => {
    // Need at least names OR photo, plus date
    const hasRequiredInfo = (hasNames.value || hasPhoto.value) && hasDate.value
    return hasRequiredInfo && hasSize.value
  })
  
  const missingFields = computed(() => {
    const missing: string[] = []
    if (!hasNames.value) missing.push('names')
    if (!hasDate.value) missing.push('date')
    // Courtesy is optional but we might want to ask
    return missing
  })
  
  const isAwaitingResponse = computed(() => {
    return [
      'awaiting_names',
      'awaiting_date',
      'awaiting_courtesy',
      'awaiting_size',
      'awaiting_picture_decision',
      'awaiting_bg_removal',
      'awaiting_image_update',
      'awaiting_image_choice',
      'awaiting_title_confirmation',
    ].includes(context.value.state)
  })
  
  const isPreviewVisible = computed(() => {
    return ['preview_ready', 'editing'].includes(context.value.state)
  })
  
  const isGenerating = computed(() => context.value.state === 'generating')
  
  /**
   * Send an event to the state machine
   */
  function send(event: WeddingFlowEvent): void {
    const currentState = context.value.state
    const nextContext = transition(context.value, event)
    
    if (nextContext.state !== currentState) {
      console.log(`🔄 State: ${currentState} → ${nextContext.state}`, event.type)
    }
    
    context.value = nextContext
  }
  
  /**
   * Reset the state machine to initial state
   */
  function reset(): void {
    context.value = { ...initialContext, info: { ...initialInfo } }
  }
  
  /**
   * Update collected info directly (for external updates)
   */
  function updateInfo(updates: Partial<CollectedInfo>): void {
    context.value.info = { ...context.value.info, ...updates }
    
    // Auto-transition if we have enough info
    if (canGenerate.value && context.value.state === 'collecting_info') {
      context.value.state = 'ready_to_generate'
    }
  }
  
  /**
   * Get what question to ask next based on current state
   */
  function getNextQuestion(): string | null {
    if (hasNames.value && hasDate.value && hasCourtesy.value) {
      return null // All required info collected
    }
    
    if (!hasNames.value) {
      return "What are the couple's names?"
    }
    
    if (!hasDate.value) {
      return "What's the wedding date?"
    }
    
    if (!hasCourtesy.value) {
      return "Who is the sticker from? (e.g., 'The Smith Family')"
    }
    
    return null
  }
  
  return {
    // State
    context,
    state,
    info,
    
    // Computed flags (replaces boolean refs)
    hasNames,
    hasDate,
    hasCourtesy,
    hasTitle,
    hasPhoto,
    hasSize,
    canGenerate,
    missingFields,
    isAwaitingResponse,
    isPreviewVisible,
    isGenerating,
    
    // Actions
    send,
    reset,
    updateInfo,
    getNextQuestion,
  }
}

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

/**
 * Pure transition function - given current context and event, return new context
 */
function transition(ctx: WeddingFlowContext, event: WeddingFlowEvent): WeddingFlowContext {
  const newCtx = { ...ctx, info: { ...ctx.info } }
  
  switch (event.type) {
    case 'RESET':
      return { ...initialContext, info: { ...initialInfo } }
    
    case 'NAMES_PROVIDED':
      newCtx.info.name1 = event.name1
      newCtx.info.name2 = event.name2 || null
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'DATE_PROVIDED':
      newCtx.info.date = event.date
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'COURTESY_PROVIDED':
      newCtx.info.courtesy = event.courtesy
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'TITLE_PROVIDED':
      newCtx.info.title = event.title
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'SIZE_PROVIDED':
      newCtx.info.size = event.size
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'SIZE_CONFIRMED':
      if (ctx.state === 'awaiting_size') {
        newCtx.state = 'ready_to_generate'
      }
      return newCtx
    
    case 'PICTURE_UPLOADED':
      newCtx.pendingFile = event.file
      newCtx.uploadedFiles = [...ctx.uploadedFiles, event.file]
      // If already have a photo, ask if they want to replace
      if (ctx.info.hasPhoto) {
        newCtx.state = 'awaiting_image_update'
      } else {
        // Ask about background removal
        newCtx.state = 'awaiting_bg_removal'
      }
      return newCtx
    
    case 'BG_REMOVAL_YES':
      newCtx.info.bgRemovalRequested = true
      newCtx.info.hasPhoto = true
      newCtx.info.photoFile = ctx.pendingFile
      newCtx.pendingFile = null
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'BG_REMOVAL_NO':
      newCtx.info.bgRemovalRequested = false
      newCtx.info.hasPhoto = true
      newCtx.info.photoFile = ctx.pendingFile
      newCtx.pendingFile = null
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'IMAGE_UPDATE_YES':
      newCtx.info.photoFile = ctx.pendingFile
      newCtx.pendingFile = null
      newCtx.state = ctx.state === 'preview_ready' ? 'preview_ready' : getNextState(newCtx)
      return newCtx
    
    case 'IMAGE_UPDATE_NO':
      newCtx.pendingFile = null
      newCtx.state = ctx.state === 'preview_ready' ? 'preview_ready' : getNextState(newCtx)
      return newCtx
    
    case 'IMAGE_CHOICE_FIRST':
      if (ctx.uploadedFiles.length > 0) {
        newCtx.info.photoFile = ctx.uploadedFiles[0]
        newCtx.info.hasPhoto = true
      }
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'IMAGE_CHOICE_LATEST':
      if (ctx.uploadedFiles.length > 0) {
        newCtx.info.photoFile = ctx.uploadedFiles[ctx.uploadedFiles.length - 1]
        newCtx.info.hasPhoto = true
      }
      newCtx.state = getNextState(newCtx)
      return newCtx
    
    case 'GENERATE_REQUESTED':
      if (canGenerateFromContext(newCtx)) {
        newCtx.state = 'generating'
      } else {
        // Determine what's missing and go to that state
        if (!newCtx.info.name1) {
          newCtx.state = 'awaiting_names'
        } else if (!newCtx.info.date) {
          newCtx.state = 'awaiting_date'
        } else if (!newCtx.info.size) {
          newCtx.state = 'awaiting_size'
        }
      }
      return newCtx
    
    case 'GENERATION_STARTED':
      newCtx.state = 'generating'
      return newCtx
    
    case 'GENERATION_COMPLETE':
      newCtx.state = 'preview_ready'
      return newCtx
    
    case 'GENERATION_FAILED':
      newCtx.state = 'ready_to_generate'
      newCtx.errorMessage = 'Generation failed. Please try again.'
      return newCtx
    
    case 'EDIT_REQUESTED':
      newCtx.state = 'editing'
      return newCtx
    
    case 'EDIT_COMPLETE':
      newCtx.state = 'preview_ready'
      return newCtx
    
    case 'USER_MESSAGE':
      newCtx.lastUserMessage = event.message
      return newCtx
    
    default:
      return ctx
  }
}

/**
 * Determine the next logical state based on what info we have
 */
function getNextState(ctx: WeddingFlowContext): WeddingFlowState {
  const { info } = ctx
  
  // If we have enough to generate, go to ready state
  if (canGenerateFromContext(ctx)) {
    // But first check if size is confirmed
    if (!info.size) {
      return 'awaiting_size'
    }
    return 'ready_to_generate'
  }
  
  // Otherwise, determine what we need next
  if (!info.name1 && !info.name2) {
    return 'collecting_info' // Will ask for names
  }
  
  if (!info.date) {
    return 'collecting_info' // Will ask for date
  }
  
  return 'collecting_info'
}

/**
 * Check if we have enough info to generate from context
 */
function canGenerateFromContext(ctx: WeddingFlowContext): boolean {
  const { info } = ctx
  const hasNames = !!(info.name1 || info.name2)
  const hasPhoto = info.hasPhoto
  const hasDate = !!info.date
  
  // Need (names OR photo) AND date
  return (hasNames || hasPhoto) && hasDate
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { WeddingFlowContext }
