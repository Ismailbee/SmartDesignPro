/**
 * Composable for Voice Input (Speech Recognition) and Text-to-Speech
 */

import { ref, onUnmounted } from 'vue'

// Types
interface SpeechRecognitionEvent {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionError {
  error: string
}

interface TextToSpeechOptions {
  text: string
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  category?: string
}

// TextToSpeech from Capacitor (will be imported in component)
let TextToSpeech: any = null

export function useVoiceInput(options?: {
  onResult?: (text: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
  TextToSpeechPlugin?: any
}) {
  // State
  const isRecording = ref(false)
  const isVoiceEnabled = ref(true)
  const isMobileDevice = ref(false)
  const interimTranscript = ref('')
  
  // Speech recognition instance
  let speechRecognition: any = null
  
  // Set TTS plugin if provided
  if (options?.TextToSpeechPlugin) {
    TextToSpeech = options.TextToSpeechPlugin
  }

  /**
   * Check if running on mobile device
   */
  function checkIfMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.())
  }

  /**
   * Initialize speech recognition
   */
  function initSpeechRecognition(): any {
    isMobileDevice.value = checkIfMobile()
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      console.warn('⚠️ Speech Recognition not supported')
      return null
    }
    
    const recognition = new SpeechRecognition()
    
    // Configuration - optimized for mobile
    recognition.continuous = !isMobileDevice.value
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1
    
    // Event: When speech is recognized
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }
      
      if (interim) {
        interimTranscript.value = interim
        options?.onResult?.(interim, false)
      }
      
      if (finalTranscript) {
        interimTranscript.value = ''
        options?.onResult?.(finalTranscript, true)
        console.log('🎤 Recognized:', finalTranscript)
      }
    }
    
    // Event: Recognition started
    recognition.onstart = () => {
      console.log('🎤 Voice recognition started')
      isRecording.value = true
      options?.onStart?.()
    }
    
    // Event: Recognition ended
    recognition.onend = () => {
      console.log('🎤 Voice recognition ended')
      isRecording.value = false
      options?.onEnd?.()
    }
    
    // Event: Error occurred
    recognition.onerror = (event: SpeechRecognitionError) => {
      console.error('🎤 Speech recognition error:', event.error)
      isRecording.value = false
      
      let errorMessage = 'Voice input error'
      switch (event.error) {
        case 'no-speech':
          errorMessage = "I didn't hear anything. Tap the mic and try again!"
          break
        case 'audio-capture':
          errorMessage = 'No microphone found. Please check your device settings.'
          break
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone permission.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your internet connection.'
          break
        case 'aborted':
          return // User stopped recording - no error
        case 'service-not-allowed':
          errorMessage = 'Speech service not available. Please try again later.'
          break
        default:
          errorMessage = `Voice error: ${event.error}`
      }
      
      options?.onError?.(errorMessage)
    }
    
    return recognition
  }

  /**
   * Start voice recording
   */
  function startRecording(): boolean {
    // Initialize if not already
    if (!speechRecognition) {
      speechRecognition = initSpeechRecognition()
    }
    
    if (!speechRecognition) {
      options?.onError?.('Voice input not supported in this browser')
      return false
    }
    
    try {
      speechRecognition.start()
      
      // Haptic feedback on mobile
      if (isMobileDevice.value && navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      return true
    } catch (error) {
      console.error('Failed to start recording:', error)
      options?.onError?.('Failed to start voice recording')
      return false
    }
  }

  /**
   * Stop voice recording
   */
  function stopRecording() {
    if (speechRecognition && isRecording.value) {
      try {
        speechRecognition.stop()
        
        // Haptic feedback on mobile
        if (isMobileDevice.value && navigator.vibrate) {
          navigator.vibrate(100)
        }
      } catch (error) {
        console.error('Failed to stop recording:', error)
      }
    }
    isRecording.value = false
  }

  /**
   * Toggle voice recording
   */
  function toggleRecording(): boolean {
    if (isRecording.value) {
      stopRecording()
      return false
    } else {
      return startRecording()
    }
  }

  /**
   * Clean text for TTS (remove emojis, markdown, etc.)
   */
  function cleanTextForSpeech(text: string): string {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental
      .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
      .replace(/\*\*/g, '')                    // Markdown bold
      .replace(/\s+/g, ' ')                    // Clean whitespace
      .trim()
  }

  /**
   * Stop all ongoing speech
   */
  function stopAllSpeech() {
    try {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      TextToSpeech?.stop?.().catch(() => {})
    } catch (e) {
      // Ignore errors
    }
  }

  /**
   * Try native TTS (Capacitor)
   */
  async function tryNativeTTS(text: string): Promise<boolean> {
    if (!TextToSpeech) return false
    
    try {
      console.log('🔊 Attempting native TTS...')
      await TextToSpeech.speak({
        text: text,
        lang: 'en-US',
        rate: 0.95,
        pitch: 1.0,
        volume: 1.0,
        category: 'ambient'
      })
      console.log('✅ Native TTS successful')
      return true
    } catch (error) {
      console.warn('❌ Native TTS failed:', error)
      return false
    }
  }

  /**
   * Try Web Speech API TTS
   */
  function tryWebSpeech(text: string): boolean {
    if (!window.speechSynthesis) {
      console.warn('Web Speech API not available')
      return false
    }
    
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.95
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.lang = 'en-US'
      
      // Try to get a good voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(v => 
        v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Samantha'))
      ) || voices.find(v => v.lang.startsWith('en'))
      
      if (preferredVoice) {
        utterance.voice = preferredVoice
      }
      
      window.speechSynthesis.speak(utterance)
      return true
    } catch (error) {
      console.error('Web Speech TTS failed:', error)
      return false
    }
  }

  /**
   * Speak a message using TTS
   */
  async function speakMessage(text: string) {
    if (!isVoiceEnabled.value) return
    
    stopAllSpeech()
    
    const cleanText = cleanTextForSpeech(text)
    if (!cleanText) return
    
    // On mobile, try native TTS first
    if (isMobileDevice.value || checkIfMobile()) {
      const nativeSuccess = await tryNativeTTS(cleanText)
      if (!nativeSuccess) {
        tryWebSpeech(cleanText)
      }
    } else {
      tryWebSpeech(cleanText)
    }
  }

  /**
   * Toggle voice enabled state
   */
  function toggleVoiceEnabled() {
    isVoiceEnabled.value = !isVoiceEnabled.value
    if (isVoiceEnabled.value) {
      speakMessage("Voice guidance enabled.")
    } else {
      stopAllSpeech()
    }
  }

  /**
   * Check if speech recognition is supported
   */
  function isSpeechRecognitionSupported(): boolean {
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopRecording()
    stopAllSpeech()
  })

  return {
    // State
    isRecording,
    isVoiceEnabled,
    isMobileDevice,
    interimTranscript,
    
    // Methods
    startRecording,
    stopRecording,
    toggleRecording,
    speakMessage,
    toggleVoiceEnabled,
    stopAllSpeech,
    isSpeechRecognitionSupported,
    checkIfMobile
  }
}
