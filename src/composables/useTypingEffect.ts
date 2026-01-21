// src/composables/useTypingEffect.ts
import { ref, onUnmounted } from 'vue'

export interface TypingEffectOptions {
  /**
   * Speed of typing in milliseconds per character
   * @default 30
   */
  speed?: number
  
  /**
   * Callback when typing completes
   */
  onComplete?: () => void
  
  /**
   * Callback on each character typed (for auto-scroll)
   */
  onType?: () => void
}

export interface TypingEffectReturn {
  /**
   * The current displayed text (updates character by character)
   */
  displayedText: ReturnType<typeof ref<string>>
  
  /**
   * Whether the typing animation is currently running
   */
  isTyping: ReturnType<typeof ref<boolean>>
  
  /**
   * Start typing the full text
   * @param fullText The complete text to display character by character
   */
  startTyping: (fullText: string, options?: TypingEffectOptions) => void
  
  /**
   * Stop the typing animation immediately and show full text
   */
  stopTyping: () => void
  
  /**
   * Skip to the end - show full text immediately
   */
  skipToEnd: () => void
}

/**
 * Composable for creating a typing effect that displays text character by character
 * 
 * Usage:
 * ```ts
 * const { displayedText, isTyping, startTyping } = useTypingEffect()
 * 
 * // Start typing animation
 * startTyping('Hello, this is a typing effect!', {
 *   speed: 50,
 *   onComplete: () => console.log('Done typing!'),
 *   onType: () => scrollToBottom()
 * })
 * ```
 */
export function useTypingEffect(): TypingEffectReturn {
  const displayedText = ref('')
  const isTyping = ref(false)
  
  let fullTextToType = ''
  let currentIndex = 0
  let typingIntervalId: number | null = null
  let currentOptions: TypingEffectOptions = {}
  
  /**
   * Start typing animation
   */
  function startTyping(fullText: string, options: TypingEffectOptions = {}) {
    // Stop any existing typing animation
    stopTyping()
    
    // Set defaults
    currentOptions = {
      speed: 30,
      ...options
    }
    
    fullTextToType = fullText
    currentIndex = 0
    displayedText.value = ''
    isTyping.value = true
    
    // Use requestAnimationFrame for smoother animation and better performance
    let lastTime = performance.now()
    
    function typeNextCharacter() {
      if (currentIndex >= fullTextToType.length) {
        // Typing complete
        isTyping.value = false
        if (currentOptions.onComplete) {
          currentOptions.onComplete()
        }
        return
      }
      
      const now = performance.now()
      const elapsed = now - lastTime
      
      if (elapsed >= (currentOptions.speed || 30)) {
        // Add next character
        displayedText.value += fullTextToType[currentIndex]
        currentIndex++
        lastTime = now
        
        // Call onType callback for auto-scroll
        if (currentOptions.onType) {
          currentOptions.onType()
        }
      }
      
      // Continue animation
      if (isTyping.value) {
        typingIntervalId = requestAnimationFrame(typeNextCharacter) as unknown as number
      }
    }
    
    // Start the animation
    typingIntervalId = requestAnimationFrame(typeNextCharacter) as unknown as number
  }
  
  /**
   * Stop typing animation and clear displayed text
   */
  function stopTyping() {
    isTyping.value = false
    if (typingIntervalId !== null) {
      cancelAnimationFrame(typingIntervalId)
      typingIntervalId = null
    }
  }
  
  /**
   * Skip to the end - show full text immediately
   */
  function skipToEnd() {
    if (isTyping.value && fullTextToType) {
      stopTyping()
      displayedText.value = fullTextToType
      if (currentOptions.onComplete) {
        currentOptions.onComplete()
      }
    }
  }
  
  // Cleanup on unmount
  onUnmounted(() => {
    stopTyping()
  })
  
  return {
    displayedText,
    isTyping,
    startTyping,
    stopTyping,
    skipToEnd
  }
}
