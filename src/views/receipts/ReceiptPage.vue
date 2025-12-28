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

    <div class="h-screen overflow-y-auto flex flex-col gap-2 items-center bg-slate-100 dark:bg-slate-900 pt-8 pb-24 px-4">
      <!-- Member Info Banner -->
      <div class="w-full max-w-4xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-3 rounded-lg shadow-md flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-semibold">Logged in as: {{ authenticatedMember?.name || 'Unknown' }}</p>
          <p class="text-xs opacity-90">{{ authenticatedMember?.role || 'Member' }}</p>
        </div>
      </div>
    </div>

    <!-- Control Panel Section -->
    <section class="w-full max-w-4xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <!-- Title -->
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
            <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Receipt
              <span v-if="currentReceiptId" class="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                Editing #{{ receiptNumber }}
              </span>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Create and manage your receipts</p>
          </div>
        </div>

       
      </div>

      <!-- Settings Row -->
      <div class="mt-3 flex justify-between items-center flex-wrap gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div class="flex gap-3 flex-wrap">
          <!-- Auto Receipt Toggle -->
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            <input type="checkbox" v-model="autoReceiptNumber" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
            <span>Auto Receipt #</span>
          </label>

          <!-- Auto Date Toggle -->
          <label class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
            <input type="checkbox" v-model="autoDate" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
            <span>Auto Date</span>
          </label>
        </div>

        <!-- Summary Display -->
        <div class="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-700">
          <div class="flex items-center gap-3 text-xs">
            <div>
              <span class="text-slate-600 dark:text-slate-400">Amount:</span>
              <span class="font-bold text-slate-900 dark:text-white ml-1.5">₦{{ naira || 0 }}</span>
            </div>
            <div class="pl-3 border-l border-emerald-300 dark:border-emerald-700">
              <span class="text-slate-600 dark:text-slate-400">Receipt:</span>
              <span class="font-bold text-sm text-emerald-700 dark:text-emerald-400 ml-1.5">#{{ receiptNumber }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

        <!-- Flex Container for Form and Preview -->
    <div class="w-full max-w-7xl flex flex-col gap-6 items-center">

      <!-- Toggle Switch -->
      <div class="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg">
        <button
          @click="formMode = 'generate'"
          :class="[
            'px-6 py-3 text-sm font-semibold rounded-md transition-all',
            formMode === 'generate' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          ]"
        >
          Generate Receipt
        </button>
        <button
          @click="formMode = 'customer'"
          :class="[
            'px-6 py-3 text-sm font-semibold rounded-md transition-all',
            formMode === 'customer' 
              ? 'bg-emerald-600 text-white shadow-md' 
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
          ]"
        >
          Generate for Customer
        </button>
      </div>

      <!-- Quick Fill Form Section -->
      <section class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
                📝 Quick Fill Form
              </h2>
            </div>
            
            <!-- Refresh Button -->
            <button
              @click="handleRefreshForm"
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              title="Clear form and start fresh"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          
          <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Fill out this form to automatically populate the receipt below
          </p>
          
          <div class="space-y-6">
          
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
          <div v-if="formMode === 'customer'">
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
          <div v-if="formMode === 'customer'">
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
          <div v-if="formMode === 'customer'" class="md:col-span-2">
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
          <div v-if="formMode === 'customer'" class="md:col-span-2">
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
          <div v-if="formMode === 'customer'" class="md:col-span-2">
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
          <div v-if="formMode === 'customer'" class="md:col-span-2">
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
        </div>
        <div v-if="formMode === 'customer'" class="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
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

        <!-- Preview Button -->
        <div class="mt-4">
          <button
            @click="handlePreviewClick"
            class="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Preview Receipt</span>
          </button>
        </div>
      </div>
    </section>

    </div> <!-- end w-full max-w-7xl flex container -->
  </div> <!-- end h-screen scroll container -->
  </div> <!-- end root wrapper -->
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import DocumentHistoryModal from '@/components/modals/DocumentHistoryModal.vue';
import LogoCropper from '@/components/image/LogoCropper.vue';
import { storeToRefs } from 'pinia';
import html2pdf from 'html2pdf.js';
import * as htmlToImage from 'html-to-image';
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
import { safeLocalStorage } from '@/utils/storage.utils.ts';

export default defineComponent({
  name: 'ReceiptPage',
  components: {
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

      // Check for form mode from dashboard selection
      const savedMode = localStorage.getItem('receiptFormMode');
      if (savedMode) {
        formMode.value = savedMode === 'customer' ? 'customer' : 'receipt';
        localStorage.removeItem('receiptFormMode'); // Clear after reading
      }

      // Load saved form data when returning from preview page
      const savedFormData = localStorage.getItem('receiptFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          
          // Restore all form fields
          organizationName.value = formData.organizationName || '';
          organizationSubName.value = formData.organizationSubName || '';
          organizationAddress.value = formData.organizationAddress || '';
          organizationPhone.value = formData.organizationPhone || '';
          logoDataUrl.value = formData.logoDataUrl || null;
          receiptNumber.value = formData.receiptNumber || '';
          autoReceiptNumber.value = formData.autoReceiptNumber ?? true;
          date.value = formData.date || '';
          autoDate.value = formData.autoDate ?? true;
          receivedFrom.value = formData.receivedFrom || '';
          naira.value = formData.naira || 0;
          kobo.value = formData.kobo || 0;
          sumOf.value = formData.sumOf || '';
          sumOf2.value = formData.sumOf2 || '';
          paymentFor.value = formData.paymentFor || '';
          paymentFor2.value = formData.paymentFor2 || '';
          receiptWidth.value = formData.receiptWidth || 5.827;
          receiptHeight.value = formData.receiptHeight || 8.268;
          colorMode.value = formData.colorMode || 'full-color';
          
          if (formData.customColor1CMYK) {
            customColor1CMYK.value = formData.customColor1CMYK;
          }
          if (formData.customColor2CMYK) {
            customColor2CMYK.value = formData.customColor2CMYK;
          }
          
          selectedSignature1.value = formData.selectedSignature1 || '';
          selectedSignature2.value = formData.selectedSignature2 || '';
          
          // Signature images will be loaded after loadSignatures() completes
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
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
      try {
        window.removeEventListener('resize', calculateMobileScale);
        // Note: handleVisibilityChange is scoped to onMounted and will be cleaned up automatically
      } catch (error) {
        console.warn('Error during cleanup:', error);
        // Continue cleanup even if some operations fail
      }
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

    // Receipt size settings
    const receiptWidth = ref(5.827); // Default A5 landscape width
    const receiptHeight = ref(8.268); // Default A5 landscape height

    // CMYK Color settings
    const colorMode = ref('full-color'); // Default to full color
    const customColor1CMYK = ref({ c: 0, m: 0, y: 0, k: 100 }); // Primary custom color (Black default)
    const customColor2CMYK = ref({ c: 100, m: 0, y: 100, k: 0 }); // Secondary custom color (Blue default)

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
    const formMode = ref('generate'); // Toggle between 'generate' and 'customer'

    // Mobile detection
    const isMobile = ref(false);
    const mobileScale = ref(1);

    const calculateMobileScale = () => {
      const screenWidth = window.innerWidth;
      isMobile.value = screenWidth < 768;
      if (isMobile.value) {
        // Calculate scale to fit receipt width in screen
        const receiptWidthInPixels = receiptWidth.value * 96; // width in inches * 96dpi
        mobileScale.value = Math.min(1, screenWidth / receiptWidthInPixels);
      } else {
        mobileScale.value = 1;
      }
    };

    // Calculate content scale based on receipt dimensions
    const contentScale = computed(() => {
      const baseWidth = 5.827;
      const baseHeight = 8.268;
      const widthScale = receiptWidth.value / baseWidth;
      const heightScale = receiptHeight.value / baseHeight;
      
      // Use the smaller scale factor to ensure content fits proportionally
      return Math.min(widthScale, heightScale);
    });

    // Computed property for receipt dimensions - locked to exact input sizes
    const receiptDimensions = computed(() => ({
      width: isMobile.value ? '100%' : `${receiptWidth.value}in`,
      height: `${receiptHeight.value}in`,
      minWidth: isMobile.value ? '100%' : `${receiptWidth.value}in`,
      maxWidth: `${receiptWidth.value}in`,
      minHeight: `${receiptHeight.value}in`,
      maxHeight: `${receiptHeight.value}in`
    }));

    // Handle preset size changes
    const handlePresetChange = (event) => {
      const preset = event.target.value;
      switch (preset) {
        case 'a4':
          receiptWidth.value = 8.27;
          receiptHeight.value = 11.69;
          break;
        case 'a5':
          receiptWidth.value = 5.83;
          receiptHeight.value = 8.27;
          break;
        case 'letter':
          receiptWidth.value = 8.5;
          receiptHeight.value = 11;
          break;
        case 'legal':
          receiptWidth.value = 8.5;
          receiptHeight.value = 14;
          break;
        default:
          // Keep current values for custom
          break;
      }
      // Recalculate mobile scale when size changes
      calculateMobileScale();
    };

    // Handle color mode changes
    const handleColorModeChange = () => {
      // Reset custom colors when changing mode
      if (colorMode.value === 'one-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 };
      } else if (colorMode.value === 'two-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 };
        customColor2CMYK.value = { c: 100, m: 0, y: 100, k: 0 };
      }
    };

    // Get color mode description
    const getColorModeDescription = () => {
      switch (colorMode.value) {
        case 'full-color':
          return 'Full CMYK color printing';
        case 'three-color':
          return 'CMY color printing (no black)';
        case 'two-color':
          return 'Two custom colors';
        case 'one-color':
          return 'Single color printing';
        default:
          return '';
      }
    };

    // Convert CMYK to RGB for display
    const cmykToRgb = (c, m, y, k) => {
      const r = 255 * (1 - c / 100) * (1 - k / 100);
      const g = 255 * (1 - m / 100) * (1 - k / 100);
      const b = 255 * (1 - y / 100) * (1 - k / 100);
      return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
    };

    // Color styles based on selected mode
    const colorStyles = computed(() => {
      switch (colorMode.value) {
        case 'full-color':
          return {
            headerBg: 'rgb(30, 64, 175)', // Blue
            borderColor: 'rgb(59, 130, 246)',
            logoFilter: 'none'
          };
        case 'three-color':
          return {
            headerBg: 'rgb(167, 139, 250)', // Purple (C+M)
            borderColor: 'rgb(167, 139, 250)',
            logoFilter: 'grayscale(100%) sepia(100%) hue-rotate(260deg) saturate(300%)'
          };
        case 'two-color': {
          const color1 = cmykToRgb(customColor1CMYK.value.c, customColor1CMYK.value.m, customColor1CMYK.value.y, customColor1CMYK.value.k);
          return {
            headerBg: color1,
            borderColor: cmykToRgb(customColor2CMYK.value.c, customColor2CMYK.value.m, customColor2CMYK.value.y, customColor2CMYK.value.k),
            logoFilter: `grayscale(100%) brightness(0.5) sepia(100%) saturate(1000%) contrast(1.2)`
          };
        }
        case 'one-color': {
          const singleColor = cmykToRgb(customColor1CMYK.value.c, customColor1CMYK.value.m, customColor1CMYK.value.y, customColor1CMYK.value.k);
          return {
            headerBg: singleColor,
            borderColor: singleColor,
            logoFilter: 'grayscale(100%) brightness(0.4) contrast(2)'
          };
        }
        default:
          return {
            headerBg: 'rgb(30, 64, 175)',
            borderColor: 'rgb(59, 130, 246)',
            logoFilter: 'none'
          };
      }
    });

    // Watch for size changes to recalculate scaling
    watch([receiptWidth, receiptHeight], () => {
      calculateMobileScale();
    });

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
      router.push('/receipt-dashboard');
    };

    // Handle preview click - Navigate to ReceiptPreviewPage
    const handlePreviewClick = () => {
      // Save receipt data to localStorage for preview page
      const receiptPreviewData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        receiptNumber: receiptNumber.value,
        date: date.value,
        receivedFrom: receivedFrom.value,
        naira: naira.value,
        kobo: kobo.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        paymentFor: paymentFor.value,
        paymentFor2: paymentFor2.value,
        receiptWidth: receiptWidth.value,
        receiptHeight: receiptHeight.value,
        colorMode: colorMode.value,
        customColor1CMYK: customColor1CMYK.value,
        customColor2CMYK: customColor2CMYK.value,
        selectedSignature1: selectedSignature1.value,
        selectedSignature2: selectedSignature2.value,
        signatureImage1: signatureImage1.value,
        signatureImage2: signatureImage2.value
      };

      safeLocalStorage.setItem('receiptPreviewData', JSON.stringify(receiptPreviewData));

      // Also save complete form data for when user navigates back
      const receiptFormData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        receiptNumber: receiptNumber.value,
        autoReceiptNumber: autoReceiptNumber.value,
        date: date.value,
        autoDate: autoDate.value,
        receivedFrom: receivedFrom.value,
        naira: naira.value,
        kobo: kobo.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        paymentFor: paymentFor.value,
        paymentFor2: paymentFor2.value,
        receiptWidth: receiptWidth.value,
        receiptHeight: receiptHeight.value,
        colorMode: colorMode.value,
        customColor1CMYK: customColor1CMYK.value,
        customColor2CMYK: customColor2CMYK.value,
        selectedSignature1: selectedSignature1.value,
        selectedSignature2: selectedSignature2.value
      };

      safeLocalStorage.setItem('receiptFormData', JSON.stringify(receiptFormData));

      // Navigate to preview page
      router.push({ name: 'receipt-preview' });
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
        safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
        
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
          safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
          
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
      safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
      
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
          safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
          
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
      safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
    };

    // Load signatures from Firebase
    const loadSignatures = async () => {
      if (!authenticatedMember.value?.branch) return;

      loadingSignatures.value = true;
      try {
        const result = await getAllSignatures(authenticatedMember.value.branch);
        if (result.success) {
          savedSignatures.value = result.data;
          
          // Check if we have saved signature selections from form data
          if (selectedSignature1.value || selectedSignature2.value) {
            // Load signature images based on saved selections
            if (selectedSignature1.value) {
              const sig1 = result.data.find(sig => sig.id === selectedSignature1.value);
              if (sig1) {
                signatureImage1.value = sig1.dataURL;
              }
            }
            
            if (selectedSignature2.value) {
              const sig2 = result.data.find(sig => sig.id === selectedSignature2.value);
              if (sig2) {
                signatureImage2.value = sig2.dataURL;
              }
            }
          } else {
            // Auto-select primary signatures only if no saved selection exists
            const primary = result.data.find(sig => sig.isPrimary);
            if (primary) {
              selectedSignature1.value = primary.id;
              selectedSignature2.value = primary.id;
              signatureImage1.value = primary.dataURL;
              signatureImage2.value = primary.dataURL;
            }
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
      safeLocalStorage.setItem('signatureReturnPath', '/receipt');
      safeLocalStorage.setItem('signatureReturnType', 'receipt');
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
      if (!receiptOuterRef.value || !receiptRef.value || isExporting.value) return;
      
      // CRITICAL FIX: Ensure preview is visible on mobile before export
      const wasHidden = !showPreview.value && isMobile.value;
      if (wasHidden) {
        showPreview.value = true;
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
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

      const filename = `receipt-${receiptNumber.value}-${colorMode.value}.pdf`;
      
      // Use user-specified dimensions for export
      const RECEIPT_WIDTH = receiptWidth.value;
      const RECEIPT_HEIGHT = receiptHeight.value;
      
      const options = {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 3, 
          useCORS: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: 'in', format: [RECEIPT_WIDTH, RECEIPT_HEIGHT], orientation: 'landscape' },
      };

      // Store only the styles we'll modify during export
      const originalOuterTransform = receiptOuterRef.value.style.transform;
      const originalOuterBoxShadow = receiptOuterRef.value.style.boxShadow;

      try {
        // MINIMAL STYLE CHANGES: Only remove visual effects, keep layout intact
        // This ensures export looks EXACTLY like the preview
        receiptOuterRef.value.style.boxShadow = 'none'; // Remove shadow for clean export
        receiptOuterRef.value.style.transform = 'none'; // Remove any scaling on outer container
        
        // DON'T touch inner content styles - let it render exactly as shown in preview!
        // The scale transform and all layout should remain unchanged
        
        receiptOuterRef.value.classList.add('exporting');
        
        // Wait for styles to be applied
        await new Promise(resolve => setTimeout(resolve, 300));
        
        await html2pdf().set(options).from(receiptOuterRef.value).save();
        
        // Log activity
        logActivity(`Created Receipt #${receiptNumber.value || 'N/A'}`);
        
        incrementReceiptNumber();
        
        // Restore only what we changed (boxShadow and transform)
        receiptOuterRef.value.style.boxShadow = originalOuterBoxShadow;
        receiptOuterRef.value.style.transform = originalOuterTransform;
        
        receiptOuterRef.value.classList.remove('exporting');
        
        // Show CMYK info
        const cmykInfo = {
          'full-color': 'CMYK 4-color',
          'three-color': 'CMY 3-color',
          'two-color': 'Custom 2-color',
          'one-color': 'Single color'
        }[colorMode.value];
        alert(`✅ PDF exported successfully!\n📊 Color Mode: ${cmykInfo}`);
      } catch (error) {
        console.error('Export failed:', error);
        // Always restore on error
        if (receiptOuterRef.value) {
          // Restore only what we changed
          receiptOuterRef.value.style.boxShadow = originalOuterBoxShadow;
          receiptOuterRef.value.style.transform = originalOuterTransform;
          receiptOuterRef.value.classList.remove('exporting');
        }
      } finally {
        isExporting.value = false;
        
        // If we auto-showed preview on mobile, hide it again
        if (wasHidden && isMobile.value) {
          showPreview.value = false;
        }
      }
    };

    const handleExportJPEG = async () => {
      if (!receiptOuterRef.value || !receiptRef.value || isExporting.value) return;
      
      // CRITICAL FIX: Ensure preview is visible on mobile before export
      const wasHidden = !showPreview.value && isMobile.value;
      if (wasHidden) {
        showPreview.value = true;
        // Wait for preview to render
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
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

      // Store only the styles we'll modify during export
      const originalOuterTransform = receiptOuterRef.value.style.transform;
      const originalOuterBoxShadow = receiptOuterRef.value.style.boxShadow;

      try {
        
        // MINIMAL STYLE CHANGES: Only remove visual effects, keep layout intact
        // This ensures export looks EXACTLY like the preview
        receiptOuterRef.value.style.boxShadow = 'none'; // Remove shadow for clean export
        receiptOuterRef.value.style.transform = 'none'; // Remove any scaling on outer container
        
        // DON'T touch inner content styles - let it render exactly as shown in preview!
        // The scale transform and all layout should remain unchanged
        
        receiptOuterRef.value.classList.add('exporting');
        
        // Wait for shadow removal to take effect
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Verify the element exists and has dimensions
        if (!receiptOuterRef.value) {
          throw new Error('Receipt element not found');
        }
        
        const rect = receiptOuterRef.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          throw new Error(`Receipt element has no dimensions (${rect.width}x${rect.height})`);
        }
        
        // Export with CMYK color profile metadata
        // Note: html-to-image exports as RGB, but we preserve CMYK intent via metadata
        let dataUrl;
        try {
          // Export exactly as shown in preview - no dimension overrides
          dataUrl = await htmlToImage.toJpeg(receiptOuterRef.value, {
            quality: 0.98,
            pixelRatio: 3,
            backgroundColor: '#ffffff',
            cacheBust: true
          });
        } catch (jpegError) {
          // Fallback to PNG if JPEG fails
          dataUrl = await htmlToImage.toPng(receiptOuterRef.value, {
            quality: 0.98,
            pixelRatio: 3,
            backgroundColor: '#ffffff',
            cacheBust: true,
          });
        }
        
        if (!dataUrl || dataUrl.length < 100) {
          throw new Error('Failed to generate image data');
        }
        
        // Create CMYK color mode metadata for the exported image
        const cmykMetadata = {
          colorMode: colorMode.value,
          colorSettings: {
            'full-color': 'CMYK (4-color process)',
            'three-color': 'CMY (3-color process)',
            'two-color': `Custom 2-color (C:${customColor1CMYK.value.c}% M:${customColor1CMYK.value.m}% Y:${customColor1CMYK.value.y}% K:${customColor1CMYK.value.k}% | C:${customColor2CMYK.value.c}% M:${customColor2CMYK.value.m}% Y:${customColor2CMYK.value.y}% K:${customColor2CMYK.value.k}%)`,
            'one-color': `Single color (C:${customColor1CMYK.value.c}% M:${customColor1CMYK.value.m}% Y:${customColor1CMYK.value.y}% K:${customColor1CMYK.value.k}%)`
          }[colorMode.value],
          note: 'This image was exported with CMYK color intent. For professional printing, convert to CMYK color space using your printing software or send to a print service with CMYK specifications.'
        };
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `receipt-${receiptNumber.value}-${colorMode.value}.jpg`;
        link.click();
        
        // Log activity
        logActivity(`Created Receipt #${receiptNumber.value || 'N/A'}`);
        
        incrementReceiptNumber();
        
        // Restore only what we changed (boxShadow and transform)
        receiptOuterRef.value.style.boxShadow = originalOuterBoxShadow;
        receiptOuterRef.value.style.transform = originalOuterTransform;
        
        receiptOuterRef.value.classList.remove('exporting');
        
        // Show success notification with CMYK information
        alert(`✅ Receipt #${receiptNumber.value} exported successfully!\n\n📊 Color Mode: ${cmykMetadata.colorSettings}\n\n💡 Note: ${cmykMetadata.note}`);
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
          // Restore only what we changed
          receiptOuterRef.value.style.boxShadow = originalOuterBoxShadow;
          receiptOuterRef.value.style.transform = originalOuterTransform;
          receiptOuterRef.value.classList.remove('exporting');
        }
      } finally {
        isExporting.value = false;
        
        // If we auto-showed preview on mobile, hide it again
        if (wasHidden && isMobile.value) {
          showPreview.value = false;
        }
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
      
      safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
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
      isExporting,
      formMode,
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
      handlePreviewClick,
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
      // Receipt size settings
      receiptWidth,
      receiptHeight,
      receiptDimensions,
      contentScale,
      handlePresetChange,
      // CMYK Color settings
      colorMode,
      customColor1CMYK,
      customColor2CMYK,
      handleColorModeChange,
      getColorModeDescription,
      cmykToRgb,
      colorStyles,
    };
  },
});
</script>

<style scoped>
/* Receipt content wrapper for responsive scaling */
.receipt-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Ensure receipt container respects the size */
.receipt-container {
  overflow: hidden;
  position: relative;
}

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
