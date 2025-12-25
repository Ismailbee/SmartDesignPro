<template>
  <Transition name="panel-slide">
    <aside v-if="isVisible" class="animation-panel">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-title">
          <Sparkles :size="18" class="title-icon" />
          <span>Animations</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <!-- Panel Tabs -->
      <div class="panel-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'entrance' }]"
          @click="activeTab = 'entrance'"
        >
          <ArrowDownToLine :size="14" />
          <span>Entrance</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'emphasis' }]"
          @click="activeTab = 'emphasis'"
        >
          <Zap :size="14" />
          <span>Emphasis</span>
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'exit' }]"
          @click="activeTab = 'exit'"
        >
          <ArrowUpFromLine :size="14" />
          <span>Exit</span>
        </button>
      </div>

      <!-- Panel Content -->
      <div class="panel-content">
        <!-- Entrance Animations -->
        <div v-if="activeTab === 'entrance'" class="animations-grid">
          <TransitionGroup name="stagger">
            <button 
              v-for="(anim, index) in entranceAnimations" 
              :key="anim.id"
              :class="['animation-card', { active: selectedAnimation === anim.id }]"
              :style="{ '--delay': `${index * 50}ms` }"
              @click="selectAnimation(anim)"
              @mouseenter="previewAnimation(anim)"
            >
              <div class="animation-preview" :class="anim.previewClass">
                <div class="preview-shape"></div>
              </div>
              <span class="animation-name">{{ anim.name }}</span>
            </button>
          </TransitionGroup>
        </div>

        <!-- Emphasis Animations -->
        <div v-if="activeTab === 'emphasis'" class="animations-grid">
          <TransitionGroup name="stagger">
            <button 
              v-for="(anim, index) in emphasisAnimations" 
              :key="anim.id"
              :class="['animation-card', { active: selectedAnimation === anim.id }]"
              :style="{ '--delay': `${index * 50}ms` }"
              @click="selectAnimation(anim)"
              @mouseenter="previewAnimation(anim)"
            >
              <div class="animation-preview" :class="anim.previewClass">
                <div class="preview-shape"></div>
              </div>
              <span class="animation-name">{{ anim.name }}</span>
            </button>
          </TransitionGroup>
        </div>

        <!-- Exit Animations -->
        <div v-if="activeTab === 'exit'" class="animations-grid">
          <TransitionGroup name="stagger">
            <button 
              v-for="(anim, index) in exitAnimations" 
              :key="anim.id"
              :class="['animation-card', { active: selectedAnimation === anim.id }]"
              :style="{ '--delay': `${index * 50}ms` }"
              @click="selectAnimation(anim)"
              @mouseenter="previewAnimation(anim)"
            >
              <div class="animation-preview" :class="anim.previewClass">
                <div class="preview-shape"></div>
              </div>
              <span class="animation-name">{{ anim.name }}</span>
            </button>
          </TransitionGroup>
        </div>

        <!-- Animation Settings -->
        <Transition name="fade">
          <div v-if="selectedAnimation" class="animation-settings">
            <div class="settings-header">
              <Settings :size="14" />
              <span>Animation Settings</span>
            </div>

            <!-- Duration -->
            <div class="setting-group">
              <label class="setting-label">Duration</label>
              <div class="duration-control">
                <input 
                  type="range" 
                  v-model.number="animationSettings.duration" 
                  min="0.1" 
                  max="3" 
                  step="0.1"
                  class="setting-slider"
                />
                <span class="setting-value">{{ animationSettings.duration }}s</span>
              </div>
            </div>

            <!-- Delay -->
            <div class="setting-group">
              <label class="setting-label">Delay</label>
              <div class="delay-control">
                <input 
                  type="range" 
                  v-model.number="animationSettings.delay" 
                  min="0" 
                  max="5" 
                  step="0.1"
                  class="setting-slider"
                />
                <span class="setting-value">{{ animationSettings.delay }}s</span>
              </div>
            </div>

            <!-- Easing -->
            <div class="setting-group">
              <label class="setting-label">Easing</label>
              <select v-model="animationSettings.easing" class="setting-select">
                <option value="ease">Ease</option>
                <option value="ease-in">Ease In</option>
                <option value="ease-out">Ease Out</option>
                <option value="ease-in-out">Ease In Out</option>
                <option value="linear">Linear</option>
                <option value="cubic-bezier(0.34, 1.56, 0.64, 1)">Bounce</option>
                <option value="cubic-bezier(0.68, -0.55, 0.265, 1.55)">Elastic</option>
              </select>
            </div>

            <!-- Repeat -->
            <div class="setting-group">
              <label class="setting-label">Repeat</label>
              <div class="repeat-control">
                <button 
                  :class="['repeat-btn', { active: animationSettings.repeat === 1 }]"
                  @click="animationSettings.repeat = 1"
                >
                  Once
                </button>
                <button 
                  :class="['repeat-btn', { active: animationSettings.repeat === 2 }]"
                  @click="animationSettings.repeat = 2"
                >
                  2x
                </button>
                <button 
                  :class="['repeat-btn', { active: animationSettings.repeat === -1 }]"
                  @click="animationSettings.repeat = -1"
                >
                  Loop
                </button>
              </div>
            </div>

            <!-- Apply Button -->
            <button class="apply-btn" @click="applyAnimation">
              <Play :size="16" />
              <span>Apply Animation</span>
            </button>

            <!-- Remove Button -->
            <button class="remove-btn" @click="removeAnimation">
              <Trash2 :size="14" />
              <span>Remove Animation</span>
            </button>
          </div>
        </Transition>

        <!-- No Selection Message -->
        <div v-if="!selectedObject" class="no-selection">
          <MousePointer2 :size="40" class="no-selection-icon" />
          <p>Select an object to add animations</p>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  X, Sparkles, ArrowDownToLine, ArrowUpFromLine, Zap,
  Settings, Play, Trash2, MousePointer2
} from 'lucide-vue-next'

interface Animation {
  id: string
  name: string
  type: 'entrance' | 'emphasis' | 'exit'
  previewClass: string
  keyframes: Record<string, any>[]
}

defineProps<{
  isVisible: boolean
  selectedObject: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'apply', animation: any): void
  (e: 'remove'): void
}>()

const activeTab = ref<'entrance' | 'emphasis' | 'exit'>('entrance')
const selectedAnimation = ref<string | null>(null)

const animationSettings = reactive({
  duration: 0.5,
  delay: 0,
  easing: 'ease-out',
  repeat: 1
})

// Entrance Animations
const entranceAnimations: Animation[] = [
  { id: 'fadeIn', name: 'Fade In', type: 'entrance', previewClass: 'preview-fade-in', keyframes: [] },
  { id: 'slideUp', name: 'Slide Up', type: 'entrance', previewClass: 'preview-slide-up', keyframes: [] },
  { id: 'slideDown', name: 'Slide Down', type: 'entrance', previewClass: 'preview-slide-down', keyframes: [] },
  { id: 'slideLeft', name: 'Slide Left', type: 'entrance', previewClass: 'preview-slide-left', keyframes: [] },
  { id: 'slideRight', name: 'Slide Right', type: 'entrance', previewClass: 'preview-slide-right', keyframes: [] },
  { id: 'zoomIn', name: 'Zoom In', type: 'entrance', previewClass: 'preview-zoom-in', keyframes: [] },
  { id: 'bounceIn', name: 'Bounce In', type: 'entrance', previewClass: 'preview-bounce-in', keyframes: [] },
  { id: 'flipIn', name: 'Flip In', type: 'entrance', previewClass: 'preview-flip-in', keyframes: [] },
  { id: 'rotateIn', name: 'Rotate In', type: 'entrance', previewClass: 'preview-rotate-in', keyframes: [] },
  { id: 'expandIn', name: 'Expand', type: 'entrance', previewClass: 'preview-expand-in', keyframes: [] },
  { id: 'dropIn', name: 'Drop In', type: 'entrance', previewClass: 'preview-drop-in', keyframes: [] },
  { id: 'wipeIn', name: 'Wipe In', type: 'entrance', previewClass: 'preview-wipe-in', keyframes: [] },
]

// Emphasis Animations
const emphasisAnimations: Animation[] = [
  { id: 'pulse', name: 'Pulse', type: 'emphasis', previewClass: 'preview-pulse', keyframes: [] },
  { id: 'bounce', name: 'Bounce', type: 'emphasis', previewClass: 'preview-bounce', keyframes: [] },
  { id: 'shake', name: 'Shake', type: 'emphasis', previewClass: 'preview-shake', keyframes: [] },
  { id: 'swing', name: 'Swing', type: 'emphasis', previewClass: 'preview-swing', keyframes: [] },
  { id: 'tada', name: 'Tada', type: 'emphasis', previewClass: 'preview-tada', keyframes: [] },
  { id: 'wobble', name: 'Wobble', type: 'emphasis', previewClass: 'preview-wobble', keyframes: [] },
  { id: 'jello', name: 'Jello', type: 'emphasis', previewClass: 'preview-jello', keyframes: [] },
  { id: 'heartbeat', name: 'Heartbeat', type: 'emphasis', previewClass: 'preview-heartbeat', keyframes: [] },
  { id: 'flash', name: 'Flash', type: 'emphasis', previewClass: 'preview-flash', keyframes: [] },
  { id: 'rubberBand', name: 'Rubber Band', type: 'emphasis', previewClass: 'preview-rubber-band', keyframes: [] },
  { id: 'spin', name: 'Spin', type: 'emphasis', previewClass: 'preview-spin', keyframes: [] },
  { id: 'float', name: 'Float', type: 'emphasis', previewClass: 'preview-float', keyframes: [] },
]

// Exit Animations
const exitAnimations: Animation[] = [
  { id: 'fadeOut', name: 'Fade Out', type: 'exit', previewClass: 'preview-fade-out', keyframes: [] },
  { id: 'slideOutUp', name: 'Slide Out Up', type: 'exit', previewClass: 'preview-slide-out-up', keyframes: [] },
  { id: 'slideOutDown', name: 'Slide Out Down', type: 'exit', previewClass: 'preview-slide-out-down', keyframes: [] },
  { id: 'slideOutLeft', name: 'Slide Out Left', type: 'exit', previewClass: 'preview-slide-out-left', keyframes: [] },
  { id: 'slideOutRight', name: 'Slide Out Right', type: 'exit', previewClass: 'preview-slide-out-right', keyframes: [] },
  { id: 'zoomOut', name: 'Zoom Out', type: 'exit', previewClass: 'preview-zoom-out', keyframes: [] },
  { id: 'bounceOut', name: 'Bounce Out', type: 'exit', previewClass: 'preview-bounce-out', keyframes: [] },
  { id: 'flipOut', name: 'Flip Out', type: 'exit', previewClass: 'preview-flip-out', keyframes: [] },
  { id: 'rotateOut', name: 'Rotate Out', type: 'exit', previewClass: 'preview-rotate-out', keyframes: [] },
  { id: 'shrinkOut', name: 'Shrink', type: 'exit', previewClass: 'preview-shrink-out', keyframes: [] },
  { id: 'rollOut', name: 'Roll Out', type: 'exit', previewClass: 'preview-roll-out', keyframes: [] },
  { id: 'hinge', name: 'Hinge', type: 'exit', previewClass: 'preview-hinge', keyframes: [] },
]

const selectAnimation = (animation: Animation) => {
  selectedAnimation.value = animation.id
}

const previewAnimation = (animation: Animation) => {
  // Preview will be shown through CSS classes
}

const applyAnimation = () => {
  if (!selectedAnimation.value) return
  
  // Map animation IDs to types that the animation function understands
  const animationTypeMap: Record<string, string> = {
    'fadeIn': 'fadeIn',
    'fadeOut': 'fadeOut',
    'slideUp': 'slideInUp',
    'slideDown': 'slideInDown',
    'slideLeft': 'slideInLeft',
    'slideRight': 'slideInRight',
    'slideOutUp': 'slideOutUp',
    'slideOutDown': 'slideOutDown',
    'slideOutLeft': 'slideOutLeft',
    'slideOutRight': 'slideOutRight',
    'zoomIn': 'zoomIn',
    'zoomOut': 'zoomOut',
    'bounceIn': 'bounce',
    'bounce': 'bounce',
    'pulse': 'pulse',
    'shake': 'shake',
    'rotateIn': 'rotate',
    'rotateOut': 'rotate',
    'flipIn': 'flip',
    'flipOut': 'flip',
    'swing': 'shake',
    'wobble': 'shake',
    'tada': 'pulse',
    'jello': 'shake',
    'heartbeat': 'pulse',
    'flash': 'pulse',
    'rubberBand': 'pulse',
    'spin': 'rotate',
    'float': 'bounce'
  }
  
  emit('apply', {
    id: selectedAnimation.value,
    type: animationTypeMap[selectedAnimation.value] || selectedAnimation.value,
    settings: { ...animationSettings }
  })
}

const removeAnimation = () => {
  selectedAnimation.value = null
  emit('remove')
}
</script>

<style scoped>
.animation-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 320px;
  background: #ffffff;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.08);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.title-icon {
  color: #f59e0b;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.1) rotate(10deg); }
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.panel-tabs {
  display: flex;
  gap: 4px;
  padding: 12px;
  background: #fafafa;
  border-bottom: 1px solid #e5e7eb;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #ffffff;
  color: #1f2937;
}

.tab-btn.active {
  background: #ffffff;
  border-color: #e5e7eb;
  color: #6366f1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.animations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.animation-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  animation: fadeInUp 0.3s ease forwards;
  animation-delay: var(--delay);
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animation-card:hover {
  background: #ffffff;
  border-color: #c7d2fe;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.animation-card.active {
  background: #eef2ff;
  border-color: #6366f1;
}

.animation-preview {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-shape {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 4px;
}

.animation-card:hover .preview-shape {
  animation-play-state: running;
}

.animation-name {
  font-size: 11px;
  font-weight: 500;
  color: #4b5563;
  text-align: center;
}

/* Animation Previews */
.preview-fade-in .preview-shape { animation: previewFadeIn 1.5s ease infinite; }
.preview-slide-up .preview-shape { animation: previewSlideUp 1.5s ease infinite; }
.preview-slide-down .preview-shape { animation: previewSlideDown 1.5s ease infinite; }
.preview-slide-left .preview-shape { animation: previewSlideLeft 1.5s ease infinite; }
.preview-slide-right .preview-shape { animation: previewSlideRight 1.5s ease infinite; }
.preview-zoom-in .preview-shape { animation: previewZoomIn 1.5s ease infinite; }
.preview-bounce-in .preview-shape { animation: previewBounceIn 1.5s ease infinite; }
.preview-flip-in .preview-shape { animation: previewFlipIn 1.5s ease infinite; }
.preview-rotate-in .preview-shape { animation: previewRotateIn 1.5s ease infinite; }
.preview-expand-in .preview-shape { animation: previewExpandIn 1.5s ease infinite; }
.preview-drop-in .preview-shape { animation: previewDropIn 1.5s ease infinite; }
.preview-wipe-in .preview-shape { animation: previewWipeIn 1.5s ease infinite; }

.preview-pulse .preview-shape { animation: previewPulse 1s ease infinite; }
.preview-bounce .preview-shape { animation: previewBounce 1s ease infinite; }
.preview-shake .preview-shape { animation: previewShake 0.8s ease infinite; }
.preview-swing .preview-shape { animation: previewSwing 1s ease infinite; }
.preview-tada .preview-shape { animation: previewTada 1s ease infinite; }
.preview-wobble .preview-shape { animation: previewWobble 1s ease infinite; }
.preview-jello .preview-shape { animation: previewJello 1s ease infinite; }
.preview-heartbeat .preview-shape { animation: previewHeartbeat 1.3s ease infinite; }
.preview-flash .preview-shape { animation: previewFlash 1s ease infinite; }
.preview-rubber-band .preview-shape { animation: previewRubberBand 1s ease infinite; }
.preview-spin .preview-shape { animation: previewSpin 1.5s linear infinite; }
.preview-float .preview-shape { animation: previewFloat 2s ease-in-out infinite; }

.preview-fade-out .preview-shape { animation: previewFadeOut 1.5s ease infinite; }
.preview-slide-out-up .preview-shape { animation: previewSlideOutUp 1.5s ease infinite; }
.preview-slide-out-down .preview-shape { animation: previewSlideOutDown 1.5s ease infinite; }
.preview-slide-out-left .preview-shape { animation: previewSlideOutLeft 1.5s ease infinite; }
.preview-slide-out-right .preview-shape { animation: previewSlideOutRight 1.5s ease infinite; }
.preview-zoom-out .preview-shape { animation: previewZoomOut 1.5s ease infinite; }
.preview-bounce-out .preview-shape { animation: previewBounceOut 1.5s ease infinite; }
.preview-flip-out .preview-shape { animation: previewFlipOut 1.5s ease infinite; }
.preview-rotate-out .preview-shape { animation: previewRotateOut 1.5s ease infinite; }
.preview-shrink-out .preview-shape { animation: previewShrinkOut 1.5s ease infinite; }
.preview-roll-out .preview-shape { animation: previewRollOut 1.5s ease infinite; }
.preview-hinge .preview-shape { animation: previewHinge 1.5s ease infinite; }

/* Keyframes for previews */
@keyframes previewFadeIn {
  0%, 50% { opacity: 0; }
  100% { opacity: 1; }
}

@keyframes previewSlideUp {
  0%, 50% { opacity: 0; transform: translateY(10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes previewSlideDown {
  0%, 50% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes previewSlideLeft {
  0%, 50% { opacity: 0; transform: translateX(10px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes previewSlideRight {
  0%, 50% { opacity: 0; transform: translateX(-10px); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes previewZoomIn {
  0%, 50% { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes previewBounceIn {
  0%, 50% { opacity: 0; transform: scale(0.3); }
  70% { transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes previewFlipIn {
  0%, 50% { opacity: 0; transform: rotateY(90deg); }
  100% { opacity: 1; transform: rotateY(0); }
}

@keyframes previewRotateIn {
  0%, 50% { opacity: 0; transform: rotate(-180deg); }
  100% { opacity: 1; transform: rotate(0); }
}

@keyframes previewExpandIn {
  0%, 50% { opacity: 0; transform: scaleX(0); }
  100% { opacity: 1; transform: scaleX(1); }
}

@keyframes previewDropIn {
  0%, 50% { opacity: 0; transform: translateY(-20px); }
  70% { transform: translateY(3px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes previewWipeIn {
  0%, 50% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}

@keyframes previewPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

@keyframes previewBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes previewShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

@keyframes previewSwing {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(10deg); }
  75% { transform: rotate(-10deg); }
}

@keyframes previewTada {
  0%, 100% { transform: scale(1) rotate(0); }
  10%, 20% { transform: scale(0.9) rotate(-3deg); }
  30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
  40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
}

@keyframes previewWobble {
  0%, 100% { transform: translateX(0) rotate(0); }
  15% { transform: translateX(-5px) rotate(-3deg); }
  30% { transform: translateX(4px) rotate(2deg); }
  45% { transform: translateX(-3px) rotate(-2deg); }
  60% { transform: translateX(2px) rotate(1deg); }
  75% { transform: translateX(-1px) rotate(-1deg); }
}

@keyframes previewJello {
  0%, 100% { transform: skewX(0) skewY(0); }
  30% { transform: skewX(-5deg) skewY(-5deg); }
  40% { transform: skewX(4deg) skewY(4deg); }
  50% { transform: skewX(-3deg) skewY(-3deg); }
  65% { transform: skewX(2deg) skewY(2deg); }
  75% { transform: skewX(-1deg) skewY(-1deg); }
}

@keyframes previewHeartbeat {
  0%, 100% { transform: scale(1); }
  14% { transform: scale(1.15); }
  28% { transform: scale(1); }
  42% { transform: scale(1.15); }
  70% { transform: scale(1); }
}

@keyframes previewFlash {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.3; }
}

@keyframes previewRubberBand {
  0%, 100% { transform: scale(1); }
  30% { transform: scaleX(1.25) scaleY(0.75); }
  40% { transform: scaleX(0.75) scaleY(1.25); }
  50% { transform: scaleX(1.15) scaleY(0.85); }
  65% { transform: scaleX(0.95) scaleY(1.05); }
  75% { transform: scaleX(1.05) scaleY(0.95); }
}

@keyframes previewSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes previewFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@keyframes previewFadeOut {
  0%, 50% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes previewSlideOutUp {
  0%, 50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(-10px); }
}

@keyframes previewSlideOutDown {
  0%, 50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(10px); }
}

@keyframes previewSlideOutLeft {
  0%, 50% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(-10px); }
}

@keyframes previewSlideOutRight {
  0%, 50% { opacity: 1; transform: translateX(0); }
  100% { opacity: 0; transform: translateX(10px); }
}

@keyframes previewZoomOut {
  0%, 50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.5); }
}

@keyframes previewBounceOut {
  0% { transform: scale(1); }
  25% { transform: scale(1.1); }
  100% { opacity: 0; transform: scale(0.3); }
}

@keyframes previewFlipOut {
  0%, 50% { opacity: 1; transform: rotateY(0); }
  100% { opacity: 0; transform: rotateY(90deg); }
}

@keyframes previewRotateOut {
  0%, 50% { opacity: 1; transform: rotate(0); }
  100% { opacity: 0; transform: rotate(180deg); }
}

@keyframes previewShrinkOut {
  0%, 50% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0); }
}

@keyframes previewRollOut {
  0%, 50% { opacity: 1; transform: translateX(0) rotate(0); }
  100% { opacity: 0; transform: translateX(10px) rotate(45deg); }
}

@keyframes previewHinge {
  0%, 50% { transform-origin: top left; transform: rotate(0); opacity: 1; }
  80% { transform: rotate(20deg); }
  100% { transform: rotate(45deg) translateY(10px); opacity: 0; }
}

/* Animation Settings */
.animation-settings {
  padding: 16px;
  background: #fafafa;
  border-radius: 12px;
  margin-top: 16px;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.setting-group {
  margin-bottom: 16px;
}

.setting-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 8px;
}

.duration-control,
.delay-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.setting-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  appearance: none;
  cursor: pointer;
}

.setting-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
}

.setting-value {
  min-width: 40px;
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  text-align: right;
}

.setting-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #1f2937;
  background: #ffffff;
  cursor: pointer;
}

.repeat-control {
  display: flex;
  gap: 6px;
}

.repeat-btn {
  flex: 1;
  padding: 8px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.repeat-btn:hover {
  border-color: #c7d2fe;
}

.repeat-btn.active {
  background: #eef2ff;
  border-color: #6366f1;
  color: #6366f1;
}

.apply-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.remove-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.remove-btn:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

/* No Selection */
.no-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #9ca3af;
  text-align: center;
}

.no-selection-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-selection p {
  font-size: 13px;
}

/* Panel slide animation */
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}

/* Fade animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Stagger animation */
.stagger-enter-active {
  transition: all 0.3s ease;
}

.stagger-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

/* Scrollbar */
.panel-content::-webkit-scrollbar {
  width: 6px;
}

.panel-content::-webkit-scrollbar-track {
  background: transparent;
}

.panel-content::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .animation-panel {
    width: 100%;
    max-width: 360px;
  }
  
  .animations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
