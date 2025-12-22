<template>
  <aside class="editor-sidebar" :class="{ open: isOpen }">
    <div class="sidebar-header">
      <div class="logo">
        <div class="logo-icon-wrapper">
          <Sparkles :size="20" class="logo-icon" />
        </div>
        <span class="logo-text">Design Pro</span>
      </div>
      <button class="close-btn" @click="$emit('close')">
        <X :size="18" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <!-- Elements Section -->
      <div class="nav-section">
        <span class="nav-label">Elements</span>
        
        <button class="nav-item" @click="handleAddText">
          <div class="nav-icon">
            <Type :size="18" />
          </div>
          <span>Text</span>
          <kbd class="shortcut-hint">T</kbd>
        </button>
        
        <div class="nav-item-group">
          <button class="nav-item" @click="shapesOpen = !shapesOpen">
            <div class="nav-icon">
              <Shapes :size="18" />
            </div>
            <span>Shapes</span>
            <ChevronDown :size="14" :class="{ rotated: shapesOpen }" class="chevron" />
          </button>
          
          <Transition name="expand">
            <div v-if="shapesOpen" class="submenu">
              <TransitionGroup name="stagger" appear>
                <button 
                  v-for="(shape, index) in shapes" 
                  :key="shape.type"
                  class="submenu-item"
                  :style="{ '--delay': `${index * 50}ms` }"
                  @click="handleAddShape(shape.type)"
                >
                  <component :is="shape.icon" :size="16" />
                  <span>{{ shape.name }}</span>
                </button>
              </TransitionGroup>
            </div>
          </Transition>
        </div>
        
        <button class="nav-item" @click="handleAddImage">
          <div class="nav-icon">
            <ImagePlus :size="18" />
          </div>
          <span>Image</span>
        </button>

        <button class="nav-item" @click="$emit('add-icon')">
          <div class="nav-icon">
            <Sticker :size="18" />
          </div>
          <span>Icons</span>
        </button>
      </div>

      <!-- Animations Section -->
      <div class="nav-section">
        <span class="nav-label">Effects</span>
        <button class="nav-item highlight" @click="$emit('show-animations')">
          <div class="nav-icon animation-icon">
            <Sparkles :size="18" />
          </div>
          <span>Animations</span>
          <span class="badge hot">Hot</span>
        </button>
      </div>

      <!-- Templates Section -->
      <div class="nav-section">
        <span class="nav-label">Templates</span>
        <button class="nav-item">
          <div class="nav-icon">
            <LayoutGrid :size="18" />
          </div>
          <span>Browse All</span>
          <span class="badge">New</span>
        </button>
        <button class="nav-item">
          <div class="nav-icon">
            <FolderOpen :size="18" />
          </div>
          <span>My Designs</span>
        </button>
      </div>

      <!-- Uploads Section -->
      <div class="nav-section">
        <span class="nav-label">Uploads</span>
        <button class="nav-item upload-btn" @click="handleAddImage">
          <div class="nav-icon">
            <Upload :size="18" />
          </div>
          <span>Upload File</span>
        </button>
      </div>
    </nav>

    <div class="sidebar-footer">
      <button class="shortcuts-btn" @click="$emit('show-shortcuts')">
        <Keyboard :size="16" />
        <span>Shortcuts</span>
        <kbd>?</kbd>
      </button>
      <button class="upgrade-btn">
        <Crown :size="16" />
        <span>Upgrade to Pro</span>
        <Sparkles :size="14" class="sparkle" />
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, markRaw } from 'vue'
import {
  Sparkles, X, Type, Shapes, ImagePlus,
  Square, Circle, Triangle, Star, Minus, Hexagon,
  LayoutGrid, FolderOpen, Upload, Crown, ChevronDown,
  Keyboard, Sticker
} from 'lucide-vue-next'

defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-text'): void
  (e: 'add-shape', type: string): void
  (e: 'add-image'): void
  (e: 'add-icon'): void
  (e: 'show-shortcuts'): void
  (e: 'show-animations'): void
}>()

const shapesOpen = ref(false)

const shapes = [
  { type: 'rect', name: 'Rectangle', icon: markRaw(Square) },
  { type: 'circle', name: 'Circle', icon: markRaw(Circle) },
  { type: 'triangle', name: 'Triangle', icon: markRaw(Triangle) },
  { type: 'star', name: 'Star', icon: markRaw(Star) },
  { type: 'hexagon', name: 'Hexagon', icon: markRaw(Hexagon) },
  { type: 'line', name: 'Line', icon: markRaw(Minus) },
]

const handleAddText = () => {
  emit('add-text')
}

const handleAddShape = (type: string) => {
  emit('add-shape', type)
}

const handleAddImage = () => {
  emit('add-image')
}
</script>

<style scoped>
.editor-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 250px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  z-index: 100;
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.editor-sidebar.open {
  transform: translateX(0);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  animation: logoFloat 3s ease-in-out infinite;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-2px); }
}

.logo-icon {
  color: white;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.close-btn {
  padding: 6px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 6px;
  display: none;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
  transform: rotate(90deg);
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 12px 8px;
}

.nav-section {
  margin-bottom: 20px;
}

.nav-label {
  display: block;
  padding: 0 12px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9ca3af;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: none;
  border: none;
  border-radius: 10px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.nav-item:hover {
  background: #f3f4f6;
  color: #1f2937;
  transform: translateX(4px);
}

.nav-item:hover .nav-icon {
  transform: scale(1.1);
  color: #6366f1;
}

.nav-item:active {
  transform: translateX(4px) scale(0.98);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #f3f4f6;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  z-index: 1;
}

.shortcut-hint {
  margin-left: auto;
  padding: 2px 6px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
  opacity: 0;
  transform: translateX(8px);
  transition: all 0.2s;
}

.nav-item:hover .shortcut-hint {
  opacity: 1;
  transform: translateX(0);
}

.badge {
  margin-left: auto;
  padding: 2px 8px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  color: white;
  animation: badgePulse 2s ease-in-out infinite;
}

.badge.hot {
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  animation: hotPulse 1.5s ease-in-out infinite;
}

@keyframes hotPulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 8px 2px rgba(245, 158, 11, 0.3);
  }
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.nav-item.highlight {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.nav-item.highlight:hover {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(239, 68, 68, 0.15) 100%);
}

.animation-icon {
  background: linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%);
  color: #f59e0b;
}

.nav-item:hover .animation-icon {
  color: #f59e0b;
  animation: sparkleRotate 0.6s ease-in-out;
}

@keyframes sparkleRotate {
  0% { transform: scale(1) rotate(0deg); }
  50% { transform: scale(1.2) rotate(15deg); }
  100% { transform: scale(1.1) rotate(0deg); }
}

.nav-item .chevron {
  margin-left: auto;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  color: #9ca3af;
}

.nav-item .chevron.rotated {
  transform: rotate(180deg);
}

.nav-item-group {
  display: flex;
  flex-direction: column;
}

.submenu {
  padding: 4px 0 4px 16px;
  overflow: hidden;
}

.submenu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  animation: fadeSlideIn 0.3s ease backwards;
  animation-delay: var(--delay);
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.submenu-item:hover {
  background: #f3f4f6;
  color: #1f2937;
  transform: translateX(4px);
}

/* Expand animation */
.expand-enter-active {
  animation: expandIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.expand-leave-active {
  animation: expandIn 0.2s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes expandIn {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    max-height: 300px;
    transform: translateY(0);
  }
}

/* Stagger animation */
.stagger-enter-active {
  transition: all 0.3s ease;
  transition-delay: var(--delay);
}

.stagger-leave-active {
  transition: all 0.2s ease;
}

.stagger-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.upload-btn {
  border: 2px dashed #e5e7eb;
  background: #fafafa;
}

.upload-btn:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.sidebar-footer {
  padding: 12px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcuts-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.shortcuts-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.shortcuts-btn kbd {
  margin-left: auto;
  padding: 2px 6px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 10px;
}

.upgrade-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.upgrade-btn::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    45deg,
    transparent 30%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 70%
  );
  transform: rotate(45deg) translateY(100%);
  transition: transform 0.6s;
}

.upgrade-btn:hover::before {
  transform: rotate(45deg) translateY(-100%);
}

.upgrade-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
}

.upgrade-btn .sparkle {
  animation: sparkle 1.5s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1) rotate(0deg); }
  50% { opacity: 0.5; transform: scale(1.2) rotate(180deg); }
}

@media (max-width: 768px) {
  .editor-sidebar {
    width: 280px;
  }
  
  .close-btn {
    display: flex;
  }
}

@media (pointer: coarse) {
  .nav-item {
    padding: 12px 14px;
    min-height: 48px;
  }
  
  .submenu-item {
    padding: 11px 12px;
    min-height: 44px;
  }
}
</style>
