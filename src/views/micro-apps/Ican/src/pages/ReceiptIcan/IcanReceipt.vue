<template>
  <div>
    <!-- Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @close="handleCropperClose"
      @crop="handleCroppedImage"
    />

    <div class="min-h-[85vh] max-h-[90vh] overflow-y-auto flex flex-col gap-2 items-center bg-slate-100 dark:bg-slate-900 pt-4 pb-16 px-3">
      <!-- Control  Panel Section -->
      <section class="w-full max-w-4xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg">
        <div class="flex items-center justify-between flex-wrap gap-2.5">
          <!-- Title -->
          <div class="flex items-center gap-2.5">
             <!-- Back Button -->
          <button
            class="w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            title="Go Back"
            @click="$router.go(-1)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Generate Receipt
              </h1>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Quick receipt with organization details</p>
            </div>
          </div>
          
           <!-- Receipts Dropdown Button -->
            <div ref="invoiceMenuRef" class="relative">
                        <button
                          class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-600 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors"
                          title="Save or view receipts"
                          @click="toggleInvoiceMenu"
                        >
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Receipts</span>
                          <svg class="w-3 h-3 transition-transform" :class="{ 'rotate-180': showInvoiceMenu }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        <!-- Dropdown Menu -->
                        <div v-if="showInvoiceMenu" class="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                          <button
                            @click="handleSaveReceipt"
                            class="w-full text-left px-3 py-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-t-lg flex items-center gap-2"
                          >
                            <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Save Current Receipt
                          </button>
                          <button
                            @click="handleViewSavedReceipts"
                            class="w-full text-left px-3 py-2 text-[10px] font-medium text-slate-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors rounded-b-lg flex items-center gap-2"
                          >
                            <svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Saved Receipts
                          </button>
                        </div>
             </div>

          <!-- Navigation Buttons -->
          <div class="flex gap-2">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              title="Create a new receipt"
              @click="createNewReceipt"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Receipt
            </button>
          </div>

         <!-- Multiple Copies Controls -->
          <div class="flex items-center gap-2.5">
            <!-- Copies Input -->
            <div class="flex items-center gap-1 bg-sla be able te-100 dark:bg-slate-700 rounded p-0.5">
              <span class="text-[10px] font-medium text-slate-700 dark:text-slate-300 px-1">Copies:</span>
              <input
                v-model.number="totalCopies"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-12 h-6 text-[10px] text-center bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Number of copies to generate"
                @input="validateCopiesInput"
                @blur="validateCopiesInput"
              />
            </div>
            
            <!-- Page Navigation -->
            <div class="flex items-center gap-1">
              <div class="text-[9px] text-slate-500 dark:text-slate-400 px-1">
                Page {{ currentPage }} of {{ totalCopies }}
              </div>
              <div class="flex items-center gap-0.5">
                <button
                  :disabled="currentPage <= 1"
                  class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                  @click="goToPreviousPage"
                >
                  <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  :disabled="currentPage >= totalCopies"
                  class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                  @click="goToNextPage"
                >
                  <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>


        </div>

        <!-- Settings Dropdown Toggle -->
        <div class="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
          <button
            @click="toggleSettingsPanel"
            class="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            <svg
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': showSettingsPanel }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
            <span>{{ showSettingsPanel ? 'Hide Settings' : 'Show Settings' }}</span>
          </button>

          <!-- Collapsible Settings Panel -->
          <div
            v-if="showSettingsPanel"
            class="mt-2.5 flex justify-between items-center flex-wrap gap-2.5"
          >
            <div class="flex gap-2.5 flex-wrap">
              <!-- Auto Receipt Toggle -->
              <label class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input type="checkbox" v-model="autoReceiptNumber" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
                <span>Auto Receipt #</span>
              </label>

              <!-- Auto Date Toggle -->
              <label class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input type="checkbox" v-model="autoDate" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
                <span>Auto Date</span>
              </label>

              <!-- Show Page Numbers Toggle -->
              <label class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                <input type="checkbox" v-model="showPageNumbers" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
                <span>Show Page #</span>
                <span v-if="showPageNumbers" class="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">{{ displayPageNumber }}</span>
              </label>
            </div>
          </div>
        </div>
      </section>

        
         <!-- Receipt Quick Fill Form -->
      <section class="w-full max-w-4xl">
        <div class="space-y-3">
                 
            <div>
            <!-- Receipt Details Section -->
            <div class="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h3 class="text-base font-semibold text-emerald-700 dark:text-emerald-300 mb-3 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Receipt Information
              </h3>
              
              <div class="space-y-2">
                <!-- Received From -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Received From
                  </label>
                  <input
                    v-model="receivedFrom"
                    type="text"
                    placeholder="Enter name of payer"
                    class="w-full px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-600 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                 <!-- Amount in Naira -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₦)
                  </label>
                  <input
                    v-model.number="naira"
                    type="number"
                    placeholder="0.00"
                    class="w-full px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-600 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    step="0.01"
                    min="0"
                  />
                </div>

                <!-- Being Payment for (Line 1) -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Being Payment for
                  </label>
                  <input
                    ref="paymentForInput1"
                    v-model="paymentFor"
                    type="text"
                    placeholder="Description of payment purpose"
                    class="w-full px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-600 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    @input="handlePaymentForOverflow"
                  />
                </div>

                <!-- Being Payment for (Line 2) -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Description - Line 2 (if needed)
                  </label>
                  <input
                    ref="paymentForInput2"
                    v-model="paymentFor2"
                    type="text"
                    placeholder="Additional payment details"
                    class="w-full px-3 py-2 text-sm border border-emerald-300 dark:border-emerald-600 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    @input="handlePaymentFor2Input"
                  />
                </div>

              </div>
            </div>

            <!-- Divider -->
            <div class="border-t border-gray-300 dark:border-gray-600 my-3"></div>

            <!-- Signatures Section Removed -->
            <div v-if="false" class="hidden">
              <select
                v-model="selectedSignature1"
                class="hidden"
                @change="handleSignature1Change"
              >
                <option value="">None</option>
                <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">{{ sig.name }}</option>
              </select>
              
              <select
                v-model="selectedSignature2"
                class="hidden"
                @change="handleSignature2Change"
              >
                <option value="">None</option>
                <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">{{ sig.name }}</option>
              </select>
            </div>
         
          </div>

          
          <!-- Summary -->
          <div class="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div class="flex items-center justify-between">
              <span class="text-sm font-medium text-emerald-900 dark:text-emerald-300">
                Total Amount:
              </span>
              <span class="text-2xl font-bold text-emerald-700 dark:text-emerald-400">
                {{ toCurrency(displayTotal) }}
              </span>
            </div>
          </div>
  
  
          <!-- Preview Button -->
          <div class="mt-3">
            <button
              class="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
              @click="handlePreviewClick"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Preview Invoice</span>
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- Save Invoice Modal -->
    <div v-if="showSaveModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="cancelSave"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white dark:bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white dark:bg-slate-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                  Save Receipt
                </h3>
                <div class="mt-4">
                  <label for="invoice-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Receipt Name
                  </label>
                  <input
                    id="invoice-name"
                    v-model="invoiceName"
                    type="text"
                    placeholder="Enter receipt name..."
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    @keydown.enter="saveReceipt"
                    @keydown.escape="cancelSave"
                  />
                  <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Give your receipt a memorable name for easy identification.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-slate-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              :disabled="isSaving"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              @click="saveReceipt"
            >
              <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isSaving ? 'Saving...' : 'Save Receipt' }}
            </button>
            <button
              type="button"
              :disabled="isSaving"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-600 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              @click="cancelSave"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import LogoCropper from '@/components/LogoCropper.vue';

import { useRouter, useRoute } from 'vue-router';
import { safeLocalStorage } from '@/utils/storage.utils';

export default defineComponent({
  name: 'GenerateInvoicePage',
  components: { 
    LogoCropper
  },
  setup() {
    const router = useRouter();
    const route = useRoute();
    // Password verification state
    const showSaveModal = ref(false);
    const invoiceName = ref('');
    const isSaving = ref(false);
    const showInvoiceMenu = ref(false);
    const showSettingsPanel = ref(false);
    const invoiceMenuRef = ref(null);
    
    // Form fields
    const organizationName = ref('');
    const organizationSubName = ref('');
    const businessNumber = ref('');
    const headOfficeAddress = ref('');
    const headOfficePhone = ref('');
    const branchAddress1 = ref('');
    const branch1Phone = ref('');
    const branchAddress2 = ref('');
    const branch2Phone = ref('');
    const logoDataUrl = ref('');
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    const taxEnabled = ref(false); // Tax column enable/disable toggle (OFF by default)
    const showPageNumbers = ref(true); // Show page/copy numbers toggle (ON by default)
    
    // Dynamic Branches Management
    const additionalBranches = ref([]);
    
    // Android back button handler
    let backButtonListener = null;
    
    // Page-based data management
    const pageData = ref({});
    
    // Initialize default page data structure for receipts
    const createDefaultPageData = () => ({
      receivedFrom: '',
      paymentFor: '',
      paymentFor2: '',
      naira: 0,
      sumOf: '',
      sumOf2: '',
      selectedSignature1: '',
      selectedSignature2: '',
      signatureImage1: '',
      signatureImage2: ''
    });
    
    // Initialize page data for current page
    const ensurePageData = (pageNum) => {
      if (!pageData.value[pageNum]) {
        pageData.value[pageNum] = createDefaultPageData();
      }
    };
    
    // Invoice Items Management
    const MAX_ITEMS = 20;
    const items = ref([
      {
        id: 1,
        quantity: 0,
        price: 0,
        tax: 0,
        description: ''
      }
    ]);
    
    const taxRate = ref(0);
    
    // Keep refs for input elements
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const paymentForInput1 = ref(null);
    const paymentForInput2 = ref(null);
    
    // Sum of fields - per-page computed properties
    const sumOf = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.sumOf || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].sumOf = value;
      }
    });
    
    const sumOf2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.sumOf2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].sumOf2 = value;
      }
    });
    
    // Receipt-specific fields - per-page computed properties
    const receivedFrom = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.receivedFrom || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].receivedFrom = value;
      }
    });
    
    const paymentFor = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.paymentFor || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].paymentFor = value;
      }
    });
    
    const paymentFor2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.paymentFor2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].paymentFor2 = value;
      }
    });
    
    const naira = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.naira || 0;
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].naira = value;
      }
    });
    
    // Signature Management
    const savedSignatures = ref([]);
    
    // Shared signature state - synchronized across main and preview pages
    const SHARED_SIGNATURE_KEY = 'ican_receipt_shared_signatures';
    
    const loadSharedSignatureState = () => {
      try {
        const sharedData = localStorage.getItem(SHARED_SIGNATURE_KEY);
        if (sharedData) {
          const parsed = JSON.parse(sharedData);
          selectedSignature1.value = parsed.selectedSignature1 || '';
          selectedSignature2.value = parsed.selectedSignature2 || '';
          signatureImage1.value = parsed.signatureImage1 || '';
          signatureImage2.value = parsed.signatureImage2 || '';
          console.log('📋 Loaded shared signature state for receipt:', parsed);
        }
      } catch (error) {
        console.error('❌ Error loading shared signature state:', error);
      }
    };
    
    const saveSharedSignatureState = () => {
      try {
        const sharedData = {
          selectedSignature1: selectedSignature1.value,
          selectedSignature2: selectedSignature2.value,
          signatureImage1: signatureImage1.value,
          signatureImage2: signatureImage2.value,
          timestamp: Date.now()
        };
        localStorage.setItem(SHARED_SIGNATURE_KEY, JSON.stringify(sharedData));
        console.log('💾 Saved shared signature state for receipt:', sharedData);
      } catch (error) {
        console.error('❌ Error saving shared signature state:', error);
      }
    };
    
    // Signature fields - per-page computed properties
    const selectedSignature1 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.selectedSignature1 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].selectedSignature1 = value;
      }
    });
    
    const selectedSignature2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.selectedSignature2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].selectedSignature2 = value;
      }
    });
    
    const signatureImage1 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.signatureImage1 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].signatureImage1 = value;
      }
    });
    
    const signatureImage2 = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.signatureImage2 || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].signatureImage2 = value;
      }
    });
    
    // Load signatures from Firebase
    const loadSignatures = async () => {
      try {
        // Get authenticated member's branch - check both keys
        let memberData = localStorage.getItem('ican_authenticated_member');
        
        // If ican_authenticated_member doesn't exist, check authenticatedMember
        if (!memberData) {
          const altMemberData = localStorage.getItem('authenticatedMember');
          if (altMemberData) {
            console.log('🔄 Copying authenticatedMember to ican_authenticated_member for consistency');
            localStorage.setItem('ican_authenticated_member', altMemberData);
            memberData = altMemberData;
          }
        }
        
        let branchToUse = 'default';
        
        if (memberData) {
          try {
            const member = JSON.parse(memberData);
            branchToUse = member.branch || 'default';
            console.log('🏢 Member branch from auth data:', branchToUse);
          } catch (parseError) {
            console.warn('Failed to parse member data, using default branch');
          }
        }
        
        console.log('📝 Loading signatures for branch:', branchToUse);
        
        // Also check what signature keys exist in localStorage for debugging
        const signatureKeys = Object.keys(localStorage).filter(key => 
          key.includes('signature') || key.includes('Signature')
        );
        console.log('🗃️ Found localStorage signature keys:', signatureKeys);
        
        const { getAllSignatures } = await import('@/firebase/database');
        const result = await getAllSignatures(branchToUse);
        
        console.log('🔥 Firebase getAllSignatures result:', result);
        
        if (result.success) {
          savedSignatures.value = result.signatures || result.data || [];
          console.log('✅ Loaded signatures count:', savedSignatures.value.length);
          console.log('📝 Signature details:', savedSignatures.value.map(s => ({ 
            id: s.id, 
            name: s.name,
            branch: s.branch || 'no-branch-specified'
          })));
          
          // If no signatures found, check if they might be in localStorage as fallback
          if (savedSignatures.value.length === 0) {
            console.log('🔍 No signatures in Firebase, checking localStorage fallback...');
            const localSignatureKey = `signatures_${branchToUse}`;
            const localSignatures = localStorage.getItem(localSignatureKey);
            if (localSignatures) {
              try {
                const parsed = JSON.parse(localSignatures);
                console.log('📦 Found signatures in localStorage:', parsed.length, 'signatures');
                savedSignatures.value = parsed;
              } catch (e) {
                console.error('Failed to parse localStorage signatures:', e);
              }
            }
          }
        } else {
          console.error('❌ Failed to load signatures from Firebase:', result.error);
          savedSignatures.value = [];
        }
      } catch (error) {
        console.error('Error loading signatures:', error);
        savedSignatures.value = [];
      }
    };
    
    // UI State
    const showPreview = ref(false);
    
    // Branch Management Methods
    const addNewBranch = () => {
      // If there are existing branch values in the old fields, migrate them first
      if (branchAddress1.value || branch1Phone.value) {
        additionalBranches.value.push({
          address: branchAddress1.value,
          phone: branch1Phone.value
        });
        branchAddress1.value = '';
        branch1Phone.value = '';
      }
      
      if (branchAddress2.value || branch2Phone.value) {
        additionalBranches.value.push({
          address: branchAddress2.value,
          phone: branch2Phone.value
        });
        branchAddress2.value = '';
        branch2Phone.value = '';
      }
      
      // Add new empty branch
      additionalBranches.value.push({
        address: '',
        phone: ''
      });
    };
    
    const removeBranch = (index) => {
      if (additionalBranches.value.length > 0) {
        additionalBranches.value.splice(index, 1);
      }
    };
    
    // Multiple pages/copies functionality
    const totalCopies = ref(1);
    const currentPage = ref(1);
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    const logoInput = ref(null);

    // Removed parser variables (kept as placeholders to prevent template errors)
    const smartTextInput = ref('');
    const showFormatGuide = ref(false);
    const showManualGuide = ref(false);
    const showParsedPreview = ref(false);
    const validationErrors = ref([]);
    const parsedData = ref({});
    const smartInputPlaceholder = '';
    const manualInputPlaceholder = '';
    const parseSmartText = () => {}; // Empty function
    const handlePaste = () => {}; // Empty function

    // Business Number Quick Fill
    const showBNDropdown = ref(false);
    
    // Predefined business numbers for quick fill
    const businessNumberOptions = ref([
      { id: 1, number: '123456789RT0001', description: 'Sample Corporation BN' },
      { id: 2, number: '987654321RT0001', description: 'Example Business BN' },
      { id: 3, number: '555666777RT0001', description: 'Demo Company BN' },
      { id: 4, number: '111222333RT0001', description: 'Test Enterprise BN' }
    ]);

    // Business number format templates
    const bnTemplates = ref([
      { id: 1, format: 'XXXXXXXXX RT 0001', description: 'Canadian Standard Format' },
      { id: 2, format: 'XX-XXXXXXX', description: 'US EIN Format' },
      { id: 3, format: 'XXXXXXXXX', description: 'Simple 9-digit Format' },
      { id: 4, format: 'XXX-XXX-XXX', description: 'Hyphenated Format' }
    ]);




    
    // Page navigation methods
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value = currentPage.value - 1;
        ensurePageData(currentPage.value); // Ensure new page data exists
        saveFormData(); // Save after navigation
      }
    };
    
    const goToNextPage = () => {
      if (currentPage.value < totalCopies.value) {
        currentPage.value = currentPage.value + 1;
        ensurePageData(currentPage.value); // Ensure new page data exists
        saveFormData(); // Save after navigation
      }
    };
    
    const goToPage = (pageNumber) => {
      const page = Math.max(1, Math.min(totalCopies.value, pageNumber));
      currentPage.value = page;
    };
    
    // Input validation methods
    const validateCopiesInput = () => {
      const value = parseInt(totalCopies.value);
      if (isNaN(value) || value < 1) {
        totalCopies.value = 1;
      } else if (value > 100) {
        totalCopies.value = 100;
      } else {
        totalCopies.value = value;
      }
      saveFormData(); // Save after validation
    };
    
    // Computed for displaying page numbers
    const displayPageNumber = computed(() => {
      if (!showPageNumbers.value) return '';
      return `${String(currentPage.value).padStart(3, '0')}`;
    });

    // Component lifecycle moved below to consolidate with other lifecycle hook
    
    // Watch for changes in total copies to adjust current page
    watch(totalCopies, (newTotal) => {
      // Ensure totalCopies is within valid range
      if (newTotal < 1) {
        totalCopies.value = 1;
        return;
      }
      if (newTotal > 100) {
        totalCopies.value = 100;
        return;
      }
      
      // Ensure page data exists for all copies
      for (let i = 1; i <= newTotal; i++) {
        ensurePageData(i);
      }
      
      // Adjust current page if it exceeds new total
      if (currentPage.value > newTotal) {
        currentPage.value = Math.max(1, newTotal);
      }
    });
    
    // Watch for changes in current page to ensure it's valid
    watch(currentPage, (newPage) => {
      if (newPage < 1) {
        currentPage.value = 1;
      } else if (newPage > totalCopies.value) {
        currentPage.value = totalCopies.value;
      }
      saveFormData(); // Save when current page changes
    });
    
    // Watch for changes in showPageNumbers to auto-save (debounced)
    watch(showPageNumbers, () => {
      debouncedSaveFormData();
    });

    // Watch all form fields for changes and auto-save (debounced to reduce writes)
    watch([
      organizationName, 
      organizationSubName, 
      businessNumber, 
      headOfficeAddress, 
      headOfficePhone, 
      branchAddress1, 
      branch1Phone, 
      branchAddress2, 
      branch2Phone, 
      logoDataUrl, 
      autoReceiptNumber, // Add this to watch for changes
      autoDate, // Add this to watch for changes
      taxEnabled,
      smartTextInput,
      additionalBranches,
      items,
      taxRate,
      pageData, // Watch the entire pageData structure
      currentPage // Also watch current page changes
    ], () => {
      debouncedSaveFormData();
    }, { deep: true });

    // Logo upload handler
    const handleLogoUpload = (event) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Please upload an image file (PNG, JPG, etc.)');
          return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
          alert('Image size should be less than 5MB');
          return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
          tempImageUrl.value = e.target?.result;
          showImageCropper.value = true;
        };
        reader.readAsDataURL(file);
      }
      
      if (event.target) {
        event.target.value = '';
      }
    };
    
    const handleCroppedImage = (croppedDataUrl) => {
      logoDataUrl.value = croppedDataUrl;
      showImageCropper.value = false;
      tempImageUrl.value = '';
      
      // Save to localStorage
      saveFormData();
    };
    
    const handleCropperClose = () => {
      showImageCropper.value = false;
      tempImageUrl.value = '';
    };

    // Invoice Items Methods
    const addItem = () => {
      if (items.value.length >= MAX_ITEMS) return;
      
      const newItem = {
        id: Date.now(),
        quantity: 0,
        price: 0,
        tax: 0,
        description: ''
      };
      items.value.push(newItem);
    };
    
    const removeItem = (itemId) => {
      if (items.value.length <= 1) return; // Keep at least one item
      items.value = items.value.filter(item => item.id !== itemId);
    };
    
    const addItemAfter = (index) => {
      if (items.value.length >= MAX_ITEMS) return;
      
      const newItem = {
        id: Date.now(),
        quantity: 0,
        price: 0,
        tax: 0,
        description: ''
      };
      items.value.splice(index + 1, 0, newItem);
    };
    
    const getItemAmount = (item) => {
      const subtotal = (item.quantity || 0) * (item.price || 0);
      const taxAmount = subtotal * ((item.tax || 0) / 100);
      return subtotal + taxAmount;
    };
    
    const autoResize = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    };
    
    // Computed properties for totals
    const subtotal = computed(() => {
      return items.value.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.price || 0));
      }, 0);
    });
    
    const taxAmount = computed(() => {
      if (!taxEnabled.value) return 0;
      return subtotal.value * ((taxRate.value || 0) / 100);
    });
    
    const grandTotal = computed(() => {
      return subtotal.value + taxAmount.value;
    });

    // Display total for summary - prioritize naira field over grand total
    const displayTotal = computed(() => {
      return naira.value > 0 ? naira.value : grandTotal.value;
    });
    
    // Currency formatter
    const toCurrency = (amount) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    };
    
    // Amount in words functionality
    const updateAmountInWords = () => {
      // For receipts, prioritize naira field over grand total
      const total = naira.value > 0 ? naira.value : grandTotal.value;
      const words = numberToWords(total);
      
      // Split words into two lines if too long
      const MAX_CHARS_PER_LINE = 60;
      if (words.length > MAX_CHARS_PER_LINE) {
        const words_array = words.split(' ');
        let line1 = '';
        let line2 = '';
        
        for (const word of words_array) {
          if ((line1 + word).length <= MAX_CHARS_PER_LINE) {
            line1 += (line1 ? ' ' : '') + word;
          } else {
            line2 += (line2 ? ' ' : '') + word;
          }
        }
        
        sumOf.value = line1;
        sumOf2.value = line2;
      } else {
        sumOf.value = words;
        sumOf2.value = '';
      }
    };
    
    const numberToWords = (amount) => {
      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      
      const convertHundreds = (num) => {
        let result = '';
        
        if (num >= 100) {
          result += ones[Math.floor(num / 100)] + ' hundred ';
          num %= 100;
        }
        
        if (num >= 20) {
          result += tens[Math.floor(num / 10)];
          if (num % 10 !== 0) {
            result += ' ' + ones[num % 10];
          }
        } else if (num >= 10) {
          result += teens[num - 10];
        } else if (num > 0) {
          result += ones[num];
        }
        
        return result.trim();
      };
      
      if (amount === 0) return 'Zero naira only';
      
      const naira = Math.floor(amount);
      const kobo = Math.round((amount - naira) * 100);
      
      let result = '';
      let remainingNaira = naira;
      
      if (remainingNaira >= 1000000) {
        result += convertHundreds(Math.floor(remainingNaira / 1000000)) + ' million ';
        remainingNaira %= 1000000;
      }
      
      if (remainingNaira >= 1000) {
        result += convertHundreds(Math.floor(remainingNaira / 1000)) + ' thousand ';
        remainingNaira %= 1000;
      }
      
      if (remainingNaira > 0) {
        result += convertHundreds(remainingNaira) + ' ';
      }
      
      result += 'naira';
      
      if (kobo > 0) {
        result += ' and ' + convertHundreds(kobo) + ' kobo';
      }
      
      return (result + ' only').replace(/\s+/g, ' ').trim();
    };
    
    const handleSumOfOverflow = () => {
      const input1 = sumOfInput1.value;
      if (input1 && input1.scrollWidth > input1.clientWidth) {
        // Input is overflowing, update the automatic generation
        updateAmountInWords();
      }
    };
    
    const handleSumOf2Input = () => {
      // Allow manual editing of second line
    };
    
    const handlePaymentForOverflow = () => {
      const input1 = paymentForInput1.value;
      if (input1 && input1.scrollWidth > input1.clientWidth) {
        // Input is overflowing, could implement auto-split logic here
      }
    };
    
    const handlePaymentFor2Input = () => {
      // Allow manual editing of second payment line
    };
    
    // Signature Methods
    const handleCreateSignature = () => {
      // Store return path for navigation after signature creation
      localStorage.setItem('signatureReturnPath', router.currentRoute.value.fullPath);
      localStorage.setItem('signatureReturnType', 'receipt');
      router.push('/ican-app/signature');
    };
    
    const handleSignature1Change = () => {
      console.log('🖊️ Signature 1 changed to:', selectedSignature1.value);
      console.log('📋 Available signatures:', savedSignatures.value.map(s => ({ id: s.id, name: s.name })));
      const signature = savedSignatures.value.find(sig => sig.id === selectedSignature1.value);
      signatureImage1.value = signature ? (signature.dataURL || signature.imageData || '') : '';
      console.log('🖼️ Signature 1 image set:', signatureImage1.value ? 'Has image' : 'No image');
      
      // Save to both form data and shared state
      saveFormData();
      saveSharedSignatureState();
    };
    
    const handleSignature2Change = () => {
      console.log('🖊️ Signature 2 changed to:', selectedSignature2.value);
      console.log('📋 Available signatures:', savedSignatures.value.map(s => ({ id: s.id, name: s.name })));
      const signature = savedSignatures.value.find(sig => sig.id === selectedSignature2.value);
      signatureImage2.value = signature ? (signature.dataURL || signature.imageData || '') : '';
      console.log('🖼️ Signature 2 image set:', signatureImage2.value ? 'Has image' : 'No image');
      
      // Save to both form data and shared state
      saveFormData();
      saveSharedSignatureState();
    };
    
    // Watch for changes in total copies to adjust current page
    watch(totalCopies, (newTotal) => {
      if (currentPage.value > newTotal) {
        currentPage.value = newTotal;
      }
    });

    // Debounced save to reduce storage writes
    let saveFormDataTimeout = null;
    const debouncedSaveFormData = (immediate = false) => {
      if (immediate) {
        // Save immediately if requested (e.g., before navigation)
        if (saveFormDataTimeout) clearTimeout(saveFormDataTimeout);
        saveFormData();
        return;
      }
      
      // Clear existing timeout
      if (saveFormDataTimeout) clearTimeout(saveFormDataTimeout);
      
      // Set new timeout for debounced save
      saveFormDataTimeout = setTimeout(() => {
        saveFormData();
        saveFormDataTimeout = null;
      }, 500); // Wait 500ms after last change
    };

    const saveFormData = () => {
      const formData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        businessNumber: businessNumber.value,
        headOfficeAddress: headOfficeAddress.value,
        headOfficePhone: headOfficePhone.value,
        branchAddress1: branchAddress1.value,
        branch1Phone: branch1Phone.value,
        branchAddress2: branchAddress2.value,
        branch2Phone: branch2Phone.value,
        logoDataUrl: logoDataUrl.value,
        autoReceiptNumber: autoReceiptNumber.value, // Save auto receipt number toggle state
        autoDate: autoDate.value, // Save auto date toggle state
        taxEnabled: taxEnabled.value,
        showPageNumbers: showPageNumbers.value,
        totalCopies: totalCopies.value,
        currentPage: currentPage.value,
        // Invoice Items Data
        items: items.value,
        taxRate: taxRate.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        selectedSignature1: selectedSignature1.value,
        selectedSignature2: selectedSignature2.value,
        signatureImage1: signatureImage1.value,
        signatureImage2: signatureImage2.value,
        additionalBranches: additionalBranches.value, // Save dynamic branches
        // Per-page data structure
        pageData: pageData.value,
        timestamp: Date.now() // Add timestamp for data validation
      };
      
      // Use safe localStorage with automatic cleanup and fallback
      const success = safeLocalStorage.setItem('generateReceiptFormData', JSON.stringify(formData), { 
        fallbackToMemory: true,
        maxSize: 1 // Limit to 1MB to prevent huge form data
      });
      
      if (!success) {
        console.warn('Form data could not be saved to storage, using memory fallback');
      }
    };

    const loadFormData = () => {
      try {
        const savedData = safeLocalStorage.getItem('generateReceiptFormData');
        if (savedData) {
          const formData = JSON.parse(savedData);
          
          // Load all form fields
          organizationName.value = formData.organizationName || '';
          organizationSubName.value = formData.organizationSubName || '';
          businessNumber.value = formData.businessNumber || '';
          headOfficeAddress.value = formData.headOfficeAddress || '';
          headOfficePhone.value = formData.headOfficePhone || '';
          branchAddress1.value = formData.branchAddress1 || '';
          branch1Phone.value = formData.branch1Phone || '';
          branchAddress2.value = formData.branchAddress2 || '';
          branch2Phone.value = formData.branch2Phone || '';
          logoDataUrl.value = formData.logoDataUrl || '';
          taxEnabled.value = formData.taxEnabled !== undefined ? formData.taxEnabled : true;
          showPageNumbers.value = formData.showPageNumbers || false;
          totalCopies.value = formData.totalCopies || 1;
          currentPage.value = formData.currentPage || 1;
          
          // Load invoice items data
          if (formData.items && Array.isArray(formData.items)) {
            items.value = formData.items;
          }
          taxRate.value = formData.taxRate || 0;
          sumOf.value = formData.sumOf || '';
          sumOf2.value = formData.sumOf2 || '';
          selectedSignature1.value = formData.selectedSignature1 || '';
          selectedSignature2.value = formData.selectedSignature2 || '';
          signatureImage1.value = formData.signatureImage1 || '';
          signatureImage2.value = formData.signatureImage2 || '';
          autoReceiptNumber.value = formData.autoReceiptNumber !== undefined ? formData.autoReceiptNumber : true;
          autoDate.value = formData.autoDate !== undefined ? formData.autoDate : true;
          // Restore dynamic branches if available
          if (formData.additionalBranches && Array.isArray(formData.additionalBranches)) {
            additionalBranches.value = formData.additionalBranches;
          }
          
          // Load per-page data if available
          if (formData.pageData && typeof formData.pageData === 'object') {
            pageData.value = formData.pageData;
          }
          
          // Load legacy receipt-specific fields into current page for backward compatibility
          if (formData.receivedFrom || formData.paymentFor || formData.paymentFor2 || formData.naira) {
            ensurePageData(currentPage.value);
            pageData.value[currentPage.value].receivedFrom = formData.receivedFrom || '';
            pageData.value[currentPage.value].paymentFor = formData.paymentFor || '';
            pageData.value[currentPage.value].paymentFor2 = formData.paymentFor2 || '';
            pageData.value[currentPage.value].naira = formData.naira || 0;
          }
          
          // Ensure current page data exists
          ensurePageData(currentPage.value);
          
          // Form data loaded successfully
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        // Don't show alert on load error, just log it
      }
    };

    const handlePreviewClick = async () => {
      try {
        console.log('🔍 Starting receipt preview preparation...');
        
        // Force immediate save before navigation
        debouncedSaveFormData(true);
        
        // Prepare preview data with items and transaction data
        const previewData = {
          taxEnabled: Boolean(taxEnabled.value),
          totalCopies: Math.max(1, Math.min(100, parseInt(totalCopies.value) || 1)),
          currentPage: Math.max(1, parseInt(currentPage.value) || 1),
          showPageNumbers: Boolean(showPageNumbers.value),
          // Include items data for table
          items: items.value || [],
          taxRate: taxRate.value || 0,
          sumOf: sumOf.value || '',
          sumOf2: sumOf2.value || '',
          // Include receipt-specific fields from current page
          receivedFrom: receivedFrom.value || '',
          paymentFor: paymentFor.value || '',
          paymentFor2: paymentFor2.value || '',
          naira: naira.value || 0,
          // Include per-page data structure
          pageData: pageData.value,
          // Include signature data
          selectedSignature1: selectedSignature1.value || '',
          selectedSignature2: selectedSignature2.value || '',
          signatureImage1: signatureImage1.value || '',
          signatureImage2: signatureImage2.value || '',
          autoDate: autoDate.value, // Pass auto date toggle state
          formMode: 'preview-only',
          fromQuickFill: false,
          timestamp: Date.now()
        };
        
        console.log('📦 Receipt preview data prepared');
        
        // Clear any existing corrupted data first
        try {
          localStorage.removeItem('invoicePreviewData');
        } catch (clearError) {
          console.warn('⚠️ Could not clear old preview data:', clearError);
        }
        
        // Save with error handling - try multiple methods
        try {
          const serializedData = JSON.stringify(previewData);
          console.log('📝 Serialized data size:', serializedData.length, 'bytes');
          
          // Try localStorage first
          localStorage.setItem('invoicePreviewData', serializedData);
          console.log('✅ Receipt preview data saved to localStorage');
        } catch (storageError) {
          console.error('❌ localStorage failed:', storageError);
          // Try sessionStorage as fallback
          try {
            sessionStorage.setItem('invoicePreviewData', JSON.stringify(previewData));
            console.log('✅ Receipt preview data saved to sessionStorage (fallback)');
          } catch (sessionError) {
            console.error('❌ sessionStorage also failed:', sessionError);
            throw new Error('Cannot save preview data. Storage might be full.');
          }
        }
        
        // Get branch from route query
        const branch = route.query.branch || '';
        console.log('🌿 Branch for preview:', branch);
        
        // Navigate to ICAN receipt preview page with branch context
        router.push({
          name: 'ican-app-receipt-preview',
          query: { branch }
        });
        
      } catch (error) {
        console.error('❌ Error preparing preview data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        alert(`Error preparing preview: ${errorMessage}\n\nPlease try:\n1. Reducing form data\n2. Removing uploaded images\n3. Clearing browser data`);
      }
    };

    const handleRefreshForm = () => {
      // Check if there's any data to clear
      const hasData = organizationName.value || organizationSubName.value || businessNumber.value || 
                     headOfficeAddress.value || smartTextInput.value || logoDataUrl.value;
      
      if (!hasData) {
        alert('ℹ️ Form is already empty!');
        return;
      }
      
      if (confirm('🗑️ Clear All Data\n\nAre you sure you want to clear all form data and start fresh?\n\nThis will remove:\n• Organization details\n• Logo\n• All settings\n\nThis action cannot be undone.')) {
        // Clear all form fields
        organizationName.value = '';
        organizationSubName.value = '';
        businessNumber.value = '';
        headOfficeAddress.value = '';
        headOfficePhone.value = '';
        branchAddress1.value = '';
        branch1Phone.value = '';
        branchAddress2.value = '';
        branch2Phone.value = '';
        logoDataUrl.value = '';
        taxEnabled.value = true;
        totalCopies.value = 1;
        currentPage.value = 1;
        showPageNumbers.value = false;
        
        // Clear dynamic branches
        additionalBranches.value = [];
        
        // Clear smart text parser
        smartTextInput.value = '';
        validationErrors.value = [];
        parsedData.value = { organizationName: '', subtitle: '', addresses: [], phones: [], parseMethod: 'none' };
        
        // Clear localStorage
        localStorage.removeItem('generateReceiptFormData');
        
        alert('✅ Form cleared successfully! Ready for new data.');
      }
    };

    // Business Number Quick Fill Methods
    const selectBusinessNumber = (bn) => {
      businessNumber.value = bn.number;
      showBNDropdown.value = false;
      saveFormData(); // Save to localStorage when business number is selected
    };

    const selectBNTemplate = (template) => {
      businessNumber.value = template.format;
      showBNDropdown.value = false;
      saveFormData(); // Save to localStorage when template is selected
    };

    const clearBusinessNumber = () => {
      businessNumber.value = '';
      showBNDropdown.value = false;
      saveFormData(); // Save to localStorage when cleared
    };



    // Save Invoice Functions
    const toggleInvoiceMenu = () => {
      showInvoiceMenu.value = !showInvoiceMenu.value;
    };

    const toggleSettingsPanel = () => {
      showSettingsPanel.value = !showSettingsPanel.value;
    };

    // Handle click outside to close dropdown
    const handleClickOutside = (event) => {
      if (invoiceMenuRef.value && !invoiceMenuRef.value.contains(event.target)) {
        showInvoiceMenu.value = false;
      }
    };

    const handleSaveReceipt = () => {
      showInvoiceMenu.value = false;
      showSaveDialog();
    };

    const handleViewSavedReceipts = () => {
      showInvoiceMenu.value = false;
      viewSavedReceipts();
    };

    const showSaveDialog = () => {
      // Generate a default receipt name based on organization and date
      const orgName = organizationName.value || 'Receipt';
      const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).replace(/\//g, '-');
      
      invoiceName.value = `${orgName} - ${date}`;
      showSaveModal.value = true;
    };

    const cancelSave = () => {
      showSaveModal.value = false;
      invoiceName.value = '';
    };

    const saveReceipt = async () => {
      if (!invoiceName.value.trim()) {
        alert('Please enter a name for your receipt');
        return;
      }

      isSaving.value = true;
      
      try {
        // Get current member/branch info - try both keys
        const memberData = localStorage.getItem('ican_authenticated_member') || localStorage.getItem('authenticatedMember');
        if (!memberData) {
          alert('Please login first to save receipts');
          isSaving.value = false;
          return;
        }

        const member = JSON.parse(memberData);
        if (!member.branch) {
          alert('No branch information found. Please contact support.');
          isSaving.value = false;
          return;
        }

        // Prepare receipt data
        const receiptData = {
          id: Date.now().toString(),
          name: invoiceName.value.trim(),
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          businessNumber: businessNumber.value,
          headOfficeAddress: headOfficeAddress.value,
          headOfficePhone: headOfficePhone.value,
          branchAddress1: branchAddress1.value,
          branch1Phone: branch1Phone.value,
          branchAddress2: branchAddress2.value,
          branch2Phone: branch2Phone.value,
          logoDataUrl: logoDataUrl.value,
          
          // Receipt-specific fields
          receivedFrom: receivedFrom.value,
          paymentFor: paymentFor.value,
          paymentFor2: paymentFor2.value,
          naira: naira.value,
          sumOf: sumOf.value,
          sumOf2: sumOf2.value,
          selectedSignature1: selectedSignature1.value,
          selectedSignature2: selectedSignature2.value,
          signatureImage1: signatureImage1.value,
          signatureImage2: signatureImage2.value,
          
          receiptNumber: Math.floor(Math.random() * 10000) + 1000,
          createdAt: new Date().toISOString(),
          date: new Date().toISOString(),
          type: 'ican-receipt'
        };

        // Try saving with Firebase first
        try {
          const { saveReceipt: dbSaveReceipt } = await import('@/firebase/database');
          const result = await dbSaveReceipt(member.branch, receiptData);
          
          if (result.success) {
            showSaveModal.value = false;
            invoiceName.value = '';
            
            const toast = document.createElement('div');
            toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity flex items-center gap-2';
            toast.innerHTML = `
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              Receipt "${receiptData.name}" saved successfully!
            `;
            document.body.appendChild(toast);
            
            setTimeout(() => {
              toast.style.opacity = '0';
              setTimeout(() => {
                if (document.body.contains(toast)) {
                  document.body.removeChild(toast);
                }
              }, 300);
            }, 3000);
            return;
          }
        } catch (firebaseError) {
          console.error('Firebase save failed:', firebaseError);
        }
        
        // Fallback to localStorage
        const storageKey = `ican_receipts_${member.branch}`;
        const existingReceipts = JSON.parse(localStorage.getItem(storageKey) || '[]');
        receiptData.receiptNumber = existingReceipts.length + 1;
        existingReceipts.push(receiptData);
        localStorage.setItem(storageKey, JSON.stringify(existingReceipts));
        
        showSaveModal.value = false;
        invoiceName.value = '';
        
        const toast = document.createElement('div');
        toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity flex items-center gap-2';
        toast.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          Receipt "${receiptData.name}" saved successfully!
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => {
          toast.style.opacity = '0';
          setTimeout(() => {
            if (document.body.contains(toast)) {
              document.body.removeChild(toast);
            }
          }, 300);
        }, 3000);

      } catch (error) {
        console.error('Error saving receipt:', error);
        alert(`Error saving receipt: ${error.message}. Please try again.`);
      } finally {
        isSaving.value = false;
      }
    };

    // Navigation functions
    const viewSavedInvoices = () => {
      router.push({ name: 'SavedInvoices', query: route.query });
    };

    const viewSavedReceipts = () => {
      router.push({ name: 'SavedReceipts', query: route.query });
    };

    // Component lifecycle
    // Watch for route changes to reload form data when returning from preview or signature page
    watch(() => route.path, (newPath, oldPath) => {
      // If we're coming back from the preview page, reload form data
      if (oldPath && oldPath.includes('preview') && newPath.includes('ican-receipt')) {
        setTimeout(() => {
          loadFormData();
        }, 100); // Small delay to ensure component is ready
      }
      
      // If we're coming back from the signature page, reload signatures
      if (oldPath && oldPath.includes('signature') && newPath.includes('ican-receipt')) {
        console.log('🔄 Returning from signature page, reloading signatures...');
        setTimeout(async () => {
          await loadSignatures();
          loadFormData(); // Also reload form data to get any signature selections
        }, 100);
      }
    });

    onMounted(async () => {
      // Add click outside listener for dropdown
      document.addEventListener('click', handleClickOutside);
      
      // Load shared signature state first
      loadSharedSignatureState();
      
      // Load saved form data on component mount
      loadFormData();
      
      // Load signatures from Firebase
      await loadSignatures();
      
      // Ensure page data exists for current page
      ensurePageData(currentPage.value);

      // Handle Android hardware back button
      const handleAndroidBackButton = async () => {
        console.log('🔙 Android back button pressed on Receipt page');
        // Navigate back to dashboard instead of exiting app
        const branch = route.query.branch || '';
        router.push({ name: 'Dashboard', query: { branch } });
      };
      
      // Register Android back button listener with proper cleanup
      if (Capacitor.isNativePlatform()) {
        (async () => {
          try {
            // Remove any existing listener first
            if (backButtonListener) {
              await backButtonListener.remove();
            }
            
            const { App } = await import('@capacitor/app');
            backButtonListener = await App.addListener('backButton', handleAndroidBackButton);
            console.log('✅ Android back button listener registered for Receipt');
          } catch (error) {
            console.log('ℹ️ Error registering back button listener:', error);
          }
        })();
      }

      // Save data when the user is about to leave the page
      window.addEventListener('beforeunload', saveFormData);
      
      // Add storage event listener for real-time sync with preview page
      window.addEventListener('storage', handleStorageChange);

      // Add visibility change listener to reload form data when tab becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Tab became visible, reload form data in case user navigated back
          setTimeout(async () => {
            await loadSignatures(); // Reload signatures first
            loadFormData(); // Then reload form data
          }, 100);
        }
      });
    });
    
    // Handle storage changes for real-time sync
    const handleStorageChange = (event) => {
      if (event.key === SHARED_SIGNATURE_KEY && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue);
          console.log('🔄 Detected signature state change from preview page:', newData);
          
          selectedSignature1.value = newData.selectedSignature1 || '';
          selectedSignature2.value = newData.selectedSignature2 || '';
          signatureImage1.value = newData.signatureImage1 || '';
          signatureImage2.value = newData.signatureImage2 || '';
        } catch (error) {
          console.error('❌ Error handling storage change:', error);
        }
      }
    };

    // Cleanup and save before unmount
    onBeforeUnmount(async () => {
      // Remove click outside listener
      document.removeEventListener('click', handleClickOutside);
      
      // Remove Android back button listener
      if (backButtonListener && typeof backButtonListener.remove === 'function') {
        try {
          await backButtonListener.remove();
          backButtonListener = null;
          console.log('🧹 Android back button listener removed from Receipt');
        } catch (error) {
          console.log('⚠️ Error removing back button listener:', error);
        }
      }
      
      window.removeEventListener('beforeunload', saveFormData);
      window.removeEventListener('storage', handleStorageChange);
      
      // Clear pending debounced save and save immediately
      if (saveFormDataTimeout) {
        clearTimeout(saveFormDataTimeout);
        saveFormDataTimeout = null;
      }
      
      // Save form data immediately when navigating away
      saveFormData();
      
      // Clean up large data to free memory
      additionalBranches.value = [];
    });

    const createNewReceipt = () => {
      // Check if there's any receipt data that would be lost
      const hasReceiptData = receivedFrom.value.trim() !== '' || 
                            paymentFor.value.trim() !== '' || 
                            paymentFor2.value.trim() !== '' || 
                            naira.value > 0 || 
                            sumOf.value.trim() !== '' || 
                            sumOf2.value.trim() !== '';
      
      if (hasReceiptData) {
        // Only ask for confirmation if there's actual receipt data
        if (!confirm('🆕 Create New Receipt\n\nThis will clear current receipt data and create a fresh receipt.\n\nProceed?')) {
          return;
        }
      }
      
      // Reset all receipt-specific fields to fresh state
      Object.keys(pageData.value).forEach(pageKey => {
        pageData.value[pageKey] = {
          receivedFrom: '',
          paymentFor: '',
          paymentFor2: '',
          naira: 0,
          sumOf: '',
          sumOf2: ''
        };
      });
      
      // Reset receipt fields
      sumOf.value = '';
      sumOf2.value = '';
      
      // Reset page settings
      totalCopies.value = 1;
      currentPage.value = 1;
      
      // Auto-generate receipt number if enabled
      if (autoReceiptNumber.value) {
        const today = new Date();
        const timestamp = today.getTime();
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const receiptNumber = `RCP-${today.getFullYear()}-${timestamp}-${randomSuffix}`;
        // You could store this in a ref if needed for display
      }
      
      // Auto-set date if enabled
      if (autoDate.value) {
        const today = new Date();
        const formattedDate = today.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
        // Update date field if it exists
      }
      
      // Clear receipt preview data and settings
      localStorage.removeItem('receiptPreviewData');
      localStorage.removeItem('generateReceiptFormData');
      localStorage.removeItem('receiptQuickSettings');
      
      // Clear signature selections
      selectedSignature1.value = '';
      selectedSignature2.value = '';
      signatureImage1.value = null;
      signatureImage2.value = null;
      
      // Show success message
      const message = hasReceiptData ? '✅ New receipt created!' : '✅ Fresh receipt ready!';
      
      // Use a toast-style notification instead of alert for better UX
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
      toast.textContent = message;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
    };

    return {
      organizationName,
      organizationSubName,
      businessNumber,
      headOfficeAddress,
      headOfficePhone,
      branchAddress1,
      branch1Phone,
      branchAddress2,
      branch2Phone,
      logoDataUrl,
      autoReceiptNumber,
      autoDate,
      taxEnabled,
      showPageNumbers,
      // Multiple pages/copies
      totalCopies,
      currentPage,
      displayPageNumber,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      validateCopiesInput,
      showImageCropper,
      tempImageUrl,
      logoInput,
      // Business Number Quick Fill
      showBNDropdown,
      businessNumberOptions,
      bnTemplates,
      selectBusinessNumber,
      selectBNTemplate,
      clearBusinessNumber,
      // Dynamic Branch Management
      additionalBranches,
      addNewBranch,
      removeBranch,
      // Invoice Items Management
      MAX_ITEMS,
      items,
      taxRate,
      sumOf,
      sumOf2,
      sumOfInput1,
      sumOfInput2,
      receivedFrom,
      paymentFor,
      paymentFor2,
      paymentForInput1,
      paymentForInput2,
      naira,
      handlePaymentForOverflow,
      handlePaymentFor2Input,
      addItem,
      removeItem,
      addItemAfter,
      getItemAmount,
      autoResize,
      subtotal,
      taxAmount,
      grandTotal,
      displayTotal,
      toCurrency,
      updateAmountInWords,
      handleSumOfOverflow,
      handleSumOf2Input,
      // Signature Management
      savedSignatures,
      selectedSignature1,
      selectedSignature2,
      signatureImage1,
      signatureImage2,
      handleCreateSignature,
      handleSignature1Change,
      handleSignature2Change,
      loadSignatures,
      loadSharedSignatureState,
      saveSharedSignatureState,
      // UI State
      showPreview,
      // Parser placeholders (removed functionality)
      smartTextInput,
      showFormatGuide,
      showManualGuide,
      showParsedPreview,
      validationErrors,
      parsedData,
      smartInputPlaceholder,
      manualInputPlaceholder,
      parseSmartText,
      handlePaste,
      // Methods
      handleLogoUpload,
      handleCroppedImage,
      handleCropperClose,
      handlePreviewClick,
      handleRefreshForm,
      saveFormData,
      loadFormData,
      viewSavedInvoices,
      viewSavedReceipts,
      toggleInvoiceMenu,
      handleSaveReceipt,
      handleViewSavedReceipts,
      showInvoiceMenu,
      showSettingsPanel,
      toggleSettingsPanel,
      invoiceMenuRef,
      showSaveDialog,
      cancelSave,
      saveReceipt,
      showSaveModal,
      invoiceName,
      isSaving,
      createNewReceipt,
      // Missing required function
      generateReceiptNumber: () => {
        // Auto-generate receipt number logic
        const today = new Date();
        const timestamp = today.getTime();
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `RCP-${today.getFullYear()}-${timestamp}-${randomSuffix}`;
      }
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
