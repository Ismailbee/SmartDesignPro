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
        <div class="nav-item dropdown">
          <button class="nav-button" @click.stop="toggleDropdown('type')">
            <ion-icon :icon="gridOutline"></ion-icon>
            <span>{{ selectedTypeLabel }}</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'type'" class="dropdown-menu" @click.stop>
            <button
              v-for="option in impositionTypes"
              :key="option.value"
              class="dropdown-item"
              :class="{ active: selectedType === option.value }"
              @click="selectType(option.value)"
            >
              <strong>{{ option.label }}</strong>
              <small>{{ option.description }}</small>
            </button>
          </div>
        </div>

        <!-- Paper Size -->
        <div class="nav-item dropdown">
          <button class="nav-button" @click.stop="toggleDropdown('paper')">
            <ion-icon :icon="documentTextOutline"></ion-icon>
            <span>{{ pageSizeLabel }}</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'paper'" class="dropdown-menu" @click.stop>
            <button
              v-for="size in pageSizes"
              :key="size.value"
              class="dropdown-item"
              :class="{ active: pageSizeValue === size.value }"
              @click="selectPaperSize(size.value)"
            >
              {{ size.label }}
            </button>
            <div class="dropdown-divider"></div>
            <ion-accordion-group class="advanced-accordion">
              <ion-accordion value="advanced">
                <ion-item slot="header" lines="none" class="advanced-header">
                  <ion-label>Advanced</ion-label>
                </ion-item>
                <div slot="content" class="advanced-content">
                  <ion-item lines="full">
                    <ion-label>Use custom size</ion-label>
                    <ion-toggle v-model="customSizeEnabled" color="primary"></ion-toggle>
                  </ion-item>
                  <div class="custom-size-inputs" :class="{ disabled: !customSizeEnabled }">
                    <p class="custom-size-hint">
                      Enter the finished sheet dimensions in points.
                    </p>
                    <div class="custom-size-fields">
                      <div class="dimension-field">
                        <ion-input
                          id="custom-width"
                          v-model="customWidth"
                          label="Width (pt)"
                          label-placement="stacked"
                          class="dimension-input"
                          type="number"
                          min="1"
                          inputmode="decimal"
                          placeholder="e.g. 595"
                          :disabled="!customSizeEnabled"
                        ></ion-input>
                      </div>
                      <div class="dimension-field">
                        <ion-input
                          id="custom-height"
                          v-model="customHeight"
                          label="Height (pt)"
                          label-placement="stacked"
                          class="dimension-input"
                          type="number"
                          min="1"
                          inputmode="decimal"
                          placeholder="e.g. 842"
                          :disabled="!customSizeEnabled"
                        ></ion-input>
                      </div>
                    </div>
                    <ion-note color="medium" class="custom-size-note">1 pt = 1/72 inch</ion-note>
                  </div>
                </div>
              </ion-accordion>
            </ion-accordion-group>
          </div>
        </div>

        <!-- Orientation -->
        <div class="nav-item dropdown">
          <button class="nav-button" @click.stop="toggleDropdown('orientation')">
            <ion-icon :icon="phonePortraitOutline"></ion-icon>
            <span>{{ orientation === 'portrait' ? 'Portrait' : 'Landscape' }}</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'orientation'" class="dropdown-menu" @click.stop>
            <button
              class="dropdown-item"
              :class="{ active: orientation === 'portrait' }"
              @click="selectOrientation('portrait')"
            >
              Portrait
            </button>
            <button
              class="dropdown-item"
              :class="{ active: orientation === 'landscape' }"
              @click="selectOrientation('landscape')"
            >
              Landscape
            </button>
            <div class="dropdown-divider"></div>
            <label class="dropdown-item toggle-item">
              <span>Auto-detect</span>
              <ion-toggle
                :checked="autoDetectOrientation"
                color="primary"
                @ion-change="(e) => autoDetectOrientation = e.detail.checked"
              ></ion-toggle>
            </label>
          </div>
        </div>

        <!-- Duplex -->
        <div class="nav-item dropdown">
          <button class="nav-button" @click.stop="toggleDropdown('duplex')">
            <ion-icon :icon="copyOutline"></ion-icon>
            <span>{{ duplexLabel }}</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'duplex'" class="dropdown-menu" @click.stop>
            <button
              class="dropdown-item"
              :class="{ active: duplex === 'long-edge' }"
              @click="selectDuplex('long-edge')"
            >
              Long-edge binding
            </button>
            <button
              class="dropdown-item"
              :class="{ active: duplex === 'short-edge' }"
              @click="selectDuplex('short-edge')"
            >
              Short-edge binding
            </button>
            <button
              class="dropdown-item"
              :class="{ active: duplex === 'simplex' }"
              @click="selectDuplex('simplex')"
            >
              Single sided
            </button>
          </div>
        </div>

        <!-- Options -->
        <div class="nav-item dropdown">
          <button class="nav-button" @click.stop="toggleDropdown('options')">
            <ion-icon :icon="optionsOutline"></ion-icon>
            <span>Options</span>
            <ion-icon :icon="chevronDownOutline" class="chevron"></ion-icon>
          </button>
          <div v-if="activeDropdown === 'options'" class="dropdown-menu" @click.stop>
            <label class="dropdown-item toggle-item">
              <span>Blank page padding</span>
              <ion-toggle
                v-model="addBlankPages"
                color="primary"
              ></ion-toggle>
            </label>
            <label class="dropdown-item toggle-item">
              <span>Crop marks</span>
              <ion-toggle
                v-model="addCropMarks"
                color="primary"
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
    
    <ion-content fullscreen>
      <ion-grid fixed>
        <ion-row class="content-grid">
          <ion-col size="12" size-md="6" class="stack">
            <ion-card class="upload-card">
              <ion-card-header>
                <ion-card-subtitle>Input</ion-card-subtitle>
                <ion-card-title>Upload files</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div
                  class="drop-zone"
                  :class="{ dragging: isDragging }"
                  @dragover.prevent="onDragOver"
                  @dragleave="onDragLeave"
                  @drop.prevent="onDrop"
                >
                  <ion-icon :icon="cloudUploadOutline"></ion-icon>
                  <p>Drag & drop files here</p>
                  <ion-button fill="outline" color="primary" @click="openFilePicker">Choose files</ion-button>
                  <input
                    ref="fileInput"
                    type="file"
                    multiple
                    accept=".pdf,image/*"
                    hidden
                    @change="onFileChange"
                  />
                </div>
                <ion-note v-if="fileError" color="danger">{{ fileError }}</ion-note>
              </ion-card-content>
            </ion-card>
          </ion-col>

          <ion-col size="12" size-md="6" class="stack">
            <ion-card class="preview-card">
              <ion-card-header>
                <ion-card-subtitle>Output</ion-card-subtitle>
                <ion-card-title>Preview & download</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <div v-if="isSubmitting" class="status">
                  <ion-spinner name="lines"></ion-spinner>
                  <p>Processing your file… This can take a moment for larger documents.</p>
                </div>

                <div v-else-if="errorMessage" class="status">
                  <ion-icon :icon="warningOutline" color="danger"></ion-icon>
                  <p>{{ errorMessage }}</p>
                </div>

                <div v-else-if="previewUrl" class="preview-container">
                  <iframe :src="previewUrl" title="PDF Preview" class="preview-iframe"></iframe>
                </div>

                <div v-else class="empty-state">
                  <ion-icon :icon="documentOutline"></ion-icon>
                  <h3>No output yet</h3>
                  <p>Upload a file and generate an imposition to see the preview here.</p>
                </div>

                <div v-if="downloadUrl" class="actions">
                  <ion-button expand="block" fill="solid" color="primary" :href="downloadUrl" download>
                    <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
                    Download imposed PDF
                  </ion-button>
                  <ion-button expand="block" fill="clear" color="primary" :disabled="!previewUrl" @click="openPreview">
                    Open in new tab
                  </ion-button>
                </div>
              </ion-card-content>
            </ion-card>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-content>
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
  phonePortraitOutline,
  copyOutline,
  optionsOutline,
  chevronDownOutline,
} from 'ionicons/icons';

const impositionTypes = [
  {
    value: 'merge',
    label: 'Merge PDFs',
    description: 'Combine multiple uploads into one document',
  },
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
    value: '4up',
    label: '4-Up',
    description: 'Impose four mini pages per sheet',
  },
];

const pageSizes = [
  { value: 'auto', label: 'Auto (fit to content)' },
  { value: 'A4', label: 'A4 (210 × 297 mm)' },
  { value: 'A3', label: 'A3 (297 × 420 mm)' },
  { value: 'Letter', label: 'US Letter (8.5 × 11 in)' },
  { value: 'Legal', label: 'US Legal (8.5 × 14 in)' },
  { value: 'Tabloid', label: 'Tabloid (11 × 17 in)' },
];

const fileInput = ref(null);
const file = ref(null); // Keep for backward compatibility
const files = ref([]); // New: array of files
const filePreviews = ref([]);
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
const autoDetectOrientation = ref(false);
const duplex = ref('long-edge');
const addBlankPages = ref(true);
const addCropMarks = ref(false);
const customSizeEnabled = ref(false);
const customWidth = ref('');
const customHeight = ref('');

// Dropdown navigation state
const activeDropdown = ref(null);

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
      url: '',
    };
  }

  return {
    type: 'generic',
    url: '',
  };
}

function revokePreview(preview) {
  if (preview?.type === 'image' && preview.url) {
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
  if (enabled && file.value) {
    detectOrientation(file.value);
  }
});

watch(orientation, (_newVal, _oldVal) => {
  // Orientation changed - no action needed
});

// Dropdown navigation methods
function toggleDropdown(dropdown) {
  if (activeDropdown.value === dropdown) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = dropdown;
  }
}

function selectType(value) {
  selectedType.value = value;
  activeDropdown.value = null;
}

function selectPaperSize(value) {
  pageSizeValue.value = value;
  customSizeEnabled.value = false;
  activeDropdown.value = null;
}

function selectOrientation(value) {
  orientation.value = value;
  autoDetectOrientation.value = false;
  activeDropdown.value = null;
}

function selectDuplex(value) {
  duplex.value = value;
  activeDropdown.value = null;
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
    // Check file size
    if (selectedFile.size > 50 * 1024 * 1024) {
      errors.push(`${selectedFile.name}: exceeds 50 MB limit`);
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

    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value);
    }

    const objectUrl = URL.createObjectURL(blob);
    previewUrl.value = objectUrl;
    downloadUrl.value = objectUrl;
    successMessage.value = 'Imposition complete. Preview generated below.';
  } catch (error) {
    console.error('Error applying imposition:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate imposed PDF.';
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
  --background: linear-gradient(135deg, #f8fafc 0%, #e7f0f7 100%);
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
  padding: 12px 0;
  overflow: visible !important;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.imposition-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  padding-bottom: 8px;
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
  overflow: visible;
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
  background: var(--neutral-100);
  border-color: var(--neutral-300);
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
  flex-direction: column;
  align-items: flex-start;
  width: 100%;
  padding: 10px 12px;
  border: none;
  background: transparent;
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  font-size: 14px;
  color: var(--neutral-700);
}

.dropdown-item:hover {
  background: var(--neutral-50);
}

.dropdown-item.active {
  background: var(--primary-light);
  color: white;
}

.dropdown-item strong {
  font-weight: 600;
  margin-bottom: 2px;
}

.dropdown-item small {
  font-size: 12px;
  color: var(--neutral-500);
}

.dropdown-item.active small {
  color: rgba(255, 255, 255, 0.9);
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

.dropdown-item.toggle-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.dropdown-item.toggle-item span {
  flex: 1;
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

.content-grid {
  align-items: stretch;
  padding: 2rem 0;
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-card,
.settings-card,
.preview-card {
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.08),
              0 2px 8px rgba(15, 23, 42, 0.04);
  overflow: hidden;
  background: #ffffff;
  border: 1px solid rgba(37, 99, 235, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.upload-card:hover,
.settings-card:hover,
.preview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12),
              0 4px 12px rgba(37, 99, 235, 0.08);
}

.upload-card ion-card-header,
.settings-card ion-card-header,
.preview-card ion-card-header {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.upload-card ion-card-subtitle,
.settings-card ion-card-subtitle,
.preview-card ion-card-subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.25rem;
}

.upload-card ion-card-title,
.settings-card ion-card-title,
.preview-card ion-card-title {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: -0.02em;
}

.upload-card ion-card-content,
.settings-card ion-card-content,
.preview-card ion-card-content {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  padding: 2rem 1.75rem;
}

.drop-zone {
  border: 2.5px dashed rgba(37, 99, 235, 0.3);
  border-radius: 20px;
  padding: 2.5rem 1.75rem;
  text-align: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
}

.drop-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.05) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.drop-zone:hover::before {
  opacity: 1;
}

.drop-zone ion-icon {
  font-size: 3rem;
  color: var(--primary-blue);
  transition: transform 0.3s ease, color 0.3s ease;
}

.drop-zone:hover ion-icon {
  transform: scale(1.1);
  color: var(--primary-dark);
}

.drop-zone h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--neutral-800);
  letter-spacing: -0.01em;
}

.drop-zone p {
  margin: 0;
  color: var(--neutral-600);
  font-weight: 500;
  font-size: 0.95rem;
}

.drop-zone p strong {
  color: var(--accent-teal);
  font-weight: 700;
}

.drop-zone.dragging {
  border-color: var(--primary-blue);
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%);
  transform: scale(1.02);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.drop-zone.ready {
  border-color: var(--accent-teal);
  background: linear-gradient(135deg, rgba(13, 148, 136, 0.04) 0%, rgba(20, 184, 166, 0.02) 100%);
}

.browse-btn {
  --background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  --background-hover: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
  --background-activated: var(--primary-dark);
  --color: #ffffff;
  --border-radius: 12px;
  --box-shadow: 0 4px 16px rgba(37, 99, 235, 0.25);
  --padding-top: 0.85rem;
  --padding-bottom: 0.85rem;
  font-weight: 700;
  font-size: 1rem;
  text-transform: none;
  margin-top: 0.5rem;
  letter-spacing: -0.01em;
  transition: all 0.3s ease;
}

.browse-btn:hover:not([disabled]) {
  transform: translateY(-2px);
  --box-shadow: 0 6px 24px rgba(37, 99, 235, 0.35);
}

.file-preview-wrapper {
  width: 100%;
}

.file-preview-scroll {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.75rem 0.5rem 1rem;
  -webkit-overflow-scrolling: touch;
}

.file-preview-scroll::-webkit-scrollbar {
  height: 10px;
}

.file-preview-scroll::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 999px;
}

.file-preview-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  border-radius: 999px;
  border: 2px solid var(--neutral-100);
}

.file-preview-scroll::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-blue) 100%);
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
  height: 8px;
}

.segment-scroll::-webkit-scrollbar-track {
  background: var(--neutral-100);
  border-radius: 999px;
}

.segment-scroll::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-dark) 100%);
  border-radius: 999px;
  border: 2px solid var(--neutral-100);
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
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-top: 0.7rem;
  --padding-bottom: 0.7rem;
  --background: var(--neutral-50);
  --color: var(--neutral-900);
  --placeholder-color: var(--neutral-400);
  --highlight-color-focused: var(--primary-blue);
  --border-radius: 12px;
  font-weight: 600;
}

.dimension-input::part(native) {
  border: 1.5px solid rgba(37, 99, 235, 0.2);
  border-radius: 12px;
  font-size: 1rem;
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
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%);
  color: var(--neutral-800);
  font-weight: 600;
  border-left: 4px solid var(--primary-blue);
}

.status.success {
  background: linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%);
  border-left-color: var(--success-green);
  color: var(--success-green);
}

.status ion-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.status h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--neutral-900);
}

.status p {
  margin: 0;
  font-size: 0.9rem;
  color: var(--neutral-600);
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
  --padding-top: 1rem;
  --padding-bottom: 1rem;
  font-weight: 700;
  font-size: 1.02rem;
  letter-spacing: -0.01em;
  text-transform: none;
  transition: all 0.3s ease;
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