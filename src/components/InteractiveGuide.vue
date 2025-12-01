<template>
  <Teleport to="body">
    <div v-if="isActive" class="interactive-guide-overlay">
      <!-- Backdrop -->
      <div class="guide-backdrop"></div>

      <!-- Hand Icon -->
      <div 
        class="hand-pointer"
        :class="{ 'animate-bounce': true }"
        :style="{ 
          top: pointerPosition.y + 'px', 
          left: pointerPosition.x + 'px',
          transform: `rotate(${pointerRotation}deg)`
        }"
      >
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 13.5V4.5C8 3.11929 9.11929 2 10.5 2C11.8807 2 13 3.11929 13 4.5V12H14.5V5.5C14.5 4.11929 15.6193 3 17 3C18.3807 3 19.5 4.11929 19.5 5.5V15.5C19.5 19.0899 16.5899 22 13 22C9.41015 22 6.5 19.0899 6.5 15.5V10.5C6.5 9.11929 7.61929 8 9 8C9.46472 8 9.89306 8.12676 10.2676 8.34824" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="white"/>
        </svg>
      </div>

      <!-- Message Box -->
      <div 
        class="guide-message-box"
        :style="{ 
          top: messagePosition.y + 'px', 
          left: messagePosition.x + 'px' 
        }"
      >
        <div class="message-header">
          <span class="step-indicator">Step {{ currentStepIndex + 1 }}/{{ steps.length }}</span>
          <button @click="toggleVoice" class="voice-btn" :class="{ 'active': isVoiceEnabled }">
            <span v-if="isVoiceEnabled">🔊</span>
            <span v-else>🔇</span>
          </button>
        </div>
        
        <div class="message-content">
          <p>{{ currentStep.message }}</p>
        </div>
        
        <div class="guide-controls">
          <button @click="skipGuide" class="skip-btn">Skip Tutorial</button>
          <button @click="nextStep" class="next-btn">
            {{ isLastStep ? 'Finish' : 'Next' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

interface Step {
  target: string
  message: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = defineProps<{
  steps: Step[]
  startDelay?: number
}>()

const emit = defineEmits(['complete', 'skip'])

const isActive = ref(false)
const currentStepIndex = ref(0)
const isVoiceEnabled = ref(true)
const pointerPosition = ref({ x: 0, y: 0 })
const messagePosition = ref({ x: 0, y: 0 })
const pointerRotation = ref(0)

const currentStep = computed(() => props.steps[currentStepIndex.value])
const isLastStep = computed(() => currentStepIndex.value === props.steps.length - 1)

// Speech Synthesis - with safe initialization
const synth = typeof window !== 'undefined' ? window.speechSynthesis : null
let utterance: SpeechSynthesisUtterance | null = null

const speak = (text: string) => {
  if (!isVoiceEnabled.value || !synth) return
  
  // Cancel any current speech
  synth?.cancel()
  
  utterance = new SpeechSynthesisUtterance(text)
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1
  
  // Try to select a good voice
  const voices = synth?.getVoices() || []
  const preferredVoice = voices.find(voice => voice.lang.includes('en') && voice.name.includes('Google')) || voices[0]
  if (preferredVoice) utterance.voice = preferredVoice
  
  synth?.speak(utterance)
}

const toggleVoice = () => {
  isVoiceEnabled.value = !isVoiceEnabled.value
  if (!isVoiceEnabled.value && synth) {
    synth?.cancel()
  } else {
    speak(currentStep.value.message)
  }
}

const updatePositions = () => {
  if (!isActive.value) return

  const targetEl = document.querySelector(currentStep.value.target)
  if (!targetEl) {
    console.warn(`Target element not found: ${currentStep.value.target}`)
    return
  }

  targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' })

  const rect = targetEl.getBoundingClientRect()
  const position = currentStep.value.position || 'bottom'
  
  // Calculate pointer position (pointing to the element)
  // Default: Point from bottom-right
  let ptrX = rect.left + rect.width / 2
  let ptrY = rect.top + rect.height / 2
  let msgX = rect.left
  let msgY = rect.bottom + 20
  let rotation = 0

  // Adjust based on preferred position
  switch (position) {
    case 'top':
      ptrX = rect.left + rect.width / 2 - 30
      ptrY = rect.top - 70
      msgX = rect.left
      msgY = rect.top - 180
      rotation = 180
      break
    case 'bottom':
      ptrX = rect.left + rect.width / 2 - 30
      ptrY = rect.bottom + 10
      msgX = rect.left
      msgY = rect.bottom + 80
      rotation = 0
      break
    case 'left':
      ptrX = rect.left - 70
      ptrY = rect.top + rect.height / 2 - 30
      msgX = rect.left - 320
      msgY = rect.top
      rotation = 90
      break
    case 'right':
      ptrX = rect.right + 10
      ptrY = rect.top + rect.height / 2 - 30
      msgX = rect.right + 80
      msgY = rect.top
      rotation = -90
      break
  }

  // Ensure message box stays within viewport
  const msgWidth = 300
  const msgHeight = 150
  const padding = 20

  if (msgX + msgWidth > window.innerWidth) msgX = window.innerWidth - msgWidth - padding
  if (msgX < padding) msgX = padding
  if (msgY + msgHeight > window.innerHeight) msgY = window.innerHeight - msgHeight - padding
  if (msgY < padding) msgY = padding

  pointerPosition.value = { x: ptrX, y: ptrY }
  messagePosition.value = { x: msgX, y: msgY }
  pointerRotation.value = rotation
}

const nextStep = () => {
  if (isLastStep.value) {
    completeGuide()
  } else {
    currentStepIndex.value++
  }
}

const skipGuide = () => {
  isActive.value = false
  if (synth) synth.cancel()
  localStorage.setItem('hasSeenGuide', 'true')
  emit('skip')
}

const completeGuide = () => {
  isActive.value = false
  if (synth) synth.cancel()
  localStorage.setItem('hasSeenGuide', 'true')
  emit('complete')
}

const startGuide = () => {
  const hasSeen = localStorage.getItem('hasSeenGuide')
  if (hasSeen) return

  setTimeout(() => {
    isActive.value = true
    // Wait for DOM update then position
    setTimeout(() => {
      updatePositions()
      speak(currentStep.value.message)
    }, 100)
  }, props.startDelay || 1000)
}

watch(currentStepIndex, () => {
  setTimeout(() => {
    updatePositions()
    speak(currentStep.value.message)
  }, 500) // Wait for scroll
})

onMounted(() => {
  startGuide()
  window.addEventListener('resize', updatePositions)
  window.addEventListener('scroll', updatePositions)
})

onUnmounted(() => {
  if (synth) synth.cancel()
  window.removeEventListener('resize', updatePositions)
  window.removeEventListener('scroll', updatePositions)
})
</script>

<style scoped>
.interactive-guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99999;
  pointer-events: none; /* Allow clicks to pass through to backdrop/buttons */
}

.guide-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  pointer-events: auto; /* Block interaction with underlying page */
}

.hand-pointer {
  position: absolute;
  width: 60px;
  height: 60px;
  z-index: 100001;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(var(--rotation)); }
  50% { transform: translateY(-10px) rotate(var(--rotation)); }
}

.guide-message-box {
  position: absolute;
  width: 300px;
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  z-index: 100001;
  pointer-events: auto;
  transition: all 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  border: 2px solid #6366f1;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.step-indicator {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6366f1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.voice-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s;
}

.voice-btn:hover {
  background: #f3f4f6;
}

.message-content p {
  margin: 0 0 20px 0;
  color: #1f2937;
  font-size: 1rem;
  line-height: 1.5;
}

.guide-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skip-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s;
}

.skip-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.next-btn {
  background: #6366f1;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}

.next-btn:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px rgba(99, 102, 241, 0.4);
}

.next-btn:active {
  transform: translateY(0);
}
</style>
