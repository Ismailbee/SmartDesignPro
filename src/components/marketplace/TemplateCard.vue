<template>
  <div class="template-card" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
    <!-- Thumbnail -->
    <div class="template-thumbnail" @click="$emit('preview', template)">
      <img :src="template.thumbnailUrl" :alt="template.title" class="thumbnail-image" />
      
      <!-- Hover Overlay -->
      <Transition name="fade">
        <div v-if="isHovered" class="hover-overlay">
          <button class="preview-btn" @click.stop="$emit('preview', template)">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview</span>
          </button>
        </div>
      </Transition>

      <!-- Access Level Badge -->
      <div :class="['access-badge', template.accessLevel]">
        {{ accessLevelLabel }}
      </div>

      <!-- Featured Badge -->
      <div v-if="template.isFeatured" class="featured-badge">
        ⭐ Featured
      </div>
    </div>

    <!-- Content -->
    <div class="template-content">
      <!-- Title -->
      <h3 class="template-title" :title="template.title">{{ template.title }}</h3>

      <!-- Description -->
      <p class="template-description" :title="template.description">
        {{ truncatedDescription }}
      </p>

      <!-- Tags -->
      <div class="template-tags">
        <span v-for="tag in displayTags" :key="tag" class="tag">
          {{ tag }}
        </span>
        <span v-if="template.tags.length > 3" class="tag-more">
          +{{ template.tags.length - 3 }}
        </span>
      </div>

      <!-- Stats -->
      <div class="template-stats">
        <div class="stat">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>{{ formatNumber(template.downloads) }}</span>
        </div>
        <div class="stat">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{{ formatNumber(template.likes) }}</span>
        </div>
        <div class="stat">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{{ formatNumber(template.views) }}</span>
        </div>
      </div>

      <!-- Price & Actions -->
      <div class="template-footer">
        <div class="template-price">
          <span v-if="template.price === 0" class="price-free">FREE</span>
          <span v-else class="price-amount">₦{{ template.price }}</span>
        </div>

        <div class="template-actions">
          <!-- Like Button -->
          <button
            class="action-btn like-btn"
            :class="{ liked: isLiked }"
            @click.stop="handleLike"
            :title="isLiked ? 'Unlike' : 'Like'"
          >
            <svg class="w-5 h-5" :fill="isLiked ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>

          <!-- Save Button -->
          <button
            class="action-btn save-btn"
            :class="{ saved: isSaved }"
            @click.stop="handleSave"
            :title="isSaved ? 'Saved' : 'Save to Library'"
          >
            <svg class="w-5 h-5" :fill="isSaved ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          <!-- Use Button -->
          <button class="action-btn use-btn" @click.stop="handleUse" title="Use Template">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Template } from '@/types/marketplace'
import { ACCESS_LEVEL_LABELS } from '@/types/marketplace'
import { useMarketplaceStore } from '@/stores/marketplace'
import { storeToRefs } from 'pinia'

interface Props {
  template: Template
}

const props = defineProps<Props>()

const emit = defineEmits<{
  preview: [template: Template]
  use: [template: Template]
  save: [template: Template]
  like: [template: Template]
}>()

const marketplaceStore = useMarketplaceStore()
const { userLibrary } = storeToRefs(marketplaceStore)

const isHovered = ref(false)

const accessLevelLabel = computed(() => ACCESS_LEVEL_LABELS[props.template.accessLevel])

const truncatedDescription = computed(() => {
  const maxLength = 80
  if (props.template.description.length <= maxLength) {
    return props.template.description
  }
  return props.template.description.substring(0, maxLength) + '...'
})

const displayTags = computed(() => props.template.tags.slice(0, 3))

const isLiked = ref(false) // TODO: Check if user has liked this template

const isSaved = computed(() => {
  return userLibrary.value?.savedTemplates.includes(props.template.id) || false
})

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function handleLike() {
  emit('like', props.template)
  isLiked.value = !isLiked.value
}

function handleSave() {
  emit('save', props.template)
}

function handleUse() {
  emit('use', props.template)
}
</script>

<style scoped>
.template-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(18px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.template-thumbnail {
  position: relative;
  width: 100%;
  padding-top: 75%; /* 4:3 aspect ratio */
  overflow: hidden;
  background: rgba(0, 0, 0, 0.05);
}

.thumbnail-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: #667eea;
  color: white;
  transform: scale(1.05);
}

.access-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  backdrop-filter: blur(10px);
}

.access-badge.free {
  background: rgba(72, 187, 120, 0.9);
  color: white;
}

.access-badge.premium {
  background: rgba(237, 137, 54, 0.9);
  color: white;
}

.access-badge.exclusive {
  background: rgba(159, 122, 234, 0.9);
  color: white;
}

.featured-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  background: rgba(255, 215, 0, 0.9);
  color: #333;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(10px);
}

.template-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.template-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-description {
  font-size: 14px;
  color: #718096;
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.template-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  padding: 4px 8px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.tag-more {
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.05);
  color: #718096;
  border-radius: 6px;
  font-size: 12px;
}

.template-stats {
  display: flex;
  gap: 16px;
  padding: 8px 0;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #718096;
  font-size: 13px;
}

.stat svg {
  width: 16px;
  height: 16px;
}

.template-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}

.template-price {
  font-weight: 700;
}

.price-free {
  color: #48bb78;
  font-size: 16px;
}

.price-amount {
  color: #667eea;
  font-size: 18px;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.05);
  color: #718096;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transform: scale(1.1);
}

.like-btn.liked {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
}

.save-btn.saved {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.use-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.use-btn:hover {
  background: linear-gradient(135deg, #764ba2, #667eea);
  transform: scale(1.1);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

