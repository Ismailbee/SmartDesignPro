<template>
  <div class="flex-1 bg-gray-100 p-4 overflow-hidden">
    <div class="h-full flex items-center justify-center">
      <div
        class="relative bg-white shadow-lg border-2 border-gray-300 rounded-lg overflow-hidden"
        :style="{
          width: canvasState.width * zoom + 'px',
          height: canvasState.height * zoom + 'px'
        }"
        @click="handleStageClick"
      >
        <!-- Canvas Background -->
        <div 
          class="absolute inset-0"
          :style="{ backgroundColor: canvasState.backgroundColor }"
        ></div>

        <!-- Placeholder when no objects -->
        <transition name="fade">
          <div
            v-if="canvasState.objects.length === 0"
            class="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none"
          >
            <div class="text-center">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p class="text-lg font-medium">Canvas Area</p>
              <p class="text-sm">{{ canvasState.width }} × {{ canvasState.height }}</p>
              <p class="text-xs mt-2">Zoom: {{ Math.round(zoom * 100) }}%</p>
              <p class="text-xs">Click sidebar items to add objects</p>
            </div>
          </div>
        </transition>

        <!-- Render objects -->
        <transition-group name="object" tag="div">
          <div
            v-for="object in sortedObjects"
            :key="object.id"
            :style="{
              position: 'absolute',
              left: object.x + 'px',
              top: object.y + 'px',
              width: object.width + 'px',
              height: object.height + 'px',
              transform: `rotate(${object.rotation}rad) scale(${object.scaleX}, ${object.scaleY})`,
              opacity: object.opacity,
              zIndex: object.zIndex,
              border: selectedObjects.some(s => s.id === object.id) ? '2px solid #3b82f6' : 'none',
              boxSizing: 'border-box'
            }"
            @click="handleObjectClick(object.id, $event)"
            class="cursor-pointer hover:opacity-80 transition-all duration-200"
          >
          <!-- Image Objects -->
          <img 
            v-if="object.type === 'image'"
            :src="object.src"
            :alt="`Image ${object.id}`"
            class="w-full h-full object-cover rounded"
            draggable="false"
          />
          
          <!-- Text Objects -->
          <div
            v-else-if="object.type === 'text'"
            :style="getTextStyle(object)"
            class="w-full h-full flex items-center justify-center p-2"
            @dblclick="handleTextEdit(object.id)"
          >
            {{ object.text }}
          </div>
          
          <!-- Shape Objects -->
          <div
            v-else-if="object.type === 'shape'"
            :style="{
              backgroundColor: object.fill,
              border: `${object.strokeWidth}px solid ${object.stroke}`,
              borderRadius: object.shapeType === 'circle' ? '50%' : (object.cornerRadius || 0) + 'px'
            }"
            class="w-full h-full"
          ></div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- Text Editing Modal -->
    <div
      v-if="editingTextId"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click="finishTextEdit"
    >
      <div
        class="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4"
        @click.stop
      >
        <h3 class="text-lg font-semibold mb-4">Edit Text</h3>
        <textarea
          v-model="editingText"
          @keydown.enter.ctrl="finishTextEdit"
          @keydown.escape="cancelTextEdit"
          class="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter your text..."
          ref="textEditor"
        ></textarea>
        <div class="flex justify-end space-x-2 mt-4">
          <button
            @click="cancelTextEdit"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="finishTextEdit"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { CanvasState, AnyDesignObject } from '@/types'

// Props
const props = defineProps<{
  canvasState: CanvasState
  zoom: number
  selectedObjects: AnyDesignObject[]
}>()

// Emits
const emit = defineEmits<{
  'object-select': [id: string, multiSelect: boolean]
  'object-update': [id: string, updates: Partial<AnyDesignObject>]
  'object-transform-end': []
  'canvas-click': []
}>()

// Text editing state
const editingTextId = ref<string | null>(null)
const editingText = ref('')
const textEditor = ref<HTMLTextAreaElement>()

// Helper function to get text style
function getTextStyle(object: any) {
  return {
    fontSize: object.fontSize + 'px',
    fontFamily: object.fontFamily,
    fontStyle: object.fontStyle,
    textDecoration: object.textDecoration,
    color: object.fill,
    textAlign: object.align,
    lineHeight: object.lineHeight.toString(),
    letterSpacing: object.letterSpacing + 'px'
  } as any
}

// Computed
const sortedObjects = computed(() => 
  [...props.canvasState.objects].sort((a, b) => a.zIndex - b.zIndex)
)

// Methods
function handleStageClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    emit('canvas-click')
  }
}

function handleObjectClick(id: string, event: MouseEvent) {
  event.stopPropagation()
  const multiSelect = event.ctrlKey || event.metaKey
  emit('object-select', id, multiSelect)
}

function handleTextEdit(id: string) {
  const textObject = props.canvasState.objects.find(obj => obj.id === id && obj.type === 'text')
  if (textObject && textObject.type === 'text') {
    editingTextId.value = id
    editingText.value = textObject.text
  }
}

function finishTextEdit() {
  if (editingTextId.value) {
    emit('object-update', editingTextId.value, { text: editingText.value })
    editingTextId.value = null
    editingText.value = ''
  }
}

function cancelTextEdit() {
  editingTextId.value = null
  editingText.value = ''
}

// Export functionality (simplified)
function exportCanvas(format: string = 'png') {
  console.log(`Exporting as ${format}`)
  // TODO: Implement actual export functionality
}

// Expose export function
defineExpose({
  exportCanvas
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.object-enter-active {
  transition: all 0.3s ease;
}
.object-enter-from {
  opacity: 0;
  transform: scale(0.8);
}
.object-leave-active {
  transition: all 0.2s ease;
}
.object-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
