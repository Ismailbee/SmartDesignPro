<template>
  <div class="relative min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
    <!-- Header Bar -->
    <div class="bg-white dark:bg-slate-800 shadow-sm px-2 py-1.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <button
          @click="handleBack"
          class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
          title="Go Back"
        >
          <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 class="text-sm font-bold text-slate-900 dark:text-white">Receipt Preview</h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Receipt #{{ receiptData.receiptNumber }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Zoom Controls -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
          <button
            @click="zoomOut"
            :disabled="zoomLevel <= 0.5"
            class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom Out"
          >
            <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>
          
          <span class="text-[10px] font-medium text-slate-700 dark:text-slate-300 min-w-[2rem] text-center">
            {{ Math.round(zoomLevel * 100) }}%
          </span>
          
          <button
            @click="zoomIn"
            :disabled="zoomLevel >= 2"
            class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Zoom In"
          >
            <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
            </svg>
          </button>
          
          <button
            @click="resetZoom"
            class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
            title="Reset Zoom"
          >
            <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <!-- Export Buttons -->
        <div class="flex gap-1.5">
          <button
            class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
            :disabled="isExporting"
            @click="handleExportPDF"
          >
            📄 Export PDF
          </button>
          <button
            class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
            :disabled="isExporting"
            @click="handleExportJPEG"
          >
            🖼️ Export JPEG
          </button>
          <button
            class="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
            :disabled="isExporting"
            @click="handleSaveReceipt"
          >
            💾 Save Receipt
          </button>
        </div>
      </div>
    </div>

    <!-- Receipt Preview Section - always visible on all screen sizes -->
    <section 
      class="w-full flex items-center justify-center pb-[30vh] pt-[2vh]"
    >
      <!-- Mobile wrapper - scales down on mobile, full size on desktop -->
      <div 
        ref="mobileWrapperRef"
        class="w-full flex items-center justify-center" 
        :style="{ 
          transform: isExporting ? 'none' : (isMobile ? `scale(${mobileScale * zoomLevel})` : `scale(${zoomLevel})`), 
          transformOrigin: 'top center'
        }"
      >
        <div
          ref="receiptOuterRef"
          id="receipt-canvas"
          :class="[
            'relative bg-white p-2 flex flex-col',
            isExporting ? 'mx-0' : 'shadow-2xl mx-auto'
          ]"
          :style="{ 
            ...receiptDimensions, 
            borderColor: colorStyles.borderColor,
            overflow: isExporting ? 'hidden' : 'visible'
          }"
        >
          <!-- Content Wrapper -->
          <div ref="receiptRef" class="receipt-content-wrapper flex flex-col justify-between h-full w-full p-2">
            <!-- Header -->
            <div class="text-center flex-shrink-0">
              <div class="flex items-start">
                <!-- Logo (Fixed - Developer Only) -->
                <div v-if="logoDataUrl" class="">
                  <img 
                    :src="logoDataUrl" 
                    alt="Logo" 
                    :style="{ 
                      height: '130px',
                      width: 'auto',
                      objectFit: 'contain',
                      filter: colorStyles.logoFilter
                    }"
                  />
                </div>
                
                <!-- Organization Name (Now Editable by Users) -->
                <div class="max-w-[600px] mx-auto">
                  <div>
                    <h2
                      v-if="organizationName || !isExporting"
                      :class="[
                        'ml-4 md:text-3xl font-bold text-center',
                        organizationName === '' ? 'text-gray-400' : ''
                      ]"
                      :style="{
                        fontFamily: 'Arial Narrow, Roboto Condensed, Oswald, sans-serif',
                        fontWeight: 900,
                        letterSpacing: '-0.5px',
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        color: organizationName ? colorStyles.headerBg : '#9ca3af'
                      }"
                    >
                      {{ organizationName || 'Enter organization name' }}
                    </h2>
                  </div>
                  <div>
                    <!-- Subtitle (Now Editable by Users) -->
                    <p
                      v-if="organizationSubName || !isExporting"
                      :class="[
                        'text-md text-center mt-[-5px]',
                        organizationSubName === '' ? 'text-gray-400' : ''
                      ]"
                      :style="{
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        color: organizationSubName ? colorStyles.borderColor : '#9ca3af'
                      }"
                    >
                      {{ organizationSubName || 'Enter organization subtitle' }}
                    </p>
                    <!-- Address -->
                    <p
                      v-if="organizationAddress || !isExporting"
                      :class="[
                        'text-xs text-center',
                        organizationAddress === '' ? 'text-gray-400' : ''
                      ]"
                      :style="{
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        color: organizationAddress ? colorStyles.borderColor : '#9ca3af'
                      }"
                    >
                      <strong> Address: </strong> {{ organizationAddress || 'Enter organization address' }}
                    </p>
                    <!-- Phone (Now Editable by Users) -->
                    <p
                      v-if="organizationPhone || !isExporting"
                      :class="[
                        'text-xs text-center font-bold',
                        organizationPhone === '' ? 'text-gray-400' : ''
                      ]"
                      :style="{
                        wordWrap: 'break-word',
                        wordBreak: 'break-word',
                        whiteSpace: 'normal',
                        color: organizationPhone ? colorStyles.borderColor : '#9ca3af'
                      }"
                    >
                      Tel: {{ organizationPhone || 'Enter phone number' }}
                    </p>
                  </div>
                </div>
              </div>


              <!-- Receipt Title -->
              <p 
                class="text-lg font-bold uppercase text-white inline-block px-3 rounded"
                :style="{ backgroundColor: colorStyles.headerBg }"
              >
                CASH RECEIPT
              </p>
            </div>

            <!-- Body -->
            <div class="text-sm flex-grow flex flex-col justify-between gap-4">
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
                  class="flex-1 bg-transparent border-b border-dotted focus:outline-none"
                  :style="{ borderColor: colorStyles.borderColor }"
                />
              </div>

              <div class="flex items-center gap-1">
                <span>The Sum of:</span>
                <input
                  ref="sumOfInput1"
                  v-model="sumOf"
                  @input="handleSumOfOverflow"
                  class="flex-1 bg-transparent border-b border-dotted focus:outline-none"
                  :style="{ borderColor: colorStyles.borderColor }"
                />
              </div>

              <div class="flex items-center gap-2">
                <input
                  ref="sumOfInput2"
                  v-model="sumOf2"
                  type="text"
                  @input="handleSumOf2Input"
                  class="flex-1 bg-transparent border-b border-dotted focus:outline-none"
                  :style="{ borderColor: colorStyles.borderColor }"
                />
                <span>Naira</span>
                <div 
                  class="w-16 bg-transparent border-b border-dotted flex items-center justify-center text-center"
                  :style="{ borderColor: colorStyles.borderColor }"
                >
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
                  class="flex-1 bg-transparent border-b border-dotted focus:outline-none"
                  :style="{ borderColor: colorStyles.borderColor }"
                />
              </div>

              <!-- Additional line for payment description -->
              <div class="flex items-center gap-2">
                <input
                  ref="paymentForInput2"
                  v-model="paymentFor2"
                  @input="handlePaymentFor2Input"
                  class="flex-1 bg-transparent border-b border-dotted focus:outline-none"
                  :style="{ borderColor: colorStyles.borderColor }"
                />
              </div>
              
              <div class="flex justify-between items-start flex-shrink-0">
               
                <!-- Signature 1 -->
                <div class="flex flex-col items-center gap-1 mt-[-15px]">
                  <!-- Signature 1 Image -->
                  <div v-if="signatureImage1">
                    <img :src="signatureImage1" alt="Signature 1" class="h-16 w-auto object-contain max-w-[150px]" />
                  </div>

                  <div 
                    v-else 
                    class="mb-1 h-16 w-24 border border-dashed flex items-center justify-center text-[9px]"
                    :style="{ borderColor: colorStyles.borderColor, color: colorStyles.borderColor }"
                  >
                    No signature
                  </div>

                  <div 
                    class="w-full border-t text-center mt-[-20px]"
                    :style="{ borderColor: colorStyles.borderColor }"
                  >
                    <p class="italic text-[10px]">Signature</p>
                  </div> 
                </div>

                <!-- Amount in figures -->
                <div class="flex flex-col items-center mt-3">
                  <div 
                    class="border-2 p-2 py-2 bg-yellow-50 min-w-[100px] md:min-w-[200px]"
                    :style="{ borderColor: colorStyles.borderColor }"
                  >
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

                  <div 
                    v-else 
                    class="mb-1 h-16 w-24 border border-dashed flex items-center justify-center text-[9px]"
                    :style="{ borderColor: colorStyles.borderColor, color: colorStyles.borderColor }"
                  >
                    No signature
                  </div>

                  <div 
                    class="w-full border-t text-center mt-[-20px]"
                    :style="{ borderColor: colorStyles.borderColor }"
                  >
                    <p class="italic text-[10px]">Signature</p>
                  </div> 
                </div>
              </div>
            </div>

            <!-- Hidden checkboxes for auto date -->
            <div class="hidden">
              <input type="checkbox" v-model="autoDate" @change="syncDate" />
            </div>
          </div> <!-- end content wrapper / receiptRef -->
        </div> <!-- end receipt outer container -->
      </div> <!-- end mobile wrapper -->
    </section>

    <!-- Settings Panel - Slides up from bottom, always visible -->
    <Transition name="slide-up">
      <div 
        v-if="showSettings"
        class="absolute left-0 right-0 bottom-0 z-50"
      >
        <div class="bg-white dark:bg-slate-800 w-full max-h-[55vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 dark:border-slate-700">
          <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              Size Settings
            </h3>
            <button
              class="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              @click="showSettings = false"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-2">
            <!-- Size Settings Section -->
            <div class="flex items-center justify-center gap-2">
              <!-- Width Input -->
              <div class="flex items-center gap-1">
                <label class="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Width
                </label>
                <input
                  v-model.number="receiptWidth"
                  type="number"
                  min="3"
                  max="20"
                  step="0.1"
                  class="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              
              <!-- Separator -->
              <span class="text-slate-400 text-xs">×</span>
              
              <!-- Height Input -->
              <div class="flex items-center gap-1">
                <label class="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Height
                </label>
                <input
                  v-model.number="receiptHeight"
                  type="number"
                  min="3"
                  max="20"
                  step="0.1"
                  class="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <!-- CMYK Color Settings & Digital Signatures Section -->
            <div class="mt-2 p-2 bg-gradient-to-br from-orange-50 to-purple-50 dark:from-orange-900/20 dark:to-purple-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
              <!-- CMYK Color Settings -->
              <h3 class="text-xs font-semibold text-orange-900 dark:text-orange-300 mb-2 flex items-center gap-1">
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                CMYK Color Settings
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <!-- Color Mode Selection -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Color Mode
                  </label>
                  <select
                    v-model="colorMode"
                    class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    @change="handleColorModeChange"
                  >
                    <option value="full-color">Full Color (4 Colors - CMYK)</option>
                    <option value="three-color">Three Color (CMY)</option>
                    <option value="two-color">Two Color (Custom)</option>
                    <option value="one-color">One Color (Black/Custom)</option>
                  </select>
                </div>

                <!-- Color Preview -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Color Preview
                  </label>
                  <div class="flex items-center gap-1 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700">
                    <div v-if="colorMode === 'full-color'" class="flex gap-0.5">
                      <div class="w-4 h-4 bg-cyan-500 rounded border" title="Cyan"></div>
                      <div class="w-4 h-4 bg-magenta-500 rounded border" title="Magenta"></div>
                      <div class="w-4 h-4 bg-yellow-400 rounded border" title="Yellow"></div>
                      <div class="w-4 h-4 bg-black rounded border" title="Black"></div>
                    </div>
                    <div v-else-if="colorMode === 'three-color'" class="flex gap-0.5">
                      <div class="w-4 h-4 bg-cyan-500 rounded border" title="Cyan"></div>
                      <div class="w-4 h-4 bg-magenta-500 rounded border" title="Magenta"></div>
                      <div class="w-4 h-4 bg-yellow-400 rounded border" title="Yellow"></div>
                    </div>
                    <div v-else-if="colorMode === 'two-color'" class="flex gap-0.5">
                      <div 
                        :style="{ backgroundColor: cmykToRgbCss(customColor1CMYK.c, customColor1CMYK.m, customColor1CMYK.y, customColor1CMYK.k) }"
                        class="w-4 h-4 rounded border"
                        title="Primary Color"
                      ></div>
                      <div 
                        :style="{ backgroundColor: cmykToRgbCss(customColor2CMYK.c, customColor2CMYK.m, customColor2CMYK.y, customColor2CMYK.k) }"
                        class="w-4 h-4 rounded border"
                        title="Secondary Color"
                      ></div>
                    </div>
                    <div v-else-if="colorMode === 'one-color'" class="flex gap-0.5">
                      <div 
                        :style="{ backgroundColor: cmykToRgbCss(customColor1CMYK.c, customColor1CMYK.m, customColor1CMYK.y, customColor1CMYK.k) }"
                        class="w-4 h-4 rounded border"
                        title="Primary Color"
                      ></div>
                    </div>
                    <span class="text-[10px] text-slate-600 dark:text-slate-400 ml-1">
                      {{ getColorModeDescription() }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- CMYK Sliders for Custom Colors -->
              <div v-if="colorMode === 'two-color' || colorMode === 'one-color'" class="mt-2 space-y-1">
                <div class="text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Adjust Primary Color (CMYK)
                </div>
                <div class="space-y-1">
                  <div class="flex items-center gap-1">
                    <label class="w-16 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Cyan:</label>
                    <input v-model.number="customColor1CMYK.c" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.c }}%</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <label class="w-16 text-[10px] text-pink-600 dark:text-pink-400 font-medium">Magenta:</label>
                    <input v-model.number="customColor1CMYK.m" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.m }}%</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <label class="w-16 text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">Yellow:</label>
                    <input v-model.number="customColor1CMYK.y" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.y }}%</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <label class="w-16 text-[10px] text-slate-800 dark:text-slate-300 font-medium">Black (K):</label>
                    <input v-model.number="customColor1CMYK.k" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.k }}%</span>
                  </div>
                </div>

                <div v-if="colorMode === 'two-color'" class="mt-2">
                  <div class="text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Adjust Secondary Color (CMYK)
                  </div>
                  <div class="space-y-1">
                    <div class="flex items-center gap-1">
                      <label class="w-16 text-[10px] text-cyan-600 dark:text-cyan-400 font-medium">Cyan:</label>
                      <input v-model.number="customColor2CMYK.c" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.c }}%</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <label class="w-16 text-[10px] text-pink-600 dark:text-pink-400 font-medium">Magenta:</label>
                      <input v-model.number="customColor2CMYK.m" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.m }}%</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <label class="w-16 text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">Yellow:</label>
                      <input v-model.number="customColor2CMYK.y" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.y }}%</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <label class="w-16 text-[10px] text-slate-800 dark:text-slate-300 font-medium">Black (K):</label>
                      <input v-model.number="customColor2CMYK.k" type="range" min="0" max="100" class="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-8 text-[10px] text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.k }}%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Digital Signatures -->
              <div class="pt-3 border-t border-orange-200 dark:border-purple-700">
                <div class="flex items-center justify-between mb-2">
                  <h3 class="text-xs font-semibold text-purple-900 dark:text-purple-300 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Digital Signatures
                  </h3>
                  <button
                    class="text-[10px] px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium transition-colors flex items-center gap-0.5"
                    @click="handleCreateSignature"
                  >
                    <svg class="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create New
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <!-- Signature 1 Selector -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Signature 1 (Left)
                    </label>
                    <select
                      v-model="selectedSignature1"
                      class="w-full px-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      @change="handleSignature1Change"
                    >
                      <option value="">No signature</option>
                      <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">
                        {{ sig.name }}{{ sig.isPrimary ? ' (Primary)' : '' }}
                      </option>
                    </select>
                    
                    <!-- Preview Signature 1 -->
                    <div v-if="signatureImage1" class="mt-1 p-1 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600">
                      <img :src="signatureImage1" alt="Signature 1 Preview" class="h-8 w-full object-contain" />
                    </div>
                  </div>

                  <!-- Signature 2 Selector -->
                  <div>
                    <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Signature 2 (Right)
                    </label>
                    <select
                      v-model="selectedSignature2"
                      class="w-full px-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      @change="handleSignature2Change"
                    >
                      <option value="">No signature</option>
                      <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">
                        {{ sig.name }}{{ sig.isPrimary ? ' (Primary)' : '' }}
                      </option>
                    </select>
                    
                    <!-- Preview Signature 2 -->
                    <div v-if="signatureImage2" class="mt-1 p-1 bg-white dark:bg-slate-800 rounded border border-gray-200 dark:border-gray-600">
                      <img :src="signatureImage2" alt="Signature 2 Preview" class="h-8 w-full object-contain" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Bottom Toggle Button -->
    <div 
      v-if="!showSettings"
      class="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg z-40"
    >
      <button
        class="w-full py-2 text-white font-semibold text-xs text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
        @click="showSettings = !showSettings"
      >
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
        </svg>
        Show Settings
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import html2pdf from 'html2pdf.js';
import * as htmlToImage from 'html-to-image';
import { getAllSignatures } from '@/firebase/database';

export default defineComponent({
  name: 'ReceiptPreviewPage',
  setup() {
    const router = useRouter();
    const receiptRef = ref(null);
    const receiptOuterRef = ref(null);
    const mobileWrapperRef = ref(null);
    const isExporting = ref(false);
    
    // Panel visibility - open by default
    const showSettings = ref(true);
    
    // Receipt data loaded from localStorage
    const receiptData = ref({
      organizationName: '',
      organizationSubName: '',
      organizationAddress: '',
      organizationPhone: '',
      logoDataUrl: '',
      receiptNumber: '',
      date: '',
      receivedFrom: '',
      naira: 0,
      kobo: 0,
      sumOf: '',
      sumOf2: '',
      paymentFor: '',
      paymentFor2: ''
    });
    
    // Size settings
    const receiptWidth = ref(5.827);
    const receiptHeight = ref(8.268);
    const isMobile = ref(false);
    const mobileScale = ref(1);
    
    // Zoom controls
    const zoomLevel = ref(1);
    
    const zoomIn = () => {
      if (zoomLevel.value < 2) {
        zoomLevel.value = Math.min(2, zoomLevel.value + 0.1);
      }
    };
    
    const zoomOut = () => {
      if (zoomLevel.value > 0.5) {
        zoomLevel.value = Math.max(0.5, zoomLevel.value - 0.1);
      }
    };
    
    const resetZoom = () => {
      zoomLevel.value = 1;
    };
    
    // Color settings
    const colorMode = ref('full-color');
    const customColor1CMYK = ref({ c: 0, m: 0, y: 0, k: 100 });
    const customColor2CMYK = ref({ c: 100, m: 50, y: 0, k: 0 });
    
    // Editable fields
    const logoDataUrl = ref('');
    const organizationName = ref('');
    const organizationSubName = ref('');
    const organizationAddress = ref('');
    const organizationPhone = ref('');
    const receiptNumber = ref('');
    const autoReceiptNumber = ref(true);
    const date = ref('');
    const autoDate = ref(true);
    const receivedFrom = ref('');
    const naira = ref(0);
    const kobo = ref(0);
    const sumOf = ref('');
    const sumOf2 = ref('');
    const paymentFor = ref('');
    const paymentFor2 = ref('');
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const paymentForInput1 = ref(null);
    const paymentForInput2 = ref(null);
    const signatureImage1 = ref('');
    const signatureImage2 = ref('');
    
    // Signature management
    const savedSignatures = ref([]);
    const selectedSignature1 = ref('');
    const selectedSignature2 = ref('');
    
    // Load receipt data from localStorage
    onMounted(() => {
      const savedData = localStorage.getItem('receiptPreviewData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        receiptData.value = { ...receiptData.value, ...parsed };
        
        // Load size and color settings
        if (parsed.receiptWidth) receiptWidth.value = parsed.receiptWidth;
        if (parsed.receiptHeight) receiptHeight.value = parsed.receiptHeight;
        if (parsed.colorMode) colorMode.value = parsed.colorMode;
        
        // Populate editable fields
        logoDataUrl.value = parsed.logoDataUrl || '';
        organizationName.value = parsed.organizationName || '';
        organizationSubName.value = parsed.organizationSubName || '';
        organizationAddress.value = parsed.organizationAddress || '';
        organizationPhone.value = parsed.organizationPhone || '';
        receiptNumber.value = parsed.receiptNumber || '';
        date.value = parsed.date || '';
        receivedFrom.value = parsed.receivedFrom || '';
        naira.value = parsed.naira || 0;
        kobo.value = parsed.kobo || 0;
        sumOf.value = parsed.sumOf || '';
        sumOf2.value = parsed.sumOf2 || '';
        paymentFor.value = parsed.paymentFor || '';
        paymentFor2.value = parsed.paymentFor2 || '';
        
        // Load signature selections and images
        selectedSignature1.value = parsed.selectedSignature1 || '';
        selectedSignature2.value = parsed.selectedSignature2 || '';
        signatureImage1.value = parsed.signatureImage1 || '';
        signatureImage2.value = parsed.signatureImage2 || '';
        
        // Load CMYK colors if available
        if (parsed.customColor1CMYK) {
          customColor1CMYK.value = parsed.customColor1CMYK;
        }
        if (parsed.customColor2CMYK) {
          customColor2CMYK.value = parsed.customColor2CMYK;
        }
      }
      
      // Load signatures
      loadSignatures();
      
      // Check if mobile
      isMobile.value = window.innerWidth < 768;
      calculateMobileScale();
      
      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 768;
        calculateMobileScale();
      });
    });
    
    // Auto-save changes to localStorage when user edits fields
    watch(
      [
        organizationName, organizationSubName, organizationAddress, organizationPhone,
        receiptNumber, date, receivedFrom, naira, kobo, sumOf, sumOf2,
        paymentFor, paymentFor2, receiptWidth, receiptHeight, colorMode,
        customColor1CMYK, customColor2CMYK, selectedSignature1, selectedSignature2
      ],
      () => {
        const receiptToSave = {
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
        
        localStorage.setItem('receiptPreviewData', JSON.stringify(receiptToSave));
        
        const receiptFormData = {
          ...receiptToSave,
          autoReceiptNumber: autoReceiptNumber.value,
          autoDate: autoDate.value
        };
        localStorage.setItem('receiptFormData', JSON.stringify(receiptFormData));
      },
      { deep: true }
    );
    
    // Calculate mobile scale
    const calculateMobileScale = () => {
      if (isMobile.value) {
        const screenWidth = window.innerWidth - 32;
        const receiptWidthPx = receiptWidth.value * 96;
        mobileScale.value = Math.min(screenWidth / receiptWidthPx, 1);
      } else {
        mobileScale.value = 1;
      }
    };
    
    // Receipt dimensions
    const receiptDimensions = computed(() => ({
      width: `${receiptWidth.value}in`,
      height: `${receiptHeight.value}in`,
      minHeight: `${receiptHeight.value}in`,
      minWidth: `${receiptWidth.value}in`
    }));
    
    // CMYK to RGB conversion
    const cmykToRgb = (c, m, y, k) => {
      const cNorm = c / 100;
      const mNorm = m / 100;
      const yNorm = y / 100;
      const kNorm = k / 100;
      const r = 255 * (1 - cNorm) * (1 - kNorm);
      const g = 255 * (1 - mNorm) * (1 - kNorm);
      const b = 255 * (1 - yNorm) * (1 - kNorm);
      return { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    };

    const cmykToRgbCss = (c, m, y, k) => {
      const rgb = cmykToRgb(c, m, y, k);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    };
    
    const cmykToHex = (cmyk) => {
      const rgb = cmykToRgb(cmyk.c, cmyk.m, cmyk.y, cmyk.k);
      const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
    };
    
    // Color styles based on mode
    const colorStyles = computed(() => {
      const styles = {};
      const color1Hex = cmykToHex(customColor1CMYK.value);
      const color2Hex = cmykToHex(customColor2CMYK.value);
      
      switch (colorMode.value) {
        case 'full-color':
          styles.headerBg = '#1e40af';
          styles.borderColor = '#e2e8f0';
          styles.logoFilter = 'none';
          break;
        case 'three-color':
          styles.headerBg = '#00bcd4';
          styles.borderColor = '#e2e8f0';
          styles.logoFilter = 'sepia(100%) hue-rotate(160deg) saturate(300%)';
          break;
        case 'two-color':
          styles.headerBg = color1Hex;
          styles.borderColor = color1Hex;
          styles.logoFilter = 'sepia(100%) saturate(300%)';
          break;
        case 'one-color':
          styles.headerBg = color1Hex;
          styles.borderColor = color1Hex;
          styles.logoFilter = `grayscale(100%)`;
          break;
        default:
          styles.headerBg = '#1e40af';
          styles.borderColor = '#e2e8f0';
          styles.logoFilter = 'none';
      }
      
      return styles;
    });
    
    // Handle color mode change
    const handleColorModeChange = () => {
      if (colorMode.value === 'one-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 };
      } else if (colorMode.value === 'two-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 };
        customColor2CMYK.value = { c: 100, m: 50, y: 0, k: 0 };
      }
    };
    
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
    
    // Export handlers
    const handleExportPDF = async () => {
      if (!receiptOuterRef.value || isExporting.value) return;
      
      try {
        isExporting.value = true;
        
        // Wait for the transform to be removed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const filename = `Receipt-${receiptData.value.receiptNumber || Date.now()}.pdf`;
        const options = {
          margin: 0,
          filename,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 3, 
            useCORS: true, 
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: receiptOuterRef.value.scrollWidth,
            windowHeight: receiptOuterRef.value.scrollHeight
          },
          jsPDF: { 
            unit: 'in', 
            format: [receiptWidth.value, receiptHeight.value], 
            orientation: 'portrait' 
          },
        };
        
        await html2pdf().set(options).from(receiptOuterRef.value).save();
        alert('✅ Receipt exported as PDF successfully!');
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert(`❌ Failed to export PDF: ${error.message}`);
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleExportJPEG = async () => {
      if (!receiptOuterRef.value || isExporting.value) return;
      
      try {
        isExporting.value = true;
        
        // Wait for the transform to be removed
        await new Promise(resolve => setTimeout(resolve, 50));
        
        const dataUrl = await htmlToImage.toJpeg(receiptOuterRef.value, { 
          quality: 0.98, 
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: '#ffffff',
          width: receiptOuterRef.value.scrollWidth,
          height: receiptOuterRef.value.scrollHeight
        });
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Receipt-${receiptData.value.receiptNumber || Date.now()}.jpg`;
        link.click();
        
        alert('✅ Receipt exported as JPEG successfully!');
      } catch (error) {
        console.error('Error exporting JPEG:', error);
        alert(`❌ Failed to export JPEG: ${error.message}`);
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleSaveReceipt = async () => {
      if (isExporting.value) return;
      
      try {
        isExporting.value = true;
        
        const memberData = localStorage.getItem('authenticatedMember');
        if (!memberData) {
          alert('❌ Please log in to save receipts');
          return;
        }
        
        const member = JSON.parse(memberData);
        if (!member?.branch) {
          alert('❌ Branch information not found');
          return;
        }
        
        const receiptToSave = {
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
        
        // Update localStorage with latest data
        localStorage.setItem('receiptPreviewData', JSON.stringify(receiptToSave));
        
        // Also update form data for when user goes back
        const receiptFormData = {
          ...receiptToSave,
          autoReceiptNumber: autoReceiptNumber.value,
          autoDate: autoDate.value
        };
        localStorage.setItem('receiptFormData', JSON.stringify(receiptFormData));
        
        // Save to Firebase
        const { saveReceipt, saveMemberActivity } = await import('@/firebase/database');
        const result = await saveReceipt(member.branch, receiptToSave);
        
        if (result.success) {
          // Log the save activity
          await saveMemberActivity(member.branch, {
            memberName: member.name,
            action: `Saved Receipt #${receiptNumber.value}`,
            details: `Receipt for ${receivedFrom.value || 'N/A'} - Amount: ₦${naira.value}`,
            timestamp: new Date().toISOString()
          });
          
          alert(`✅ Receipt saved successfully!\n\nReceipt ID: ${result.id}\nReceipt #: ${receiptNumber.value}\nBranch: ${member.branch}`);
          
          // Clear the form data after successful save
          localStorage.removeItem('receiptFormData');
          localStorage.removeItem('receiptPreviewData');
          
          // Navigate back to receipt page
          router.push('/receipt');
        } else {
          alert(`⚠️ Receipt saved locally but Firebase save failed: ${result.error}`);
        }
      } catch (error) {
        console.error('Error saving receipt:', error);
        alert(`❌ Failed to save receipt: ${error.message}`);
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleBack = () => {
      // Save current state before going back
      const receiptToSave = {
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
      
      localStorage.setItem('receiptPreviewData', JSON.stringify(receiptToSave));
      
      const receiptFormData = {
        ...receiptToSave,
        autoReceiptNumber: autoReceiptNumber.value,
        autoDate: autoDate.value
      };
      localStorage.setItem('receiptFormData', JSON.stringify(receiptFormData));
      
      router.back();
    };
    
    const handleSumOfOverflow = () => {
      // Handle text overflow
    };
    
    const handleSumOf2Input = () => {
      // Handle text input
    };
    
    const handlePaymentForOverflow = () => {
      // Handle text overflow
    };
    
    const handlePaymentFor2Input = () => {
      // Handle text input
    };
    
    const syncDate = () => {
      if (autoDate.value) {
        date.value = new Date().toISOString().split('T')[0];
      }
    };
    
    // Load signatures from Firebase
    const loadSignatures = async () => {
      const memberData = localStorage.getItem('authenticatedMember');
      if (!memberData) return;
      
      const member = JSON.parse(memberData);
      if (!member?.branch) return;

      try {
        const result = await getAllSignatures(member.branch);
        if (result.success) {
          savedSignatures.value = result.data;
          
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
      }
    };

    const handleSignature1Change = () => {
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature1.value);
      if (selected) {
        signatureImage1.value = selected.dataURL;
      } else {
        signatureImage1.value = '';
      }
    };

    const handleSignature2Change = () => {
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature2.value);
      if (selected) {
        signatureImage2.value = selected.dataURL;
      } else {
        signatureImage2.value = '';
      }
    };

    const handleCreateSignature = () => {
      localStorage.setItem('signatureReturnPath', '/receipt-preview');
      localStorage.setItem('signatureReturnType', 'receipt');
      router.push('/signature');
    };
    
    return {
      receiptRef,
      receiptOuterRef,
      mobileWrapperRef,
      isExporting,
      receiptData,
      showSettings,
      receiptWidth,
      receiptHeight,
      isMobile,
      mobileScale,
      zoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      colorMode,
      customColor1CMYK,
      customColor2CMYK,
      receiptDimensions,
      colorStyles,
      logoDataUrl,
      organizationName,
      organizationSubName,
      organizationAddress,
      organizationPhone,
      receiptNumber,
      autoReceiptNumber,
      date,
      autoDate,
      receivedFrom,
      naira,
      kobo,
      sumOf,
      sumOf2,
      paymentFor,
      paymentFor2,
      sumOfInput1,
      sumOfInput2,
      paymentForInput1,
      paymentForInput2,
      signatureImage1,
      signatureImage2,
      savedSignatures,
      selectedSignature1,
      selectedSignature2,
      handleColorModeChange,
      getColorModeDescription,
      cmykToRgbCss,
      handleExportPDF,
      handleExportJPEG,
      handleSaveReceipt,
      handleBack,
      handleSumOfOverflow,
      handleSumOf2Input,
      handlePaymentForOverflow,
      handlePaymentFor2Input,
      syncDate,
      loadSignatures,
      handleSignature1Change,
      handleSignature2Change,
      handleCreateSignature
    };
  }
});
</script>

<style scoped>
/* Slide up animation */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-out {
  transform: translateY(100%);
  opacity: 0;
}

.receipt-content-wrapper {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
  color-adjust: exact;
}
</style>
