<template>
  <div>
    <!--Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @close="handleCropperClose"
      @crop="handleCroppedImage"
    />

    <div class="h-screen overflow-y-auto flex flex-col gap-2 items-center bg-slate-100 dark:bg-slate-900 pt-6 pb-24 px-3">
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
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Generate for Customer
              </h1>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Complete invoice with customer & item details</p>
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
          </div>

          <!-- Summary Display -->
          <div class="bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-700">
            <div class="flex items-center gap-2.5 text-[10px]">
              <div>
                <span class="text-slate-600 dark:text-slate-400">Subtotal:</span>
                <span class="font-bold text-slate-900 dark:text-white ml-1">{{ toCurrency(subtotal) }}</span>
              </div>
              <div v-if="taxEnabled">
                <span class="text-slate-600 dark:text-slate-400">Tax:</span>
                <span class="font-bold text-emerald-600 ml-1">{{ toCurrency(taxAmount) }}</span>
              </div>
              <div class="pl-2.5 border-l border-emerald-300 dark:border-emerald-700">
                <span class="text-slate-600 dark:text-slate-400">Total:</span>
                <span class="font-bold text-xs text-emerald-700 dark:text-emerald-400 ml-1">{{ toCurrency(grandTotal) }}</span>
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
                📝 Generate for Customer Quick Fill Form
              </h2>
            </div>
            
            <!-- Refresh Button -->
            <button
              @click="handleRefreshForm"
              class="flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-medium rounded-lg transition-colors shadow-sm"
              title="Clear form and start fresh"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>
          
          <p class="text-xs text-slate-600 dark:text-slate-300 mb-3">
            Fill out this form to automatically populate the invoice with all details
          </p>
          
          <div class="space-y-4">
            
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
                    <input
                      ref="logoInput"
                      type="file"
                      accept="image/*"
                      @change="handleLogoUpload"
                      class="hidden"
                    />

                    <div
                      @click="$refs.logoInput.click()"
                      class="h-20 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 hover:shadow"
                    >
                      <span class="text-[10px] text-slate-500 dark:text-slate-300">
                        Click to upload logo
                      </span>
                    </div>

                    <div
                      v-if="logoDataUrl"
                      class="mt-1.5 p-1.5 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <img
                        :src="logoDataUrl"
                        alt="Organization Logo Preview"
                        class="h-14 w-full object-contain"
                      />
                    </div>
                  </div>
                </div>

                <!-- Organization Info -->
                <div class="md:col-span-2 flex flex-col gap-3">
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

                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Organization Address
                    </label>
                    <textarea
                      v-model="organizationAddress"
                      rows="2"
                      placeholder="Enter organization address"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px] resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Organization Phone
                    </label>
                    <input
                      v-model="organizationPhone"
                      type="text"
                      placeholder="Enter phone number"
                      class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-[10px]"
                    />
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-blue-700 dark:text-blue-300 mt-2.5 flex items-start gap-1">
                <svg class="w-2.5 h-2.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>These details will appear in the invoice header.</span>
              </p>
            </div>

            <!-- Customer Information Section -->
            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h3 class="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-2.5 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer Information
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Name
                  </label>
                  <input
                    v-model="customerName"
                    type="text"
                    placeholder="Enter customer name"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    LPO Number (Optional)
                  </label>
                  <input
                    v-model="lpo"
                    type="text"
                    placeholder="Enter LPO number"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Customer Address
                  </label>
                  <input
                    v-model="customerAddress"
                    type="text"
                    placeholder="Enter customer address"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <!-- Invoice Items Section -->
            <div>
              <div class="flex items-center justify-between mb-2.5">
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Invoice Items
                </label>
                <span class="text-[10px] text-slate-500 dark:text-slate-400">
                  Maximum 12 items
                </span>
              </div>

              <div class="space-y-3 max-h-[350px] overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-slate-700">
                <div 
                  v-for="(item, index) in items" 
                  :key="item.id"
                  class="bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 relative"
                >
                  <button
                    v-if="items.length > 1"
                    @click="removeItem(item.id)"
                    class="absolute top-1.5 right-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    title="Remove item"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-2.5 pr-7">
                    <div>
                      <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Quantity
                      </label>
                      <input
                        v-model.number="item.quantity"
                        type="number"
                        min="0"
                        step="1"
                        placeholder="0"
                        class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div>
                      <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Rate (₦)
                      </label>
                      <input
                        v-model.number="item.price"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div>
                      <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Tax (%)
                      </label>
                      <input
                        v-model.number="item.tax"
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="0.0"
                        class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>

                    <div>
                      <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Amount
                      </label>
                      <div class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-slate-600 text-slate-900 dark:text-white font-semibold text-xs">
                        {{ toCurrency(getItemAmount(item)) }}
                      </div>
                    </div>

                    <div class="md:col-span-4">
                      <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Description
                      </label>
                      <textarea
                        v-model="item.description"
                        placeholder="Enter item description"
                        @keydown.enter.prevent="addItemAfter(index)"
                        rows="2"
                        class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none text-xs"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-1.5">
                <button
                  @click="addItem"
                  :disabled="items.length >= 12"
                  class="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-xs font-medium rounded-md transition-colors"
                  :title="items.length >= 12 ? 'Maximum 12 items allowed' : 'Add new item'"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Item
                </button>
              </div>

              <div class="mt-2.5 bg-gray-50 dark:bg-slate-800 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Subtotal:</span>
                  <span class="text-base font-bold text-slate-900 dark:text-white">{{ toCurrency(subtotal) }}</span>
                </div>
              </div>

              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">
                Press Enter in description field to quickly add a new item.
              </p>
            </div>
  
            <!-- Tax Settings Section -->
            <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-gray-300 dark:border-gray-600">
              <div class="flex items-center gap-5">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox" 
                    v-model="taxEnabled" 
                    class="rounded border-gray-300 cursor-pointer accent-emerald-600"
                  />
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">Enable Tax</span>
                </label>
                
                <div v-if="taxEnabled" class="flex items-center gap-1.5 flex-1">
                  <label class="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Tax Rate (%):
                  </label>
                  <input
                    v-model.number="taxRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    class="w-20 px-2.5 py-1 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                  <span class="text-xs text-slate-600 dark:text-slate-400">
                    (Tax: {{ toCurrency(taxAmount) }})
                  </span>
                </div>
              </div>
            </div>
  
            <!-- Amount in Words Section -->
            <div>
              <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Amount in Words (Auto-generated)
              </label>
              <div class="grid grid-cols-1 gap-1.5">
                <input
                  ref="sumOfInput1"
                  v-model="sumOf"
                  type="text"
                  placeholder="Line 1"
                  @input="handleSumOfOverflow"
                  class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-xs"
                />
                <input
                  ref="sumOfInput2"
                  v-model="sumOf2"
                  type="text"
                  placeholder="Line 2 (overflow)"
                  @input="handleSumOf2Input"
                  class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-xs"
                />
              </div>
              <p class="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                Automatically filled based on total amount
              </p>
            </div>
          </div>
  
          <!-- Preview Button -->
          <div class="mt-3">
            <button
              @click="handlePreviewClick"
              class="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-lg"
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
  name: 'CustomerInvoicePage',
  components: { 
    LogoCropper
  },
  setup() {
    const router = useRouter();
    const authenticatedMember = ref(null);
    
    // Form fields
    const organizationName = ref('');
    const organizationSubName = ref('');
    const organizationAddress = ref('');
    const organizationPhone = ref('');
    const logoDataUrl = ref('');
    const customerName = ref('');
    const customerAddress = ref('');
    const lpo = ref('');
    const taxEnabled = ref(false);
    const taxRate = ref(7.5);
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    
    // Amount in words refs
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const sumOf = ref('');
    const sumOf2 = ref('');
    
    // Items
    const items = ref([
      { id: 1, description: '', quantity: '', price: 0.0, tax: 0.0 },
      { id: 2, description: '', quantity: '', price: 0.0, tax: 0.0 },
      { id: 3, description: '', quantity: '', price: 0.0, tax: 0.0 },
    ]);
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    const logoInput = ref(null);

    // Computed values
    const subtotal = computed(() =>
      items.value.reduce((sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.price) || 0), 0)
    );

    const taxAmount = computed(() => {
      if (!taxEnabled.value) return 0;
      
      return items.value.reduce((sum, it) => {
        const itemTotal = (Number(it.quantity) || 0) * (Number(it.price) || 0);
        const itemTax = itemTotal * ((Number(it.tax) || 0) / 100);
        return sum + itemTax;
      }, 0);
    });

    const grandTotal = computed(() => subtotal.value + taxAmount.value);

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

    // Number to words helper
    function numberToWords(n) {
      if (n === 0) return 'zero';
      const a = [
        '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
        'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
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

    onMounted(() => {
      const memberData = localStorage.getItem('authenticatedMember');
      if (memberData) {
        authenticatedMember.value = JSON.parse(memberData);
      }

      // Load saved form data if any
      const savedFormData = localStorage.getItem('customerInvoiceFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          if (formData.organizationName !== undefined) organizationName.value = formData.organizationName;
          if (formData.organizationSubName !== undefined) organizationSubName.value = formData.organizationSubName;
          if (formData.organizationAddress !== undefined) organizationAddress.value = formData.organizationAddress;
          if (formData.organizationPhone !== undefined) organizationPhone.value = formData.organizationPhone;
          if (formData.logoDataUrl !== undefined) logoDataUrl.value = formData.logoDataUrl;
          if (formData.customerName !== undefined) customerName.value = formData.customerName;
          if (formData.customerAddress !== undefined) customerAddress.value = formData.customerAddress;
          if (formData.lpo !== undefined) lpo.value = formData.lpo;
          if (formData.items !== undefined && formData.items.length > 0) items.value = formData.items;
          if (formData.taxEnabled !== undefined) taxEnabled.value = formData.taxEnabled;
          if (formData.taxRate !== undefined) taxRate.value = formData.taxRate;
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }
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
      saveFormData();
    };
    
    const handleCropperClose = () => {
      showImageCropper.value = false;
      tempImageUrl.value = '';
    };

    const addItem = () => {
      if (items.value.length >= 12) {
        alert('Maximum 12 items allowed');
        return;
      }
      items.value.push({ id: Date.now(), description: '', quantity: '', price: 0, tax: 0 });
    };

    const addItemAfter = (index) => {
      if (items.value.length >= 12) {
        alert('Maximum 12 items allowed');
        return;
      }
      const newItem = { id: Date.now(), description: '', quantity: '', price: 0, tax: 0 };
      items.value.splice(index + 1, 0, newItem);
    };

    const removeItem = (id) => {
      if (items.value.length > 1) {
        items.value = items.value.filter(item => item.id !== id);
      }
    };

    const handleSumOfOverflow = () => {
      if (sumOfInput1.value) {
        const maxLength = 60;
        if (sumOf.value.length > maxLength) {
          const overflow = sumOf.value.substring(maxLength);
          sumOf.value = sumOf.value.substring(0, maxLength);
          sumOf2.value = overflow + sumOf2.value;
        }
      }
    };

    const handleSumOf2Input = () => {
      const maxLength = 80;
      if (sumOf2.value.length > maxLength) {
        sumOf2.value = sumOf2.value.substring(0, maxLength);
      }
    };

    // Watch grandTotal and auto-fill amount in words
    watch(grandTotal, () => {
      const words = amountInWords.value.words;
      sumOf.value = words.substring(0, 60);
      if (words.length > 60) {
        sumOf2.value = words.substring(60);
      } else {
        sumOf2.value = '';
      }
    });

    const saveFormData = () => {
      const formData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        lpo: lpo.value,
        items: items.value,
        taxEnabled: taxEnabled.value,
        taxRate: taxRate.value
      };
      
      localStorage.setItem('customerInvoiceFormData', JSON.stringify(formData));
    };

    // Auto-save on field changes
    watch(
      [
        organizationName, organizationSubName, organizationAddress, organizationPhone,
        logoDataUrl, customerName, customerAddress, lpo, items, taxEnabled, taxRate
      ],
      () => {
        saveFormData();
      },
      { deep: true }
    );

    const handlePreviewClick = () => {
      saveFormData();
      
      // Save preview data
      const previewData = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        lpo: lpo.value,
        items: items.value.filter(item => item.description || item.quantity || item.price),
        taxEnabled: taxEnabled.value,
        taxRate: taxRate.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        formMode: 'customer'
      };
      
      localStorage.setItem('invoicePreviewData', JSON.stringify(previewData));
      
      router.push({ name: 'InvoicePreview' });
    };

    const handleRefreshForm = () => {
      if (confirm('Are you sure you want to clear all form data and start fresh?')) {
        organizationName.value = '';
        organizationSubName.value = '';
        organizationAddress.value = '';
        organizationPhone.value = '';
        logoDataUrl.value = '';
        customerName.value = '';
        customerAddress.value = '';
        lpo.value = '';
        items.value = [
          { id: 1, description: '', quantity: '', price: 0.0, tax: 0.0 },
          { id: 2, description: '', quantity: '', price: 0.0, tax: 0.0 },
          { id: 3, description: '', quantity: '', price: 0.0, tax: 0.0 },
        ];
        taxEnabled.value = false;
        taxRate.value = 7.5;
        
        localStorage.removeItem('customerInvoiceFormData');
        
        alert('✅ Form cleared successfully!');
        try { router.go(0); } catch (e) { window.location.reload(); }
      }
    };

    return {
      authenticatedMember,
      organizationName,
      organizationSubName,
      organizationAddress,
      organizationPhone,
      logoDataUrl,
      customerName,
      customerAddress,
      lpo,
      taxEnabled,
      taxRate,
      autoReceiptNumber,
      autoDate,
      items,
      subtotal,
      taxAmount,
      grandTotal,
      sumOfInput1,
      sumOfInput2,
      sumOf,
      sumOf2,
      showImageCropper,
      tempImageUrl,
      logoInput,
      handleLogoUpload,
      handleCroppedImage,
      handleCropperClose,
      handlePreviewClick,
      handleRefreshForm,
      addItem,
      addItemAfter,
      removeItem,
      getItemAmount,
      toCurrency,
      handleSumOfOverflow,
      handleSumOf2Input
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
