<template>
  <Transition :name="isMobile ? 'panel-slide-up' : 'panel-slide'">
    <aside v-if="isVisible" class="animation-panel" :class="{ 'mobile': isMobile }">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-title">
          <Sparkles :size="18" class="title-icon" />
          <span>Animations Studio</span>
        </div>
        <div class="header-actions">
          <button 
            class="action-btn preview-all-btn" 
            @click="previewAllAnimations"
            :disabled="!hasAnimations"
            title="Preview All (Space)"
          >
            <Play v-if="!isPlaying" :size="14" />
            <Pause v-else :size="14" />
          </button>
          <button class="close-btn" @click="$emit('close')">
            <X :size="18" />
          </button>
        </div>
      </div>

      <!-- Live Preview Window -->
      <div class="preview-window" :class="{ playing: isPlaying }">
        <div class="preview-stage">
          <div 
            ref="previewObject"
            class="preview-object"
            :style="previewObjectStyle"
          >
            <component 
              :is="getPreviewIcon" 
              v-if="selectedObject?.type !== 'textbox'" 
              :size="40" 
            />
            <span v-else class="preview-text">Aa</span>
          </div>
        </div>
        <div class="preview-controls">
          <button @click="replayPreview" class="control-btn" title="Replay">
            <RotateCcw :size="14" />
          </button>
          <div class="preview-info">
            <span v-if="currentAnimation">{{ currentAnimation.name }}</span>
            <span v-else class="no-animation">Select an animation</span>
          </div>
          <div class="speed-control">
            <button 
              @click="cycleSpeed" 
              class="speed-btn"
              :title="`Speed: ${playbackSpeed}x`"
            >
              {{ playbackSpeed }}x
            </button>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="timeline-section" v-if="selectedObject">
        <div class="timeline-header">
          <Clock :size="14" />
          <span>Timeline</span>
          <span class="timeline-duration">{{ totalDuration.toFixed(1) }}s</span>
        </div>
        <div class="timeline-track" @click="seekTimeline">
          <div class="timeline-progress" :style="{ width: `${timelineProgress}%` }"></div>
          <div 
            class="timeline-playhead" 
            :style="{ left: `${timelineProgress}%` }"
          ></div>
          <!-- Animation markers -->
          <div 
            v-for="(anim, index) in objectAnimations"
            :key="index"
            class="animation-marker"
            :style="{ 
              left: `${(anim.delay / totalDuration) * 100}%`,
              width: `${(anim.duration / totalDuration) * 100}%`
            }"
            :class="anim.type"
          >
            <span class="marker-label">{{ anim.name }}</span>
          </div>
        </div>
        <div class="timeline-controls">
          <button @click="playTimeline" class="play-btn" :class="{ playing: isPlaying }">
            <Play v-if="!isPlaying" :size="16" />
            <Pause v-else :size="16" />
          </button>
          <button @click="stopTimeline" class="stop-btn">
            <Square :size="14" />
          </button>
          <div class="time-display">
            {{ currentTime.toFixed(1) }}s / {{ totalDuration.toFixed(1) }}s
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="panel-tabs">
        <button 
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="14" />
          <span>{{ tab.name }}</span>
          <span v-if="tab.count" class="tab-count">{{ tab.count }}</span>
        </button>
      </div>

      <!-- Animation Grid -->
      <div class="panel-content">
        <div class="animations-grid">
          <button 
            v-for="anim in currentAnimations" 
            :key="anim.id"
            :class="['animation-card', { 
              active: selectedAnimation === anim.id,
              applied: isAnimationApplied(anim.id)
            }]"
            @click="selectAndPreview(anim)"
            @mouseenter="hoverPreview(anim)"
            @mouseleave="stopHoverPreview"
          >
            <div class="card-preview" :class="[`preview-${anim.id}`, { animating: hoveredAnimation === anim.id }]">
              <div class="preview-shape"></div>
            </div>
            <div class="card-info">
              <span class="card-name">{{ anim.name }}</span>
              <span class="card-duration">{{ anim.duration }}ms</span>
            </div>
            <div v-if="isAnimationApplied(anim.id)" class="applied-badge">
              <Check :size="10" />
            </div>
          </button>
        </div>
      </div>

      <!-- Settings Panel -->
      <Transition name="slide-up">
        <div v-if="selectedAnimation" class="settings-panel">
          <div class="settings-header">
            <div class="selected-animation">
              <Sparkles :size="14" />
              <span>{{ currentAnimation?.name }}</span>
            </div>
            <button @click="clearSelection" class="clear-btn">
              <X :size="14" />
            </button>
          </div>

          <!-- Duration Slider -->
          <div class="setting-row">
            <label>
              <Timer :size="14" />
              Duration
            </label>
            <div class="slider-control">
              <input 
                type="range" 
                v-model.number="settings.duration" 
                min="0.1" 
                max="3" 
                step="0.1"
                @input="livePreview"
              />
              <span class="value">{{ settings.duration }}s</span>
            </div>
          </div>

          <!-- Delay Slider -->
          <div class="setting-row">
            <label>
              <Clock :size="14" />
              Delay
            </label>
            <div class="slider-control">
              <input 
                type="range" 
                v-model.number="settings.delay" 
                min="0" 
                max="5" 
                step="0.1"
                @input="livePreview"
              />
              <span class="value">{{ settings.delay }}s</span>
            </div>
          </div>

          <!-- Easing -->
          <div class="setting-row">
            <label>
              <Waves :size="14" />
              Easing
            </label>
            <div class="easing-options">
              <button 
                v-for="ease in easingOptions"
                :key="ease.id"
                :class="['easing-btn', { active: settings.easing === ease.id }]"
                @click="settings.easing = ease.id; livePreview()"
                :title="ease.name"
              >
                <div class="easing-curve" :class="`curve-${ease.id}`"></div>
              </button>
            </div>
          </div>

          <!-- Loop Control -->
          <div class="setting-row">
            <label>
              <Repeat :size="14" />
              Repeat
            </label>
            <div class="loop-options">
              <button 
                v-for="opt in repeatOptions"
                :key="opt.value"
                :class="['loop-btn', { active: settings.repeat === opt.value }]"
                @click="settings.repeat = opt.value"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <button class="btn-secondary" @click="previewAnimation">
              <Eye :size="14" />
              Preview
            </button>
            <button class="btn-primary" @click="applyAnimation">
              <Wand2 :size="14" />
              Apply
            </button>
          </div>
        </div>
      </Transition>

      <!-- No Selection State -->
      <div v-if="!selectedObject" class="no-selection">
        <MousePointer2 :size="48" class="icon" />
        <h3>Select an Object</h3>
        <p>Click on any element to add animations</p>
      </div>

      <!-- Applied Animations List -->
      <div v-if="objectAnimations.length > 0" class="applied-list">
        <div class="list-header">
          <Layers :size="14" />
          <span>Applied Animations</span>
          <button @click="removeAllAnimations" class="clear-all-btn">
            Clear All
          </button>
        </div>
        <div class="animation-items">
          <div 
            v-for="(anim, index) in objectAnimations"
            :key="index"
            class="animation-item"
            :class="anim.type"
          >
            <div class="item-info">
              <span class="item-name">{{ anim.name }}</span>
              <span class="item-timing">{{ anim.delay }}s + {{ anim.duration }}s</span>
            </div>
            <button @click="removeAnimation(index)" class="remove-btn">
              <Trash2 :size="12" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  X, Sparkles, ArrowDownToLine, ArrowUpFromLine, Zap,
  Play, Pause, Square, RotateCcw, Clock, Timer, Waves,
  Repeat, Eye, Wand2, MousePointer2, Layers, Trash2,
  Check, Type, Circle, Square as SquareIcon, Star, Image
} from 'lucide-vue-next'

interface Animation {
  id: string
  name: string
  type: 'entrance' | 'emphasis' | 'exit'
  duration: number
  icon?: string
}

interface AppliedAnimation {
  id: string
  name: string
  type: 'entrance' | 'emphasis' | 'exit'
  duration: number
  delay: number
  easing: string
}

const props = withDefaults(defineProps<{
  isVisible: boolean
  selectedObject: any
  isMobile?: boolean
}>(), {
  isMobile: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', animation: any): void
  (e: 'preview', animation: any): void
  (e: 'remove', index: number): void
  (e: 'removeAll'): void
  (e: 'playAll'): void
  (e: 'stopAll'): void
}>()

// State
const activeTab = ref<'entrance' | 'emphasis' | 'exit'>('entrance')
const selectedAnimation = ref<string | null>(null)
const hoveredAnimation = ref<string | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const playbackSpeed = ref(1)
const previewObject = ref<HTMLElement | null>(null)

const settings = reactive({
  duration: 0.5,
  delay: 0,
  easing: 'ease-out',
  repeat: 1
})

// Object animations storage
const objectAnimations = ref<AppliedAnimation[]>([])

// Tabs
const tabs = computed(() => [
  { id: 'entrance' as const, name: 'Entrance', icon: ArrowDownToLine, count: entranceAnimations.length },
  { id: 'emphasis' as const, name: 'Emphasis', icon: Zap, count: emphasisAnimations.length },
  { id: 'exit' as const, name: 'Exit', icon: ArrowUpFromLine, count: exitAnimations.length }
])

// Animations Data
const entranceAnimations: Animation[] = [
  { id: 'fade-in', name: 'Fade In', type: 'entrance', duration: 500 },
  { id: 'slide-up', name: 'Slide Up', type: 'entrance', duration: 600 },
  { id: 'slide-down', name: 'Slide Down', type: 'entrance', duration: 600 },
  { id: 'slide-left', name: 'Slide Left', type: 'entrance', duration: 600 },
  { id: 'slide-right', name: 'Slide Right', type: 'entrance', duration: 600 },
  { id: 'zoom-in', name: 'Zoom In', type: 'entrance', duration: 500 },
  { id: 'pop', name: 'Pop', type: 'entrance', duration: 400 },
  { id: 'bounce-in', name: 'Bounce In', type: 'entrance', duration: 800 },
  { id: 'rotate-in', name: 'Rotate In', type: 'entrance', duration: 600 },
  { id: 'flip-in', name: 'Flip In', type: 'entrance', duration: 600 },
  { id: 'drop-in', name: 'Drop In', type: 'entrance', duration: 700 },
  { id: 'swing-in', name: 'Swing In', type: 'entrance', duration: 600 }
]

const emphasisAnimations: Animation[] = [
  { id: 'pulse', name: 'Pulse', type: 'emphasis', duration: 500 },
  { id: 'shake', name: 'Shake', type: 'emphasis', duration: 500 },
  { id: 'wiggle', name: 'Wiggle', type: 'emphasis', duration: 400 },
  { id: 'bounce', name: 'Bounce', type: 'emphasis', duration: 600 },
  { id: 'flash', name: 'Flash', type: 'emphasis', duration: 300 },
  { id: 'rubber-band', name: 'Rubber Band', type: 'emphasis', duration: 600 },
  { id: 'tada', name: 'Tada', type: 'emphasis', duration: 700 },
  { id: 'heartbeat', name: 'Heartbeat', type: 'emphasis', duration: 800 },
  { id: 'jello', name: 'Jello', type: 'emphasis', duration: 500 },
  { id: 'swing', name: 'Swing', type: 'emphasis', duration: 600 },
  { id: 'float', name: 'Float', type: 'emphasis', duration: 1500 },
  { id: 'spin', name: 'Spin', type: 'emphasis', duration: 800 }
]

const exitAnimations: Animation[] = [
  { id: 'fade-out', name: 'Fade Out', type: 'exit', duration: 500 },
  { id: 'slide-out-up', name: 'Slide Out Up', type: 'exit', duration: 500 },
  { id: 'slide-out-down', name: 'Slide Out Down', type: 'exit', duration: 500 },
  { id: 'zoom-out', name: 'Zoom Out', type: 'exit', duration: 500 },
  { id: 'shrink', name: 'Shrink', type: 'exit', duration: 400 },
  { id: 'rotate-out', name: 'Rotate Out', type: 'exit', duration: 600 },
  { id: 'flip-out', name: 'Flip Out', type: 'exit', duration: 600 },
  { id: 'roll-out', name: 'Roll Out', type: 'exit', duration: 700 },
  { id: 'bounce-out', name: 'Bounce Out', type: 'exit', duration: 600 },
  { id: 'hinge', name: 'Hinge', type: 'exit', duration: 1000 }
]

const easingOptions = [
  { id: 'linear', name: 'Linear' },
  { id: 'ease-in', name: 'Ease In' },
  { id: 'ease-out', name: 'Ease Out' },
  { id: 'ease-in-out', name: 'Ease In Out' },
  { id: 'bounce', name: 'Bounce' },
  { id: 'elastic', name: 'Elastic' }
]

const repeatOptions = [
  { value: 1, label: 'Once' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
  { value: -1, label: '∞' }
]

// Computed
const currentAnimations = computed(() => {
  switch (activeTab.value) {
    case 'entrance': return entranceAnimations
    case 'emphasis': return emphasisAnimations
    case 'exit': return exitAnimations
    default: return []
  }
})

const currentAnimation = computed(() => {
  if (!selectedAnimation.value) return null
  return [...entranceAnimations, ...emphasisAnimations, ...exitAnimations]
    .find(a => a.id === selectedAnimation.value)
})

const hasAnimations = computed(() => objectAnimations.value.length > 0)

const totalDuration = computed(() => {
  if (objectAnimations.value.length === 0) return 3
  const maxEnd = Math.max(...objectAnimations.value.map(a => a.delay + a.duration))
  return Math.max(maxEnd, 3)
})

const timelineProgress = computed(() => {
  return (currentTime.value / totalDuration.value) * 100
})

const getPreviewIcon = computed(() => {
  if (!props.selectedObject) return Circle
  const type = props.selectedObject?.type
  switch (type) {
    case 'rect': return SquareIcon
    case 'circle': return Circle
    case 'triangle': return Star
    case 'image': return Image
    case 'textbox': return Type
    default: return Circle
  }
})

const previewObjectStyle = computed(() => {
  if (!currentAnimation.value || !isPlaying.value) return {}
  return {
    animation: `${currentAnimation.value.id} ${settings.duration}s ${settings.easing} ${settings.delay}s ${settings.repeat === -1 ? 'infinite' : settings.repeat}`
  }
})

// Methods
const selectAndPreview = (anim: Animation) => {
  selectedAnimation.value = anim.id
  settings.duration = anim.duration / 1000
  livePreview()
}

const hoverPreview = (anim: Animation) => {
  hoveredAnimation.value = anim.id
}

const stopHoverPreview = () => {
  hoveredAnimation.value = null
}

const clearSelection = () => {
  selectedAnimation.value = null
}

const isAnimationApplied = (animId: string) => {
  return objectAnimations.value.some(a => a.id === animId)
}

let previewTimeout: number | null = null

const livePreview = () => {
  if (!currentAnimation.value) return
  
  // Emit preview event for canvas to show
  emit('preview', {
    id: currentAnimation.value.id,
    settings: { ...settings }
  })
  
  // Animate preview object
  if (previewObject.value) {
    previewObject.value.style.animation = 'none'
    previewObject.value.offsetHeight // Trigger reflow
    previewObject.value.style.animation = `${currentAnimation.value.id} ${settings.duration}s ${settings.easing}`
  }
}

const previewAnimation = () => {
  livePreview()
}

const replayPreview = () => {
  if (previewObject.value) {
    previewObject.value.style.animation = 'none'
    previewObject.value.offsetHeight
    if (currentAnimation.value) {
      previewObject.value.style.animation = `${currentAnimation.value.id} ${settings.duration}s ${settings.easing}`
    }
  }
  
  // Also emit to canvas
  if (currentAnimation.value) {
    emit('preview', {
      id: currentAnimation.value.id,
      settings: { ...settings }
    })
  }
}

const applyAnimation = () => {
  if (!selectedAnimation.value || !currentAnimation.value) return
  
  const newAnimation: AppliedAnimation = {
    id: currentAnimation.value.id,
    name: currentAnimation.value.name,
    type: currentAnimation.value.type,
    duration: settings.duration,
    delay: settings.delay,
    easing: settings.easing
  }
  
  objectAnimations.value.push(newAnimation)
  
  emit('apply', {
    id: currentAnimation.value.id,
    settings: { ...settings }
  })
}

const removeAnimation = (index: number) => {
  objectAnimations.value.splice(index, 1)
  emit('remove', index)
}

const removeAllAnimations = () => {
  objectAnimations.value = []
  emit('removeAll')
}

const cycleSpeed = () => {
  const speeds = [0.5, 1, 1.5, 2]
  const currentIndex = speeds.indexOf(playbackSpeed.value)
  playbackSpeed.value = speeds[(currentIndex + 1) % speeds.length]
}

// Timeline controls
let animationFrame: number | null = null
let startTime: number | null = null

const playTimeline = () => {
  if (isPlaying.value) {
    pauseTimeline()
    return
  }
  
  isPlaying.value = true
  startTime = performance.now() - (currentTime.value * 1000)
  
  const animate = (timestamp: number) => {
    if (!startTime) startTime = timestamp
    const elapsed = (timestamp - startTime) / 1000 * playbackSpeed.value
    currentTime.value = elapsed % totalDuration.value
    
    if (isPlaying.value) {
      animationFrame = requestAnimationFrame(animate)
    }
  }
  
  animationFrame = requestAnimationFrame(animate)
  emit('playAll')
}

const pauseTimeline = () => {
  isPlaying.value = false
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

const stopTimeline = () => {
  isPlaying.value = false
  currentTime.value = 0
  startTime = null
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  emit('stopAll')
}

const seekTimeline = (e: MouseEvent) => {
  const rect = (e.target as HTMLElement).getBoundingClientRect()
  const x = e.clientX - rect.left
  const percent = x / rect.width
  currentTime.value = percent * totalDuration.value
}

const previewAllAnimations = () => {
  if (isPlaying.value) {
    stopTimeline()
  } else {
    playTimeline()
  }
}

// Keyboard shortcuts
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isVisible) return
  
  if (e.code === 'Space') {
    e.preventDefault()
    previewAllAnimations()
  }
  if (e.code === 'Escape') {
    clearSelection()
  }
}

// Watch for object changes
watch(() => props.selectedObject, (newObj) => {
  if (!newObj) {
    objectAnimations.value = []
    selectedAnimation.value = null
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<style scoped>
.animation-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 360px;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: -4px 0 30px rgba(0, 0, 0, 0.3);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 16px;
}

.title-icon {
  color: #a78bfa;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-all-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-all-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
}

.preview-all-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Preview Window */
.preview-window {
  margin: 16px;
  background: linear-gradient(145deg, #0f0f23 0%, #1a1a3e 100%);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-window.playing {
  border-color: #6366f1;
  box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
}

.preview-stage {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: 
    radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 20px,
      rgba(255, 255, 255, 0.02) 20px,
      rgba(255, 255, 255, 0.02) 21px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 20px,
      rgba(255, 255, 255, 0.02) 20px,
      rgba(255, 255, 255, 0.02) 21px
    );
}

.preview-object {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
}

.preview-text {
  font-size: 24px;
  font-weight: 700;
}

.preview-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(0, 0, 0, 0.3);
}

.control-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.preview-info {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
}

.no-animation {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.speed-btn {
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 4px;
  color: #a78bfa;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.speed-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Timeline */
.timeline-section {
  margin: 0 16px 16px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 12px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 10px;
}

.timeline-duration {
  margin-left: auto;
  color: #a78bfa;
  font-weight: 600;
}

.timeline-track {
  position: relative;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  cursor: pointer;
  overflow: hidden;
}

.timeline-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  transition: width 0.1s linear;
}

.timeline-playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #6366f1;
  box-shadow: 0 0 8px rgba(99, 102, 241, 0.8);
  transition: left 0.1s linear;
}

.animation-marker {
  position: absolute;
  top: 4px;
  height: calc(100% - 8px);
  background: rgba(99, 102, 241, 0.6);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
}

.animation-marker.entrance {
  background: rgba(34, 197, 94, 0.6);
}

.animation-marker.emphasis {
  background: rgba(234, 179, 8, 0.6);
}

.animation-marker.exit {
  background: rgba(239, 68, 68, 0.6);
}

.marker-label {
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}

.play-btn, .stop-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.play-btn:hover, .stop-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.play-btn.playing {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
}

.time-display {
  margin-left: auto;
  font-size: 12px;
  font-family: 'SF Mono', Monaco, monospace;
  color: rgba(255, 255, 255, 0.6);
}

/* Tabs */
.panel-tabs {
  display: flex;
  padding: 0 16px;
  gap: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}

.tab-btn:hover {
  color: rgba(255, 255, 255, 0.8);
}

.tab-btn.active {
  color: white;
  border-bottom-color: #6366f1;
}

.tab-count {
  padding: 2px 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  font-size: 10px;
}

/* Animation Grid */
.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.animations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.animation-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.animation-card:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.animation-card.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  border-color: #6366f1;
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.animation-card.applied::after {
  content: '';
  position: absolute;
  top: 6px;
  right: 6px;
  width: 8px;
  height: 8px;
  background: #22c55e;
  border-radius: 50%;
}

.card-preview {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.preview-shape {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #6366f1 0%, #a78bfa 100%);
  border-radius: 6px;
}

.card-preview.animating .preview-shape {
  animation-duration: 0.6s;
  animation-fill-mode: both;
}

.card-info {
  text-align: center;
}

.card-name {
  display: block;
  font-size: 11px;
  font-weight: 500;
  color: white;
  margin-bottom: 2px;
}

.card-duration {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
}

.applied-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background: #22c55e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Settings Panel */
.settings-panel {
  background: rgba(0, 0, 0, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.selected-animation {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #a78bfa;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.setting-row {
  margin-bottom: 14px;
}

.setting-row label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.slider-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-control input[type="range"] {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
}

.slider-control input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px;
  height: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
}

.slider-control .value {
  min-width: 40px;
  font-size: 12px;
  font-weight: 600;
  color: #a78bfa;
  text-align: right;
}

.easing-options {
  display: flex;
  gap: 6px;
}

.easing-btn {
  flex: 1;
  height: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.easing-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.easing-btn.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  border-color: #6366f1;
}

.easing-curve {
  width: 20px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.5);
  border-radius: 2px;
}

.loop-options {
  display: flex;
  gap: 6px;
}

.loop-btn {
  flex: 1;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.loop-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.loop-btn.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%);
  border-color: #6366f1;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 16px;
}

.btn-secondary, .btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
}

/* No Selection */
.no-selection {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
}

.no-selection .icon {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
}

.no-selection h3 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: white;
}

.no-selection p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

/* Applied List */
.applied-list {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.list-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 12px;
}

.clear-all-btn {
  margin-left: auto;
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.2);
  border: none;
  border-radius: 4px;
  color: #ef4444;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-all-btn:hover {
  background: rgba(239, 68, 68, 0.3);
}

.animation-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.animation-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 3px solid #6366f1;
}

.animation-item.entrance {
  border-left-color: #22c55e;
}

.animation-item.emphasis {
  border-left-color: #eab308;
}

.animation-item.exit {
  border-left-color: #ef4444;
}

.item-info {
  flex: 1;
}

.item-name {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.item-timing {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 4px;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Transitions */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

/* Animation Keyframes for Preview */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-down {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slide-left {
  from { opacity: 0; transform: translateX(30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes slide-right {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.5); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pop {
  0% { opacity: 0; transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.3); }
  50% { transform: scale(1.05); }
  70% { transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes rotate-in {
  from { opacity: 0; transform: rotate(-180deg); }
  to { opacity: 1; transform: rotate(0deg); }
}

@keyframes flip-in {
  from { opacity: 0; transform: perspective(400px) rotateY(-90deg); }
  to { opacity: 1; transform: perspective(400px) rotateY(0); }
}

@keyframes drop-in {
  0% { opacity: 0; transform: translateY(-100px); }
  60% { opacity: 1; transform: translateY(10px); }
  100% { transform: translateY(0); }
}

@keyframes swing-in {
  0% { opacity: 0; transform: rotate(-30deg); }
  50% { transform: rotate(10deg); }
  70% { transform: rotate(-5deg); }
  100% { opacity: 1; transform: rotate(0); }
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

@keyframes wiggle {
  0%, 100% { transform: rotate(0); }
  25% { transform: rotate(-5deg); }
  75% { transform: rotate(5deg); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

@keyframes flash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

@keyframes rubber-band {
  0%, 100% { transform: scale(1); }
  30% { transform: scaleX(1.25) scaleY(0.75); }
  40% { transform: scaleX(0.75) scaleY(1.25); }
  50% { transform: scaleX(1.15) scaleY(0.85); }
  65% { transform: scaleX(0.95) scaleY(1.05); }
  75% { transform: scaleX(1.05) scaleY(0.95); }
}

@keyframes tada {
  0%, 100% { transform: scale(1) rotate(0); }
  10%, 20% { transform: scale(0.9) rotate(-3deg); }
  30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
  40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.3); }
  28% { transform: scale(1); }
  42% { transform: scale(1.3); }
  70% { transform: scale(1); }
}

@keyframes jello {
  0%, 100% { transform: skewX(0) skewY(0); }
  22% { transform: skewX(-12.5deg) skewY(-12.5deg); }
  33% { transform: skewX(6.25deg) skewY(6.25deg); }
  44% { transform: skewX(-3.125deg) skewY(-3.125deg); }
  55% { transform: skewX(1.5625deg) skewY(1.5625deg); }
  66% { transform: skewX(-0.78125deg) skewY(-0.78125deg); }
  77% { transform: skewX(0.390625deg) skewY(0.390625deg); }
}

@keyframes swing {
  20% { transform: rotate(15deg); }
  40% { transform: rotate(-10deg); }
  60% { transform: rotate(5deg); }
  80% { transform: rotate(-5deg); }
  100% { transform: rotate(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes slide-out-up {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-30px); }
}

@keyframes slide-out-down {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(30px); }
}

@keyframes zoom-out {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0.5); }
}

@keyframes shrink {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(0); }
}

@keyframes rotate-out {
  from { opacity: 1; transform: rotate(0); }
  to { opacity: 0; transform: rotate(180deg); }
}

@keyframes flip-out {
  from { opacity: 1; transform: perspective(400px) rotateY(0); }
  to { opacity: 0; transform: perspective(400px) rotateY(90deg); }
}

@keyframes roll-out {
  from { opacity: 1; transform: translateX(0) rotate(0); }
  to { opacity: 0; transform: translateX(100%) rotate(120deg); }
}

@keyframes bounce-out {
  20% { transform: scale(0.9); }
  50%, 55% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 0; transform: scale(0.3); }
}

@keyframes hinge {
  0% { transform-origin: top left; animation-timing-function: ease-in-out; }
  20%, 60% { transform: rotate(80deg); transform-origin: top left; animation-timing-function: ease-in-out; }
  40%, 80% { transform: rotate(60deg); transform-origin: top left; animation-timing-function: ease-in-out; opacity: 1; }
  100% { transform: translateY(700px); opacity: 0; }
}

/* Preview Animation Classes */
.card-preview.animating.preview-fade-in .preview-shape { animation-name: fade-in; }
.card-preview.animating.preview-slide-up .preview-shape { animation-name: slide-up; }
.card-preview.animating.preview-slide-down .preview-shape { animation-name: slide-down; }
.card-preview.animating.preview-slide-left .preview-shape { animation-name: slide-left; }
.card-preview.animating.preview-slide-right .preview-shape { animation-name: slide-right; }
.card-preview.animating.preview-zoom-in .preview-shape { animation-name: zoom-in; }
.card-preview.animating.preview-pop .preview-shape { animation-name: pop; }
.card-preview.animating.preview-bounce-in .preview-shape { animation-name: bounce-in; }
.card-preview.animating.preview-rotate-in .preview-shape { animation-name: rotate-in; }
.card-preview.animating.preview-flip-in .preview-shape { animation-name: flip-in; }
.card-preview.animating.preview-drop-in .preview-shape { animation-name: drop-in; }
.card-preview.animating.preview-swing-in .preview-shape { animation-name: swing-in; }
.card-preview.animating.preview-pulse .preview-shape { animation-name: pulse; }
.card-preview.animating.preview-shake .preview-shape { animation-name: shake; }
.card-preview.animating.preview-wiggle .preview-shape { animation-name: wiggle; }
.card-preview.animating.preview-bounce .preview-shape { animation-name: bounce; }
.card-preview.animating.preview-flash .preview-shape { animation-name: flash; }
.card-preview.animating.preview-rubber-band .preview-shape { animation-name: rubber-band; }
.card-preview.animating.preview-tada .preview-shape { animation-name: tada; }
.card-preview.animating.preview-heartbeat .preview-shape { animation-name: heartbeat; }
.card-preview.animating.preview-jello .preview-shape { animation-name: jello; }
.card-preview.animating.preview-swing .preview-shape { animation-name: swing; }
.card-preview.animating.preview-float .preview-shape { animation-name: float; }
.card-preview.animating.preview-spin .preview-shape { animation-name: spin; }
.card-preview.animating.preview-fade-out .preview-shape { animation-name: fade-out; }
.card-preview.animating.preview-slide-out-up .preview-shape { animation-name: slide-out-up; }
.card-preview.animating.preview-slide-out-down .preview-shape { animation-name: slide-out-down; }
.card-preview.animating.preview-zoom-out .preview-shape { animation-name: zoom-out; }
.card-preview.animating.preview-shrink .preview-shape { animation-name: shrink; }
.card-preview.animating.preview-rotate-out .preview-shape { animation-name: rotate-out; }
.card-preview.animating.preview-flip-out .preview-shape { animation-name: flip-out; }
.card-preview.animating.preview-roll-out .preview-shape { animation-name: roll-out; }
.card-preview.animating.preview-bounce-out .preview-shape { animation-name: bounce-out; }
.card-preview.animating.preview-hinge .preview-shape { animation-name: hinge; }

/* Scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.panel-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Mobile Bottom Sheet Styles */
@media (max-width: 768px) {
  .animation-panel {
    width: 100%;
  }
}

.animation-panel.mobile {
  position: fixed;
  right: 0;
  left: 0;
  top: auto;
  bottom: 0;
  width: 100%;
  height: auto;
  max-height: 380px;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.4);
}

.animation-panel.mobile .panel-header {
  position: relative;
  padding: 12px 16px;
}

.animation-panel.mobile .panel-header::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}

.animation-panel.mobile .preview-window {
  display: none;
}

.animation-panel.mobile .timeline-section {
  display: none;
}

.animation-panel.mobile .panel-content {
  max-height: 280px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
}

.animation-panel.mobile .animations-grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.animation-panel.mobile .animation-card {
  padding: 8px 6px;
}

.animation-panel.mobile .card-preview {
  height: 36px;
  margin-bottom: 4px;
}

.animation-panel.mobile .preview-shape {
  width: 20px;
  height: 20px;
}

.animation-panel.mobile .card-name {
  font-size: 9px;
}

.animation-panel.mobile .card-duration {
  display: none;
}

/* Panel slide up animation for mobile */
.panel-slide-up-enter-active,
.panel-slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-up-enter-from,
.panel-slide-up-leave-to {
  transform: translateY(100%);
}

/* Panel slide animation for desktop */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

@media (max-width: 480px) {
  .animation-panel.mobile {
    max-height: 340px;
  }

  .animation-panel.mobile .panel-content {
    max-height: 260px;
  }

  .animation-panel.mobile .animations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
