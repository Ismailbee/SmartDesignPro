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
      <!-- Member Info Banner -->
      <div class="w-full max-w-4xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-2.5 rounded-lg shadow-md flex items-center justify-between">
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
          <div class="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p class="text-xs font-semibold">Logged in as: {{ authenticatedMember?.name || 'Unknown' }}</p>
            <p class="text-[10px] opacity-90">{{ authenticatedMember?.role || 'Member' }}</p>
          </div>
        </div>
      </div>

      <!-- Control  Panel Section -->
      <section class="w-full max-w-4xl bg-white dark:bg-slate-800 p-2 rounded-xl shadow-lg">
        <div class="flex items-center justify-between flex-wrap gap-2.5">
          <!-- Title -->
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Generate Invoice
              </h1>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Quick invoice with organization details</p>
            </div>
          </div>
          
          <!-- Navigation Buttons -->
          <div class="flex gap-2">
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              title="View saved invoices"
              @click="viewSavedInvoices"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Saved Invoices
            </button>
            
            <button
              class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
              title="Create a new invoice"
              @click="createNewInvoice"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              New Invoice
            </button>
          </div>
        </div>

        <!-- Settings Row -->
        <div class="mt-2.5 flex justify-between items-center flex-wrap gap-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700">
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

            <!-- Tax Enable Toggle -->
            <label class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              <input type="checkbox" v-model="taxEnabled" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
              <span>Enable Tax</span>
            </label>

            <!-- Show Page Numbers Toggle -->
            <label class="flex items-center gap-1.5 text-[10px] font-medium text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
              <input type="checkbox" v-model="showPageNumbers" class="rounded border-gray-300 cursor-pointer accent-emerald-600" />
              <span>Show Page #</span>
              <span v-if="showPageNumbers" class="text-[8px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 py-0.5 rounded">{{ displayPageNumber }}</span>
            </label>
          </div>
          
          <!-- Multiple Copies Controls -->
          <div class="flex items-center gap-2.5">
            <!-- Copies Input -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
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
      </section>

      <!-- Organization Details Form -->
      <section class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">
                📋 Organization Details Form
              </h2>
            </div>
            
            <!-- Clear Button -->
            <div class="flex gap-2">
              <button
                class="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-lg transition-colors shadow-sm"
                title="Clear all fields and start fresh"
                @click="handleRefreshForm"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Clear</span>
              </button>
            </div>
          </div>

          <!-- Logo Upload Section -->
          <div class="mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              📷 Organization Logo (Optional)
            </label>
            <div class="flex items-center gap-3">
              <input
                ref="logoInput"
                type="file"
                accept="image/*"
                class="hidden"
                @change="handleLogoUpload"
              />
              <div
                class="h-16 w-24 flex items-center justify-center bg-white dark:bg-slate-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
                @click="$refs.logoInput.click()"
              >
                <div v-if="!logoDataUrl" class="text-center">
                  <svg class="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span class="text-[9px] text-gray-500 dark:text-gray-400">Upload</span>
                </div>
                <img v-else :src="logoDataUrl" alt="Logo" class="h-14 max-w-full object-contain" />
              </div>
              <div class="flex-1">
                <p class="text-[10px] text-gray-600 dark:text-gray-400">
                  Click to upload your organization logo. Supported formats: PNG, JPG, GIF
                </p>
                <button 
                  v-if="logoDataUrl" 
                  class="text-[9px] text-red-600 dark:text-red-400 hover:underline mt-1" 
                  @click.stop="logoDataUrl = ''"
                >
                  Remove logo
                </button>
              </div>
            </div>
          </div>

          <!-- Organization Details Form -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <!-- BN Number -->
            <div class="mb-1">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                📋 BN Number
              </label>
              <input
                v-model="businessNumber"
                type="text"
                placeholder="Enter business number"
                class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <!-- RC Number -->
            <div class="mb-1">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                📜 RC Number
              </label>
              <input
                v-model="rcNumber"
                type="text"
                placeholder="Enter RC number"
                class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <!-- Organization Name -->
            <div class="mb-1">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                🏢 Organization Name
              </label>
              <input
                v-model="organizationName"
                type="text"
                placeholder="Enter organization name"
                class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                @input="debouncedSaveFormData"
                @blur="saveFormData"
              />
            </div>

            <!-- Organization Subtitle -->
            <div class="mb-1 md:col-span-2">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                📝 Subtitle/Tagline
              </label>
              <input
                v-model="organizationSubName"
                type="text"
                placeholder="Enter organization subtitle or tagline"
                class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <!-- Head Office Address -->
            <div class="mb-1">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                📍 Head Office Address
              </label>
              <input
                v-model="headOfficeAddress"
                type="text"
                placeholder="Enter head office address"
                class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <!-- Head Office Phone -->
            <div class="mb-1">
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                📞 Head Office Phone
              </label>
              <input
                v-model="headOfficePhone"
                type="text"
                placeholder="Enter head office phone"
                class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <!-- Dynamic Branch Addresses and Phones -->
            <template v-for="(branch, index) in additionalBranches" :key="'branch-' + index">
              <div class="mb-1">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5 flex items-center justify-between">
                  <span>🏪 Branch {{ index + 1 }} Address</span>
                  <button
                    @click="removeBranch(index)"
                    class="text-red-500 hover:text-red-700 text-xs ml-2 px-1"
                    title="Remove branch"
                  >
                    ✕
                  </button>
                </label>
                <input
                  v-model="branch.address"
                  type="text"
                  :placeholder="`Enter branch ${index + 1} address`"
                  class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div class="mb-1">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-0.5">
                  📱 Branch {{ index + 1 }} Phone
                </label>
                <input
                  v-model="branch.phone"
                  type="text"
                  :placeholder="`Enter branch ${index + 1} phone`"
                  class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </template>

            <!-- Add Branch Button -->
            <div class="md:col-span-2 mb-1">
              <button
                @click="addNewBranch"
                class="w-full py-1.5 px-3 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md transition-colors border border-blue-300 dark:border-blue-600 flex items-center justify-center gap-1"
              >
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Branch Address & Phone
              </button>
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
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import LogoCropper from '@/components/image/LogoCropper.vue';
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
    const authenticatedMember = ref(null);
    
    // Form fields
    const organizationName = ref('');
    const organizationSubName = ref('');
    const businessNumber = ref('');
    const rcNumber = ref('RC1234567'); // Test value
    const headOfficeAddress = ref('');
    const headOfficePhone = ref('');
    const branchAddress1 = ref('');
    const branch1Phone = ref('');
    const branchAddress2 = ref('');
    const branch2Phone = ref('');
    const logoDataUrl = ref('');
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    const taxEnabled = ref(true); // Tax column enable/disable toggle
    const showPageNumbers = ref(false); // Show page/copy numbers toggle
    
    // Dynamic Branches Management
    const additionalBranches = ref([]);
    
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
        saveFormData(); // Save after navigation
      }
    };
    
    const goToNextPage = () => {
      if (currentPage.value < totalCopies.value) {
        currentPage.value = currentPage.value + 1;
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
      rcNumber,
      headOfficeAddress, 
      headOfficePhone, 
      branchAddress1, 
      branch1Phone, 
      branchAddress2, 
      branch2Phone, 
      logoDataUrl, 
      taxEnabled,
      smartTextInput,
      additionalBranches
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
        rcNumber: rcNumber.value,
        headOfficeAddress: headOfficeAddress.value,
        headOfficePhone: headOfficePhone.value,
        branchAddress1: branchAddress1.value,
        branch1Phone: branch1Phone.value,
        branchAddress2: branchAddress2.value,
        branch2Phone: branch2Phone.value,
        logoDataUrl: logoDataUrl.value,
        taxEnabled: taxEnabled.value,
        showPageNumbers: showPageNumbers.value,
        totalCopies: totalCopies.value,
        currentPage: currentPage.value,

        additionalBranches: additionalBranches.value, // Save dynamic branches
        timestamp: Date.now() // Add timestamp for data validation
      };
      
      // Use safe localStorage with automatic cleanup and fallback
      const success = safeLocalStorage.setItem('generateInvoiceFormData', JSON.stringify(formData), { 
        fallbackToMemory: true,
        maxSize: 1 // Limit to 1MB to prevent huge form data
      });
      
      if (!success) {
        console.warn('Form data could not be saved to storage, using memory fallback');
      }
    };

    const loadFormData = () => {
      try {
        const savedData = safeLocalStorage.getItem('generateInvoiceFormData');
        if (savedData) {
          const formData = JSON.parse(savedData);
          
          // Load all form fields
          organizationName.value = formData.organizationName || '';
          organizationSubName.value = formData.organizationSubName || '';
          businessNumber.value = formData.businessNumber || '';
          rcNumber.value = formData.rcNumber || '';
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

          
          // Restore dynamic branches if available
          if (formData.additionalBranches && Array.isArray(formData.additionalBranches)) {
            additionalBranches.value = formData.additionalBranches;
          }
          

          
          // Form data loaded successfully
        }
      } catch (error) {
        console.error('Error loading form data:', error);
        // Don't show alert on load error, just log it
      }
    };

    const handlePreviewClick = () => {
      try {
        // Force immediate save before navigation
        debouncedSaveFormData(true);
        
        // Prepare clean preview data with proper type validation
        const previewData = {
          organizationName: String(organizationName.value || '').trim(),
          organizationSubName: String(organizationSubName.value || '').trim(),
          businessNumber: String(businessNumber.value || '').trim(),
          rcNumber: String(rcNumber.value || '').trim(),
          headOfficeAddress: String(headOfficeAddress.value || '').trim(),
          headOfficePhone: String(headOfficePhone.value || '').trim(),
          branchAddress1: String(branchAddress1.value || '').trim(),
          branch1Phone: String(branch1Phone.value || '').trim(),
          branchAddress2: String(branchAddress2.value || '').trim(),
          branch2Phone: String(branch2Phone.value || '').trim(),
          logoDataUrl: String(logoDataUrl.value || ''),
          taxEnabled: Boolean(taxEnabled.value),
          totalCopies: Math.max(1, Math.min(100, parseInt(totalCopies.value) || 1)),
          currentPage: Math.max(1, parseInt(currentPage.value) || 1),
          showPageNumbers: Boolean(showPageNumbers.value),
          additionalBranches: Array.isArray(additionalBranches.value) ? additionalBranches.value : [],
          formMode: 'generate',
          fromQuickFill: true,

          timestamp: Date.now() // Add timestamp for cache busting
        };
        
        // Clear any existing corrupted data first
        safeLocalStorage.removeItem('invoicePreviewData');
        
        // Save with error handling
        const serializedData = JSON.stringify(previewData);
        safeLocalStorage.setItem('invoicePreviewData', serializedData, { fallbackToMemory: true });
        
        // Preview data saved successfully
        
        // Navigate to Classic Professional preview page
        router.push('/invoice-template/classic-professional/preview');
        
      } catch (error) {
        console.error('❌ Error preparing preview data:', error);
        alert('Error preparing preview. Please try again.');
      }
    };

    const handleRefreshForm = () => {
      // Check if there's any data to clear
      const hasData = organizationName.value || organizationSubName.value || businessNumber.value || rcNumber.value ||
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
        rcNumber.value = '';
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
        localStorage.removeItem('generateInvoiceFormData');
        
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



    // Navigation functions
    const viewSavedInvoices = () => {
      router.push('/invoices/saved');
    };

    // Component lifecycle
    // Watch for route changes to reload form data when returning from preview
    watch(() => route.path, (newPath, oldPath) => {
      // If we're coming back from the preview page, reload form data
      if (oldPath && oldPath.includes('preview') && newPath.includes('classic-professional')) {
        setTimeout(() => {
          loadFormData();
        }, 100); // Small delay to ensure component is ready
      }
    });

    onMounted(() => {
      // Load authenticated member data
      const memberData = localStorage.getItem('authenticatedMember');
      if (memberData) {
        try {
          authenticatedMember.value = JSON.parse(memberData);
        } catch (error) {
          console.error('Error loading member data:', error);
        }
      }

      // Load saved form data on component mount
      loadFormData();
      


      // Save data when the user is about to leave the page
      window.addEventListener('beforeunload', saveFormData);

      // Add visibility change listener to reload form data when tab becomes visible
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          // Tab became visible, reload form data in case user navigated back
          setTimeout(() => {
            loadFormData();
          }, 100);
        }
      });
    });

    // Cleanup and save before unmount
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', saveFormData);
      
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

    const createNewInvoice = () => {
      // Check if there's any data that would be lost
      const hasData = organizationName.value || organizationSubName.value || businessNumber.value || rcNumber.value ||
                     headOfficeAddress.value || logoDataUrl.value;
      
      if (!hasData) {
        alert('ℹ️ You\'re already working on a fresh invoice!');
        return;
      }
      
      if (confirm('🆕 Start New Invoice\n\nDo you want to save your current work before starting a new invoice?\n\nClick OK to save and start new, or Cancel to start new without saving.')) {
        // User wants to save first
        saveFormData();
        alert('💾 Current work saved! You can return to it later.');
      }
      
      if (confirm('⚠️ Final Confirmation\n\nThis will clear all current form data and start fresh.\n\nProceed with new invoice?')) {
        // Clear form data
        organizationName.value = '';
        organizationSubName.value = '';
        businessNumber.value = '';
        rcNumber.value = '';
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
        
        // Clear localStorage
        localStorage.removeItem('generateInvoiceFormData');
        localStorage.removeItem('invoicePreviewData');
        
        alert('✅ New invoice form ready!');
      }
    };

    return {
      authenticatedMember,
      organizationName,
      organizationSubName,
      businessNumber,
      rcNumber,
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
      createNewInvoice
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
