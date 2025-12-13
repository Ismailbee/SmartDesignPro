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
      :documents="savedInvoices"
      :loading="loadingInvoices"
      document-type="Invoice"
      @close="showHistoryModal = false"
      @load="handleLoadInvoice"
      @delete="handleDeleteInvoice"
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Invoice
              <span v-if="currentInvoiceId" class="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full font-medium">
                Editing #{{ receiptNumber }}
              </span>
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400">Create and manage your invoices</p>
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
              <span class="text-slate-600 dark:text-slate-400">Subtotal:</span>
              <span class="font-bold text-slate-900 dark:text-white ml-1.5">{{ toCurrency(subtotal) }}</span>
            </div>
            <div v-if="taxEnabled">
              <span class="text-slate-600 dark:text-slate-400">Tax:</span>
              <span class="font-bold text-emerald-600 ml-1.5">{{ toCurrency(taxAmount) }}</span>
            </div>
            <div class="pl-3 border-l border-emerald-300 dark:border-emerald-700">
              <span class="text-slate-600 dark:text-slate-400">Total:</span>
              <span class="font-bold text-sm text-emerald-700 dark:text-emerald-400 ml-1.5">{{ toCurrency(grandTotal) }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

        <!-- Flex Container for Form and Preview -->
    <div class="w-full max-w-7xl flex flex-col gap-6 items-center">

      <!-- Quick Fill Form Section -->
      <section class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <svg class="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
                📝 {{ formMode === 'generate' ? 'Generate Invoice Quick Fill Form' : 'Generate for Customer Quick Fill Form' }}
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
            {{ formMode === 'generate' ? 'Set up your organization details' : 'Fill out this form to automatically populate the invoice below' }}
          </p>
          
          <div class="space-y-6">
            
            <!-- Organization Settings Section -->
            <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
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

      <!-- Clickable White Box -->
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
        Organization Subtitle/Tagline (Optional)
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
                <span>These details will appear in the invoice header. Upload a logo image (PNG, JPG) or leave empty.</span>
              </p>
            </div>

            <!-- Customer Information Section -->
            <div v-if="formMode === 'customer'" class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h3 class="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Customer Name -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    v-model="customerName"
                    type="text"
                    placeholder="Enter customer name"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <!-- LPO Number -->
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    LPO Number (Optional)
                  </label>
                  <input
                    v-model="lpo"
                    type="text"
                    placeholder="Enter LPO number"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <!-- Customer Address -->
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Address
                  </label>
                  <input
                    v-model="customerAddress"
                    type="text"
                    placeholder="Enter customer address"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <!-- Invoice Items Section -->
            <div v-if="formMode === 'customer'">
              <div class="flex items-center justify-between mb-3">
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Invoice Items
                </label>
                <span class="text-xs text-slate-500 dark:text-slate-400">
                  Maximum {{ MAX_ITEMS }} items ({{ invoiceHeight }}" height)
                </span>
              </div>

              <!-- Items List -->
              <div class="space-y-4 max-h-[400px] overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                <div 
                  v-for="(item, index) in items" 
                  :key="item.id"
                  class="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-gray-600 relative"
                >
                  <!-- Delete Button -->
                  <button
                    v-if="items.length > 1"
                    @click="removeItem(item.id)"
                    class="absolute top-2 right-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Remove item"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-3 pr-8">
                    <!-- Quantity -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Rate -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Rate (₦)
                      </label>
                      <input
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Tax -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tax (%)
                      </label>
                      <input
                        v-model.number="item.tax"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>

                    <!-- Calculated Amount (Read-only) -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Amount
                      </label>
                      <div class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-slate-600 text-slate-900 dark:text-white font-semibold">
                        {{ toCurrency(getItemAmount(item)) }}
                      </div>
                    </div>

                    <!-- Description -->
                    <div class="md:col-span-4">
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        v-model="item.description"
                        placeholder="Enter item description"
                        @keydown.enter.prevent="addItemAfter(index)"
                        rows="2"
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                        @input="autoResize"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

               <div class=" mt-2">
                <button
                     @click="addItem"
                     :disabled="items.length >= MAX_ITEMS"
                     class="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
                     :title="items.length >= MAX_ITEMS ? `Maximum ${MAX_ITEMS} items allowed` : 'Add new item'"
                   >
                     <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                     </svg>
                     Add Item
                </button>
              </div>

              <!-- Subtotal Display -->
              <div class="mt-3 bg-gray-50 dark:bg-slate-800 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Subtotal:</span>
                  <span class="text-lg font-bold text-slate-900 dark:text-white">{{ toCurrency(subtotal) }}</span>
                </div>
              </div>

              <p class="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Press Enter in description field to quickly add a new item.
              </p>
            </div>
  
            <!-- Tax Settings Section -->
            <div v-if="formMode === 'customer'" class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-gray-300 dark:border-gray-600">
              <div class="flex items-center gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  v-model="taxEnabled" 
                  class="rounded border-gray-300 cursor-pointer accent-emerald-600"
                />
                <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Tax</span>
              </label>
              
              <div v-if="taxEnabled" class="flex items-center gap-2 flex-1">
                <label class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Tax Rate (%):
                </label>
                <input
                  v-model.number="taxRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  class="w-24 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
                <span class="text-sm text-slate-600 dark:text-slate-400">
                  (Tax: {{ toCurrency(taxAmount) }})
                </span>
              </div>
            </div>
            </div>
  
            <!-- Amount in Words Section -->
            <div v-if="formMode === 'customer'">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Amount in Words (Auto-generated)
              </label>
              <div class="grid grid-cols-1 gap-2">
                <input
                  ref="sumOfInput1"
                  v-model="sumOf"
                  type="text"
                  placeholder="Line 1"
                  @input="handleSumOfOverflow"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white"
                />
                <input
                  ref="sumOfInput2"
                  v-model="sumOf2"
                  type="text"
                  placeholder="Line 2 (overflow)"
                  @input="handleSumOf2Input"
                  class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white"
                />
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Automatically filled based on total amount
              </p>
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
              <span>Preview Invoice</span>
            </button>
          </div>
        </div>
      </section>

    </div>
  </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import BaseButton from '@/components/BaseButton.vue';
import DocumentHistoryModal from '@/components/DocumentHistoryModal.vue';
import LogoCropper from '@/components/LogoCropper.vue';
import html2pdf from 'html2pdf.js';
import * as htmlToImage from 'html-to-image';
// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
import { useRouter } from 'vue-router';
import { 
  saveInvoice, 
  getAllInvoices, 
  deleteInvoice,
  updateInvoice,
  saveMemberActivity,
  getAllSignatures
} from '@/firebase/database';
import { safeLocalStorage } from '@/utils/storage.utils.ts';

export default defineComponent({
  name: 'MeblinkInvoice',
  components: { 
    BaseButton,
    DocumentHistoryModal,
    LogoCropper
  },
  setup() {
    const router = useRouter();
    const invoiceRef = ref(null);
    const isExporting = ref(false);
    const exportType = ref('');
    const authenticatedMember = ref(null);
    
    // API Base URL
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    // Correction mode state
    const isCorrectionMode = ref(false);
    const originalTransactionData = ref(null);
    
    // Document history state
    const showHistoryModal = ref(false);
    const savedInvoices = ref([]);
    const loadingInvoices = ref(false);
    const currentInvoiceId = ref(null); // Track if we're editing an existing invoice
    const isSaving = ref(false);

    // Load authenticated member info and check for password verification
    onMounted(() => {
      const memberData = localStorage.getItem('authenticatedMember');
      if (memberData) {
        authenticatedMember.value = JSON.parse(memberData);
      }

      // Check for form mode from dashboard selection
      const savedMode = localStorage.getItem('invoiceFormMode');
      if (savedMode) {
        formMode.value = savedMode === 'customer' ? 'customer' : 'generate';
        localStorage.removeItem('invoiceFormMode'); // Clear after reading
      }

      // Load saved form data from localStorage (persists when navigating back from preview)
      const savedFormData = localStorage.getItem('invoiceFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          // Restore all form fields
          if (formData.organizationName !== undefined) organizationName.value = formData.organizationName;
          if (formData.organizationSubName !== undefined) organizationSubName.value = formData.organizationSubName;
          if (formData.organizationAddress !== undefined) organizationAddress.value = formData.organizationAddress;
          if (formData.organizationPhone !== undefined) organizationPhone.value = formData.organizationPhone;
          if (formData.logoDataUrl !== undefined) logoDataUrl.value = formData.logoDataUrl;
          if (formData.receiptNumber !== undefined) receiptNumber.value = formData.receiptNumber;
          if (formData.date !== undefined) date.value = formData.date;
          if (formData.customerName !== undefined) customerName.value = formData.customerName;
          if (formData.customerAddress !== undefined) customerAddress.value = formData.customerAddress;
          if (formData.lpo !== undefined) lpo.value = formData.lpo;
          if (formData.items !== undefined && formData.items.length > 0) items.value = formData.items;
          if (formData.taxEnabled !== undefined) taxEnabled.value = formData.taxEnabled;
          if (formData.taxRate !== undefined) taxRate.value = formData.taxRate;
          if (formData.invoiceWidth !== undefined) invoiceWidth.value = formData.invoiceWidth;
          if (formData.invoiceHeight !== undefined) invoiceHeight.value = formData.invoiceHeight;
          if (formData.colorMode !== undefined) colorMode.value = formData.colorMode;
          if (formData.formMode !== undefined) formMode.value = formData.formMode;
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }

      // Check for pending correction from Stats page
      const pendingCorrection = localStorage.getItem('pendingCorrection');
      if (pendingCorrection) {
        const correctionData = JSON.parse(pendingCorrection);
        
        // Only load if it's an invoice correction
        if (correctionData.type === 'invoice') {
          // Show banner notification
          alert(`📝 Correction Mode: You're correcting Invoice #${correctionData.receiptNumber}\n\nPlease redo the work and click "Confirm Correction" when done.`);
          
          // Store the original transaction ID for later
          currentInvoiceId.value = correctionData.id;
          isCorrectionMode.value = true;
          originalTransactionData.value = correctionData;
        }
      }

      // Calculate mobile scale
      calculateMobileScale();
      
      // Add resize listener for responsive scaling
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

      // Initialize all textareas to auto-resize
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        });
      }, 100);
    });

    // Cleanup resize listener on component unmount
    onBeforeUnmount(() => {
      window.removeEventListener('resize', calculateMobileScale);
    });

    // A5 landscape dimensions in inches (width x height)
    const a5Width = '8.27in';
    const a5Height = '5.83in';

    // Form mode toggle - Default to 'generate' (organization-only) mode
    const formMode = ref('generate'); // 'generate' or 'customer'
    
    // reactive fields
    const organizationName = ref('');
    const organizationSubName = ref('');
    const date = ref(new Date().toISOString().split('T')[0]);
    const autoDate = ref(true);
    const lpo = ref('');
    const receivedFrom = ref('');
    const customerName = ref('');
    const customerAddress = ref('');
    const customerSign = ref('');
    const managerSign = ref('');
    const taxEnabled = ref(false);
    const taxRate = ref(7.5);
    const receiptNumber = ref(1);
    const autoReceiptNumber = ref(true);
    const showPreview = ref(false); // Mobile preview toggle

    // Mobile scaling for invoice preview
    const isMobile = ref(false);
    const mobileScale = ref(1);

    // Invoice size settings
    const invoiceWidth = ref(5.827); // Default A5 landscape width
    const invoiceHeight = ref(8.268); // Default A5 landscape height

    // CMYK Color settings
    const colorMode = ref('full-color'); // Default to full color
    // CMYK values: Cyan, Magenta, Yellow, Key (Black) - each 0-100
    const customColor1CMYK = ref({ c: 0, m: 0, y: 0, k: 100 }); // Black by default
    const customColor2CMYK = ref({ c: 100, m: 50, y: 0, k: 0 }); // Blue by default

    // Convert CMYK (0-100) to RGB (0-255) for display
    const cmykToRgb = (c, m, y, k) => {
      c = c / 100;
      m = m / 100;
      y = y / 100;
      k = k / 100;
      
      const r = 255 * (1 - c) * (1 - k);
      const g = 255 * (1 - m) * (1 - k);
      const b = 255 * (1 - y) * (1 - k);
      
      return {
        r: Math.round(r),
        g: Math.round(g),
        b: Math.round(b)
      };
    };

    // Convert RGB to hex for CSS
    const rgbToHex = (r, g, b) => {
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      }).join('');
    };

    // Get hex color from CMYK
    const cmykToHex = (cmyk) => {
      const rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
      return rgbToHex(rgb.r, rgb.g, rgb.b);
    };

    // Calculate scale for mobile devices
    const calculateMobileScale = () => {
      if (typeof window !== 'undefined') {
        const screenWidth = window.innerWidth;
        isMobile.value = screenWidth < 768; // md breakpoint
        
        if (isMobile.value) {
          // Invoice width uses current invoiceWidth setting
          const invoiceWidthPx = invoiceWidth.value * 96; // Convert inches to pixels at 96dpi
          // Account for padding (4 * 16px on each side = 32px total)
          const availableWidth = screenWidth - 32;
          mobileScale.value = Math.min(availableWidth / invoiceWidthPx, 1);
        } else {
          mobileScale.value = 1;
        }
      }
    };

    // Handle preset size changes
    const handlePresetChange = (event) => {
      const preset = event.target.value;
      switch (preset) {
        case 'a4':
          invoiceWidth.value = 8.27;
          invoiceHeight.value = 11.69;
          break;
        case 'a5':
          invoiceWidth.value = 5.83;
          invoiceHeight.value = 8.27;
          break;
        case 'letter':
          invoiceWidth.value = 8.5;
          invoiceHeight.value = 11;
          break;
        case 'legal':
          invoiceWidth.value = 8.5;
          invoiceHeight.value = 14;
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
      // Reset CMYK colors when changing mode
      if (colorMode.value === 'one-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 }; // Black
      } else if (colorMode.value === 'two-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 }; // Black
        customColor2CMYK.value = { c: 100, m: 50, y: 0, k: 0 }; // Blue
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

    // Computed property for invoice dimensions
    const invoiceDimensions = computed(() => ({
      width: isMobile.value ? '100%' : `${invoiceWidth.value}in`,
      height: `${invoiceHeight.value}in`,
      minHeight: `${invoiceHeight.value}in`,
      minWidth: isMobile.value ? '100%' : `${invoiceWidth.value}in`,
      maxWidth: isMobile.value ? '100%' : `${invoiceWidth.value}in`
    }));

    // Computed property for color styles based on selected color mode
    const colorStyles = computed(() => {
      const styles = {};
      
      // Convert CMYK to hex for CSS
      const color1Hex = cmykToHex(customColor1CMYK.value);
      const color2Hex = cmykToHex(customColor2CMYK.value);
      
      switch (colorMode.value) {
        case 'full-color':
          // Full CMYK - no color restrictions
          styles.headerBg = 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)';
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = '#1e40af';
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = '#3b82f6';
          styles.borderColor = '#e2e8f0';
          styles.organizationTextColor = '#1e40af';
          styles.logoFilter = 'none';
          break;
          
        case 'three-color':
          // CMY (no black) - use cyan, magenta, yellow
          styles.headerBg = 'linear-gradient(135deg, #00bcd4 0%, #ff4081 100%)';
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = '#00bcd4';
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = '#ff4081';
          styles.borderColor = '#e2e8f0';
          styles.organizationTextColor = '#00bcd4';
          styles.logoFilter = 'sepia(100%) hue-rotate(160deg) saturate(300%)';
          break;
          
        case 'two-color':
          // Two custom CMYK colors
          styles.headerBg = `linear-gradient(135deg, ${color1Hex} 0%, ${color2Hex} 100%)`;
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = color2Hex;
          styles.borderColor = color1Hex;
          styles.organizationTextColor = color1Hex;
          styles.logoFilter = `grayscale(100%) sepia(100%) saturate(300%) brightness(0.8)`;
          break;
          
        case 'one-color':
          // Single CMYK color (typically black or custom)
          styles.headerBg = color1Hex;
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = color1Hex;
          styles.borderColor = color1Hex;
          styles.organizationTextColor = color1Hex;
          styles.logoFilter = `grayscale(100%)`;
          break;
      }
      
      return styles;
    });

    // Watch for size changes to recalculate scaling
    watch([invoiceWidth, invoiceHeight], () => {
      calculateMobileScale();
    });

    // Computed property for content scaling based on invoice size
    const contentScale = computed(() => {
      // Base size is 5.827 x 8.268 inches (A5 landscape)
      const baseWidth = 5.827;
      const baseHeight = 8.268;
      
      // Calculate scale factors to fit content within the new dimensions
      const widthScale = invoiceWidth.value / baseWidth;
      const heightScale = invoiceHeight.value / baseHeight;
      
      // Use the smaller scale factor to ensure content fits proportionally
      // Remove the 1.2 cap to allow proper scaling for larger sizes
      return Math.min(widthScale, heightScale);
    });

    // Editable organization details (Users can now change these)
    const organizationAddress = ref('');
    const organizationPhone = ref('');

    // Logo data (Users can upload their own logo)
    const logoDataUrl = ref('/images/ican-logo.png'); // Main org logo
    
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
    const signatureImage1 = ref('/images/signature1.png'); // Signature 1 image path
    const signatureImage2 = ref('/images/signature2.png'); // Signature 2 image path
    
    // Signature management
    const savedSignatures = ref([]);
    const selectedSignature1 = ref('');
    const selectedSignature2 = ref('');
    const loadingSignatures = ref(false);
    
    // Amount in words input refs
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const sumOf = ref('');
    const sumOf2 = ref('');

    const items = ref([
      { id: 1, description: '', quantity: '', price: 0.0, tax: 0.0 },
      { id: 2, description: '', quantity: '', price: 0.0, tax: 0.0 },
      { id: 3, description: '', quantity: '', price: 0.0, tax: 0.0 },
    ]);

    // Dynamic MAX_ITEMS based on invoice height
    const MAX_ITEMS = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        // For 8 inches or more, max 12 items
        return 12;
      } else {
        // For less than 8 inches, reduce proportionally
        // Calculate items: (height / 8) * 12
        const calculatedMax = Math.floor((height / 8) * 12);
        // Ensure at least 3 items minimum
        return Math.max(3, calculatedMax);
      }
    });

    const addItem = () => {
      if (items.value.length >= MAX_ITEMS.value) {
        alert(`Maximum ${MAX_ITEMS.value} items allowed for ${invoiceHeight.value}" height invoice`);
        return;
      }
      items.value.push({ id: Date.now(), description: '', quantity: '', price: 0, tax: 0 });
    };

    const addItemAfter = (index) => {
      if (items.value.length >= MAX_ITEMS.value) {
        alert(`Maximum ${MAX_ITEMS.value} items allowed for ${invoiceHeight.value}" height invoice`);
        return;
      }
      const newItem = { id: Date.now(), description: '', quantity: '', price: 0, tax: 0 };
      items.value.splice(index + 1, 0, newItem);
      // Focus on the new item's description field after a short delay
      setTimeout(() => {
        const inputs = document.querySelectorAll('input[type="text"]');
        if (inputs[index + 1]) {
          inputs[index + 1].focus();
        }
      }, 50);
    };

    const removeItem = (id) => {
      if (items.value.length > 1) {
        items.value = items.value.filter(item => item.id !== id);
      }
    };

    const subtotal = computed(() =>
      items.value.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0)
    );

    const taxAmount = computed(() => {
      if (!taxEnabled.value) return 0;
      
      // Calculate tax from individual item tax percentages
      return items.value.reduce((sum, it) => {
        const itemTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0);
        const itemTax = itemTotal * ((Number(it.tax) || 0) / 100);
        return sum + itemTax;
      }, 0);
    });

    const grandTotal = computed(() => subtotal.value + taxAmount.value);

    // Calculate individual item amount (including tax if enabled)
    const getItemAmount = (item) => {
      const baseAmount = (Number(item.quantity) || 0) * (Number(item.price) || 0);
      if (taxEnabled.value && item.tax) {
        const itemTax = baseAmount * ((Number(item.tax) || 0) / 100);
        return baseAmount + itemTax;
      }
      return baseAmount;
    };

    function toCurrency(value) {
      return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(value || 0);
    }

    // amount in words helper (simple)
    function numberToWords(n) {
      if (n === 0) return 'zero';
      const a = [
        '',
        'one',
        'two',
        'three',
        'four',
        'five',
        'six',
        'seven',
        'eight',
        'nine',
        'ten',
        'eleven',
        'twelve',
        'thirteen',
        'fourteen',
        'fifteen',
        'sixteen',
        'seventeen',
        'eighteen',
        'nineteen',
      ];
      const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

      function inWords(num) {
        if (num < 20) return a[num];
        if (num < 100) return b[Math.floor(num / 10)] + (num % 10 ? '-' + a[num % 10] : '');
        if (num < 1000) return a[Math.floor(num / 100)] + ' hundred' + (num % 100 ? ' and ' + inWords(num % 100) : '');
        if (num < 1000000) return inWords(Math.floor(num / 1000)) + ' thousand' + (num % 1000 ? ' ' + inWords(num % 1000) : '');
        return inWords(Math.floor(num / 1000000)) + ' million' + (num % 1000000 ? ' ' + inWords(num % 1000000) : '');
      }
      return inWords(n);
    }

    const amountInWords = computed(() => {
      const total = Math.round((grandTotal.value + Number.EPSILON) * 100) / 100;
      const naira = Math.floor(total);
      const kobo = Math.round((total - naira) * 100);
      const words = `${numberToWords(naira)} naira${kobo ? ' and ' + numberToWords(kobo) + ' kobo' : ''}`;
      return { words: words.replace(/\b\w/g, (s) => s.toUpperCase()), formatted: `${naira} Naira ${kobo} Kobo` };
    });

    // Auto-resize textarea as user types
    const autoResize = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };

    // Handle text overflow from first input to second input
    const handleSumOfOverflow = () => {
      if (sumOfInput1.value) {
        const maxLength = 60; // Approximate character limit for first line
        if (sumOf.value.length > maxLength) {
          const overflow = sumOf.value.substring(maxLength);
          sumOf.value = sumOf.value.substring(0, maxLength);
          sumOf2.value = overflow + sumOf2.value;
        }
      }
    };

    // Handle input for second sum field
    const handleSumOf2Input = () => {
      // Keep it within reasonable bounds
      const maxLength = 80;
      if (sumOf2.value.length > maxLength) {
        sumOf2.value = sumOf2.value.substring(0, maxLength);
      }
    };

    // Watch grandTotal and auto-fill amount in words
    watch(grandTotal, () => {
      const words = amountInWords.value.words;
      // Auto-populate the sum fields
      sumOf.value = words.substring(0, 60);
      if (words.length > 60) {
        sumOf2.value = words.substring(60);
      } else {
        sumOf2.value = '';
      }
    });

    // Watch items to ensure textareas resize properly
    watch(items, () => {
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea');
        textareas.forEach(textarea => {
          if (textarea.value) {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
          }
        });
      }, 50);
    }, { deep: true });

    // Auto-save form data to localStorage whenever any field changes
    watch(
      [
        organizationName, organizationSubName, organizationAddress, organizationPhone,
        logoDataUrl, receiptNumber, date, customerName, customerAddress, lpo,
        items, taxEnabled, taxRate, invoiceWidth, invoiceHeight, colorMode, formMode
      ],
      () => {
        const formData = {
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          organizationAddress: organizationAddress.value,
          organizationPhone: organizationPhone.value,
          logoDataUrl: logoDataUrl.value,
          receiptNumber: receiptNumber.value,
          date: date.value,
          customerName: customerName.value,
          customerAddress: customerAddress.value,
          lpo: lpo.value,
          items: items.value,
          taxEnabled: taxEnabled.value,
          taxRate: taxRate.value,
          invoiceWidth: invoiceWidth.value,
          invoiceHeight: invoiceHeight.value,
          colorMode: colorMode.value,
          formMode: formMode.value
        };
        
        safeLocalStorage.setItem('invoiceFormData', JSON.stringify(formData));
      },
      { deep: true }
    );

    // Auto-generate receipt number when needed
    watch(autoReceiptNumber, async (enabled) => {
      if (enabled) {
        try {
          const response = await fetch(`${API_BASE}/invoice/next-number`);
          if (response.ok) {
            const data = await response.json();
            receiptNumber.value = data.nextNumber || 1;
          }
        } catch (error) {
          console.error('Error fetching next receipt number:', error);
        }
      }
    });

    // Confirm correction handler
    const handleConfirmCorrection = async () => {
      if (!isCorrectionMode.value || !originalTransactionData.value) {
        alert('❌ Not in correction mode');
        return;
      }

      try {
        const branch = authenticatedMember.value?.branch || 'Unknown';
        
        // Prepare corrected data (use same field names as original save)
        const correctedInvoice = {
          receiptNumber: receiptNumber.value,
          invoiceNumber: receiptNumber.value, // For backwards compatibility
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          date: date.value,
          lpo: lpo.value,
          receivedFrom: receivedFrom.value,
          customerName: customerName.value,
          customerAddress: customerAddress.value,
          billTo: customerName.value, // For backwards compatibility
          items: items.value,
          subtotal: subtotal.value,
          taxAmount: taxAmount.value,
          grandTotal: grandTotal.value, // Use grandTotal not total
          total: grandTotal.value, // Keep both for compatibility
          amountInWords: amountInWords.value,
          taxEnabled: taxEnabled.value,
          taxRate: taxRate.value,
          isCorrected: true,
          isMistake: false,
          correctedAt: new Date().toISOString(),
          correctedBy: authenticatedMember.value?.name || 'Unknown',
        };

        // Update in Firebase
        await updateInvoice(branch, originalTransactionData.value.id, correctedInvoice);

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

    // Export handlers
    const handleExportPDF = async () => {
      if (!invoiceRef.value || isExporting.value) return;
      
      const hiddenElements = []; // Declare outside try block for cleanup
      
      try {
        isExporting.value = true;
        exportType.value = 'pdf';
        
        // Use current invoice dimensions for export
        const INVOICE_WIDTH = invoiceWidth.value; // inches
        const INVOICE_HEIGHT = invoiceHeight.value; // inches
        
        // Hide empty placeholder elements temporarily on original element
        const originalElement = invoiceRef.value;
        const textElements = originalElement.querySelectorAll('h2, p');
        
        textElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          if (text.includes('Enter organization name') || 
              text.includes('Enter organization subtitle') || 
              text.includes('Enter organization address') ||
              text.includes('Enter phone number')) {
            hiddenElements.push({ el, originalDisplay: el.style.display });
            el.style.display = 'none';
          }
        });
        
        // Wait for any images to load
        const images = originalElement.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // Continue even if image fails
              setTimeout(resolve, 3000); // Timeout after 3 seconds
            });
          })
        );
        
        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const filename = `ICAN-Invoice-${receiptNumber.value || Date.now()}.pdf`;
        const options = {
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 3, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff'
          },
          jsPDF: { unit: 'in', format: [INVOICE_WIDTH, INVOICE_HEIGHT], orientation: 'portrait' },
        };
        
        // Export using the original element exactly as it appears
        await html2pdf().set(options).from(originalElement).save();
        
        // Restore hidden elements
        hiddenElements.forEach(({ el, originalDisplay }) => {
          el.style.display = originalDisplay;
        });
        
        // Log activity
        logActivity(`Created Invoice #${receiptNumber.value || 'N/A'}`);
        
        alert('✅ Invoice exported as PDF successfully!');
        
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert(`❌ Failed to export PDF: ${error.message}`);
        
        // Restore any hidden elements on error
        hiddenElements?.forEach(({ el, originalDisplay }) => {
          if (el && el.style) {
            el.style.display = originalDisplay || '';
          }
        });
      } finally {
        isExporting.value = false;
        exportType.value = '';
      }
    };

    const handleExportJPEG = async () => {
      if (!invoiceRef.value || isExporting.value) return;
      
      const hiddenElements = []; // Declare outside try block for finally cleanup
      
      try {
        isExporting.value = true;
        exportType.value = 'jpeg';
        
        // Hide empty placeholder elements temporarily
        const originalElement = invoiceRef.value;
        const textElements = originalElement.querySelectorAll('h2, p');
        
        textElements.forEach(el => {
          const text = el.textContent?.trim() || '';
          if (text.includes('Enter organization name') || 
              text.includes('Enter organization subtitle') || 
              text.includes('Enter organization address') ||
              text.includes('Enter phone number')) {
            hiddenElements.push({ el, originalDisplay: el.style.display });
            el.style.display = 'none';
          }
        });
        
        // Wait for any images to load
        const images = originalElement.querySelectorAll('img');
        await Promise.all(
          Array.from(images).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // Continue even if image fails
              setTimeout(resolve, 3000); // Timeout after 3 seconds
            });
          })
        );
        
        // Wait a moment for DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Export using the original element exactly as it appears - no dimension overrides
        const dataUrl = await htmlToImage.toJpeg(originalElement, { 
          quality: 0.98, 
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: '#ffffff'
        });
        
        // Restore hidden elements
        hiddenElements.forEach(({ el, originalDisplay }) => {
          el.style.display = originalDisplay;
        });
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `ICAN-Invoice-${receiptNumber.value || Date.now()}.jpg`;
        link.click();
        
        // Log activity
        logActivity(`Created Invoice #${receiptNumber.value || 'N/A'}`);
        
        alert('✅ Invoice exported as JPEG successfully!');
        
      } catch (error) {
        console.error('Error exporting JPEG:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        alert(`❌ Failed to export JPEG: ${errorMessage}`);
        
        // Restore any hidden elements on error
        hiddenElements?.forEach(({ el, originalDisplay }) => {
          if (el && el.style) {
            el.style.display = originalDisplay || '';
          }
        });
      } finally {
        isExporting.value = false;
        exportType.value = '';
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

    const handlePreviewClick = () => {
      // Save current invoice data to localStorage for preview
      const previewData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        invoiceNumber: receiptNumber.value,
        invoiceDate: date.value,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        lpo: lpo.value,
        customerSign: customerSign.value,
        items: items.value.filter(item => item.description || item.quantity || item.price),
        taxEnabled: taxEnabled.value,
        taxRate: taxRate.value,
        invoiceWidth: invoiceWidth.value,
        invoiceHeight: invoiceHeight.value,
        colorMode: colorMode.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value
      };
      
      safeLocalStorage.setItem('invoicePreviewData', JSON.stringify(previewData));
      
      // Also save complete form data for when user navigates back
      const formData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        receiptNumber: receiptNumber.value,
        date: date.value,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        lpo: lpo.value,
        items: items.value, // Save all items, not just filtered
        taxEnabled: taxEnabled.value,
        taxRate: taxRate.value,
        invoiceWidth: invoiceWidth.value,
        invoiceHeight: invoiceHeight.value,
        colorMode: colorMode.value,
        formMode: formMode.value
      };
      
      safeLocalStorage.setItem('invoiceFormData', JSON.stringify(formData));
      
      // Navigate to preview page
      router.push({ name: 'InvoicePreview' });
    };

    const handleBack = () => {
      router.push('/invoice-dashboard');
    };

    const handleLogout = () => {
      if (confirm('Are you sure you want to logout? You will need to login again to access Invoice and Receipt pages.')) {
        localStorage.removeItem('authenticatedMember');
        
        // Log activity
        if (authenticatedMember.value) {
          const activities = JSON.parse(localStorage.getItem('memberActivities') || '[]');
          activities.unshift({
            id: Date.now(),
            memberName: authenticatedMember.value.name,
            action: 'Logged out',
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString(),
            details: 'Logged out from Invoice page'
          });
          safeLocalStorage.setItem('memberActivities', JSON.stringify(activities));
        }
        
        router.push({ name: 'Dashboard', query: { branch: authenticatedMember.value?.branch || '' } });
      }
    };

    // Save invoice to cloud
    const handleSaveInvoice = async () => {
      if (!authenticatedMember.value?.branch) {
        alert('Branch information not found. Please login again.');
        return;
      }

      // Validate required fields
      if (!customerName.value || items.value.every(item => !item.description)) {
        alert('Please fill in customer name and at least one item before saving.');
        return;
      }

      isSaving.value = true;
      try {
        const invoiceData = {
          receiptNumber: receiptNumber.value,
          date: date.value,
          customerName: customerName.value,
          customerAddress: customerAddress.value,
          lpo: lpo.value,
          items: items.value.filter(item => item.description || item.quantity || item.price),
          subtotal: subtotal.value,
          taxEnabled: taxEnabled.value,
          taxRate: taxRate.value,
          taxAmount: taxAmount.value,
          grandTotal: grandTotal.value,
          organizationName: organizationName.value,
          organizationAddress: organizationAddress.value,
          organizationPhone: organizationPhone.value,
          createdBy: authenticatedMember.value.name,
          status: 'Draft'
        };

        const result = await saveInvoice(
          authenticatedMember.value.branch,
          invoiceData,
          currentInvoiceId.value
        );

        if (result.success) {
          currentInvoiceId.value = result.invoiceId;
          
          // Log activity
          await saveMemberActivity(authenticatedMember.value.branch, {
            memberName: authenticatedMember.value.name,
            action: result.isUpdate ? 'Updated invoice' : 'Created invoice',
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString(),
            details: `Invoice #${receiptNumber.value} - ${customerName.value}`
          });

          logActivity(result.isUpdate ? 'Updated invoice' : 'Created invoice');
          
          alert(result.isUpdate ? '✅ Invoice updated successfully!' : '✅ Invoice saved to cloud successfully!');
        } else {
          alert('❌ Failed to save invoice: ' + result.error);
        }
      } catch (error) {
        console.error('Error saving invoice:', error);
        alert('❌ Error saving invoice. Please try again.');
      } finally {
        isSaving.value = false;
      }
    };

    // Load saved invoices
    const handleViewHistory = async () => {
      if (!authenticatedMember.value?.branch) {
        alert('Branch information not found. Please login again.');
        return;
      }

      loadingInvoices.value = true;
      showHistoryModal.value = true;
      
      try {
        const result = await getAllInvoices(authenticatedMember.value.branch);
        if (result.success) {
          savedInvoices.value = result.data;
        } else {
          alert('Failed to load invoices: ' + result.error);
        }
      } catch (error) {
        console.error('Error loading invoices:', error);
        alert('Error loading invoices. Please try again.');
      } finally {
        loadingInvoices.value = false;
      }
    };

    // Load selected invoice for editing
    const handleLoadInvoice = (invoice) => {
      // Populate form with invoice data
      currentInvoiceId.value = invoice.id;
      receiptNumber.value = invoice.receiptNumber || 1;
      date.value = invoice.date || new Date().toISOString().split('T')[0];
      customerName.value = invoice.customerName || '';
      customerAddress.value = invoice.customerAddress || '';
      lpo.value = invoice.lpo || '';
      taxEnabled.value = invoice.taxEnabled || false;
      taxRate.value = invoice.taxRate || 7.5;
      
      // Load items
      if (invoice.items && invoice.items.length > 0) {
        items.value = invoice.items.map((item, index) => ({
          id: item.id || Date.now() + index,
          description: item.description || '',
          quantity: item.quantity || '',
          price: item.price || 0,
          tax: item.tax || 0
        }));
      }

      // Load organization info if available
      if (invoice.organizationName) organizationName.value = invoice.organizationName;
      if (invoice.organizationAddress) organizationAddress.value = invoice.organizationAddress;
      if (invoice.organizationPhone) organizationPhone.value = invoice.organizationPhone;

      showHistoryModal.value = false;
      
      // Log activity
      logActivity(`Loaded invoice #${invoice.receiptNumber} for editing`);
      
      alert(`✅ Invoice #${invoice.receiptNumber} loaded! You can now edit and save it.`);
    };

    // Delete invoice from cloud
    const handleDeleteInvoice = async (invoice) => {
      if (!authenticatedMember.value?.branch) {
        alert('Branch information not found.');
        return;
      }

      try {
        const result = await deleteInvoice(authenticatedMember.value.branch, invoice.id);
        
        if (result.success) {
          // Remove from local list
          savedInvoices.value = savedInvoices.value.filter(inv => inv.id !== invoice.id);
          
          // Log activity
          await saveMemberActivity(authenticatedMember.value.branch, {
            memberName: authenticatedMember.value.name,
            action: 'Deleted invoice',
            branch: authenticatedMember.value.branch,
            timestamp: new Date().toISOString(),
            details: `Invoice #${invoice.receiptNumber}`
          });

          logActivity(`Deleted invoice #${invoice.receiptNumber}`);
          
          // If we're currently editing this invoice, clear the current ID
          if (currentInvoiceId.value === invoice.id) {
            currentInvoiceId.value = null;
          }
        } else {
          alert('Failed to delete invoice: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice. Please try again.');
      }
    };

    // Create new invoice (clear form)
    const handleNewInvoice = () => {
      if (currentInvoiceId.value) {
        if (!confirm('You are currently editing an invoice. Create a new one? Any unsaved changes will be lost.')) {
          return;
        }
      }
      
      // Clear all fields
      currentInvoiceId.value = null;
      customerName.value = '';
      customerAddress.value = '';
      lpo.value = '';
      items.value = [
        { id: 1, description: '', quantity: '', price: 0.0, tax: 0.0 },
        { id: 2, description: '', quantity: '', price: 0.0, tax: 0.0 },
        { id: 3, description: '', quantity: '', price: 0.0, tax: 0.0 },
      ];
      
      // Auto-increment receipt number if auto is enabled
      if (autoReceiptNumber.value) {
        receiptNumber.value += 1;
      }
      
      logActivity('Started creating new invoice');
    };

    // Refresh form (clear all data and start fresh)
    const handleRefreshForm = () => {
      if (!confirm('Are you sure you want to clear the form? All unsaved data will be lost.')) {
        return;
      }
      
      // Clear all form fields
      currentInvoiceId.value = null;
      customerName.value = '';
      customerAddress.value = '';
      lpo.value = '';
      receivedFrom.value = '';
      customerSign.value = '';
      managerSign.value = '';
      
      // Reset items to default
      items.value = [
        { id: 1, description: '', quantity: '', price: 0.0, tax: 0.0 },
        { id: 2, description: '', quantity: '', price: 0.0, tax: 0.0 },
        { id: 3, description: '', quantity: '', price: 0.0, tax: 0.0 },
      ];
      
      // Clear localStorage
      localStorage.removeItem('invoiceFormData');
      localStorage.removeItem('invoicePreviewData');
      
      // Reset signatures to primary
      const primary = savedSignatures.value.find(sig => sig.isPrimary);
      if (primary) {
        selectedSignature1.value = primary.id;
        selectedSignature2.value = primary.id;
        signatureImage1.value = primary.dataURL;
        signatureImage2.value = primary.dataURL;
      } else {
        selectedSignature1.value = '';
        selectedSignature2.value = '';
        signatureImage1.value = null;
        signatureImage2.value = null;
      }
      
      // Reset sumOf fields
      sumOfInput1.value = '';
      sumOfInput2.value = '';
      
      logActivity('Refreshed form - cleared all data');
      try { router.go(0); } catch (e) { window.location.reload(); }
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
      safeLocalStorage.setItem('signatureReturnPath', '/invoice');
      safeLocalStorage.setItem('signatureReturnType', 'invoice');
      router.push('/signature');
    };

    return {
      invoiceRef,
      isExporting,
      exportType,
      authenticatedMember,
      formMode,
      showPreview,
      isMobile,
      mobileScale,
      a5Width,
      a5Height,
      // Invoice size settings
      invoiceWidth,
      invoiceHeight,
      handlePresetChange,
      invoiceDimensions,
      contentScale,
      organizationName,
      organizationSubName,
      organizationAddress,
      organizationPhone,
      logoDataUrl,
      handleLogoUpload,
      showImageCropper,
      tempImageUrl,
      handleCroppedImage,
      handleCropperClose,
      signatureImage1,
      signatureImage2,
      sumOfInput1,
      sumOfInput2,
      sumOf,
      sumOf2,
      date,
      autoDate,
      lpo,
      receivedFrom,
      customerName,
      customerAddress,
      customerSign,
      managerSign,
      receiptNumber,
      autoReceiptNumber,
      items,
      MAX_ITEMS,
      addItem,
      addItemAfter,
      removeItem,
      autoResize,
      handleSumOfOverflow,
      handleSumOf2Input,
      subtotal,
      taxEnabled,
      taxRate,
      taxAmount,
      grandTotal,
      getItemAmount,
      toCurrency,
      amountInWords,
      handleExportPDF,
      handleExportJPEG,
      handlePreviewClick,
      handleBack,
      handleLogout,
      // Correction mode
      isCorrectionMode,
      handleConfirmCorrection,
      // Document history
      showHistoryModal,
      savedInvoices,
      loadingInvoices,
      currentInvoiceId,
      isSaving,
      handleSaveInvoice,
      handleViewHistory,
      handleLoadInvoice,
      handleDeleteInvoice,
      handleNewInvoice,
      handleRefreshForm,
      // Signature management
      savedSignatures,
      selectedSignature1,
      selectedSignature2,
      loadingSignatures,
      loadSignatures,
      handleSignature1Change,
      handleSignature2Change,
      handleCreateSignature,
      // CMYK Color settings
      colorMode,
      customColor1CMYK,
      customColor2CMYK,
      cmykToRgb,
      rgbToHex,
      cmykToHex,
      handleColorModeChange,
      getColorModeDescription,
      colorStyles,
    };
  },
});
</script>

<style scoped>
/* Invoice content wrapper for responsive scaling */
.invoice-content-wrapper {
  transition: transform 0.3s ease;
  transform-origin: top left;
  width: 100%;
  height: 100%;
  display: flex;
  padding: 0;
  margin: 0;
  overflow: visible;
  box-sizing: border-box;
  flex-direction: column;
}

/* Ensure content fits properly */
#meblink-invoice {
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* Invoice Content Wrapper Styles */
.invoice-content-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transform-origin: top left;
  position: relative;
}

/* Mobile responsive content scaling */
@media (max-width: 768px) {
  .invoice-content-wrapper {
    /* Ensure content scales properly within the mobile wrapper */
    min-width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  
  /* Ensure invoice container fits properly on mobile */
  #meblink-invoice {
    max-width: 100%;
    min-height: auto;
    overflow: hidden;
  }
  
  /* Mobile wrapper should contain scaled content */
  section .w-full.flex.items-center.justify-center.p-4 {
    overflow-x: auto;
    overflow-y: visible;
    justify-content: flex-start;
  }
}

/* Prevent content overflow during scaling */
#meblink-invoice.overflow-hidden {
  overflow: hidden;
}

/* Stylish input fields with elegant fonts */
input.flex-1,
input.w-full {
  font-family: 'Playfair Display', serif;
  font-weight: 500;
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

/* Hide Custom Scrollbar while maintaining scroll functionality */
:deep(*) {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}

:deep(*::-webkit-scrollbar) {
  display: none;
  width: 0px;
}

:deep(*::-webkit-scrollbar-track) {
  display: none;
}

:deep(*::-webkit-scrollbar-thumb) {
  display: none;
}

:deep(*::-webkit-scrollbar-thumb:hover) {
  display: none;
}

:deep(*::-webkit-scrollbar-corner) {
  display: none;
}

/* Enhanced styling for invoice page */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Smooth transitions for all inputs */
input, textarea {
  transition: all 0.2s ease-in-out;
}

/* Textarea auto-sizing and wrapping */
textarea {
  min-height: 1.5rem;
  max-height: 8rem;
  line-height: 1.3;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  padding: 2px 4px;
}

/* Calendar indicator appears only on hover/focus */
input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  transition: opacity 0.2s ease;
}

input[type="date"]:hover::-webkit-calendar-picker-indicator,
input[type="date"]:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
}

/* Compact table rows */
table tbody tr {
  height: auto;
  line-height: 1.2;
}

table tbody td {
  padding-top: 0.125rem;
  padding-bottom: 0.125rem;
}

/* Group hover effect for delete button */
.group:hover {
  position: relative;
}

/* Delete button styling */
.group button {
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.group:hover button {
  transform: translateY(2px);
}

/* Print-friendly styles for when exporting */
@media print {
  body {
    background: white !important;
  }
  
  #meblink-invoice {
    box-shadow: none !important;
    border: none !important;
  }
}

/* Table styling enhancement */
table {
  border-collapse: separate;
  border-spacing: 0;
}

table td,
table th {
  border: 1px solid #e2e8f0;
}

/* Animation for adding items */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

tbody tr {
  animation: slideIn 0.3s ease-out;
}

/* Export-specific styles - Maintain natural layout during export */
#meblink-invoice.exporting {
  overflow: visible !important;
  box-shadow: none !important;
  border: none !important;
}

#meblink-invoice.exporting .invoice-content-wrapper {
  transform: none !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
}

/* Ensure content fits naturally within export dimensions */
#meblink-invoice.exporting * {
  box-sizing: border-box;
}

/* Mobile invoice preview styles - Only apply when NOT exporting */
@media (max-width: 768px) {
  /* Smooth horizontal scroll for invoice preview on mobile */
  section > div.overflow-x-auto {
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;
  }

  /* Add padding to prevent content from touching edges */
  section > div.overflow-x-auto {
    padding: 1rem 0;
  }

  /* Ensure invoice maintains its size on mobile */
  #meblink-invoice:not(.exporting) {
    transform-origin: top left;
  }

  /* Show scroll hint shadow */
  section > div.overflow-x-auto {
    background: 
      linear-gradient(90deg, #fff 0%, transparent 5%),
      linear-gradient(-90deg, #fff 0%, transparent 5%),
      linear-gradient(90deg, rgba(0,0,0,0.1) 0%, transparent 2%),
      linear-gradient(-90deg, rgba(0,0,0,0.1) 0%, transparent 2%);
    background-repeat: no-repeat;
    background-size: 40px 100%, 40px 100%, 10px 100%, 10px 100%;
    background-position: 0 0, 100% 0, 0 0, 100% 0;
    background-attachment: local, local, scroll, scroll;
  }

  /* Reduce all font sizes inside invoice preview on mobile - EXCEPT when exporting */
  #meblink-invoice:not(.exporting) {
    font-size: 0.7rem !important;
  }

  #meblink-invoice:not(.exporting) h2 {
    font-size: 0.65rem !important;
  }

  #meblink-invoice:not(.exporting) p,
  #meblink-invoice:not(.exporting) span,
  #meblink-invoice:not(.exporting) input,
  #meblink-invoice:not(.exporting) textarea {
    font-size: 0.6rem !important;
  }

  #meblink-invoice:not(.exporting) .text-\[14px\] {
    font-size: 0.65rem !important;
  }

  #meblink-invoice:not(.exporting) .text-\[12px\] {
    font-size: 0.6rem !important;
  }

  #meblink-invoice:not(.exporting) .text-\[11px\] {
    font-size: 0.55rem !important;
  }

  #meblink-invoice:not(.exporting) .text-\[10px\] {
    font-size: 0.5rem !important;
  }

  #meblink-invoice:not(.exporting) .text-\[9px\] {
    font-size: 0.45rem !important;
  }

  #meblink-invoice:not(.exporting) .text-xs {
    font-size: 0.55rem !important;
  }

  #meblink-invoice:not(.exporting) .text-sm {
    font-size: 0.65rem !important;
  }

  #meblink-invoice:not(.exporting) .text-base {
    font-size: 0.75rem !important;
  }

  #meblink-invoice:not(.exporting) .text-lg {
    font-size: 0.8rem !important;
  }

  #meblink-invoice:not(.exporting) .text-2xl {
    font-size: 0.9rem !important;
  }

  /* Make logo bigger on mobile - EXCEPT when exporting */
  #meblink-invoice:not(.exporting) img[alt="ICAN Logo"] {
    height: 150px !important;
    max-height: 150px !important;
  }

  /* Adjust table font sizes - EXCEPT when exporting */
  #meblink-invoice:not(.exporting) table thead {
    font-size: 0.5rem !important;
  }

  #meblink-invoice:not(.exporting) table tbody td {
    font-size: 0.55rem !important;
  }

  /* Adjust padding/spacing for mobile - EXCEPT when exporting */
  #meblink-invoice:not(.exporting) {
    padding: 1rem !important;
  }
}

/* Ensure original dimensions are restored when exporting */
#meblink-invoice.exporting {
  width: 5.827in !important;
  height: 8.268in !important;
  padding: 1.5rem !important;
  font-size: 1rem !important;
  transform: none !important;
}

/* Export mode - forces exact dimensions and removes shadows */
#meblink-invoice.exporting {
  width: 5.827in !important;
  height: 8.268in !important;
  min-width: 5.827in !important;
  max-width: 5.827in !important;
  transform: none !important;
  background-color: white !important;
  box-shadow: none !important;
  border: none !important;
  margin: 0 !important;
  padding: 1.5rem !important;
  display: flex !important;
  flex-direction: column !important;
  position: relative !important;
}

/* Ensure all content stays within bounds during export */
#meblink-invoice.exporting * {
  box-sizing: border-box !important;
}

/* Override any mobile styles during export */
#meblink-invoice.exporting {
  font-size: revert !important;
}

/* Logo sizing during export - always desktop size */
#meblink-invoice.exporting img[alt="ICAN Logo"] {
  height: 120px !important;
  max-height: 120px !important;
  width: auto !important;
}

/* Signature images during export - larger size */
#meblink-invoice.exporting img[alt*="Signature"] {
  height: 80px !important;
  max-width: 180px !important;
  width: auto !important;
  object-fit: contain !important;
}

/* Hide textareas and inputs when exporting, show static text with borders */
#meblink-invoice.exporting .no-print {
  display: none !important;
  visibility: hidden !important;
  opacity: 0 !important;
}

#meblink-invoice.exporting .print-only {
  display: block !important;
  border-bottom: 1px dotted #9ca3af !important; /* Add dotted border like inputs */
  padding-bottom: 1px !important; /* Match input padding */
  min-height: 16px !important; /* Ensure consistent height */
}

/* Special styling for table cell print-only divs - ensure borders show on mobile */
#meblink-invoice.exporting td .print-only {
  border-bottom: 1px solid #e5e7eb !important; /* Solid border for table cells */
  padding-bottom: 2px !important;
  min-height: 18px !important; /* Ensure consistent height */
}

/* Ensure table borders are visible during export (mobile and desktop) */
#meblink-invoice.exporting table {
  border-collapse: collapse !important;
}

#meblink-invoice.exporting table td,
#meblink-invoice.exporting table th {
  border: 1px solid #d1d5db !important; /* Gray-300 border for all cells */
}

#meblink-invoice.exporting thead {
  background-color: #1e40af !important; /* Blue-800 background */
  color: white !important;
}

/* Export-specific styles - maintain natural layout and user-defined dimensions */
#meblink-invoice.exporting {
  transform: none !important;
  max-width: none !important;
  max-height: none !important;
  overflow: visible !important;
}

#meblink-invoice.exporting .invoice-content-wrapper {
  transform: none !important;
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
  width: 100% !important;
  height: 100% !important;
  min-height: 100% !important;
  transform-origin: top left !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Ensure content expands to fill available space during export */
#meblink-invoice.exporting {
  font-size: calc(var(--invoice-scale, 1) * 1rem) !important;
}

/* Scale content proportionally based on invoice dimensions */
#meblink-invoice.exporting .text-xs { font-size: calc(var(--invoice-scale, 1) * 0.75rem) !important; }
#meblink-invoice.exporting .text-sm { font-size: calc(var(--invoice-scale, 1) * 0.875rem) !important; }
#meblink-invoice.exporting .text-base { font-size: calc(var(--invoice-scale, 1) * 1rem) !important; }
#meblink-invoice.exporting .text-lg { font-size: calc(var(--invoice-scale, 1) * 1.125rem) !important; }
#meblink-invoice.exporting .text-xl { font-size: calc(var(--invoice-scale, 1) * 1.25rem) !important; }
#meblink-invoice.exporting .text-2xl { font-size: calc(var(--invoice-scale, 1) * 1.5rem) !important; }
#meblink-invoice.exporting .text-3xl { font-size: calc(var(--invoice-scale, 1) * 1.875rem) !important; }

/* Remove focus rings and outlines from inputs/textareas during normal view */
#meblink-invoice:not(.exporting) input:focus,
#meblink-invoice:not(.exporting) textarea:focus {
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2) !important; /* Emerald ring */
  border-color: #10b981 !important;
}

/* Show textareas in normal view, hide static text */
#meblink-invoice:not(.exporting) .print-only {
  display: none !important;
}

#meblink-invoice:not(.exporting) .no-print {
  display: block !important;
}

/* Responsive scaling for large screens */
@media (min-width: 1280px) {
  #meblink-invoice:not(.exporting) {
    transform: scale(1.2);
    transform-origin: top center;
  }
}

@media (min-width: 1536px) {
  #meblink-invoice:not(.exporting) {
    transform: scale(1.4);
    transform-origin: top center;
  }
}
</style>

