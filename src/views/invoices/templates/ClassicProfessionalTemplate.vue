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

      <!-- Control Panel Section -->
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

      <!-- Quick Fill Form Section -->
      <section class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">
                📝 Generate Invoice Quick Fill Form
              </h2>
            </div>
            
            <!-- Refresh Button -->
            <button
              class="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-lg transition-colors shadow-sm"
              title="Clear form and start fresh"
              @click="handleRefreshForm"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          
          <p class="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Set up your organization details to generate a quick invoice
          </p>
          
          <div class="space-y-5">
            
            <!-- Organization Settings Section -->
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 class="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-2.5 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Organization Details
              </h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <!-- Logo Upload -->
                <div class="md:col-span-1">
                  <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Organization Logo
                  </label>

                  <div class="flex flex-col gap-1.5">
                    <!-- Hidden File Input -->
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleLogoUpload"
                    />

                    <!-- Unified Upload/Preview Box -->
                    <div
                      class="h-16 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 hover:shadow-md transition-all duration-200 relative overflow-hidden"
                      @click="$refs.logoInput.click()"
                    >
                      <!-- Upload State -->
                      <div v-if="!logoDataUrl" class="flex flex-col items-center justify-center gap-1">
                        <svg class="w-4 h-4 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                        </svg>
                        <span class="text-[9px] text-slate-500 dark:text-slate-400 font-medium">Upload Logo</span>
                      </div>
                      
                      <!-- Preview State -->
                      <div v-else class="w-full h-full p-1.5 flex items-center justify-center">
                        <img
                          :src="logoDataUrl"
                          alt="Organization Logo"
                          class="h-12 max-w-full object-contain"
                        />
                      </div>

                      <!-- Change overlay on hover when image exists -->
                      <div v-if="logoDataUrl" class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <span class="text-[9px] text-white font-medium">Click to change</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Organization Info -->
                <div class="md:col-span-2 flex flex-col gap-3">
                  <!-- Organization Name -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Organization Name
                    </label>
                    <textarea
                      v-model="organizationName"
                      rows="2"
                      placeholder="Enter organization name"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] resize-none"
                    ></textarea>
                  </div>

                  <!-- Organization Subtitle -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Organization Subtitle/Tagline (Optional)
                    </label>
                    <textarea
                      v-model="organizationSubName"
                      rows="2"
                      placeholder="Enter organization subtitle"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] resize-none"
                    ></textarea>
                  </div>

                  <!-- Business Number (BN) -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Business Number (BN)
                    </label>
                    <div class="relative" @click.stop>
                      <input
                        v-model="businessNumber"
                        type="text"
                        placeholder="Enter business number"
                        class="w-full px-2.5 py-1.5 pr-8 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px]"
                        @blur="setTimeout(() => showBNDropdown = false, 150)"
                      />
                      <!-- Quick Fill Dropdown Button -->
                      <button
                        type="button"
                        class="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                        @click="showBNDropdown = !showBNDropdown"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </button>
                      
                      <!-- Quick Fill Dropdown -->
                      <div v-if="showBNDropdown" class="absolute z-50 w-full mt-1 bg-white dark:bg-slate-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-y-auto" @click.stop>
                        <div class="p-2 border-b border-gray-200 dark:border-gray-600">
                          <p class="text-[9px] font-medium text-gray-600 dark:text-gray-400">Quick Fill Options:</p>
                        </div>
                        
                        <!-- Predefined Business Numbers -->
                        <div class="py-1">
                          <button
                            v-for="bn in businessNumberOptions"
                            :key="bn.id"
                            type="button"
                            class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-slate-600 text-[10px] text-gray-900 dark:text-gray-100 flex flex-col"
                            @click="selectBusinessNumber(bn)"
                          >
                            <span class="font-medium">{{ bn.number }}</span>
                            <span class="text-[9px] text-gray-500 dark:text-gray-400">{{ bn.description }}</span>
                          </button>
                        </div>
                        
                        <!-- Format Templates -->
                        <div class="border-t border-gray-200 dark:border-gray-600 py-1">
                          <div class="px-3 py-1">
                            <p class="text-[9px] font-medium text-gray-600 dark:text-gray-400">Format Templates:</p>
                          </div>
                          <button
                            v-for="template in bnTemplates"
                            :key="template.id"
                            type="button"
                            class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-slate-600 text-[10px] text-gray-900 dark:text-gray-100 flex flex-col"
                            @click="selectBNTemplate(template)"
                          >
                            <span class="font-medium">{{ template.format }}</span>
                            <span class="text-[9px] text-gray-500 dark:text-gray-400">{{ template.description }}</span>
                          </button>
                        </div>
                        
                        <!-- Clear Option -->
                        <div class="border-t border-gray-200 dark:border-gray-600 py-1">
                          <button
                            type="button"
                            class="w-full px-3 py-1.5 text-left hover:bg-gray-100 dark:hover:bg-slate-600 text-[10px] text-red-600 dark:text-red-400"
                            @click="clearBusinessNumber"
                          >
                            Clear Business Number
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Head Office Address -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Head Office Address
                    </label>
                    <textarea
                      v-model="headOfficeAddress"
                      rows="2"
                      placeholder="Enter head office address"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] resize-none"
                    ></textarea>
                  </div>

                  <!-- Head Office Phone -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Head Office Phone
                    </label>
                    <input
                      v-model="headOfficePhone"
                      type="text"
                      placeholder="Enter head office phone number"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px]"
                    />
                  </div>

                  <!-- Branch Address 1 -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Branch Address 1 (Optional)
                    </label>
                    <textarea
                      v-model="branchAddress1"
                      rows="2"
                      placeholder="Enter first branch address"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] resize-none"
                    ></textarea>
                  </div>

                  <!-- Branch 1 Phone -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Branch 1 Phone (Optional)
                    </label>
                    <input
                      v-model="branch1Phone"
                      type="text"
                      placeholder="Enter branch 1 phone number"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px]"
                    />
                  </div>

                  <!-- Branch Address 2 -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Branch Address 2 (Optional)
                    </label>
                    <textarea
                      v-model="branchAddress2"
                      rows="2"
                      placeholder="Enter second branch address"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] resize-none"
                    ></textarea>
                  </div>

                  <!-- Branch 2 Phone -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Branch 2 Phone (Optional)
                    </label>
                    <input
                      v-model="branch2Phone"
                      type="text"
                      placeholder="Enter branch 2 phone number"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px]"
                    />
                  </div>

                </div>
              </div>

              <p class="text-[10px] text-blue-700 dark:text-blue-300 mt-2.5 flex items-start gap-1">
                <svg class="w-2.5 h-2.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>These details will appear in the invoice header. Upload a logo image (PNG, JPG) or leave empty.</span>
              </p>
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
import { defineComponent, ref, computed, watch, onMounted } from 'vue';
import LogoCropper from '@/components/LogoCropper.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'GenerateInvoicePage',
  components: { 
    LogoCropper
  },
  setup() {
    const router = useRouter();
    const authenticatedMember = ref(null);
    
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
    const taxEnabled = ref(true); // Tax column enable/disable toggle
    const showPageNumbers = ref(false); // Show page/copy numbers toggle
    
    // Multiple pages/copies functionality
    const totalCopies = ref(1);
    const currentPage = ref(1);
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    const logoInput = ref(null);

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

    onMounted(() => {
      const memberData = localStorage.getItem('authenticatedMember');
      if (memberData) {
        authenticatedMember.value = JSON.parse(memberData);
      }

      // Load saved form data if any
      const savedFormData = localStorage.getItem('generateInvoiceFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          if (formData.organizationName !== undefined) organizationName.value = formData.organizationName;
          if (formData.organizationSubName !== undefined) organizationSubName.value = formData.organizationSubName;
          if (formData.businessNumber !== undefined) businessNumber.value = formData.businessNumber;
          if (formData.headOfficeAddress !== undefined) headOfficeAddress.value = formData.headOfficeAddress;
          if (formData.headOfficePhone !== undefined) headOfficePhone.value = formData.headOfficePhone;
          if (formData.branchAddress1 !== undefined) branchAddress1.value = formData.branchAddress1;
          if (formData.branch1Phone !== undefined) branch1Phone.value = formData.branch1Phone;
          if (formData.branchAddress2 !== undefined) branchAddress2.value = formData.branchAddress2;
          if (formData.branch2Phone !== undefined) branch2Phone.value = formData.branch2Phone;
          if (formData.logoDataUrl !== undefined) logoDataUrl.value = formData.logoDataUrl;
          if (formData.taxEnabled !== undefined) taxEnabled.value = formData.taxEnabled;
          if (formData.showPageNumbers !== undefined) showPageNumbers.value = formData.showPageNumbers;
          if (formData.totalCopies !== undefined) totalCopies.value = formData.totalCopies;
          if (formData.currentPage !== undefined) currentPage.value = formData.currentPage;
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }
    });
    
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
    
    // Watch for changes in showPageNumbers to auto-save
    watch(showPageNumbers, () => {
      saveFormData();
    });

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
        taxEnabled: taxEnabled.value,
        showPageNumbers: showPageNumbers.value,
        totalCopies: totalCopies.value,
        currentPage: currentPage.value
      };
      
      localStorage.setItem('generateInvoiceFormData', JSON.stringify(formData));
    };

    const handlePreviewClick = () => {
      // Save form data
      saveFormData();
      
      // Save preview data for invoice preview page
      const previewData = {
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
        taxEnabled: taxEnabled.value,
        totalCopies: totalCopies.value,
        currentPage: currentPage.value,
        showPageNumbers: showPageNumbers.value,
        formMode: 'generate'
      };
      
      localStorage.setItem('invoicePreviewData', JSON.stringify(previewData));
      
      // Navigate to Classic Professional preview page
      router.push('/invoice-template/classic-professional/preview');
    };

    const handleRefreshForm = () => {
      if (confirm('Are you sure you want to clear all form data and start fresh?')) {
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
        
        localStorage.removeItem('generateInvoiceFormData');
        
        alert('✅ Form cleared successfully!');
        try { router.go(0); } catch (e) { window.location.reload(); }
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

    return {
      authenticatedMember,
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
      // Methods
      handleLogoUpload,
      handleCroppedImage,
      handleCropperClose,
      handlePreviewClick,
      handleRefreshForm,
      saveFormData
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
