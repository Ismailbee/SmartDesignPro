<template>
  <!-- eslint-disable vue/no-deprecated-slot-attribute -->
  <ion-page class="imposition-page">
    <ion-header>
      <ion-toolbar>
        <ion-title>Smart Imposition Studio</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" color="primary" :disabled="!canReset" @click="resetForm">
            <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
            Reset
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
      
    </ion-header>
    <!-- Navigation Header with Imposition Options -->
    <div class="imposition-nav-toolbar">
      <div class="imposition-nav">
        <!-- Imposition Type -->
        <div class="nav-item dropdown" @mouseenter="openDropdown('type')" @mouseleave="closeDropdown">
          <button class="nav-button" @click.stop="toggleDropdown('type')">
            <ion-icon :icon="gridOutline"></ion-icon>
            <span>{{ selectedTypeLabel }}</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'type'" class="dropdown-bridge"></div>
          <div v-if="activeDropdown === 'type'" class="dropdown-menu" @click.stop>
            <button
              v-for="option in impositionTypes"
              :key="option.value"
              class="dropdown-item"
              :class="{ active: selectedType === option.value }"
              :title="option.description"
              @click="selectType(option.value)"
            >
              <strong>{{ option.label }}</strong>
            </button>
          </div>
        </div>

        <!-- Merge PDFs Button -->
        <div class="nav-item">
          <button 
            class="nav-button" 
            :class="{ 'active': selectedType === 'merge' }"
            @click="selectType('merge')"
          >
            <ion-icon :icon="documentAttachOutline"></ion-icon>
            <span>Merge PDFs</span>
          </button>
        </div>

        <!-- Options -->
        <div class="nav-item dropdown" ref="optionsButton" :class="{ 'disabled-dropdown': isMergePDFsSelected }" @mouseenter="!isMergePDFsSelected && openDropdown('options')" @mouseleave="closeDropdown">
          <button class="nav-button" :disabled="isMergePDFsSelected" @click.stop="!isMergePDFsSelected && toggleDropdown('options')">
            <ion-icon :icon="optionsOutline"></ion-icon>
            <span>Options</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
        </div>

        <!-- Rotation -->
        <div class="nav-item dropdown" :class="{ 'disabled-dropdown': isMergePDFsSelected }" @mouseenter="!isMergePDFsSelected && openDropdown('rotation')" @mouseleave="closeDropdown">
          <button class="nav-button" :disabled="isMergePDFsSelected" @click.stop="!isMergePDFsSelected && toggleDropdown('rotation')">
            <ion-icon :icon="reloadOutline"></ion-icon>
            <span>Rotation</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'rotation'" class="dropdown-bridge"></div>
          <div v-if="activeDropdown === 'rotation'" class="dropdown-menu" @click.stop>
            <label class="dropdown-item toggle-item">
              <span>0°</span>
              <ion-toggle
                :checked="rotationAngle === 0"
                color="primary"
                @ion-change="(e) => { if (e.detail.checked) selectRotation(0); }"
              ></ion-toggle>
            </label>
            <label class="dropdown-item toggle-item">
              <span>Top 180°</span>
              <ion-toggle
                :checked="rotationAngle === 180 && rotationType === 'top'"
                color="primary"
                @ion-change="(e) => { if (e.detail.checked) selectRotation(180, 'top'); }"
              ></ion-toggle>
            </label>
            <label class="dropdown-item toggle-item">
              <span>Bottom 180°</span>
              <ion-toggle
                :checked="rotationAngle === 180 && rotationType === 'bottom'"
                color="primary"
                @ion-change="(e) => { if (e.detail.checked) selectRotation(180, 'bottom'); }"
              ></ion-toggle>
            </label>
          </div>
        </div>

        <!-- Generate Button -->
        <ion-button
          class="generate-btn"
          color="primary"
          :disabled="!canSubmit"
          @click="submitImposition"
        >
          <ion-spinner v-if="isSubmitting" slot="start"></ion-spinner>
          <ion-icon v-else slot="start" :icon="documentOutline"></ion-icon>
          Generate PDF
        </ion-button>
      </div>
    </div>
    
    <ion-content fullscreen class="imposition-content">
      <div class="main-container">
        <div class="split-layout">
          <!-- Left Panel: Upload -->
          <div class="panel left-panel">
            <div class="panel-header">
              <div class="header-icon">
                <ion-icon :icon="cloudUploadOutline"></ion-icon>
              </div>
              <div class="header-content">
                <h2>Upload Files</h2>
                <p>Drag & drop or click to upload your PDFs and images</p>
              </div>
            </div>
            <div class="panel-body">
              <div
                class="drop-zone-modern"
                :class="{ dragging: isDragging, 'has-files': files.length > 0 }"
                @dragover.prevent="onDragOver"
                @dragleave="onDragLeave"
                @drop.prevent="onDrop"
              >
                  <!-- Upload Interface (shown when no files) -->
                  <div v-if="files.length === 0" class="upload-interface">
                    <ion-icon :icon="cloudUploadOutline"></ion-icon>
                    <p>Drag & drop files here</p>
                    <ion-button fill="outline" color="primary" @click="openFilePicker">Choose files</ion-button>
                  </div>
                  
                  <!-- File Preview Interface (shown when files exist) -->
                  <div v-else class="file-preview-interface">
                    <div class="file-header">
                      <h4>{{ files.length }} file(s) uploaded</h4>
                      <div class="header-actions">
                        <ion-button fill="clear" size="small" color="primary" @click="openFilePicker">
                          <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
                          Add more
                        </ion-button>
                      </div>
                    </div>
                    
                    <div class="file-items-grid">
                      <div 
                        v-for="(file, index) in files" 
                        :key="index"
                        class="file-item-compact"
                        draggable="true"
                        @dragstart="onFileDragStart($event, index)"
                        @dragover.prevent="onFileDragOver($event, index)"
                        @dragenter.prevent="onFileDragEnter($event, index)"
                        @dragleave="onFileDragLeave($event, index)"
                        @drop.prevent="onFileDrop($event, index)"
                        @dragend="onFileDragEnd"
                        :class="{ 'dragging-file': draggedFileIndex === index, 'drag-over': dragOverFileIndex === index }"
                      >
                        <div class="drag-handle" v-if="files.length > 1">
                          <ion-icon :icon="reorderThreeOutline"></ion-icon>
                        </div>
                        <div class="file-preview">
                          <div v-if="filePreviews[index]?.type === 'image'" class="image-preview">
                            <img :src="filePreviews[index].url" :alt="file.name" />
                          </div>
                          <div v-else class="file-icon">
                            <ion-icon :icon="documentOutline"></ion-icon>
                          </div>
                        </div>
                        <div class="file-info">
                          <div class="file-name">{{ file.name }}</div>
                          <div class="file-details">
                            {{ (file.size / 1024 / 1024).toFixed(2) }} MB
                          </div>
                        </div>
                        <ion-button 
                          fill="clear" 
                          size="small" 
                          color="danger"
                          @click="removeFile(index)"
                          class="remove-btn"
                        >
                          <ion-icon :icon="closeOutline"></ion-icon>
                        </ion-button>
                      </div>
                    </div>
                  </div>
                  
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    hidden
                    @change="onFileChange"
                  />
                </div>
                
                <!-- Success/Error Messages -->
                <div v-if="successMessage" class="message success-message">
                  <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                  {{ successMessage }}
                </div>
                <div v-if="fileError" class="message error-message">
                  <ion-icon :icon="warningOutline"></ion-icon>
                  {{ fileError }}
                </div>
            </div>
          </div>

          <!-- Right Panel: Preview & Download -->
          <div class="panel right-panel">
            <div class="panel-header">
              <div class="header-icon">
                <ion-icon :icon="documentTextOutline"></ion-icon>
              </div>
              <div class="header-content">
                <h2>Preview & Download</h2>
                <p>View your generated imposition and download the result</p>
              </div>
            </div>
            <div class="panel-body">
                <div v-if="isSubmitting" class="status">
                  <ion-spinner name="lines"></ion-spinner>
                  <div class="status-content">
                    <h3>Processing your files</h3>
                    <p>Generating imposition... This may take a moment for larger documents.</p>
                  </div>
                </div>

                <div v-else-if="errorMessage" class="status error">
                  <ion-icon :icon="warningOutline"></ion-icon>
                  <div class="status-content">
                    <h3>Generation Failed</h3>
                    <p>{{ errorMessage }}</p>
                  </div>
                </div>

                <div v-else-if="previewUrl" class="preview-container">
                  <div class="preview-header">
                    <h4>Generated PDF Preview</h4>
                    <div class="preview-info">
                      <span v-if="processingTime > 0">Processed in {{ processingTime }}ms</span>
                      <span style="color: green; font-weight: bold; margin-left: 10px;">✓ Preview Ready</span>
                      <ion-button 
                        fill="clear" 
                        size="small" 
                        color="primary"
                        @click="openPreview"
                      >
                        <ion-icon :icon="openOutline" slot="start"></ion-icon>
                        Open in new tab
                      </ion-button>
                    </div>
                  </div>
                  <div class="preview-frame" style="border: 3px solid green;">
                    <iframe 
                      :src="previewUrl" 
                      title="Generated PDF Preview" 
                      class="preview-iframe"
                      style="display: block; min-height: 600px;"
                      @load="() => console.log('✅ PDF iframe loaded')"
                      @error="(e) => console.error('❌ PDF iframe error:', e)"
                    ></iframe>
                  </div>
                </div>

                <div v-else-if="files.length > 0" class="file-preview-container">
                  <div class="preview-header">
                    <h4>File Preview</h4>
                    <div class="preview-info">
                      <span>{{ files.length }} file(s) uploaded</span>
                      <ion-button 
                        v-if="currentFilePreview"
                        fill="clear" 
                        size="small" 
                        color="primary"
                        @click="openCurrentFilePreview"
                      >
                        <ion-icon :icon="openOutline" slot="start"></ion-icon>
                        Open in new tab
                      </ion-button>
                    </div>
                  </div>
                  
                  <!-- File Navigation -->
                  <div v-if="files.length > 1" class="file-navigation">
                    <ion-button 
                      fill="clear" 
                      size="small"
                      :disabled="currentFileIndex === 0"
                      @click="previousFile"
                    >
                      <ion-icon :icon="chevronBackOutline"></ion-icon>
                    </ion-button>
                    <span class="file-counter">{{ currentFileIndex + 1 }} / {{ files.length }}</span>
                    <ion-button 
                      fill="clear" 
                      size="small"
                      :disabled="currentFileIndex === files.length - 1"
                      @click="nextFile"
                    >
                      <ion-icon :icon="chevronForwardOutline"></ion-icon>
                    </ion-button>
                  </div>
                  
                  <!-- Current File Info -->
                  <div class="current-file-info">
                    <div class="file-name">{{ files[currentFileIndex]?.name }}</div>
                    <div class="file-details">
                      {{ (files[currentFileIndex]?.size / 1024 / 1024).toFixed(2) }} MB • 
                      {{ files[currentFileIndex]?.type.split('/')[1] }}
                    </div>
                  </div>
                  
                  <!-- Preview Frame -->
                  <div class="preview-frame">
                    <div v-if="currentFilePreview?.type === 'image'" class="image-preview-large">
                      <img :src="currentFilePreview.url" :alt="files[currentFileIndex]?.name" />
                    </div>
                    <iframe 
                      v-else-if="currentFilePreview?.type === 'pdf'" 
                      :src="currentFilePreview.url" 
                      title="PDF Preview" 
                      class="preview-iframe"
                    ></iframe>
                    <div v-else class="file-preview-placeholder">
                      <ion-icon :icon="documentOutline"></ion-icon>
                      <p>{{ files[currentFileIndex]?.type }} file</p>
                      <p class="file-size">{{ (files[currentFileIndex]?.size / 1024 / 1024).toFixed(2) }} MB</p>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <ion-icon :icon="documentOutline"></ion-icon>
                  <h3>No files uploaded</h3>
                  <p>Upload files above to see the preview here, then generate an imposition.</p>
                </div>

                <div v-if="downloadUrl" class="actions">
                  <ion-button 
                    expand="block" 
                    fill="solid" 
                    color="primary" 
                    @click="downloadFile"
                  >
                    <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
                    Download imposed PDF
                  </ion-button>
                  <ion-button 
                    expand="block" 
                    fill="clear" 
                    color="primary" 
                    :disabled="!previewUrl" 
                    @click="openPreview"
                  >
                    <ion-icon slot="start" :icon="openOutline"></ion-icon>
                    Open imposed PDF
                  </ion-button>
                </div>
            </div>
          </div>
        </div>
      </div>
    </ion-content>

    <!-- Page Count Dialog -->
    <ion-alert
      :is-open="showPageCountDialog"
      header="Set Page Count"
      :message="`How many pages do you want for ${impositionTypes.find(t => t.value === pendingImpositionType)?.label || 'this imposition'}?`"
      :buttons="[
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'OK',
          role: 'confirm',
        },
      ]"
      :inputs="[
        {
          name: 'pageCount',
          type: 'number',
          placeholder: 'Enter number of pages',
          min: 1,
        },
      ]"
      @didDismiss="handleDialogDismiss"
    ></ion-alert>

    <!-- Options Dropdown (Teleported outside parent container) -->
    <Teleport to="body">
      <div v-if="activeDropdown === 'options'" class="dropdown-menu options-dropdown-teleport" :style="optionsDropdownStyle" @click.stop @mouseenter="openDropdown('options')" @mouseleave="closeDropdown">
        <!-- Other Options -->
        <label class="dropdown-item toggle-item" :class="{ 'disabled-item': isMergePDFsSelected }" style="padding: 10px 12px;" @mouseenter="closeSubmenuImmediately">
          <span style="min-width: 130px;">Blank page padding</span>
          <ion-toggle
            v-model="addBlankPages"
            color="primary"
            :disabled="isMergePDFsSelected"
          ></ion-toggle>
        </label>
        <label class="dropdown-item toggle-item" :class="{ 'disabled-item': isMergePDFsSelected }" style="padding: 10px 12px;" @mouseenter="closeSubmenuImmediately">
          <span style="min-width: 130px;">Crop marks</span>
          <ion-toggle
            v-model="addCropMarks"
            color="primary"
            :disabled="isMergePDFsSelected"
          ></ion-toggle>
        </label>
      </div>
    </Teleport>

  </ion-page>
</template>

<script setup>
import { onBeforeUnmount, ref, computed, watch, onMounted } from 'vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonNote,
  IonToggle,
  IonSpinner,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel,
  IonInput,
  IonAlert,
} from '@ionic/vue';
import { backendApi } from '@/services/backendApi.js';
import {
  cloudUploadOutline,
  documentOutline,
  downloadOutline,
  refreshOutline,
  warningOutline,
  gridOutline,
  documentTextOutline,
  documentAttachOutline,
  checkmarkCircleOutline,
  reorderThreeOutline,
  phonePortraitOutline,
  copyOutline,
  optionsOutline,
  chevronDownOutline,
  closeOutline,
  openOutline,
  chevronBackOutline,
  chevronForwardOutline,
  reloadOutline,
} from 'ionicons/icons';

// Page count dialog state
const showPageCountDialog = ref(false);
const pendingImpositionType = ref(null);
const requestedPageCount = ref('');

const impositionTypes = [
  {
    value: 'booklet',
    label: 'Booklet',
    description: 'Arrange spreads for saddle-stitch booklets',
  },
  {
    value: '2up',
    label: '2-Up',
    description: 'Place two pages per sheet for duplex printing',
  },
  {
    value: '2-side',
    label: '2-side',
    description: 'Front and back pages arranged for double-sided print.',
  },
  {
    value: 'tent-card',
    label: 'Tent-Card',
    description: 'A sheet printed on both sides, folded to stand like a tent.',
  },
  {
    value: 'tri-fold-brochure',
    label: 'Tri-Fold Brochure',
    description: 'Sheet divided into 3 panels and folded.',
  },
  {
    value: 'tri-fold-pamphlet',
    label: 'Tri-Fold Pamphlet',
    description: 'Standard tri-fold with specific panel arrangement.',
  },
  {
    value: '4up',
    label: '4-Up',
    description: 'Impose four mini pages per sheet',
  },
  {
    value: 'side-fold-card',
    label: 'Side-Fold Card',
    description: 'Fold on the long edge.',
  },
  {
    value: '8-up-perfect-bound-sheetwise',
    label: '8-up Perfect Bound Sheetwise',
    description: 'Eight pages imposed sheetwise for perfect binding.',
  },
  {
    value: '8-up-perfect-bound-work-turn',
    label: '8-up Perfect Bound Work & Turn',
    description: 'Print, turn on same grip, print again.',
  },
  {
    value: '8-up-perfect-bound-work-tumble',
    label: '8-up Perfect Bound Work & Tumble',
    description: 'Print, flip head-to-tail, print again.',
  },
  {
    value: '8-up-center-stitch-sheetwise',
    label: '8-up Center Stitch Sheetwise',
    description: 'Eight pages imposed sheetwise for center stitching.',
  },
  {
    value: '8-up-center-stitch-work-turn',
    label: '8-up Center Stitch Work & Turn',
    description: 'Center stitch with work & turn printing.',
  },
  {
    value: '8-up-center-stitch-work-tumble',
    label: '8-up Center Stitch Work & Tumble',
    description: 'Center stitch with work & tumble printing.',
  },
  {
    value: 'signature',
    label: 'Signature Imposition',
    description: 'Create printer signatures (4, 8, 16, or 32-page folded sections).',
  },
];

const pageSizes = [
  { value: 'auto', label: 'Auto (fit to content)' },
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'A2', label: 'A2 (420 × 594 mm)' },
  { value: 'A1', label: 'A1 (594 × 841 mm)' },
  { value: 'A0', label: 'A0 (841 × 1189 mm)' },
];

const fileInput = ref(null);
const file = ref(null); // Keep for backward compatibility
const files = ref([]); // New: array of files
const filePreviews = ref([]); // Stores preview URLs for all files
const draggedFileIndex = ref(null); // Track which file is being dragged
const dragOverFileIndex = ref(null); // Track which position is being hovered
const currentFileIndex = ref(0); // Current file being previewed
const isDragging = ref(false);
const fileError = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const isSubmitting = ref(false);
const previewUrl = ref('');
const downloadUrl = ref('');
const processingTime = ref(0);

const selectedType = ref('booklet');
const pageSizeValue = ref('auto');
const orientation = ref('portrait');
const autoDetectOrientation = ref(true);
const duplex = ref('long-edge');
const addBlankPages = ref(false);
const rotationAngle = ref(0); // New: rotation control for imposition
const rotationType = ref(null); // 'top', 'bottom', or null
const addCropMarks = ref(false);
const customSizeEnabled = ref(false);
const customWidth = ref('');
const customHeight = ref('');

// Dropdown navigation state
const activeDropdown = ref(null);
const expandedOptionSection = ref(null);
const optionsButton = ref(null);
const sizeButton = ref(null);
const orientationButton = ref(null);

// Computed style for positioning the teleported dropdown
const optionsDropdownStyle = computed(() => {
  if (!optionsButton.value) return {};
  const rect = optionsButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.bottom + 8}px`,
    left: `${rect.left}px`,
    zIndex: 99999
  };
});

// Computed style for Size submenu
const sizeSubmenuStyle = computed(() => {
  if (!sizeButton.value) return {};
  const rect = sizeButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.right + 9}px`,
    zIndex: 100000
  };
});

// Computed style for Orientation submenu
const orientationSubmenuStyle = computed(() => {
  if (!orientationButton.value) return {};
  const rect = orientationButton.value.getBoundingClientRect();
  return {
    position: 'fixed',
    top: `${rect.top}px`,
    left: `${rect.right + 9}px`,
    zIndex: 100000
  };
});

const validationWarning = ref('');

const canSubmit = computed(() => files.value.length > 0 && !isSubmitting.value && !validationWarning.value);
const canReset = computed(() => files.value.length > 0 || previewUrl.value || downloadUrl.value || successMessage.value || errorMessage.value);

// Computed labels for navigation
const selectedTypeLabel = computed(() => {
  const selected = impositionTypes.find(t => t.value === selectedType.value);
  return selected ? selected.label : 'Select Type';
});

const pageSizeLabel = computed(() => {
  if (customSizeEnabled.value) {
    return 'Custom Size';
  }
  const selected = pageSizes.find(s => s.value === pageSizeValue.value);
  return selected ? selected.label.split('(')[0].trim() : 'Select Size';
});

const duplexLabel = computed(() => {
  const labels = {
    'long-edge': 'Long-edge',
    'short-edge': 'Short-edge',
    'simplex': 'Single-sided'
  };
  return labels[duplex.value] || 'Duplex';
});

const rotationLabel = computed(() => {
  switch (rotationAngle.value) {
    case 0: return 'No rotation';
    case 90: return '90°';
    case 180: return '180°';
    case 270: return '270°';
    default: return `${rotationAngle.value}°`;
  }
});

// Check if Merge PDFs is selected (to disable options and rotation)
const isMergePDFsSelected = computed(() => {
  return selectedType.value === 'merge';
});

// Computed property for current file preview
const currentFilePreview = computed(() => {
  if (files.value.length === 0 || currentFileIndex.value >= filePreviews.value.length) {
    return null;
  }
  return filePreviews.value[currentFileIndex.value];
});

function createPreview(selectedFile) {
  if (selectedFile.type.startsWith('image/')) {
    return {
      type: 'image',
      url: URL.createObjectURL(selectedFile),
    };
  }

  if (selectedFile.type === 'application/pdf') {
    return {
      type: 'pdf',
      url: URL.createObjectURL(selectedFile),
    };
  }

  return {
    type: 'generic',
    url: '',
  };
}

function revokePreview(preview) {
  if (preview?.url) {
    URL.revokeObjectURL(preview.url);
  }
}

function clearPreviews() {
  filePreviews.value.forEach(revokePreview);
  filePreviews.value = [];
}

watch(customSizeEnabled, (enabled) => {
  if (enabled) {
    validationWarning.value = validateCustomSize();
  } else {
    customWidth.value = '';
    customHeight.value = '';
    validationWarning.value = '';
  }
});

watch([customWidth, customHeight], () => {
  if (customSizeEnabled.value) {
    validationWarning.value = validateCustomSize();
  }
});

watch(autoDetectOrientation, (enabled) => {
  if (enabled && files.value.length > 0) {
    detectOrientation(files.value[0]);
  }
});

watch(orientation, (_newVal, _oldVal) => {
  // Orientation changed - no action needed
});

// Dropdown navigation methods
let hoverTimeout = null;

function openDropdown(dropdown) {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    activeDropdown.value = dropdown;
  }, 200);
}

function closeDropdown() {
  if (hoverTimeout) clearTimeout(hoverTimeout);
  hoverTimeout = setTimeout(() => {
    activeDropdown.value = null;
    expandedOptionSection.value = null;
  }, 100);
}

function toggleDropdown(dropdown) {
  if (activeDropdown.value === dropdown) {
    activeDropdown.value = null;
    expandedOptionSection.value = null;
  } else {
    activeDropdown.value = dropdown;
    expandedOptionSection.value = null;
  }
}

function toggleOptionSection(section) {
  if (expandedOptionSection.value === section) {
    expandedOptionSection.value = null;
  } else {
    expandedOptionSection.value = section;
  }
}

let submenuTimeout = null;

function openSubmenu(section) {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  expandedOptionSection.value = section;
}

function delayedCloseSubmenu() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  submenuTimeout = setTimeout(() => {
    expandedOptionSection.value = null;
  }, 200);
}

function closeSubmenuImmediately() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  expandedOptionSection.value = null;
}

function keepSubmenuOpen() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  if (hoverTimeout) clearTimeout(hoverTimeout);
}

function closeSubmenu() {
  if (submenuTimeout) clearTimeout(submenuTimeout);
  submenuTimeout = setTimeout(() => {
    expandedOptionSection.value = null;
    // After submenu closes, also close the main Options dropdown
    if (hoverTimeout) clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      activeDropdown.value = null;
    }, 100);
  }, 300);
}

function selectType(value) {
  // Only show page count dialog for signature imposition
  if (value === 'signature') {
    pendingImpositionType.value = value;
    showPageCountDialog.value = true;
  } else {
    selectedType.value = value;
  }
}

function confirmPageCount() {
  selectedType.value = pendingImpositionType.value;
  showPageCountDialog.value = false;
  
  // Store the page count for use during PDF generation
  if (requestedPageCount.value) {
    console.log(`Imposition type: ${selectedType.value}, Requested pages: ${requestedPageCount.value}`);
  }
}

function handleDialogDismiss(e) {
  console.log('🔔 Dialog dismissed:', e.detail);
  if (e.detail.role === 'confirm' && e.detail.data?.values?.pageCount) {
    requestedPageCount.value = String(e.detail.data.values.pageCount);
    console.log('✅ Set requestedPageCount to:', requestedPageCount.value);
    confirmPageCount();
  } else {
    console.log('❌ Dialog cancelled or no value');
    cancelPageCount();
  }
}

function cancelPageCount() {
  showPageCountDialog.value = false;
  requestedPageCount.value = '';
  pendingImpositionType.value = null;
}

function selectPaperSize(value) {
  pageSizeValue.value = value;
  customSizeEnabled.value = false;
}

function selectOrientation(value) {
  orientation.value = value;
  autoDetectOrientation.value = false;
}

function selectDuplex(value) {
  duplex.value = value;
}

function selectRotation(value, type = null) {
  rotationAngle.value = value;
  rotationType.value = type;
}

function openFilePicker() {
  fileInput.value?.click();
}

function onDragOver() {
  isDragging.value = true;
}

function onDragLeave() {
  isDragging.value = false;
}

function onDrop(event) {
  isDragging.value = false;
  if (event.dataTransfer?.files?.length) {
    const droppedFiles = Array.from(event.dataTransfer.files);
    addFiles(droppedFiles);
  }
}

function onFileChange(event) {
  const target = event.target;
  if (target?.files?.length) {
    const selectedFiles = Array.from(target.files);
    addFiles(selectedFiles);
    target.value = '';
  }
}

function addFiles(newFiles) {
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';

  const validFiles = [];
  const errors = [];

  for (const selectedFile of newFiles) {
    // Check file size (500 MB limit)
    if (selectedFile.size > 500 * 1024 * 1024) {
      errors.push(`${selectedFile.name}: exceeds 500 MB limit`);
      continue;
    }

    // Check file type
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/tiff', 'image/bmp'];
    if (!allowed.includes(selectedFile.type.toLowerCase())) {
      errors.push(`${selectedFile.name}: unsupported file type`);
      continue;
    }

    validFiles.push(selectedFile);
  }

  if (errors.length > 0) {
    fileError.value = errors.join(', ');
  }

  if (validFiles.length > 0) {
    // If this is the first upload, reset current file index
    if (files.value.length === 0) {
      currentFileIndex.value = 0;
    }
    
    validFiles.forEach((validFile) => {
      files.value.push(validFile);
      filePreviews.value.push(createPreview(validFile));
    });

    file.value = files.value[0]; // Set first file for backward compatibility
    successMessage.value = `${validFiles.length} file(s) added successfully. Total: ${files.value.length} file(s)`;

    // Auto-detect orientation from first file if enabled
    if (autoDetectOrientation.value && files.value.length > 0) {
      detectOrientation(files.value[0]);
    }
  }
}

// File reordering functions
function onFileDragStart(event, index) {
  draggedFileIndex.value = index;
  event.dataTransfer.effectAllowed = 'move';
  event.dataTransfer.setData('text/html', event.target.innerHTML);
  // Add a subtle opacity to the dragged item
  setTimeout(() => {
    event.target.style.opacity = '0.5';
  }, 0);
}

function onFileDragOver(event, index) {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';
}

function onFileDragEnter(event, index) {
  if (draggedFileIndex.value !== null && draggedFileIndex.value !== index) {
    dragOverFileIndex.value = index;
  }
}

function onFileDragLeave(event, index) {
  // Only clear if we're leaving the actual element (not a child)
  if (event.target.classList.contains('file-item-compact')) {
    dragOverFileIndex.value = null;
  }
}

function onFileDrop(event, dropIndex) {
  event.preventDefault();
  const dragIndex = draggedFileIndex.value;
  
  if (dragIndex !== null && dragIndex !== dropIndex) {
    // Reorder files array
    const draggedFile = files.value[dragIndex];
    const draggedPreview = filePreviews.value[dragIndex];
    
    // Remove from old position
    files.value.splice(dragIndex, 1);
    filePreviews.value.splice(dragIndex, 1);
    
    // Insert at new position
    files.value.splice(dropIndex, 0, draggedFile);
    filePreviews.value.splice(dropIndex, 0, draggedPreview);
    
    successMessage.value = `File order updated successfully`;
    setTimeout(() => {
      successMessage.value = '';
    }, 2000);
  }
  
  dragOverFileIndex.value = null;
}

function onFileDragEnd(event) {
  event.target.style.opacity = '1';
  draggedFileIndex.value = null;
  dragOverFileIndex.value = null;
}

function removeFile(index) {
  if (index >= 0 && index < files.value.length) {
    // Revoke preview URL if it's an image
    if (filePreviews.value[index]) {
      revokePreview(filePreviews.value[index]);
    }
    
    // Remove from arrays
    files.value.splice(index, 1);
    filePreviews.value.splice(index, 1);
    
    // Update success message
    if (files.value.length > 0) {
      successMessage.value = `File removed. ${files.value.length} file(s) remaining.`;
      file.value = files.value[0]; // Update backward compatibility reference
    } else {
      successMessage.value = '';
      file.value = null;
    }
    
    // Clear other states if no files remain
    if (files.value.length === 0) {
      fileError.value = '';
      errorMessage.value = '';
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = '';
      }
      downloadUrl.value = '';
    }
  }
}

async function detectOrientation(selectedFile) {
  try {
    if (selectedFile.type.startsWith('image/')) {
      // For images, create an Image element to get dimensions
      const img = new Image();
      const objectUrl = URL.createObjectURL(selectedFile);
      
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        
        if (width > height) {
          orientation.value = 'landscape';
        } else {
          orientation.value = 'portrait';
        }
        
        URL.revokeObjectURL(objectUrl);
        successMessage.value = `Detected ${orientation.value} orientation (${width}×${height}px)`;
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        console.error('Could not detect image dimensions');
        fileError.value = 'Could not read image dimensions';
      };
      
      img.src = objectUrl;
    } else if (selectedFile.type === 'application/pdf') {
      // For PDFs, we'll use a basic heuristic
      // In a production app, you'd use pdf.js or similar library
      // For now, we'll default to portrait for PDFs
      orientation.value = 'portrait';
      successMessage.value = 'PDF detected - orientation set to portrait (can be changed manually)';
    }
  } catch (error) {
    // Could not auto-detect orientation
    fileError.value = 'Orientation detection failed';
  }
}

function validateCustomSize() {
  if (!customSizeEnabled.value) return '';
  if (!customWidth.value || !customHeight.value) {
    return 'Enter both width and height to use a custom page size.';
  }
  if (Number(customWidth.value) <= 0 || Number(customHeight.value) <= 0) {
    return 'Width and height must be positive numbers.';
  }
  return '';
}

async function submitImposition() {
  if (files.value.length === 0 || !canSubmit.value) return;

  const customSizeError = validateCustomSize();
  if (customSizeError) {
    validationWarning.value = customSizeError;
    return;
  }

  const formData = new FormData();
  
  // Append file(s) based on count
  if (files.value.length === 1) {
    // Single file - use 'file' field for /api/imposition/process
    formData.append('file', files.value[0]);
  } else {
    // Multiple files - use 'files' field for /api/imposition/merge
    files.value.forEach((file) => {
      formData.append('files', file);
    });
  }
  
  formData.append('type', selectedType.value);
  formData.append('orientation', orientation.value);
  formData.append('duplex', duplex.value);
  formData.append('addBlankPages', addBlankPages.value ? 'true' : 'false');
  formData.append('addCropMarks', addCropMarks.value ? 'true' : 'false');
  formData.append('mergeFiles', files.value.length > 1 ? 'true' : 'false');
  formData.append('rotation', rotationAngle.value.toString()); // Add rotation parameter
  if (rotationType.value) {
    formData.append('rotationType', rotationType.value); // Add rotation type (top/bottom)
  }
  
  // Add requested page count if specified
  console.log('📊 requestedPageCount.value:', requestedPageCount.value);
  if (requestedPageCount.value) {
    formData.append('requestedPageCount', requestedPageCount.value.toString());
    console.log('✅ Added requestedPageCount to formData:', requestedPageCount.value);
  } else {
    console.log('⚠️ requestedPageCount is empty or undefined');
  }

  if (customSizeEnabled.value) {
    formData.append('pageSize', 'custom');
    formData.append('customWidth', customWidth.value);
    formData.append('customHeight', customHeight.value);
  } else {
    formData.append('pageSize', pageSizeValue.value);
  }

  isSubmitting.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const start = performance.now();

  try {
    // Use the appropriate endpoint based on file count
    const blob = files.value.length === 1 
      ? await backendApi.impose(formData)
      : await backendApi.merge(formData);
    
    processingTime.value = Math.round(performance.now() - start);

    // Clean up old preview URL
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }
    if (downloadUrl.value && downloadUrl.value !== previewUrl.value) {
      URL.revokeObjectURL(downloadUrl.value);
    }

    // Create new preview URL
    const objectUrl = URL.createObjectURL(blob);
    previewUrl.value = objectUrl;
    downloadUrl.value = objectUrl;
    
    console.log('✅ PDF generated successfully:', {
      blobSize: blob.size,
      blobType: blob.type,
      previewUrl: objectUrl,
      processingTime: processingTime.value
    });
    
    successMessage.value = `Imposition complete in ${processingTime.value}ms. Preview generated below.`;
  } catch (error) {
    console.error('Error applying imposition:', error);
    
    // Provide better error messages based on error type
    let message = 'Failed to generate imposed PDF.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      message = `Backend server unavailable. Please ensure the imposition server is running on port 3001.
      
Error: ${error.message}`;
    } else if (error.message.includes('HTTP')) {
      message = `Server error: ${error.message}. Please check the server logs.`;
    } else if (error instanceof Error) {
      message = error.message;
    }
    
    errorMessage.value = message;
  } finally {
    isSubmitting.value = false;
  }
}

function resetForm() {
  file.value = null;
  clearPreviews();
  files.value = [];
  fileError.value = '';
  successMessage.value = '';
  errorMessage.value = '';
  isSubmitting.value = false;
  customSizeEnabled.value = false;
  customWidth.value = '';
  customHeight.value = '';
  selectedType.value = 'booklet';
  pageSizeValue.value = 'auto';
  orientation.value = 'portrait';
  autoDetectOrientation.value = false;
  duplex.value = 'long-edge';
  addBlankPages.value = true;
  addCropMarks.value = false;
  rotationAngle.value = 0; // Reset rotation
  processingTime.value = 0;
  validationWarning.value = '';

  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
  }
  downloadUrl.value = '';
}

function openPreview() {
  if (previewUrl.value) {
    window.open(previewUrl.value, '_blank', 'noopener');
  }
}

function downloadFile() {
  if (downloadUrl.value) {
    try {
      // Create a temporary download link
      const link = document.createElement('a');
      link.href = downloadUrl.value;
      link.download = `imposed-${selectedType.value}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      successMessage.value = 'Download started successfully!';
      setTimeout(() => {
        if (successMessage.value === 'Download started successfully!') {
          successMessage.value = '';
        }
      }, 3000);
    } catch (error) {
      console.error('Download failed:', error);
      errorMessage.value = 'Download failed. Please try opening in new tab instead.';
    }
  }
}

// File navigation functions
function previousFile() {
  if (currentFileIndex.value > 0) {
    currentFileIndex.value--;
  }
}

function nextFile() {
  if (currentFileIndex.value < files.value.length - 1) {
    currentFileIndex.value++;
  }
}

function openCurrentFilePreview() {
  if (currentFilePreview.value?.url) {
    window.open(currentFilePreview.value.url, '_blank', 'noopener');
  }
}

// Close dropdown when clicking outside
const handleClickOutside = () => {
  activeDropdown.value = null;
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  clearPreviews();
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
});
</script>

<style scoped>
/* Professional Color Palette */
:root {
  --primary-blue: #2563eb;
  --primary-dark: #1e40af;
  --primary-light: #3b82f6;
  --accent-teal: #0d9488;
  --accent-teal-light: #14b8a6;
  --success-green: #059669;
  --warning-amber: #d97706;
  --danger-red: #dc2626;
  --neutral-50: #f8fafc;
  --neutral-100: #f1f5f9;
  --neutral-200: #e2e8f0;
  --neutral-300: #cbd5e1;
  --neutral-400: #94a3b8;
  --neutral-500: #64748b;
  --neutral-600: #475569;
  --neutral-700: #334155;
  --neutral-800: #1e293b;
  --neutral-900: #0f172a;
}

.imposition-page ion-content {
  --background: #f8fafc;
  --padding-top: 0;
  --padding-bottom: 0;
  --padding-start: 0;
  --padding-end: 0;
}

.imposition-content {
  --overflow: auto;
}

.imposition-page {
  height: 100vh;
  overflow: hidden;
}

/* Modern Slim Scrollbar Styles */
* {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 transparent;
}

*::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

*::-webkit-scrollbar-track {
  background: transparent;
}

*::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

*::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
  border: 2px solid transparent;
  background-clip: padding-box;
}

*::-webkit-scrollbar-corner {
  background: transparent;
}

.imposition-page ion-header {
  overflow: visible !important;
  z-index: 10;
}

.imposition-page ion-toolbar {
  overflow: visible !important;
}

/* Navigation Toolbar Styles */
.imposition-nav-toolbar {
  background: white;
  border-bottom: 1px solid var(--neutral-200);
  padding: 8px 0;
  overflow: visible !important;
  position: relative;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.04);
}

.imposition-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  overflow: visible !important;
  flex-wrap: wrap;
  position: relative;
  z-index: 100;
}

.nav-item {
  position: relative;
  flex-shrink: 0;
  z-index: 999;
}

.nav-item.dropdown {
  overflow: visible !important;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--neutral-700);
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-button:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.nav-button.active:hover {
  background: #1e40af;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.5);
  transform: translateY(-2px);
}

.nav-button:active {
  transform: scale(0.98);
  background: var(--neutral-200);
}

.nav-button.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.nav-button.active ion-icon {
  color: white;
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.disabled-dropdown {
  opacity: 0.4;
  pointer-events: none;
}

.nav-button:hover ion-icon {
  color: inherit;
}

.nav-button ion-icon {
  font-size: 18px;
}

.nav-button .chevron {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.nav-item.dropdown .nav-button:hover .chevron {
  transform: rotate(180deg);
}

.dropdown-bridge {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 8px;
  background: transparent;
  z-index: 999;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 200px;
  max-width: 300px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  padding: 4px;
  animation: dropdownFadeIn 0.15s ease;
  max-height: 400px;
  overflow-y: auto;
  display: block;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 6px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: var(--neutral-700);
  white-space: nowrap;
}

.dropdown-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.dropdown-item:hover ion-icon {
  color: #2563eb !important;
}

.dropdown-item:hover span {
  color: #2563eb !important;
}

.dropdown-item:hover strong {
  color: #2563eb !important;
}

.dropdown-item:hover * {
  color: #2563eb !important;
}

.dropdown-item.active {
  background: #2563eb;
  color: white;
}

.dropdown-item.disabled-item {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.dropdown-item.disabled-item ion-toggle {
  opacity: 0.4;
}

.dropdown-item strong {
  font-weight: 600;
}



.dropdown-item ion-icon {
  font-size: 18px;
  margin-right: 8px;
}

.dropdown-divider {
  height: 1px;
  background: var(--neutral-200);
  margin: 4px 0;
}

.dropdown-section {
  padding: 4px 0;
}

.dropdown-section-header {
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--neutral-500);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.expandable-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.expandable-item ion-icon {
  font-size: 16px;
  margin-left: 8px;
  color: var(--neutral-400);
}

.expandable-section-wrapper {
  position: relative;
}

.submenu-dropdown {
  position: absolute;
  left: calc(100% + 4px);
  top: 0;
  min-width: 200px;
  max-width: 300px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 99999;
  padding: 4px;
  animation: submenuFadeIn 0.15s ease;
  max-height: 400px;
  overflow-y: auto;
}

.submenu-dropdown.submenu-teleport {
  position: fixed;
  left: auto;
  top: auto;
  z-index: 100000;
}

@keyframes submenuFadeIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.expanded-section {
  padding-left: 8px;
  animation: expandFadeIn 0.2s ease;
}

@keyframes expandFadeIn {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 500px;
  }
}

.sub-item {
  padding-left: 24px !important;
  font-size: 13px;
}

.dropdown-menu.options-dropdown {
  min-width: 180px;
  max-width: 180px;
  max-height: 200px;
  position: relative;
  overflow-y: auto;
  overflow-x: visible;
}

.dropdown-menu.options-dropdown-teleport {
  min-width: 220px;
  max-width: 220px;
  max-height: 300px;
  background: white;
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 8px;
  animation: dropdownFadeIn 0.15s ease;
  overflow-y: auto;
  overflow-x: visible;
}

.dropdown-menu.options-dropdown-teleport .dropdown-item {
  padding: 10px 12px !important;
}

.dropdown-item.toggle-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.dropdown-item.toggle-item span {
  flex: 1;
}

.dropdown-item.toggle-item ion-toggle {
  flex-shrink: 0;
}

.generate-btn {
  margin-left: auto;
  --background: var(--primary-blue);
  --background-hover: var(--primary-dark);
  --border-radius: 8px;
  --padding-start: 20px;
  --padding-end: 20px;
  font-weight: 600;
  height: 40px;
}

.generate-btn ion-icon {
  font-size: 20px;
  margin-right: 6px;
}


.imposition-page ion-header {
  overflow: visible !important;
}

.imposition-page ion-header::part(native) {
  overflow: visible !important;
}

.imposition-page ion-header ion-toolbar:first-child {
  --background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  --color: #ffffff;
  --border-width: 0;
  box-shadow: 0 4px 24px rgba(37, 99, 235, 0.15);
}

.imposition-page ion-header ion-title {
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.imposition-page ion-header ion-button {
  --color: #ffffff;
  --background-hover: rgba(255, 255, 255, 0.15);
  --border-radius: 10px;
  font-weight: 600;
}

.hero {
  padding: 3rem 1.5rem 2rem;
  text-align: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.03) 0%, transparent 100%);
  border-bottom: 1px solid rgba(37, 99, 235, 0.08);
}

.hero h1 {
  font-size: clamp(2rem, 3vw, 2.75rem);
  margin-bottom: 0.75rem;
  color: var(--neutral-900);
  font-weight: 800;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #0d9488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero p {
  max-width: 680px;
  margin: 0 auto;
  line-height: 1.7;
  color: var(--neutral-600);
  font-size: 1.05rem;
  font-weight: 500;
}

.main-container {
  height: calc(100vh - 109px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.split-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  height: 100%;
  overflow: hidden;
}

@media (max-width: 768px) {
  .split-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
    overflow: visible;
    height: auto;
  }

  .main-container {
    height: auto;
    min-height: 100vh;
    overflow: visible;
  }

  .panel {
    height: auto;
    min-height: 50vh;
  }
  
  .panel-header {
    padding: 20px 20px;
  }
  
  .header-icon {
    width: 48px;
    height: 48px;
  }
  
  .header-icon ion-icon {
    font-size: 24px;
  }
  
  .header-content h2 {
    font-size: 18px;
  }
  
  .header-content p {
    font-size: 12px;
  }
  
  .panel-body {
    padding: 20px;
  }
  
  .file-items-grid {
    grid-template-columns: 1fr;
    max-height: 300px;
  }
}

.panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  overflow: hidden;
}

.left-panel {
  border-right: 1px solid #e2e8f0;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  flex-shrink: 0;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  flex-shrink: 0;
}

.header-icon ion-icon {
  font-size: 28px;
  color: white;
}

.header-content h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: white;
  letter-spacing: -0.02em;
}

.header-content p {
  margin: 4px 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px 28px 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.drop-zone-modern {
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 40px 24px;
  text-align: center;
  background: #f8fafc;
  transition: all 0.25s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  position: relative;
  min-height: 320px;
  justify-content: center;
}

.drop-zone-modern:hover {
  border-color: #2563eb;
  background: #eff6ff;
  transform: translateY(-2px);
}

.drop-zone-modern.dragging {
  border-color: #2563eb;
  background: #dbeafe;
  border-width: 3px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.drop-zone-modern.has-files {
  min-height: auto;
  padding: 24px;
}

.upload-interface {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.upload-interface ion-icon {
  font-size: 64px;
  color: #2563eb;
}

.upload-interface p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
}

.upload-interface ion-button {
  --border-radius: 12px;
  --padding-start: 24px;
  --padding-end: 24px;
  font-weight: 600;
  text-transform: none;
}

.file-preview-interface {
  width: 100%;
}

.file-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}

.file-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.header-actions ion-button {
  --padding-start: 12px;
  --padding-end: 12px;
  font-weight: 600;
  font-size: 13px;
}

.file-items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-height: calc(100vh - 450px);
  overflow-y: auto;
  padding-right: 8px;
}

.file-items-grid::-webkit-scrollbar {
  width: 6px;
}

.file-items-grid::-webkit-scrollbar-track {
  background: transparent;
}

.file-items-grid::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.file-items-grid::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.file-item-compact {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: move;
  user-select: none;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  color: #94a3b8;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-handle ion-icon {
  font-size: 20px;
}

.file-item-compact:hover {
  border-color: #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
  transform: translateY(-2px);
}

.file-item-compact.dragging-file {
  opacity: 0.5;
  cursor: move;
}

.file-item-compact.drag-over {
  border-color: #10b981;
  background: #d1fae5;
  border-width: 2px;
  border-style: dashed;
  transform: scale(1.02);
}

.file-item-compact.dragging-file {
  opacity: 0.5;
  cursor: move;
}

.file-item-compact.drag-over {
  border-color: #10b981;
  background: #d1fae5;
  border-width: 2px;
  border-style: dashed;
  transform: scale(1.02);
}

.file-item-compact .file-preview {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-item-compact .image-preview {
  width: 100%;
  height: 100%;
}

.file-item-compact .image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-item-compact .file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.file-item-compact .file-icon ion-icon {
  font-size: 24px;
  color: #2563eb;
}

.file-item-compact .file-info {
  flex: 1;
  min-width: 0;
}

.file-item-compact .file-name {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.file-item-compact .file-details {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.file-item-compact .remove-btn {
  flex-shrink: 0;
}

.message {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.success-message {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #6ee7b7;
}

.success-message ion-icon {
  font-size: 20px;
  color: #10b981;
}

.error-message {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fca5a5;
}

.error-message ion-icon {
  font-size: 20px;
  color: #ef4444;
}

.file-preview-scroll::-webkit-scrollbar-track {
  display: none;
}

.file-preview-scroll::-webkit-scrollbar-thumb {
  display: none;
}

.file-preview-scroll::-webkit-scrollbar-thumb:hover {
  display: none;
}

.file-preview-card {
  position: relative;
  flex: 0 0 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.65rem;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.08),
              0 1px 4px rgba(37, 99, 235, 0.06);
  border: 1.5px solid rgba(37, 99, 235, 0.12);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.file-preview-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12),
              0 2px 8px rgba(37, 99, 235, 0.1);
  border-color: var(--primary-blue);
}

.file-preview-card.is-dragging {
  opacity: 0.6;
  transform: scale(0.95) rotate(2deg);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.2);
  z-index: 100;
}

.file-preview-card.is-drop-target {
  border-style: dashed;
  border-color: var(--primary-blue);
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15);
  background: rgba(37, 99, 235, 0.03);
}

.file-preview-card.add-card {
  justify-content: center;
  cursor: pointer;
  border-style: dashed;
  border-width: 2px;
  color: var(--primary-blue);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.04) 0%, rgba(37, 99, 235, 0.02) 100%);
}

.file-preview-card.add-card:hover {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%);
  border-color: var(--primary-dark);
}

.file-preview-card.add-card .preview-frame {
  border-color: rgba(37, 99, 235, 0.3);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%);
  color: var(--primary-blue);
}

.file-preview-card.add-card ion-icon {
  font-size: 1.75rem;
  font-weight: bold;
}

.file-preview-card.add-card.is-drop-target {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(37, 99, 235, 0.06) 100%);
}

.remove-preview {
  position: absolute;
  top: 0.45rem;
  right: 0.45rem;
  background: var(--danger-red);
  border: none;
  padding: 0.2rem;
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
  z-index: 10;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.remove-preview:hover {
  background: #b91c1c;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.remove-preview ion-icon {
  font-size: 1.2rem;
}

.preview-frame {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  border: 1.5px solid rgba(37, 99, 235, 0.15);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.file-index {
  position: absolute;
  top: 0.4rem;
  left: 0.4rem;
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
  z-index: 5;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  color: var(--primary-blue);
}

.preview-placeholder ion-icon {
  font-size: 1.5rem;
}

.preview-ext {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--neutral-700);
}

.file-name {
  display: block;
  width: 100%;
  text-align: center;
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--neutral-700);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
}

.file-size {
  color: var(--neutral-500);
  font-size: 0.68rem;
  font-weight: 500;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.options-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.options-group label {
  font-weight: 700;
  color: var(--neutral-800);
  font-size: 0.95rem;
  letter-spacing: -0.01em;
}

.segment-scroll {
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 0.5rem;
  margin: 0 -0.5rem;
  padding-right: 0.5rem;
  padding-left: 0.5rem;
}

.segment-scroll::-webkit-scrollbar {
  display: none;
  height: 0px;
}

.segment-scroll::-webkit-scrollbar-track {
  display: none;
}

.segment-scroll::-webkit-scrollbar-thumb {
  display: none;
}

ion-segment {
  --background: var(--neutral-100);
  border-radius: 14px;
  padding: 0.35rem;
  min-width: max-content;
  box-shadow: inset 0 2px 4px rgba(15, 23, 42, 0.06);
}

.imposition-segment::part(scroll) {
  display: flex;
  gap: 0.75rem;
  padding: 0.15rem 0.4rem;
}

ion-segment-button {
  --color: var(--neutral-700);
  --color-checked: #ffffff;
  --background-checked: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --indicator-color: transparent;
  min-height: 72px;
  flex: 0 0 auto;
  min-width: 200px;
  border-radius: 12px;
  align-items: flex-start;
  text-align: left;
  transition: all 0.25s ease;
  border: 1.5px solid transparent;
}

ion-segment-button:hover {
  background: var(--neutral-50);
  border-color: rgba(37, 99, 235, 0.2);
}

ion-segment-button::part(indicator-background) {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
}

ion-segment-button ion-label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.95rem;
  width: 100%;
  max-width: 190px;
  min-width: 0;
  padding: 0.25rem;
}

ion-segment-button ion-label strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 700;
  letter-spacing: -0.01em;
}

ion-segment-button small {
  font-size: 0.76rem;
  opacity: 0.75;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  line-height: 1.3;
}

.options-grid {
  display: grid;
  gap: 1rem;
}

.options-grid ion-item {
  --background: var(--neutral-50);
  --border-color: rgba(37, 99, 235, 0.12);
  --border-radius: 14px;
  --padding-start: 1.25rem;
  --padding-end: 1.25rem;
  --inner-padding-end: 0;
  --min-height: 60px;
  border-radius: 14px;
  margin: 0;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.options-grid ion-item:hover {
  --background: #ffffff;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
  transform: translateY(-1px);
}

.options-grid ion-item ion-label {
  font-weight: 600;
  color: var(--neutral-700);
  font-size: 0.95rem;
}

.options-grid ion-select,
.options-grid ion-toggle {
  --placeholder-color: var(--neutral-400);
}

.options-grid ion-toggle {
  --background: var(--neutral-300);
  --background-checked: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --handle-background: #ffffff;
  --handle-background-checked: #ffffff;
  --handle-box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);
}

.custom-size {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}

.custom-size-hint {
  margin: 0;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(13, 148, 136, 0.04) 100%);
  border-radius: 14px;
  border-left: 4px solid var(--accent-teal);
  font-size: 0.9rem;
  color: var(--neutral-700);
  font-weight: 500;
  line-height: 1.6;
}

.custom-size-fields {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.dimension-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 2px solid rgba(37, 99, 235, 0.15);
  border-radius: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.dimension-field:hover {
  border-color: rgba(37, 99, 235, 0.3);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.dimension-field label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--neutral-700);
  letter-spacing: -0.01em;
}

.dimension-input {
  --padding-start: 0.6rem;
  --padding-end: 0.6rem;
  --padding-top: 0.5rem;
  --padding-bottom: 0.5rem;
  --background: var(--neutral-50);
  --color: var(--neutral-900);
  --placeholder-color: var(--neutral-400);
  --highlight-color-focused: var(--primary-blue);
  --border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
}

.dimension-input::part(native) {
  border: 1.5px solid rgba(37, 99, 235, 0.2);
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.25s ease;
  font-weight: 600;
}

.dimension-field:focus-within {
  border-color: var(--primary-blue);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12),
              0 4px 12px rgba(15, 23, 42, 0.08);
}

.dimension-field:focus-within .dimension-input::part(native) {
  border-color: var(--primary-blue);
  background: #ffffff;
}

.custom-size-note {
  margin-top: 0;
  padding: 0 0.5rem;
  font-size: 0.82rem;
  color: var(--neutral-500);
  font-weight: 500;
}

.custom-size.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.advanced {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(37, 99, 235, 0.12);
}

.advanced ion-item {
  --background: var(--neutral-50);
  font-weight: 600;
}

.advanced-content {
  padding: 1.25rem 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: var(--neutral-50);
}

.submit-btn {
  margin-top: 0.5rem;
  --background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --background-hover: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
  --background-activated: var(--primary-dark);
  --border-radius: 14px;
  --box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
  --padding-top: 1.1rem;
  --padding-bottom: 1.1rem;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: -0.01em;
  text-transform: none;
  transition: all 0.3s ease;
}

.submit-btn:hover:not([disabled]) {
  transform: translateY(-2px);
  --box-shadow: 0 8px 28px rgba(37, 99, 235, 0.4);
}

.submit-btn:active:not([disabled]) {
  transform: translateY(0);
}

.message {
  display: block;
  margin-top: 0;
  padding: 0.85rem 1.1rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.5;
}

.message.note {
  margin-top: 0;
}

.message[color="danger"] {
  background: rgba(220, 38, 38, 0.1);
  color: var(--danger-red);
  border-left: 4px solid var(--danger-red);
}

.message[color="success"] {
  background: rgba(5, 150, 105, 0.1);
  color: var(--success-green);
  border-left: 4px solid var(--success-green);
}

.message[color="warning"] {
  background: rgba(217, 119, 6, 0.1);
  color: var(--warning-amber);
  border-left: 4px solid var(--warning-amber);
}

.orientation-note {
  display: block;
  margin-top: 0;
  margin-bottom: 0.75rem;
  padding: 0.75rem 1.1rem;
  font-size: 0.88rem;
  background: rgba(5, 150, 105, 0.08);
  color: var(--success-green);
  border-left: 4px solid var(--success-green);
  border-radius: 10px;
  font-weight: 600;
}

.preview-card {
  min-height: 100%;
}

.status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 60px 24px;
  text-align: center;
}

.status ion-icon,
.status ion-spinner {
  font-size: 64px;
  color: #2563eb;
}

.status.error ion-icon {
  color: #ef4444;
}

.status-content h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
}

.status-content p {
  margin: 8px 0 0;
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
}

.preview-container,
.file-preview-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
  flex-shrink: 0;
}

.preview-header h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
}

.preview-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}

.preview-frame {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  border: 2px solid #e2e8f0;
  display: flex;
  min-height: 0;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 80px 24px;
  text-align: center;
  height: 100%;
}

.empty-state ion-icon {
  font-size: 80px;
  color: #cbd5e1;
}

.empty-state h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #475569;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  max-width: 320px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  flex-shrink: 0;
}

.actions ion-button {
  --border-radius: 12px;
  --padding-top: 14px;
  --padding-bottom: 14px;
  font-weight: 600;
  text-transform: none;
}

.file-navigation {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  flex-shrink: 0;
}

.file-counter {
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  min-width: 60px;
  text-align: center;
}

.current-file-info {
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.current-file-info .file-name {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 3px;
}

.current-file-info .file-details {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.image-preview-large {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
}

.image-preview-large img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.file-preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 60px;
  height: 100%;
}

.file-preview-placeholder ion-icon {
  font-size: 64px;
  color: #cbd5e1;
}

.file-preview-placeholder p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
  font-weight: 600;
}

.file-preview-placeholder .file-size {
  font-size: 13px;
  color: #94a3b8;
}

.status.error {
  background: linear-gradient(135deg, rgba(220, 38, 38, 0.08) 0%, rgba(220, 38, 38, 0.04) 100%);
  border-left-color: var(--danger-red);
  color: var(--danger-red);
}

.status.success {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border-left-color: var(--success-green);
  color: var(--success-green);
}

.status ion-icon {
  font-size: 2rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.status-content {
  flex: 1;
}

.status-content h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.status.error .status-content h3 {
  color: var(--danger-red);
}

.status-content p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--neutral-600);
  font-weight: 500;
  line-height: 1.5;
}

.status.error .status-content p {
  color: var(--neutral-700);
}

.preview-container {
  margin-top: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--neutral-200);
}

.preview-header h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--neutral-800);
}

.preview-info {
  font-size: 0.85rem;
  color: var(--neutral-500);
  font-weight: 500;
}

.preview-frame {
  margin-top: 1.5rem;
  border-radius: 16px;
  overflow: hidden;
  background: var(--neutral-900);
  min-height: 480px;
  border: 2px solid rgba(37, 99, 235, 0.15);
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.15);
}

.preview-frame iframe {
  width: 100%;
  height: 520px;
  border: none;
  background: #ffffff;
}

.empty-state {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--neutral-500);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1.5rem;
  background: linear-gradient(135deg, var(--neutral-50) 0%, var(--neutral-100) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(37, 99, 235, 0.2);
}

.empty-state ion-icon {
  font-size: 3.5rem;
  color: rgba(37, 99, 235, 0.35);
}

.empty-state h3 {
  margin: 0;
  color: var(--neutral-700);
  font-weight: 700;
  font-size: 1.15rem;
  letter-spacing: -0.01em;
}

.empty-state p {
  margin: 0;
  color: var(--neutral-600);
  font-weight: 500;
  line-height: 1.6;
}

.actions {
  margin-top: 1.75rem;
  display: grid;
  gap: 1rem;
}

.actions ion-button[fill="solid"] {
  --background: linear-gradient(135deg, var(--accent-teal) 0%, var(--accent-teal-light) 100%);
  --background-hover: linear-gradient(135deg, var(--accent-teal-light) 0%, var(--accent-teal) 100%);
  --background-activated: var(--accent-teal);
  --border-radius: 14px;
  --box-shadow: 0 6px 20px rgba(13, 148, 136, 0.3);
  font-weight: 700;
  height: 54px;
  font-size: 1rem;
  letter-spacing: 0.025em;
}

.actions ion-button[fill="clear"] {
  --color: var(--neutral-600);
  --color-hover: var(--primary-blue);
  --color-activated: var(--primary-dark);
  --border-radius: 14px;
  font-weight: 600;
  height: 54px;
  font-size: 1rem;
}

.preview-container {
  margin-top: 1rem;
}

.preview-iframe {
  width: 100%;
  height: 500px;
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
}

.preview-frame {
  background: var(--neutral-100);
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
}

/* File Preview Styles */
.file-preview-container {
  margin-top: 1rem;
}

.file-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: var(--neutral-50);
  border-radius: 10px;
}

.file-counter {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--neutral-700);
  min-width: 60px;
  text-align: center;
}

.current-file-info {
  padding: 1rem;
  background: var(--neutral-50);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.current-file-info .file-name {
  font-weight: 600;
  color: var(--neutral-800);
  font-size: 1rem;
  margin-bottom: 0.5rem;
  word-break: break-word;
}

.current-file-info .file-details {
  font-size: 0.85rem;
  color: var(--neutral-500);
}

.image-preview-large {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
}

.image-preview-large img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.file-preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--neutral-500);
  background: var(--neutral-50);
}

.file-preview-placeholder ion-icon {
  font-size: 4rem;
  color: var(--primary-blue);
  margin-bottom: 1rem;
}

.file-preview-placeholder p {
  margin: 0.25rem 0;
  font-weight: 500;
}

.file-preview-placeholder .file-size {
  color: var(--neutral-400);
  font-size: 0.85rem;
}

/* File List Styles */
.file-list {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--neutral-200);
}

.file-list h4 {
  margin: 0 0 0.75rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--neutral-700);
  letter-spacing: -0.01em;
}

.file-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--neutral-50);
  border: 1px solid var(--neutral-200);
  border-radius: 12px;
  transition: all 0.2s ease;
}

.file-item:hover {
  background: white;
  border-color: var(--primary-light);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.file-preview {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: var(--neutral-100);
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-icon ion-icon {
  font-size: 24px;
  color: var(--primary-blue);
}

.file-info {
  flex: 1;
  min-width: 0; /* Enable text truncation */
}

.file-name {
  font-weight: 600;
  color: var(--neutral-800);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-details {
  font-size: 0.8rem;
  color: var(--neutral-500);
  margin-top: 0.25rem;
}

.message-note {
  display: block;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.875rem;
}

.actions ion-button[fill="solid"]:hover:not([disabled]) {
  transform: translateY(-2px);
  --box-shadow: 0 8px 28px rgba(13, 148, 136, 0.4);
}

.actions ion-button[fill="clear"] {
  --color: var(--neutral-600);
  --color-hover: var(--primary-blue);
  --border-radius: 12px;
  --padding-top: 0.9rem;
  --padding-bottom: 0.9rem;
  font-weight: 600;
  font-size: 0.98rem;
  text-transform: none;
  transition: all 0.25s ease;
}

.actions ion-button[fill="clear"]:hover:not([disabled]) {
  --background: var(--neutral-100);
}

@media (max-width: 991px) {
  .hero {
    padding-top: 2rem;
    padding-bottom: 1.5rem;
  }

  .content-grid {
    padding: 1.5rem 0;
  }

  .preview-frame iframe {
    height: 400px;
  }
}

@media (max-width: 575px) {
  .hero {
    padding: 1.5rem 1rem 1.25rem;
  }

  .hero h1 {
    font-size: 1.75rem;
  }

  .hero p {
    font-size: 0.95rem;
  }

  .upload-card ion-card-header,
  .settings-card ion-card-header,
  .preview-card ion-card-header {
    padding: 1.25rem 1.5rem;
  }

  .upload-card ion-card-content,
  .settings-card ion-card-content,
  .preview-card ion-card-content {
    padding: 1.5rem 1.5rem;
    gap: 1.5rem;
  }

  .drop-zone {
    padding: 2rem 1.25rem;
  }

  ion-segment-button {
    min-height: 76px;
    min-width: 180px;
  }

  .preview-frame iframe {
    height: 360px;
  }

  .file-preview-card {
    flex: 0 0 100px;
  }
}
</style>

<style>
/* Unscoped styles for teleported dropdowns */
.dropdown-menu .dropdown-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.dropdown-menu .dropdown-item:hover ion-icon {
  color: #2563eb !important;
}

.dropdown-menu .dropdown-item:hover span {
  color: #2563eb !important;
}

.dropdown-menu .dropdown-item:hover strong {
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover {
  background: #f8fafc !important;
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover ion-icon {
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover span {
  color: #2563eb !important;
}

.submenu-dropdown .dropdown-item:hover strong {
  color: #2563eb !important;
}
</style>