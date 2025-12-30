<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <!-- Pull to Refresh - Custom Styled -->
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)" pull-factor="0.5" pull-min="60" pull-max="120">
        <ion-refresher-content
          :pulling-icon="arrowDown"
          pulling-text=""
          refreshing-spinner="crescent"
          refreshing-text="">
        </ion-refresher-content>
      </ion-refresher>
      
      <!-- Custom Refresh Indicator Overlay -->
      <div v-if="isRefreshing" class="custom-refresh-overlay">
        <div class="refresh-indicator">
          <div class="refresh-spinner"></div>
          <p class="refresh-text">Refreshing branches...</p>
        </div>
      </div>

      <div class="min-h-screen relative overflow-x-hidden">
        <!-- Background Image Carousel -->
        <div class="background-carousel">
      <transition-group name="fade" tag="div">
        <div
          v-for="(image, index) in backgroundImages"
          :key="image"
          v-show="index === currentImageIndex"
          class="background-image"
          :style="{ backgroundImage: `url(${image})` }"
        ></div>
      </transition-group>
      <!-- Light overlay to maintain light color scheme -->
      <div class="overlay"></div>
    </div>

    <!-- Floating Particles (Bubbles) - Reduced on mobile -->
    <div class="fixed inset-0 overflow-hidden pointer-events-none z-10">
      <div v-for="i in 25" :key="i" 
           class="absolute rounded-full opacity-20 sm:opacity-30 animate-float"
           :class="[
             i % 3 === 0 ? 'bg-blue-400 dark:bg-blue-300' : i % 3 === 1 ? 'bg-sky-400 dark:bg-sky-300' : 'bg-indigo-400 dark:bg-indigo-300',
             i > 15 ? 'hidden sm:block' : '',
             'w-1.5 h-1.5 sm:w-2 sm:h-2'
           ]"
           :style="{
             left: `${Math.random() * 100}%`,
             top: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 5}s`,
             animationDuration: `${5 + Math.random() * 10}s`
           }">
      </div>
    </div>

    <!-- Main Content Container -->
    <div class="relative z-10 py-6 sm:py-12 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div class="w-full max-w-7xl mx-auto">
        <!-- Main Content Grid -->
        <div class="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center min-h-[90vh] sm:min-h-[80vh]">

          <!-- Left Column: Enhanced Header -->
          <div class="order-1 lg:order-1 relative">
            <!-- Background Card with Gradient -->
            <div class="relative bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-800 dark:from-blue-900 dark:via-slate-900 dark:to-indigo-950 rounded-xl sm:rounded-2xl p-6 sm:p-6 lg:p-8 shadow-xl overflow-hidden">
              <!-- Decorative Elements -->
              <div class="absolute top-0 right-0 w-16 h-16 sm:w-20 sm:h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8 sm:-translate-y-10 sm:translate-x-10"></div>
              <div class="absolute bottom-0 left-0 w-12 h-12 sm:w-16 sm:h-16 bg-white/5 rounded-full translate-y-6 -translate-x-6 sm:translate-y-8 sm:-translate-x-8"></div>

              <!-- Content -->
              <div class="relative z-10 text-center">
                <div class="flex justify-center mb-3 sm:mb-4">
                  <img src="/images/ican-web-logo.png" alt="ICAN logo" class="h-8 sm:h-10 w-auto drop-shadow-lg" />
                </div>
                <!-- Badge -->
                <div class="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1.5 sm:px-4 sm:py-2 text-white text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-3 sm:mb-4 shadow-md">
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse shadow-sm"></div>
                  Chartered Confidence
                  <div class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full animate-pulse shadow-sm"></div>
                </div>

                <!-- Main Title -->
                <h1 class="text-xl sm:text-2xl lg:text-4xl font-black text-white leading-tight mb-3 sm:mb-4 tracking-tight px-2">
                  The Institute of
                  <span class="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mt-1">
                    Chartered Accountants of Nigeria
                  </span>
                
                </h1>

                <!-- Description -->
                <p class="text-xs sm:text-sm lg:text-base text-blue-100 max-w-xl mx-auto leading-relaxed mb-3 sm:mb-4 font-medium px-2">
                  A comprehensive workspace for managing branch receipts, invoices, and member services with export-ready documentation and complete audit trails.
                </p>
              </div>
            </div>
          </div>

          

          <!-- Right Column: Enhanced Login Form -->
          <div class="order-2 lg:order-2">
            <div class="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 p-5 sm:p-5 lg:p-6 relative overflow-hidden">
              <!-- Form Background Pattern -->
              <div class="absolute inset-0 opacity-5">
                <div class="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-full -translate-y-10 translate-x-10"></div>
                <div class="absolute bottom-0 left-0 w-16 h-16 bg-indigo-500 rounded-full translate-y-8 -translate-x-8"></div>
              </div>

              <div class="relative z-10">
                <!-- Header -->
                <div class="text-center mb-5">
                  <div class="inline-flex items-center justify-center w-12 h-12 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl mb-3 sm:mb-2 shadow-md">
                    <svg class="w-6 h-6 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                  </div>
                  <h2 class="text-base sm:text-lg lg:text-xl font-bold text-slate-900 dark:text-white mb-1.5 sm:mb-1">Access Your Branch</h2>
                  <p class="text-slate-600 dark:text-slate-400 leading-relaxed text-xs sm:text-xs">
                    Sign in with your branch credentials
                  </p>
                </div>

                <!-- Form -->
                <form class="space-y-3" @submit.prevent="handleSubmit">
                  <!-- Branch Selection Button -->
                  <div class="space-y-1.5">
                    <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Select Branch
                    </label>
                    <button
                      type="button"
                      @click="showBranchModal = true"
                      class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-blue-400 dark:hover:border-blue-500 flex items-center justify-between"
                      :disabled="isLoadingBranches || branches.length === 0"
                    >
                      <span :class="{ 'text-slate-400 dark:text-slate-500': !selectedBranch }">
                        {{ selectedBranch || 'Select your branch' }}
                      </span>
                      <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    <p v-if="selectedBranch && !isBranchAccessible(selectedBranch)" class="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2.5 py-1.5 border border-amber-200 dark:border-amber-800">
                      <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                      </svg>
                      Branch locked - Contact administrator for access
                    </p>
                  </div>

                  <!-- Password Field -->
                  <div v-if="isPasswordStepVisible" class="space-y-2">
                    <div>
                      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1" for="branch-email">
                        Email Address
                      </label>
                      <input
                        id="branch-email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        placeholder="Enter your email"
                        class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                      />
                    </div>

                    <div>
                      <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1" for="branch-password">
                        Password
                      </label>
                      <div class="relative">
                        <input
                          id="branch-password"
                          v-model="password"
                          :type="showPassword ? 'text' : 'password'"
                          autocomplete="current-password"
                          placeholder="Enter your password"
                          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 shadow-sm"
                        />
                        <button 
                          type="button"
                          @click="showPassword = !showPassword"
                          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                          <svg v-if="!showPassword" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Messages -->
                  <div class="min-h-[1rem] flex flex-col justify-center">
                    <p v-if="errorMessage" class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg px-2.5 py-1.5 border border-red-200 dark:border-red-800">
                      {{ errorMessage }}
                    </p>
                    <p v-if="statusMessage && !errorMessage" class="text-xs text-slate-500 dark:text-slate-400 text-center">
                      {{ statusMessage }}
                    </p>
                  </div>

                  <!-- Action Buttons -->
                  <div v-if="isPasswordStepVisible" class="space-y-2">
                    <BaseButton
                      type="submit"
                      :disabled="isSubmitDisabled"
                      class="w-full py-2 text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      :class="{ 'opacity-50 cursor-not-allowed': isSubmitDisabled }"
                    >
                      <span v-if="isSubmitting" class="flex items-center justify-center gap-2">
                        <svg class="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Authenticating...
                      </span>
                      <span v-else>Login to {{ selectedBranch }}</span>
                    </BaseButton>

                    <BaseButton
                      variant="secondary"
                      type="button"
                      class="w-full py-2 text-sm rounded-lg border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200"
                      @click="handleSignUp"
                    >
                      Sign Up for {{ selectedBranch }}
                    </BaseButton>
                  </div>
                </form>

                <!-- Help Section -->
                <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div class="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1.5">
                    <p class="font-medium">Need Assistance?</p>
                    <p>Contact your branch administrator or reach out to the ICAN service desk for support.</p>
                  </div>
                  
                  <!-- Reset Branch Password Button -->
                  <div class="mt-4">
                    <button
                      type="button"
                      @click="showPasswordResetModal = true"
                      class="w-full px-4 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                      </svg>
                      Reset Branch Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Branch Selection Modal -->
    <Transition name="modal">
      <div v-if="showBranchModal" class="fixed inset-0 z-[9999] overflow-y-auto" style="display: flex !important; align-items: center !important; justify-content: center !important; padding: 1rem; min-height: 100vh; min-height: 100dvh;" @click.self="showBranchModal = false" @keydown.enter="handleModalEnterKey" @keydown.esc="showBranchModal = false">
        <!-- Backdrop with Blur -->
        <div class="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md" style="z-index: 1; min-height: 100vh; min-height: 100dvh;"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full overflow-hidden animate-modal-in" style="max-width: 28rem; max-height: 85vh; margin: auto; z-index: 10;">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Select Your Branch</h3>
                  <p class="text-blue-100 text-xs mt-0.5">Choose your ICAN branch location</p>
                </div>
              </div>
              <button 
                @click="showBranchModal = false"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <div class="relative">
              <input
                v-model="branchSearchQuery"
                type="text"
                placeholder="Search branches..."
                class="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>

          <!-- Branch List -->
          <div class="overflow-y-auto max-h-80 p-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-gray-200">
            <div v-if="filteredBranches.length === 0" class="text-center py-12">
              <svg class="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p class="text-slate-500 dark:text-slate-400 font-medium">No branches found</p>
              <p class="text-slate-400 dark:text-slate-500 text-sm mt-1">Try a different search term</p>
            </div>
            
            <div v-else class="space-y-2 pr-2">
              <button
                v-for="branch in filteredBranches"
                :key="branch"
                @click="selectBranch(branch)"
                @keydown.enter="handleBranchKeyDown(branch, $event)"
                :disabled="!isBranchAccessible(branch)"
                class="w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 group transform"
                :class="[
                  isBranchAccessible(branch) 
                    ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-pointer hover:shadow-lg hover:scale-[1.02] animate-pulse-slow' 
                    : 'bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 opacity-60 cursor-not-allowed'
                ]"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <!-- Branch Icon -->
                    <div 
                      class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      :class="[
                        selectedBranch === branch
                          ? 'bg-blue-500 dark:bg-blue-600'
                          : 'bg-slate-200 dark:bg-slate-600 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/50'
                      ]"
                    >
                      <svg 
                        class="w-5 h-5"
                        :class="selectedBranch === branch ? 'text-white' : 'text-slate-600 dark:text-slate-300'"
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                    </div>
                    
                    <!-- Branch Name -->
                    <div>
                      <p 
                        class="font-semibold text-sm"
                        :class="[
                          selectedBranch === branch 
                            ? 'text-blue-700 dark:text-blue-300' 
                            : 'text-slate-800 dark:text-slate-200'
                        ]"
                      >
                        {{ branch }}
                      </p>
                      <p 
                        v-if="!isBranchAccessible(branch)"
                        class="text-xs text-red-500 dark:text-red-400 flex items-center gap-1 mt-0.5 font-medium"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        🔒 Locked
                      </p>
                      <p 
                        v-else
                        class="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-0.5 font-medium"
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        ✅ Available - Click to access
                      </p>
                    </div>
                  </div>

                  <!-- Check Icon -->
                  <svg 
                    v-if="selectedBranch === branch"
                    class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800/50">
            <div class="text-center">
              <button
                @click="showBranchModal = false"
                class="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-3">
                💡 Click any accessible state to select automatically
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Password Reset Modal -->
    <Transition name="modal">
      <div v-if="showPasswordResetModal" class="fixed inset-0 z-[9999] overflow-y-auto" style="display: flex !important; align-items: center !important; justify-content: center !important; padding: 1rem; min-height: 100vh;" @click.self="closePasswordResetModal">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md" style="z-index: 1;"></div>
        
        <!-- Modal Content -->
        <div class="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full overflow-hidden animate-modal-in" style="max-width: 28rem; z-index: 10;">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-700 dark:to-orange-700 px-6 py-5">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">Reset Branch Password</h3>
                  <p class="text-amber-100 text-xs mt-0.5">Change your branch access password</p>
                </div>
              </div>
              <button 
                @click="closePasswordResetModal"
                class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Reset Form -->
          <form @submit.prevent="handlePasswordReset" class="p-6 space-y-4">
            <!-- Step 1: Select Branch -->
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Select Branch
              </label>
              <button
                type="button"
                @click="showResetBranchSelection = true"
                class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all flex items-center justify-between"
              >
                <span :class="{ 'text-slate-400': !resetSelectedBranch }">
                  {{ resetSelectedBranch || 'Choose branch to reset' }}
                </span>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>

            <!-- Step 2: Current Password (only show if branch selected) -->
            <div v-if="resetSelectedBranch">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Current Branch Password
              </label>
              <div class="relative">
                <input
                  v-model="currentPassword"
                  :type="showCurrentPassword ? 'text' : 'password'"
                  placeholder="Enter current password"
                  class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="button"
                  @click="showCurrentPassword = !showCurrentPassword"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg v-if="!showCurrentPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Step 3: New Password (only show if current password entered) -->
            <div v-if="resetSelectedBranch && currentPassword">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <div class="relative">
                <input
                  v-model="newPassword"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Enter new password"
                  class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                  minlength="6"
                />
                <button
                  type="button"
                  @click="showNewPassword = !showNewPassword"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                </button>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Minimum 6 characters
              </p>
            </div>

            <!-- Step 4: Confirm New Password -->
            <div v-if="resetSelectedBranch && currentPassword && newPassword">
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm New Password
              </label>
              <div class="relative">
                <input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Re-enter new password"
                  class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
                <button
                  type="button"
                  @click="showConfirmPassword = !showConfirmPassword"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Error/Success Messages -->
            <div v-if="resetErrorMessage" class="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <p class="text-xs text-red-800 dark:text-red-200">{{ resetErrorMessage }}</p>
            </div>
            
            <div v-if="resetSuccessMessage" class="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <p class="text-xs text-green-800 dark:text-green-200">{{ resetSuccessMessage }}</p>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-3 pt-2">
              <button
                type="button"
                @click="closePasswordResetModal"
                class="flex-1 px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="isResettingPassword || !resetSelectedBranch || !currentPassword || !newPassword || !confirmPassword"
                class="flex-1 px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg v-if="isResettingPassword" class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-if="isResettingPassword">Resetting...</span>
                <span v-else>Reset Password</span>
              </button>
            </div>
          </form>

          <!-- Branch Selection List (inline) -->
          <div v-if="showResetBranchSelection" class="fixed inset-0 z-[10000] flex items-center justify-center p-4" @click.self="showResetBranchSelection = false">
            <div class="absolute inset-0 bg-black/50"></div>
            <div class="relative bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full max-h-96 overflow-hidden">
              <div class="p-4 border-b border-slate-200 dark:border-slate-700">
                <h4 class="font-semibold text-slate-900 dark:text-white">Select Branch</h4>
              </div>
              <div class="overflow-y-auto max-h-72 p-4 space-y-2">
                <button
                  v-for="branch in branches"
                  :key="branch"
                  @click="selectResetBranch(branch)"
                  class="w-full text-left px-4 py-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                  :class="{ 'bg-amber-100 dark:bg-amber-900/30': resetSelectedBranch === branch }"
                >
                  <span class="text-sm font-medium text-slate-900 dark:text-white">{{ branch }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonRefresher, IonRefresherContent } from '@ionic/vue';
import { arrowDown } from 'ionicons/icons';
import BaseButton from '../components/BaseButton.vue';
import { 
  ICANBranchService, 
  ICANUserService, 
  ICANSeedService
} from '../services/ican-service.js';
import { SessionManager } from '../utils/secure-storage.js';

export default defineComponent({
  name: 'HomePage',
  components: {
    BaseButton,
    IonPage,
    IonContent,
    IonRefresher,
    IonRefresherContent,
  },
  setup() {
    const router = useRouter();
    const branches = ref([]);
    const selectedBranch = ref('');
    const email = ref('');
    const password = ref('');
    const showPassword = ref(false);
    const errorMessage = ref('');
    const statusMessage = ref('');
    const isSubmitting = ref(false);
    const isLoadingBranches = ref(false);
    const showBranchModal = ref(false);
    const branchSearchQuery = ref('');
    const isOnline = ref(navigator.onLine);
    const isRefreshing = ref(false);
    
    // Password reset refs
    const showPasswordResetModal = ref(false);
    const showResetBranchSelection = ref(false);
    const resetSelectedBranch = ref('');
    const currentPassword = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    const isResettingPassword = ref(false);
    const resetErrorMessage = ref('');
    const resetSuccessMessage = ref('');
    
    // Activity logging function
    const logUserActivity = async (userId, activityType, details = {}) => {
      try {
        await ICANUserService.logActivity(userId, {
          type: activityType,
          timestamp: new Date(),
          details: details,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            online: navigator.onLine
          }
        });
        console.log('✅ Activity logged:', activityType);
      } catch (error) {
        console.error('❌ Failed to log activity:', error);
      }
    };
    
    // Monitor online/offline status
    const handleOnlineStatus = () => {
      isOnline.value = navigator.onLine;
      if (!navigator.onLine) {
        errorMessage.value = '⚠️ No internet connection. Please connect to the internet to use ICAN app.';
        statusMessage.value = '';
      } else {
        if (errorMessage.value.includes('No internet connection')) {
          errorMessage.value = '';
          statusMessage.value = '✅ Internet connection restored.';
          setTimeout(() => { statusMessage.value = ''; }, 3000);
        }
      }
    };
    
    // Background images carousel
    const backgroundImages = [
      // Students studying accounting
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2940&auto=format&fit=crop",
      
      // Professional bankers and accountants
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1664575602276-acd073f104c1?q=80&w=2940&auto=format&fit=crop",
      
      // Business and finance professionals
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2940&auto=format&fit=crop",
      
      // Office and workspace
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2940&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2940&auto=format&fit=crop"
    ];
    
    const currentImageIndex = ref(0);
    let imageIntervalId;

    // ====== DEVELOPER CONFIGURATION ======
    // Configure which branches are accessible here
    // Set to true to enable a branch, false to disable
    const branchAccessConfig = {
      // Only Niger State (Minna) is accessible
      'Niger State': true,           // Only accessible branch
      
      // All other Nigerian states and FCT are locked
      'FCT Abuja State': false,
      'Abia State': false,
      'Adamawa State': false,
      'Akwa Ibom State': false,
      'Anambra State': false,
      'Bauchi State': false,
      'Bayelsa State': false,
      'Benue State': false,
      'Borno State': false,
      'Cross River State': false,
      'Delta State': false,
      'Ebonyi State': false,
      'Edo State': false,
      'Ekiti State': false,
      'Enugu State': false,
      'Gombe State': false,
      'Imo State': false,
      'Jigawa State': false,
      'Kaduna State': false,
      'Kano State': false,
      'Katsina State': false,
      'Kebbi State': false,
      'Kogi State': false,
      'Kwara State': false,
      'Lagos State': false,
      'Nasarawa State': false,
      'Ogun State': false,
      'Ondo State': false,
      'Osun State': false,
      'Oyo State': false,
      'Plateau State': false,
      'Rivers State': false,
      'Sokoto State': false,
      'Taraba State': false,
      'Yobe State': false,
      'Zamfara State': false
    };
    // ====================================

    const isBranchAccessible = (branchName) => {
      // If branch is not in config, default to disabled
      return branchAccessConfig[branchName] === true;
    };

    const filteredBranches = computed(() => {
      if (!branchSearchQuery.value) {
        return branches.value;
      }
      return branches.value.filter(branch => 
        branch.toLowerCase().includes(branchSearchQuery.value.toLowerCase())
      );
    });

    const selectBranch = (branch) => {
      if (isBranchAccessible(branch)) {
        selectedBranch.value = branch;
        // Auto-confirm selection and close modal
        showBranchModal.value = false;
        branchSearchQuery.value = '';
      }
    };

    const confirmBranchSelection = () => {
      showBranchModal.value = false;
      branchSearchQuery.value = '';
    };

    // Disable body scroll when modal is open
    watch(showBranchModal, (isOpen) => {
      if (isOpen) {
        // Store current scroll position
        const scrollY = window.scrollY;
        // Disable scroll and fix position to prevent background scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = `-${scrollY}px`;
      } else {
        // Restore scroll and position
        const scrollY = document.body.style.top;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        // Restore scroll position
        if (scrollY) {
          window.scrollTo(0, parseInt(scrollY.replace('px', '').replace('-', '')) || 0);
        }
      }
    });

    watch(selectedBranch, (newBranch) => {
      email.value = '';
      password.value = '';
      errorMessage.value = '';
      statusMessage.value = '';

      // Check if branch is accessible
      if (newBranch && !isBranchAccessible(newBranch)) {
        errorMessage.value = `${newBranch} branch is temporarily unavailable. Please contact your administrator for access.`;
        statusMessage.value = '';
      }
    });

    const isPasswordStepVisible = computed(() => {
      // Only show password step if branch is selected AND accessible
      return selectedBranch.value !== '' && isBranchAccessible(selectedBranch.value);
    });
    
    const isSubmitDisabled = computed(
      () =>
        isSubmitting.value ||
        isLoadingBranches.value ||
        !selectedBranch.value ||
        !isBranchAccessible(selectedBranch.value) ||
        !email.value ||
        !password.value
    );

    const loadBranches = async () => {
      isLoadingBranches.value = true;
      errorMessage.value = '';
      try {
        console.log('🔍 Loading branches from Firebase...');
        
        // Load all branches from Firebase - faster without unnecessary status updates
        const branchList = await ICANBranchService.getAllBranches();
        console.log('✅ Branch list loaded:', branchList.length, 'branches');
        
        // Only seed if no branches exist (first-time setup only)
        if (branchList.length === 0) {
          console.log('📌 No branches found, seeding...');
          await ICANSeedService.forceReseedAllNigerianStates();
          const newBranchList = await ICANBranchService.getAllBranches();
          branches.value = newBranchList.map(branch => branch.name);
          console.log('✅ Branches seeded:', branches.value.length);
        } else {
          // Directly map branches - faster
          branches.value = branchList.map(branch => branch.name);
        }
        
        if (branches.value.length === 0) {
          errorMessage.value = 'No branches configured. Contact an administrator.';
        }
      } catch (error) {
        console.error('❌ Error loading branches:', error);
        
        // More detailed error message
        const errorDetails = error?.message || error?.code || 'Unknown error';
        errorMessage.value = `Unable to load branch list: ${errorDetails}. Please check your internet connection.`;
      } finally {
        isLoadingBranches.value = false;
      }
    };

    // Handle pull-to-refresh
    const handleRefresh = async (event) => {
      console.log('🔄 Pull-to-refresh: Reloading branches...');
      isRefreshing.value = true;
      branches.value = []; // Clear current branches
      await loadBranches();
      setTimeout(() => {
        isRefreshing.value = false;
        event.target.complete();
      }, 500);
    };

    onMounted(() => {
      // Check internet connection first
      if (!navigator.onLine) {
        errorMessage.value = '⚠️ No internet connection detected. Please connect to the internet to access ICAN.';
        isLoadingBranches.value = false;
      } else {
        loadBranches();
      }
      
      // Listen for online/offline events
      window.addEventListener('online', handleOnlineStatus);
      window.addEventListener('offline', handleOnlineStatus);
      
      // Start background image carousel
      imageIntervalId = window.setInterval(() => {
        currentImageIndex.value = (currentImageIndex.value + 1) % backgroundImages.length;
      }, 5000); // Change image every 5 seconds
      
      // Override Ionic's body styles to enable scrolling on all screen sizes
      const body = document.body;
      const html = document.documentElement;
      
      // Store original styles
      const originalBodyPosition = body.style.position;
      const originalBodyOverflow = body.style.overflow;
      const originalHtmlOverflow = html.style.overflow;
      
      // Apply scrollable styles for all screen sizes
      body.style.position = 'relative';
      body.style.overflow = 'auto';
      body.style.overflowX = 'hidden';
      html.style.overflow = 'auto';
      
      // Store in component for cleanup
      body.dataset.originalPosition = originalBodyPosition;
      body.dataset.originalOverflow = originalBodyOverflow;
      html.dataset.originalOverflow = originalHtmlOverflow;
    });

    onUnmounted(() => {
      // Remove online/offline listeners
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
      
      // Clear image carousel interval
      if (imageIntervalId) {
        clearInterval(imageIntervalId);
      }
      
      // Restore scroll if modal was open when unmounting
      document.body.style.overflow = '';
      
      // Restore original Ionic styles when leaving the page
      const body = document.body;
      const html = document.documentElement;
      
      if (body.dataset.originalPosition !== undefined) {
        body.style.position = body.dataset.originalPosition || '';
        body.style.overflow = body.dataset.originalOverflow || '';
        html.style.overflow = html.dataset.originalOverflow || '';
        
        delete body.dataset.originalPosition;
        delete body.dataset.originalOverflow;
        delete html.dataset.originalOverflow;
      }
    });

    const handleSubmit = async () => {
      // CRITICAL: Check internet connection before proceeding
      if (!navigator.onLine) {
        errorMessage.value = '❌ No internet connection. ICAN requires an active internet connection for authentication and security.';
        return;
      }
      
      if (!selectedBranch.value) {
        errorMessage.value = 'Please select a branch to continue.';
        return;
      }

      // Check if branch is accessible
      if (!isBranchAccessible(selectedBranch.value)) {
        errorMessage.value = `${selectedBranch.value} branch is currently unavailable. Please contact your administrator.`;
        return;
      }

      if (!email.value || !password.value) {
        errorMessage.value = 'Please enter your email and password.';
        return;
      }

      errorMessage.value = '';
      statusMessage.value = '🔐 Verifying credentials online...';
      isSubmitting.value = true;

      try {
        statusMessage.value = '🌐 Connecting to Firebase authentication...';
        
        console.log('🔍 Debug: Starting ONLINE authentication for:', {
          branch: selectedBranch.value,
          email: email.value,
          timestamp: new Date().toISOString(),
          online: navigator.onLine
        });

        // CRITICAL: Test Firebase connectivity first - NO OFFLINE FALLBACK
        const connectionTest = await ICANBranchService.testFirebaseConnection();
        console.log('🔍 Debug: Firebase connection test:', connectionTest);
        
        if (!connectionTest.connected) {
          throw new Error(`❌ Firebase authentication server unreachable. Please check your internet connection and try again.`);
        }

        statusMessage.value = '🔍 Verifying branch credentials...';
        
        // Step 1: Verify branch credentials with Firebase (branch password)
        const branch = await ICANBranchService.verifyBranchCredentials(selectedBranch.value, password.value);
        
        console.log('🔍 Debug: Branch verification result:', branch ? 'SUCCESS' : 'FAILED');
        
        if (!branch) {
          console.log('🔍 Debug: Branch verification failed - no branch returned');
          console.log('🔍 Debug: Available branches:', connectionTest.branches);
          
          // Log failed login attempt
          await logUserActivity('unknown', 'LOGIN_FAILED', {
            email: email.value,
            branch: selectedBranch.value,
            reason: 'Invalid branch password'
          });
          
          throw new Error('❌ Incorrect branch password. Please check with your branch administrator.');
        }

        console.log('✅ Debug: Branch verified successfully:', {
          branchId: branch.id,
          branchName: branch.name
        });

        statusMessage.value = '👤 Checking user registration...';
        
        // Step 2: Check if user exists in this branch (Firebase only)
        let user = await ICANUserService.findUser(email.value, branch.id);
        
        if (!user) {
          // User doesn't exist - create new user record in Firebase
          statusMessage.value = '📝 Creating user profile in Firebase...';
          
          const userId = await ICANUserService.createUser({
            email: email.value,
            name: email.value.split('@')[0],
            branchId: branch.id,
            branch: branch.name,
            role: 'guest',
            isActive: true,
            isBranchUser: true,
            isMember: false,
            createdAt: new Date(),
            firstLogin: new Date(),
            requiresOnlineAuth: true // Flag to enforce online authentication
          });
          
          user = {
            id: userId,
            email: email.value,
            name: email.value.split('@')[0],
            branchId: branch.id,
            branch: branch.name,
            role: 'guest',
            createdAt: new Date(),
            lastLogin: new Date(),
            isActive: true,
            isBranchUser: true,
            isMember: false,
            requiresOnlineAuth: true
          };
          
          // Log first-time login
          await logUserActivity(userId, 'FIRST_LOGIN', {
            email: email.value,
            branch: branch.name,
            branchId: branch.id
          });
          
          statusMessage.value = '✅ Branch access granted.';
        } else {
          // User exists - verify they're active
          if (!user.isActive) {
            await logUserActivity(user.id, 'LOGIN_FAILED', {
              email: email.value,
              branch: branch.name,
              reason: 'Account deactivated'
            });
            throw new Error('❌ Your account has been deactivated. Please contact your administrator.');
          }
          
          statusMessage.value = '🎉 Welcome back!';
          
          // Update last login timestamp in Firebase
          await ICANUserService.updateUser(user.id, {
            lastLogin: new Date(),
            lastLoginIP: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip).catch(() => 'unknown')
          });
          
          // Log successful login
          await logUserActivity(user.id, 'LOGIN_SUCCESS', {
            email: email.value,
            branch: branch.name,
            branchId: branch.id
          });
        }
        
        errorMessage.value = '';
        statusMessage.value = '🔄 Finalizing authentication...';

        // Update user's current branch context in Firebase
        await ICANUserService.updateUser(user.id, {
          currentBranch: branch.name,
          currentBranchId: branch.id,
          lastBranchAccess: new Date(),
          lastAuthMethod: 'firebase_online'
        });

        // ✅ SECURE: Store session using Capacitor Preferences (native) or localStorage (web)
        // This persists across app restarts - CRITICAL for APK!
        const sessionToken = {
          userId: user.id,
          email: user.email,
          branch: branch.name,
          branchId: branch.id,
          sessionStart: new Date().toISOString(),
          requiresOnline: true,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        // Save session using SecureStorage (Capacitor Preferences on native, localStorage on web)
        await SessionManager.saveSession(sessionToken);
        
        // Remove any old sessionStorage data (not reliable for APK)
        sessionStorage.removeItem('ican_session');
        sessionStorage.removeItem('user');
        
        console.log('✅ Session saved to secure storage (APK-compatible):', sessionToken);

        statusMessage.value = '✅ Authentication successful!';
        
        router.push({
          name: 'Dashboard',
          query: {
            branch: branch.name,
          },
        });
      } catch (error) {
        console.error('❌ Authentication error:', error);
        errorMessage.value = error.message || '❌ Authentication failed. Please check your internet connection and try again.';
        statusMessage.value = '';
        
        // Log authentication error
        await logUserActivity('unknown', 'AUTH_ERROR', {
          email: email.value,
          branch: selectedBranch.value,
          error: error.message
        }).catch(err => console.error('Failed to log error:', err));
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleSignUp = () => {
      router.push({
        path: '/signup',
        query: {
          branch: selectedBranch.value || ''
        }
      });
    };

    const handleBranchKeyDown = (branch, event) => {
      // When Enter is pressed on a branch button
      if (event.key === 'Enter' && isBranchAccessible(branch)) {
        event.preventDefault();
        selectBranch(branch);
        confirmBranchSelection();
      }
    };

    const handleModalEnterKey = (event) => {
      // When Enter is pressed anywhere in the modal (but not in search input)
      if (event.target.tagName !== 'INPUT' && selectedBranch.value && isBranchAccessible(selectedBranch.value)) {
        event.preventDefault();
        confirmBranchSelection();
      }
    };

    // Password Reset Functions
    const selectResetBranch = (branch) => {
      resetSelectedBranch.value = branch;
      showResetBranchSelection.value = false;
      resetErrorMessage.value = '';
      resetSuccessMessage.value = '';
    };

    const closePasswordResetModal = () => {
      showPasswordResetModal.value = false;
      showResetBranchSelection.value = false;
      resetSelectedBranch.value = '';
      currentPassword.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      showCurrentPassword.value = false;
      showNewPassword.value = false;
      showConfirmPassword.value = false;
      resetErrorMessage.value = '';
      resetSuccessMessage.value = '';
    };

    const handlePasswordReset = async () => {
      resetErrorMessage.value = '';
      resetSuccessMessage.value = '';

      // Validation
      if (!resetSelectedBranch.value) {
        resetErrorMessage.value = '❌ Please select a branch';
        return;
      }

      if (!currentPassword.value) {
        resetErrorMessage.value = '❌ Please enter the current password';
        return;
      }

      if (!newPassword.value) {
        resetErrorMessage.value = '❌ Please enter a new password';
        return;
      }

      if (newPassword.value.length < 6) {
        resetErrorMessage.value = '❌ New password must be at least 6 characters';
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        resetErrorMessage.value = '❌ New passwords do not match';
        return;
      }

      if (currentPassword.value === newPassword.value) {
        resetErrorMessage.value = '❌ New password must be different from current password';
        return;
      }

      isResettingPassword.value = true;

      try {
        console.log('🔐 Verifying current password for branch:', resetSelectedBranch.value);

        // Step 1: Verify current password
        const branch = await ICANBranchService.verifyBranchCredentials(
          resetSelectedBranch.value, 
          currentPassword.value
        );

        if (!branch) {
          resetErrorMessage.value = '❌ Current password is incorrect';
          isResettingPassword.value = false;
          return;
        }

        console.log('✅ Current password verified, updating to new password...');

        // Step 2: Update branch password in Firebase
        await ICANBranchService.updateBranchPassword(branch.id, newPassword.value);

        // Log the password reset activity
        await logUserActivity('system', 'PASSWORD_RESET', {
          branch: resetSelectedBranch.value,
          branchId: branch.id,
          timestamp: new Date().toISOString()
        }).catch(err => console.error('Failed to log password reset:', err));

        console.log('✅ Password reset successful for branch:', resetSelectedBranch.value);

        resetSuccessMessage.value = `✅ Password reset successful for ${resetSelectedBranch.value} branch! You can now login with your new password.`;
        
        // Clear form after success
        setTimeout(() => {
          closePasswordResetModal();
        }, 3000);

      } catch (error) {
        console.error('❌ Password reset error:', error);
        resetErrorMessage.value = error.message || '❌ Failed to reset password. Please try again.';
      } finally {
        isResettingPassword.value = false;
      }
    };

    return {
      branches,
      selectedBranch,
      email,
      password,
      showPassword,
      errorMessage,
      statusMessage,
      isPasswordStepVisible,
      isSubmitDisabled,
      isSubmitting,
      isLoadingBranches,
      isBranchAccessible,
      showBranchModal,
      branchSearchQuery,
      filteredBranches,
      selectBranch,
      confirmBranchSelection,
      handleBranchKeyDown,
      handleModalEnterKey,
      handleSubmit,
      handleSignUp,
      handleRefresh,
      backgroundImages,
      currentImageIndex,
      arrowDown,
      isRefreshing,
      isOnline,
      logUserActivity,
      // Password reset
      showPasswordResetModal,
      showResetBranchSelection,
      resetSelectedBranch,
      currentPassword,
      newPassword,
      confirmPassword,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      isResettingPassword,
      resetErrorMessage,
      resetSuccessMessage,
      selectResetBranch,
      closePasswordResetModal,
      handlePasswordReset,
    };
  },
});
</script>

<style scoped>
/* Background Carousel */
.background-carousel {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  min-height: 100dvh;
  z-index: 0;
  overflow: hidden;
}

.background-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

/* Mobile: Ensure background covers full viewport */
@media (max-width: 640px) {
  .background-carousel {
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
  }
  
  .background-image {
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
  }
}

/* Mobile: Disable zoom animation for better performance */
@media (min-width: 640px) {
  .background-image {
    animation: zoom 20s infinite;
  }
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  min-height: 100%;
  /* Mobile: Stronger overlay for better text readability */
  background: linear-gradient(135deg, 
    rgba(239, 246, 255, 0.88) 0%,
    rgba(224, 242, 254, 0.85) 25%,
    rgba(238, 242, 255, 0.88) 50%,
    rgba(224, 242, 254, 0.85) 75%,
    rgba(239, 246, 255, 0.88) 100%
  );
  z-index: 1;
}

/* Mobile: Ensure overlay covers full viewport */
@media (max-width: 640px) {
  .overlay {
    height: 100vh;
    min-height: 100vh;
    max-height: 100vh;
  }
}

/* Desktop: Lighter overlay */
@media (min-width: 640px) {
  .overlay {
    background: linear-gradient(135deg, 
      rgba(239, 246, 255, 0.75) 0%,
      rgba(224, 242, 254, 0.70) 25%,
      rgba(238, 242, 255, 0.75) 50%,
      rgba(224, 242, 254, 0.70) 75%,
      rgba(239, 246, 255, 0.75) 100%
    );
  }
}

/* Dark mode overlay */
.dark .overlay {
  background: linear-gradient(135deg, 
    rgba(2, 6, 23, 0.90) 0%,
    rgba(15, 23, 42, 0.92) 50%,
    rgba(30, 58, 138, 0.90) 100%
  );
}

@media (min-width: 640px) {
  .dark .overlay {
    background: linear-gradient(135deg, 
      rgba(2, 6, 23, 0.85) 0%,
      rgba(15, 23, 42, 0.88) 50%,
      rgba(30, 58, 138, 0.85) 100%
    );
  }
}

/* Zoom Animation for background images (Desktop only) */
@keyframes zoom {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

/* Fade Transition for image carousel */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Modal Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .animate-modal-in,
.modal-leave-active .animate-modal-in {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.modal-enter-from .animate-modal-in {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}

.modal-leave-to .animate-modal-in {
  transform: scale(0.95) translateY(20px);
  opacity: 0;
}

/* Pulse Slow Animation - Similar to SplashScreen */
@keyframes pulseSlow {
  0%, 100% {
    opacity: 0.25;
    transform: scale(1);
  }
  50% {
    opacity: 0.4;
    transform: scale(1.05);
  }
}

.animate-pulse-slow {
  animation: pulseSlow 4s ease-in-out infinite;
}

/* Float Animation for Particles - From SplashScreen */
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 0.3;
  }
  50% {
    transform: translateY(-100px) translateX(50px);
    opacity: 0.4;
  }
  90% {
    opacity: 0.3;
  }
  100% {
    transform: translateY(-200px) translateX(-50px);
    opacity: 0;
  }
}

.animate-float {
  animation: float linear infinite;
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.6);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(16, 185, 129, 0.8);
}

/* Firefox scrollbar */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(16, 185, 129, 0.6) rgba(0, 0, 0, 0.1);
}

/* Custom Refresh Indicator Styles */
.custom-refresh-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10000;
  display: flex;
  justify-content: center;
  padding-top: 20px;
  pointer-events: none;
}

.refresh-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 32px;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.3s ease-out;
}

.dark .refresh-indicator {
  background: rgba(30, 41, 59, 0.95);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.refresh-spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(16, 185, 129, 0.2);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.refresh-text {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #10b981;
  text-align: center;
}

.dark .refresh-text {
  color: #34d399;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>