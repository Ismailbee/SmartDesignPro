/**
 * useVoiceControl composable
 * 
 * Provides voice command recognition and text-to-speech capabilities.
 * Supports commands like "undo", "redo", "flip", "rotate", etc.
 */

import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export interface VoiceCommand {
  name: string
  phrases: string[]
  action: () => void
  description: string
}

export interface UseVoiceControlOptions {
  /** Language for speech recognition */
  language?: string
  /** Enable continuous listening */
  continuous?: boolean
  /** Commands to register */
  commands?: VoiceCommand[]
  /** Callback when voice input is received */
  onSpeechResult?: (transcript: string) => void
  /** Callback when command is recognized */
  onCommandRecognized?: (command: VoiceCommand) => void
}

// Speech recognition interface (for TypeScript)
interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

export function useVoiceControl(options: UseVoiceControlOptions = {}) {
  const {
    language = 'en-US',
    continuous = false,
    commands = [],
    onSpeechResult,
    onCommandRecognized
  } = options

  // State
  const isListening = ref(false)
  const isSpeaking = ref(false)
  const isSupported = ref(false)
  const transcript = ref('')
  const error = ref<string | null>(null)
  const registeredCommands = ref<VoiceCommand[]>(commands)

  // Speech recognition instance
  let recognition: any = null

  // Speech synthesis
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : null

  /**
   * Check if speech recognition is supported
   */
  function checkSupport(): boolean {
    if (typeof window === 'undefined') return false
    
    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition
    
    isSupported.value = !!SpeechRecognition
    return isSupported.value
  }

  /**
   * Initialize speech recognition
   */
  function initRecognition() {
    if (!checkSupport()) {
      console.warn('Speech recognition not supported')
      return false
    }

    const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition

    recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      isListening.value = true
      error.value = null
      console.log('🎤 Voice recognition started')
    }

    recognition.onend = () => {
      isListening.value = false
      console.log('🎤 Voice recognition ended')
    }

    recognition.onerror = (event: any) => {
      error.value = event.error
      isListening.value = false
      console.error('Voice recognition error:', event.error)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      transcript.value = finalTranscript || interimTranscript

      if (finalTranscript) {
        console.log('🎤 Final transcript:', finalTranscript)
        processTranscript(finalTranscript)
        onSpeechResult?.(finalTranscript)
      }
    }

    return true
  }

  /**
   * Process transcript and match commands
   */
  function processTranscript(text: string) {
    const normalizedText = text.toLowerCase().trim()
    
    for (const command of registeredCommands.value) {
      for (const phrase of command.phrases) {
        if (normalizedText.includes(phrase.toLowerCase())) {
          console.log(`🎯 Command recognized: ${command.name}`)
          
          // Haptic feedback
          if (navigator.vibrate) {
            navigator.vibrate([10, 50, 10])
          }
          
          command.action()
          onCommandRecognized?.(command)
          return
        }
      }
    }
  }

  /**
   * Start listening for voice commands
   */
  function startListening() {
    if (!recognition && !initRecognition()) {
      error.value = 'Speech recognition not supported'
      return false
    }

    try {
      recognition.start()
      return true
    } catch (e) {
      console.error('Failed to start recognition:', e)
      error.value = 'Failed to start voice recognition'
      return false
    }
  }

  /**
   * Stop listening
   */
  function stopListening() {
    if (recognition && isListening.value) {
      recognition.stop()
    }
  }

  /**
   * Toggle listening state
   */
  function toggleListening() {
    if (isListening.value) {
      stopListening()
    } else {
      startListening()
    }
  }

  /**
   * Speak text using text-to-speech
   */
  function speak(text: string, options: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      synth.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = language
      utterance.rate = options.rate || 1
      utterance.pitch = options.pitch || 1
      
      if (options.voice) {
        utterance.voice = options.voice
      }

      utterance.onstart = () => {
        isSpeaking.value = true
      }

      utterance.onend = () => {
        isSpeaking.value = false
        resolve()
      }

      utterance.onerror = (event) => {
        isSpeaking.value = false
        reject(new Error(event.error))
      }

      synth.speak(utterance)
    })
  }

  /**
   * Stop speaking
   */
  function stopSpeaking() {
    if (synth) {
      synth.cancel()
      isSpeaking.value = false
    }
  }

  /**
   * Get available voices
   */
  function getVoices(): SpeechSynthesisVoice[] {
    if (!synth) return []
    return synth.getVoices()
  }

  /**
   * Register a new command
   */
  function registerCommand(command: VoiceCommand) {
    // Check for duplicate
    const exists = registeredCommands.value.some(c => c.name === command.name)
    if (!exists) {
      registeredCommands.value.push(command)
    }
  }

  /**
   * Unregister a command
   */
  function unregisterCommand(name: string) {
    registeredCommands.value = registeredCommands.value.filter(c => c.name !== name)
  }

  /**
   * Create default commands for the sticker editor
   */
  function createDefaultCommands(actions: {
    onFlip?: () => void
    onRotate?: () => void
    onSave?: () => void
    onExport?: () => void
    onNewBackground?: () => void
  }): VoiceCommand[] {
    const defaultCommands: VoiceCommand[] = []

    if (actions.onFlip) {
      defaultCommands.push({
        name: 'flip',
        phrases: ['flip', 'mirror', 'flip image', 'mirror image'],
        action: actions.onFlip,
        description: 'Flip the image horizontally'
      })
    }

    if (actions.onRotate) {
      defaultCommands.push({
        name: 'rotate',
        phrases: ['rotate', 'turn', 'spin', 'rotate image'],
        action: actions.onRotate,
        description: 'Rotate the image 90 degrees'
      })
    }

    if (actions.onSave) {
      defaultCommands.push({
        name: 'save',
        phrases: ['save', 'save project', 'keep it', 'store'],
        action: actions.onSave,
        description: 'Save the current project'
      })
    }

    if (actions.onExport) {
      defaultCommands.push({
        name: 'export',
        phrases: ['export', 'download', 'get image', 'save image'],
        action: actions.onExport,
        description: 'Export the design as an image'
      })
    }

    if (actions.onNewBackground) {
      defaultCommands.push({
        name: 'newBackground',
        phrases: ['new background', 'change background', 'regenerate', 'new design'],
        action: actions.onNewBackground,
        description: 'Generate a new background'
      })
    }

    return defaultCommands
  }

  // Initialize on mount
  onMounted(() => {
    checkSupport()
  })

  // Cleanup
  onBeforeUnmount(() => {
    stopListening()
    stopSpeaking()
  })

  return {
    // State
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    error,
    registeredCommands,

    // Methods
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
    getVoices,
    registerCommand,
    unregisterCommand,
    createDefaultCommands
  }
}

export type UseVoiceControlReturn = ReturnType<typeof useVoiceControl>
