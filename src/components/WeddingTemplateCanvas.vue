<template>
  <div class="wedding-template-canvas">
    <div class="controls">
      <button @click="toggleGuides" class="btn-control">
        {{ showGuides ? 'Hide' : 'Show' }} Guides
      </button>
      <button @click="exportLayout" class="btn-control">
        Export Layout
      </button>
      <button @click="clearCanvas" class="btn-control">
        Clear Canvas
      </button>
      <button @click="loadTemplate('wedding')" class="btn-control">
        Load Wedding Template
      </button>
      <button @click="loadTemplate('freedom')" class="btn-control">
        Load Freedom Template
      </button>
    </div>

    <div ref="canvasContainer" class="canvas-container">
      <v-stage
        ref="stageRef"
        :config="stageConfig"
      />
    </div>

    <div class="info-panel">
      <h3>Template Info</h3>
      <p><strong>Size:</strong> {{ stageConfig.width }} × {{ stageConfig.height }}px</p>
      <p><strong>Layers:</strong> Background, Assets, Text, Guides</p>
      <p><strong>Editable:</strong> Double-click text to edit</p>
      <p><strong>Draggable:</strong> Click and drag text/assets</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Konva from 'konva'
import { SvgLayoutManager } from '../services/svg-layout.service'
import { TextEditingService } from '../services/text-editing.service'
import { createWeddingTemplate, createFreedomCeremonyTemplate } from '../services/wedding-template.preset'

const stageRef = ref<any>(null)
const canvasContainer = ref<HTMLDivElement | null>(null)
const showGuides = ref(false)

let layoutManager: SvgLayoutManager | null = null
let textEditingService: TextEditingService | null = null

const stageConfig = ref({
  width: 1024,
  height: 576
})

onMounted(async () => {
  if (!stageRef.value) return

  const stage = stageRef.value.getNode() as Konva.Stage

  // Initialize layout manager
  layoutManager = new SvgLayoutManager(stage, {
    width: stageConfig.value.width,
    height: stageConfig.value.height,
    backgroundColor: '#f5f5f5'
  })

  // Initialize text editing service
  textEditingService = new TextEditingService(stage)
  const layers = layoutManager.getLayers()
  textEditingService.enableTransformer(layers.text)

  // Load default template
  await loadTemplate('wedding')
})

onBeforeUnmount(() => {
  if (textEditingService) {
    textEditingService.destroy()
  }
})

async function loadTemplate(type: 'wedding' | 'freedom') {
  if (!layoutManager) return

  layoutManager.clear()

  const config = {
    backgroundUrl: '/templates/freedom-ceremony-preview.svg',
    mainMessage: 'Alhamdulillah on your wedding',
    coupleName: 'HANNATU MUSA',
    date: '28 September, 2025',
    outCeeName: 'OUT-CEE: MAI JAMA\'A FAMILY'
  }

  if (type === 'wedding') {
    await createWeddingTemplate(layoutManager, config)
  } else {
    await createFreedomCeremonyTemplate(layoutManager, config)
  }
}

function toggleGuides() {
  if (!layoutManager) return
  showGuides.value = !showGuides.value
  layoutManager.toggleGuides(showGuides.value)
}

function exportLayout() {
  if (!layoutManager) return
  const layout = layoutManager.exportLayout()
  console.log('Exported Layout:', layout)
  
  // Download as JSON
  const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'wedding-template-layout.json'
  a.click()
  URL.revokeObjectURL(url)
}

function clearCanvas() {
  if (!layoutManager) return
  layoutManager.clear()
}
</script>

<style scoped>
.wedding-template-canvas {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #1a1a1a;
  color: #fff;
}

.controls {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #2a2a2a;
  border-bottom: 1px solid #3a3a3a;
}

.btn-control {
  padding: 8px 16px;
  background: #00D9FF;
  color: #000;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-control:hover {
  background: #00B8D9;
  transform: translateY(-1px);
}

.canvas-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  overflow: auto;
}

.info-panel {
  padding: 16px;
  background: #2a2a2a;
  border-top: 1px solid #3a3a3a;
}

.info-panel h3 {
  margin: 0 0 12px 0;
  color: #00D9FF;
  font-size: 16px;
}

.info-panel p {
  margin: 6px 0;
  font-size: 14px;
  color: #aaa;
}

.info-panel strong {
  color: #fff;
}
</style>

