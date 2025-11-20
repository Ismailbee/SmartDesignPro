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

      <!-- Smart Text Input Section -->
      <section class="w-full max-w-4xl">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-1.5">
              <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 class="text-base font-semibold text-slate-900 dark:text-white">
                🧠 Smart Text Parser - Quick Fill Invoice
              </h2>
            </div>
            
            <!-- Help & Refresh Buttons -->
            <div class="flex gap-2">
              <button
                class="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-medium rounded-lg transition-colors shadow-sm"
                title="Show formatting guide"
                @click="showFormatGuide = !showFormatGuide"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Guide</span>
              </button>
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

          <!-- AI-Enhanced Format Guide (Collapsible) -->
          <div v-if="showFormatGuide" class="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
            <h3 class="text-xs font-semibold text-purple-900 dark:text-purple-300 mb-2 flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              🤖 AI-Powered Text Parser Guide
            </h3>
            
            <!-- AI Benefits Banner -->
            <div class="mb-3 p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded border border-emerald-300 dark:border-emerald-700">
              <p class="text-[10px] text-emerald-800 dark:text-emerald-300 flex items-start gap-1">
                <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span><strong>NEW:</strong> AI automatically detects organization details without special formatting! Just paste natural text and watch the magic happen.</span>
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px]">
              <!-- AI Features Column -->
              <div class="space-y-2">
                <div class="p-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded border border-blue-200 dark:border-blue-700">
                  <strong class="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    AI Smart Detection:
                  </strong>
                  <ul class="text-gray-600 dark:text-gray-400 mt-1 space-y-0.5 text-[9px]">
                    <li>• Automatically finds company names</li>
                    <li>• Detects addresses without keywords</li>
                    <li>• Identifies phone numbers in any format</li>
                    <li>• Extracts emails and websites</li>
                    <li>• Works with messy, unformatted text</li>
                  </ul>
                </div>
                
                <div class="p-2 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded border border-green-200 dark:border-green-700">
                  <strong class="text-green-700 dark:text-green-400">✨ Natural Text Examples:</strong>
                  <p class="text-gray-600 dark:text-gray-400 mt-1 text-[8px] font-mono leading-tight">
                    ABC Corp is located at 123 Main Street<br>
                    Call us: (555) 123-4567<br>
                    Our tagline: Innovation First<br>
                    Email: info@abc.com<br><br>
                    <span class="text-green-600 dark:text-green-400 font-semibold">✅ AI will extract everything!</span>
                  </p>
                </div>
              </div>
              
              <!-- Fallback Format Column -->
              <div class="space-y-2">
                <div class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-orange-700 dark:text-orange-400">📋 Structured Format (Optional):</strong>
                  <p class="text-gray-600 dark:text-gray-400 mt-1 text-[9px]">For maximum accuracy, you can still use:</p>
                  <ul class="text-gray-600 dark:text-gray-400 mt-1 space-y-0.5 text-[8px] font-mono">
                    <li>(Company Name) - for organization</li>
                    <li>"Tagline" - for subtitle</li>
                    <li>Address: your address</li>
                    <li>Phone: your number</li>
                  </ul>
                </div>
                
                <div class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-indigo-700 dark:text-indigo-400">🔄 Hybrid Example:</strong>
                  <p class="text-gray-600 dark:text-gray-400 mt-1 text-[8px] font-mono leading-tight">
                    (TechSolutions Inc)<br>
                    "Innovation at its Best"<br>
                    Located at 456 Tech Park<br>
                    You can reach us at +1-800-TECH<br>
                    Visit: www.techsolutions.com
                  </p>
                </div>
              </div>
            </div>
            
            <!-- AI Status Indicator -->
            <div class="mt-3 p-2 rounded border" :class="parsedData.parseMethod === 'manual_required' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700' : 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700'">
              <p class="text-[10px] flex items-start gap-1" :class="parsedData.parseMethod === 'manual_required' ? 'text-yellow-800 dark:text-yellow-300' : 'text-blue-800 dark:text-blue-300'">
                <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="parsedData.parseMethod === 'manual_required'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span v-if="parsedData.parseMethod === 'manual_required'"><strong>🤖 AI-First Mode:</strong> System will attempt AI parsing first. If unavailable, manual symbol formatting will be required. <a href="#" class="underline text-yellow-900 dark:text-yellow-200" @click.prevent="showFormatGuide = true">See setup guide</a> for AI configuration.</span>
                <span v-else><strong>🚀 AI-Powered:</strong> Advanced natural language processing will automatically extract organization details from any business text. Manual formatting available as backup.</span>
              </p>
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

          <!-- BN/RC Number (kept separate) -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              📋 BN/RC Number
            </label>
            <input
              v-model="businessNumber"
              type="text"
              placeholder="Enter business registration number (BN/RC)"
              class="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>

            <!-- Smart Text Input -->
          <div class="space-y-3">
            <div class="flex items-center justify-between mb-2">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300">
                🧠 Smart Text Input - Paste or Type Your Organization Details
              </label>
              
              <!-- AI Status & Manual Toggle -->
              <div class="flex items-center gap-2">
                <div v-if="parsedData.isLoading" class="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                  <svg class="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{{ parsedData.loadingMessage || 'Processing...' }}</span>
                </div>
                
                <button 
                  v-if="parsedData.parseMethod === 'manual_required' || parsedData.parseMethod === 'error'"
                  @click="showManualGuide = !showManualGuide"
                  class="flex items-center gap-1 px-2 py-1 bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs rounded-lg transition-colors"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Manual Mode
                </button>
              </div>
            </div>
            
            <div>
              <textarea
                v-model="smartTextInput"
                rows="8"
                class="w-full px-3 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-mono resize-none transition-all"
                :class="{ 
                  'border-red-500 focus:ring-red-500 focus:border-red-500': validationErrors.length > 0,
                  'border-blue-500 focus:ring-blue-500 focus:border-blue-500': parsedData.isLoading
                }"
                :placeholder="parsedData.parseMethod === 'manual_required' ? manualInputPlaceholder : smartInputPlaceholder"
                @input="parseSmartText"
                @paste="handlePaste"
              ></textarea>
            </div>            <!-- AI Status & Manual Fallback Messages -->
            <div v-if="validationErrors.length > 0" class="p-3 rounded-lg border" :class="parsedData.parseMethod === 'manual_required' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'">
              <h4 class="text-sm font-semibold mb-2 flex items-center gap-1" :class="parsedData.parseMethod === 'manual_required' ? 'text-orange-800 dark:text-orange-300' : 'text-red-800 dark:text-red-300'">
                <svg v-if="parsedData.parseMethod === 'manual_required'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ parsedData.parseMethod === 'manual_required' ? 'Manual Formatting Mode' : 'AI Parsing Status' }}
              </h4>
              <ul class="space-y-1">
                <li v-for="error in validationErrors" :key="error" class="text-[11px] flex items-start gap-1" :class="parsedData.parseMethod === 'manual_required' ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'">
                  <span class="mt-0.5" :class="parsedData.parseMethod === 'manual_required' ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400'">•</span>
                  <span>{{ error }}</span>
                </li>
              </ul>
            </div>
            
            <!-- Quick Manual Guide -->
            <div v-if="showManualGuide && parsedData.parseMethod === 'manual_required'" class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h4 class="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Quick Manual Formatting Guide
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px]">
                <div class="space-y-1">
                  <div class="font-medium text-blue-700 dark:text-blue-400">Format Rules:</div>
                  <div class="text-gray-600 dark:text-gray-400 font-mono">(Company Name) - Organization</div>
                  <div class="text-gray-600 dark:text-gray-400 font-mono">"Tagline" - Subtitle</div>
                  <div class="text-gray-600 dark:text-gray-400 font-mono">Address: your address</div>
                  <div class="text-gray-600 dark:text-gray-400 font-mono">Phone: your number</div>
                </div>
                <div class="space-y-1">
                  <div class="font-medium text-blue-700 dark:text-blue-400">Example:</div>
                  <div class="text-gray-600 dark:text-gray-400 font-mono text-[9px]">(ABC Corp)<br>"Innovation First"<br>Address: 123 Main St<br>Phone: 555-1234</div>
                </div>
              </div>
            </div>

            <!-- AI-Enhanced Parsed Data Preview -->
            <div 
              v-if="parsedData.organizationName || parsedData.subtitle || parsedData.addresses.length > 0 || parsedData.phones.length > 0" 
              class="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700"
            >
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-sm font-semibold text-green-800 dark:text-green-300 flex items-center gap-1">
                  <svg v-if="parsedData.parseMethod === 'ai'" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ parsedData.parseMethod === 'ai' ? '🤖 AI-Detected Information' : '📋 Parsed Information Preview' }}
                </h4>
                
                <!-- Confidence Badge -->
                <div v-if="parsedData.confidence" class="flex items-center gap-1">
                  <span 
                    class="text-[9px] px-2 py-0.5 rounded-full font-medium"
                    :class="{
                      'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300': parsedData.confidence === 'high',
                      'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300': parsedData.confidence === 'medium',
                      'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300': parsedData.confidence === 'low'
                    }"
                  >
                    {{ parsedData.confidence === 'high' ? '✨ High Confidence' : parsedData.confidence === 'medium' ? '⚡ Medium Confidence' : '⚠️ Low Confidence' }}
                  </span>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div v-if="parsedData.organizationName" class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-green-700 dark:text-green-400">Organization:</strong>
                  <p class="text-gray-700 dark:text-gray-300 mt-1">{{ parsedData.organizationName }}</p>
                </div>
                <div v-if="parsedData.subtitle" class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-blue-700 dark:text-blue-400">Subtitle:</strong>
                  <p class="text-gray-700 dark:text-gray-300 mt-1">{{ parsedData.subtitle }}</p>
                </div>
                <div v-for="(address, index) in parsedData.addresses" :key="'addr-' + index" class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-orange-700 dark:text-orange-400">
                    {{ index === 0 ? 'Head Office Address:' : `Branch ${index} Address:` }}
                  </strong>
                  <p class="text-gray-700 dark:text-gray-300 mt-1">{{ address }}</p>
                </div>
                <div v-for="(phone, index) in parsedData.phones" :key="'phone-' + index" class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-red-700 dark:text-red-400">Phone {{ index + 1 }}:</strong>
                  <p class="text-gray-700 dark:text-gray-300 mt-1 font-bold">{{ phone }}</p>
                </div>
                
                <!-- AI-detected emails -->
                <div v-for="(email, index) in parsedData.emails" :key="'email-' + index" class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-purple-700 dark:text-purple-400">Email {{ index + 1 }}:</strong>
                  <p class="text-gray-700 dark:text-gray-300 mt-1">{{ email }}</p>
                </div>
                
                <!-- AI-detected websites -->
                <div v-for="(website, index) in parsedData.websites" :key="'website-' + index" class="p-2 bg-white dark:bg-slate-800 rounded border">
                  <strong class="text-cyan-700 dark:text-cyan-400">Website {{ index + 1 }}:</strong>
                  <p class="text-gray-700 dark:text-gray-300 mt-1">{{ website }}</p>
                </div>
              </div>
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
import { defineComponent, ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import LogoCropper from '@/components/LogoCropper.vue';
import { useRouter } from 'vue-router';
import { aiTextParser } from '@/utils/aiTextParser.js';

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

    // Smart Text Parser Variables
    const smartTextInput = ref('');
    const showFormatGuide = ref(false);
    const showManualGuide = ref(false);
    const validationErrors = ref([]);
    const parsedData = ref({
      organizationName: '',
      subtitle: '',
      addresses: [],
      phones: [],
      parseMethod: 'none'
    });

    // AI-enhanced smart input placeholder text
    const smartInputPlaceholder = `🤖 AI-POWERED TEXT PARSER - Just paste your organization details naturally!

NATURAL TEXT EXAMPLE:
TechCorp Solutions is a leading software company based at 123 Innovation Drive, Silicon Valley, CA 94025. Our mission is "Transforming Ideas into Reality". You can reach us at (555) 123-TECH or email us at hello@techcorp.com. Visit our website at www.techcorp.com for more information.

STRUCTURED FORMAT (OPTIONAL):
(ABC Company Limited)
"Your Trusted Business Partner"
Address: 123 Main Street, Downtown, City, State 12345
Phone: +1-555-123-4567
Contact: info@company.com

✨ AI FEATURES:
• Automatically detects company names without brackets
• Finds addresses without "Address:" labels
• Identifies phone numbers in any format
• Extracts emails and websites automatically
• Works with messy, unformatted business cards/documents
• Falls back to structured parsing if needed

Just paste any business text and watch the AI magic! 🎯`;

    // Manual mode placeholder when AI fails
    const manualInputPlaceholder = `📝 MANUAL MODE - Use Symbol-Based Formatting

AI parsing is unavailable. Please format your text using these symbols:

ORGANIZATION: (Your Company Name)
SUBTITLE: "Your Business Tagline"
ADDRESS: Address: 123 Main Street, City, State
PHONE: Phone: +1-555-123-4567
EMAIL: Contact: info@company.com

EXAMPLE:
(TechCorp Solutions)
"Innovation at its Best"
Address: 456 Tech Park, Silicon Valley
Phone: (555) 123-TECH
Contact: hello@techcorp.com

💡 Tip: Each item should be on a separate line for best results.`;
    
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
          if (formData.smartTextInput !== undefined) {
            smartTextInput.value = formData.smartTextInput;
            // Trigger parsing of the loaded smart text
            nextTick(() => {
              parseSmartText();
            });
          }
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }

      // Save data when the user is about to leave the page
      window.addEventListener('beforeunload', saveFormData);
    });

    // Cleanup event listener when component is unmounted
    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', saveFormData);
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

    // Watch all form fields for changes and auto-save
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
      taxEnabled,
      smartTextInput
    ], () => {
      saveFormData();
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
        currentPage: currentPage.value,
        smartTextInput: smartTextInput.value
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
        
        // Clear smart text parser
        smartTextInput.value = '';
        validationErrors.value = [];
        parsedData.value = { organizationName: '', subtitle: '', addresses: [], phones: [] };
        
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

    // AI-First Smart Text Parser Methods
    const parseSmartText = async () => {
      const text = smartTextInput.value.trim();
      if (!text) {
        parsedData.value = { organizationName: '', subtitle: '', addresses: [], phones: [], parseMethod: 'none' };
        validationErrors.value = [];
        return;
      }

      validationErrors.value = [];
      
      // Show loading state with AI indicator
      parsedData.value = { 
        ...parsedData.value, 
        isLoading: true, 
        parseMethod: 'loading',
        loadingMessage: '🤖 AI is analyzing your text...' 
      };
      
      try {
        // Always try AI first
        const result = await aiTextParser.parseOrganizationText(text);
        
        // Handle AI parsing results
        if (result.method === 'ai' && result.confidence === 'high') {
          // AI successfully parsed - no additional validation needed
          validationErrors.value = [];
        } else if (result.method === 'regex' || result.confidence === 'low') {
          // AI failed - provide helpful suggestions for manual formatting
          validationErrors.value = [];
          if (!result.organizationName && text.length > 0) {
            validationErrors.value.push('🤖 AI couldn\'t detect organization name clearly. For better results, try: (Your Company Name)');
          }
          if (!result.subtitle && text.includes('"')) {
            validationErrors.value.push('💡 For better subtitle detection, use: "Your Tagline Here"');
          }
          if (result.addresses.length === 0 && text.length > 20) {
            validationErrors.value.push('📍 To help AI find addresses, try starting with "Address:" or "Located at:"');
          }
        }

        // Auto-assign to form fields
        if (result.organizationName) {
          organizationName.value = result.organizationName;
        }
        
        if (result.subtitle) {
          organizationSubName.value = result.subtitle;
        }

        if (result.addresses && result.addresses.length > 0) {
          headOfficeAddress.value = result.addresses[0];
          if (result.addresses.length > 1) {
            branchAddress1.value = result.addresses[1];
          }
          if (result.addresses.length > 2) {
            branchAddress2.value = result.addresses[2];
          }
        }

        if (result.phones && result.phones.length > 0) {
          headOfficePhone.value = result.phones[0];
          if (result.phones.length > 1) {
            branch1Phone.value = result.phones[1];
          }
          if (result.phones.length > 2) {
            branch2Phone.value = result.phones[2];
          }
        }

        // Store the enhanced result with AI metadata
        parsedData.value = {
          ...result,
          isLoading: false,
          parseMethod: result.method,
          confidence: result.confidence,
          emails: result.emails || [],
          websites: result.websites || []
        };

        saveFormData();
        
        // AI parsing completed successfully

      } catch (error) {
        console.error('AI parsing failed:', error);
        
        // Only fallback to regex if it's a configuration issue
        if (error.message.includes('No AI service configured')) {
          validationErrors.value = [];
          validationErrors.value.push('⚡ AI parsing requires setup. Using manual detection mode.');
          validationErrors.value.push('💡 For automatic parsing, add a free API key (see AI_SETUP_GUIDE.md)');
          validationErrors.value.push('📝 For now, use manual formatting: (Company Name), "Tagline", Address: your address');
          
          // Try basic regex as last resort
          const result = parseWithBasicRegex(text);
          parsedData.value = { 
            ...result, 
            isLoading: false, 
            parseMethod: 'manual_required', 
            confidence: 'low',
            manualMode: true 
          };
        } else {
          // Network or API error - show retry option
          validationErrors.value.push('🔄 AI service temporarily unavailable. Check your internet connection.');
          validationErrors.value.push('🔁 Try again in a moment, or use manual formatting as backup.');
          
          parsedData.value = { 
            ...parsedData.value, 
            isLoading: false, 
            parseMethod: 'error', 
            confidence: 'low',
            error: error.message 
          };
        }
        saveFormData();
      }
    };

    // Basic regex fallback function
    const parseWithBasicRegex = (text) => {
      const result = { organizationName: '', subtitle: '', addresses: [], phones: [] };

      // Parse organization name (wrapped in brackets)
      const orgNameMatch = text.match(/\(([^)]+)\)/);
      if (orgNameMatch) {
        result.organizationName = orgNameMatch[1].trim();
        organizationName.value = result.organizationName;
      }

      // Parse subtitle (wrapped in quotes)
      const subtitleMatch = text.match(/"([^"]+)"/);
      if (subtitleMatch) {
        result.subtitle = subtitleMatch[1].trim();
        organizationSubName.value = result.subtitle;
      }

      // Parse addresses
      const addressRegex = /(?:^|\n)([^\n]*(?:address|Address):\s*([^\n]+))/gim;
      let addressMatch;
      while ((addressMatch = addressRegex.exec(text)) !== null) {
        const addressPart = addressMatch[2].trim();
        if (addressPart) {
          result.addresses.push(addressPart);
        }
      }

      // Parse phone numbers
      const phoneRegex = /(?:^|\n)([^\n]*(?:phone|tel|contact|call):\s*([^\n]+))/gim;
      let phoneMatch;
      while ((phoneMatch = phoneRegex.exec(text)) !== null) {
        const phonePart = phoneMatch[2].trim();
        if (phonePart) {
          result.phones.push(phonePart);
        }
      }

      return result;
    };

    const handlePaste = (_event) => {
      // Allow default paste behavior, then parse after a short delay
      setTimeout(() => {
        parseSmartText();
      }, 100);
    };

    // Navigation functions
    const viewSavedInvoices = () => {
      router.push('/invoices/saved');
    };

    const createNewInvoice = () => {
      if (confirm('Are you sure you want to start a new invoice? Any unsaved changes will be lost.')) {
        // Clear form data
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
        
        // Clear smart text parser
        smartTextInput.value = '';
        validationErrors.value = [];
        parsedData.value = { organizationName: '', subtitle: '', addresses: [], phones: [] };
        
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
      // Smart Text Parser
      smartTextInput,
      showFormatGuide,
      showManualGuide,
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
      viewSavedInvoices,
      createNewInvoice
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
