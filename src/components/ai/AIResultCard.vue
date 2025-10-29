<template>
  <div class="ai-result-card" :class="{ dragging: isDragging }" draggable="true" @dragstart="handleDragStart" @dragend="handleDragEnd">
    <!-- Text Result -->
    <div v-if="type === 'text'" class="text-result">
      <p class="result-text">{{ (result as AITextResult).text }}</p>
      <div class="result-meta">
        <span class="meta-item">{{ formatTone((result as AITextResult).tone) }}</span>
        <span class="meta-item">{{ formatDate((result as AITextResult).createdAt) }}</span>
      </div>
    </div>

    <!-- Image Result -->
    <div v-else-if="type === 'image'" class="image-result">
      <div class="image-preview">
        <img :src="(result as AIImageResult).imageUrl" :alt="(result as AIImageResult).prompt" />
        <div v-if="(result as AIImageResult).status === 'processing'" class="processing-overlay">
          <svg class="spinner" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
          </svg>
          <span>Processing...</span>
        </div>
      </div>
      <div class="result-meta">
        <span class="meta-item">{{ (result as AIImageResult).width }}×{{ (result as AIImageResult).height }}</span>
        <span class="meta-item">{{ formatDate((result as AIImageResult).createdAt) }}</span>
      </div>
      <details class="prompt-details">
        <summary>Prompt</summary>
        <p>{{ (result as AIImageResult).prompt }}</p>
      </details>
    </div>

    <!-- Background Result -->
    <div v-else-if="type === 'background'" class="background-result">
      <div class="image-comparison">
        <div class="comparison-image">
          <img :src="(result as AIBackgroundResult).processedImageUrl" alt="Processed" />
          <span class="comparison-label">After</span>
        </div>
      </div>
      <div class="result-meta">
        <span class="meta-item">{{ formatOutputType((result as AIBackgroundResult).outputType) }}</span>
        <span class="meta-item">{{ formatDate((result as AIBackgroundResult).createdAt) }}</span>
      </div>
    </div>

    <!-- QR Code Result -->
    <div v-else-if="type === 'qrcode'" class="qrcode-result">
      <div class="qrcode-preview">
        <img :src="(result as AIQRCodeResult).qrCodeUrl" alt="QR Code" />
      </div>
      <div class="result-meta">
        <span class="meta-item">{{ (result as AIQRCodeResult).size }}×{{ (result as AIQRCodeResult).size }}</span>
        <span class="meta-item">{{ formatQRType((result as AIQRCodeResult).type) }}</span>
      </div>
      <details class="prompt-details">
        <summary>Data</summary>
        <p class="qr-data">{{ (result as AIQRCodeResult).data }}</p>
      </details>
    </div>

    <!-- Action Buttons -->
    <div class="result-actions">
      <button @click="handleUse" class="action-btn btn-use" title="Use in canvas">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <button v-if="type !== 'text'" @click="handleDownload" class="action-btn btn-download" title="Download">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </button>
      <button v-if="type === 'text'" @click="handleCopy" class="action-btn btn-copy" title="Copy to clipboard">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      <button @click="handleDelete" class="action-btn btn-delete" title="Delete">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type {
  AITextResult,
  AIImageResult,
  AIBackgroundResult,
  AIQRCodeResult,
  AITone,
  AIBackgroundOutputType,
  QRCodeType
} from '@/types/ai'

interface Props {
  result: AITextResult | AIImageResult | AIBackgroundResult | AIQRCodeResult
  type: 'text' | 'image' | 'background' | 'qrcode'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  use: [result: any]
  delete: [result: any]
  download: [result: any]
  copy: [result: any]
}>()

const isDragging = ref(false)

function handleUse() {
  emit('use', props.result)
}

function handleDelete() {
  if (confirm('Delete this result?')) {
    emit('delete', props.result)
  }
}

function handleDownload() {
  emit('download', props.result)
}

function handleCopy() {
  emit('copy', props.result)
}

function handleDragStart(event: DragEvent) {
  isDragging.value = true
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('application/json', JSON.stringify({
      type: props.type,
      result: props.result
    }))
  }
}

function handleDragEnd() {
  isDragging.value = false
}

function formatDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

function formatTone(tone: AITone): string {
  return tone.charAt(0).toUpperCase() + tone.slice(1)
}

function formatOutputType(type: AIBackgroundOutputType): string {
  const labels: Record<AIBackgroundOutputType, string> = {
    transparent: 'Transparent',
    solid: 'Solid Color',
    blur: 'Blurred',
    'ai-generated': 'AI Background'
  }
  return labels[type]
}

function formatQRType(type: QRCodeType): string {
  const labels: Record<QRCodeType, string> = {
    url: 'URL',
    text: 'Text',
    email: 'Email',
    phone: 'Phone',
    sms: 'SMS',
    wifi: 'WiFi',
    vcard: 'vCard',
    event: 'Event'
  }
  return labels[type]
}
</script>

<style scoped>
.ai-result-card {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.2s;
  cursor: grab;
}

.ai-result-card:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.ai-result-card.dragging {
  opacity: 0.5;
  cursor: grabbing;
}

/* Text Result */
.text-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

/* Image Result */
.image-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-preview {
  position: relative;
  border-radius: 12px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
  background: rgba(0, 0, 0, 0.05);
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.processing-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 13px;
  font-weight: 600;
}

.spinner {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Background Result */
.background-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.image-comparison {
  border-radius: 12px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling */
}

.comparison-image {
  position: relative;
}

.comparison-image img {
  width: 100%;
  height: auto;
  display: block;
}

.comparison-label {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}

/* QR Code Result */
.qrcode-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qrcode-preview {
  display: flex;
  justify-content: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
}

.qrcode-preview img {
  width: 100%;
  max-width: 200px;
  height: auto;
  display: block;
}

/* Result Meta */
.result-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #6b7280;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Prompt Details */
.prompt-details {
  font-size: 12px;
}

.prompt-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  user-select: none;
}

.prompt-details p {
  margin: 8px 0 0 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  font-size: 11px;
  line-height: 1.5;
  color: #374151;
}

.qr-data {
  word-break: break-all;
}

/* Action Buttons */
.result-actions {
  display: flex;
  gap: 6px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn svg {
  width: 16px;
  height: 16px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.8);
  transform: translateY(-1px);
}

.btn-use {
  color: #667eea;
}

.btn-use:hover {
  background: rgba(102, 126, 234, 0.2);
  border-color: #667eea;
}

.btn-download,
.btn-copy {
  color: #10b981;
}

.btn-download:hover,
.btn-copy:hover {
  background: rgba(16, 185, 129, 0.2);
  border-color: #10b981;
}

.btn-delete {
  color: #ef4444;
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}
</style>

