<template>
  <div class="sticker-template-panel">
    <!-- FORM VIEW -->
    <Transition name="fade">
      <div v-if="viewMode === 'form'" class="form-view">
        <!-- Header -->
        <div class="panel-header">
          <button @click="goBack" class="back-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 class="panel-title">Sticker Template</h2>
          <div style="display: flex; gap: 8px;">
            <button @click="showChatHelp" class="menu-btn" title="Help & Guide">
              <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button @click="toggleVoice" class="menu-btn" :class="{ 'active': isVoiceEnabled }" :title="isVoiceEnabled ? 'Turn off voice' : 'Turn on voice'">
              <svg v-if="isVoiceEnabled" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
              </svg>
            </button>
          </div>
        </div>



        <!-- Category Selection Grid -->
        <div v-if="!selectedCategory" class="category-selection-container">
          <div class="selection-title">Select a Sticker Category</div>
          <div class="category-grid">
            <div 
              v-for="category in categories" 
              :key="category.id"
              class="category-card"
              :style="{ background: category.gradient }"
              @click="selectCategory(category.id)"
            >
              <div class="category-icon">{{ category.icon }}</div>
              <div class="category-name">{{ category.name }}</div>
            </div>
          </div>
        </div>

        <!-- Category Pills Removed -->

        <!-- Form Section -->
        <div class="form-section" v-if="selectedCategory">
          <!-- Smart Camera Input (Hidden for Wedding) -->
          <div v-if="isDescriptionVisible && selectedCategory !== 'wedding'" class="form-group">
            <SmartCameraInput 
              @update:description="handleDescriptionUpdate" 
              :initial-text="formData.description"
            />
          </div>

      <!-- Description Field (Hidden for Wedding) -->
      <div v-if="isDescriptionVisible && selectedCategory !== 'wedding'" class="form-group">
        <label for="description" class="form-label">Description</label>
        <SmartTextarea
          id="description"
          v-model="formData.description"
          @input="handleDescriptionInput"
          @keydown="handleDescriptionKeydown"
          class="form-textarea"
          data-explain="description-textarea"
          rows="4"
          placeholder="Enter sticker description... (e.g., Congratulations on your wedding! John and Mary, 15th April 2025, courtesy: Smith Family)"
        />

        <!-- Validation Warnings -->
        <div v-if="validationWarnings.length > 0" class="validation-warnings-container">
          <div class="warning-header">
            <svg class="w-5 h-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="text-amber-800 font-medium">Please check the following:</span>
          </div>
          <ul class="warning-list">
            <li v-for="(warning, index) in validationWarnings" :key="index" class="warning-list-item">
              {{ warning }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Wedding Chat Interface -->
      <div v-if="selectedCategory === 'wedding'" class="wedding-chat-interface">
        
        <div class="chat-history" ref="chatHistoryContainer">
          <!-- Welcome Message -->
          <div v-if="chatMessages.length === 0 && !isGeneratingPreview && !showWeddingStickerPreview" class="chat-welcome-message">
            <div class="welcome-icon">💍</div>
            <h3>Wedding Sticker Designer</h3>
            <p>Hi! I can help you design a beautiful wedding sticker. Please tell me the couple's names, the date, and who it's from.</p>
          </div>

          <!-- Messages -->
          <div v-for="msg in chatMessages" :key="msg.id" class="chat-message" :class="msg.sender">
            <!-- Special Preview Message -->
            <div v-if="msg.type === 'preview'" class="message-bubble svg-bubble">
              <!-- SVG Container -->
              <div class="wedding-preview-container-inline" ref="chatPreviewContainer">
                <!-- SVG will be loaded here dynamically -->
              </div>
            </div>

            <!-- Normal Text Message -->
            <div v-else class="message-bubble">
              {{ msg.text }}
              <div v-if="msg.image" class="chat-image-container">
                <img :src="msg.image" class="chat-image" alt="Uploaded image" />
              </div>
            </div>
            <div class="message-time">{{ msg.time }}</div>
          </div>

          <!-- Analyzing Indicator -->
          <div v-if="isAnalyzing" class="chat-message ai">
            <div class="message-bubble analyzing">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden Wedding Preview Container (for SVG manipulation) -->
      <div v-if="selectedCategory === 'wedding' && showWeddingStickerPreview" class="wedding-preview-container" ref="weddingPreviewContainer" style="display: none;">
        <!-- SVG will be loaded here for manipulation -->
      </div>

      <!-- Edit Modal for Wedding Sticker -->
      <div v-if="selectedCategory === 'wedding' && showWeddingStickerPreview && showEditModal" class="wedding-preview-section">
        <label class="form-label">Edit Your Design</label>
        
        <!-- Image Upload & Export Controls -->
        <div class="wedding-preview-controls">
          <!-- Edit Button - Toggle Image Controls -->
          <div v-if="svgImageManager.images.value.length > 0" class="edit-toggle-section">
            <button @click="showImageControls = !showImageControls" class="edit-toggle-btn">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              {{ showImageControls ? 'Hide' : 'Edit' }}
              <svg class="w-3 h-3" :class="{ 'rotate-180': showImageControls }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <!-- Image Controls (collapsible) -->
          <div v-if="svgImageManager.images.value.length > 0 && showImageControls" class="image-controls-container">
            <!-- Primary Actions Row -->
            <div class="wedding-controls-row">
              <button 
                @click="showUploadModal = true" 
                class="add-image-btn wedding-control-btn primary"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Change Image
              </button>
              
              <button 
                @click="openEditModal" 
                class="edit-description-btn wedding-control-btn primary"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Description
              </button>
              
              <button @click="autoRetouchImage" class="auto-retouch-btn wedding-control-btn primary" :disabled="!selectedSVGImage || isRetouching || selectedSVGImage?.isRetouched">
                <svg v-if="!isRetouching && !selectedSVGImage?.isRetouched" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                <svg v-else-if="selectedSVGImage?.isRetouched" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isRetouching ? 'Retouching...' : selectedSVGImage?.isRetouched ? 'Enhanced ✓' : 'Auto Retouch' }}
            </button>
          </div>

          <!-- Image Scale Control -->
          <div v-if="selectedSVGImage" class="image-scale-control">
            <label class="scale-label">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
              <span>Image Size: {{ Math.round((selectedSVGImage.scale || 1.15) * 100) }}%</span>
            </label>
            <input 
              type="range" 
              :value="selectedSVGImage.scale || 1.15"
              @input="handleImageScaleChange"
              min="0.5" 
              max="2.5" 
              step="0.05"
              class="scale-slider"
            />
            <div class="scale-presets">
              <button @click="setImageScale(0.8)" class="preset-btn">80%</button>
              <button @click="setImageScale(1.0)" class="preset-btn">100%</button>
              <button @click="setImageScale(1.15)" class="preset-btn">115%</button>
              <button @click="setImageScale(1.5)" class="preset-btn">150%</button>
              <button @click="setImageScale(2.0)" class="preset-btn">200%</button>
            </div>
          </div>

          <!-- Image Editing Controls -->
          <div class="flip-controls-section">
            <button @click="flipImage" class="flip-image-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Flip</span>
            </button>
            
            <button @click="retouchImage" class="retouch-image-btn" :disabled="!selectedSVGImage">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Crop</span>
            </button>
          </div>
        </div>

          <!-- Background Removal Processing Indicator -->
          <div v-if="isRemovingBackground" class="processing-indicator">
            <div class="processing-content">
              <ion-spinner name="crescent" class="processing-spinner"></ion-spinner>
              <div class="processing-text">
                <p class="processing-title">Removing background...</p>
                <p class="processing-progress">{{ backgroundRemovalProgress }}%</p>
              </div>
              <button @click="cancelBackgroundRemoval" class="cancel-btn">Cancel</button>
            </div>
          </div>

          <!-- Background Removal Error -->
          <div v-if="backgroundRemovalError" class="background-removal-error">
            <div class="error-content">
              <svg class="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="error-text">
                <p class="error-title">Background removal failed</p>
                <p class="error-message">{{ backgroundRemovalError }}</p>
                <p class="error-hint">Using original image instead.</p>
              </div>
              <button @click="backgroundRemovalError = null" class="error-close-btn">×</button>
            </div>
          </div>

          <!-- Drag & Drop Zone Removed -->

          <!-- Error Message -->
          <div v-if="svgImageManager.uploadError.value" class="upload-error">
            {{ svgImageManager.uploadError.value }}
          </div>

          <!-- Export Button -->
          <div v-if="svgImageManager.images.value.length > 0 || formData.description" class="export-section wedding-controls-row">
            <button 
              @click="exportWeddingSticker('png')" 
              class="export-btn export-png-btn wedding-control-btn secondary"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download as PNG (300 DPI)
            </button>
          </div>
        </div>
      </div>

      <!-- Graduation Sticker Preview (shown when graduation category is selected) -->
      <div v-if="selectedCategory === 'graduation'" class="graduation-preview-section">
        <label class="form-label">Live Preview (Advanced Canvas Mode)</label>
        <div class="canvas-container-wrapper">
          <div class="graduation-preview-container" ref="graduationStageContainer">
            <!-- Konva Stage will be loaded here -->
          </div>
          <div class="canvas-controls">
            <p class="control-hint">✨ Drag text and elements to reposition them!</p>
          </div>
        </div>
      </div>

      <!-- Options Removed -->

      <!-- Hidden file input for chat upload -->
      <input
        ref="preGeneratedImageInput"
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        class="hidden"
        @change="handlePreGeneratedImageSelect"
      />
      </div>
    </div>
    </Transition>

    <!-- PREVIEW VIEW -->
    <Transition name="fade">
      <div v-if="viewMode === 'preview'" class="preview-view">
        <!-- Preview Header -->
        <div class="preview-header">
          <button @click="backToForm" class="back-to-form-btn">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span class="ml-2">Edit Design</span>
          </button>
          <h2 class="preview-title">Your Sticker Design</h2>
          <div class="preview-actions">
            <button class="action-btn">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Preview Content -->
        <div class="preview-content">
          <!-- Loading Animation -->
          <div v-if="isGenerating" class="loading-container">
            <Vue3Lottie
              :animationData="loadingAnimation"
              :height="300"
              :width="300"
            />
            <p class="loading-text">Creating your amazing sticker design...</p>
            <p class="loading-subtext">This will only take a moment</p>
          </div>

          <!-- Generated Preview -->
          <div v-else-if="previewUrl" class="preview-result">
            <div class="preview-image-container">
              <img :src="previewUrl" alt="Sticker Preview" class="generated-image" />
            </div>
            <div class="preview-info">
              <h3 class="preview-info-title">Design Details</h3>
              <div class="preview-info-item">
                <span class="info-label">Category:</span>
                <span class="info-value">{{ getCategoryName(selectedCategory) }}</span>
              </div>
              <div class="preview-info-item">
                <span class="info-label">Size:</span>
                <span class="info-value">{{ formData.customSize }}</span>
              </div>
              <div class="preview-info-item">
                <span class="info-label">Background:</span>
                <span class="info-value">{{ formData.removeBackground ? 'Removed' : 'Included' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Image Crop Modal -->
    <ImageCropModal
      :is-open="showCropModal"
      :image-src="cropImageSrc"
      :image-file="cropImageFile || undefined"
      @close="handleCropModalClose"
      @crop="handleCropComplete"
    />

    <!-- Beautiful Upload Modal -->
    <div v-if="showUploadModal" class="upload-modal-overlay" @click="closeUploadModal">
      <div class="upload-modal-container" @click.stop>
        <button class="upload-modal-close" @click="closeUploadModal">
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div class="upload-modal-content">
          <!-- Icon -->
          <div class="upload-modal-icon">
            <svg class="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          <!-- Title -->
          <h2 class="upload-modal-title">Upload Your Picture</h2>
          <p class="upload-modal-description">
            Upload a photo for your wedding sticker.
          </p>

          <!-- Background Removal Toggle in Modal -->
          <div class="background-removal-toggle" style="margin-bottom: 20px; background: #f3f4f6; padding: 12px; border-radius: 8px;">
            <label class="toggle-label" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
              <input
                type="checkbox"
                v-model="autoRemoveBackground"
                class="toggle-checkbox"
                style="width: 18px; height: 18px;"
              />
              <span class="toggle-text" style="font-weight: 500; color: #374151;">Remove background automatically</span>
            </label>
            <p class="toggle-hint" style="margin-top: 4px; margin-left: 28px; font-size: 0.85rem; color: #6b7280;">Uses AI to remove backgrounds (may take a few seconds)</p>
          </div>

          <!-- Background Removal Status -->
          <div v-if="uploadModalProcessing" class="upload-modal-processing">
            <div class="processing-spinner-wrapper">
              <ion-spinner name="crescent" class="processing-spinner-large"></ion-spinner>
            </div>
            <p class="processing-status-text">{{ uploadModalStatusText }}</p>
            <div class="processing-progress-bar">
              <div class="processing-progress-fill" :style="{ width: uploadModalProgress + '%' }"></div>
            </div>
            <p class="processing-progress-text">{{ uploadModalProgress }}%</p>
          </div>

          <!-- Upload Button -->
          <div v-if="!uploadModalProcessing" class="upload-modal-actions">
            <button class="upload-modal-btn" @click="triggerModalFileInput">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose Photo
            </button>
            <input
              ref="modalFileInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              class="hidden"
              @change="handleModalFileSelect"
            />
          </div>

          <!-- Success Message -->
          <div v-if="uploadModalSuccess" class="upload-modal-success">
            <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>Image uploaded successfully!</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Description Modal -->
    <div v-if="showEditModal" class="edit-modal-overlay">
      <div class="edit-modal-container">
        <h3 class="edit-modal-title">Edit Description</h3>
        <p class="edit-modal-subtitle">Update your text below and click OK to refresh the design.</p>
        
        <div class="edit-modal-content">
          <textarea
            v-model="formData.description"
            @input="handleDescriptionInput"
            class="edit-modal-textarea"
            rows="6"
            placeholder="Enter sticker description..."
          ></textarea>
          
          <!-- Validation Warnings in Modal -->
          <div v-if="validationWarnings.length > 0" class="validation-warnings-container modal-warnings">
            <div class="warning-header">
              <svg class="w-5 h-5 text-amber-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span class="text-amber-800 font-medium">Please check:</span>
            </div>
            <ul class="warning-list">
              <li v-for="(warning, index) in validationWarnings" :key="index" class="warning-list-item">
                {{ warning }}
              </li>
            </ul>
          </div>
        </div>

        <div class="edit-modal-actions">
          <button @click="closeEditModal" class="edit-modal-ok-btn">
            OK
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- AI Chat Area - Footer -->
  <div v-if="selectedCategory === 'wedding'" class="ai-chat-footer">
    <!-- Action Buttons when SVG is shown -->
    <div v-if="showWeddingStickerPreview" class="chat-footer-actions">
      <button @click="openEditModal" class="footer-action-btn edit-btn">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
      <button @click="exportWeddingSticker('png')" class="footer-action-btn export-btn">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download
      </button>
    </div>

    <!-- Chat Input Container -->
    <div class="chat-input-container">
      <button @click="showUploadOptions = !showUploadOptions" class="chat-add-btn" :class="{ 'active': showUploadOptions }">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>
      
      <div class="chat-input-wrapper">
        <input 
          v-model="chatInputText"
          @keydown.enter="handleEnterKey"
          @paste="handlePaste"
          type="text" 
          :placeholder="showWeddingStickerPreview ? 'Ask me anything or make changes...' : 'What can I help with?'"
          class="chat-input"
        />
      </div>

      <button @click="toggleVoiceInput" class="chat-voice-btn">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      </button>

      <button @click="handleGenerateFromChat" class="chat-send-btn" :disabled="!chatInputText.trim()">
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" style="transform: rotate(0deg); margin-left: 2px;">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      </button>
    </div>

    <!-- Upload Options Popup -->
    <div v-if="showUploadOptions" class="upload-options-popup">
      <button @click="triggerImageUpload" class="upload-option-btn">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
        <span>Upload Picture</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAutoDesignStore } from '@/stores/autoDesign'
import { useAuthStore } from '@/stores/auth'
import { Vue3Lottie } from 'vue3-lottie'
import { useWeddingStickerUpdater } from '@/composables/useWeddingStickerUpdater'
import { useSVGImageManager } from '@/composables/useSVGImageManager'
import { useSVGExport } from '@/composables/useSVGExport'
import { useSVGTextReplacement } from '@/composables/useSVGTextReplacement'
import { useBackgroundRemoval } from '@/composables/useBackgroundRemoval'
import { useImageRetouch } from '@/composables/useImageRetouch'
import { SvgLayoutManager } from '@/services/svg-layout.service'
import { createGraduationTemplate } from '@/services/graduation-template.preset'
import Konva from 'konva'
import ImageCropModal from '@/components/ImageCropModal.vue'
import SmartCameraInput from './SmartCameraInput.vue'
import SmartTextarea from './SmartTextarea.vue'
import { IonSpinner } from '@ionic/vue'
import { useDebounceFn } from '@vueuse/core'

const router = useRouter()
const autoDesignStore = useAutoDesignStore()
const authStore = useAuthStore()
const { updateStickerText, getSVGElements, extractNames } = useWeddingStickerUpdater()
const { applyRetouch } = useImageRetouch()

// Validation Warnings
const validationWarnings = ref<string[]>([])

function updateValidationWarnings(data: any) {
  const warnings: string[] = []
  
  // Only show warnings if user has started typing (description is not empty)
  if (formData.description.trim()) {
    if (!data.date) {
      warnings.push('You did not include the date.')
    }
    if (!data.courtesy) {
      warnings.push('You did not include the courtesy.')
    }
    // Check names. 
    if (!data.name1 && !data.name2) {
      warnings.push('You did not include the name')
    }
  }
  
  validationWarnings.value = warnings
}

// SVG Image Management
const svgImageManager = useSVGImageManager({
  defaultX: 100,
  defaultY: 100,
  defaultWidth: 400,
  defaultHeight: 400
})

const { exportSVG } = useSVGExport()

// Retouch state
const isRetouching = ref(false)

// Toggle for image editing controls
const showImageControls = ref(false)

// Chat footer states
const showUploadOptions = ref(false)

// SVG Text Replacement (for Nikkah graphics)
const { handleReplacement, resetReplacement, restoreOriginalElements, replacementState } = useSVGTextReplacement()

// Background Removal
const {
  removeBackground,
  isProcessing: isRemovingBackground,
  progress: backgroundRemovalProgress,
  error: bgRemovalError,
  cancelProcessing: cancelBackgroundRemoval,
  isSupported: isBackgroundRemovalSupported
} = useBackgroundRemoval()

// Wedding sticker refs
const weddingPreviewContainer = ref<HTMLDivElement | null>(null)
// Note: chatPreviewContainer is an array because the ref is inside a v-for loop
const chatPreviewContainer = ref<HTMLDivElement[] | HTMLDivElement | null>(null)
const graduationStageContainer = ref<HTMLDivElement | null>(null)
const imageFileInput = ref<HTMLInputElement | null>(null)
let svgElements: ReturnType<typeof getSVGElements> | null = null
let graduationLayoutManager: SvgLayoutManager | null = null

const showMenu = ref(false)
const selectedCategory = ref<string | null>(null)
const lastFormScrollPosition = ref(0)
const previewUrl = ref('')
const isGenerating = ref(false)
const viewMode = ref<'form' | 'preview'>('form')

// Wedding warning banner state
const showWeddingStickerPreview = ref(false)
const isGeneratingPreview = ref(false)
const isDescriptionVisible = ref(true)
const showEditModal = ref(false)

function openEditModal() {
  showEditModal.value = true
}

function closeEditModal() {
  showEditModal.value = false
  // Ensure update is processed
  processDescriptionInput()
}

// Chat footer handlers
function triggerImageUpload() {
  showUploadOptions.value = false
  if (selectedCategory.value === 'wedding') {
    preGeneratedImageInput.value?.click()
  }
}

function toggleVoiceInput() {
  authStore.showNotification({
    title: 'Voice Input',
    message: 'Voice input feature coming soon!',
    type: 'info'
  })
}



// AI Chat handler
function handleChatClick() {
  authStore.showNotification({
    title: 'AI Assistant',
    message: 'Coming Soon! Our AI assistant will help you create amazing designs.',
    type: 'info'
  })
}

async function generateWeddingPreview() {
  if (!formData.description.trim()) {
    authStore.showNotification({
      title: 'Description Required',
      message: 'Please enter a description for your wedding sticker',
      type: 'info'
    })
    return
  }

  // Check requirements: Must have names OR a picture
  const { name1, name2 } = extractNames(formData.description)
  const hasNames = !!(name1 || name2)
  const hasPicture = !!preGeneratedImageFile.value

  if (!hasNames && !hasPicture) {
    authStore.showNotification({
      title: 'Missing Information',
      message: 'Please include at least a Name in the description or upload a Picture to generate the preview.',
      type: 'info'
    })
    
    // Ensure validation warnings are shown
    const data = await updateStickerText(formData.description, {} as any)
    updateValidationWarnings(data)
    
    return
  }

  isGeneratingPreview.value = true
  showWeddingStickerPreview.value = true // Ensure container exists in DOM (even if hidden)
  
  try {
    // Wait for DOM to create the container element
    await nextTick()
    await nextTick() // Double nextTick to ensure Vue has fully rendered the component
    
    // Artificial delay for "AI processing" feel - REMOVED
    // await new Promise(resolve => setTimeout(resolve, 2000))
    
    await loadWeddingStickerTemplate()
    
    // Process the description to update the SVG with names, date, courtesy
    await processDescriptionInput()

    // Apply custom size if specified (CRITICAL: This prevents stretching by adjusting viewBox)
    if (formData.customSize) {
       const sizeMatch = formData.customSize.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)/i)
       if (sizeMatch) {
          const w = parseFloat(sizeMatch[1])
          const h = parseFloat(sizeMatch[2])
          console.log(`📏 Applying initial size: ${w}x${h} inches`)
          
          // Ensure container is available before resizing
          if (weddingPreviewContainer.value) {
            await handleSizeChange(w, h)
          } else {
            console.warn('⚠️ weddingPreviewContainer not ready for initial resize, skipping.')
          }
       }
    }

    // Clear the input field now that we've processed the description
    formData.description = ''

    // Handle pre-uploaded image if exists
    if (preGeneratedImageFile.value) {
      await nextTick() // Ensure DOM is ready
      
      if (!weddingPreviewContainer.value) {
        console.error('❌ weddingPreviewContainer not available')
        return
      }
      
      const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
      if (svgElement) {
        let fileToProcess = preGeneratedImageFile.value

        // Remove background if requested
        if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
          try {
            const result = await removeBackground(fileToProcess, {
              quality: 'high',
              outputFormat: 'image/png',
              maxDimensions: 2048
            })
            
            fileToProcess = new File([result.blob], fileToProcess.name.replace(/\.[^/.]+$/, '.png'), {
              type: 'image/png',
              lastModified: Date.now()
            })
          } catch (error) {
            console.warn('Background removal failed, using original image', error)
          }
        }

        // Add image to SVG
        await svgImageManager.addImage(fileToProcess, svgElement)
        updateSVGWithImages()
      }
    }
    
    // Check for warnings to show appropriate notification
    if (validationWarnings.value.length > 0) {
      authStore.showNotification({
        title: 'Preview Generated',
        message: 'Preview ready, but some details are missing. Please check the warnings below.',
        type: 'info'
      })
    } else {
      // Only show success notification if it's the first generation
      // or if we are not in a "silent update" mode
      if (!showWeddingStickerPreview.value) {
        authStore.showNotification({
          title: 'Preview Generated',
          message: 'Your wedding sticker preview is ready!',
          type: 'success'
        })
      }
    }
    
    // Hide description field on success
    isDescriptionVisible.value = false
    
    // Add the preview message to the chat history
    chatMessages.value.push({
      id: Date.now(),
      text: '',
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'preview'
    })

    // Add guidance message
    chatMessages.value.push({
      id: Date.now() + 1,
      text: "Here is your design! If it doesn't look right, you can click 'Edit' to make changes manually.",
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    
    // Ensure SVG is visible and properly rendered
    await nextTick()
    await nextTick() // Double nextTick for chat container
    
    // Copy the SVG from main container to chat container
    // Note: chatPreviewContainer is an array because it's in a v-for loop
    if (weddingPreviewContainer.value) {
      const svgElement = weddingPreviewContainer.value.querySelector('svg')
      
      if (svgElement) {
        // Get the last preview container (the one we just added)
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        const targetContainer = previewContainers[previewContainers.length - 1]
        
        if (targetContainer) {
          // Clone the SVG and insert it into the chat preview
          const clonedSVG = svgElement.cloneNode(true) as SVGSVGElement
          targetContainer.innerHTML = ''
          targetContainer.appendChild(clonedSVG)
          
          console.log('✅ SVG successfully cloned to chat container')
          
          // Force a layout recalculation
          void targetContainer.offsetHeight
        } else {
          console.error('❌ Chat preview container not available in array')
        }
      } else {
        console.error('❌ SVG not found in weddingPreviewContainer')
        
        // Try to show a fallback in the last preview container
        const previewContainers = Array.isArray(chatPreviewContainer.value) 
          ? chatPreviewContainer.value 
          : (chatPreviewContainer.value ? [chatPreviewContainer.value] : [])
        
        const targetContainer = previewContainers[previewContainers.length - 1]
        
        if (targetContainer) {
          targetContainer.innerHTML = `
            <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="#fee"/>
              <text x="50%" y="45%" text-anchor="middle" font-size="16" fill="#c00">SVG Failed to Load</text>
              <text x="50%" y="55%" text-anchor="middle" font-size="12" fill="#666">Please try again</text>
            </svg>
          `
        }
      }
    } else {
      console.error('❌ weddingPreviewContainer not available')
    }
    
    // Scroll to bottom to show the generated SVG
    scrollToBottom()
    
  } catch (error) {
    console.error('Generation failed:', error)
    // Reset state on error so user can try again
    showWeddingStickerPreview.value = false
    
    authStore.showNotification({
      title: 'Generation Failed',
      message: 'Something went wrong. Please try again.',
      type: 'error'
    })
  } finally {
    isGeneratingPreview.value = false
    // Ensure final scroll after animation completes
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }
}

// Image crop modal state
const showCropModal = ref(false)
const cropImageSrc = ref('')
const cropImageFile = ref<File | null>(null)
const isPreGenerationCrop = ref(false)

// Upload modal state
const showUploadModal = ref(false)
const modalFileInput = ref<HTMLInputElement | null>(null)
const uploadModalProcessing = ref(false)
const uploadModalProgress = ref(0)
const uploadModalStatusText = ref('Preparing...')
const uploadModalSuccess = ref(false)

// Pre-generation image upload state
const preGeneratedImageFile = ref<File | null>(null)
const preGeneratedImagePreview = ref<string | null>(null)
const preGeneratedImageInput = ref<HTMLInputElement | null>(null)

// Enhanced Name Extraction Function
function extractNamesFromResponse(text: string): { name1: string | null; name2: string | null } {
  // Pattern 1: Name and Name or Name & Name
  const andPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:and|&)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/
  const andMatch = text.match(andPattern)
  
  if (andMatch) {
    return { name1: andMatch[1].trim(), name2: andMatch[2].trim() }
  }
  
  // Pattern 2: Two consecutive capitalized words (fallback)
  const twoNamesPattern = /\b([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/
  const twoNamesMatch = text.match(twoNamesPattern)
  
  if (twoNamesMatch) {
    return { name1: twoNamesMatch[1], name2: twoNamesMatch[2] }
  }
  
  // Pattern 3: Single capitalized name
  const singleNamePattern = /\b([A-Z][a-z]{2,})\b/
  const singleMatch = text.match(singleNamePattern)
  
  if (singleMatch) {
    return { name1: singleMatch[1], name2: null }
  }
  
  return { name1: null, name2: null }
}

// Extract date from text
function extractDateFromText(text: string): string | null {
  const datePatterns = [
    // Match dates like "5th January, 2023" or "5th January 2023" (with or without comma)
    /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[,\s]+\d{2,4}/i,
    // Match numeric dates like "12/25/2023" or "12-25-2023"
    /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/
  ]
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return null
}

// Extract courtesy from text
function extractCourtesyFromText(text: string): string | null {
  const courtesyPatterns = [
    // Match "courtesy: Name" or "from Name" or "by Name"
    // Capture from the keyword until end of text, but NOT including dates before it
    /(?:courtesy|from|by)[\s:]+([A-Za-z\s]+?)(?=\s*$|\n)/i,
  ]
  
  for (const pattern of courtesyPatterns) {
    const match = text.match(pattern)
    if (match) {
      // Return the full match including the keyword
      const fullMatch = match[0].trim()
      // Clean up - remove trailing punctuation or extra spaces
      return fullMatch.replace(/[,.]\s*$/, '').trim()
    }
  }
  return null
}

// Extract size from text
function extractSizeFromText(text: string): string | null {
  const sizeMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
  if (sizeMatch) {
    const width = parseFloat(sizeMatch[1])
    const height = parseFloat(sizeMatch[2])
    return `${width}x${height} in`
  }
  return null
}

// Track image uploads
function trackImageUpload(file: File) {
  const timestamp = Date.now()
  uploadedImages.value.push({ file, timestamp, used: false })
  lastUploadedImage.value = file
  
  console.log('📸 Image uploaded:', { total: uploadedImages.value.length, timestamp })
  
  // Handle multiple image uploads
  handleMultipleImageUploads()
}

// Handle multiple image uploads with AI confirmation
function handleMultipleImageUploads() {
  const unusedImages = uploadedImages.value.filter(img => !img.used)
  
  // Pre-generation: Multiple images uploaded
  if (!showWeddingStickerPreview.value && unusedImages.length > 1) {
    const firstImage = unusedImages[0]
    const latestImage = unusedImages[unusedImages.length - 1]
    const timeDiff = Math.round((latestImage.timestamp - firstImage.timestamp) / 1000)
    
    awaitingImageChoice.value = true
    
    const aiMessage = `I see you uploaded another picture (${timeDiff} seconds after the first one). Would you like me to use this new picture instead, or keep the first one?`
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiMessage,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
  
  // Post-generation: New image uploaded after design is created
  if (showWeddingStickerPreview.value && lastUploadedImage.value) {
    awaitingImageUpdateConfirmation.value = true
    pendingImageFile.value = lastUploadedImage.value
    
    const aiMessage = "I notice you uploaded a new picture. Would you like me to replace the current image in your design?"
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiMessage,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
  }
}

// Smart Camera Handler
function handleDescriptionUpdate(newText: string) {
  formData.description = newText
  // Trigger the input handler to update the preview immediately
  handleDescriptionInput()
}

// Background removal state
const autoRemoveBackground = ref(false)
const backgroundRemovalError = ref<string | null>(null)

// Lottie animation data for loading
const loadingAnimation = {
  "v": "5.7.4",
  "fr": 60,
  "ip": 0,
  "op": 180,
  "w": 500,
  "h": 500,
  "nm": "Design Loading",
  "ddd": 0,
  "assets": [],
  "layers": [
    {
      "ddd": 0,
      "ind": 1,
      "ty": 4,
      "nm": "Circle 1",
      "sr": 1,
      "ks": {
        "o": { "a": 0, "k": 100 },
        "r": {
          "a": 1,
          "k": [
            { "i": { "x": [0.833], "y": [0.833] }, "o": { "x": [0.167], "y": [0.167] }, "t": 0, "s": [0] },
            { "t": 180, "s": [360] }
          ]
        },
        "p": { "a": 0, "k": [250, 250, 0] },
        "a": { "a": 0, "k": [0, 0, 0] },
        "s": { "a": 0, "k": [100, 100, 100] }
      },
      "ao": 0,
      "shapes": [
        {
          "ty": "gr",
          "it": [
            {
              "d": 1,
              "ty": "el",
              "s": { "a": 0, "k": [200, 200] },
              "p": { "a": 0, "k": [0, 0] }
            },
            {
              "ty": "st",
              "c": { "a": 0, "k": [0.259, 0.714, 0.831, 1] },
              "o": { "a": 0, "k": 100 },
              "w": { "a": 0, "k": 8 }
            },
            {
              "ty": "tr",
              "p": { "a": 0, "k": [0, 0] },
              "a": { "a": 0, "k": [0, 0] },
              "s": { "a": 0, "k": [100, 100] },
              "r": { "a": 0, "k": 0 },
              "o": { "a": 0, "k": 100 }
            }
          ]
        }
      ]
    }
  ]
}

const categories = [
  { id: 'naming', name: 'Naming', icon: '👶', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'wedding', name: 'Wedding', icon: '💍', gradient: 'linear-gradient(135deg, #f093fb 0%, #a855f7 100%)' },
  { id: 'graduation', name: 'Graduation', icon: '🎓', gradient: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' },
  { id: 'association', name: 'Association', icon: '🤝', gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)' },
  { id: 'organization', name: 'Organization', icon: '🏢', gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' },
  { id: 'product-business-1', name: 'Product', icon: '🛍️', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' },
  { id: 'product-business-2', name: 'Business', icon: '💼', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' },
  { id: 'product-business-3', name: 'Promo', icon: '🏷️', gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }
]

const formData = reactive({
  description: '',
  removeBackground: false,
  useColorPicker: false,
  backgroundColor: '#ffffff',
  customSize: '4x4',
  svgWidth: 400,
  svgHeight: 400
})

// Separate chat input state to prevent real-time SVG updates during chat
const chatInputText = ref('')

// Chat Logic for Wedding Category
const chatMessages = ref<Array<{ id: number; text: string; sender: 'user' | 'ai'; time: string; image?: string; type?: 'text' | 'preview' }>>([])
const isAnalyzing = ref(false)
const isVoiceEnabled = ref(true) // Enabled by default

// Voice / TTS Logic
function toggleVoice() {
  isVoiceEnabled.value = !isVoiceEnabled.value
  if (isVoiceEnabled.value) {
    // Announce voice is on
    speakMessage("Voice guidance enabled. I will read my messages to you.")
  } else {
    window.speechSynthesis.cancel()
  }
}

function speakMessage(text: string) {
  if (!('speechSynthesis' in window)) return
  
  // Cancel any current speech
  window.speechSynthesis.cancel()
  
  const utterance = new SpeechSynthesisUtterance(text)
  // Try to find a good voice
  const voices = window.speechSynthesis.getVoices()
  // Prefer a female voice or a "Google US English" voice if available
  const preferredVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Female')) || voices[0]
  if (preferredVoice) utterance.voice = preferredVoice
  
  utterance.rate = 1.0
  utterance.pitch = 1.0
  
  window.speechSynthesis.speak(utterance)
}

// Initialize voice on mount
onMounted(() => {
  // Wait for voices to load
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      // Voices loaded
    }
  }
})

function showChatHelp() {
  const helpText = "Here's a quick guide: 1. Type your details or upload a picture. 2. Pinch with two fingers to resize images on mobile. 3. Use the voice icon to hear my responses."
  
  chatMessages.value.push({
    id: Date.now(),
    text: helpText,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

// Watch for new AI messages to speak them
watch(() => chatMessages.value.length, (newLen, oldLen) => {
  if (newLen > oldLen && isVoiceEnabled.value) {
    const lastMsg = chatMessages.value[newLen - 1]
    if (lastMsg.sender === 'ai') {
      speakMessage(lastMsg.text)
    }
  }
})

const chatHistoryContainer = ref<HTMLElement | null>(null)
const accumulatedDescription = ref('')
const awaitingPictureDecision = ref(false)
const awaitingSizeDecision = ref(false)
const pictureStepComplete = ref(false)
const sizeStepComplete = ref(false)
const awaitingBackgroundRemovalDecision = ref(false)
const awaitingImageUpdateConfirmation = ref(false)
const pendingImageFile = ref<File | null>(null)

// Enhanced AI state management
const awaitingNameInput = ref(false)
const awaitingImageChoice = ref(false)
const uploadedImages = ref<Array<{ file: File; timestamp: number; used: boolean }>>([])
const lastUploadedImage = ref<File | null>(null)
const nameExtractionAttempts = ref(0)

// Track extracted information to prevent re-asking
const extractedInfo = ref({
  date: null as string | null,
  courtesy: null as string | null,
  size: null as string | null,
  names: { name1: null as string | null, name2: null as string | null }
})

// State for smart updates (post-generation)
const awaitingDateChange = ref(false)
const awaitingCourtesyChange = ref(false)
const pendingDateUpdate = ref<string | null>(null)
const pendingCourtesyUpdate = ref<string | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (chatHistoryContainer.value) {
      chatHistoryContainer.value.scrollTop = chatHistoryContainer.value.scrollHeight
    }
  })
}

async function sendMessage() {
  const text = chatInputText.value.trim()
  if (!text) return

  // Add User Message
  chatMessages.value.push({
    id: Date.now(),
    text: text,
    sender: 'user',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })

  // Accumulate description ONLY if we haven't generated the preview yet
  // This ensures that after generation, chat messages don't accidentally become part of the sticker text
  if (!showWeddingStickerPreview.value) {
    accumulatedDescription.value += (accumulatedDescription.value ? ' ' : '') + text
    
    // Extract and store date, courtesy, and size from the message
    const extractedDate = extractDateFromText(text)
    const extractedCourtesy = extractCourtesyFromText(text)
    const extractedSize = extractSizeFromText(text)
    
    if (extractedDate && !extractedInfo.value.date) {
      extractedInfo.value.date = extractedDate
    }
    if (extractedCourtesy && !extractedInfo.value.courtesy) {
      extractedInfo.value.courtesy = extractedCourtesy
    }
    if (extractedSize && !extractedInfo.value.size) {
      extractedInfo.value.size = extractedSize
      formData.customSize = extractedSize
    }
  } else {
    // After preview is shown, messages are chat-only and don't update the SVG
    console.log('📝 Preview already shown, message is chat-only:', text)
  }

  // Clear Input
  chatInputText.value = ''
  scrollToBottom()

  // Start Analysis
  isAnalyzing.value = true
  
  // Simulate AI Delay
  setTimeout(() => {
    analyzeMessage(text)
  }, 1500)
}

async function handleSizeChange(widthInches: number, heightInches: number) {
  console.log(`📏 Resizing to ${widthInches}x${heightInches} inches`)
  
  if (!weddingPreviewContainer.value) {
    console.error('❌ weddingPreviewContainer not available for resize')
    return
  }
  
  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    console.error('❌ SVG element not found for resize')
    return
  }

  // Get current viewBox dimensions BEFORE changes
  let viewBox = svgElement.getAttribute('viewBox')?.split(/\s+|,/).map(Number)
  
  // Fallback if viewBox is missing or invalid
  if (!viewBox || viewBox.length !== 4 || viewBox.some(isNaN)) {
    const w = parseFloat(svgElement.getAttribute('width') || '400')
    const h = parseFloat(svgElement.getAttribute('height') || '400')
    viewBox = [0, 0, w || 400, h || 400]
  }
  
  const oldViewBoxHeight = viewBox[3]
  const currentViewBoxWidth = viewBox[2]

  // 1. Store physical size for export
  svgElement.setAttribute('data-export-width', `${widthInches}in`)
  svgElement.setAttribute('data-export-height', `${heightInches}in`)
  
  // 2. Calculate new ViewBox height
  // We keep the ViewBox width constant to ensure "width doesn't change" relative to the design scale
  const newViewBoxHeight = currentViewBoxWidth * (heightInches / widthInches)
  
  if (isNaN(newViewBoxHeight) || newViewBoxHeight <= 0) {
      console.error('Invalid new viewBox height calculated')
      return
  }

  // 3. Update ViewBox
  svgElement.setAttribute('viewBox', `${viewBox[0]} ${viewBox[1]} ${currentViewBoxWidth} ${newViewBoxHeight}`)
  
  // 4. Ensure Responsive Display
  // Set width to 100% to fill container, remove fixed height to let viewBox aspect ratio take over
  svgElement.setAttribute('width', '100%')
  svgElement.removeAttribute('height')
  svgElement.style.width = '100%'
  svgElement.style.height = 'auto'
  svgElement.style.display = 'block'

  // 5. Adjust Internal Layout
  const heightDiff = newViewBoxHeight - oldViewBoxHeight
  
  console.log(`📏 Height Diff: ${heightDiff} (Old: ${oldViewBoxHeight}, New: ${newViewBoxHeight})`)

  // A. Adjust Background Rects
  const rects = svgElement.querySelectorAll('rect')
  rects.forEach(rect => {
    // Update background rects to fill new height
    const rectW = parseFloat(rect.getAttribute('width') || '0')
    
    if (rect.getAttribute('width') === '100%' || Math.abs(rectW - currentViewBoxWidth) < 1) {
       rect.setAttribute('height', String(newViewBoxHeight)) 
    }
  })

  // B. Adjust Image Height
  const images = svgElement.querySelectorAll('image')
  images.forEach(img => {
      const currentH = parseFloat(img.getAttribute('height') || '0')
      if (currentH > 0) {
          // Only resize if it looks like a main image (significant size)
          if (currentH > 50) { 
              img.setAttribute('height', String(currentH + heightDiff))
              // Ensure it fills the space
              if (!img.hasAttribute('preserveAspectRatio')) {
                  img.setAttribute('preserveAspectRatio', 'xMidYMid slice')
              }
          }
      }
  })
  
  // Force refresh
  await nextTick()
}

async function analyzeMessage(lastUserMessage: string) {
  isAnalyzing.value = false
  
  const fullText = accumulatedDescription.value
  const lowerMessage = lastUserMessage.toLowerCase()
  const userName = authStore.user?.name || authStore.user?.email?.split('@')[0] || 'there'
  
  let aiResponse = ''
  
  // Priority 1: Handle Image Choice (Multiple Uploads)
  if (awaitingImageChoice.value) {
    const wantsNew = lowerMessage.includes('new') || lowerMessage.includes('latest') || lowerMessage.includes('second') || lowerMessage.includes('yes')
    const wantsFirst = lowerMessage.includes('first') || lowerMessage.includes('original') || lowerMessage.includes('no')
    
    if (wantsNew && lastUploadedImage.value) {
      preGeneratedImageFile.value = lastUploadedImage.value
      uploadedImages.value.forEach(img => img.used = false)
      const lastIndex = uploadedImages.value.length - 1
      if (lastIndex >= 0) uploadedImages.value[lastIndex].used = true
      
      aiResponse = "Perfect! I'll use the new picture you just uploaded."
    } else if (wantsFirst && uploadedImages.value.length > 0) {
      preGeneratedImageFile.value = uploadedImages.value[0].file
      uploadedImages.value[0].used = true
      
      aiResponse = "Got it! I'll use the first picture you uploaded."
    } else {
      aiResponse = "Please say 'new' to use the latest picture, or 'first' to use the original one."
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
    
    awaitingImageChoice.value = false
    pictureStepComplete.value = true
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    
    // Check if we have all info to proceed
    const hasDate = /\d{1,2}(?:st|nd|rd|th)?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)|\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/i.test(fullText)
    const hasCourtesy = /(?:courtesy|from|by)/i.test(fullText)
    const hasNames = /(?:and|&)/i.test(fullText) || extractNamesFromResponse(fullText).name1
    
    if (hasNames && hasDate && hasCourtesy) {
      // Proceed to size or generation
      if (!sizeStepComplete.value) {
        setTimeout(() => {
          aiResponse = `One last thing! What size would you like the sticker to be? (e.g., say '3x3' for inches, or 'default' for 4x4)`
          awaitingSizeDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        }, 500)
      }
    }
    return
  }
  
  // Priority 2: Handle Date Change Confirmation (Post-Generation)
  if (awaitingDateChange.value) {
    if (lowerMessage.includes('yes') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      if (pendingDateUpdate.value) {
        // Update the accumulated description
        const oldDate = extractedInfo.value.date
        if (oldDate) {
          accumulatedDescription.value = accumulatedDescription.value.replace(oldDate, pendingDateUpdate.value)
        } else {
          accumulatedDescription.value += ' ' + pendingDateUpdate.value
        }
        
        extractedInfo.value.date = pendingDateUpdate.value
        formData.description = accumulatedDescription.value
        
        // Update the SVG without regenerating
        await processDescriptionInput()
        
        aiResponse = `Date updated to ${pendingDateUpdate.value}!`
      }
    } else {
      aiResponse = "Okay, keeping the original date."
    }
    
    awaitingDateChange.value = false
    pendingDateUpdate.value = null
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }
  
  // Priority 3: Handle Courtesy Change Confirmation (Post-Generation)
  if (awaitingCourtesyChange.value) {
    if (lowerMessage.includes('yes') || lowerMessage.includes('change') || lowerMessage.includes('update')) {
      if (pendingCourtesyUpdate.value) {
        // Update the accumulated description
        const oldCourtesy = extractedInfo.value.courtesy
        if (oldCourtesy) {
          accumulatedDescription.value = accumulatedDescription.value.replace(oldCourtesy, pendingCourtesyUpdate.value)
        } else {
          accumulatedDescription.value += ' ' + pendingCourtesyUpdate.value
        }
        
        extractedInfo.value.courtesy = pendingCourtesyUpdate.value
        formData.description = accumulatedDescription.value
        
        // Update the SVG without regenerating
        await processDescriptionInput()
        
        aiResponse = `Courtesy message updated!`
      }
    } else {
      aiResponse = "Okay, keeping the original courtesy message."
    }
    
    awaitingCourtesyChange.value = false
    pendingCourtesyUpdate.value = null
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }
  
  // Priority 4: Handle Name Input (After AI asks for name)
  if (awaitingNameInput.value) {
    const extracted = extractNamesFromResponse(lastUserMessage)
    const extractedDate = extractDateFromText(lastUserMessage)
    const extractedCourtesy = extractCourtesyFromText(lastUserMessage)
    
    if (extracted.name1) {
      // Build the description with extracted info
      const descriptionParts: string[] = []
      
      if (extracted.name2) {
        descriptionParts.push(`${extracted.name1} and ${extracted.name2}`)
        aiResponse = `Great! I have ${extracted.name1} and ${extracted.name2}.`
      } else {
        descriptionParts.push(extracted.name1)
        aiResponse = `Got it! I have ${extracted.name1}.`
      }
      
      if (extractedDate) {
        descriptionParts.push(extractedDate)
        aiResponse += ` Date: ${extractedDate}.`
      }
      
      if (extractedCourtesy) {
        descriptionParts.push(extractedCourtesy)
        aiResponse += ` ${extractedCourtesy}.`
      }
      
      // Update accumulated description
      accumulatedDescription.value += (accumulatedDescription.value ? ' ' : '') + descriptionParts.join(' ')
      
      // Store extracted info
      extractedInfo.value.names = extracted
      if (extractedDate) extractedInfo.value.date = extractedDate
      if (extractedCourtesy) extractedInfo.value.courtesy = extractedCourtesy
      
      // Check for size in the message
      const extractedSize = extractSizeFromText(lastUserMessage)
      if (extractedSize) {
        extractedInfo.value.size = extractedSize
        formData.customSize = extractedSize
      }
      
      awaitingNameInput.value = false
      nameExtractionAttempts.value = 0
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      
      // Check what info we still need based on extractedInfo (not fullText)
      const needsDate = !extractedInfo.value.date
      const needsCourtesy = !extractedInfo.value.courtesy
      
      if (needsDate || needsCourtesy) {
        // We still need date or courtesy
        setTimeout(() => {
          const missing: string[] = []
          if (needsDate) missing.push('the date')
          if (needsCourtesy) missing.push('courtesy message (who it\'s from)')
          
          aiResponse = `I'm listening. Please also tell me ${missing.join(' and ')}.`
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        }, 800)
      } else {
        // Has everything (names, date, courtesy), ask about picture
        setTimeout(() => {
          if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
            aiResponse = `Perfect! Do you have a picture you'd like to use in your design?`
            awaitingPictureDecision.value = true
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
          } else {
            // Has picture too, ask about size or proceed
            pictureStepComplete.value = true
            if (!extractedInfo.value.size && !sizeStepComplete.value) {
              aiResponse = `One last thing! What size would you like the sticker to be? (e.g., say '3x3' for inches, or 'default' for 4x4)`
              awaitingSizeDecision.value = true
              chatMessages.value.push({
                id: Date.now(),
                text: aiResponse,
                sender: 'ai',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              })
              scrollToBottom()
            } else {
              // Has everything including size, generate!
              formData.description = accumulatedDescription.value
              setTimeout(() => generateWeddingPreview(), 1000)
            }
          }
        }, 800)
      }
      return
    } else {
      // Failed to extract name
      nameExtractionAttempts.value++
      
      if (nameExtractionAttempts.value >= 2) {
        aiResponse = "I'm having trouble finding the names. Please use a format like: 'John and Mary' or 'Sarah & Ahmed'"
      } else {
        aiResponse = "I didn't catch the name(s). Could you please provide them? For example: 'John and Mary'"
      }
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
  }
  
  // Handle Image Update Confirmation (Post-Generation)
  if (awaitingImageUpdateConfirmation.value) {
    if (lowerMessage === 'yes' || lowerMessage.includes('yes please') || lowerMessage.includes('sure') || lowerMessage.includes('ok')) {
       aiResponse = "Great! Updating your sticker with the new image..."
       
       // Apply the image
       if (pendingImageFile.value && weddingPreviewContainer.value) {
          const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
          if (svgElement) {
             await svgImageManager.addImage(pendingImageFile.value, svgElement)
             updateSVGWithImages()
          }
       }
       pendingImageFile.value = null
    } else {
       aiResponse = "Okay, I'll ignore that image."
       pendingImageFile.value = null
    }
    awaitingImageUpdateConfirmation.value = false
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    return
  }

  // Handle Background Removal Decision
  if (awaitingBackgroundRemovalDecision.value) {
    if (lowerMessage === 'yes' || lowerMessage.includes('yes please') || lowerMessage.includes('remove')) {
      autoRemoveBackground.value = true
      aiResponse = "Got it! I'll remove the background for you."
    } else {
      autoRemoveBackground.value = false
      aiResponse = "Okay, I'll keep the original background."
    }
    
    awaitingBackgroundRemovalDecision.value = false
    
    // Set the pending image as the one to be used
    if (pendingImageFile.value) {
      preGeneratedImageFile.value = pendingImageFile.value
      pendingImageFile.value = null
    }
    
    // Mark picture step as complete if we have an image now
    if (preGeneratedImageFile.value) {
      pictureStepComplete.value = true
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    
    // Check if we have enough info to proceed using extractedInfo
    const hasDate = extractedInfo.value.date !== null
    const hasCourtesy = extractedInfo.value.courtesy !== null
    const hasNames = extractedInfo.value.names.name1 !== null

    if (!hasDate || !hasCourtesy || !hasNames) {
       // We are missing info, so we should ask for it now instead of falling through
       // because falling through might trigger the generic "no" handler if user said "no" to background
       
       const missingFields: string[] = []
       if (!hasNames) missingFields.push('the couple\'s names')
       if (!hasDate) missingFields.push('the date')
       if (!hasCourtesy) missingFields.push('who it is from (courtesy)')
       
       setTimeout(() => {
          const followUp = `Now, please tell me ${missingFields.join(', ')}.`
          chatMessages.value.push({
            id: Date.now(),
            text: followUp,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
       }, 500)
       return
    }
    
    // If we have everything, fall through to the "Complete details" check which will trigger generation
  }

  // Check for required fields ONLY if preview hasn't been generated yet
  // After generation, all messages are just chat responses
  if (showWeddingStickerPreview.value) {
    // Check if user is trying to change date or courtesy
    const newDate = extractDateFromText(lastUserMessage)
    const newCourtesy = extractCourtesyFromText(lastUserMessage)
    
    if (newDate && newDate !== extractedInfo.value.date) {
      // User typed a new date
      pendingDateUpdate.value = newDate
      awaitingDateChange.value = true
      aiResponse = `I see you mentioned a new date: ${newDate}. Would you like me to update the date in your design?`
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
    
    if (newCourtesy && newCourtesy !== extractedInfo.value.courtesy) {
      // User typed a new courtesy
      pendingCourtesyUpdate.value = newCourtesy
      awaitingCourtesyChange.value = true
      aiResponse = `I see you mentioned: "${newCourtesy}". Would you like me to update the courtesy message in your design?`
      
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
      return
    }
    
    // Preview is already shown - handle as chat message only
    // Provide contextual AI response based on message content
    let aiResponse = ''
    
    if (lowerMessage.includes('change') || lowerMessage.includes('update') || lowerMessage.includes('edit')) {
      aiResponse = 'To make changes, you can use the Edit button below the design, or just tell me what you\'d like to change (date, courtesy, etc.).'
    } else if (lowerMessage.includes('download') || lowerMessage.includes('save')) {
      aiResponse = 'You can download your design using the Download button below the preview. It\'s available in SVG and PNG formats!'
    } else if (lowerMessage.includes('thank') || lowerMessage.includes('great') || lowerMessage.includes('perfect')) {
      aiResponse = 'You\'re welcome! I\'m glad you like it. Let me know if you need any adjustments! 😊'
    } else {
      aiResponse = 'Your design is ready! You can edit it, download it, or start a new design. How can I help you further?'
    }
    
    chatMessages.value.push({
      id: Date.now(),
      text: aiResponse,
      sender: 'ai',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })
    scrollToBottom()
    isAnalyzing.value = false
    return
  }
  
  // Check what we have so far using extractedInfo
  const hasNames = extractedInfo.value.names.name1 !== null
  const hasDate = extractedInfo.value.date !== null
  const hasCourtesy = extractedInfo.value.courtesy !== null
  
  // 1. Check for COMPLETE details first
  if (hasNames && hasDate && hasCourtesy) {
    // Step 1: Handle Picture Decision
    // Check if we already have a picture uploaded (via UI or previous chat)
    if (preGeneratedImageFile.value) {
      pictureStepComplete.value = true
    }

    if (!pictureStepComplete.value) {
      if (awaitingPictureDecision.value) {
        const hasYes = lowerMessage.includes('yes') || lowerMessage.includes('yeah') || lowerMessage.includes('sure') || lowerMessage.includes('yep')
        const hasNo = lowerMessage.includes('no') || lowerMessage.includes('nope') || lowerMessage.includes('not')
        
        if (hasYes) {
          aiResponse = `Great! Please upload your picture using the image upload button.`
          awaitingPictureDecision.value = false
          // We don't set pictureStepComplete to true here because we want them to actually upload it
          // But we can set a flag to remind them if they try to proceed without it
          
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else if (hasNo) {
          aiResponse = `No problem! We'll proceed without a picture.`
          awaitingPictureDecision.value = false
          pictureStepComplete.value = true
          
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          
          // Fall through to next step (Size)
        } else {
          // Unclear response
          aiResponse = "Please answer Yes or No. Do you have a picture you'd like to use?"
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
      } else {
        // Ask about picture if not already asked
        if (!showWeddingStickerPreview.value) {
          aiResponse = `Perfect, ${userName}! All details confirmed. Do you have any picture you'd like to use in your design?`
          awaitingPictureDecision.value = true
          
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
      }
    }

    // Step 2: Handle Size Decision (skip if already provided)
    if (pictureStepComplete.value && !sizeStepComplete.value) {
      // Check if size was already provided
      if (extractedInfo.value.size) {
        formData.customSize = extractedInfo.value.size
        sizeStepComplete.value = true
        // Don't ask, just proceed to generation
        aiResponse = `Generating your wedding design now...`
        
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        
        formData.description = fullText
        setTimeout(() => {
          generateWeddingPreview()
        }, 1000)
        return
      }
      
      if (awaitingSizeDecision.value) {
        // Check for size in message
        const sizeMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
        const isDefault = lowerMessage.includes('default') || lowerMessage.includes('standard') || lowerMessage.includes('normal')
        
        if (sizeMatch) {
           const width = parseFloat(sizeMatch[1])
           const height = parseFloat(sizeMatch[2])
           formData.customSize = `${width}x${height} in`
           aiResponse = `Got it! Setting size to ${width}x${height} inches.`
           awaitingSizeDecision.value = false
           sizeStepComplete.value = true
        } else if (isDefault) {
           formData.customSize = '4x4'
           aiResponse = `Okay, using the default 4x4 inch size.`
           awaitingSizeDecision.value = false
           sizeStepComplete.value = true
        } else {
           aiResponse = "Please specify a size (e.g., '3x3') or say 'default' for 4x4 inches."
           chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
        
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        
        // Fall through to Generation
      } else {
        // Ask about size
        aiResponse = `One last thing! What size would you like the sticker to be? (e.g., say '3x3' for inches, or 'default' for 4x4)`
        awaitingSizeDecision.value = true
        
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      }
    }
    
    // If we're here, all steps are complete. Proceed with generation.
    aiResponse = `Generating your wedding design now...`
    
    // Only add the message if we haven't generated yet
    if (!showWeddingStickerPreview.value) {
      chatMessages.value.push({
        id: Date.now(),
        text: aiResponse,
        sender: 'ai',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })
      scrollToBottom()
    }

    // Trigger Generation
    // Set the full description back to formData so the generator uses it
    formData.description = fullText 
    
    setTimeout(() => {
      generateWeddingPreview()
    }, 1000)
    return
  }

  // 2. Check for Greetings & Questions
  const greetings = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'hola', 'bonjour', 'salam', 'assalamu alaikum', 'namaste']
  const isGreeting = greetings.some(g => lowerMessage.includes(g))
  
  const isQuestion = lowerMessage.includes('?') || 
                     lowerMessage.includes('how') || 
                     lowerMessage.includes('what') || 
                     lowerMessage.includes('help') ||
                     lowerMessage.includes('guide') ||
                     lowerMessage.includes('update') ||
                     lowerMessage.includes('change') ||
                     lowerMessage.includes('yes') ||
                     lowerMessage.includes('no') ||
                     lowerMessage.includes('can you') ||
                     lowerMessage.includes('could you') ||
                     lowerMessage.includes('would you')

  const hasAnyInfo = hasNames || hasDate || hasCourtesy

  // Check for "continue" or "skip" commands to proceed with partial info
  if ((lowerMessage.includes('continue') || lowerMessage.includes('skip') || lowerMessage.includes('proceed')) && !showWeddingStickerPreview.value) {
    if (extractedInfo.value.names.name1) {
      // Has at least a name, can proceed
      if (!pictureStepComplete.value && !preGeneratedImageFile.value) {
        aiResponse = `Alright! Do you have a picture you'd like to use in your design?`
        awaitingPictureDecision.value = true
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
      } else {
        // Proceed to generation
        formData.description = fullText
        setTimeout(() => generateWeddingPreview(), 1000)
        return
      }
    }
  }

  // Check for size change request
  const sizeMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:x|by)\s*(\d+(?:\.\d+)?)(?:\s*(?:inch|inches|in))?/i)
  if (sizeMatch) {
     const width = parseFloat(sizeMatch[1])
     const height = parseFloat(sizeMatch[2])
     
     if (!isNaN(width) && !isNaN(height)) {
        formData.customSize = `${width}x${height} in`
        
        if (showWeddingStickerPreview.value) {
           await handleSizeChange(width, height)
           aiResponse = `I've resized your design to ${width} x ${height} inches.`
        } else {
           aiResponse = `Got it! I'll make the design ${width} x ${height} inches. What else?`
        }
        
        chatMessages.value.push({
          id: Date.now(),
          text: aiResponse,
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        return
     }
  }

  // Check for specific questions and requests
  if (lowerMessage.includes('color') || lowerMessage.includes('colour')) {
    aiResponse = "I can customize the colors! Just tell me which colors you'd like, and I'll apply them to your design."
  } else if (lowerMessage.includes('size') || lowerMessage.includes('dimension')) {
    aiResponse = "The sticker size can be adjusted! Just let me know what dimensions you need (e.g., '5x5 inches' or '400x400 pixels')."
  } else if (lowerMessage.includes('example') || lowerMessage.includes('sample')) {
    aiResponse = "Sure! Here's an example: 'Sarah & Michael, 20th June 2025, courtesy: Johnson Family'. Now, tell me your details!"
  } else if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('pay')) {
    aiResponse = "I'm here to help you design! For pricing information, please check with the team. Meanwhile, let's create your perfect sticker!"
  } else if (lowerMessage.includes('download') || lowerMessage.includes('save')) {
    aiResponse = "Once your design is ready, you'll see an 'Export' button at the bottom to download your sticker in high quality!"
  } else if (lowerMessage.includes('redo') || lowerMessage.includes('start over') || lowerMessage.includes('again')) {
    // Reset state for new generation
    showWeddingStickerPreview.value = false
    accumulatedDescription.value = ''
    formData.description = ''
    svgImageManager.clearAllImages()
    preGeneratedImageFile.value = null
    pendingImageFile.value = null
    pictureStepComplete.value = false
    sizeStepComplete.value = false
    awaitingPictureDecision.value = false
    awaitingSizeDecision.value = false
    
    aiResponse = "No problem! Just provide the new details, and I'll create a fresh design for you."
  } else if (lowerMessage.includes('thank')) {
    aiResponse = "You're very welcome! 😊 Happy to help make your special day even more memorable."
  } else if (isQuestion) {
     if (lowerMessage.includes('how')) {
        aiResponse = "It's simple! Just tell me the couple's names (e.g., 'Romeo & Juliet'), the wedding date, and who the sticker is from (courtesy)."
     } else if (lowerMessage.includes('what')) {
        aiResponse = "I need three things to design your sticker: 1. The couple's names. 2. The date. 3. The courtesy (e.g., 'From the Smith Family')."
     } else if (lowerMessage.includes('update') || lowerMessage.includes('change')) {
        // If we have a preview, update it directly
        if (showWeddingStickerPreview.value) {
          aiResponse = "I'm updating your design with the changes..."
          
          // Update the description with the new text (assuming user typed the change)
          // We might need to be smarter here about merging, but for now let's assume they typed the correction
          // Or we can just trigger a re-process of the current accumulated description + new message
          
          // Actually, if they say "change date to X", we should probably parse that.
          // For simplicity, let's just re-run the processDescriptionInput with the accumulated text
          
          setTimeout(() => {
            processDescriptionInput()
          }, 500)
        } else {
          aiResponse = "You can update the information by simply typing the new details here. I will update the design automatically once I have everything."
        }
     } else if (lowerMessage === 'yes' || lowerMessage.includes('yes please')) {
        // Handle confirmation for image update or general adjustments
        if (showWeddingStickerPreview.value) {
           aiResponse = "Great! I'm updating your design now..."
           setTimeout(() => {
             generateWeddingPreview()
           }, 1000)
           
           chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else {
           aiResponse = "What would you like to do? You can tell me the wedding details."
        }
     } else if (lowerMessage === 'no' || lowerMessage.includes('no thanks')) {
        aiResponse = "Alright! Let me know if you need anything else."
     } else {
        aiResponse = "I'm here to help! Just provide the wedding details (Names, Date, Courtesy) and I'll create a design for you."
     }
  } else if (isGreeting && !hasAnyInfo) {
     let replyGreeting = "Hello"
     if (lowerMessage.includes('good morning')) replyGreeting = "Good morning"
     else if (lowerMessage.includes('good afternoon')) replyGreeting = "Good afternoon"
     else if (lowerMessage.includes('good evening')) replyGreeting = "Good evening"
     else if (lowerMessage.includes('salam') || lowerMessage.includes('assalamu')) replyGreeting = "Wa alaikum assalam"
     
     aiResponse = `${replyGreeting}, ${userName}! How are you today? How can I help you with your wedding sticker?`
  } else if (lowerMessage.includes('dont have') || lowerMessage.includes('don\'t have') || lowerMessage.includes('not now') || lowerMessage.includes('cancel') || lowerMessage.includes('leave it')) {
     aiResponse = "Okay, no problem. Let me know if you want to make any other changes."
  } else {
    // If user provides info but it's incomplete or just an update
    if (showWeddingStickerPreview.value) {
       // Assume it's an update request
       aiResponse = "I've updated your design with the new details."
       setTimeout(() => {
         processDescriptionInput()
       }, 500)
    } else {
      // 3. Standard Missing Fields Logic - Enhanced Name Detection
      const missingFields: string[] = []
      
      // Try to extract any missing info from the current message first
      if (!extractedInfo.value.date) {
        const newDate = extractDateFromText(lastUserMessage)
        if (newDate) {
          extractedInfo.value.date = newDate
          accumulatedDescription.value += ' ' + newDate
        }
      }
      
      if (!extractedInfo.value.courtesy) {
        const newCourtesy = extractCourtesyFromText(lastUserMessage)
        if (newCourtesy) {
          extractedInfo.value.courtesy = newCourtesy
          accumulatedDescription.value += ' ' + newCourtesy
        }
      }
      
      // Check for names using enhanced extraction
      const extractedNames = extractNamesFromResponse(lastUserMessage)
      if (extractedNames.name1 && !extractedInfo.value.names.name1) {
        extractedInfo.value.names = extractedNames
        // Add names to accumulated description
        if (extractedNames.name2) {
          accumulatedDescription.value += ' ' + extractedNames.name1 + ' and ' + extractedNames.name2
        } else {
          accumulatedDescription.value += ' ' + extractedNames.name1
        }
      }
      
      // Now check what's still missing based on extractedInfo
      const hasNamesEnhanced = extractedInfo.value.names.name1 !== null
      const hasDateEnhanced = extractedInfo.value.date !== null
      const hasCourtesyEnhanced = extractedInfo.value.courtesy !== null
      
      // If we just got all the info, proceed!
      if (hasNamesEnhanced && hasDateEnhanced && hasCourtesyEnhanced) {
        // Has everything now, check picture and size
        if (!preGeneratedImageFile.value && !pictureStepComplete.value) {
          aiResponse = `Perfect! Do you have a picture you'd like to use in your design?`
          awaitingPictureDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        } else {
          pictureStepComplete.value = true
          if (!extractedInfo.value.size && !sizeStepComplete.value) {
            aiResponse = `One last thing! What size would you like? (e.g., '3x3' or 'default' for 4x4)`
            awaitingSizeDecision.value = true
            chatMessages.value.push({
              id: Date.now(),
              text: aiResponse,
              sender: 'ai',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            })
            scrollToBottom()
            return
          } else {
            // Has everything, generate!
            formData.description = accumulatedDescription.value
            setTimeout(() => generateWeddingPreview(), 1000)
            return
          }
        }
      }
      
      if (!hasNamesEnhanced) {
        missingFields.push('the couple\'s names')
        
        // If ONLY name is missing, trigger enhanced name extraction mode
        if (hasDateEnhanced || hasCourtesyEnhanced || fullText.trim().length > 10) {
          awaitingNameInput.value = true
          nameExtractionAttempts.value = 0
          aiResponse = `I have some information, but I need the couple's names. Please provide the names (e.g., 'John and Mary' or 'Sarah & Ahmed').`
          
          chatMessages.value.push({
            id: Date.now(),
            text: aiResponse,
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
          return
        }
      }
      
      if (!hasDateEnhanced) missingFields.push('the date')
      if (!hasCourtesyEnhanced) missingFields.push('who it is from (courtesy)')
      
      // Special case: User uploaded a picture but hasn't provided text details
      if (preGeneratedImageFile.value && missingFields.length === 3) {
         aiResponse = `I have your picture! Now, please tell me the couple's names, the date, and who the sticker is from.`
      } else if (missingFields.length === 1) {
        aiResponse = `I got that. Please provide ${missingFields[0]}.`
      } else {
        aiResponse = `I'm listening. Please also tell me ${missingFields.join(' and ')}.`
      }
    }
  }

  chatMessages.value.push({
    id: Date.now(),
    text: aiResponse,
    sender: 'ai',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  })
  scrollToBottom()
}

function handleEnterKey(e: KeyboardEvent) {
  if (selectedCategory.value === 'wedding') {
    e.preventDefault()
    sendMessage()
  }
  // Otherwise let it bubble or do nothing (SmartTextarea might handle it)
}

function handlePaste(e: ClipboardEvent) {
  if (selectedCategory.value !== 'wedding') return

  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      const blob = items[i].getAsFile()
      if (blob) {
        // Handle the pasted image
        e.preventDefault()
        
        // Use the same logic as file selection
        cropImageSrc.value = URL.createObjectURL(blob)
        cropImageFile.value = blob
        isPreGenerationCrop.value = true
        showCropModal.value = true
        
        authStore.showNotification({
          title: 'Image Pasted',
          message: 'Image detected from clipboard!',
          type: 'success'
        })
        return
      }
    }
  }
}

function handleGenerateFromChat() {
  if (selectedCategory.value === 'wedding' && !showWeddingStickerPreview.value) {
    sendMessage()
  } else {
    // Fallback for other categories if they use this button
    generateDesign()
  }
}

const imageSlots = ref<Array<{ file: File; preview: string } | null>>([
  null
])

function selectCategory(categoryId: string) {
  console.log('🎯 Category selected:', categoryId)
  selectedCategory.value = categoryId
  console.log('✅ selectedCategory.value set to:', selectedCategory.value)
  console.log('📋 Should show form now:', !!selectedCategory.value)
  // Load category-specific template
  loadCategoryTemplate(categoryId)
}

function loadCategoryTemplate(categoryId: string) {
  // Load template based on category
  // TODO: Integrate with template system
}

function handleImageUpload(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imageSlots.value[index] = {
        file,
        preview: e.target?.result as string
      }
    }
    reader.readAsDataURL(file)
  }
}

function removeImage(index: number) {
  imageSlots.value.splice(index, 1)
  // Ensure at least one slot remains
  if (imageSlots.value.length === 0) {
    imageSlots.value.push(null)
  }
}

function addImageSlot() {
  imageSlots.value.push(null)
}

async function generateDesign() {
  try {
    // Validate
    if (!formData.description) {
      authStore.showNotification({
        title: 'Validation Error',
        message: 'Please enter a description',
        type: 'error'
      })
      return
    }

    // Remember scroll position before switching view
    lastFormScrollPosition.value = window.scrollY || window.pageYOffset || 0

    // Switch to preview mode and start generating
    viewMode.value = 'preview'
    isGenerating.value = true

    // Prepare form data
    const uploadedImages = imageSlots.value.filter((slot): slot is { file: File; preview: string } => slot !== null)

    // Set category in store
    autoDesignStore.setCategory('sticker')

    // Update form data
    autoDesignStore.updateFormData('text.description', formData.description)
    autoDesignStore.updateFormData('options.removeBackground', formData.removeBackground)
    autoDesignStore.updateFormData('options.backgroundColor', formData.backgroundColor)
    autoDesignStore.updateFormData('size', formData.customSize)

    // Upload images
    for (const imageSlot of uploadedImages) {
      autoDesignStore.uploadedFiles.images.push(imageSlot.file)
    }

    // Generate design
    await autoDesignStore.generateDesign()

    // Show preview
    if (autoDesignStore.currentProject?.design?.previewUrl) {
      previewUrl.value = autoDesignStore.currentProject.design.previewUrl
    }

    authStore.showNotification({
      title: 'Success',
      message: 'Sticker design generated successfully!',
      type: 'success'
    })

  } catch (error: any) {
    console.error('Failed to generate design:', error)
    authStore.showNotification({
      title: 'Generation Failed',
      message: error.message || 'Failed to generate sticker design',
      type: 'error'
    })
    // Go back to form on error
    viewMode.value = 'form'
  } finally {
    isGenerating.value = false
  }
}

function backToForm() {
  viewMode.value = 'form'
  nextTick(() => {
    window.scrollTo({ top: lastFormScrollPosition.value, behavior: 'smooth' })
  })
}

function getCategoryName(categoryId: string | null): string {
  if (!categoryId) return ''
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : categoryId
}

function goBack() {
  if (selectedCategory.value) {
    selectedCategory.value = null
  } else {
    router.push('/home')
  }
}

// Wedding Sticker Functions
async function loadWeddingStickerTemplate() {
  if (!weddingPreviewContainer.value) {
    console.error('❌ weddingPreviewContainer.value is null!')
    return
  }

  console.log('🔄 Loading wedding sticker template...')

  try {
    // Reset replacement state when loading new template
    resetReplacement()

    // 🔥 TESTING MODE: Try multiple sources with fallback
    const sources = [
      {
        name: 'Local (svg folder)',
        url: '/svg/weddingStiker/template.svg',
        mode: 'cors'
      },
      {
        name: 'CloudFront',
        url: 'https://d27paqapg0ahqm.cloudfront.net/svg/weddingStiker/template.svg',
        mode: 'cors'
      }
    ]

    let svgText: string | null = null
    let successSource: string | null = null

    // Try each source until one works
    for (const source of sources) {
      try {
        console.log(`🔍 Trying to load from: ${source.name}`)
        const response = await fetch(source.url, {
          mode: source.mode as RequestMode,
          cache: 'no-cache'
        })

        if (response.ok) {
          svgText = await response.text()
          successSource = source.name
          console.log(`✅ Successfully loaded from: ${source.name}`)
          break
        } else {
          console.warn(`⚠️ Failed from ${source.name}: ${response.status}`)
        }
      } catch (err) {
        console.warn(`⚠️ Error from ${source.name}:`, err)
        continue
      }
    }

    if (!svgText) {
      console.warn('⚠️ Failed to load SVG from all sources, using fallback')
      // Fallback SVG with better visibility
      svgText = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#667eea"/>
        <image id="userImage" x="100" y="50" width="200" height="200" preserveAspectRatio="xMidYMid meet" />
        <text x="50%" y="45%" text-anchor="middle" dominant-baseline="middle" font-size="24" fill="white" font-weight="bold">Wedding Sticker</text>
        <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="16" fill="white">Template Loading...</text>
        <rect x="50" y="250" width="300" height="2" fill="white" opacity="0.3"/>
        <g id="wedding-names-group">
          <text id="name1-text" x="50%" y="280" text-anchor="middle" font-size="14" fill="white" opacity="0.8">Names will appear here</text>
        </g>
        <text id="date-text" x="50%" y="300" text-anchor="middle" font-size="14" fill="white" opacity="0.8">Date will appear here</text>
        <text id="courtesy-text" x="50%" y="320" text-anchor="middle" font-size="14" fill="white" opacity="0.8">Courtesy will appear here</text>
      </svg>`
      
      authStore.showNotification({
        title: 'Using Fallback Template',
        message: 'Could not load the sticker template. Using a basic design.',
        type: 'warning'
      })
    }

    console.log('📝 SVG text length:', svgText.length)
    console.log('📝 First 200 chars:', svgText.substring(0, 200))

    // Insert SVG into container
    weddingPreviewContainer.value.innerHTML = svgText
    console.log('✅ SVG inserted into container')
    
    // Force immediate DOM update
    await nextTick()
    await nextTick() // Double nextTick to ensure Vue has fully updated
    
    // Force a reflow to ensure the browser has rendered
    if (weddingPreviewContainer.value) {
      void weddingPreviewContainer.value.offsetHeight
    }

    // Get SVG element and its text elements
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    
    if (!svgElement) {
      console.error('❌ SVG element not found after insertion!')
      console.error('Container HTML:', weddingPreviewContainer.value.innerHTML.substring(0, 200))
      return
    }
    
    console.log('✅ SVG element found:', svgElement)
    
    if (svgElement) {
      // Ensure SVG has proper dimensions for display
      if (!svgElement.hasAttribute('width') || !svgElement.hasAttribute('height')) {
        svgElement.setAttribute('width', '400')
        svgElement.setAttribute('height', '400')
      }
      
      // Ensure viewBox exists
      if (!svgElement.hasAttribute('viewBox')) {
        const width = svgElement.getAttribute('width') || '400'
        const height = svgElement.getAttribute('height') || '400'
        svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`)
      }

      svgElements = getSVGElements(svgElement)

      // Apply current description if any
      if (formData.description) {
        // DON'T call updateStickerText here - it will be called after SVG replacement

        // Check if replacement should be applied
        const hasAlhamdulillah = /alhamdulillah/i.test(formData.description)
        const hasCongratulation = /congratulation/i.test(formData.description)
        const hasCeremony = /ceremony/i.test(formData.description)
        const hasWedding = /wedding/i.test(formData.description)
        const hasNikkah = /nikkah/i.test(formData.description)
        const hasThanks = /thank(?:s)?/i.test(formData.description)
        const hasAttending = /attending/i.test(formData.description)
        
        if (hasThanks && hasAttending && hasWedding) {
          // Thanks for attending our wedding version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['thank', 'attending', 'wedding'], // Check all required keywords
            svgFiles: [
              '/weddigTitles/thanks.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 200,
              y: 200,
              width: 1350,
              height: 550
            }
          })
        } else if (hasCongratulation && hasCeremony) {
          // Congratulation on your wedding ceremony version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['congratulation', 'ceremony'],
            svgFiles: [
              '/weddigTitles/congrat.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 200.45,
              y: 280,
              width: 1300,
              height: 370
            }
          })
        } else if (hasAlhamdulillah && hasCeremony) {
          // Alhamdulillah with Ceremony version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['alhamdulillah', 'ceremony'],
            svgFiles: [
              '/weddigTitles/Ceremony.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 260,
              y: 280,
              width: 1350,
              height: 550
            }
          })
        } else if (hasCongratulation && hasNikkah) {
          // Congratulation with Nikkah version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['congratulation', 'nikkah'],
            svgFiles: [
              '/weddigTitles/Nikkah.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
              y: 200,  // Match blessing-text y position
              width: 1150,
              height: 500
            }
          })
        } else if (hasAlhamdulillah && hasNikkah) {
          // Alhamdulillah with Nikkah version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['alhamdulillah', 'nikkah'],
            svgFiles: [
              '/weddigTitles/NikkahAl.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
              y: 200,  // Match blessing-text y position
              width: 1150,
              height: 500
            }
          })
        } else if (hasCongratulation && hasWedding) {
          // Congratulation on your wedding version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['congratulation', 'wedding'],
            svgFiles: [
              '/weddigTitles/Wed.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
              y: 200,  // Match blessing-text y position
              width: 1150,
              height: 500
            }
          })
        } else if (hasAlhamdulillah && hasWedding) {
          // Alhamdulillah on your wedding version
          await handleReplacement(formData.description, svgElement, {
            keywords: ['alhamdulillah', 'wedding'],
            svgFiles: [
              '/weddigTitles/Wed.svg'
            ],
            targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
            position: {
              x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
              y: 200,  // Match blessing-text y position
              width: 1150,
              height: 500
            }
          })
        }
      }

      // Show success notification
      authStore.showNotification({
        title: 'Template Loaded',
        message: `Wedding sticker template loaded from ${successSource}`,
        type: 'success'
      })
    }
  } catch (error) {
    console.error('❌ Failed to load wedding sticker template:', error)
    authStore.showNotification({
      title: 'Template Load Failed',
      message: 'Failed to load wedding sticker template. Please check the console for details.',
      type: 'error'
    })
  }
}

// State to track crop context.
// const isPreGenerationCrop = ref(false)

// Helper function to update only date and courtesy (not names) when title SVG is active
function updateDateAndCourtesy(description: string, svgElements: any) {
  console.log('🔍 updateDateAndCourtesy called with:', { description, svgElements: !!svgElements })
  // Extract date from description
  const extractDate = (desc: string): string | null => {
    // Match patterns like "15th March 2025", "March 15, 2025", "2025-03-15"
    const datePatterns = [
      /(\d{1,2}(?:st|nd|rd|th)?\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*,?\s*\d{4})/i,
      /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:st|nd|rd|th)?\s*,?\s*\d{4}/i,
      /\d{4}-\d{2}-\d{2}/,
      /\d{1,2}\/\d{1,2}\/\d{4}/
    ]
    
    for (const pattern of datePatterns) {
      const match = desc.match(pattern)
      if (match) return match[0].trim()
    }
    return null
  }

  // Extract courtesy from description  
  const extractCourtesy = (desc: string): { text: string, prefix: string } | null => {
    const courtesyPattern = /courtesy:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const courtesyMatch = desc.match(courtesyPattern)
    if (courtesyMatch) return { text: courtesyMatch[1].trim(), prefix: 'Courtesy:' }
    
    const cutCeePattern = /cut-cee:\s*([^\n]+?)(?:\s*$|\.|\n)/i
    const cutCeeMatch = desc.match(cutCeePattern)
    if (cutCeeMatch) return { text: cutCeeMatch[1].trim(), prefix: 'CUT-CEE:' }
    
    return null
  }

  // Update date if found
  const dateText = extractDate(description)
  if (dateText && svgElements.dateText) {
    svgElements.dateText.textContent = dateText
    console.log('📅 Date updated:', dateText)
  }

  // Update courtesy if found
  const courtesyData = extractCourtesy(description)
  if (courtesyData && svgElements.courtesyText) {
    svgElements.courtesyText.textContent = `${courtesyData.prefix} ${courtesyData.text}`
    console.log('🎭 Courtesy updated:', courtesyData)
  }
}

// Helper function to handle names when title SVG is active (use decorative name02.svg)
async function handleNamesWithTitleSVG(description: string, svgElements: any) {
  console.log('🔍 handleNamesWithTitleSVG called with:', { description })
  
  // Always call updateStickerText to ensure date and courtesy are updated
  // regardless of whether names are present or not
  const data = await updateStickerText(description, svgElements)
  
  // Extract names from parentheses for logging purposes
  const nameMatch = description.match(/\(([^)]+)\)/)?.[1]
  
  if (nameMatch) {
    const names = nameMatch.split(/\s*[&and]+\s*/i).map(name => name.trim())
    if (names.length === 2 && svgElements?.weddingNamesGroup) {
      console.log('✅ Two names detected, decorative SVG injection handled by updateStickerText')
    }
  }
  
  return data
}

// Auto-completion handler for description field
function handleDescriptionKeydown(event: KeyboardEvent) {
  const textarea = event.target as HTMLTextAreaElement
  const cursorPos = textarea.selectionStart
  const textBeforeCursor = formData.description.substring(0, cursorPos)
  
  // Auto-pair parentheses
  if (event.key === '(') {
    event.preventDefault()
    const textAfterCursor = formData.description.substring(cursorPos)
    formData.description = textBeforeCursor + '()' + textAfterCursor
    // Position cursor between parentheses
    setTimeout(() => {
      textarea.selectionStart = cursorPos + 1
      textarea.selectionEnd = cursorPos + 1
    }, 0)
    console.log('✅ Auto-paired parentheses')
  }
  
  // Auto-complete courtesy keywords
  if (event.key === ' ' || event.key === 'Tab') {
    const lastWord = textBeforeCursor.split(/\s+/).pop()?.toLowerCase() || ''
    
    // List of courtesy keyword variations to auto-complete
    const courtesyKeywords = [
      { trigger: 'cour', complete: 'courtesy:' },
      { trigger: 'court', complete: 'courtesy:' },
      { trigger: 'courte', complete: 'courtesy:' },
      { trigger: 'courtes', complete: 'courtesy:' },
      { trigger: 'coutesy', complete: 'courtesy:' },
      { trigger: 'coutees', complete: 'courtesy:' },
      { trigger: 'cut', complete: 'cut-cee:' },
      { trigger: 'cutcee', complete: 'cut-cee:' },
      { trigger: 'cut-cee', complete: 'cut-cee:' },
      { trigger: 'cutc', complete: 'cut-cee:' },
    ]
    
    const match = courtesyKeywords.find(k => lastWord === k.trigger)
    
    if (match) {
      event.preventDefault()
      // Replace the trigger word with the complete keyword
      const wordsBeforeLast = textBeforeCursor.substring(0, textBeforeCursor.length - lastWord.length)
      const textAfterCursor = formData.description.substring(cursorPos)
      formData.description = wordsBeforeLast + match.complete + ' ' + textAfterCursor
      
      // Position cursor after the completed keyword
      setTimeout(() => {
        const newPos = wordsBeforeLast.length + match.complete.length + 1
        textarea.selectionStart = newPos
        textarea.selectionEnd = newPos
      }, 0)
      
      console.log(`✅ Auto-completed "${lastWord}" to "${match.complete}"`)
    }
  }
}

// Debounced input handler to prevent UI freezing during typing
const handleDescriptionInput = useDebounceFn(() => {
  processDescriptionInput()
}, 50)

async function processDescriptionInput() {
  console.log('🔄 processDescriptionInput triggered:', { 
    description: formData.description, 
    category: selectedCategory.value, 
    hasSvgElements: !!svgElements 
  })

  // Perform validation even if SVG elements are not loaded yet
  if (selectedCategory.value === 'wedding' && !svgElements) {
    // Pass null elements structure to avoid errors while validating
    const stickerData = await updateStickerText(formData.description, getSVGElements(null))
    updateValidationWarnings(stickerData)
  }
  
  // Update wedding sticker preview in real-time
  if (selectedCategory.value === 'wedding' && svgElements) {
    // Handle SVG text replacement for Nikkah/Ceremony graphics
    const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      // Check if description contains keywords
      const hasAlhamdulillah = /alhamdulillah/i.test(formData.description)
      const hasCongratulation = /congratulation/i.test(formData.description)
      const hasCeremony = /ceremony/i.test(formData.description)
      const hasWedding = /wedding/i.test(formData.description)
      const hasNikkah = /nikkah/i.test(formData.description)
      const hasThanks = /thank(?:s)?/i.test(formData.description) // Matches "thank" or "thanks"
      const hasAttending = /attending/i.test(formData.description)
      
      // Check if we should replace with SVG graphics
      const shouldReplace = (hasThanks && hasAttending && hasWedding) ||
                           (hasCongratulation && hasWedding) ||
                           (hasAlhamdulillah && hasWedding) ||
                           (hasCongratulation && hasCeremony && hasWedding) || 
                           (hasAlhamdulillah && hasCeremony && hasWedding) || 
                           (hasAlhamdulillah && hasNikkah) || 
                           (hasCongratulation && hasNikkah)
      
      let stickerData: any = null

      if (shouldReplace) {
        // When replacing, still update text but ONLY for non-replaced elements (names, date, courtesy)
        // We'll call updateStickerText after replacement to update these fields
      } else {
        // No replacement - update all text normally
        // We'll do it in the main logic block
      }
      
      // Priority order: Check more specific combinations first (ceremony, nikkah) before general (wedding)
      if (hasThanks && hasAttending && hasWedding) {
        // Use thanks SVG for "Thanks for attending our wedding"
        await handleReplacement(formData.description, svgElement, {
          keywords: ['thank', 'attending', 'wedding'], // Check all required keywords
          svgFiles: [
            '/weddigTitles/thanks.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else if (hasCongratulation && hasCeremony && hasWedding) {
        // Use congrat.svg for Congratulation on your wedding ceremony
        await handleReplacement(formData.description, svgElement, {
          keywords: ['congratulation', 'ceremony'],
          svgFiles: [
            '/weddigTitles/congrat.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else if (hasAlhamdulillah && hasCeremony && hasWedding) {
        // Use Ceremony.svg for Alhamdulillah with Ceremony
        await handleReplacement(formData.description, svgElement, {
          keywords: ['alhamdulillah', 'ceremony'],
          svgFiles: [
            '/weddigTitles/Ceremony.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 300,  // Moved right from 275
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else if (hasCongratulation && hasNikkah) {
        // Use Nikkah.svg for Congratulation with Nikkah
        await handleReplacement(formData.description, svgElement, {
          keywords: ['congratulation', 'nikkah'],
          svgFiles: [
            '/weddigTitles/Nikkah.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else if (hasAlhamdulillah && hasNikkah) {
        // Use NikkahAl.svg for Alhamdulillah with Nikkah
        await handleReplacement(formData.description, svgElement, {
          keywords: ['alhamdulillah', 'nikkah'],
          svgFiles: [
            '/weddigTitles/NikkahAl.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else if (hasCongratulation && hasWedding) {
        // Use Wed.svg for Congratulation on your wedding
        await handleReplacement(formData.description, svgElement, {
          keywords: ['congratulation', 'wedding'],
          svgFiles: [
            '/weddigTitles/Wed.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else if (hasAlhamdulillah && hasWedding) {
        // Use Wed.svg for Alhamdulillah on your wedding
        await handleReplacement(formData.description, svgElement, {
          keywords: ['alhamdulillah', 'wedding'],
          svgFiles: [
            '/weddigTitles/Wed.svg'
          ],
          targetElementIds: ['blessing-text', 'occasion-text', 'event-type-text', 'ceremony-text'],
          position: {
            x: 275,  // Centered position to match "Alhamdulillahi on your wedding ceremony" text
            y: 200,  // Match blessing-text y position
            width: 1150,
            height: 500
          }
        })
        // When title SVG is active, use comprehensive update that handles names, date, and courtesy
        stickerData = await handleNamesWithTitleSVG(formData.description, svgElements)
      } else {
        // No replacement - update all text normally
        
        // Check if we currently have an SVG replacement active and need to restore original text
        if (replacementState.value.isReplaced) {
           const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
           if (svgElement) {
             console.log('🔄 Restoring original text elements because replacement logic is no longer met')
             restoreOriginalElements(svgElement)
             // Re-acquire element references since DOM nodes were recreated
             svgElements = getSVGElements(svgElement)
           }
        }
        
        stickerData = await updateStickerText(formData.description, svgElements)
      }
      
      // Update validation warnings
      if (stickerData) {
        updateValidationWarnings(stickerData)
      }
    }
  }

  // Update SVG with embedded images in real-time
  updateSVGWithImages()
}

// Graduation Template Functions (Konva-based)
async function loadGraduationTemplate() {
  if (!graduationStageContainer.value) return

  // Initialize Konva Stage if not already done
  if (!graduationLayoutManager) {
    const stage = new Konva.Stage({
      container: graduationStageContainer.value,
      width: 400,
      height: 400
    })

    graduationLayoutManager = new SvgLayoutManager(stage, {
      width: 400,
      height: 400,
      backgroundColor: '#1a1a1a' // Dark background for graduation
    })
  }

  // Clear previous content
  graduationLayoutManager.clear()

  // Parse description to extract graduation details
  const details = parseGraduationDescription(formData.description)

  // Create template using the preset
  await createGraduationTemplate(graduationLayoutManager, {
    studentName: details.name,
    year: details.year,
    schoolName: details.school,
    degree: details.degree
  })
}

function parseGraduationDescription(description: string) {
  // Simple parser for graduation details
  // Expected format: "Name (School), Year, Degree"
  // Or just try to find patterns
  
  const yearMatch = description.match(/\b(20\d{2})\b/)
  const year = yearMatch ? yearMatch[1] : '2025'
  
  // Extract name (first part or inside parentheses if specified differently)
  // For now, let's assume the first few words are the name until a comma or keyword
  let name = 'STUDENT NAME'
  let school = 'University of Excellence'
  
  if (description) {
    const parts = description.split(',')
    if (parts.length > 0) {
      name = parts[0].trim()
    }
    if (parts.length > 1) {
      school = parts[1].trim()
    }
  }
  
  return { name, year, school, degree: 'Graduate' }
}

// Update graduation template when description changes
watch(() => formData.description, () => {
  if (selectedCategory.value === 'graduation' && graduationLayoutManager) {
    const details = parseGraduationDescription(formData.description)
    
    // Update text nodes directly for performance
    graduationLayoutManager.updateText('student_name', details.name)
    graduationLayoutManager.updateText('year_text', details.year)
    graduationLayoutManager.updateText('school_text', details.school)
  }
})

// SVG Image Management Functions
const selectedSVGImage = computed(() => svgImageManager.getSelectedImage())

function triggerImageFileInput() {
  imageFileInput.value?.click()
}

async function handleImageDrop(event: DragEvent) {
  // Get SVG element to read placeholder position
  const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement
  
  // Clear existing images to prevent accumulation/duplication
  svgImageManager.clearAllImages()
  
  await svgImageManager.handleDrop(event, svgElement)

  // Update SVG preview with new images
  updateSVGWithImages()
}

async function handleImageFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    // For now, only handle the first file with cropping
    let file = files[0]

    // Step 1: Remove background if enabled
    if (autoRemoveBackground.value && isBackgroundRemovalSupported()) {
      try {
        backgroundRemovalError.value = null

        const result = await removeBackground(file, {
          quality: 'high',
          outputFormat: 'image/png',
          maxDimensions: 2048
        })

        uploadModalProgress.value = 80

        // Convert blob to File
        file = new File([result.blob], file.name.replace(/\.[^/.]+$/, '.png'), {
          type: 'image/png',
          lastModified: Date.now()
        })

        uploadModalStatusText.value = 'Background removed!'
      } catch (error: any) {
        backgroundRemovalError.value = error.message || 'Failed to remove background'
        // Continue with original image
      }
    } else if (autoRemoveBackground.value && !isBackgroundRemovalSupported()) {
      backgroundRemovalError.value = 'Background removal is not supported in this browser'
    }

    // Step 2: Create object URL for the image (original or processed)
    const imageUrl = URL.createObjectURL(file)

    // Step 3: Set crop modal data
    cropImageSrc.value = imageUrl
    cropImageFile.value = file
    showCropModal.value = true
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

// Image crop modal handlers
async function handleCropComplete(data: { dataUrl: string; blob: Blob; width: number; height: number }) {

  if (isPreGenerationCrop.value) {
    // Handle pre-generation crop
    if (cropImageFile.value) {
      const croppedFile = new File([data.blob], cropImageFile.value.name, {
        type: 'image/png',
        lastModified: Date.now()
      })
      
      preGeneratedImageFile.value = croppedFile
      preGeneratedImagePreview.value = data.dataUrl
      
      // Mark this image as used in the tracking array
      const uploadIndex = uploadedImages.value.findIndex(img => img.file === cropImageFile.value)
      if (uploadIndex >= 0) {
        uploadedImages.value[uploadIndex].used = true
      }
      
      // Add image message to chat
      chatMessages.value.push({
        id: Date.now(),
        text: 'Image uploaded',
        sender: 'user',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        image: data.dataUrl
      })
      scrollToBottom()

      // Ask about background removal
      setTimeout(() => {
        chatMessages.value.push({
          id: Date.now(),
          text: "I've received your photo. Do you want me to remove the background?",
          sender: 'ai',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        })
        scrollToBottom()
        awaitingBackgroundRemovalDecision.value = true
      }, 500)
      
      // Reset state
      isPreGenerationCrop.value = false
      showCropModal.value = false
      
      // Clean up object URL
      if (cropImageSrc.value) {
        URL.revokeObjectURL(cropImageSrc.value)
        cropImageSrc.value = ''
      }
      cropImageFile.value = null
    }
    return
  }

  // Get SVG element to read placeholder position
  const svgElement = weddingPreviewContainer.value?.querySelector('svg') as SVGSVGElement

  if (!svgElement || !cropImageFile.value) {
    console.error('SVG element or crop image file not found')
    return
  }

  // Create a new File object from the cropped blob
  const croppedFile = new File([data.blob], cropImageFile.value.name, {
    type: 'image/png',
    lastModified: Date.now()
  })

  // Clear existing images to prevent accumulation/duplication
  svgImageManager.clearAllImages()

  // Add the cropped image using the existing image manager
  // This will automatically read the placeholder position from the SVG
  await svgImageManager.addImage(croppedFile, svgElement)

  // Update SVG preview with new images
  updateSVGWithImages()

  // Clean up
  URL.revokeObjectURL(cropImageSrc.value)
  cropImageSrc.value = ''
  cropImageFile.value = null
}

function handleCropModalClose() {
  showCropModal.value = false
  isPreGenerationCrop.value = false

  // Clean up object URL
  if (cropImageSrc.value) {
    URL.revokeObjectURL(cropImageSrc.value)
    cropImageSrc.value = ''
  }
  cropImageFile.value = null
}

function handleImagePropertyInput(property: string, event: Event) {
  const target = event.target as HTMLInputElement
  const value = Number(target.value)

  if (selectedSVGImage.value) {
    updateSelectedImageProperty(property, value)
  }
}

function handleAspectRatioToggle(event: Event) {
  const target = event.target as HTMLInputElement
  const checked = target.checked

  if (selectedSVGImage.value) {
    updateSelectedImageProperty('maintainAspectRatio', checked)
  }
}

function updateSelectedImageProperty(property: string, value: any) {
  if (svgImageManager.selectedImageId.value) {
    svgImageManager.updateImage(svgImageManager.selectedImageId.value, { [property]: value })

    // Update SVG preview
    updateSVGWithImages()
  }
}

function handleImageScaleChange(event: Event) {
  const target = event.target as HTMLInputElement
  const scale = parseFloat(target.value)
  
  if (svgImageManager.selectedImageId.value) {
    svgImageManager.updateImage(svgImageManager.selectedImageId.value, { scale })
    updateSVGWithImages()
  }
}

function setImageScale(scale: number) {
  if (svgImageManager.selectedImageId.value) {
    svgImageManager.updateImage(svgImageManager.selectedImageId.value, { scale })
    updateSVGWithImages()
  }
}

function flipImage() {
  if (!svgImageManager.selectedImageId.value) {
    return
  }

  const selectedImage = svgImageManager.images.value.find(
    img => img.id === svgImageManager.selectedImageId.value
  )

  if (!selectedImage) {
    return
  }

  // Toggle flip state
  selectedImage.flipped = !selectedImage.flipped

  // Update SVG to reflect the change
  updateSVGWithImages()
}

async function autoRetouchImage() {
  const selectedImage = svgImageManager.getSelectedImage()
  
  if (!selectedImage) {
    authStore.showNotification({
      title: 'No Image Selected',
      message: 'Please select an image to enhance',
      type: 'info'
    })
    return
  }

  // Check if image has already been retouched
  if (selectedImage.isRetouched) {
    authStore.showNotification({
      title: 'Already Enhanced',
      message: 'This image has already been retouched',
      type: 'info'
    })
    return
  }

  try {
    isRetouching.value = true
    
    // Apply automatic retouch
    const retouchedDataUrl = await applyRetouch(selectedImage.dataUrl)
    
    // Update the image in the manager and mark as retouched
    if (svgImageManager.selectedImageId.value) {
      svgImageManager.updateImage(svgImageManager.selectedImageId.value, {
        dataUrl: retouchedDataUrl,
        isRetouched: true
      })
      
      // Update SVG preview
      updateSVGWithImages()
      
      authStore.showNotification({
        title: 'Image Enhanced',
        message: 'Your image has been automatically retouched',
        type: 'success'
      })
    }
    
  } catch (error) {
    console.error('Auto retouch failed:', error)
    authStore.showNotification({
      title: 'Retouch Failed',
      message: 'Failed to enhance image. Please try again.',
      type: 'error'
    })
  } finally {
    isRetouching.value = false
  }
}

async function retouchImage() {
  const selectedImage = svgImageManager.getSelectedImage()
  
  if (!selectedImage) {
    authStore.showNotification({
      title: 'No Image Selected',
      message: 'Please select an image to retouch',
      type: 'info'
    })
    return
  }

  try {
    // Open the crop modal with the selected image for retouching
    cropImageSrc.value = selectedImage.dataUrl
    cropImageFile.value = selectedImage.file
    showCropModal.value = true
    
  } catch (error) {
    console.error('Failed to open retouch:', error)
    authStore.showNotification({
      title: 'Retouch Error',
      message: 'Failed to open image for retouching',
      type: 'error'
    })
  }
}

// Make SVG image draggable
function makeSVGImageDraggable(imageElement: SVGImageElement, imageId: string) {
  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0
  let initialDistance = 0
  let initialScale = 1
  let baseWidth = 0
  let baseHeight = 0

  // Add visual feedback
  imageElement.style.cursor = 'move'
  imageElement.style.transition = 'opacity 0.2s'

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = true
    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    startX = svgPt.x
    startY = svgPt.y
    initialX = parseFloat(imageElement.getAttribute('x') || '0')
    initialY = parseFloat(imageElement.getAttribute('y') || '0')

    imageElement.style.opacity = '0.7'
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const svgElement = imageElement.ownerSVGElement
    if (!svgElement) return

    const pt = svgElement.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

    let dx = svgPt.x - startX
    const dy = svgPt.y - startY

    // If image is flipped, invert horizontal drag direction
    const img = svgImageManager.images.value.find(i => i.id === imageId)
    if (img && img.flipped) {
      dx = -dx
    }

    const newX = initialX + dx
    const newY = initialY + dy

    imageElement.setAttribute('x', newX.toString())
    imageElement.setAttribute('y', newY.toString())

    // Update the image manager with new position
    svgImageManager.updateImage(imageId, { x: newX, y: newY })

    e.preventDefault()
  }

  const handleMouseUp = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
    }
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // Single touch - drag
      isDragging = true
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

      startX = svgPt.x
      startY = svgPt.y
      initialX = parseFloat(imageElement.getAttribute('x') || '0')
      initialY = parseFloat(imageElement.getAttribute('y') || '0')

      imageElement.style.opacity = '0.7'
    } else if (e.touches.length === 2) {
      // Two finger - pinch to zoom
      isDragging = false
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      initialDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      initialScale = img?.scale || 1.15
      
      // Calculate base dimensions from current element size and scale
      const currentWidth = parseFloat(imageElement.getAttribute('width') || '0')
      const currentHeight = parseFloat(imageElement.getAttribute('height') || '0')
      
      // Avoid division by zero or invalid scale
      const safeScale = initialScale > 0 ? initialScale : 1
      baseWidth = currentWidth / safeScale
      baseHeight = currentHeight / safeScale
    }
    e.preventDefault()
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      // Single touch - drag
      const svgElement = imageElement.ownerSVGElement
      if (!svgElement) return

      const touch = e.touches[0]
      const pt = svgElement.createSVGPoint()
      pt.x = touch.clientX
      pt.y = touch.clientY
      const svgPt = pt.matrixTransform(svgElement.getScreenCTM()?.inverse())

      let dx = svgPt.x - startX
      const dy = svgPt.y - startY

      // If image is flipped, invert horizontal drag direction
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img && img.flipped) {
        dx = -dx
      }

      const newX = initialX + dx
      const newY = initialY + dy

      imageElement.setAttribute('x', newX.toString())
      imageElement.setAttribute('y', newY.toString())

      // Update the image manager with new position
      svgImageManager.updateImage(imageId, { x: newX, y: newY })
    } else if (e.touches.length === 2) {
      // Two finger - pinch to zoom
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      )
      
      const scaleFactor = currentDistance / initialDistance
      const newScale = Math.max(0.5, Math.min(2.5, initialScale * scaleFactor))
      
      // Update image scale
      const img = svgImageManager.images.value.find(i => i.id === imageId)
      if (img) {
        // Use calculated base dimensions instead of hardcoded values
        const adjustedWidth = baseWidth * newScale
        const adjustedHeight = baseHeight * newScale
        
        imageElement.setAttribute('width', adjustedWidth.toString())
        imageElement.setAttribute('height', adjustedHeight.toString())
        
        // Update in manager (will trigger re-render)
        const currentX = parseFloat(imageElement.getAttribute('x') || '0')
        const currentY = parseFloat(imageElement.getAttribute('y') || '0')
        svgImageManager.updateImage(imageId, { 
          x: currentX,
          y: currentY,
          scale: newScale 
        } as any)
      }
    }
    e.preventDefault()
  }

  const handleTouchEnd = () => {
    if (isDragging) {
      isDragging = false
      imageElement.style.opacity = '1'
    }
  }

  // Add event listeners
  imageElement.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  
  // Touch events
  imageElement.addEventListener('touchstart', handleTouchStart, { passive: false })
  imageElement.addEventListener('touchmove', handleTouchMove, { passive: false })
  imageElement.addEventListener('touchend', handleTouchEnd)

  // Store cleanup function
  const cleanup = () => {
    imageElement.removeEventListener('mousedown', handleMouseDown)
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    imageElement.removeEventListener('touchstart', handleTouchStart)
    imageElement.removeEventListener('touchmove', handleTouchMove)
    imageElement.removeEventListener('touchend', handleTouchEnd)
  }

  // Store cleanup reference on element
  ;(imageElement as any).__dragCleanup = cleanup
}

async function setupWeddingPhotoKonva(file: File) {
  if (!konvaPhotoEnabled.value) return
  if (!weddingPhotoKonvaHost.value) return

  const host = weddingPhotoKonvaHost.value

  // Lazily create stage/layer once
  if (!weddingPhotoStage) {
    const hostRect = host.getBoundingClientRect()
    const stageWidth = hostRect.width || 400
    const stageHeight = hostRect.height || 400

    weddingPhotoStage = new Konva.Stage({
      container: host,
      width: stageWidth,
      height: stageHeight
    })

    weddingPhotoLayer = new Konva.Layer()
    weddingPhotoStage.add(weddingPhotoLayer)

    weddingPhotoTransformer = new Konva.Transformer({
      rotateEnabled: false,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorSize: 8,
      borderStroke: '#3b82f6',
      anchorStroke: '#1d4ed8',
      anchorFill: '#ffffff'
    })
    weddingPhotoLayer.add(weddingPhotoTransformer)
  }

  if (!weddingPhotoLayer || !weddingPhotoStage) return

  // Load image
  const imageObj = new window.Image()
  imageObj.src = URL.createObjectURL(file)

  await new Promise<void>((resolve, reject) => {
    imageObj.onload = () => resolve()
    imageObj.onerror = () => reject(new Error('Failed to load image'))
  })

  // Clear previous photo
  if (weddingPhotoImage) {
    weddingPhotoImage.destroy()
    weddingPhotoImage = null
  }

  const stageWidth = weddingPhotoStage.width()
  const stageHeight = weddingPhotoStage.height()

  const imageRatio = imageObj.width / imageObj.height
  const frameRatio = stageWidth / stageHeight

  let displayWidth: number
  let displayHeight: number

  if (imageRatio > frameRatio) {
    // Image is wider than frame
    displayHeight = stageHeight * 0.9
    displayWidth = displayHeight * imageRatio
  } else {
    displayWidth = stageWidth * 0.9
    displayHeight = displayWidth / imageRatio
  }

  const imageNode = new Konva.Image({
    image: imageObj,
    x: (stageWidth - displayWidth) / 2,
    y: (stageHeight - displayHeight) / 2 + 12,
    width: displayWidth,
    height: displayHeight,
    draggable: true
  })

  weddingPhotoLayer.add(imageNode)
  weddingPhotoImage = imageNode

  // Attach transformer
  weddingPhotoTransformer!.nodes([imageNode])

  // Keep image within stage bounds on drag/transform
  imageNode.on('dragmove', () => {
    const box = imageNode.getClientRect()
    const dx = Math.min(0, stageWidth - box.x - box.width)
    const dy = Math.min(0, stageHeight - box.y - box.height)
    const sx = Math.max(0, -box.x)
    const sy = Math.max(0, -box.y)
    if (sx || sy || dx || dy) {
      imageNode.x(imageNode.x() + sx + dx)
      imageNode.y(imageNode.y() + sy + dy)
    }
  })

  weddingPhotoLayer.draw()
}

function updateSVGWithImages() {
  if (!weddingPreviewContainer.value) return

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) return

  const images = svgImageManager.images.value
  
  // Check for the specific userImage element we want to control (or fallback to placeholder-image)
  let userImageElement = svgElement.querySelector('#userImage') || svgElement.querySelector('#placeholder-image')
  
  // If no image element exists, create one
  if (!userImageElement && images.length > 0) {
    userImageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')
    userImageElement.setAttribute('id', 'userImage')
    // Insert as first child so it's behind text
    if (svgElement.firstChild) {
      svgElement.insertBefore(userImageElement, svgElement.firstChild)
    } else {
      svgElement.appendChild(userImageElement)
    }
  }
  
  if (userImageElement && images.length > 0) {
    // We are in "replace placeholder" mode
    // Use the LAST image to populate #userImage (in case multiple were added, we want the latest)
    const img = images[images.length - 1]

    // Determine frame dimensions based on SVG size
    const viewBox = svgElement.getAttribute('viewBox')?.split(' ').map(Number)
    const svgWidth = viewBox ? viewBox[2] : parseFloat(svgElement.getAttribute('width') || '400')
    const svgHeight = viewBox ? viewBox[3] : parseFloat(svgElement.getAttribute('height') || '400')
    
    // Check if this is the large template (width > 1000)
    const isLargeTemplate = svgWidth > 1000

    let frameX, frameY, frameWidth, frameHeight

    if (isLargeTemplate) {
      // Use FIXED frame position from SVG template
      frameX = 1400
      frameY = 35
      frameWidth = 1580
      frameHeight = 1650.75
    } else {
      // Use centered position for fallback/smaller templates
      // Default to 50% width/height centered
      const existingWidth = parseFloat(userImageElement.getAttribute('width') || '0')
      const existingHeight = parseFloat(userImageElement.getAttribute('height') || '0')
      
      if (existingWidth > 0 && existingHeight > 0) {
        // Use existing element dimensions
        frameX = parseFloat(userImageElement.getAttribute('x') || '0')
        frameY = parseFloat(userImageElement.getAttribute('y') || '0')
        frameWidth = existingWidth
        frameHeight = existingHeight
      } else {
        // Create centered frame
        frameWidth = svgWidth * 0.5
        frameHeight = svgHeight * 0.5
        frameX = (svgWidth - frameWidth) / 2
        frameY = (svgHeight - frameHeight) / 2
      }
    }
    
    // Use custom scale from image if available, otherwise default to 1.15
    const scale = img.scale || 1.15
    const adjustedWidth = frameWidth * scale
    const adjustedHeight = frameHeight * scale
    
    // Center the enlarged image within the frame
    const adjustedX = frameX - (adjustedWidth - frameWidth) / 2
    // Move only the uploaded image down by 90px (only for large template)
    const adjustedY = frameY - (adjustedHeight - frameHeight) / 2 + (isLargeTemplate ? 90 : 0)
    
    userImageElement.setAttribute('x', adjustedX.toString())
    userImageElement.setAttribute('y', adjustedY.toString())
    userImageElement.setAttribute('width', adjustedWidth.toString())
    userImageElement.setAttribute('height', adjustedHeight.toString())
    userImageElement.setAttribute('opacity', (img.opacity / 100).toString())
    userImageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    userImageElement.setAttribute('href', img.dataUrl)
    
    // Make image draggable
    makeSVGImageDraggable(userImageElement as SVGImageElement, img.id)
    
    // Ensure clip-path and preserveAspectRatio are set as requested
    if (!userImageElement.hasAttribute('clip-path')) {
        // Only set default clip-path if it's the userImage element AND we are on large template
        if (userImageElement.id === 'userImage' && isLargeTemplate) {
            userImageElement.setAttribute('clip-path', 'url(#imageClip)')
        }
    }
    if (!userImageElement.hasAttribute('preserveAspectRatio')) {
        userImageElement.setAttribute('preserveAspectRatio', 'xMidYMid meet')
    }

    // Build transform attribute
    const transforms: string[] = []
    
    // Compute visual center based on the DISPLAYED image dimensions
    // This ensures flip happens around the actual visible center
    const displayCenterX = adjustedX + adjustedWidth / 2
    const displayCenterY = adjustedY + adjustedHeight / 2

    // Apply flip if needed (around visual center of displayed image)
    if (img.flipped) {
      transforms.push(`translate(${displayCenterX}, 0) scale(-1, 1) translate(-${displayCenterX}, 0)`)
    }
    
    // Apply rotation around same center
    if (img.rotation !== 0) {
      transforms.push(`rotate(${img.rotation} ${displayCenterX} ${displayCenterY})`)
    }
    
    if (transforms.length > 0) {
      userImageElement.setAttribute('transform', transforms.join(' '))
    } else {
      userImageElement.removeAttribute('transform')
    }

    // Also remove any old style "user-image-*" elements just in case
    const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
    existingImages.forEach(img => img.remove())
    
    return
  }

  // Fallback to old behavior if #userImage is not found
  // Remove existing user images
  const existingImages = svgElement.querySelectorAll('image[id^="user-image-"]')
  existingImages.forEach(img => img.remove())

  if (images.length === 0) return

  // Sort by z-index
  const sortedImages = [...images].sort((a, b) => a.zIndex - b.zIndex)

  // Find insertion point - look for placeholder image or any text element
  const placeholderImage = svgElement.querySelector('#placeholder-image')
  const firstTextElement = svgElement.querySelector('text')
  let insertionPoint = placeholderImage || firstTextElement

  // Add each image
  sortedImages.forEach(img => {
    const imageElement = document.createElementNS('http://www.w3.org/2000/svg', 'image')

    imageElement.setAttribute('id', img.id)
    imageElement.setAttribute('x', img.x.toString())
    imageElement.setAttribute('y', img.y.toString())
    imageElement.setAttribute('width', img.width.toString())
    imageElement.setAttribute('height', img.height.toString())
    imageElement.setAttribute('opacity', (img.opacity / 100).toString())
    imageElement.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', img.dataUrl)
    
    // NO clip path - show the full image as-is
    // NO preserveAspectRatio manipulation - let it display naturally

    // Build transform attribute
    const transforms: string[] = []
    
    // Apply flip if needed
    if (img.flipped) {
      const centerX = img.x + img.width / 2
      // Flip horizontally around center point
      transforms.push(`translate(${centerX}, 0) scale(-1, 1) translate(-${centerX}, 0)`)
    }
    
    // Apply rotation
    if (img.rotation !== 0) {
      const centerX = img.x + img.width / 2
      const centerY = img.y + img.height / 2
      transforms.push(`rotate(${img.rotation} ${centerX} ${centerY})`)
    }
    
    if (transforms.length > 0) {
      imageElement.setAttribute('transform', transforms.join(' '))
    }

    // Insert before insertion point or append to SVG
    if (insertionPoint && insertionPoint.parentNode === svgElement) {
      svgElement.insertBefore(imageElement, insertionPoint)
    } else {
      svgElement.appendChild(imageElement)
    }
  })
}

async function exportWeddingSticker(format: 'svg' | 'png') {
  if (!weddingPreviewContainer.value) {
    authStore.showNotification({
      title: 'Export Error',
      message: 'No sticker to export',
      type: 'error'
    })
    return
  }

  const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
  if (!svgElement) {
    authStore.showNotification({
      title: 'Export Error',
      message: 'SVG element not found',
      type: 'error'
    })
    return
  }

  try {
    const filename = `wedding-sticker-${new Date().toISOString().split('T')[0]}`

    // Apply physical dimensions for export if they exist
    const exportWidth = svgElement.getAttribute('data-export-width')
    const exportHeight = svgElement.getAttribute('data-export-height')
    const originalStyleWidth = svgElement.style.width
    const originalStyleHeight = svgElement.style.height

    if (exportWidth && exportHeight) {
      svgElement.setAttribute('width', exportWidth)
      svgElement.setAttribute('height', exportHeight)
      // Remove CSS constraints that might interfere with the export canvas sizing
      svgElement.style.width = ''
      svgElement.style.height = ''
    }

    await exportSVG(svgElement, svgImageManager.images.value, {
      filename: format === 'svg' ? `${filename}.svg` : `${filename}.png`,
      format,
      pngResolution: 300
    })

    // Restore responsive display settings
    if (exportWidth && exportHeight) {
      svgElement.setAttribute('width', '100%')
      svgElement.removeAttribute('height')
      svgElement.style.width = originalStyleWidth || '100%'
      svgElement.style.height = originalStyleHeight || 'auto'
    }

    authStore.showNotification({
      title: 'Download Successful',
      message: `Sticker downloaded as ${format.toUpperCase()}`,
      type: 'success'
    })
  } catch (error) {
    console.error('Export failed:', error)
    authStore.showNotification({
      title: 'Export Failed',
      message: error instanceof Error ? error.message : 'Failed to export sticker',
      type: 'error'
    })
  }
}

// Watch for category changes to load wedding template
watch(selectedCategory, async (newCategory) => {
  if (newCategory === 'wedding') {
    // Reset preview
    showWeddingStickerPreview.value = false
  } else if (newCategory === 'graduation') {
    await nextTick()
    await loadGraduationTemplate()
  } else {
    // Reset wedding states when switching away
    showWeddingStickerPreview.value = false
  }
})

// Watch for SVG size changes
watch([() => formData.svgWidth, () => formData.svgHeight], ([newWidth, newHeight]) => {
  if (selectedCategory.value === 'wedding' && weddingPreviewContainer.value) {
    const svgElement = weddingPreviewContainer.value.querySelector('svg') as SVGSVGElement
    if (svgElement) {
      svgElement.setAttribute('width', newWidth.toString())
      svgElement.setAttribute('height', newHeight.toString())
    }
  }
})

// Upload Modal Functions
function closeUploadModal() {
  if (!uploadModalProcessing.value) {
    showUploadModal.value = false
    uploadModalSuccess.value = false
  }
}

function triggerModalFileInput() {
  modalFileInput.value?.click()
}

async function handleModalFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files

  if (files && files.length > 0) {
    const file = files[0]

    // Start processing
    uploadModalProcessing.value = true
    uploadModalProgress.value = 0
    uploadModalStatusText.value = 'Uploading image...'
    uploadModalSuccess.value = false

    try {
      // Simulate upload progress
      uploadModalProgress.value = 30
      await new Promise(resolve => setTimeout(resolve, 300))

      // Store file for later processing
      pendingImageFile.value = file
      
      uploadModalProgress.value = 100
      uploadModalStatusText.value = 'Image uploaded!'
      uploadModalSuccess.value = true

      // Close modal
      setTimeout(() => {
        closeUploadModal()
        uploadModalProcessing.value = false
        
        // If preview is already shown, ask if user wants to use this image
        if (showWeddingStickerPreview.value) {
          awaitingBackgroundRemovalDecision.value = true // Reuse this flag or create a new one? 
          // Actually, let's use a specific flow for this.
          // We can reuse awaitingBackgroundRemovalDecision but the prompt is different.
          
          chatMessages.value.push({
            id: Date.now(),
            text: "I see you uploaded a new photo. Do you want to use this image on your wedding sticker?",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            image: URL.createObjectURL(file)
          })
          scrollToBottom()
          
          // We need a way to know we are in "confirm image update" mode.
          // Let's use a new state or piggyback on awaitingBackgroundRemovalDecision with a context check?
          // For simplicity, let's add a new state variable: awaitingImageUpdateConfirmation
          awaitingImageUpdateConfirmation.value = true
          
        } else {
          // Normal flow (before generation)
          // Ask user about background removal
          awaitingBackgroundRemovalDecision.value = true
          chatMessages.value.push({
            id: Date.now(),
            text: "Image received! Do you want me to remove the background?",
            sender: 'ai',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          })
          scrollToBottom()
        }
      }, 500)

    } catch (error) {
      console.error('Upload failed:', error)
      uploadModalProcessing.value = false
      uploadModalProgress.value = 0
      
      authStore.showNotification({
        title: 'Upload Failed',
        message: 'Failed to process image. Please try again.',
        type: 'error'
      })
    }
  }

  // Reset input
  if (target) {
    target.value = ''
  }
}

// Pre-generation image upload handlers
function triggerPreGeneratedImageInput() {
  preGeneratedImageInput.value?.click()
}

function handlePreGeneratedImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = target.files
  
  if (files && files.length > 0) {
    const file = files[0]
    
    // Track the image upload for AI management
    trackImageUpload(file)
    
    // Open crop modal instead of setting directly
    cropImageSrc.value = URL.createObjectURL(file)
    cropImageFile.value = file
    isPreGenerationCrop.value = true
    showCropModal.value = true
  }
  
  // Reset input
  if (target) {
    target.value = ''
  }
}

// Handle crop completion (Updated for Chat)


function removePreGeneratedImage() {
  preGeneratedImageFile.value = null
  if (preGeneratedImagePreview.value) {
    URL.revokeObjectURL(preGeneratedImagePreview.value)
    preGeneratedImagePreview.value = null
  }
}

onMounted(() => {
  // Clear previous form data
  autoDesignStore.resetFormData()

  // Set category
  autoDesignStore.setCategory('sticker')

  // Load default template
  loadCategoryTemplate('naming')

  // Load wedding template if wedding category is selected
  if (selectedCategory.value === 'wedding') {
    nextTick(() => {
      loadWeddingStickerTemplate()
    })
  } else if (selectedCategory.value === 'graduation') {
    nextTick(() => {
      loadGraduationTemplate()
    })
  }
})
</script>

<style scoped>
/* Wedding Warning Banner */
.wedding-warning-banner {
  background: linear-gradient(to right, #eff6ff, #f5f3ff);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  position: relative;
  box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
  animation: slideDown 0.4s ease-out;
}

.warning-icon-wrapper {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  background: #dbeafe;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.warning-icon {
  width: 24px;
  height: 24px;
}

.warning-content {
  flex: 1;
}

.warning-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.warning-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e40af;
  margin: 0;
}

.warning-badge {
  background: #dbeafe;
  color: #1e40af;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.warning-body {
  color: #3b82f6;
}

.warning-main-text {
  font-size: 14px;
  color: #1e3a8a;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0 0 16px 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

.warning-list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #1e40af;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #2563eb;
  flex-shrink: 0;
}

.warning-example {
  background: rgba(255, 255, 255, 0.6);
  border: 1px dashed #93c5fd;
  border-radius: 8px;
  padding: 12px;
}

.example-label {
  font-size: 12px;
  font-weight: 600;
  color: #2563eb;
  margin: 0 0 4px 0;
}

.example-code {
  font-family: monospace;
  font-size: 13px;
  color: #1e40af;
  background: rgba(255, 255, 255, 0.5);
  padding: 2px 4px;
  border-radius: 4px;
}

.warning-dismiss-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #93c5fd;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.warning-dismiss-btn:hover {
  background: #dbeafe;
  color: #1e40af;
}

.warning-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.start-design-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
}

.start-design-btn:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
}

.start-design-btn:active {
  transform: translateY(0);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Graduation Preview Styles */
.graduation-preview-section {
  margin-top: 24px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.canvas-container-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.wedding-preview-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.wedding-preview-container svg {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
  min-height: auto;
}
.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.sticker-template-panel {
  min-height: 100vh;
  background: #f9fafb;
  padding: 16px;
  position: relative;
  display: flex;
  justify-content: center;
  overflow-x: hidden;
  /* Removed overflow-y: auto to allow natural scrolling */
}

.form-view {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.preview-view {
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn,
.menu-btn {
  padding: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover,
.menu-btn:hover {
  background: #f3f4f6;
}

.panel-title {
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

/* Category selection */
.category-selection-container {
  margin-top: 8px;
  padding: 20px 4px 12px;
}

.selection-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 20px;
  text-align: center;
  letter-spacing: -0.02em;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.category-card {
  background: white;
  border-radius: 16px;
  border: 1.5px solid #e5e7eb;
  padding: 20px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
}

.category-card:hover {
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

.category-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-name {
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.preview-section {
  margin-bottom: 24px;
}

.preview-box {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in preview container */
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.form-section {
  position: relative;
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  resize: vertical;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-label {
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.color-picker-section,
.custom-size-section {
  margin-bottom: 20px;
}

.color-input {
  width: 80px;
  height: 48px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
}

.custom-size-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.image-upload-section {
  margin-bottom: 24px;
}

.image-slots-container {
  overflow-x: auto;
  padding-bottom: 8px;
}

.image-slots {
  display: flex;
  gap: 12px;
  min-width: min-content;
}

.image-slot {
  position: relative;
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in image slot */
}

.add-image-slot-btn {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.add-image-slot-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.remove-image-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;
}

.upload-label {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.slot-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hidden {
  display: none;
}

.generate-btn {
  width: 100%;
  padding: 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.generate-btn:hover:not(:disabled) {
  background: #2563eb;
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Generate Wedding Preview Button */
.generate-preview-section {
  margin: 24px 0;
  text-align: center;
}

.generate-preview-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}

.generate-preview-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.4);
}

.generate-preview-btn:active:not(:disabled) {
  transform: translateY(0);
}

.generate-preview-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #cbd5e1;
  box-shadow: none;
}

.generate-hint {
  margin-top: 12px;
  font-size: 14px;
  color: #64748b;
}

/* Preview View Styles */
.preview-view {
  min-height: calc(100vh - 40px);
  background: white;
  border-radius: 16px;
  overflow: auto;
  /* Changed from overflow: hidden to allow scrolling in modal content */
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.back-to-form-btn {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-to-form-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateX(-2px);
}

.preview-title {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  flex: 1;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 10px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.preview-content {
  padding: 40px;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.loading-text {
  margin-top: 24px;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.loading-subtext {
  margin-top: 8px;
  font-size: 14px;
  color: #6b7280;
}

.preview-result {
  width: 100%;
  max-width: 1200px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 40px;
  align-items: start;
}

.preview-image-container {
  background: #f9fafb;
  border-radius: 16px;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.generated-image {
  max-width: 100%;
  max-height: 600px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.preview-info {
  background: #f9fafb;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preview-info-title {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.preview-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e5e7eb;
}

.preview-info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* Wedding Sticker Preview */
.wedding-preview-section {
  margin-top: 24px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.wedding-preview-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 10px;
  padding: 8px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  position: relative;
  overflow: hidden;
}

.wedding-preview-container svg {
  width: 100%;
  height: auto;
  display: block;
  max-width: 100%;
  min-height: auto;
}

.wedding-photo-konva-host {
  position: absolute;
  inset: 8px;
  pointer-events: auto;
}

.wedding-preview-controls {
  margin-top: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 10px;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  box-shadow: 0 6px 20px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wedding-controls-row {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.wedding-controls-row .wedding-control-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  transition: all 0.18s ease;
}

.wedding-control-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #6366f1);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
}

.wedding-control-btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
}

.wedding-control-btn.secondary {
  background: #f9fafb;
  color: #111827;
  border: 1px solid #e5e7eb;
}

.wedding-control-btn.secondary:hover {
  background: #eff6ff;
}

/* Pre-upload Preview Styles */
.pre-upload-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10px;
}

.pre-upload-image-container {
  position: relative;
  display: inline-flex;
  line-height: 0;
}

.preview-thumbnail {
  max-width: 120px;
  max-height: 120px;
  width: auto;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  display: block;
}

.remove-preview-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.remove-preview-btn:hover {
  background: #fef2f2;
  transform: scale(1.1);
}

/* Validation Warnings */
.validation-warnings-container {
  margin-top: 12px;
  padding: 12px 16px;
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: 8px;
}

.warning-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #92400e;
  font-weight: 600;
}

.warning-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.warning-list-item {
  padding: 4px 0;
  padding-left: 24px;
  color: #92400e;
  font-size: 0.9rem;
  position: relative;
}

.warning-list-item:before {
  content: "•";
  position: absolute;
  left: 8px;
  color: #fbbf24;
  font-weight: bold;
}

/* Edit Description Button */
.edit-description-trigger {
  margin: 16px 0;
  text-align: center;
}

.edit-description-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.edit-description-btn:hover {
  background: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.retouch-image-btn:hover:not(:disabled) {
  background: #0ea5e9;
}

/* Image Scale Control */
.image-scale-control {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.scale-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
}

.scale-slider {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: linear-gradient(to right, #e2e8f0, #3b82f6, #e2e8f0);
  outline: none;
  -webkit-appearance: none;
  margin-bottom: 12px;
}

.scale-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.5);
  transition: all 0.2s;
}

.scale-slider::-webkit-slider-thumb:hover {
  background: #2563eb;
  transform: scale(1.15);
  box-shadow: 0 3px 6px rgba(59, 130, 246, 0.6);
}

.scale-slider::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.5);
  transition: all 0.2s;
}

.scale-slider::-moz-range-thumb:hover {
  background: #2563eb;
  transform: scale(1.15);
  box-shadow: 0 3px 6px rgba(59, 130, 246, 0.6);
}

.scale-presets {
  display: flex;
  gap: 8px;
  justify-content: space-between;
}

.preset-btn {
  flex: 1;
  padding: 6px 10px;
  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
  transform: translateY(-1px);
}

.preset-btn:active {
  transform: translateY(0);
}

/* Image Drop Zone */
.image-drop-zone {
  padding: 32px;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
  background: #f9fafb;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}

.image-drop-zone:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.drop-zone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.drop-zone-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin: 0;
}

.drop-zone-subtext {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

/* Processing Indicator */
.processing-indicator {
  margin: 16px 0;
  padding: 16px;
  background: #eff6ff;
  border: 1px solid #3b82f6;
  border-radius: 8px;
}

.processing-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.processing-spinner {
  width: 32px;
  height: 32px;
  color: #3b82f6;
}

.processing-text {
  flex: 1;
}

.processing-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e40af;
  margin: 0 0 4px 0;
}

.processing-progress {
  font-size: 0.85rem;
  color: #3b82f6;
  margin: 0;
}

.cancel-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.cancel-btn:hover {
  background: #dc2626;
}

/* Background Removal Error */
.background-removal-error {
  margin: 16px 0;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-icon {
  width: 24px;
  height: 24px;
  color: #dc2626;
  flex-shrink: 0;
}

.error-text {
  flex: 1;
}

.error-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #991b1b;
  margin: 0 0 4px 0;
}

.error-message {
  font-size: 0.85rem;
  color: #b91c1c;
  margin: 0 0 4px 0;
}

.error-hint {
  font-size: 0.8rem;
  color: #dc2626;
  margin: 0;
  font-style: italic;
}

.error-close-btn {
  padding: 4px 8px;
  background: transparent;
  color: #dc2626;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  line-height: 1;
  transition: all 0.2s;
}

.error-close-btn:hover {
  color: #991b1b;
  background: rgba(220, 38, 38, 0.1);
  border-radius: 4px;
}

.upload-error {
  margin: 12px 0;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.9rem;
}

/* SVG Image Management */
.svg-image-management {
  margin-top: 20px;
}

/* Edit Modal */
.edit-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modalFadeIn 0.3s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.edit-modal-container {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(40px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

.edit-modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px 0;
}

.edit-modal-subtitle {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0 0 24px 0;
}

.edit-modal-content {
  margin-bottom: 24px;
}

.edit-modal-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  resize: vertical;
  font-family: inherit;
}

.edit-modal-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.edit-modal-actions {
  display: flex;
  justify-content: flex-end;
}

.edit-modal-ok-btn {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.edit-modal-ok-btn:hover {
  background: #2563eb;
}

.modal-warnings {
  margin-top: 16px;
}

/* Responsive */
@media (max-width: 1024px) {
  .preview-result {
    grid-template-columns: 1fr;
  }

  .preview-content {
    padding: 20px;
  }

  .wedding-preview-container {
    max-width: 100%;
  }
}

@media (max-width: 640px) {
  .preview-header {
    padding: 16px;
  }

  .preview-title {
    font-size: 18px;
  }

  .back-to-form-btn span {
    display: none;
  }

  .wedding-preview-section {
    padding: 8px;
  }

  .wedding-preview-container {
    padding: 0;
    max-width: 100%;
    margin: 0;
    border-radius: 4px;
    overflow-x: hidden;
    display: flex;
    justify-content: center;
    overflow: hidden;
    position: relative;
    height: auto !important;
    max-width: 100%;
  }
}

/* Generating Overlay Styles */
.generating-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
    inset: 8px;
    z-index: 2;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.3s ease-out;
}

.generating-content {
  text-align: center;
  padding: 2rem;
  animation: generatingFloat 3.2s ease-in-out infinite;
}

.generating-spinner {
  display: inline-block;
  position: relative;
  width: 140px;
  height: 140px;
  margin-bottom: 2rem;
}

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border: 3px solid transparent;
  animation: spinnerOrbit 2.2s cubic-bezier(0.45, 0, 0.25, 1) infinite;
}

.spinner-ring:nth-child(1) {
  inset: 0;
  border-top-color: #4f46e5;
  border-left-color: rgba(79, 70, 229, 0.3);
  box-shadow: 0 0 25px rgba(79, 70, 229, 0.35);
}

.spinner-ring:nth-child(2) {
  inset: 10px;
  border-bottom-color: #0ea5e9;
  border-right-color: rgba(14, 165, 233, 0.4);
  animation-duration: 2.8s;
  animation-direction: reverse;
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.35);
}

.spinner-ring:nth-child(3) {
  inset: 22px;
  border-top-color: #f97316;
  border-left-color: rgba(249, 115, 22, 0.4);
  animation-duration: 3.4s;
  box-shadow: 0 0 18px rgba(249, 115, 22, 0.35);
}

.generating-spinner::before {
  content: '';
  position: absolute;
  inset: 32px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #ffffff, #e0f2fe 45%, #e0f2fe00 70%);
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
}

.generating-spinner::after {
  content: '';
  position: absolute;
  inset: 46px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #f9fafb, #e5e7eb);
}

@keyframes spinnerOrbit {
  0% {
    transform: rotate(0deg) scale(0.98);
  }
  50% {
    transform: rotate(180deg) scale(1.02);
  }
  100% {
    transform: rotate(360deg) scale(0.98);
  }
}

@keyframes generatingFloat {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
  100% {
    transform: translateY(0px);
  }
}

.generating-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.generating-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

/* Image List Section */
.image-list-section {
  margin-top: 20px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.image-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.image-list-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.clear-all-btn {
  padding: 6px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.clear-all-btn:hover {
  background: #dc2626;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.image-gallery-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.image-gallery-item:hover {
  border-color: #3b82f6;
  transform: scale(1.02);
}

.image-gallery-item.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.gallery-thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-item-actions {
  position: absolute;
  top: 4px;
  right: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.image-gallery-item:hover .gallery-item-actions {
  opacity: 1;
}

.gallery-remove-btn {
  padding: 4px;
  background: rgba(239, 68, 68, 0.9);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.gallery-remove-btn:hover {
  background: #dc2626;
}

.gallery-item-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 4px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  text-align: center;
  font-weight: 500;
}

/* Edit Toggle Button */
.edit-toggle-section {
  margin-top: 16px;
  text-align: center;
}

.edit-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.edit-toggle-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.edit-toggle-btn:active {
  transform: translateY(0);
}

.edit-toggle-btn svg:last-child {
  transition: transform 0.3s ease;
}

.edit-toggle-btn svg.rotate-180 {
  transform: rotate(180deg);
}

/* Image Controls Container */
.image-controls-container {
  margin-top: 16px;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.flip-controls-section {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.flip-image-btn,
.retouch-image-btn {
  flex: 1;
  min-width: 120px;
  padding: 8px 12px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.flip-image-btn:hover,
.retouch-image-btn:hover:not(:disabled) {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.retouch-image-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Upload Modal Styles */
.upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: modalFadeIn 0.3s ease-out;
}

.upload-modal-container {
  position: relative;
  background: white;
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;
  border: 1px solid #e5e7eb;
}

.upload-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  padding: 8px;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.upload-modal-close:hover {
  background: #e5e7eb;
  color: #374151;
  transform: rotate(90deg);
}

.upload-modal-content {
  text-align: center;
}

.upload-modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  margin-bottom: 24px;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
  }
}

.upload-modal-icon svg {
  width: 48px;
  height: 48px;
  color: white;
}

.upload-modal-title {
  font-size: 28px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.upload-modal-description {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 32px 0;
}

.upload-modal-actions {
  margin-top: 32px;
}

.upload-modal-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
}

.upload-modal-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
}

.upload-modal-btn:active {
  transform: translateY(0);
}

.upload-modal-btn svg {
  width: 20px;
  height: 20px;
}

.upload-modal-processing {
  margin-top: 32px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 16px;
}

.processing-spinner-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.processing-spinner-large {
  width: 48px;
  height: 48px;
  color: #667eea;
}

.processing-status-text {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.processing-progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.processing-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.processing-progress-text {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  margin: 0;
}

.upload-modal-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
  padding: 24px;
  background: #f0fdf4;
  border-radius: 16px;
  color: #16a34a;
  animation: successPop 0.5s ease-out;
}

@keyframes successPop {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.upload-modal-success svg {
  width: 48px;
  height: 48px;
}

.upload-modal-success p {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.background-removal-toggle {
  text-align: left;
}

.toggle-label {
  cursor: pointer;
  user-select: none;
}

.toggle-checkbox {
  cursor: pointer;
  accent-color: #667eea;
}

.toggle-text {
  font-size: 0.95rem;
}

.toggle-hint {
  font-size: 0.85rem;
}

@media (min-width: 768px) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Mobile Responsive Styles */
@media (max-width: 768px) {
  /* Category cards mobile */
  .category-selection-container {
    padding: 16px 8px 12px;
  }

  .selection-title {
    font-size: 16px;
    margin-bottom: 16px;
  }

  .category-grid {
    gap: 12px;
  }

  .category-card {
    padding: 16px 14px;
    gap: 12px;
  }

  .category-icon {
    width: 38px;
    height: 38px;
    font-size: 20px;
  }

  .category-name {
    font-size: 14px;
  }

  /* Wedding controls mobile */
  .wedding-controls-row {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .wedding-control-btn {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    justify-content: center;
    padding: 8px 12px !important;
    font-size: 0.8rem !important;
  }

  .wedding-control-btn svg,
  .wedding-control-btn .w-4 {
    width: 14px !important;
    height: 14px !important;
  }

  /* Flip controls mobile */
  .flip-controls-section {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .flip-image-btn,
  .retouch-image-btn {
    flex: 1 1 calc(50% - 3px);
    min-width: 0;
    padding: 7px 10px;
    font-size: 0.75rem;
  }

  .flip-image-btn span,
  .retouch-image-btn span {
    display: inline;
  }

  .flip-image-btn svg,
  .retouch-image-btn svg {
    width: 12px;
    height: 12px;
  }

  /* Edit toggle button mobile */
  .edit-toggle-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  .edit-toggle-btn svg {
    width: 14px;
    height: 14px;
  }

  /* Image controls container mobile */
  .image-controls-container {
    padding: 12px;
    margin-top: 12px;
  }

  /* Scale slider mobile */
  .scale-slider-container {
    padding: 12px;
  }

  .scale-preset-buttons {
    flex-wrap: wrap;
    gap: 8px;
  }

  .preset-btn {
    flex: 1 1 calc(33.333% - 6px);
    min-width: 70px;
    padding: 8px 12px;
    font-size: 0.85rem;
  }

  /* Form sections mobile */
  .form-group {
    margin-bottom: 16px;
  }

  .form-label {
    font-size: 14px;
    margin-bottom: 6px;
  }

  /* Generate button mobile */
  .generate-preview-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
    width: 100%;
  }

  .generate-preview-btn svg {
    width: 16px;
    height: 16px;
  }

  .generate-preview-section {
    margin: 16px 0;
    padding: 0 8px;
  }

  /* Image scale control mobile */
  .image-scale-control {
    padding: 10px;
    margin-top: 10px;
  }

  .scale-label {
    font-size: 0.8rem;
    margin-bottom: 8px;
  }

  .scale-label svg {
    width: 14px;
    height: 14px;
  }

  .scale-presets {
    gap: 6px;
  }

  .preset-btn {
    flex: 1 1 calc(33.333% - 4px);
    min-width: 55px;
    padding: 5px 6px;
    font-size: 0.7rem;
  }

  /* Edit toggle button mobile */
  .edit-toggle-section {
    margin-top: 12px;
  }

  .edit-toggle-btn {
    padding: 7px 14px;
    font-size: 0.8rem;
  }

  /* Image controls container mobile */
  .image-controls-container {
    padding: 10px;
  }

  .image-scale-control {
    padding: 10px;
    margin-top: 0;
  }

  /* Preview info mobile */
  .preview-info {
    padding: 20px;
  }

  .preview-info-title {
    font-size: 18px;
    margin-bottom: 16px;
  }

  .preview-info-item {
    padding: 12px 0;
  }

  .info-label,
  .info-value {
    font-size: 13px;
  }

  /* Export section mobile */
  .export-section {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }

  .export-section button {
    flex: 1 1 calc(50% - 4px);
    min-width: 0;
    padding: 8px 12px;
    font-size: 0.8rem;
  }

  .export-section button svg {
    width: 14px;
    height: 14px;
  }

  /* Modal mobile */
  .upload-modal-overlay {
    padding: 12px;
  }

  .upload-modal-container {
    max-width: 100%;
    margin: 0;
    padding: 20px;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-title {
    font-size: 18px;
  }

  .modal-body {
    padding: 16px;
  }

  /* Preview mobile */
  .wedding-preview-container {
    max-width: 100%;
    overflow-x: auto;
  }

  .wedding-preview-container svg {
    max-width: 100%;
    height: auto;
  }
}

@media (max-width: 480px) {
  /* Extra small mobile devices */
  .category-card {
    padding: 12px 10px;
    gap: 10px;
  }

  .category-icon {
    width: 34px;
    height: 34px;
    font-size: 16px;
  }

  .category-name {
    font-size: 12px;
  }

  .selection-title {
    font-size: 14px;
  }

  .wedding-control-btn {
    padding: 7px 10px !important;
    font-size: 0.75rem !important;
    gap: 4px;
  }

  .wedding-control-btn svg,
  .wedding-control-btn .w-4 {
    width: 12px !important;
    height: 12px !important;
  }

  .flip-image-btn,
  .retouch-image-btn {
    padding: 6px 8px;
    font-size: 0.7rem;
  }

  .flip-image-btn svg,
  .retouch-image-btn svg {
    width: 11px;
    height: 11px;
  }

  .preset-btn {
    flex: 1 1 calc(50% - 4px);
    font-size: 0.65rem;
    padding: 4px 6px;
  }

  .edit-toggle-btn {
    padding: 6px 12px;
    font-size: 0.75rem;
  }

  .edit-toggle-btn svg {
    width: 12px;
    height: 12px;
  }

  .generate-preview-btn {
    padding: 8px 16px;
    font-size: 0.85rem;
  }

  /* Adjust SVG container for very small screens */
  .wedding-preview-container {
    padding: 0;
  }

  .form-textarea {
    font-size: 13px;
    padding: 10px;
  }

  .scale-label {
    font-size: 0.75rem;
  }
}

/* Landscape mobile orientation */
@media (max-width: 896px) and (orientation: landscape) {
  .category-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .category-card {
    padding: 12px 10px;
  }

  .wedding-controls-row {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .wedding-control-btn {
    flex: 1 1 calc(50% - 6px);
    min-width: 140px;
  }
}

/* Touch device improvements */
@media (hover: none) and (pointer: coarse) {
  .category-card {
    -webkit-tap-highlight-color: transparent;
  }

  .category-card:active {
    transform: scale(0.98);
  }

  .wedding-control-btn:active {
    transform: scale(0.98);
  }

  .flip-image-btn:active,
  .retouch-image-btn:active {
    transform: scale(0.98);
  }

  /* Increase touch target sizes */
  button {
    min-height: 44px;
  }

  /* Improve slider thumb size for touch */
  .scale-slider::-webkit-slider-thumb {
    width: 24px;
    height: 24px;
  }

  .scale-slider::-moz-range-thumb {
    width: 24px;
    height: 24px;
  }
}

/* Safe area support for notched devices */
@supports (padding: max(0px)) {
  .preview-header,
  .category-selection-container,
  .form-section {
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
  }

  .upload-modal-container {
    padding-left: max(20px, env(safe-area-inset-left));
    padding-right: max(20px, env(safe-area-inset-right));
  }

  @media (max-width: 768px) {
    .wedding-controls-row,
    .flip-controls-section {
      padding-left: max(8px, env(safe-area-inset-left));
      padding-right: max(8px, env(safe-area-inset-right));
    }
  }
}

/* Prevent text selection on interactive elements (better mobile UX) */
.category-card,
.wedding-control-btn,
.flip-image-btn,
.retouch-image-btn,
.preset-btn {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Fix for iOS input zoom */
@media (max-width: 768px) {
  input[type="text"],
  input[type="range"],
  textarea,
  select {
    font-size: 16px !important;
  }
}

/* Smooth scrolling for mobile */
@media (max-width: 768px) {
  .wedding-preview-container,
  .upload-modal-container,
  .preview-view {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }
}

/* Improve button spacing on very small screens */
@media (max-width: 360px) {
  .wedding-control-btn {
    padding: 6px 10px !important;
    font-size: 0.7rem !important;
    gap: 3px;
  }

  .wedding-control-btn svg {
    width: 11px !important;
    height: 11px !important;
  }

  .flip-image-btn,
  .retouch-image-btn {
    padding: 6px 10px;
    font-size: 0.7rem;
  }

  .flip-image-btn svg,
  .retouch-image-btn svg {
    width: 11px;
    height: 11px;
  }

  .preset-btn {
    padding: 5px 6px;
    font-size: 0.65rem;
  }

  .category-name {
    font-size: 11px;
  }

  .category-icon {
    width: 32px;
    height: 32px;
    font-size: 15px;
  }

  .edit-toggle-btn {
    padding: 6px 10px;
    font-size: 0.7rem;
  }

  .generate-preview-btn {
    padding: 7px 14px;
    font-size: 0.8rem;
  }
}

/* AI Chat Footer */
.ai-chat-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #e5e7eb;
  padding: 12px 16px;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 1000;
}

/* Chat SVG Preview Styles */
.chat-svg-preview {
  margin: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}

.svg-preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.preview-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
}

.edit-preview-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-preview-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.export-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.export-action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #1f2937;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-action-btn:hover {
  background: #111827;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Footer Action Buttons */
.chat-footer-actions {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  gap: 12px;
}

.footer-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-action-btn.edit-btn {
  background: #f3f4f6;
  color: #374151;
}

.footer-action-btn.edit-btn:hover {
  background: #e5e7eb;
  transform: translateY(-1px);
}

.footer-action-btn.export-btn {
  background: #1f2937;
  color: white;
}

.footer-action-btn.export-btn:hover {
  background: #111827;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.chat-input-container {
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
}

.chat-add-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  color: #374151;
}

.chat-add-btn:hover {
  background: #e5e7eb;
  border-color: #9ca3af;
}

.chat-add-btn.active {
  background: #1f2937;
  border-color: #1f2937;
  color: white;
  transform: rotate(45deg);
}

.chat-input-wrapper {
  flex: 1;
  position: relative;
}

.chat-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 24px;
  font-size: 15px;
  outline: none;
  transition: all 0.2s ease;
  background: #f9fafb;
}

.chat-input:focus {
  border-color: #1f2937;
  background: white;
  box-shadow: 0 0 0 3px rgba(31, 41, 55, 0.1);
}

.chat-input::placeholder {
  color: #9ca3af;
}

.chat-voice-btn,
.chat-send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.chat-voice-btn {
  background: #f3f4f6;
  color: #374151;
}

.chat-voice-btn:hover {
  background: #e5e7eb;
}

.chat-send-btn {
  background: #1f2937;
  color: white;
}

.chat-send-btn:hover:not(:disabled) {
  background: #111827;
  transform: translateY(-1px);
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-send-btn svg {
  transform: rotate(90deg);
}

/* Upload Options Popup */
.upload-options-popup {
  position: absolute;
  bottom: 70px;
  left: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 8px;
  min-width: 200px;
  animation: slideUp 0.2s ease-out;
  z-index: 1001;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.upload-option-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-size: 15px;
  font-weight: 500;
}

.upload-option-btn:hover {
  background: #f3f4f6;
}

.upload-option-btn svg {
  color: #1f2937;
}

/* Chat Image Styles */
.chat-image-container {
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  max-width: 200px;
  border: 1px solid #e5e7eb;
}

.chat-image {
  width: 100%;
  height: auto;
  display: block;
}

/* Mobile adjustments for chat footer */
@media (max-width: 768px) {
  .ai-chat-footer {
    padding: 10px 12px;
  }

  .chat-footer-actions {
    padding: 10px 12px;
    gap: 10px;
  }

  .footer-action-btn {
    padding: 10px 16px;
    font-size: 0.875rem;
  }

  .footer-action-btn svg {
    width: 18px;
    height: 18px;
  }

  .chat-input-container {
    gap: 8px;
  }

  .chat-add-btn,
  .chat-voice-btn,
  .chat-send-btn {
    width: 38px;
    height: 38px;
  }

  .chat-add-btn svg,
  .chat-voice-btn svg,
  .chat-send-btn svg {
    width: 18px;
    height: 18px;
  }

  .chat-input {
    padding: 10px 14px;
    font-size: 14px;
  }

  .upload-options-popup {
    left: 12px;
    bottom: 60px;
    min-width: 180px;
  }

  .upload-option-btn {
    padding: 10px 14px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .ai-chat-footer {
    padding: 8px 10px;
  }

  .chat-input-container {
    gap: 6px;
  }

  .chat-add-btn,
  .chat-voice-btn,
  .chat-send-btn {
    width: 36px;
    height: 36px;
  }

  .chat-add-btn svg,
  .chat-voice-btn svg,
  .chat-send-btn svg {
    width: 16px;
    height: 16px;
  }

  .chat-input {
    padding: 9px 12px;
    font-size: 13px;
  }

  .upload-options-popup {
    left: 10px;
    bottom: 56px;
  }

  .upload-option-btn {
    padding: 9px 12px;
    font-size: 13px;
    gap: 10px;
  }
}

/* Chat History Styles */
.wedding-chat-interface {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 200px); /* Adjust based on header/footer */
  overflow: hidden;
  background: #f9fafb;
  margin: -20px -20px 0 -20px; /* Negative margin to fill container */
  position: relative;
}

/* Chat Controls Header */
.chat-controls-header {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.chat-control-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.chat-control-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.chat-control-btn.active {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.chat-history {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  padding-top: 50px; /* Space for controls */
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 100px; /* Space for footer */
}

.chat-welcome-message {
  text-align: center;
  padding: 40px 20px;
  color: #4b5563;
}

.welcome-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.chat-welcome-message h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
}

.chat-welcome-message p {
  font-size: 0.95rem;
  line-height: 1.5;
  max-width: 300px;
  margin: 0 auto;
}

.chat-message {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  animation: fadeIn 0.3s ease-out;
}

.chat-message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.chat-message.ai {
  align-self: flex-start;
  align-items: flex-start;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 0.95rem;
  line-height: 1.5;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.chat-message.user .message-bubble {
  background: #1f2937;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-message.ai .message-bubble {
  background: white;
  color: #1f2937;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.7rem;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 4px;
}

.chat-image-container {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 200px;
}

.chat-image {
  width: 100%;
  height: auto;
  display: block;
}

/* Analyzing Animation */
.message-bubble.analyzing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 16px 20px;
  min-width: 60px;
  justify-content: center;
}

.typing-dot {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

/* Generating Animation in Chat */
.message-bubble.generating {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
  min-width: 250px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.generating-spinner-inline {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.spinner-ring-inline {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring-inline:nth-child(2) { animation-delay: 0.1s; }
.spinner-ring-inline:nth-child(3) { animation-delay: 0.2s; }

@keyframes spin {
  to { transform: rotate(360deg); }
}

.generating-text {
  text-align: center;
}

.generating-title-inline {
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.generating-subtitle-inline {
  font-size: 0.8rem;
  opacity: 0.9;
}

/* SVG Bubble in Chat */
.message-bubble.svg-bubble {
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  max-width: 100%;
  width: 100%;
  border-radius: 12px;
  overflow: visible;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.wedding-preview-container-inline {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  touch-action: none; /* Enable touch gestures for dragging/pinching */
  background: #fafafa;
  border-radius: 8px;
}

.wedding-preview-container-inline svg {
  width: auto !important;
  height: auto !important;
  max-width: 100%;
  max-height: 60vh;
  display: block;
  touch-action: pan-x pan-y pinch-zoom; /* Allow pan and zoom gestures */
}

/* Make SVG images draggable with visual feedback */
.wedding-preview-container-inline svg image {
  cursor: move;
  cursor: grab;
  transition: opacity 0.2s ease;
}

.wedding-preview-container-inline svg image:active {
  cursor: grabbing;
  opacity: 0.8;
}

/* Mobile: Optimize for touch */
@media (max-width: 768px) {
  .message-bubble.svg-bubble {
    max-width: 95%;
    padding: 12px;
  }
  
  .wedding-preview-container-inline svg {
    max-height: 400px;
  }
}

@keyframes typing {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Add bottom padding to main container to account for fixed footer */
.form-section,
.wedding-preview-section {
  margin-bottom: 80px;
}

@media (max-width: 768px) {
  .form-section,
  .wedding-preview-section {
    margin-bottom: 70px;
  }
}
</style>


