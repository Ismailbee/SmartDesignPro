/**
 * AI Voice Commands Service
 * Uses Web Speech API - works offline, no external API needed
 * Optimized for Android/mobile devices
 */

export interface VoiceCommand {
  command: string
  keywords: string[]
  action: string
  parameters?: Record<string, any>
}

export interface VoiceResult {
  success: boolean
  command?: string
  action?: string
  parameters?: Record<string, any>
  confidence: number
  transcript: string
}

export type VoiceCommandCallback = (result: VoiceResult) => void
export type VoiceStatusCallback = (status: 'listening' | 'processing' | 'idle' | 'error', message?: string) => void

class VoiceCommandsService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private isListening = false
  private commands: VoiceCommand[] = []
  private onCommandCallback: VoiceCommandCallback | null = null
  private onStatusCallback: VoiceStatusCallback | null = null
  private lastTranscript = ''
  private confidenceThreshold = 0.5

  // Default design commands
  private readonly defaultCommands: VoiceCommand[] = [
    // Text commands
    { command: 'add text', keywords: ['add text', 'create text', 'new text', 'insert text'], action: 'ADD_TEXT' },
    { command: 'add heading', keywords: ['add heading', 'create heading', 'new heading', 'add title'], action: 'ADD_HEADING' },
    { command: 'bold', keywords: ['bold', 'make bold', 'make it bold', 'bold text'], action: 'TOGGLE_BOLD' },
    { command: 'italic', keywords: ['italic', 'make italic', 'italicize'], action: 'TOGGLE_ITALIC' },
    { command: 'underline', keywords: ['underline', 'add underline'], action: 'TOGGLE_UNDERLINE' },
    { command: 'change font size', keywords: ['font size', 'text size', 'make bigger', 'make smaller', 'increase size', 'decrease size'], action: 'CHANGE_FONT_SIZE' },
    { command: 'change color', keywords: ['change color', 'text color', 'make red', 'make blue', 'make green', 'make black', 'make white'], action: 'CHANGE_COLOR' },
    { command: 'align left', keywords: ['align left', 'left align'], action: 'ALIGN_LEFT' },
    { command: 'align center', keywords: ['align center', 'center align', 'center text'], action: 'ALIGN_CENTER' },
    { command: 'align right', keywords: ['align right', 'right align'], action: 'ALIGN_RIGHT' },
    
    // Shape commands  
    { command: 'add rectangle', keywords: ['add rectangle', 'create rectangle', 'draw rectangle', 'add box', 'add square'], action: 'ADD_RECTANGLE' },
    { command: 'add circle', keywords: ['add circle', 'create circle', 'draw circle', 'add oval'], action: 'ADD_CIRCLE' },
    { command: 'add triangle', keywords: ['add triangle', 'create triangle', 'draw triangle'], action: 'ADD_TRIANGLE' },
    { command: 'add star', keywords: ['add star', 'create star', 'draw star'], action: 'ADD_STAR' },
    { command: 'add line', keywords: ['add line', 'create line', 'draw line'], action: 'ADD_LINE' },
    
    // Image commands
    { command: 'add image', keywords: ['add image', 'insert image', 'add picture', 'upload image', 'add photo'], action: 'ADD_IMAGE' },
    
    // Editing commands
    { command: 'delete', keywords: ['delete', 'remove', 'erase', 'clear selection'], action: 'DELETE' },
    { command: 'duplicate', keywords: ['duplicate', 'copy', 'clone', 'make copy'], action: 'DUPLICATE' },
    { command: 'undo', keywords: ['undo', 'go back', 'reverse'], action: 'UNDO' },
    { command: 'redo', keywords: ['redo', 'go forward'], action: 'REDO' },
    { command: 'select all', keywords: ['select all', 'select everything'], action: 'SELECT_ALL' },
    { command: 'deselect', keywords: ['deselect', 'clear selection', 'unselect'], action: 'DESELECT' },
    
    // Layer commands
    { command: 'bring forward', keywords: ['bring forward', 'move forward', 'bring to front', 'move up'], action: 'BRING_FORWARD' },
    { command: 'send backward', keywords: ['send backward', 'move backward', 'send to back', 'move down'], action: 'SEND_BACKWARD' },
    
    // Zoom commands
    { command: 'zoom in', keywords: ['zoom in', 'make bigger', 'enlarge'], action: 'ZOOM_IN' },
    { command: 'zoom out', keywords: ['zoom out', 'make smaller'], action: 'ZOOM_OUT' },
    { command: 'reset zoom', keywords: ['reset zoom', 'fit to screen', 'reset view'], action: 'RESET_ZOOM' },
    
    // Export commands
    { command: 'export', keywords: ['export', 'download', 'save image', 'save as png'], action: 'EXPORT' },
    
    // Help commands
    { command: 'help', keywords: ['help', 'what can you do', 'show commands', 'voice commands'], action: 'SHOW_HELP' }
  ]

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
    this.commands = [...this.defaultCommands]
  }

  private initializeSpeechRecognition(): void {
    // Check for Web Speech API support
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognitionAPI()
    this.recognition.continuous = false
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 3
    this.recognition.lang = 'en-US'

    this.recognition.onstart = () => {
      this.isListening = true
      this.onStatusCallback?.('listening', 'Listening...')
    }

    this.recognition.onend = () => {
      this.isListening = false
      this.onStatusCallback?.('idle')
    }

    this.recognition.onerror = (event) => {
      this.isListening = false
      let message = 'Voice recognition error'
      
      switch (event.error) {
        case 'no-speech':
          message = 'No speech detected. Please try again.'
          break
        case 'audio-capture':
          message = 'No microphone found. Please check your device.'
          break
        case 'not-allowed':
          message = 'Microphone access denied. Please allow access.'
          break
        case 'network':
          message = 'Network error. Please check your connection.'
          break
      }
      
      this.onStatusCallback?.('error', message)
    }

    this.recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      let maxConfidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript.toLowerCase().trim()
        
        if (result.isFinal) {
          finalTranscript = transcript
          maxConfidence = result[0].confidence
        } else {
          interimTranscript = transcript
        }
      }

      if (finalTranscript && finalTranscript !== this.lastTranscript) {
        this.lastTranscript = finalTranscript
        this.onStatusCallback?.('processing', `Processing: "${finalTranscript}"`)
        this.processCommand(finalTranscript, maxConfidence)
      }
    }
  }

  private initializeSpeechSynthesis(): void {
    if ('speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis
    }
  }

  private processCommand(transcript: string, confidence: number): void {
    const normalizedTranscript = transcript.toLowerCase().trim()
    
    // Find best matching command
    let bestMatch: VoiceCommand | null = null
    let highestScore = 0

    for (const command of this.commands) {
      for (const keyword of command.keywords) {
        if (normalizedTranscript.includes(keyword)) {
          // Score based on how much of the transcript is the keyword
          const score = keyword.length / normalizedTranscript.length
          if (score > highestScore) {
            highestScore = score
            bestMatch = command
          }
        }
      }
    }

    // Extract parameters from the transcript
    const parameters = this.extractParameters(normalizedTranscript, bestMatch)

    const result: VoiceResult = {
      success: bestMatch !== null && confidence >= this.confidenceThreshold,
      command: bestMatch?.command,
      action: bestMatch?.action,
      parameters,
      confidence,
      transcript: normalizedTranscript
    }

    // Provide voice feedback
    if (result.success && bestMatch) {
      this.speak(`${bestMatch.command}`)
    } else if (confidence >= this.confidenceThreshold) {
      this.speak("Sorry, I didn't understand that command")
    }

    this.onCommandCallback?.(result)
  }

  private extractParameters(transcript: string, command: VoiceCommand | null): Record<string, any> {
    const params: Record<string, any> = {}

    // Extract color from transcript
    const colors: Record<string, string> = {
      'red': '#ef4444',
      'blue': '#3b82f6',
      'green': '#22c55e',
      'yellow': '#eab308',
      'purple': '#a855f7',
      'pink': '#ec4899',
      'orange': '#f97316',
      'black': '#000000',
      'white': '#ffffff',
      'gray': '#6b7280',
      'grey': '#6b7280'
    }

    for (const [colorName, colorValue] of Object.entries(colors)) {
      if (transcript.includes(colorName)) {
        params.color = colorValue
        break
      }
    }

    // Extract size from transcript
    const sizeMatch = transcript.match(/(\d+)\s*(pixels?|px|pt|points?)?/i)
    if (sizeMatch) {
      params.size = parseInt(sizeMatch[1])
    }

    // Extract size modifiers
    if (transcript.includes('bigger') || transcript.includes('larger') || transcript.includes('increase')) {
      params.sizeModifier = 'increase'
    } else if (transcript.includes('smaller') || transcript.includes('decrease')) {
      params.sizeModifier = 'decrease'
    }

    // Extract text content (for add text commands)
    if (command?.action === 'ADD_TEXT' || command?.action === 'ADD_HEADING') {
      const textMatch = transcript.match(/(?:saying|with|that says)\s+"?([^"]+)"?$/i)
      if (textMatch) {
        params.text = textMatch[1]
      }
    }

    return params
  }

  // Public methods
  isSupported(): boolean {
    return this.recognition !== null
  }

  start(): void {
    if (!this.recognition) {
      this.onStatusCallback?.('error', 'Voice recognition not supported')
      return
    }

    if (this.isListening) {
      return
    }

    try {
      this.recognition.start()
    } catch (error) {
      this.onStatusCallback?.('error', 'Failed to start voice recognition')
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  toggle(): void {
    if (this.isListening) {
      this.stop()
    } else {
      this.start()
    }
  }

  speak(text: string): void {
    if (!this.synthesis) return

    // Cancel any ongoing speech
    this.synthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = 1.1
    utterance.pitch = 1
    utterance.volume = 0.8

    // Use a natural sounding voice if available
    const voices = this.synthesis.getVoices()
    const preferredVoice = voices.find(v => 
      v.name.includes('Google') || 
      v.name.includes('Natural') ||
      v.name.includes('Samantha')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    this.synthesis.speak(utterance)
  }

  onCommand(callback: VoiceCommandCallback): void {
    this.onCommandCallback = callback
  }

  onStatus(callback: VoiceStatusCallback): void {
    this.onStatusCallback = callback
  }

  addCustomCommand(command: VoiceCommand): void {
    this.commands.push(command)
  }

  removeCommand(action: string): void {
    this.commands = this.commands.filter(c => c.action !== action)
  }

  getCommands(): VoiceCommand[] {
    return [...this.commands]
  }

  getStatus(): 'listening' | 'idle' {
    return this.isListening ? 'listening' : 'idle'
  }

  setLanguage(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang
    }
  }

  setConfidenceThreshold(threshold: number): void {
    this.confidenceThreshold = Math.max(0, Math.min(1, threshold))
  }

  dispose(): void {
    this.stop()
    this.recognition = null
    this.synthesis = null
    this.onCommandCallback = null
    this.onStatusCallback = null
  }
}

// Singleton instance
export const voiceCommandsService = new VoiceCommandsService()

// Export the class for testing
export { VoiceCommandsService }
