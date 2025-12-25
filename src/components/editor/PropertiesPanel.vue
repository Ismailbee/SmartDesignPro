<template>
  <Transition :name="isMobile ? 'panel-slide-up' : 'panel-slide'">
    <aside v-if="isVisible && selectedObject" class="properties-panel" :class="{ 'mobile': isMobile }">
      <!-- Panel Header -->
      <div class="panel-header">
        <div class="header-title">
          <component :is="getObjectIcon" class="title-icon" />
          <span>{{ panelTitle }}</span>
        </div>
        <button class="close-btn" @click="$emit('close')">
          <X :size="18" />
        </button>
      </div>

      <!-- Panel Content -->
      <div class="panel-content">
        <!-- Text Properties -->
        <div v-if="objectType === 'textbox'" class="properties-section">
          <!-- Font Family -->
          <div class="property-group">
            <label class="property-label">Font</label>
            <select 
              v-model="localProps.fontFamily" 
              @change="updateProperty('fontFamily', localProps.fontFamily)"
              class="property-select"
            >
              <option v-for="font in fonts" :key="font" :value="font">{{ font }}</option>
            </select>
          </div>

          <!-- Font Size -->
          <div class="property-group">
            <label class="property-label">Size</label>
            <div class="input-with-unit">
              <input 
                type="number" 
                v-model.number="localProps.fontSize" 
                @change="updateProperty('fontSize', localProps.fontSize)"
                class="property-input"
                min="8"
                max="200"
              />
              <span class="unit">px</span>
            </div>
          </div>

          <!-- Text Style Buttons -->
          <div class="property-group">
            <label class="property-label">Style</label>
            <div class="style-buttons">
              <button 
                :class="['style-btn', { active: localProps.fontWeight === 'bold' }]"
                @click="toggleStyle('fontWeight', 'bold', 'normal')"
                title="Bold (Ctrl+B)"
              >
                <Bold :size="16" />
              </button>
              <button 
                :class="['style-btn', { active: localProps.fontStyle === 'italic' }]"
                @click="toggleStyle('fontStyle', 'italic', 'normal')"
                title="Italic (Ctrl+I)"
              >
                <Italic :size="16" />
              </button>
              <button 
                :class="['style-btn', { active: localProps.underline }]"
                @click="toggleStyle('underline', true, false)"
                title="Underline (Ctrl+U)"
              >
                <Underline :size="16" />
              </button>
              <button 
                :class="['style-btn', { active: localProps.linethrough }]"
                @click="toggleStyle('linethrough', true, false)"
                title="Strikethrough"
              >
                <Strikethrough :size="16" />
              </button>
            </div>
          </div>

          <!-- Text Alignment -->
          <div class="property-group">
            <label class="property-label">Align</label>
            <div class="align-buttons">
              <button 
                :class="['align-btn', { active: localProps.textAlign === 'left' }]"
                @click="updateProperty('textAlign', 'left')"
              >
                <AlignLeft :size="16" />
              </button>
              <button 
                :class="['align-btn', { active: localProps.textAlign === 'center' }]"
                @click="updateProperty('textAlign', 'center')"
              >
                <AlignCenter :size="16" />
              </button>
              <button 
                :class="['align-btn', { active: localProps.textAlign === 'right' }]"
                @click="updateProperty('textAlign', 'right')"
              >
                <AlignRight :size="16" />
              </button>
              <button 
                :class="['align-btn', { active: localProps.textAlign === 'justify' }]"
                @click="updateProperty('textAlign', 'justify')"
              >
                <AlignJustify :size="16" />
              </button>
            </div>
          </div>

          <!-- Text Color -->
          <div class="property-group">
            <label class="property-label">Color</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="localProps.fill" 
                @input="updateProperty('fill', localProps.fill)"
                class="color-input"
              />
              <input 
                type="text" 
                v-model="localProps.fill" 
                @change="updateProperty('fill', localProps.fill)"
                class="color-text"
              />
            </div>
          </div>

          <!-- Line Height -->
          <div class="property-group">
            <label class="property-label">Line Height</label>
            <input 
              type="range" 
              v-model.number="localProps.lineHeight" 
              @input="updateProperty('lineHeight', localProps.lineHeight)"
              class="property-slider"
              min="0.5"
              max="3"
              step="0.1"
            />
            <span class="slider-value">{{ localProps.lineHeight?.toFixed(1) }}</span>
          </div>

          <!-- Letter Spacing -->
          <div class="property-group">
            <label class="property-label">Letter Spacing</label>
            <input 
              type="range" 
              v-model.number="localProps.charSpacing" 
              @input="updateProperty('charSpacing', localProps.charSpacing)"
              class="property-slider"
              min="-100"
              max="500"
              step="10"
            />
            <span class="slider-value">{{ localProps.charSpacing }}</span>
          </div>
        </div>

        <!-- Shape/Image Properties -->
        <div v-if="objectType !== 'textbox'" class="properties-section">
          <!-- Fill Color (for shapes) -->
          <div v-if="objectType !== 'image'" class="property-group">
            <label class="property-label">Fill Color</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="localProps.fill" 
                @input="updateProperty('fill', localProps.fill)"
                class="color-input"
              />
              <input 
                type="text" 
                v-model="localProps.fill" 
                @change="updateProperty('fill', localProps.fill)"
                class="color-text"
              />
            </div>
          </div>

          <!-- Stroke -->
          <div class="property-group">
            <label class="property-label">Stroke</label>
            <div class="color-picker-wrapper">
              <input 
                type="color" 
                v-model="localProps.stroke" 
                @input="updateProperty('stroke', localProps.stroke)"
                class="color-input"
              />
              <input 
                type="number" 
                v-model.number="localProps.strokeWidth" 
                @change="updateProperty('strokeWidth', localProps.strokeWidth)"
                class="stroke-width-input"
                placeholder="Width"
                min="0"
                max="50"
              />
            </div>
          </div>
        </div>

        <!-- Common Transform Properties -->
        <div class="properties-section">
          <div class="section-header">
            <Move :size="14" />
            <span>Transform</span>
          </div>

          <!-- Position -->
          <div class="property-row">
            <div class="property-group half">
              <label class="property-label">X</label>
              <input 
                type="number" 
                v-model.number="localProps.left" 
                @change="updateProperty('left', localProps.left)"
                class="property-input"
              />
            </div>
            <div class="property-group half">
              <label class="property-label">Y</label>
              <input 
                type="number" 
                v-model.number="localProps.top" 
                @change="updateProperty('top', localProps.top)"
                class="property-input"
              />
            </div>
          </div>

          <!-- Size -->
          <div class="property-row">
            <div class="property-group half">
              <label class="property-label">W</label>
              <input 
                type="number" 
                :value="Math.round((localProps.width || 0) * (localProps.scaleX || 1))" 
                @change="updateSize('width', $event)"
                class="property-input"
              />
            </div>
            <div class="property-group half">
              <label class="property-label">H</label>
              <input 
                type="number" 
                :value="Math.round((localProps.height || 0) * (localProps.scaleY || 1))" 
                @change="updateSize('height', $event)"
                class="property-input"
              />
            </div>
          </div>

          <!-- Rotation -->
          <div class="property-group">
            <label class="property-label">Rotation</label>
            <div class="rotation-control">
              <input 
                type="range" 
                v-model.number="localProps.angle" 
                @input="updateProperty('angle', localProps.angle)"
                class="property-slider"
                min="0"
                max="360"
              />
              <span class="slider-value">{{ Math.round(localProps.angle || 0) }}°</span>
            </div>
          </div>

          <!-- Opacity -->
          <div class="property-group">
            <label class="property-label">Opacity</label>
            <div class="opacity-control">
              <input 
                type="range" 
                v-model.number="localProps.opacity" 
                @input="updateProperty('opacity', localProps.opacity)"
                class="property-slider"
                min="0"
                max="1"
                step="0.01"
              />
              <span class="slider-value">{{ Math.round((localProps.opacity || 1) * 100) }}%</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="properties-section actions-section">
          <button class="action-btn" @click="$emit('duplicate')">
            <Copy :size="16" />
            <span>Duplicate</span>
          </button>
          <button class="action-btn danger" @click="$emit('delete')">
            <Trash2 :size="16" />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </aside>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, markRaw } from 'vue'
import {
  X, Type, Image, Square, Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Move, Copy, Trash2
} from 'lucide-vue-next'

const props = withDefaults(defineProps<{
  isVisible: boolean
  selectedObject: any
  isMobile?: boolean
}>(), {
  isMobile: false
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', property: string, value: any): void
  (e: 'duplicate'): void
  (e: 'delete'): void
}>()

// Local state for properties
const localProps = ref<Record<string, any>>({})

// Available fonts
const fonts = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana',
  'Courier New', 'Comic Sans MS', 'Impact', 'Trebuchet MS',
  'Palatino Linotype', 'Lucida Console', 'Tahoma', 'Century Gothic'
]

// Computed
const objectType = computed(() => props.selectedObject?.type || '')

const panelTitle = computed(() => {
  const type = objectType.value
  if (type === 'textbox' || type === 'i-text') return 'Text Properties'
  if (type === 'image') return 'Image Properties'
  if (type === 'rect') return 'Rectangle Properties'
  if (type === 'circle') return 'Circle Properties'
  if (type === 'triangle') return 'Triangle Properties'
  if (type === 'polygon') return 'Shape Properties'
  return 'Properties'
})

const getObjectIcon = computed(() => {
  const type = objectType.value
  if (type === 'textbox' || type === 'i-text') return markRaw(Type)
  if (type === 'image') return markRaw(Image)
  return markRaw(Square)
})

// Watch for selected object changes
watch(() => props.selectedObject, (obj) => {
  if (obj) {
    localProps.value = {
      fontFamily: obj.fontFamily || 'Arial',
      fontSize: obj.fontSize || 24,
      fontWeight: obj.fontWeight || 'normal',
      fontStyle: obj.fontStyle || 'normal',
      underline: obj.underline || false,
      linethrough: obj.linethrough || false,
      textAlign: obj.textAlign || 'left',
      fill: obj.fill || '#333333',
      stroke: obj.stroke || '#000000',
      strokeWidth: obj.strokeWidth || 0,
      lineHeight: obj.lineHeight || 1.2,
      charSpacing: obj.charSpacing || 0,
      left: Math.round(obj.left || 0),
      top: Math.round(obj.top || 0),
      width: obj.width || 100,
      height: obj.height || 100,
      scaleX: obj.scaleX || 1,
      scaleY: obj.scaleY || 1,
      angle: obj.angle || 0,
      opacity: obj.opacity ?? 1
    }
  }
}, { immediate: true, deep: true })

// Methods
const updateProperty = (property: string, value: any) => {
  localProps.value[property] = value
  emit('update', property, value)
}

const toggleStyle = (property: string, activeValue: any, inactiveValue: any) => {
  const newValue = localProps.value[property] === activeValue ? inactiveValue : activeValue
  updateProperty(property, newValue)
}

const updateSize = (dimension: 'width' | 'height', event: Event) => {
  const value = parseInt((event.target as HTMLInputElement).value)
  if (dimension === 'width') {
    const newScaleX = value / (localProps.value.width || 1)
    updateProperty('scaleX', newScaleX)
  } else {
    const newScaleY = value / (localProps.value.height || 1)
    updateProperty('scaleY', newScaleY)
  }
}
</script>

<style scoped>
.properties-panel {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 280px;
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
  background: #fafafa;
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
  width: 18px;
  height: 18px;
  color: #6366f1;
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

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.properties-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f3f4f6;
}

.properties-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.property-group {
  margin-bottom: 14px;
}

.property-group.half {
  flex: 1;
}

.property-row {
  display: flex;
  gap: 12px;
}

.property-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 6px;
}

.property-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #1f2937;
  background: #fafafa;
  transition: all 0.2s;
}

.property-input:focus {
  outline: none;
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.property-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #1f2937;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
}

.property-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-unit .property-input {
  flex: 1;
}

.unit {
  font-size: 12px;
  color: #9ca3af;
}

.style-buttons,
.align-buttons {
  display: flex;
  gap: 4px;
}

.style-btn,
.align-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.style-btn:hover,
.align-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.style-btn.active,
.align-btn.active {
  background: #eef2ff;
  border-color: #c7d2fe;
  color: #6366f1;
}

.color-picker-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-input {
  width: 40px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-text {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-family: monospace;
  color: #1f2937;
  background: #fafafa;
}

.stroke-width-input {
  width: 60px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
}

.property-slider {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e5e7eb;
  appearance: none;
  cursor: pointer;
}

.property-slider::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: #6366f1;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.property-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.slider-value {
  min-width: 40px;
  text-align: right;
  font-size: 12px;
  color: #6b7280;
}

.rotation-control,
.opacity-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actions-section {
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.action-btn.danger:hover {
  background: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
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

.panel-content::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

/* Mobile Bottom Sheet Styles */
@media (max-width: 768px) {
  .properties-panel {
    width: 100%;
    max-width: none;
  }
}

.properties-panel.mobile {
  position: fixed;
  right: 0;
  left: 0;
  top: auto;
  bottom: 0;
  width: 100%;
  max-width: none;
  height: auto;
  max-height: 380px;
  border-left: none;
  border-top: 1px solid #e5e7eb;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.15);
}

.properties-panel.mobile .panel-header {
  position: relative;
  padding: 12px 16px;
}

.properties-panel.mobile .panel-header::before {
  content: '';
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  background: #d1d5db;
  border-radius: 2px;
}

.properties-panel.mobile .panel-content {
  max-height: 320px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom, 0));
}

.properties-panel.mobile .properties-section {
  margin-bottom: 14px;
  padding-bottom: 14px;
}

.properties-panel.mobile .property-group {
  margin-bottom: 10px;
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
</style>
