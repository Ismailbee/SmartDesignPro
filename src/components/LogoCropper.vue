<template>
  <!-- Modal Overlay -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 logo-cropper-modal-overlay"
        @click.self="handleClose"
      >
        <!-- Modal Content -->
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <svg class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Crop Logo Image
            </h3>
            <button
              type="button"
              @click="handleClose"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Cropper Area -->
          <div class="flex-1 overflow-auto p-6">
            <div class="max-w-2xl mx-auto">
              <!-- Image Container -->
              <div class="bg-gray-100 dark:bg-slate-900 rounded-lg overflow-hidden" style="max-height: 400px;">
                <img
                  ref="imageElement"
                  :src="imageUrl"
                  alt="Crop preview"
                  class="max-w-full block"
                  style="max-height: 400px;"
                />
              </div>

              <!-- Controls -->
              <div class="mt-6 space-y-4">
                <!-- Zoom Control -->
                <div class="flex items-center gap-4">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 w-20">Zoom:</label>
                  <button
                    type="button"
                    @click="zoomOut"
                    class="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded text-slate-900 dark:text-white transition-colors"
                  >
                    −
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="1"
                    :value="zoomLevel"
                    @input="handleZoom"
                    class="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <button
                    type="button"
                    @click="zoomIn"
                    class="px-3 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded text-slate-900 dark:text-white transition-colors"
                  >
                    +
                  </button>
                  <span class="text-sm text-slate-600 dark:text-slate-400 w-16 text-right">{{ zoomLevel }}%</span>
                </div>

                <!-- Transform Buttons -->
                <div class="flex items-center gap-4">
                  <label class="text-sm font-medium text-slate-700 dark:text-slate-300 w-20">Transform:</label>
                  <div class="flex gap-2">
                    <button
                 type="button"
                 @click="rotateLeft"
                 class="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded font-medium transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Rotate Left
                    </button>
                    <button
                 type="button"
                 @click="rotateRight"
                 class="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded font-medium transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10H11a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                      </svg>
                      Rotate Right
                    </button>
                    <button
                 type="button"
                 @click="flipHorizontal"
                 class="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded font-medium transition-colors flex items-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Flip
                    </button>
                    <button
                        type="button"
                        @click="reset"
                        class="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 rounded font-medium transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
                type="button"
                @click="handleClose"
                class="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
                type="button"
                @click="handleCrop"
                class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['close', 'crop']);

const imageElement = ref(null);
const cropper = ref(null);
const zoomLevel = ref(100);
const scaleX = ref(1);

// Initialize cropper when modal opens
watch(() => props.isOpen, async (newVal) => {
  if (newVal && props.imageUrl) {
    await nextTick();
    initCropper();
  } else {
    destroyCropper();
  }
});

const initCropper = () => {
  if (!imageElement.value) return;

  // Destroy existing cropper
  destroyCropper();

  // Create new cropper instance
  cropper.value = new Cropper(imageElement.value, {
    aspectRatio: NaN, // Free aspect ratio
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 0.9,
    restore: false,
    guides: true,
    center: true,
    highlight: true,
    cropBoxMovable: true,
    cropBoxResizable: true,
    toggleDragModeOnDblclick: false,
    responsive: true,
    checkOrientation: true,
    modal: true,
    background: true,
    zoom: (event) => {
      // Update zoom level display
      const imageData = cropper.value.getImageData();
      if (imageData) {
        const currentZoom = Math.round((imageData.width / imageData.naturalWidth) * 100);
        zoomLevel.value = currentZoom;
      }
    }
  });
};

const destroyCropper = () => {
  if (cropper.value) {
    cropper.value.destroy();
    cropper.value = null;
  }
};

const handleZoom = (event) => {
  const newZoom = parseInt(event.target.value);
  zoomLevel.value = newZoom;
  
  if (cropper.value) {
    const ratio = newZoom / 100;
    cropper.value.zoomTo(ratio);
  }
};

const zoomIn = () => {
  if (cropper.value) {
    cropper.value.zoom(0.1);
  }
};

const zoomOut = () => {
  if (cropper.value) {
    cropper.value.zoom(-0.1);
  }
};

const rotateLeft = () => {
  if (cropper.value) {
    cropper.value.rotate(-90);
  }
};

const rotateRight = () => {
  if (cropper.value) {
    cropper.value.rotate(90);
  }
};

const flipHorizontal = () => {
  if (cropper.value) {
    scaleX.value = -scaleX.value;
    cropper.value.scaleX(scaleX.value);
  }
};

const reset = () => {
  if (cropper.value) {
    cropper.value.reset();
    zoomLevel.value = 100;
    scaleX.value = 1;
  }
};

const handleCrop = () => {
  console.log('🎯 LogoCropper: handleCrop called');
  
  if (!cropper.value) {
    console.error('❌ LogoCropper: cropper.value is null/undefined');
    return;
  }

  console.log('✅ LogoCropper: cropper instance exists');

  // Get cropped canvas
  const canvas = cropper.value.getCroppedCanvas({
    maxWidth: 4096,
    maxHeight: 4096,
    fillColor: '#fff',
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high'
  });

  if (!canvas) {
    console.error('❌ LogoCropper: getCroppedCanvas returned null');
    return;
  }

  console.log('✅ LogoCropper: canvas created successfully', canvas);

  // Convert to data URL (PNG format for transparency)
  canvas.toBlob((blob) => {
    if (!blob) {
      console.error('❌ LogoCropper: toBlob returned null');
      return;
    }
    
    console.log('✅ LogoCropper: blob created', blob.size, 'bytes');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ LogoCropper: FileReader complete, emitting crop event');
      console.log('📤 LogoCropper: Data URL length:', reader.result ? reader.result.length : 0);
      emit('crop', reader.result);
    };
    reader.onerror = (error) => {
      console.error('❌ LogoCropper: FileReader error:', error);
    };
    reader.readAsDataURL(blob);
  }, 'image/png', 0.95);
};

const handleClose = () => {
  emit('close');
};

// Cleanup on unmount
onBeforeUnmount(() => {
  destroyCropper();
});
</script>

<style scoped>
/* Ensure LogoCropper modal is always on top */
.logo-cropper-modal-overlay {
  z-index: 99999 !important;
}
/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.9);
}

/* Custom range slider */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #2563eb;
  cursor: pointer;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
