<template>
  <div class="signature-canvas-container">
    <div class="canvas-wrapper" :style="{ width: width, height: height }">
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="stopDrawing"
        @mouseleave="stopDrawing"
        @touchstart.prevent="handleTouchStart"
        @touchmove.prevent="handleTouchMove"
        @touchend.prevent="stopDrawing"
        class="signature-canvas"
        :class="{ 'drawing': isDrawing }"
      ></canvas>
      
      <!-- Empty state overlay -->
      <div v-if="isEmpty && !isDrawing" class="empty-overlay">
        <svg class="w-16 h-16 text-slate-300 dark:text-slate-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        <p class="text-sm text-slate-400 dark:text-slate-500">Draw your signature here</p>
        <p class="text-xs text-slate-300 dark:text-slate-600 mt-1">Use mouse or touch</p>
      </div>
    </div>

    <!-- Controls -->
    <div class="controls-bar">
      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Pen Size:</label>
        <input
          type="range"
          v-model="penSize"
          min="1"
          max="10"
          class="w-24"
        />
        <span class="text-xs text-slate-600 dark:text-slate-400">{{ penSize }}px</span>
      </div>

      <div class="flex items-center gap-2">
        <label class="text-sm font-medium text-slate-700 dark:text-slate-300">Color:</label>
        <input
          type="color"
          v-model="penColor"
          class="w-12 h-8 rounded border border-slate-300 dark:border-slate-600 cursor-pointer"
        />
      </div>

      <div class="flex gap-2">
        <button
          @click="undo"
          :disabled="strokes.length === 0"
          class="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          Undo
        </button>
        
        <button
          @click="clear"
          class="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, onBeforeUnmount, watch } from 'vue';

export default defineComponent({
  name: 'SignatureCanvas',
  props: {
    width: {
      type: String,
      default: '100%'
    },
    height: {
      type: String,
      default: '300px'
    },
    backgroundColor: {
      type: String,
      default: '#ffffff'
    }
  },
  emits: ['update', 'clear'],
  setup(props, { emit }) {
    const canvas = ref(null);
    const ctx = ref(null);
    const isDrawing = ref(false);
    const isEmpty = ref(true);
    const penSize = ref(2);
    const penColor = ref('#000000');
    const strokes = ref([]);
    const currentStroke = ref([]);
    
    const canvasWidth = ref(800);
    const canvasHeight = ref(300);

    onMounted(() => {
      if (canvas.value) {
        ctx.value = canvas.value.getContext('2d');
        setupCanvas();
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
      }
    });

    // PERFORMANCE: Clean up resize listener to prevent memory leak
    onBeforeUnmount(() => {
      window.removeEventListener('resize', resizeCanvas);
    });

    const setupCanvas = () => {
      if (!ctx.value) return;
      
      ctx.value.strokeStyle = penColor.value;
      ctx.value.lineWidth = penSize.value;
      ctx.value.lineCap = 'round';
      ctx.value.lineJoin = 'round';
      
      // Fill with background color
      ctx.value.fillStyle = props.backgroundColor;
      ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
    };

    const resizeCanvas = () => {
      if (!canvas.value) return;
      
      const container = canvas.value.parentElement;
      const rect = container.getBoundingClientRect();
      
      canvasWidth.value = rect.width;
      canvasHeight.value = rect.height;
      
      // Redraw after resize
      redrawCanvas();
    };

    const getMousePos = (e) => {
      const rect = canvas.value.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const getTouchPos = (e) => {
      const rect = canvas.value.getBoundingClientRect();
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    };

    const startDrawing = (e) => {
      isDrawing.value = true;
      isEmpty.value = false;
      const pos = getMousePos(e);
      currentStroke.value = [{
        x: pos.x,
        y: pos.y,
        color: penColor.value,
        size: penSize.value
      }];
    };

    const handleTouchStart = (e) => {
      isDrawing.value = true;
      isEmpty.value = false;
      const pos = getTouchPos(e);
      currentStroke.value = [{
        x: pos.x,
        y: pos.y,
        color: penColor.value,
        size: penSize.value
      }];
    };

    const draw = (e) => {
      if (!isDrawing.value || !ctx.value) return;
      
      const pos = getMousePos(e);
      
      currentStroke.value.push({
        x: pos.x,
        y: pos.y,
        color: penColor.value,
        size: penSize.value
      });

      drawStroke(currentStroke.value);
    };

    const handleTouchMove = (e) => {
      if (!isDrawing.value || !ctx.value) return;
      
      const pos = getTouchPos(e);
      
      currentStroke.value.push({
        x: pos.x,
        y: pos.y,
        color: penColor.value,
        size: penSize.value
      });

      drawStroke(currentStroke.value);
    };

    const drawStroke = (stroke) => {
      if (stroke.length < 2 || !ctx.value) return;
      
      const lastPoint = stroke[stroke.length - 2];
      const currentPoint = stroke[stroke.length - 1];
      
      ctx.value.beginPath();
      ctx.value.strokeStyle = currentPoint.color;
      ctx.value.lineWidth = currentPoint.size;
      ctx.value.moveTo(lastPoint.x, lastPoint.y);
      ctx.value.lineTo(currentPoint.x, currentPoint.y);
      ctx.value.stroke();
    };

    const stopDrawing = () => {
      if (isDrawing.value && currentStroke.value.length > 0) {
        strokes.value.push([...currentStroke.value]);
        currentStroke.value = [];
        emitUpdate();
      }
      isDrawing.value = false;
    };

    const redrawCanvas = () => {
      if (!ctx.value) return;
      
      // Clear and fill background
      ctx.value.fillStyle = props.backgroundColor;
      ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
      
      // Redraw all strokes
      strokes.value.forEach(stroke => {
        if (stroke.length < 2) return;
        
        ctx.value.beginPath();
        ctx.value.strokeStyle = stroke[0].color;
        ctx.value.lineWidth = stroke[0].size;
        ctx.value.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < stroke.length; i++) {
          ctx.value.lineTo(stroke[i].x, stroke[i].y);
        }
        
        ctx.value.stroke();
      });
    };

    const undo = () => {
      if (strokes.value.length > 0) {
        strokes.value.pop();
        redrawCanvas();
        
        if (strokes.value.length === 0) {
          isEmpty.value = true;
        }
        
        emitUpdate();
      }
    };

    const clear = () => {
      strokes.value = [];
      currentStroke.value = [];
      isEmpty.value = true;
      setupCanvas();
      emit('clear');
      emit('update', null);
    };

    const getSignatureDataURL = () => {
      if (!canvas.value) return null;
      return canvas.value.toDataURL('image/png');
    };

    const getSignatureBlob = () => {
      return new Promise((resolve) => {
        if (!canvas.value) {
          resolve(null);
          return;
        }
        canvas.value.toBlob((blob) => {
          resolve(blob);
        }, 'image/png');
      });
    };

    const loadSignature = (dataURL) => {
      const img = new Image();
      img.onload = () => {
        ctx.value.drawImage(img, 0, 0);
        isEmpty.value = false;
      };
      img.src = dataURL;
    };

    const emitUpdate = () => {
      const dataURL = getSignatureDataURL();
      emit('update', dataURL);
    };

    // Watch pen settings
    watch([penSize, penColor], () => {
      if (ctx.value) {
        ctx.value.strokeStyle = penColor.value;
        ctx.value.lineWidth = penSize.value;
      }
    });

    return {
      canvas,
      isDrawing,
      isEmpty,
      penSize,
      penColor,
      strokes,
      canvasWidth,
      canvasHeight,
      startDrawing,
      draw,
      stopDrawing,
      handleTouchStart,
      handleTouchMove,
      undo,
      clear,
      getSignatureDataURL,
      getSignatureBlob,
      loadSignature
    };
  }
});
</script>

<style scoped>
.signature-canvas-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.canvas-wrapper {
  position: relative;
  border: 2px solid #e2e8f0;
  border-radius: 0.75rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dark .canvas-wrapper {
  border-color: #475569;
  background: #1e293b;
}

.signature-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
}

.signature-canvas.drawing {
  cursor: grabbing;
}

.empty-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
}

.dark .controls-bar {
  background: #1e293b;
  border-color: #475569;
}

input[type="range"] {
  cursor: pointer;
  accent-color: #10b981;
}

input[type="color"] {
  cursor: pointer;
}
</style>
