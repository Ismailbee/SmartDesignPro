<template>
  <div>
    <!-- Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @close="handleCropperClose"
      @crop="handleCroppedImage"
    />

    <!-- Document History Modal -->
    <DocumentHistoryModal
      :is-open="showHistoryModal"
      :documents="savedReceipts"
      :loading="loadingReceipts"
      document-type="Receipt"
      @close="showHistoryModal = false"
      @load="handleLoadReceipt"
      @delete="handleDeleteReceipt"
    />

    <div class="h-screen overflow-y-auto flex flex-col gap-8 items-center justify-start bg-slate-100 dark:bg-slate-900 pt-[80px] pb-[150px] px-4">
      <!-- Member Info Banner -->
      <div v-if="authenticatedMember" class="w-full max-w-4xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-lg shadow-md flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span class="text-lg">👤</span>
        </div>
        <div>
          <p class="text-sm font-medium">Logged in as: <span class="font-bold">{{ authenticatedMember?.name }}</span></p>
          <p class="text-xs opacity-90">Role: {{ authenticatedMember?.role || 'Member' }}</p>
        </div>
      </div>
      <button @click="handleLogout" class="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md transition-colors text-sm font-medium">
        <span>Logout</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>

    <section class="w-full max-w-4xl flex flex-wrap items-center justify-between gap-3">
      <div class="space-y-2">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          Receipt Designer
          <span v-if="currentReceiptId" class="text-sm px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
            Editing #{{ receiptNumber }}
          </span>
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-300">
          Configure your receipt details then export as PDF or JPEG.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <!-- Auto Receipt Number Toggle -->
        <label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600">
          <input type="checkbox" v-model="autoReceiptNumber" class="rounded border-gray-300" />
          <span>Auto Receipt #</span>
        </label>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        <!-- Primary Actions -->
        <div class="flex items-center gap-2">
          <!-- Confirm Correction Button (only in correction mode) -->
          <BaseButton 
            v-if="isCorrectionMode" 
            variant="success" 
            @click="handleConfirmCorrection"
            class="bg-amber-600 hover:bg-amber-700 text-white font-bold animate-pulse"
          >
            ✅ Confirm Correction
          </BaseButton>

          <BaseButton variant="primary" @click="handleExportPDF">
            📄 Export PDF
          </BaseButton>
          <BaseButton variant="secondary" @click="handleExportJPEG">
            🖼️ Export JPEG
          </BaseButton>
        </div>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>

        <!-- Navigation -->
        <BaseButton variant="ghost" @click="handleBack">
          ← Back to Dashboard
        </BaseButton>
      </div>
    </section>

    <!-- Flex Container for Form and Preview -->
    <div class="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
      <!-- Quick Fill Form Section -->
      <section class="w-full lg:w-1/2">
        <div 
        class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            📝 Quick Fill Form
          </h2>
        <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Fill out this form to automatically populate the receipt below
        </p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          
            <!-- Organization Settings Section -->
          <div class="md:col-span-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Organization Details
            </h3>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <!-- Logo Upload -->
  <div class="md:col-span-1">
    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
      Organization Logo
    </label>

    <div class="flex flex-col gap-2">
      <!-- Hidden File Input -->
      <input
        ref="logoInput"
        type="file"
        accept="image/*"
        @change="handleLogoUpload"
        class="hidden"
      />

      <!-- Clickable Upload Box -->
      <div
        @click="$refs.logoInput.click()"
        class="h-24 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 hover:shadow"
      >
        <span class="text-xs text-slate-500 dark:text-slate-300">
          Click to upload logo
        </span>
      </div>

      <!-- Preview -->
      <div
        v-if="logoDataUrl"
        class="mt-2 p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600"
      >
        <img
          :src="logoDataUrl"
          alt="Organization Logo Preview"
          class="h-16 w-full object-contain"
        />
      </div>
    </div>
  </div>

  <!-- Organization Info -->
  <div class="md:col-span-2 flex flex-col gap-4">
    <!-- Organization Name -->
    <div>
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
        Organization Name
      </label>
      <textarea
        v-model="organizationName"
        rows="2"
        placeholder="Enter organization name"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs resize-none"
      ></textarea>
    </div>

    <!-- Organization Subtitle -->
    <div>
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
        Organization Subtitle
      </label>
      <textarea
        v-model="organizationSubName"
        rows="2"
        placeholder="Enter organization subtitle"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs resize-none"
      ></textarea>
    </div>

    <!-- Organization Address -->
    <div>
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
        Organization Address
      </label>
      <textarea
        v-model="organizationAddress"
        rows="2"
        placeholder="Enter organization address"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs resize-none"
      ></textarea>
    </div>

    <!-- Organization Phone -->
    <div>
      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
        Organization Phone
      </label>
      <input
        v-model="organizationPhone"
        type="text"
        placeholder="Enter phone number"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
      />
    </div>
  </div>
</div>

            <p class="text-xs text-blue-700 dark:text-blue-300 mt-3 flex items-start gap-1">
              <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>These details will appear in the receipt header. Upload a logo image (PNG, JPG) or leave empty.</span>
            </p>
          </div>


          <!-- Received From -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Received From
            </label>
            <input
              v-model="receivedFrom"
              type="text"
              placeholder="Enter payer name"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <!-- Amount (Naira) -->
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount (Naira)
            </label>
            <input
              v-model.number="naira"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>
        
          <!-- The Sum of (Amount in Words) -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount in Words (Line 1)
            </label>
            <input
              v-model="sumOf"
              @input="handleSumOfOverflow"
              type="text"
              :placeholder="amountInWords.words || 'Amount in words'"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <!-- The Sum of Line 2 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Amount in Words (Line 2)
            </label>
            <input
              v-model="sumOf2"
              @input="handleSumOf2Input"
              type="text"
              placeholder="Overflow text appears here automatically"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <!-- Being Payment For -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Description (Line 1)
            </label>
            <input
              v-model="paymentFor"
              @input="handlePaymentForOverflow"
              type="text"
              placeholder="Enter payment description"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <!-- Being Payment For Line 2 -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Payment Description (Line 2)
            </label>
            <input
              v-model="paymentFor2"
              @input="handlePaymentFor2Input"
              type="text"
              placeholder="Overflow text appears here automatically"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <!-- Signature Selection -->
          <div class="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700 md:col-span-2">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-sm font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Digital Signatures
              </h3>
              <button
                @click="handleCreateSignature"
                class="text-xs px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create New
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Signature 1 Selector -->
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Signature 1 (Left)
                </label>
                <select
                  v-model="selectedSignature1"
                  @change="handleSignature1Change"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">No signature</option>
                  <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">
                    {{ sig.name }}{{ sig.isPrimary ? ' (Primary)' : '' }}
                  </option>
                </select>
                
                <!-- Preview Signature 1 -->
                <div v-if="signatureImage1" class="mt-2 p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600">
                  <img :src="signatureImage1" alt="Signature 1 Preview" class="h-12 w-full object-contain" />
                </div>
              </div>

              <!-- Signature 2 Selector -->
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Signature 2 (Right)
                </label>
                <select
                  v-model="selectedSignature2"
                  @change="handleSignature2Change"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                >
                  <option value="">No signature</option>
                  <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">
                    {{ sig.name }}{{ sig.isPrimary ? ' (Primary)' : '' }}
                  </option>
                </select>
                
                <!-- Preview Signature 2 -->
                <div v-if="signatureImage2" class="mt-2 p-2 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600">
                  <img :src="signatureImage2" alt="Signature 2 Preview" class="h-12 w-full object-contain" />
                </div>
              </div>
            </div>

            <p class="text-xs text-purple-700 dark:text-purple-300 mt-3 flex items-start gap-1">
              <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Select signatures from your saved signatures or create new ones. Signatures will appear at the bottom of the receipt.</span>
            </p>
          </div>
        </div>
        <div class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div class="flex items-center justify-between">
            <span class="text-sm font-medium text-blue-900 dark:text-blue-300">
              Total Amount:
            </span>
            <span class="text-2xl font-bold text-blue-600 dark:text-blue-400">
              ₦{{ naira || 0 }}.{{ String(kobo || 0).padStart(2, '0') }}
            </span>
          </div>
          <div v-if="amountInWords.words" class="mt-2 text-xs text-blue-700 dark:text-blue-300 italic">
            {{ amountInWords.words }}
          </div>
        </div>

        <!-- Mobile Preview Button -->
        <div class="mt-4 md:hidden">
          <button
            @click="showPreview = !showPreview"
            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <svg v-if="!showPreview" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{{ showPreview ? 'Hide Preview' : 'Preview Receipt' }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Receipt Preview Section - Hidden on mobile unless showPreview is true -->
    <section 
      class="w-full max-w-5xl flex items-center justify-center"
      :class="{ 'hidden lg:flex': !showPreview }"
    >
      <!-- Mobile wrapper with responsive width -->
      <div class="w-full flex items-center justify-center md:p-4">
      <div
      ref="receiptOuterRef"
      class="bg-white mx-auto receipt-container"
      :style="{ 
        width: '7.268in', 
        height: '5.324in', 
        minWidth: '7.268in', 
        padding: '0.412in',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transform: isMobile ? `scale(${mobileScale})` : 'none',
        transformOrigin: 'center center'
      }"
      >
        <div
        id="receipt-canvas"
        ref="receiptRef"
        style="width: 6in; height: 4.5in; overflow: visible; background-color: white; flex-shrink: 0; padding: 0.2in;"
      >
        <!-- Header -->
        <div class="text-center">
          <div class="flex items-start">
            <!-- Logo (Fixed - Developer Only) -->
            <div v-if="logoDataUrl" class="">
              <img :src="logoDataUrl" alt="ICAN Logo" class="h-16 md:h-20 w-auto object-contain" />
            </div>
            
            <!-- Organization Name (Now Editable by Users) -->
            <div class="max-w-[400px] mx-auto">
              <div>
                <h2 
                  :class="[
                    'ml-4 md:text-2xl font-bold text-center',
                    organizationName === '' ? 'text-gray-400' : 'text-blue-800'
                  ]"
                  style="font-family: 'Arial Narrow', 'Roboto Condensed', 'Oswald', sans-serif; font-weight: 900; letter-spacing: -0.5px; word-wrap: break-word; word-break: break-word; white-space: normal;"
                >
                  {{ organizationName || 'Enter organization name' }}
                </h2>
              </div>
            
              <div>
                <!-- Subtitle (Now Editable by Users) -->
              <p 
                :class="[
                  'text-sm text-center mt-[-11px]',
                  organizationSubName === '' ? 'text-gray-400' : 'text-slate-900 dark:text-slate-100'
                ]"
                style="word-wrap: break-word; word-break: break-word; white-space: normal;"
              >
                {{ organizationSubName || 'Enter organization subtitle' }}
              </p>
              
              <!-- Phone Address -->
               <p 
              :class="[
                'text-xs text-center',
                organizationAddress === '' ? 'text-gray-400' : 'text-slate-900 dark:text-slate-100'
              ]"
              style="word-wrap: break-word; word-break: break-word; white-space: normal;"
            >
             <strong> Address: </strong> {{ organizationAddress || 'Enter organization address' }}
            </p>

              <!-- Phone (Now Editable by Users) -->
              <p 
                :class="[
                  'text-xs text-center font-bold',
                  organizationPhone === '' ? 'text-gray-400' : 'text-slate-900 dark:text-slate-100'
                ]"
                style="word-wrap: break-word; word-break: break-word; white-space: normal;"
              >
                Tel: {{ organizationPhone || 'Enter phone number' }}
              </p>
              </div>
            
            </div>
          </div>


          <!-- Receipt Title -->
          <p class="text-lg font-bold uppercase mt-2 bg-red-500 text-white inline-block px-3  rounded">
            CASH RECEIPT
          </p>
        </div>

        <!-- Body -->
        <div class="text-sm space-y-2">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-1">
              <span>Date:</span>
              <input
                v-model="date"
                type="date"
                :disabled="autoDate"
                class="bg-transparent border-none focus:outline-none text-sm"
              />
            </div>
            <div class="flex items-center gap-1">
              <span>No.:</span>
              <input
                v-model.number="receiptNumber"
                :disabled="autoReceiptNumber"
                type="number"
                min="1"
                class="w-16 bg-transparent border-none focus:outline-none text-center"
              />
            </div>
          </div>

          <div class="flex items-center gap-1">
            <span>Received From:</span>
            <input
              v-model="receivedFrom"
              placeholder=" "
              class="flex-1 bg-transparent border-b border-dotted border-gray-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-1">
            <span>The Sum of:</span>
            <input
              ref="sumOfInput1"
              v-model="sumOf"
              @input="handleSumOfOverflow"
              class="flex-1 bg-transparent border-b border-dotted border-gray-400 focus:outline-none"
            />
          </div>

          <div class="flex items-center gap-2">
            <input
              ref="sumOfInput2"
              v-model="sumOf2"
              type="text"
              @input="handleSumOf2Input"
              class="flex-1 bg-transparent border-b border-dotted border-gray-400 focus:outline-none"
            />
            <span>Naira</span>
            <div class="w-16 bg-transparent border-b border-dotted border-gray-400 flex items-center justify-center text-center">
              <span>Only</span>
            </div>
            <span>Kobo</span>
          </div>

          <div class="flex items-center gap-1">
            <span>Being Payment for:</span>
            <input
              ref="paymentForInput1"
              v-model="paymentFor"
              @input="handlePaymentForOverflow"
              class="flex-1 bg-transparent border-b border-dotted border-gray-400 focus:outline-none"
            />
          </div>

          <!-- Additional line for payment description -->
          <div class="flex items-center gap-2">
            <input
              ref="paymentForInput2"
              v-model="paymentFor2"
              @input="handlePaymentFor2Input"
              class="flex-1 bg-transparent border-b border-dotted border-gray-400 focus:outline-none"
            />
          </div>
          
          <div class="flex justify-between items-start">
           
            <!-- Signature 1 -->
            <div class="flex flex-col items-center gap-1 mt-[-15px]">
              <!-- Signature 1 Image -->
                <div v-if="signatureImage1">
                <img :src="signatureImage1" alt="Signature 1" class="h-16 w-auto object-contain max-w-[150px]" />
              </div>

              <div v-else class="mb-1 h-16 w-24 border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                No signature
              </div>

             <div class="w-full border-t border-gray-400 text-center mt-[-20px]">
               <p class="italic text-[10px]">Signature</p>
             </div> 
            </div>

            <!-- Amount in figures -->
            <div class="flex flex-col items-center mt-3">
              <div class="border-2 border-yellow-400 p-2 py-2 bg-yellow-50 min-w-[100px] md:min-w-[200px]">
                <div class="flex justify-center gap-2">
                  <span class="font-bold text-lg">₦{{ naira || 0 }}</span>
                </div>
              </div>
            </div>

          <!-- Signature 2 -->
            <div class="flex flex-col items-center gap-1 mt-[-15px]">
              <!-- Signature 2 Image -->
                <div v-if="signatureImage2">
                <img :src="signatureImage2" alt="Signature 2" class="h-16 w-auto object-contain max-w-[150px]" />
              </div>

              <div v-else class="mb-1 h-16 w-24 border border-dashed border-gray-300 flex items-center justify-center text-[9px] text-gray-400">
                No signature
              </div>

             <div class="w-full border-t border-gray-400 text-center mt-[-20px]">
               <p class="italic text-[10px]">Signature</p>
             </div> 
            </div>
          </div>
        </div>

        <!-- Hidden checkboxes for auto date -->
        <div class="hidden">
          <input type="checkbox" v-model="autoDate" @change="syncDate" />
        </div>
      </div>
      </div>
      </div>
    </section>
    </div>
    <!-- End Flex Container -->

    </div>
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DocumentHistoryModal from '@/components/DocumentHistoryModal.vue';
import LogoCropper from '@/components/LogoCropper.vue';
import { storeToRefs } from 'pinia';
import html2pdf from 'html2pdf.js';
import * as htmlToImage from 'html-to-image';
import BaseButton from '@/components/BaseButton.vue';
import { useReceiptStore } from '@/stores/receiptStore';
import { useFinanceStore } from '@/stores/finance';
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { 
  saveReceipt, 
  getAllReceipts, 
  deleteReceipt,
  updateReceipt,
  saveMemberActivity,
  getAllSignatures
} from '@/firebase/database';

export default defineComponent({
  name: 'ReceiptPage',
  components: {
    BaseButton,
    DocumentHistoryModal,
    LogoCropper
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    const receiptStore = useReceiptStore();
    const financeStore = useFinanceStore();

    // API Base URL
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Member authentication
    const authenticatedMember = ref(null);

    // Correction mode state
    const isCorrectionMode = ref(false);
    const originalTransactionData = ref(null);

    // Document history state
    const showHistoryModal = ref(false);
    const savedReceipts = ref([]);
    const loadingReceipts = ref(false);
    const currentReceiptId = ref(null); // Track if we're editing an existing receipt
    const isSaving = ref(false);

    // Load authenticated member info and check for password verification
    onMounted(() => {
      const storedMember = localStorage.getItem('authenticatedMember');
      if (storedMember) {
        authenticatedMember.value = JSON.parse(storedMember);
      }

      // Check for pending correction from Stats page
      const pendingCorrection = localStorage.getItem('pendingCorrection');
      if (pendingCorrection) {
        const correctionData = JSON.parse(pendingCorrection);
        
        // Only load if it's a receipt correction
        if (correctionData.type === 'receipt') {
          // Show banner notification
          alert(`📝 Correction Mode: You're correcting Receipt #${correctionData.receiptNumber}\n\nPlease redo the work and click "Confirm Correction" when done.`);
          
          // Store the original transaction ID for later
          currentReceiptId.value = correctionData.id;
          isCorrectionMode.value = true;
          originalTransactionData.value = correctionData;
        }
      }

      // Setup mobile detection
      calculateMobileScale();
      window.addEventListener('resize', calculateMobileScale);

      // Load saved signatures
      loadSignatures();

      // Reload signatures when page becomes visible (e.g., returning from signature page)
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          loadSignatures();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
    });

    // Cleanup on unmount
    onBeforeUnmount(() => {
      window.removeEventListener('resize', calculateMobileScale);
    });

    // Editable organization details (Users can now change these)
    const organizationName = ref('');
    const organizationSubName = ref('');
    const organizationAddress = ref('');
    const organizationPhone = ref('');
    
    // Logo data (Users can upload their own logo)
    const logoDataUrl = ref(null); // Logo only shows when user uploads
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    
    // Logo upload handler - opens cropper
    const handleLogoUpload = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file (PNG, JPG, etc.)');
          return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }
        
        // Read file and show cropper
        const reader = new FileReader();
        reader.onload = (e) => {
          tempImageUrl.value = e.target?.result;
          showImageCropper.value = true;
        };
        reader.readAsDataURL(file);
      }
      
      // Reset input so same file can be selected again
      if (event.target) {
        event.target.value = '';
      }
    };
    
    // Handle cropped image
    const handleCroppedImage = (croppedDataUrl) => {
      logoDataUrl.value = croppedDataUrl;
      showImageCropper.value = false;
      tempImageUrl.value = '';
    };
    
    // Handle cropper close
    const handleCropperClose = () => {
      showImageCropper.value = false;
      tempImageUrl.value = '';
    };
    
    // Signature images (Developer can set signature images here - PNG/JPEG)
    const signatureImage1 = ref('/images/signature1.png'); // Signature 1 image: ref('/images/signature1.png')
    const signatureImage2 = ref('/images/signature2.png'); // Signature 2 image: ref('/images/signature2.png')

    // Signature management
    const savedSignatures = ref([]);
    const selectedSignature1 = ref('');
    const selectedSignature2 = ref('');
    const loadingSignatures = ref(false);

    // Additional fields for signatures and payment description
    const paymentFor2 = ref('');
    const sumOf2 = ref('');
    const signature1 = ref('');
    const signature2 = ref('');

    const {
      date,
      autoDate,
      receivedFrom,
      sumOf,
      naira,
      kobo,
      paymentFor,
      signatureName,
      amountInWords,
    } = storeToRefs(receiptStore);

    const { receiptNumber, autoReceiptNumber } = storeToRefs(financeStore);

    const { incrementReceiptNumber, ensureRanges } = receiptStore;

    const receiptRef = ref(null);
    const receiptOuterRef = ref(null);
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const paymentForInput1 = ref(null);
    const paymentForInput2 = ref(null);
    const showPreview = ref(false); // Mobile preview toggle
    const isExporting = ref(false); // Prevent double export

    // Mobile detection
    const isMobile = ref(false);
    const mobileScale = ref(1);

    const calculateMobileScale = () => {
      const screenWidth = window.innerWidth;
      isMobile.value = screenWidth < 768;
      if (isMobile.value) {
        // Calculate scale to fit 7.268in width in screen
        const receiptWidthInPixels = 7.268 * 96; // 7.268in * 96dpi
        mobileScale.value = Math.min(1, screenWidth / receiptWidthInPixels);
      } else {
        mobileScale.value = 1;
      }
    };

    const syncDate = () => {
      if (autoDate.value) {
        date.value = new Date().toISOString().split('T')[0];
      }
    };

    watch([naira, kobo], () => {
      ensureRanges();
    });

    // Auto-fill "The Sum of" field when amount in words changes
    watch(
      () => amountInWords.value.words,
      (newWords) => {
        if (newWords) {
          sumOf.value = newWords;
        }
      }
    );

    watch(
      () => autoDate.value,
      (value) => {
        if (value) {
          syncDate();
        }
      }
    );

    watch(
      () => autoReceiptNumber.value,
      (value) => {
        if (value) {
          receiptNumber.value = Math.max(1, receiptNumber.value || 1);
        }
      }
    );

    watch(
      () => receiptNumber.value,
      (value) => {
        financeStore.setReceiptNumber(Math.max(1, Number(value) || 1));
      }
    );

    const handleBack = () => {
      router.push({ name: 'Dashboard' });
    };

    // Handle logout
    const handleLogout = () => {
      if (confirm('Are you sure you want to logout? You will be returned to the Dashboard.')) {
        // Remove authentication
        localStorage.removeItem('authenticatedMember');
        
        // Log the logout activity
        const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
        activities.push({
          memberName: authenticatedMember.value?.name || 'Unknown',
          action: 'Logged out',
          timestamp: new Date().toISOString(),
          branch: route.query.branch || 'Unknown'
        });
        localStorage.setItem('memberActivities', JSON.stringify(activities));
        
        // Navigate to Dashboard
        router.push({ name: 'Dashboard' });
      }
    };

    // Save receipt to cloud
    const handleSaveReceipt = async () => {
      if (!authenticatedMember.value?.branch) {
        alert('Branch information not found. Please login again.');
        return;
      }

      // Validate required fields
      if (!receivedFrom.value || !naira.value) {
        alert('Please fill in payer name and amount before saving.');
        return;
      }

      isSaving.value = true;
      try {
        const receiptData = {
          receiptNumber: receiptNumber.value,
          date: date.value,
          receivedFrom: receivedFrom.value,
          naira: naira.value,
          kobo: kobo.value || 0,
          sumOf: sumOf.value,
          paymentFor: paymentFor.value,
          grandTotal: parseFloat(naira.value || 0) + parseFloat((kobo.value || 0) / 100),
          organizationName,
          organizationAddress: organizationAddress.value,
          organizationPhone: organizationPhone.value,
          createdBy: authenticatedMember.value.name,
          status: 'Active'
        };

        const result = await saveReceipt(
          authenticatedMember.value.branch,
          receiptData,
          currentReceiptId.value
        );

        if (result.success) {
          currentReceiptId.value = result.receiptId;
          
          // Log activity
          await saveMemberActivity(authenticatedMember.value.branch, {
            memberName: authenticatedMember.value.name,
            action: result.isUpdate ? 'Updated receipt' : 'Created receipt',
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString(),
            details: `Receipt #${receiptNumber.value} - ${receivedFrom.value}`
          });

          // Also log locally
          const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
          activities.unshift({
            id: Date.now(),
            memberName: authenticatedMember.value.name,
            action: result.isUpdate ? 'Updated receipt' : 'Created receipt',
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('memberActivities', JSON.stringify(activities));
          
          alert(result.isUpdate ? '✅ Receipt updated successfully!' : '✅ Receipt saved to cloud successfully!');
        } else {
          alert('❌ Failed to save receipt: ' + result.error);
        }
      } catch (error) {
        console.error('Error saving receipt:', error);
        alert('❌ Error saving receipt. Please try again.');
      } finally {
        isSaving.value = false;
      }
    };

    // Load saved receipts
    const handleViewHistory = async () => {
      if (!authenticatedMember.value?.branch) {
        alert('Branch information not found. Please login again.');
        return;
      }

      loadingReceipts.value = true;
      showHistoryModal.value = true;
      
      try {
        const result = await getAllReceipts(authenticatedMember.value.branch);
        if (result.success) {
          savedReceipts.value = result.data;
        } else {
          alert('Failed to load receipts: ' + result.error);
        }
      } catch (error) {
        console.error('Error loading receipts:', error);
        alert('Error loading receipts. Please try again.');
      } finally {
        loadingReceipts.value = false;
      }
    };

    // Load selected receipt for editing
    const handleLoadReceipt = (receipt) => {
      // Populate form with receipt data
      currentReceiptId.value = receipt.id;
      receiptNumber.value = receipt.receiptNumber || 1;
      date.value = receipt.date || new Date().toISOString().split('T')[0];
      receivedFrom.value = receipt.receivedFrom || '';
      naira.value = receipt.naira || 0;
      kobo.value = receipt.kobo || 0;
      sumOf.value = receipt.sumOf || '';
      paymentFor.value = receipt.paymentFor || '';
      
      // Load organization info if available
      if (receipt.organizationAddress) organizationAddress.value = receipt.organizationAddress;
      if (receipt.organizationPhone) organizationPhone.value = receipt.organizationPhone;

      showHistoryModal.value = false;
      
      // Log activity
      const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        memberName: authenticatedMember.value.name,
        action: `Loaded receipt #${receipt.receiptNumber} for editing`,
        branch: authenticatedMember.value.branch,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('memberActivities', JSON.stringify(activities));
      
      alert(`✅ Receipt #${receipt.receiptNumber} loaded! You can now edit and save it.`);
    };

    // Delete receipt from cloud
    const handleDeleteReceipt = async (receipt) => {
      if (!authenticatedMember.value?.branch) {
        alert('Branch information not found.');
        return;
      }

      try {
        const result = await deleteReceipt(authenticatedMember.value.branch, receipt.id);
        
        if (result.success) {
          // Remove from local list
          savedReceipts.value = savedReceipts.value.filter(rcp => rcp.id !== receipt.id);
          
          // Log activity
          await saveMemberActivity(authenticatedMember.value.branch, {
            memberName: authenticatedMember.value.name,
            action: 'Deleted receipt',
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString(),
            details: `Receipt #${receipt.receiptNumber}`
          });

          // Also log locally
          const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
          activities.unshift({
            id: Date.now(),
            memberName: authenticatedMember.value.name,
            action: `Deleted receipt #${receipt.receiptNumber}`,
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('memberActivities', JSON.stringify(activities));
          
          // If we're currently editing this receipt, clear the current ID
          if (currentReceiptId.value === receipt.id) {
            currentReceiptId.value = null;
          }
        } else {
          alert('Failed to delete receipt: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting receipt:', error);
        alert('Error deleting receipt. Please try again.');
      }
    };

    // Create new receipt (clear form)
    const handleNewReceipt = () => {
      if (currentReceiptId.value) {
        if (!confirm('You are currently editing a receipt. Create a new one? Any unsaved changes will be lost.')) {
          return;
        }
      }
      
      // Clear all fields
      currentReceiptId.value = null;
      receivedFrom.value = '';
      naira.value = 0;
      kobo.value = 0;
      sumOf.value = '';
      paymentFor.value = '';
      
      // Auto-increment receipt number if auto is enabled
      if (autoReceiptNumber.value) {
        incrementReceiptNumber();
      }
      
      // Log activity
      const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
      activities.unshift({
        id: Date.now(),
        memberName: authenticatedMember.value.name,
        action: 'Started creating new receipt',
        branch: authenticatedMember.value.branch,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('memberActivities', JSON.stringify(activities));
    };

    // Load signatures from Firebase
    const loadSignatures = async () => {
      if (!authenticatedMember.value?.branch) return;

      loadingSignatures.value = true;
      try {
        const result = await getAllSignatures(authenticatedMember.value.branch);
        if (result.success) {
          savedSignatures.value = result.data;
          
          // Auto-select primary signatures
          const primary = result.data.find(sig => sig.isPrimary);
          if (primary) {
            selectedSignature1.value = primary.id;
            selectedSignature2.value = primary.id;
            signatureImage1.value = primary.dataURL;
            signatureImage2.value = primary.dataURL;
          }
        }
      } catch (error) {
        console.error('Error loading signatures:', error);
      } finally {
        loadingSignatures.value = false;
      }
    };

    // Handle signature 1 selection
    const handleSignature1Change = () => {
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature1.value);
      if (selected) {
        signatureImage1.value = selected.dataURL;
      } else {
        signatureImage1.value = null;
      }
    };

    // Handle signature 2 selection
    const handleSignature2Change = () => {
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature2.value);
      if (selected) {
        signatureImage2.value = selected.dataURL;
      } else {
        signatureImage2.value = null;
      }
    };

    // Navigate to signature page
    const handleCreateSignature = () => {
      // Store the return path so SignaturePage knows where to redirect after creating signature
      localStorage.setItem('signatureReturnPath', '/receipt');
      localStorage.setItem('signatureReturnType', 'receipt');
      router.push('/signature');
    };

    // Auto-overflow handlers for Sum of fields
    const handleSumOfOverflow = () => {
      const maxLength = 50; // Extended character limit to fill the entire first line
      if (sumOf.value.length > maxLength) {
        const overflow = sumOf.value.substring(maxLength);
        sumOf.value = sumOf.value.substring(0, maxLength);
        sumOf2.value = overflow + sumOf2.value;
        // Focus on second input
        setTimeout(() => {
          if (sumOfInput2.value) {
            sumOfInput2.value.focus();
            sumOfInput2.value.setSelectionRange(overflow.length, overflow.length);
          }
        }, 0);
      }
    };

    const handleSumOf2Input = () => {
      // If user deletes everything in second line and there's content in first, merge
      if (sumOf2.value === '' && sumOf.value.length > 0) {
        // Allow clearing without merging
      }
    };

    // Auto-overflow handlers for Payment For fields
    const handlePaymentForOverflow = () => {
      const maxLength = 50; // Extended character limit to fill the entire first line
      if (paymentFor.value.length > maxLength) {
        const overflow = paymentFor.value.substring(maxLength);
        paymentFor.value = paymentFor.value.substring(0, maxLength);
        paymentFor2.value = overflow + paymentFor2.value;
        // Focus on second input
        setTimeout(() => {
          if (paymentForInput2.value) {
            paymentForInput2.value.focus();
            paymentForInput2.value.setSelectionRange(overflow.length, overflow.length);
          }
        }, 0);
      }
    };

    const handlePaymentFor2Input = () => {
      // If user deletes everything in second line, allow it
      if (paymentFor2.value === '' && paymentFor.value.length > 0) {
        // Allow clearing without merging
      }
    };

    // Confirm correction handler
    const handleConfirmCorrection = async () => {
      if (!isCorrectionMode.value || !originalTransactionData.value) {
        alert('❌ Not in correction mode');
        return;
      }

      try {
        const branch = authenticatedMember.value?.branch || 'Unknown';
        
        // Calculate grand total
        const grandTotal = parseFloat(naira.value || 0) + parseFloat((kobo.value || 0) / 100);
        
        // Prepare corrected data
        const correctedReceipt = {
          receiptNumber: receiptNumber.value,
          date: date.value,
          receivedFrom: receivedFrom.value,
          paymentFor: paymentFor.value,
          paymentFor2: paymentFor2.value,
          sumOf: sumOf.value,
          sumOf2: sumOf2.value,
          naira: naira.value,
          kobo: kobo.value || 0,
          grandTotal: grandTotal,
          amountInWords: amountInWords.value,
          isCorrected: true,
          isMistake: false,
          correctedAt: new Date().toISOString(),
          correctedBy: authenticatedMember.value?.name || 'Unknown',
        };

        // Update in Firebase
        await updateReceipt(branch, originalTransactionData.value.id, correctedReceipt);

        // Clear correction mode
        localStorage.removeItem('pendingCorrection');
        isCorrectionMode.value = false;
        originalTransactionData.value = null;

        alert('✅ Correction saved successfully!');
        
        // Redirect back to Stats page with refresh flag
        router.push({ name: 'Stats', query: { corrected: 'true', t: Date.now() } });
      } catch (error) {
        console.error('Error saving correction:', error);
        alert('❌ Failed to save correction: ' + error.message);
      }
    };

    const handleExportPDF = async () => {
      if (!receiptOuterRef.value || isExporting.value) return;
      
      isExporting.value = true;
      ensureRanges();
      
      // Save receipt to backend with branch information
      const branch = route.query.branch || '';
      const receiptData = {
        organizationName: organizationName,
        address: organizationAddress.value,
        phone: organizationPhone.value,
        date: date.value,
        receivedFrom: receivedFrom.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        naira: naira.value,
        kobo: kobo.value,
        paymentFor: paymentFor.value,
        paymentFor2: paymentFor2.value,
        signature1: signature1.value,
        signature2: signature2.value,
        signatureName: signatureName.value,
        amount: naira.value + (kobo.value / 100),
        number: receiptNumber.value,
        branch: branch, // Include branch info
      };

        try {
          await fetch(`${API_BASE}/receipt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receiptData),
          });
        } catch (error) {
          console.error('Failed to save receipt:', error);
        }

      const filename = `receipt-${receiptNumber.value}.pdf`;
      
      // Fixed dimensions for receipt export
      const RECEIPT_WIDTH = 7.268; // inches
      const RECEIPT_HEIGHT = 5.324; // inches
      
      const options = {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 3, 
          useCORS: true,
          backgroundColor: '#ffffff',
          width: RECEIPT_WIDTH * 96, // Convert to pixels (96 DPI)
          height: RECEIPT_HEIGHT * 96,
          windowWidth: RECEIPT_WIDTH * 96,
          windowHeight: RECEIPT_HEIGHT * 96
        },
        jsPDF: { unit: 'in', format: [RECEIPT_WIDTH, RECEIPT_HEIGHT], orientation: 'landscape' },
      };

      try {
        // Store original styles
        const originalWidth = receiptOuterRef.value.style.width;
        const originalHeight = receiptOuterRef.value.style.height;
        const originalMinWidth = receiptOuterRef.value.style.minWidth;
        const originalMaxWidth = receiptOuterRef.value.style.maxWidth;
        const originalTransform = receiptOuterRef.value.style.transform;
        const originalBackground = receiptOuterRef.value.style.backgroundColor;
        const originalBoxShadow = receiptOuterRef.value.style.boxShadow;
        const originalBorder = receiptOuterRef.value.style.border;
        const originalPadding = receiptOuterRef.value.style.padding;
        const originalDisplay = receiptOuterRef.value.style.display;
        const originalJustifyContent = receiptOuterRef.value.style.justifyContent;
        const originalAlignItems = receiptOuterRef.value.style.alignItems;
        const originalPosition = receiptOuterRef.value.style.position;
        const originalMargin = receiptOuterRef.value.style.margin;
        
        // Force exact dimensions and white background for export (remove shadows)
        // Use flexbox to center the 6" content within 7.268" container
        receiptOuterRef.value.style.width = `${RECEIPT_WIDTH}in`;
        receiptOuterRef.value.style.height = `${RECEIPT_HEIGHT}in`;
        receiptOuterRef.value.style.minWidth = `${RECEIPT_WIDTH}in`;
        receiptOuterRef.value.style.maxWidth = `${RECEIPT_WIDTH}in`;
        receiptOuterRef.value.style.transform = 'none';
        receiptOuterRef.value.style.transformOrigin = 'center center';
        receiptOuterRef.value.style.backgroundColor = '#ffffff';
        receiptOuterRef.value.style.boxShadow = 'none';
        receiptOuterRef.value.style.border = 'none';
        receiptOuterRef.value.style.padding = '0';
        receiptOuterRef.value.style.margin = '0';
        receiptOuterRef.value.style.display = 'flex';
        receiptOuterRef.value.style.justifyContent = 'center';
        receiptOuterRef.value.style.alignItems = 'center';
        receiptOuterRef.value.style.position = 'relative';
        receiptOuterRef.value.classList.add('exporting');
        
        // Wait for styles to be applied
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await html2pdf().set(options).from(receiptOuterRef.value).save();
        
        // Log activity
        logActivity(`Created Receipt #${receiptNumber.value || 'N/A'}`);
        
        incrementReceiptNumber();
        
        // Restore original styles
        receiptOuterRef.value.style.width = originalWidth;
        receiptOuterRef.value.style.height = originalHeight;
        receiptOuterRef.value.style.minWidth = originalMinWidth;
        receiptOuterRef.value.style.maxWidth = originalMaxWidth;
        receiptOuterRef.value.style.transform = originalTransform;
        receiptOuterRef.value.style.backgroundColor = originalBackground;
        receiptOuterRef.value.style.boxShadow = originalBoxShadow;
        receiptOuterRef.value.style.border = originalBorder;
        receiptOuterRef.value.style.padding = originalPadding;
        receiptOuterRef.value.style.display = originalDisplay;
        receiptOuterRef.value.style.justifyContent = originalJustifyContent;
        receiptOuterRef.value.style.alignItems = originalAlignItems;
        receiptOuterRef.value.style.position = originalPosition;
        receiptOuterRef.value.style.margin = originalMargin;
        
        receiptOuterRef.value.classList.remove('exporting');
      } catch (error) {
        console.error('Export failed:', error);
        // Always restore on error
        if (receiptOuterRef.value) {
          receiptOuterRef.value.classList.remove('exporting');
        }
      } finally {
        isExporting.value = false;
      }
    };

    const handleExportJPEG = async () => {
      if (!receiptOuterRef.value || isExporting.value) return;
      
      isExporting.value = true;
      ensureRanges();
      
      // Save receipt to backend with branch information
      const branch = route.query.branch || '';
      const receiptData = {
        organizationName: organizationName,
        address: organizationAddress.value,
        phone: organizationPhone.value,
        date: date.value,
        receivedFrom: receivedFrom.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        naira: naira.value,
        kobo: kobo.value,
        paymentFor: paymentFor.value,
        paymentFor2: paymentFor2.value,
        signature1: signature1.value,
        signature2: signature2.value,
        signatureName: signatureName.value,
        amount: naira.value + (kobo.value / 100),
        number: receiptNumber.value,
        branch: branch, // Include branch info
      };

        try {
          await fetch(`${API_BASE}/receipt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(receiptData),
          });
        } catch (error) {
          // Failed to save receipt to backend
          // Continue with export anyway
        }

      // Fixed dimensions for receipt export
      const RECEIPT_WIDTH = 7.268; // inches
      const RECEIPT_HEIGHT = 5.324; // inches

      // Store original styles (declare outside try-catch for catch block access)
      const originalWidth = receiptOuterRef.value.style.width;
      const originalHeight = receiptOuterRef.value.style.height;
      const originalMinWidth = receiptOuterRef.value.style.minWidth;
      const originalMaxWidth = receiptOuterRef.value.style.maxWidth;
      const originalTransform = receiptOuterRef.value.style.transform;
      const originalBackground = receiptOuterRef.value.style.backgroundColor;
      const originalBoxShadow = receiptOuterRef.value.style.boxShadow;
      const originalBorder = receiptOuterRef.value.style.border;
      const originalPadding = receiptOuterRef.value.style.padding;
      const originalDisplay = receiptOuterRef.value.style.display;
      const originalJustifyContent = receiptOuterRef.value.style.justifyContent;
      const originalAlignItems = receiptOuterRef.value.style.alignItems;
      const originalPosition = receiptOuterRef.value.style.position;
      const originalMargin = receiptOuterRef.value.style.margin;

      try {
        
        // Force exact dimensions and white background for export (remove shadows)
        // Use flexbox to center the 6" content within 7.268" container
        receiptOuterRef.value.style.width = `${RECEIPT_WIDTH}in`;
        receiptOuterRef.value.style.height = `${RECEIPT_HEIGHT}in`;
        receiptOuterRef.value.style.minWidth = `${RECEIPT_WIDTH}in`;
        receiptOuterRef.value.style.maxWidth = `${RECEIPT_WIDTH}in`;
        receiptOuterRef.value.style.transform = 'none';
        receiptOuterRef.value.style.transformOrigin = 'center center';
        receiptOuterRef.value.style.backgroundColor = '#ffffff';
        receiptOuterRef.value.style.boxShadow = 'none';
        receiptOuterRef.value.style.border = 'none';
        receiptOuterRef.value.style.padding = '0';
        receiptOuterRef.value.style.margin = '0';
        receiptOuterRef.value.style.display = 'flex';
        receiptOuterRef.value.style.justifyContent = 'center';
        receiptOuterRef.value.style.alignItems = 'center';
        receiptOuterRef.value.style.position = 'relative';
        receiptOuterRef.value.classList.add('exporting');
        
        // Wait for styles to be applied
        await new Promise(resolve => setTimeout(resolve, 500)); // Increased timeout
        
        // Verify the element exists and has dimensions
        if (!receiptOuterRef.value) {
          throw new Error('Receipt element not found');
        }
        
        const rect = receiptOuterRef.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          throw new Error(`Receipt element has no dimensions (${rect.width}x${rect.height})`);
        }
        
        // Try to export using html-to-image
        let dataUrl;
        try {
          dataUrl = await htmlToImage.toJpeg(receiptOuterRef.value, {
            quality: 0.95,
            pixelRatio: 2, // Reduced to 2 for better compatibility
            backgroundColor: '#ffffff',
            cacheBust: true,
            skipFonts: false,
          });
        } catch (jpegError) {
          // Fallback to PNG if JPEG fails
          dataUrl = await htmlToImage.toPng(receiptOuterRef.value, {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            cacheBust: true,
          });
        }
        
        if (!dataUrl || dataUrl.length < 100) {
          throw new Error('Failed to generate image data');
        }
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `receipt-${receiptNumber.value}.jpg`;
        link.click();
        
        // Log activity
        logActivity(`Created Receipt #${receiptNumber.value || 'N/A'}`);
        
        incrementReceiptNumber();
        
        // Restore original styles
        receiptOuterRef.value.style.width = originalWidth;
        receiptOuterRef.value.style.height = originalHeight;
        receiptOuterRef.value.style.minWidth = originalMinWidth;
        receiptOuterRef.value.style.maxWidth = originalMaxWidth;
        receiptOuterRef.value.style.transform = originalTransform;
        receiptOuterRef.value.style.backgroundColor = originalBackground;
        receiptOuterRef.value.style.boxShadow = originalBoxShadow;
        receiptOuterRef.value.style.border = originalBorder;
        receiptOuterRef.value.style.padding = originalPadding;
        receiptOuterRef.value.style.display = originalDisplay;
        receiptOuterRef.value.style.justifyContent = originalJustifyContent;
        receiptOuterRef.value.style.alignItems = originalAlignItems;
        receiptOuterRef.value.style.position = originalPosition;
        receiptOuterRef.value.style.margin = originalMargin;
        receiptOuterRef.value.classList.remove('exporting');
        
        // Show success notification
        alert(`Receipt #${receiptNumber.value} exported successfully as JPEG!`);
      } catch (error) {
        // Show detailed error to user
        const errorMsg = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : '';
        alert(`❌ Export failed: ${errorMsg}\n\nPlease check:\n- Receipt content is filled\n- Browser allows downloads\n- No browser extensions blocking`);
        
        // Log to console for debugging
        if (typeof window !== 'undefined' && window.console) {
          window.console.warn('Export error details:', errorMsg, errorStack);
        }
        
        // Always restore on error
        if (receiptOuterRef.value) {
          // Restore original styles
          receiptOuterRef.value.style.width = originalWidth;
          receiptOuterRef.value.style.height = originalHeight;
          receiptOuterRef.value.style.minWidth = originalMinWidth;
          receiptOuterRef.value.style.maxWidth = originalMaxWidth;
          receiptOuterRef.value.style.transform = originalTransform;
          receiptOuterRef.value.style.backgroundColor = originalBackground;
          receiptOuterRef.value.style.boxShadow = originalBoxShadow;
          receiptOuterRef.value.style.border = originalBorder;
          receiptOuterRef.value.style.padding = originalPadding;
          receiptOuterRef.value.style.display = originalDisplay;
          receiptOuterRef.value.style.justifyContent = originalJustifyContent;
          receiptOuterRef.value.style.alignItems = originalAlignItems;
          receiptOuterRef.value.style.position = originalPosition;
          receiptOuterRef.value.style.margin = originalMargin;
          receiptOuterRef.value.classList.remove('exporting');
        }
      } finally {
        isExporting.value = false;
      }
    };

    const logActivity = (action) => {
      const authMember = localStorage.getItem('authenticatedMember');
      if (!authMember) return;
      
      const member = JSON.parse(authMember);
      const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
      
      activities.unshift({
        id: Date.now(),
        memberName: member.name,
        action,
        branch: member.branch,
        timestamp: new Date().toISOString()
      });
      
      // Keep only last 50 activities
      if (activities.length > 50) {
        activities.splice(50);
      }
      
      localStorage.setItem('memberActivities', JSON.stringify(activities));
    };

    return {
      receiptRef,
      receiptOuterRef,
      sumOfInput1,
      sumOfInput2,
      paymentForInput1,
      paymentForInput2,
      showPreview,
      isMobile,
      mobileScale,
      logoDataUrl,
      handleLogoUpload,
      showImageCropper,
      tempImageUrl,
      handleCroppedImage,
      handleCropperClose,
      signatureImage1,
      signatureImage2,
      organizationName,
      organizationSubName,
      organizationAddress,
      organizationPhone,
      receiptNumber,
      autoReceiptNumber,
      date,
      autoDate,
      receivedFrom,
      sumOf,
      sumOf2,
      naira,
      kobo,
      paymentFor,
      paymentFor2,
      signature1,
      signature2,
      signatureName,
      amountInWords,
      authenticatedMember,
      handleBack,
      handleLogout,
      handleSumOfOverflow,
      handleSumOf2Input,
      handlePaymentForOverflow,
      handlePaymentFor2Input,
      handleExportPDF,
      handleExportJPEG,
      syncDate,
      // Correction mode
      isCorrectionMode,
      handleConfirmCorrection,
      // Document history
      showHistoryModal,
      savedReceipts,
      loadingReceipts,
      currentReceiptId,
      isSaving,
      handleSaveReceipt,
      handleViewHistory,
      handleLoadReceipt,
      handleDeleteReceipt,
      handleNewReceipt,
      // Signature management
      savedSignatures,
      selectedSignature1,
      selectedSignature2,
      loadingSignatures,
      loadSignatures,
      handleSignature1Change,
      handleSignature2Change,
      handleCreateSignature,
    };
  },
});
</script>

<style scoped>
/* Stylish input fields with elegant fonts */
input.flex-1,
input.w-full {
  font-family: 'Playfair Display', serif;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  color: #1e293b;
  transition: all 0.3s ease;
}

input.flex-1:focus,
input.w-full:focus {
  border-color: #3b82f6;
  color: #0f172a;
  font-weight: 600;
}

input::placeholder {
  font-family: 'Playfair Display', serif;
  font-style: italic;
  opacity: 0.5;
}

/* Optional: Different font styles to choose from */
/* 
Option 1 - Elegant Serif (Current - Playfair Display)
font-family: 'Playfair Display', serif;

Option 2 - Handwritten Style
font-family: 'Dancing Script', cursive;

Option 3 - Classic Handwriting
font-family: 'Great Vibes', cursive;

Option 4 - Modern Cursive
font-family: 'Satisfy', cursive;
*/

/* Receipt container - shadow only in preview mode */
.receipt-container {
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  border: 1px solid #d1d5db;
}

/* Export mode - forces original dimensions and removes shadows */
.exporting {
  width: 7.268in !important;
  height: 5.324in !important;
  min-width: 7.268in !important;
  max-width: 7.268in !important;
  transform: none !important;
  background-color: white !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
}

/* Inner content centering during export - ensure it's centered within flex container */
.exporting #receipt-canvas {
  flex-shrink: 0 !important;
  position: relative !important;
  margin: 0 !important;
  padding: 0 !important;
}

.exporting .receipt-container {
  box-shadow: none !important;
  border: none !important;
}

/* IMPORTANT: When exporting, preserve desktop font sizes regardless of screen size */
/* Override ALL mobile font scaling - this takes precedence over @media queries */
.exporting * {
  font-size: revert !important;
}

/* Force desktop font sizes during export - even on mobile screens */
.exporting .text-xl,
.exporting h2,
.exporting .md\:text-2xl {
  font-size: 1.5rem !important;
  line-height: 2rem !important;
}

.exporting .text-2xl {
  font-size: 1.5rem !important;
  line-height: 2rem !important;
}

.exporting .text-lg {
  font-size: 1.125rem !important;
  line-height: 1.75rem !important;
}

.exporting .text-sm {
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}

.exporting .text-xs {
  font-size: 0.75rem !important;
  line-height: 1rem !important;
}

/* Override mobile input and paragraph styles during export */
.exporting input {
  font-size: 0.875rem !important;
}

.exporting p,
.exporting span {
  font-size: inherit !important;
}

/* Logo sizing during export - always desktop size (150px) */
.exporting img[alt*="Logo"] {
  height: 150px !important;
  width: auto !important;
  margin-top: -25px !important;
}

/* Signature images during export - always desktop size */
.exporting img[alt*="Signature"] {
  height: 96px !important;
  max-width: 240px !important;
  width: auto !important;
  object-fit: contain !important;
}

/* Ensure all responsive classes are overridden during export */
.exporting .h-20,
.exporting .md\:h-\[150px\] {
  height: 150px !important;
}

.exporting .h-24 {
  height: 96px !important;
}

/* Amount box sizing during export */
.exporting .min-w-\[100px\],
.exporting .md\:min-w-\[250px\] {
  min-width: 250px !important;
}

/* Mobile receipt preview styles - only apply when NOT exporting AND on small screens */
/* This allows mobile preview to be small, but export to be full size */
@media (max-width: 767px) {
  /* Base font size reduction for all text in receipt preview only */
  /* The transform scale will handle the visual sizing */
  div[ref="receiptOuterRef"]:not(.exporting) * {
    font-size: 0.55rem !important;
  }

  /* Organization name - slightly bigger but still reduced */
  div[ref="receiptOuterRef"]:not(.exporting) .text-xl,
  div[ref="receiptOuterRef"]:not(.exporting) h2 {
    font-size: 0.7rem !important;
    line-height: 1.2 !important;
  }

  /* Receipt title "CASH RECEIPT" */
  div[ref="receiptOuterRef"]:not(.exporting) .text-2xl,
  div[ref="receiptOuterRef"]:not(.exporting) .text-md {
    font-size: 0.65rem !important;
  }

  /* Date, receipt number and all small text */
  div[ref="receiptOuterRef"]:not(.exporting) .text-sm,
  div[ref="receiptOuterRef"]:not(.exporting) .text-xs {
    font-size: 0.5rem !important;
  }

  /* All input fields */
  div[ref="receiptOuterRef"]:not(.exporting) input {
    font-size: 0.55rem !important;
  }

  /* All paragraphs and spans */
  div[ref="receiptOuterRef"]:not(.exporting) p,
  div[ref="receiptOuterRef"]:not(.exporting) span {
    font-size: 0.55rem !important;
  }

  /* Amount display (Naira/Kobo) - keep slightly bigger */
  div[ref="receiptOuterRef"]:not(.exporting) .text-lg {
    font-size: 0.75rem !important;
  }

  /* Logo sizing */
  div[ref="receiptOuterRef"]:not(.exporting) img[alt*="Logo"] {
    height: 150px !important;
    width: auto !important;
  }

  /* Signature images */
  div[ref="receiptOuterRef"]:not(.exporting) img[alt*="Signature"] {
    height: 30px !important;
    max-width: 80px !important;
  }

  /* Italic signature label */
  div[ref="receiptOuterRef"]:not(.exporting) .italic {
    font-size: 0.5rem !important;
  }
}
</style>
