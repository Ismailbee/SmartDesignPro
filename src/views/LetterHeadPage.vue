<template>
  <div>
    <!-- Logo Cropper Modal -->
    <LogoCropper
      :is-open="showImageCropper"
      :image-url="tempImageUrl"
      @close="handleCropperClose"
      @crop="handleCroppedImage"
    />

    <div class="h-screen overflow-y-auto flex flex-col gap-6 items-center bg-slate-100 dark:bg-slate-900 pt-8 pb-24 px-4">
      <!-- Member Info Banner -->
      <div v-if="authenticatedMember" class="w-full max-w-4xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-3 rounded-lg shadow-md flex items-center justify-between">
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
        <button
          class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          @click="handleLogout"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>

      <!-- Control Panel Section -->
      <section class="w-full max-w-4xl bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- Title -->
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Letter Head Designer</h1>
              <p class="text-sm text-slate-500 dark:text-slate-400">Create professional letterheads</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 flex-wrap items-center">
            <BaseButton variant="primary" :disabled="isExporting" @click="handleExportPDF">
              📄 Export PDF
            </BaseButton>
            
            <BaseButton variant="secondary" :disabled="isExporting" @click="handleExportJPEG">
              🖼️ Export JPEG
            </BaseButton>

            <div class="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

            <BaseButton variant="ghost" @click="handleBack">
              ← Back to Dashboard
            </BaseButton>
          </div>
        </div>
      </section>

      <!-- Flex Container for Form and Preview -->
      <div class="w-full max-w-7xl flex flex-col lg:flex-row gap-6 items-start">
        <!-- Quick Fill Form Section -->
        <section class="w-full lg:w-1/2">
          <div class="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              📝 Quick Fill Form
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Fill out this form to automatically populate the letterhead below
            </p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <!-- Letterhead Size Settings Section -->
              <div class="md:col-span-2 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <h3 class="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Letterhead Size Settings
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Width Input -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Width (inches)
                    </label>
                    <input
                      v-model.number="letterheadWidth"
                      type="number"
                      min="3"
                      max="20"
                      step="0.1"
                      placeholder="8.268"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <!-- Height Input -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Height (inches)
                    </label>
                    <input
                      v-model.number="letterheadHeight"
                      type="number"
                      min="3"
                      max="20"
                      step="0.1"
                      placeholder="11.693"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <!-- Preset Sizes -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Quick Presets
                    </label>
                    <select
                      @change="handlePresetChange"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="">Select Preset</option>
                      <option value="a4">A4 (8.27 × 11.69)</option>
                      <option value="letter">Letter (8.5 × 11)</option>
                      <option value="legal">Legal (8.5 × 14)</option>
                      <option value="custom">Custom Size</option>
                    </select>
                  </div>
                </div>

                <!-- Size Preview Indicator -->
                <div class="mt-3 p-2 bg-indigo-100 dark:bg-indigo-800/30 rounded-md border border-indigo-200 dark:border-indigo-700">
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-indigo-800 dark:text-indigo-300 font-medium">
                      Current Size: {{ letterheadWidth }}″ × {{ letterheadHeight }}″
                    </span>
                    <span class="text-indigo-600 dark:text-indigo-400">
                      Standard Letter Size
                    </span>
                  </div>
                </div>

                <p class="text-xs text-indigo-700 dark:text-indigo-300 mt-3 flex items-start gap-1">
                  <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Adjust the letterhead size to fit your printing requirements. Content will automatically scale to fit.</span>
                </p>
              </div>

              <!-- CMYK Color Settings Section -->
              <div class="md:col-span-2 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
                <h3 class="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  CMYK Color Settings
                </h3>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Color Mode Selection -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Color Mode
                    </label>
                    <select
                      v-model="colorMode"
                      @change="handleColorModeChange"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value="full-color">Full Color (4 Colors - CMYK)</option>
                      <option value="three-color">Three Color (CMY)</option>
                      <option value="two-color">Two Color (Custom)</option>
                      <option value="one-color">One Color (Black/Custom)</option>
                    </select>
                  </div>

                  <!-- Color Preview -->
                  <div>
                    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Color Preview
                    </label>
                    <div class="flex items-center gap-2 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700">
                      <div v-if="colorMode === 'full-color'" class="flex gap-1">
                        <div class="w-6 h-6 bg-cyan-500 rounded border" title="Cyan"></div>
                        <div class="w-6 h-6 bg-magenta-500 rounded border" title="Magenta"></div>
                        <div class="w-6 h-6 bg-yellow-400 rounded border" title="Yellow"></div>
                        <div class="w-6 h-6 bg-black rounded border" title="Black"></div>
                      </div>
                      <div v-else-if="colorMode === 'three-color'" class="flex gap-1">
                        <div class="w-6 h-6 bg-cyan-500 rounded border" title="Cyan"></div>
                        <div class="w-6 h-6 bg-magenta-500 rounded border" title="Magenta"></div>
                        <div class="w-6 h-6 bg-yellow-400 rounded border" title="Yellow"></div>
                      </div>
                      <div v-else-if="colorMode === 'two-color'" class="flex gap-1">
                        <div 
                          :style="{ backgroundColor: cmykToRgb(customColor1CMYK.c, customColor1CMYK.m, customColor1CMYK.y, customColor1CMYK.k) }"
                          class="w-6 h-6 rounded border"
                          title="Primary Color"
                        ></div>
                        <div 
                          :style="{ backgroundColor: cmykToRgb(customColor2CMYK.c, customColor2CMYK.m, customColor2CMYK.y, customColor2CMYK.k) }"
                          class="w-6 h-6 rounded border"
                          title="Secondary Color"
                        ></div>
                      </div>
                      <div v-else-if="colorMode === 'one-color'" class="flex gap-1">
                        <div 
                          :style="{ backgroundColor: cmykToRgb(customColor1CMYK.c, customColor1CMYK.m, customColor1CMYK.y, customColor1CMYK.k) }"
                          class="w-6 h-6 rounded border"
                          title="Primary Color"
                        ></div>
                      </div>
                      <span class="text-xs text-slate-600 dark:text-slate-400 ml-2">
                        {{ getColorModeDescription() }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- CMYK Sliders for Custom Colors -->
                <div v-if="colorMode === 'two-color' || colorMode === 'one-color'" class="mt-4 space-y-3">
                  <div class="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Adjust Primary Color (CMYK)
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center gap-3">
                      <label class="w-20 text-xs text-cyan-600 dark:text-cyan-400 font-medium">Cyan:</label>
                      <input v-model.number="customColor1CMYK.c" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.c }}%</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="w-20 text-xs text-pink-600 dark:text-pink-400 font-medium">Magenta:</label>
                      <input v-model.number="customColor1CMYK.m" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.m }}%</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="w-20 text-xs text-yellow-600 dark:text-yellow-400 font-medium">Yellow:</label>
                      <input v-model.number="customColor1CMYK.y" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.y }}%</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <label class="w-20 text-xs text-slate-800 dark:text-slate-300 font-medium">Black (K):</label>
                      <input v-model.number="customColor1CMYK.k" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                      <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor1CMYK.k }}%</span>
                    </div>
                  </div>

                  <div v-if="colorMode === 'two-color'" class="mt-4">
                    <div class="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Adjust Secondary Color (CMYK)
                    </div>
                    <div class="space-y-2">
                      <div class="flex items-center gap-3">
                        <label class="w-20 text-xs text-cyan-600 dark:text-cyan-400 font-medium">Cyan:</label>
                        <input v-model.number="customColor2CMYK.c" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.c }}%</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <label class="w-20 text-xs text-pink-600 dark:text-pink-400 font-medium">Magenta:</label>
                        <input v-model.number="customColor2CMYK.m" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.m }}%</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <label class="w-20 text-xs text-yellow-600 dark:text-yellow-400 font-medium">Yellow:</label>
                        <input v-model.number="customColor2CMYK.y" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.y }}%</span>
                      </div>
                      <div class="flex items-center gap-3">
                        <label class="w-20 text-xs text-slate-800 dark:text-slate-300 font-medium">Black (K):</label>
                        <input v-model.number="customColor2CMYK.k" type="range" min="0" max="100" class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                        <span class="w-12 text-xs text-right text-slate-600 dark:text-slate-400">{{ customColor2CMYK.k }}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <p class="text-xs text-orange-700 dark:text-orange-300 mt-3 flex items-start gap-1">
                  <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Select the color mode for your letterhead. This affects printing costs and visual appearance. Full color provides the richest appearance.</span>
                </p>
              </div>

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
                        @click="logoInput?.click()"
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

                    <!-- Organization Subtitle/Tagline -->
                    <div>
                      <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Organization Subtitle/Tagline (Optional)
                      </label>
                      <textarea
                        v-model="tagline"
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
                        v-model="address"
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
                        v-model="phone"
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
                  <span>These details will appear in the letterhead header. Upload a logo image (PNG, JPG) or leave empty.</span>
                </p>
              </div>

              <!-- Contact Information Section -->
              <div class="md:col-span-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <h3 class="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Email -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      v-model="email"
                      type="email"
                      placeholder="e.g., info@company.com"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <!-- Website -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Website (Optional)
                    </label>
                    <input
                      v-model="website"
                      type="text"
                      placeholder="e.g., www.company.com"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <!-- Social Media -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Social Media (Optional)
                    </label>
                    <input
                      v-model="socialMedia"
                      type="text"
                      placeholder="e.g., @company"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Letter Head Preview Section -->
        <section class="w-full max-w-5xl flex items-center justify-center">
          <div class="w-full flex items-center justify-center p-4">
            <div
              id="letterhead-preview"
              ref="letterheadRef"
              class="relative bg-white shadow-2xl border border-slate-200 overflow-hidden"
              :style="{ width: `${letterheadWidth}in`, height: `${letterheadHeight}in` }"
            >
              <!-- TOP-RIGHT PATTERN -->
              <svg class="absolute top-0 right-0 pointer-events-none" width="350" height="260" viewBox="0 0 350 260">
                <rect x="200" y="10" width="90" height="90" rx="6" fill="none" :stroke="colorStyles.patternColor1" stroke-width="12" transform="rotate(50, 280, 150)"/>
                <rect x="60" y="00" width="90" height="90" rx="6" fill="none" :stroke="colorStyles.patternColor2" stroke-width="12" transform="rotate(50, 150, 120)"/>
                <rect x="60" y="20" width="35" height="35" rx="6" fill="none" :stroke="colorStyles.patternColor1" stroke-width="8" transform="rotate(53, 199, 210)"/>
                <rect x="60" y="20" width="70" height="70" rx="6" fill="none" :stroke="colorStyles.patternColor1" stroke-width="12" transform="rotate(50, 90, 250)"/>
                <rect x="60" y="20" width="35" height="35" rx="6" fill="none" :stroke="colorStyles.patternColor2" stroke-width="8" transform="rotate(53, 100, 370)"/>
              </svg>

              <!-- BOTTOM-RIGHT PATTERN -->
              <svg class="absolute bottom-0 right-0 pointer-events-none" width="350" height="260" viewBox="0 0 350 260">
                <rect x="260" y="30" width="70" height="70" rx="6" fill="none" :stroke="colorStyles.patternColor1" stroke-width="14" transform="rotate(10, 175, 295)"/>
                <rect x="220" y="140" width="110" height="110" rx="6" fill="none" :stroke="colorStyles.patternColor2" stroke-width="14" transform="rotate(10, 275, 395)"/>
                <rect x="130" y="165" width="85" height="85" rx="6" fill="none" :stroke="colorStyles.patternColor1" stroke-width="14" transform="rotate(10, 172, 257)"/>
              </svg>

              <!-- TOP LEFT LOGO + NAME -->
              <div class="absolute top-16 left-12 flex items-center gap-3">
                <img 
                  v-if="logoDataUrl" 
                  :src="logoDataUrl" 
                  class="h-14 object-contain"
                  :style="{ filter: colorStyles.logoFilter }"
                />
                <div class="ml-5">
                  <h1 
                    v-if="organizationName || !isExporting" 
                    class="text-xl font-extrabold" 
                    :style="{ color: organizationName ? colorStyles.headerBg : '#9ca3af' }"
                  >
                    {{ organizationName || 'Organization Name' }}
                  </h1>
                  <p 
                    v-if="(tagline || !isExporting) && tagline" 
                    class="text-xs mt-1"
                    :style="{ color: colorStyles.borderColor }"
                  >
                    {{ tagline }}
                  </p>
                </div>
              </div>

              <!-- WRITING AREA -->
              <div class="absolute inset-0 p-32"></div>

              <!-- BOTTOM FOOTER -->
              <div
                class="absolute bottom-0 left-0 right-0 flex items-center justify-between px-10 py-3 text-xs text-slate-700 font-medium"
                :style="{ backgroundColor: colorStyles.footerBg }"
              >
                <div class="flex flex-col">
                  <strong>LAGOS:</strong>
                  <span>No. 9 Olowogbowo Street, Lagos State</span>
                </div>
                <div class="flex flex-col">
                  <strong>ABUJA:</strong>
                  <span>No. 10, Quito Street, Maitama</span>
                </div>
                <div class="font-bold text-base">{{ phone || '+234 813 8535 549' }}</div>
              </div>
            </div>
          </div>
        </section>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import LogoCropper from '@/components/LogoCropper.vue'
import html2pdf from 'html2pdf.js'
import * as htmlToImage from 'html-to-image'

const router = useRouter()
const authenticatedMember = ref<{ name?: string; role?: string } | null>(null)
const letterheadRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)

// Letterhead Size Settings
const letterheadWidth = ref(8.268) // Default letter width
const letterheadHeight = ref(11.693) // Default letter height

// CMYK Color settings
const colorMode = ref('full-color') // Default to full color
const customColor1CMYK = ref({ c: 0, m: 0, y: 0, k: 100 }) // Primary custom color (Black default)
const customColor2CMYK = ref({ c: 100, m: 0, y: 100, k: 0 }) // Secondary custom color (Blue default)

// Organization Details
const organizationName = ref('')
const tagline = ref('')
const address = ref('')
const logoDataUrl = ref('')

// Contact Information
const phone = ref('')
const email = ref('')
const website = ref('')
const socialMedia = ref('')

// Design Settings
const headerStyle = ref('centered')
const accentColor = ref('#3B82F6')
const showFooter = ref(true)
const templateType = ref('template1') // Track which template design to use

// Image cropper state
const showImageCropper = ref(false)
const tempImageUrl = ref('')
const logoInput = ref<HTMLInputElement | null>(null)

// Handle preset size changes
const handlePresetChange = (event: Event) => {
  const preset = (event.target as HTMLSelectElement).value
  switch (preset) {
    case 'a4':
      letterheadWidth.value = 8.27
      letterheadHeight.value = 11.69
      break
    case 'letter':
      letterheadWidth.value = 8.5
      letterheadHeight.value = 11
      break
    case 'legal':
      letterheadWidth.value = 8.5
      letterheadHeight.value = 14
      break
    default:
      // Keep current values for custom
      break
  }
}

// Handle color mode changes
const handleColorModeChange = () => {
  // Reset custom colors when changing mode
  if (colorMode.value === 'one-color') {
    customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 }
  } else if (colorMode.value === 'two-color') {
    customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 }
    customColor2CMYK.value = { c: 100, m: 0, y: 100, k: 0 }
  }
}

// Get color mode description
const getColorModeDescription = () => {
  switch (colorMode.value) {
    case 'full-color':
      return 'Full CMYK color printing'
    case 'three-color':
      return 'CMY color printing (no black)'
    case 'two-color':
      return 'Two custom colors'
    case 'one-color':
      return 'Single color printing'
    default:
      return ''
  }
}

// Convert CMYK to RGB for display
const cmykToRgb = (c: number, m: number, y: number, k: number): string => {
  const r = 255 * (1 - c / 100) * (1 - k / 100)
  const g = 255 * (1 - m / 100) * (1 - k / 100)
  const b = 255 * (1 - y / 100) * (1 - k / 100)
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

// Color styles based on selected mode - includes SVG pattern colors
const colorStyles = computed(() => {
  switch (colorMode.value) {
    case 'full-color':
      return {
        headerBg: 'rgb(30, 64, 175)', // Blue
        borderColor: 'rgb(59, 130, 246)',
        logoFilter: 'none',
        patternColor1: '#006C63', // Teal for patterns
        patternColor2: '#D5BD8F', // Gold for patterns
        footerBg: '#D5BD8F'
      }
    case 'three-color':
      return {
        headerBg: 'rgb(167, 139, 250)', // Purple (C+M)
        borderColor: 'rgb(167, 139, 250)',
        logoFilter: 'grayscale(100%) sepia(100%) hue-rotate(260deg) saturate(300%)',
        patternColor1: 'rgb(167, 139, 250)',
        patternColor2: 'rgb(251, 191, 36)', // Yellow
        footerBg: 'rgb(251, 191, 36)'
      }
    case 'two-color': {
      const color1 = cmykToRgb(customColor1CMYK.value.c, customColor1CMYK.value.m, customColor1CMYK.value.y, customColor1CMYK.value.k)
      const color2 = cmykToRgb(customColor2CMYK.value.c, customColor2CMYK.value.m, customColor2CMYK.value.y, customColor2CMYK.value.k)
      return {
        headerBg: color1,
        borderColor: color2,
        logoFilter: 'grayscale(100%) brightness(0.5) sepia(100%) saturate(1000%) contrast(1.2)',
        patternColor1: color1,
        patternColor2: color2,
        footerBg: color2
      }
    }
    case 'one-color': {
      const singleColor = cmykToRgb(customColor1CMYK.value.c, customColor1CMYK.value.m, customColor1CMYK.value.y, customColor1CMYK.value.k)
      return {
        headerBg: singleColor,
        borderColor: singleColor,
        logoFilter: 'grayscale(100%) brightness(0.4) contrast(2)',
        patternColor1: singleColor,
        patternColor2: singleColor,
        footerBg: singleColor
      }
    }
    default:
      return {
        headerBg: 'rgb(30, 64, 175)',
        borderColor: 'rgb(59, 130, 246)',
        logoFilter: 'none',
        patternColor1: '#006C63',
        patternColor2: '#D5BD8F',
        footerBg: '#D5BD8F'
      }
  }
})

// Logo upload handler
const handleLogoUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, etc.)')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      tempImageUrl.value = e.target?.result as string
      showImageCropper.value = true
    }
    reader.readAsDataURL(file)
  }
  
  if (event.target) {
    (event.target as HTMLInputElement).value = ''
  }
}

const handleCroppedImage = (croppedDataUrl: string) => {
  logoDataUrl.value = croppedDataUrl
  showImageCropper.value = false
  tempImageUrl.value = ''
}

const handleCropperClose = () => {
  showImageCropper.value = false
  tempImageUrl.value = ''
}

// Export handlers
const handleExportPDF = async () => {
  if (!letterheadRef.value || isExporting.value) return
  
  try {
    isExporting.value = true
    
    const element = letterheadRef.value
    const filename = `Letterhead-${Date.now()}.pdf`
    const options = {
      margin: 0,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const },
    }
    
    await html2pdf().set(options).from(element).save()
    alert('✅ Letterhead exported as PDF successfully!')
  } catch (error) {
    console.error('Error exporting PDF:', error)
    alert('❌ Failed to export PDF')
  } finally {
    isExporting.value = false
  }
}

const handleExportJPEG = async () => {
  if (!letterheadRef.value || isExporting.value) return
  
  try {
    isExporting.value = true
    
    const dataUrl = await htmlToImage.toJpeg(letterheadRef.value, {
      quality: 0.98,
      backgroundColor: '#ffffff',
      pixelRatio: 2
    })
    
    const link = document.createElement('a')
    link.download = `Letterhead-${Date.now()}.jpeg`
    link.href = dataUrl
    link.click()
    
    alert('✅ Letterhead exported as JPEG successfully!')
  } catch (error) {
    console.error('Error exporting JPEG:', error)
    alert('❌ Failed to export JPEG')
  } finally {
    isExporting.value = false
  }
}

const handleBack = () => {
  router.push({ name: 'Dashboard' })
}

const handleLogout = () => {
  if (confirm('Are you sure you want to logout?')) {
    localStorage.removeItem('authenticatedMember')
    router.push({ name: 'Dashboard' })
  }
}

onMounted(() => {
  const memberData = localStorage.getItem('authenticatedMember')
  if (memberData) {
    authenticatedMember.value = JSON.parse(memberData)
  }
})
</script>

<style scoped>
/* Ensure print-friendly styles */
@media print {
  .no-print {
    display: none !important;
  }
}
</style>
