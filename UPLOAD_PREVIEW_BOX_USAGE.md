# UploadPreviewBox Component Usage Guide

This component merges the upload and preview functionality into a single reusable box component.

## 🎯 **What it replaces:**

Instead of having separate upload box and preview box like this:

```vue
<!-- OLD WAY: Separate upload and preview -->
<div class="flex flex-col gap-1.5">
  <!-- Upload box -->
  <input ref="logoInput" type="file" accept="image/*" @change="handleLogoUpload" class="hidden" />
  <div
    @click="$refs.logoInput.click()"
    class="h-20 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 hover:shadow"
  >
    <span class="text-[10px] text-slate-500 dark:text-slate-300">
      Click to upload logo
    </span>
  </div>

  <!-- Separate preview box -->
  <div
    v-if="logoDataUrl"
    class="mt-1.5 p-1.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600"
  >
    <img :src="logoDataUrl" alt="Organization Logo Preview" class="h-14 w-full object-contain" />
  </div>
</div>
```

## ✅ **NEW WAY: Single merged component**

```vue
<!-- Import the component -->
<script setup>
import UploadPreviewBox from '@/components/common/UploadPreviewBox.vue'
import { ref } from 'vue'

const logoFile = ref(null)
const logoDataUrl = ref('')

function handleLogoChange(file) {
  logoFile.value = file
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoDataUrl.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    logoDataUrl.value = ''
  }
}
</script>

<template>
  <!-- Single component handles both upload and preview -->
  <UploadPreviewBox
    v-model="logoFile"
    :image-src="logoDataUrl"
    upload-text="Click to upload logo"
    upload-hint="PNG, JPG up to 5MB"
    image-alt="Organization Logo Preview"
    @change="handleLogoChange"
  />
</template>
```

## 🚀 **Usage Examples:**

### 1. **Basic Logo Upload (like in CustomerReceiptPage)**
```vue
<UploadPreviewBox
  v-model="logoFile"
  :image-src="logoDataUrl"
  upload-text="Click to upload logo"
  height="h-20"
  @change="handleLogoUpload"
/>
```

### 2. **Avatar Upload with Remove Button**
```vue
<UploadPreviewBox
  v-model="avatarFile"
  :image-src="avatarUrl"
  upload-text="Upload Avatar"
  upload-hint="Square image recommended"
  :show-remove-button="true"
  height="h-24"
  class="w-24"
  @change="handleAvatarChange"
  @remove="handleAvatarRemove"
/>
```

### 3. **Product Image with Drag & Drop**
```vue
<UploadPreviewBox
  v-model="productImage"
  :image-src="productImageUrl"
  upload-text="Drop product image here"
  upload-hint="PNG, JPG up to 10MB"
  :replace-on-click="true"
  replace-text="Click to replace image"
  :show-image-info="true"
  height="h-32"
  @change="handleProductImageChange"
  @error="handleUploadError"
/>
```

### 4. **Template/Background Image**
```vue
<UploadPreviewBox
  v-model="backgroundFile"
  :image-src="backgroundUrl"
  upload-text="Upload Background"
  upload-hint="High resolution recommended"
  :show-remove-button="true"
  :replace-on-click="true"
  height="h-40"
  @change="handleBackgroundChange"
/>
```

## 🎨 **Props Reference:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `File \| string \| null` | `null` | The selected file |
| `imageSrc` | `string` | `''` | Image URL for preview |
| `uploadText` | `string` | `'Click to upload'` | Text shown in upload state |
| `uploadHint` | `string` | `''` | Hint text below upload text |
| `accept` | `string` | `'image/*'` | File types to accept |
| `disabled` | `boolean` | `false` | Disable the component |
| `showRemoveButton` | `boolean` | `true` | Show remove button on hover |
| `replaceOnClick` | `boolean` | `true` | Allow replacing image by clicking |
| `replaceText` | `string` | `'Click to replace'` | Text shown on hover |
| `showImageInfo` | `boolean` | `false` | Show file name and size |
| `height` | `string` | `'h-20'` | Height class |
| `imageAlt` | `string` | `'Preview'` | Alt text for image |

## 📡 **Events:**

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `File \| null` | Emitted when file changes |
| `change` | `File \| null` | Emitted when file changes |
| `remove` | `void` | Emitted when remove button clicked |
| `error` | `string` | Emitted on validation error |

## 🔧 **Methods (via ref):**

```vue
<script setup>
const uploadBoxRef = ref()

// Programmatically trigger file input
uploadBoxRef.value.triggerFileInput()

// Programmatically clear file
uploadBoxRef.value.clearFile()
</script>

<template>
  <UploadPreviewBox ref="uploadBoxRef" ... />
</template>
```

## 🎯 **Files to Update:**

You can replace the upload/preview pattern in these files:

1. `src/views/receipts/CustomerReceiptPage.vue` (line 115-145)
2. `src/views/receipts/GenerateReceiptPage.vue` (line 120-150)  
3. `src/views/invoices/GenerateInvoicePage.vue` (line 120-150)
4. `src/views/invoices/templates/ClassicProfessionalTemplate.vue` (line 125-155)
5. `src/views/invoices/CustomerInvoicePage.vue` (line 135-165)

## ✨ **Benefits:**

✅ **Single component** instead of separate upload/preview divs
✅ **Drag & drop support** built-in
✅ **File validation** with error handling
✅ **Hover effects** and visual feedback
✅ **Customizable styling** via props
✅ **Accessibility** features
✅ **TypeScript support**
✅ **Consistent UX** across the app