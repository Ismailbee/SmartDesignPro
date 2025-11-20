<template>
  <div class="relative min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col touch-pan-x touch-pan-y touch-pinch-zoom">
    <!-- Header Bar -->
    <div class="bg-white dark:bg-slate-800 shadow-sm px-1 md:px-2 py-0.5 md:py-1.5">
      
      <!-- Mobile Layout (stacked, compact) -->
      <div class="md:hidden flex flex-col gap-0.5">
        <!-- Row 1: Back arrow, Title with all controls inline -->
        <div class="flex items-center justify-between gap-1">
          <div class="flex items-center gap-2 min-w-0 flex-1">
            <!-- Back Button -->
            <button
              class="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded transition-colors flex items-center justify-center flex-shrink-0"
              title="Go Back"
              @click="$router.go(-1)"
            >
              <svg class="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-xs font-bold text-slate-900 dark:text-white truncate">Invoice Preview</h1>
              <p class="text-[8px] text-slate-500 dark:text-slate-400">
                Invoice #{{ currentInvoiceNumber }}
                <span v-if="totalCopies > 1" class="text-blue-600 dark:text-blue-400"> (Copy {{ currentPage }}/{{ totalCopies }})</span>
                <span v-if="totalCopies > 1" class="ml-1 px-1 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-[6px] font-medium">
                  📝 Independent Data
                </span>
              </p>
            </div>
          </div>
          
          <!-- All controls inline -->
          <div class="flex items-center gap-1 flex-shrink-0">
            <!-- Zoom Controls -->
            <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
              <button
                :disabled="zoomLevel <= minZoom"
                class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom Out"
                @click="zoomOut"
              >
                <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              
              <span class="text-[8px] font-medium text-slate-700 dark:text-slate-300 min-w-[1.2rem] text-center">
                {{ Math.round(zoomLevel * 100) }}%
              </span>
              
              <button
                :disabled="zoomLevel >= maxZoom"
                class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom In"
                @click="zoomIn"
              >
                <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              
              <button
                class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="Fit to Screen"
                @click="autoFitZoom"
              >
                <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
            
            <!-- Copies Control -->
            <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
              <input
                v-model.number="totalCopies"
                type="number"
                min="1"
                max="100"
                step="1"
                class="w-6 h-4 text-[8px] text-center bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                title="Number of copies to generate"
                @input="validateCopiesInput"
                @blur="validateCopiesInput"
              />
              <div class="text-[7px] text-slate-500 dark:text-slate-400">
                {{ currentPage }}/{{ totalCopies }}
              </div>
              <div class="flex items-center gap-0.5">
                <button
                  :disabled="currentPage <= 1"
                  class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Previous Page"
                  @click="goToPreviousPage"
                >
                  <svg class="w-2 h-2 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  :disabled="currentPage >= totalCopies"
                  class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Next Page"
                  @click="goToNextPage"
                >
                  <svg class="w-2 h-2 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <!-- Undo/Redo Controls -->
            <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
              <button
                :disabled="!canUndo"
                class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                @click="undo"
              >
                <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                :disabled="!canRedo"
                class="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
                @click="redo"
              >
                <svg class="w-2.5 h-2.5 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Row 2: Navigation and Export buttons taking full width -->
        <div class="flex items-center gap-1">
          <!-- Navigation Buttons -->
          <div class="flex gap-1">
            <button
              class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-medium transition-colors"
              title="View saved invoices"
              @click="viewSavedInvoices"
            >
              📋 Saved
            </button>
            
            <button
              class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-medium transition-colors"
              title="Create new invoice"
              @click="createNewInvoice"
            >
              ➕ New
            </button>
          </div>
          
          <!-- Export Buttons taking remaining space -->
          <div class="flex gap-1 flex-1">
              <!-- Export Options Dropdown -->
              <div v-if="totalCopies > 1" ref="exportDropdownRef" class="relative">
                <button
                  class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors"
                  @click="toggleExportOptions"
                >
                  📄 Export ▼
                </button>
                <div v-if="showExportOptions" class="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
                  <button
                    class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-t"
                    :disabled="isExporting"
                    @click="showFilenameDialog('pdf-current'); closeExportOptions()"
                  >
                    📄 Current Page (PDF)
                  </button>
                  <button
                    class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                    :disabled="isExporting"
                    @click="showFilenameDialog('pdf-all'); closeExportOptions()"
                  >
                    📄 All Pages (PDF)
                  </button>
                  <button
                    class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                    :disabled="isExporting"
                    @click="showFilenameDialog('jpeg-current'); closeExportOptions()"
                  >
                    🖼️ Current Page (JPEG)
                  </button>
                  <button
                    class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-b"
                    :disabled="isExporting"
                    @click="showFilenameDialog('jpeg-all'); closeExportOptions()"
                  >
                    🖼️ All Pages (JPEG)
                  </button>
                </div>
              </div>
              
              <!-- Single Page Export Buttons -->
              <template v-else>
                <button
                  class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                  :disabled="isExporting"
                  @click="showFilenameDialog('pdf-current')"
                >
                  📄 Export PDF
                </button>
                <button
                  class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                  :disabled="isExporting"
                  @click="showFilenameDialog('jpeg-current')"
                >
                  🖼️ Export JPEG
                </button>
              </template>
              
              <button
                class="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                :disabled="isExporting"
                @click="handleSaveInvoice"
              >
                💾 Save Invoice
              </button>
            </div>
          </div>
        </div>
        
        <!-- Desktop Layout (horizontal, spacious) -->
        <div class="hidden md:flex items-center justify-between gap-3">
          <!-- Left side: Back button and Title -->
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <!-- Back Button -->
            <button
              class="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded transition-colors flex items-center justify-center"
              title="Go Back"
              @click="$router.go(-1)"
            >
              <svg class="w-4 h-4 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 class="text-sm font-bold text-slate-900 dark:text-white truncate">Invoice Preview</h1>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">
                Invoice #{{ currentInvoiceNumber }}
                <span v-if="totalCopies > 1" class="text-blue-600 dark:text-blue-400"> (Copy {{ currentPage }}/{{ totalCopies }})</span>
                <span v-if="totalCopies > 1" class="ml-1 px-1.5 py-0.5 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded text-[8px] font-medium">
                  📝 Independent Data
                </span>
              </p>
            </div>
          </div>
          
          <!-- Center: Controls -->
          <div class="flex items-center gap-2">
            <!-- Zoom Controls -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-1">
              <button
                :disabled="zoomLevel <= minZoom"
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom Out"
                @click="zoomOut"
              >
                <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                </svg>
              </button>
              
              <span class="text-[10px] font-medium text-slate-700 dark:text-slate-300 min-w-[2rem] text-center">
                {{ Math.round(zoomLevel * 100) }}%
              </span>
              
              <button
                :disabled="zoomLevel >= maxZoom"
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Zoom In"
                @click="zoomIn"
              >
                <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
              </button>
              
              <button
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
                title="Fit to Screen"
                @click="autoFitZoom"
              >
                <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
            
            <!-- Copies Control -->
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-1">
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
              <div class="text-[9px] text-slate-500 dark:text-slate-400 px-1">
                {{ currentPage }}/{{ totalCopies }}
              </div>
              <div class="flex items-center gap-0.5 ml-1">
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
            
            <!-- Undo/Redo Controls -->
            <div class="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded p-1">
              <button
                :disabled="!canUndo"
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
                @click="undo"
              >
                <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </button>
              
              <button
                :disabled="!canRedo"
                class="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
                @click="redo"
              >
                <svg class="w-3 h-3 text-slate-700 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Right side: Export buttons -->
          <div class="flex gap-1.5">
            <!-- Export Options Dropdown -->
            <div v-if="totalCopies > 1" ref="exportDropdownRef" class="relative">
              <button
                class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors"
                @click="toggleExportOptions"
              >
                📄 Export ▼
              </button>
              <div v-if="showExportOptions" class="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg z-10">
                <button
                  class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-t"
                  :disabled="isExporting"
                  @click="showFilenameDialog('pdf-current'); closeExportOptions()"
                >
                  📄 Current Page (PDF)
                </button>
                <button
                  class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                  :disabled="isExporting"
                  @click="showFilenameDialog('pdf-all'); closeExportOptions()"
                >
                  📄 All Pages (PDF)
                </button>
                <button
                  class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300"
                  :disabled="isExporting"
                  @click="showFilenameDialog('jpeg-current'); closeExportOptions()"
                >
                  🖼️ Current Page (JPEG)
                </button>
                <button
                  class="block w-full text-left px-3 py-2 text-[10px] hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-50 text-gray-700 dark:text-gray-300 rounded-b"
                  :disabled="isExporting"
                  @click="showFilenameDialog('jpeg-all'); closeExportOptions()"
                >
                  🖼️ All Pages (JPEG)
                </button>
              </div>
            </div>
            
            <!-- Single Page Export Buttons -->
            <template v-else>
              <button
                class="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                :disabled="isExporting"
                @click="showFilenameDialog('pdf-current')"
              >
                📄 Export PDF
              </button>
              <button
                class="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
                :disabled="isExporting"
                @click="showFilenameDialog('jpeg-current')"
              >
                🖼️ Export JPEG
              </button>
            </template>
            
            <button
              class="px-2.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-medium transition-colors disabled:opacity-50"
              :disabled="isExporting"
              @click="handleSaveInvoice"
            >
              💾 Save Invoice
            </button>
          </div>
        </div>
      </div>

    <!-- Filename Customization Modal -->
    <div v-if="showFilenameModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Customize Export Name</h3>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            File Name:
          </label>
          <input 
            v-model="customFilename"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Enter filename"
            @keydown.enter="confirmExport"
          />
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Extension will be added automatically (.pdf or .jpg)
          </p>
        </div>
        
        <div class="mb-4">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Export Type:
          </label>
          <div class="text-sm text-slate-600 dark:text-slate-400">
            {{ pendingExportType === 'pdf-current' ? '📄 PDF - Current Page' : 
               pendingExportType === 'pdf-all' ? '📄 PDF - All Pages' :
               pendingExportType === 'jpeg-current' ? '🖼️ JPEG - Current Page' :
               pendingExportType === 'jpeg-all' ? '🖼️ JPEG - All Pages' : 'Unknown' }}
          </div>
        </div>
        
        <div class="flex gap-3 justify-end">
          <button 
            @click="cancelExport"
            class="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="confirmExport"
            :disabled="!customFilename.trim()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
          >
            Export
          </button>
        </div>
      </div>
    </div>

    <!-- Text Picker Hint -->
    <div 
      v-if="isTextPickerMode && selectedElementIds.length === 0"
      class="absolute top-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg z-40 text-sm flex items-center gap-2 animate-bounce"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      Click any text to select • Hold Ctrl/Cmd for multi-select
    </div>

    <!-- Multi-select Status -->
    <div 
      v-if="isTextPickerMode && selectedElementIds.length > 1"
      class="absolute top-20 right-4 bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg z-40 text-sm flex items-center gap-2"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Multi-Select Active: {{ selectedElementIds.length }} items
    </div>

    <!-- Invoice Preview Section - always visible on all screen sizes -->
    <section 
      class="w-full overflow-auto flex items-start justify-center pb-[30vh] pt-[2vh]"
    >
      <!-- Wrapper - maintains actual size, uses zoom controls only -->
      <div 
        class="flex items-center justify-center" 
        :style="{ 
          transform: `scale(${zoomLevel})`, 
          transformOrigin: 'top center',
          height: `${invoiceHeight}in`,
          maxHeight: `${invoiceHeight}in`
        }"
      >
        <div
          id="meblink-invoice"
          ref="invoiceRef"
          class="relative bg-white flex flex-col mx-auto overflow-hidden"
          :style="{
            width: `${invoiceWidth}in`,
            height: `${invoiceHeight}in`,
            boxShadow: '0 0 15px rgba(0,0,0,0.1)',
            fontFamily: selectedFont,
            fontSize: baseFontSize + 'px'
          }"
        >
          <div 
            ref="contentWrapperRef"
            class="absolute inset-0"
            :style="{ transform: `scale(${contentScale})`, transformOrigin: 'top left' }"
          >
            <div class="invoice-content-wrapper flex flex-col h-full w-full" :style="{ padding: dynamicPadding, minHeight: '100%', gap: dynamicGap }">
         <!-- Header -->
        <div class="text-center border-b border-black flex-shrink-0" :style="{ paddingBottom: headerPadding }">
          <div class="flex items-center justify-center">
            <!-- Logo (Dynamically scales with invoice height) -->
            <div v-if="logoDataUrl" class="flex justify-center mr-3">
              <img 
                :src="logoDataUrl" 
                alt="Logo" 
                class="object-contain" 
                :style="{ 
                  height: `${logoHeight}px`
                }"
                @error="logoDataUrl = null" 
              />
            </div>
            
          
             <!-- Organization Name (Dynamically scales with invoice height) - Only show if any org info exists -->
            <div v-if="businessNumber?.trim() || organizationName?.trim() || organizationSubName?.trim()" class="w-auto text-center items-center max-w-[420px]" style="margin: 0; padding: 0;">
                 <!-- Business Number (BN) - Only show if filled -->
            <div v-if="businessNumber?.trim()">
                <p 
                class="text-right text-slate-900 dark:text-slate-100"
                :style="{ 
                  fontSize: '10px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }"
              >
                <strong>BN:</strong> {{ businessNumber }}
              </p>
            </div>
              <h2 
                v-if="organizationName?.trim()"
                class="font-bold text-left"
                :style="{ 
                  color: colorStyles.organizationTextColor,
                  fontFamily: 'Arial Narrow, Roboto Condensed, Oswald, sans-serif',
                  fontWeight: 900,
                  fontSize: organizationNameFontSize,
                  letterSpacing: '-0.5px',
                  marginTop: '0',
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }"
              >
                {{ organizationName }}
              </h2>

              <p 
                v-if="organizationSubName?.trim()"
                class="text-left mt-[-8px] text-slate-900 dark:text-slate-100"
                style="margin: 0; padding: 0;"
                :style="{ 
                  fontSize: organizationSubFontSize,
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }"
              >
                {{ organizationSubName }}
              </p>
              
           
              
            </div>
        
        </div>
        
      </div>
     
      <!-- Address Section - Only show if any address info is provided -->
      <!-- Address Section - Only show if ANY address or phone info exists -->
      <div v-if="headOfficeAddress?.trim() || headOfficePhone?.trim() || branchAddress1?.trim() || branch1Phone?.trim() || branchAddress2?.trim() || branch2Phone?.trim()" class="flex items-center justify-between mt-1 pl-4">
       
        <!-- Head Office Address & Phone - Only show if filled -->
        <div v-if="headOfficeAddress?.trim() || headOfficePhone?.trim()" class="max-w-[280px] text-center mx-auto" style="margin: 0; padding: 0;">
          <!-- Head Office Address -->
          <div v-if="headOfficeAddress?.trim()" class="text-left">
            <strong 
              class="text-slate-900 dark:text-slate-100"
              :style="{ 
                fontSize: addressFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >Head Office Address:</strong>
            <span 
              class="text-slate-900 dark:text-slate-100 ml-1"
              :style="{ 
                fontSize: addressFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >{{ headOfficeAddress }}</span>
          </div>
          
          <!-- Head Office Phone -->
          <div 
            v-if="headOfficePhone?.trim()"
            class="text-left mt-0.5"
          >
            <strong 
              class="font-bold text-slate-900 dark:text-slate-100"
              :style="{ 
                fontSize: phoneFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >Tel:</strong>
            <span 
              class="font-bold text-slate-900 dark:text-slate-100 ml-1"
              :style="{ 
                fontSize: phoneFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >{{ headOfficePhone }}</span>
          </div>
        </div>
       
        <!-- Branch Address 1 (Only show if filled) -->
        <div v-if="branchAddress1?.trim() || branch1Phone?.trim()" class="max-w-[280px] text-center ml-2 mx-auto">
          <!-- Branch 1 Address -->
          <div v-if="branchAddress1?.trim()" class="text-left">
            <strong 
              class="text-slate-900 dark:text-slate-100"
              :style="{ 
                fontSize: addressFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >Branch Address 1:</strong>
            <span 
              class="text-slate-900 dark:text-slate-100 ml-1"
              :style="{ 
                fontSize: addressFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >{{ branchAddress1 }}</span>
          </div>
          
          <!-- Branch 1 Phone -->
          <div 
            v-if="branch1Phone?.trim()"
            class="text-left mt-0.5"
          >
            <strong 
              class="font-bold text-slate-900 dark:text-slate-100"
              :style="{ 
                fontSize: phoneFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >Tel:</strong>
            <span 
              class="font-bold text-slate-900 dark:text-slate-100 ml-1"
              :style="{ 
                fontSize: phoneFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >{{ branch1Phone }}</span>
          </div>
        </div>

        <!-- Branch Address 2 (Only show if filled) -->
        <div v-if="branchAddress2?.trim() || branch2Phone?.trim()" class="max-w-[280px] text-center ml-2 mx-auto">
          <!-- Branch 2 Address -->
          <div v-if="branchAddress2?.trim()" class="text-left">
            <strong 
              class="text-slate-900 dark:text-slate-100"
              :style="{ 
                fontSize: addressFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >Branch Address 2:</strong>
            <span 
              class="text-slate-900 dark:text-slate-100 ml-1"
              :style="{ 
                fontSize: addressFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >{{ branchAddress2 }}</span>
          </div>
          
          <!-- Branch 2 Phone -->
          <div 
            v-if="branch2Phone?.trim()"
            class="text-left mt-0.5"
          >
            <strong 
              class="font-bold text-slate-900 dark:text-slate-100"
              :style="{ 
                fontSize: phoneFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >Tel:</strong>
            <span 
              class="font-bold text-slate-900 dark:text-slate-100 ml-1"
              :style="{ 
                fontSize: phoneFontSize,
                wordWrap: 'break-word', 
                wordBreak: 'break-word', 
                whiteSpace: 'normal' 
              }"
            >{{ branch2Phone }}</span>
          </div>
        </div>
      
      </div>
        
          <!-- Receipt Title -->
          <div class="flex justify-center items-center my-2">
            <div class="flex items-center justify-center gap-4">
              <p 
                class="text-sm font-semibold inline-block px-3 py-1 rounded"
                :style="{
                  background: colorStyles.accentColor,
                  color: colorStyles.headerText
                }"
              >
                CASH/CREDIT INVOICE
              </p>
              
              <div class="flex items-center gap-1">
                <span class="text-base font-bold">No.:</span>
                <div class="text-center text-lg font-bold">
                  {{ currentInvoiceNumber }}
                </div>
              </div>
            </div>
          </div>

        <!-- Customer details -->
        <div class="mt-2 grid grid-cols-3 gap-3">
          <div 
            class="col-span-2 rounded-xl p-1.5 border-black"
            style="border: 1.5px solid #000000"
          >
            <div class="flex items-center gap-1">
            <span class="text-[10px] text-black font-medium">Name:</span>
            <div class="print-only flex-1 text-[11px] border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important;">{{ customerName || '-' }}</div>
            <input
              v-model="customerName"
              placeholder=" "
              class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none text-[11px]"
            />
          </div>

          <div class="flex items-center gap-1">
            <span class="text-[10px] text-black font-medium">Address:</span>
            <div class="print-only flex-1 text-[11px] border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important;">{{ customerAddress || '-' }}</div>
            <input
              v-model="customerAddress"
              placeholder=" "
              class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none text-[11px]"
            />
          </div>
          </div>

          <div 
            class="rounded-xl p-1.5 border-black"
            style="border: 1.5px solid #000000"
          >
            <div class="flex items-center gap-1">
           <span class="text-[10px] text-black font-medium">Date:</span>
           <div class="print-only w-full text-[11px] border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important;">{{ date || '-' }}</div>
                <input
                  v-model="date"
                  type="text"
                  :disabled="autoDate"
                  placeholder=" "
                  class="no-print w-full bg-transparent border-b border-dotted border-black focus:outline-none text-[11px]"
                />
          </div>

          <div class="flex items-center gap-1">
            <span class="text-[10px] text-black font-medium whitespace-nowrap">L.P.O No.:</span>
            <div class="print-only w-full text-[11px] border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important;">{{ lpo || '-' }}</div>
            <input
              v-model="lpo"
              placeholder=" "
              class="no-print w-full bg-transparent border-b border-dotted border-black focus:outline-none text-[11px]"
            />
          </div>
          </div>


         
        </div>

        <!-- Table -->
        <div class="flex-grow overflow-hidden rounded relative" :style="{ marginTop: dynamicSpacing }">
          <table class="w-full text-xs table-fixed border-collapse overflow-visible h-full">
            <thead 
              class="uppercase text-[10px]"
              :style="{
                background: colorStyles.tableHeaderBg,
                color: colorStyles.tableHeaderText
              }"
            >
              <tr>
                <th class="w-[7.8%] px-1.5 py-1 text-center" style="border-top: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-left: 1px solid #000000;">QTY</th>
                <th :class="invoiceData.taxEnabled ? 'w-[56%]' : 'w-[64%]'" class="px-1.5 py-1 text-left" style="border-top: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-left: 1px solid #ffffff;">DESCRIPTION OF GOODS</th>
                <th :class="invoiceData.taxEnabled ? 'w-[9%]' : 'w-[17%]'" class="px-1.5 py-1 text-center" style="border-top: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-left: 1px solid #ffffff;">RATE</th>
                <th v-if="invoiceData.taxEnabled" class="w-[8%] px-1.5 py-1 text-center" style="border-top: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-left: 1px solid #ffffff;">TAX%</th>
                <th class="w-[16%] px-1.5 py-1 text-center" style="border-top: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-left: 1px solid #ffffff;">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in items" :key="item.id" class="border-t border-black hover:bg-slate-50 transition-colors group" :style="{ height: tableRowHeight }">
                <td class="px-1.5 py-2 text-center align-middle border-black" :style="{ height: tableRowHeight, border: '1px solid #000000' }">
                  <div 
                    class="w-full h-auto text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight"
                    contenteditable="true"
                    @blur="item.quantity = parseFloat($event.target.textContent) || 0"
                    @keydown.enter.prevent="$event.target.blur()"
                  >{{ item.quantity && item.quantity !== 0 ? item.quantity : '' }}</div>
                </td>
                <td class="px-1.5 py-2 align-middle border-black" :style="{ height: tableRowHeight, border: '1px solid #000000' }">
                  <div 
                    class="w-full h-auto bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight"
                    contenteditable="true"
                    @blur="item.description = $event.target.textContent"
                    @keydown.enter.prevent="addItemAfter(index)"
                  >{{ item.description || '' }}</div>
                </td>
                <td class="px-1.5 py-2 text-right align-middle border-black" :style="{ height: tableRowHeight, border: '1px solid #000000' }">
                  <div 
                    class="w-full h-auto text-right bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight"
                    contenteditable="true"
                    @blur="item.price = parseFloat($event.target.textContent) || 0"
                    @keydown.enter.prevent="$event.target.blur()"
                  >{{ item.price && item.price !== 0 ? item.price.toFixed(2) : '' }}</div>
                </td>
                <td v-if="invoiceData.taxEnabled" class="px-1.5 py-2 text-center align-middle border-black" :style="{ height: tableRowHeight, border: '1px solid #000000' }">
                  <div 
                    class="w-full h-auto text-center bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded text-[11px] leading-tight"
                    contenteditable="true"
                    @blur="item.tax = parseFloat($event.target.textContent) || 0"
                    @keydown.enter.prevent="$event.target.blur()"
                  >{{ item.tax && item.tax !== 0 ? item.tax : '' }}</div>
                </td>
                <td class="px-1.5 py-2 text-right font-semibold align-middle relative overflow-visible text-[11px] border-black" :style="{ height: tableRowHeight, border: '1px solid #000000' }">
                  <div class="h-auto leading-tight">
                    {{ item.description && item.description.trim() ? toCurrency(getItemAmount(item)) : '' }}
                  </div>
                  <!-- Delete button absolutely positioned on right edge -->
                  <button 
                    v-if="items.length > 1"
                    class="absolute right-[-13px] top-1/2 -translate-y-1/2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all duration-200 w-5 h-5 flex items-center justify-center text-lg font-bold hover:scale-110 z-50"
                    title="Remove item"
                    @click="removeItem(item.id)"
                  >
                    ×
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Add button absolutely positioned at bottom left -->
          <button 
            :disabled="items.length >= MAX_ITEMS"
            class="absolute left-[-13px] bottom-0 translate-y-1/2 text-emerald-400 hover:text-emerald-600 disabled:text-gray-300 disabled:cursor-not-allowed opacity-0 hover:opacity-100 transition-all duration-200 w-6 h-6 flex items-center justify-center text-2xl font-bold hover:scale-110 z-50 bg-white rounded-full shadow-md border border-emerald-300 disabled:border-gray-300"
            :title="items.length >= MAX_ITEMS ? `Maximum ${MAX_ITEMS} items allowed` : 'Add new item'"
            @click="addItem"
          >
            +
          </button>
        </div>

        <!-- Total -->
        <div class="flex  font-bold text-slate-900 text-base">
        <div class="flex-1 justify-start" :style="{ fontSize: addressFontSize }">
            <p class="m-0" >Received the above Goods in a good condition</p>    
          <p class="mt-[-10px]" >No refund of money after payment.</p>    
        
        </div>
          <div class="flex-1 justify-end flex">
          <span class="mr-5">TOTAL</span>
              <span>{{ toCurrency(grandTotal) }}</span>
       
        </div>  
        </div>

        <!-- Footer -->
        <div class="mt-auto" :style="{ fontSize: footerFontSize }">

          <div>
            <div class="flex items-center gap-1">
            <span class="flex whitespace-nowrap font-medium">Amount in words:</span>
            <div class="print-only flex-1 border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important; font-size: 0.9em;">{{ sumOf || '-' }}</div>
            <input
              ref="sumOfInput1"
              v-model="sumOf"
              class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
              style="font-size: 0.9em;"
              @input="handleSumOfOverflow"
            />
          </div>

          <div class="flex items-center h-7 gap-2">
            <div class="print-only flex-1 border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important; font-size: 0.9em;">{{ sumOf2 || '-' }}</div>
            <input
              ref="sumOfInput2"
              v-model="sumOf2"
              type="text"
              class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none"
              style="font-size: 0.9em;"
              @input="handleSumOf2Input"
            />
            <span class="font-medium">Naira</span>
            <div class="w-14 bg-transparent border-b border-dotted border-black flex items-center justify-center text-center">
              <span class="font-medium">Only</span>
            </div>
            <span class="font-medium">Kobo</span>
          </div>

          </div>

           <div class="flex justify-between items-start" :style="{ marginTop: dynamicSpacing, minHeight: 0, flex: '0 0 auto' }">
           
            <!-- Signature 1 -->
            <div class="flex flex-col items-center gap-1 mt-[-20px]">
              <!-- Signature 1 Image -->
              <div v-if="signatureImage1" class="flex items-center" :style="{ height: signatureHeight }">
                <img :src="signatureImage1" alt="Signature 1" class="w-auto object-contain" :style="{ height: signatureImageHeight, maxWidth: '180px' }" />
              </div>

              <div v-else class="flex items-center justify-center" :style="{ height: signatureHeight, width: '7rem' }">
                <!-- Empty space for signature -->
              </div>

             <div class="w-full border-t border-black text-center mt-[-28px]">
               <p class="italic text-[10px]">Signature</p>
             </div> 
            </div>

            <!-- Thanks for your patronage -->
             <div class="mt-2 text-emerald-600 text-center font-medium text-[10px]">Thanks for your patronage</div>

          <!-- Signature 2 -->
            <div class="flex flex-col items-center gap-1 mt-[-20px]">
              <!-- Signature 2 Image -->
              <div v-if="signatureImage2" class="flex items-center" :style="{ height: signatureHeight }">
                <img :src="signatureImage2" alt="Signature 2" class="w-auto object-contain" :style="{ height: signatureImageHeight, maxWidth: '180px' }" />
              </div>

              <div v-else class="flex items-center justify-center" :style="{ height: signatureHeight, width: '7rem' }">
                <!-- Empty space for signature -->
              </div>

             <div class="w-full border-t border-black text-center mt-[-28px]">
               <p class="italic text-[10px]">Signature</p>
             </div> 
            </div>
          </div>
        </div>
        <!-- End of Footer -->

      </div>
      <!-- End of invoice-content-wrapper -->
    </div>
    <!-- End of contentWrapperRef -->
  </div>
  <!-- End of meblink-invoice -->
</div>
<!-- End of mobile wrapper -->
</section>
<!-- End of Invoice Preview Section -->

    <!-- Settings Panel - Compact & Organized -->
    <Transition name="slide-up">
      <div 
        v-if="showSettings"
        class="absolute left-0 right-0 bottom-0 z-50"
      >
        <div class="bg-white dark:bg-slate-800 w-full max-h-[65vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 dark:border-slate-700 shadow-lg">
          <!-- Header -->
          <div class="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-3 py-2 flex items-center justify-between">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              Invoice Settings
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
          
          <div class="p-3 space-y-3">
            <div class="flex justify-between px-16">
              <!-- Size Settings -->
            <div class="flex items-center gap-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Width</label>
              <input
                v-model.number="invoiceWidth"
                type="number"
                min="3"
                max="20"
                step="0.1"
                class="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            
            <div class="flex items-center gap-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Height</label>
              <input
                v-model.number="invoiceHeight"
                type="number"
                min="3"
                max="20"
                step="0.1"
                class="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <!-- Font Size -->
            <div class="flex items-center gap-1">
              <label class="text-xs font-medium text-slate-700 dark:text-slate-300">Font</label>
              <input
                v-model.number="baseFontSize"
                type="number"
                min="8"
                max="20"
                step="1"
                class="w-12 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                @change="handleFontSizeChange"
              />
              <span class="text-[10px] text-slate-600 dark:text-slate-400">px</span>
            </div>
            </div>

           
            <div>
                 <!-- Font Family & Quick Presets -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Font Family</label>
                <select
                  v-model="selectedFont"
                  class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  @change="handleFontChange"
                >
                  <option value="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Inter (Modern)</option>
                  <option value="Arial, Helvetica, sans-serif">Arial (Classic)</option>
                  <option value="Helvetica, 'Helvetica Neue', Arial, sans-serif">Helvetica (Clean)</option>
                  <option value="Georgia, 'Times New Roman', Times, serif">Georgia (Professional)</option>
                  <option value="'Times New Roman', Times, serif">Times New Roman</option>
                  <option value="Roboto, 'Segoe UI', Arial, sans-serif">Roboto (Google)</option>
                  <option value="Montserrat, 'Segoe UI', Arial, sans-serif">Montserrat (Modern)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Quick Font Sizes</label>
                <div class="flex gap-1">
                  <button
                    v-for="preset in fontSizePresets"
                    :key="preset.name"
                    class="px-2 py-1 text-[10px] border rounded transition-colors"
                    :class="baseFontSize === preset.size 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'border-blue-300 hover:bg-blue-100 dark:border-blue-600 dark:hover:bg-blue-800'"
                    @click="setFontSizePreset(preset.size)"
                  >
                    {{ preset.name }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Selected Element Controls (Single or Multiple) -->
            <div v-if="selectedElementId || selectedElementIds.length > 0" class="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <div class="flex items-center justify-between mb-2">
                <span v-if="selectedElementIds.length <= 1" class="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                  Selected: {{ selectedElementId || selectedElementIds[0] }}
                </span>
                <span v-else class="text-xs font-medium text-yellow-800 dark:text-yellow-300">
                  Multi-Select: {{ selectedElementIds.length }} elements
                  <span class="text-[10px] block mt-1">{{ selectedElementIds.slice(0, 3).join(', ') }}{{ selectedElementIds.length > 3 ? '...' : '' }}</span>
                </span>
                <div class="flex gap-1 flex-wrap">
                  <button
                    class="px-2 py-1 text-[10px] bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center gap-1"
                    @click="selectedElementIds.length > 1 ? applyStylesToSelectedElements() : applySelectedElementStyles()"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Apply {{ selectedElementIds.length > 1 ? 'All' : '' }}
                  </button>
                  <button
                    class="px-2 py-1 text-[10px] bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors flex items-center gap-1"
                    @click="selectedElementIds.length > 1 ? resetSelectedElements() : resetSelectedElementStyles()"
                  >
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset {{ selectedElementIds.length > 1 ? 'All' : '' }}
                  </button>
                  <button
                    v-if="selectedTextElement && elementStyles[selectedElementId]?.autoAdjusted"
                    class="px-2 py-1 text-[10px] bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                    title="Reset automatic font adjustment"
                    @click="resetAutoAdjustment(selectedTextElement)"
                  >
                    Reset Auto
                  </button>
                  <!-- Multi-select controls (always show when multiple items) -->
                  <div v-if="selectedElementIds.length > 1" class="flex gap-1">
                    <button
                      class="px-2 py-1 text-[10px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1"
                      @click="selectAllText"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Select All
                    </button>
                    <button
                      class="px-2 py-1 text-[10px] bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex items-center gap-1"
                      @click="clearAllSelections"
                    >
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">Element Font</label>
                  <select
                    v-model="selectedElementStyles.fontFamily"
                    class="w-full px-1 py-0.5 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700"
                  >
                    <option value="Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">Inter</option>
                    <option value="Arial, Helvetica, sans-serif">Arial</option>
                    <option value="Georgia, 'Times New Roman', Times, serif">Georgia</option>
                    <option value="'Times New Roman', Times, serif">Times</option>
                  </select>
                </div>
                
                <div>
                  <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">Font Size</label>
                  <input
                    v-model.number="selectedElementStyles.fontSize"
                    type="number"
                    min="8"
                    max="32"
                    class="w-full px-2 py-1 text-[10px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700"
                  />
                </div>
                
                <div>
                  <label class="block text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">CMYK Colors</label>
                  <div class="flex gap-1">
                    <!-- Quick CMYK Color Buttons -->
                    <button
                      @click="selectedElementStyles.cmykColor = 'cyan'; applyQuickColor('cyan')"
                      class="w-6 h-6 bg-cyan-500 hover:bg-cyan-600 rounded border-2 transition-all"
                      :class="selectedElementStyles.cmykColor === 'cyan' ? 'border-white shadow-lg scale-110' : 'border-gray-300'"
                      title="Cyan"
                    ></button>
                    <button
                      @click="selectedElementStyles.cmykColor = 'magenta'; applyQuickColor('magenta')"
                      class="w-6 h-6 bg-pink-500 hover:bg-pink-600 rounded border-2 transition-all"
                      :class="selectedElementStyles.cmykColor === 'magenta' ? 'border-white shadow-lg scale-110' : 'border-gray-300'"
                      title="Magenta"
                    ></button>
                    <button
                      @click="selectedElementStyles.cmykColor = 'yellow'; applyQuickColor('yellow')"
                      class="w-6 h-6 bg-yellow-400 hover:bg-yellow-500 rounded border-2 transition-all"
                      :class="selectedElementStyles.cmykColor === 'yellow' ? 'border-white shadow-lg scale-110' : 'border-gray-300'"
                      title="Yellow"
                    ></button>
                    <button
                      @click="selectedElementStyles.cmykColor = 'black'; applyQuickColor('black')"
                      class="w-6 h-6 bg-black hover:bg-gray-800 rounded border-2 transition-all"
                      :class="selectedElementStyles.cmykColor === 'black' ? 'border-white shadow-lg scale-110' : 'border-gray-300'"
                      title="Black"
                    ></button>
                  </div>
                </div>
              </div>
            </div>

            </div>
            <!-- Compact Layout: Size + Basic Settings -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">

              <!-- Text Picker Toggle -->
              <button
                @click="toggleTextPickerMode"
                class="px-2 py-0.5 text-xs font-medium rounded transition-all duration-200 flex items-center gap-1"
                :class="isTextPickerMode 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                {{ isTextPickerMode ? 'Exit Picker' : 'Text Picker' }}
              </button>

              <!-- Selection Count (shown when items are selected) -->
              <div 
                v-if="isTextPickerMode && selectedElementIds.length > 0"
                class="px-2 py-0.5 text-xs font-medium rounded bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 flex items-center gap-1"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ selectedElementIds.length }} Selected
              </div>
            </div>

         
            <!-- CMYK Color Settings (Condensed) -->
            <div class="p-2 bg-gradient-to-r from-orange-50 to-purple-50 dark:from-orange-900/20 dark:to-purple-900/20 rounded-lg border border-orange-200 dark:border-orange-700">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Print Mode</label>
                  <select
                    v-model="colorMode"
                    class="w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="full-color">Full Color (CMYK)</option>
                    <option value="two-color">Two Color</option>
                    <option value="one-color">One Color</option>
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Color Preview</label>
                  <div class="flex items-center gap-1 p-1 border border-gray-300 rounded bg-white dark:bg-slate-700">
                    <div v-if="colorMode === 'full-color'" class="flex gap-0.5">
                      <div class="w-3 h-3 bg-cyan-500 rounded" title="C"></div>
                      <div class="w-3 h-3 bg-magenta-500 rounded" title="M"></div>
                      <div class="w-3 h-3 bg-yellow-400 rounded" title="Y"></div>
                      <div class="w-3 h-3 bg-black rounded" title="K"></div>
                    </div>
                    <div v-else-if="colorMode === 'two-color'" class="flex gap-0.5">
                      <div 
                        :style="{ backgroundColor: cmykToRgbCss(customColor1CMYK.c, customColor1CMYK.m, customColor1CMYK.y, customColor1CMYK.k) }"
                        class="w-3 h-3 rounded border"
                      ></div>
                      <div 
                        :style="{ backgroundColor: cmykToRgbCss(customColor2CMYK.c, customColor2CMYK.m, customColor2CMYK.y, customColor2CMYK.k) }"
                        class="w-3 h-3 rounded border"
                      ></div>
                    </div>
                    <div v-else class="flex gap-0.5">
                      <div 
                        :style="{ backgroundColor: cmykToRgbCss(customColor1CMYK.c, customColor1CMYK.m, customColor1CMYK.y, customColor1CMYK.k) }"
                        class="w-3 h-3 rounded border"
                      ></div>
                    </div>
                    <span class="text-[9px] text-slate-600 dark:text-slate-400 ml-1">{{ colorMode.replace('-', ' ').toUpperCase() }}</span>
                  </div>
                </div>

                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Signatures</label>
                  <div class="grid grid-cols-2 gap-1 mb-1">
                    <!-- Signature 1 Dropdown -->
                    <div>
                      <label class="block text-[9px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Signature 1</label>
                      <select
                        v-model="selectedSignature1"
                        class="w-full px-1 py-0.5 text-[9px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700"
                        @change="handleSignature1Change"
                      >
                        <option value="">None</option>
                        <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">{{ sig.name }}</option>
                      </select>
                    </div>
                    
                    <!-- Signature 2 Dropdown -->
                    <div>
                      <label class="block text-[9px] font-medium text-slate-700 dark:text-slate-300 mb-0.5">Signature 2</label>
                      <select
                        v-model="selectedSignature2"
                        class="w-full px-1 py-0.5 text-[9px] border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700"
                        @change="handleSignature2Change"
                      >
                        <option value="">None</option>
                        <option v-for="sig in savedSignatures" :key="sig.id" :value="sig.id">{{ sig.name }}</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    class="w-full px-2 py-0.5 text-[10px] bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                    @click="handleCreateSignature"
                  >
                    + Create New Signature
                  </button>
                </div>
              </div>

              <!-- CMYK Sliders (Compact) - Only show for custom colors -->
              <div v-if="colorMode !== 'full-color'" class="mt-2 pt-2 border-t border-orange-200 dark:border-orange-700">
                <div class="text-[10px] font-medium text-slate-700 dark:text-slate-300 mb-1">Primary Color (CMYK)</div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-1">
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] text-cyan-600 w-4">C:</span>
                    <input v-model.number="customColor1CMYK.c" type="range" min="0" max="100" class="flex-1 h-1" />
                    <span class="text-[9px] w-6">{{ customColor1CMYK.c }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] text-pink-600 w-4">M:</span>
                    <input v-model.number="customColor1CMYK.m" type="range" min="0" max="100" class="flex-1 h-1" />
                    <span class="text-[9px] w-6">{{ customColor1CMYK.m }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] text-yellow-600 w-4">Y:</span>
                    <input v-model.number="customColor1CMYK.y" type="range" min="0" max="100" class="flex-1 h-1" />
                    <span class="text-[9px] w-6">{{ customColor1CMYK.y }}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <span class="text-[9px] text-slate-800 w-4">K:</span>
                    <input v-model.number="customColor1CMYK.k" type="range" min="0" max="100" class="flex-1 h-1" />
                    <span class="text-[9px] w-6">{{ customColor1CMYK.k }}</span>
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
import { defineComponent, ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import html2pdf from 'html2pdf.js';
import * as htmlToImage from 'html-to-image';
import { getAllSignatures } from '@/firebase/database';

export default defineComponent({
  name: 'InvoicePreviewPage',
  setup() {
    const router = useRouter();
    const invoiceRef = ref(null);
    const contentWrapperRef = ref(null);
    const exportDropdownRef = ref(null);
    const isExporting = ref(false);
    const showExportOptions = ref(false);
    
    // Filename customization modal
    const showFilenameModal = ref(false);
    const customFilename = ref('');
    const pendingExportType = ref('');
    
    // Panel visibility - open by default
    const showSettings = ref(true);
    
    // Invoice data loaded from localStorage
    const invoiceData = ref({
      organizationName: '',
      organizationSubName: '',
      headOfficeAddress: '',
      headOfficePhone: '',
      branchAddress1: '',
      branch1Phone: '',
      branchAddress2: '',
      branch2Phone: '',
      logoDataUrl: '',
      invoiceNumber: '',
      invoiceDate: '',
      customerName: '',
      customerAddress: '',
      lpo: '',
      items: [],
      taxEnabled: false,
      taxRate: 7.5,
      sumOf: '',
      sumOf2: ''
    });
    
    // Size settings - Default to 5x8 inches
    const invoiceWidth = ref(5);
    const invoiceHeight = ref(8);
    const isMobile = ref(false);
    const mobileScale = ref(1);
    
    // Zoom controls
    const zoomLevel = ref(1);
    
    const minZoom = 0.3;
    const maxZoom = 2;
    
    const zoomIn = () => {
      if (zoomLevel.value < maxZoom) {
        zoomLevel.value = Math.round((Math.min(maxZoom, zoomLevel.value + 0.1)) * 10) / 10;
      }
    };
    
    const zoomOut = () => {
      if (zoomLevel.value > minZoom) {
        zoomLevel.value = Math.round((Math.max(minZoom, zoomLevel.value - 0.1)) * 10) / 10;
      }
    };
    
    const resetZoom = () => {
      zoomLevel.value = 1;
    };
    
    // Auto-fit zoom to show complete invoice on load
    const autoFitZoom = () => {
      nextTick(() => {
        const container = document.querySelector('section.w-full.overflow-auto');
        if (container && invoiceWidth.value && invoiceHeight.value) {
          const containerWidth = container.clientWidth - 40; // padding
          const containerHeight = container.clientHeight - 100; // padding + header
          const invoiceWidthPx = invoiceWidth.value * 96; // convert inches to pixels (96 DPI)
          const invoiceHeightPx = invoiceHeight.value * 96;
          
          const scaleX = containerWidth / invoiceWidthPx;
          const scaleY = containerHeight / invoiceHeightPx;
          const optimalScale = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
          
          zoomLevel.value = Math.max(minZoom, optimalScale);
        }
      });
    };
    
    // Pagination navigation methods
    const goToPreviousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value = currentPage.value - 1;
        // Save updated page to localStorage
        const currentData = JSON.parse(localStorage.getItem('invoicePreviewData') || '{}');
        currentData.currentPage = currentPage.value;
        localStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
      }
    };
    
    const goToNextPage = () => {
      if (currentPage.value < totalCopies.value) {
        currentPage.value = currentPage.value + 1;
        // Save updated page to localStorage
        const currentData = JSON.parse(localStorage.getItem('invoicePreviewData') || '{}');
        currentData.currentPage = currentPage.value;
        localStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
      }
    };
    
    const goToPage = (pageNumber) => {
      const page = Math.max(1, Math.min(totalCopies.value, pageNumber));
      currentPage.value = page;
      // Save updated page to localStorage
      const currentData = JSON.parse(localStorage.getItem('invoicePreviewData') || '{}');
      currentData.currentPage = currentPage.value;
      localStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
    };
    
    // Export dropdown methods
    const toggleExportOptions = () => {
      showExportOptions.value = !showExportOptions.value;
    };
    
    const closeExportOptions = () => {
      showExportOptions.value = false;
    };
    
    // Filename customization methods
    const showFilenameDialog = (exportType) => {
      pendingExportType.value = exportType;
      
      // Generate default filename based on export type and invoice data
      const invoiceNum = currentInvoiceNumber.value.replace('/', '-') || 'Invoice';
      const customerNamePart = customerName.value ? `-${customerName.value.replace(/[^a-zA-Z0-9]/g, '')}` : '';
      
      let defaultName = '';
      
      if (exportType === 'pdf-current') {
        defaultName = `${invoiceNum}${customerNamePart}`;
      } else if (exportType === 'pdf-all') {
        defaultName = `${invoiceNum}-All-Pages-${totalCopies.value}-copies`;
      } else if (exportType === 'jpeg-current') {
        defaultName = `${invoiceNum}${customerNamePart}-Image`;
      } else if (exportType === 'jpeg-all') {
        defaultName = `${invoiceNum}-All-Images-${totalCopies.value}-copies`;
      }
      
      customFilename.value = defaultName;
      showFilenameModal.value = true;
    };
    
    const cancelExport = () => {
      showFilenameModal.value = false;
      customFilename.value = '';
      pendingExportType.value = '';
    };
    
    const confirmExport = async () => {
      if (!customFilename.value.trim()) return;
      
      const filename = customFilename.value.trim();
      showFilenameModal.value = false;
      
      // Execute the export based on the pending type
      try {
        if (pendingExportType.value === 'pdf-current') {
          await handleExportPDF('current', filename);
        } else if (pendingExportType.value === 'pdf-all') {
          await handleExportPDF('all', filename);
        } else if (pendingExportType.value === 'jpeg-current') {
          await handleExportJPEG('current', filename);
        } else if (pendingExportType.value === 'jpeg-all') {
          await handleExportJPEG('all', filename);
        }
      } catch (error) {
        console.error('Export failed:', error);
        alert('Export failed. Please try again.');
      } finally {
        customFilename.value = '';
        pendingExportType.value = '';
      }
    };
    
    // Click outside handler for export dropdown
    const handleClickOutside = (event) => {
      if (exportDropdownRef.value && !exportDropdownRef.value.contains(event.target)) {
        closeExportOptions();
      }
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
    };
    
    // Color settings
    const colorMode = ref('full-color');
    const customColor1CMYK = ref({ c: 0, m: 0, y: 0, k: 100 });
    const customColor2CMYK = ref({ c: 100, m: 50, y: 0, k: 0 });

    // Undo/Redo functionality
    const history = ref([]);
    const historyIndex = ref(-1);
    const maxHistorySize = ref(50); // Limit history to prevent memory issues
    
    const canUndo = computed(() => historyIndex.value > 0);
    const canRedo = computed(() => historyIndex.value < history.value.length - 1);

    // Font selection variables
    const selectedFont = ref('Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
    const baseFontSize = ref(12);
    const fontSizePresets = ref([
      { name: 'Small', size: 10 },
      { name: 'Normal', size: 12 },
      { name: 'Medium', size: 14 },
      { name: 'Large', size: 16 }
    ]);

    // Save current state to history
    const saveState = () => {
      const currentState = {
        organizationName: organizationName.value,
        organizationSubName: organizationSubName.value,
        headOfficeAddress: headOfficeAddress.value,
        headOfficePhone: headOfficePhone.value,
        branchAddress1: branchAddress1.value,
        branch1Phone: branch1Phone.value,
        branchAddress2: branchAddress2.value,
        branch2Phone: branch2Phone.value,
        logoDataUrl: logoDataUrl.value,
        receiptNumber: receiptNumber.value,
        date: date.value,
        customerName: customerName.value,
        customerAddress: customerAddress.value,
        lpo: lpo.value,
        items: JSON.parse(JSON.stringify(items.value)), // Deep copy
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        colorMode: colorMode.value,
        customColor1CMYK: { ...customColor1CMYK.value },
        customColor2CMYK: { ...customColor2CMYK.value },
        selectedFont: selectedFont.value,
        baseFontSize: baseFontSize.value,
        invoiceWidth: invoiceWidth.value,
        invoiceHeight: invoiceHeight.value,
        elementStyles: JSON.parse(JSON.stringify(elementStyles.value || {}))
      };
      
      // Remove future history if we're not at the end
      if (historyIndex.value < history.value.length - 1) {
        history.value = history.value.slice(0, historyIndex.value + 1);
      }
      
      // Add new state
      history.value.push(currentState);
      historyIndex.value = history.value.length - 1;
      
      // Limit history size
      if (history.value.length > maxHistorySize.value) {
        history.value.shift();
        historyIndex.value--;
      }
    };

    // Undo function
    const undo = () => {
      if (!canUndo.value) return;
      
      historyIndex.value--;
      const state = history.value[historyIndex.value];
      restoreState(state);
    };

    // Redo function
    const redo = () => {
      if (!canRedo.value) return;
      
      historyIndex.value++;
      const state = history.value[historyIndex.value];
      restoreState(state);
    };

    // Restore state function
    const restoreState = (state) => {
      organizationName.value = state.organizationName;
      organizationSubName.value = state.organizationSubName;
      headOfficeAddress.value = state.headOfficeAddress;
      headOfficePhone.value = state.headOfficePhone;
      branchAddress1.value = state.branchAddress1;
      branch1Phone.value = state.branch1Phone;
      branchAddress2.value = state.branchAddress2;
      branch2Phone.value = state.branch2Phone;
      logoDataUrl.value = state.logoDataUrl;
      receiptNumber.value = state.receiptNumber;
      date.value = state.date;
      customerName.value = state.customerName;
      customerAddress.value = state.customerAddress;
      lpo.value = state.lpo;
      items.value = JSON.parse(JSON.stringify(state.items)); // Deep copy
      sumOf.value = state.sumOf;
      sumOf2.value = state.sumOf2;
      colorMode.value = state.colorMode;
      customColor1CMYK.value = { ...state.customColor1CMYK };
      customColor2CMYK.value = { ...state.customColor2CMYK };
      selectedFont.value = state.selectedFont;
      baseFontSize.value = state.baseFontSize;
      invoiceWidth.value = state.invoiceWidth;
      invoiceHeight.value = state.invoiceHeight;
      elementStyles.value = JSON.parse(JSON.stringify(state.elementStyles || {}));
      
      // Re-apply styles after restoration
      nextTick(() => {
        applyAllSavedStyles();
      });
    };

    // Keyboard shortcuts for undo/redo
    const handleKeydown = (event) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z' && !event.shiftKey) {
          event.preventDefault();
          undo();
        } else if ((event.key === 'y') || (event.key === 'z' && event.shiftKey)) {
          event.preventDefault();
          redo();
        }
      }
    };

    // Text picker variables
    const isTextPickerMode = ref(false);
    const selectedTextElement = ref(null);
    const selectedElementId = ref('');
    const selectedElementStyles = ref({
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 12,
      cmykColor: 'black'
    });

    // Store individual element styles
    const elementStyles = ref({});

    // Multiple selection variables
    const selectedTextElements = ref([]); // Array of selected elements
    const selectedElementIds = ref([]); // Array of selected element IDs
    const isMultiSelectMode = ref(false); // Toggle for multi-select mode
    const groupStyles = ref({
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: 12,
      cmykColor: 'black'
    });

    // Auto font adjustment variables
    const autoAdjustedElements = ref(new Set());
    const slimFonts = [
      'Arial Narrow, sans-serif',
      'Helvetica Narrow, sans-serif', 
      'Roboto Condensed, sans-serif',
      'Open Sans Condensed, sans-serif',
      'PT Sans Narrow, sans-serif',
      'Source Sans Pro, sans-serif'
    ];
    
    const originalElementStyles = ref({}); // Store original styles before auto-adjustment
    
  // Preview toggle for mobile (default true so preview is visible on all screen sizes)
  const showPreview = ref(true);
    
    // Page/Copies management
    const totalCopies = ref(1);
    const currentPage = ref(1);
    const showPageNumbers = ref(false);
    
    // Per-page data storage - each page can have different data
    const pageData = ref({});
    
    // Global/shared fields (same for all pages)
    const logoDataUrl = ref('');
    const organizationName = ref('');
    const organizationSubName = ref('');
    const businessNumber = ref('');
    const headOfficeAddress = ref('');
    const headOfficePhone = ref('');
    const branchAddress1 = ref('');
    const branch1Phone = ref('');
    const branchAddress2 = ref('');
    const branch2Phone = ref('');
    const receiptNumber = ref(1);
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    
    // Initialize default page data structure
    const createDefaultPageData = () => ({
      customerName: '',
      customerAddress: '',
      date: new Date().toISOString().split('T')[0], // Default to today
      lpo: '',
      sumOf: '',
      sumOf2: '',
      signatureImage1: '',
      signatureImage2: '',
      selectedSignature1: '',
      selectedSignature2: '',
      items: [
        { id: 1, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 2, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 3, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 4, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 5, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 6, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 7, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 8, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 9, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 10, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 11, quantity: 0, description: '', price: 0, tax: 0 },
        { id: 12, quantity: 0, description: '', price: 0, tax: 0 }
      ]
    });
    
    // Initialize page data for current page
    const ensurePageData = (pageNum) => {
      if (!pageData.value[pageNum]) {
        pageData.value[pageNum] = createDefaultPageData();
      }
    };
    
    // Computed properties for current page data
    const customerName = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.customerName || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].customerName = value;
      }
    });
    
    const customerAddress = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.customerAddress || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].customerAddress = value;
      }
    });
    
    const date = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.date || new Date().toISOString().split('T')[0];
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].date = value;
      }
    });
    
    const lpo = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.lpo || '';
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].lpo = value;
      }
    });
    
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
    
    const items = computed({
      get: () => {
        ensurePageData(currentPage.value);
        return pageData.value[currentPage.value]?.items || createDefaultPageData().items;
      },
      set: (value) => {
        ensurePageData(currentPage.value);
        pageData.value[currentPage.value].items = value;
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
    
    // Dynamic MAX_ITEMS based on invoice height
    const MAX_ITEMS = computed(() => {
      const height = invoiceHeight.value;
      
      if (height >= 8.5) {
        // For 8.5 inches or more, max 12 items
        return 12;
      } else if (height >= 8.0) {
        // Between 8.0 and 8.5, allow 11 items
        return 11;
      } else if (height >= 7.5) {
        // Between 7.5 and 8.0, allow 10 items
        return 10;
      } else if (height >= 7.0) {
        // Between 7.0 and 7.5, allow 9 items
        return 9;
      } else if (height >= 6.5) {
        // Between 6.5 and 7.0, allow 8 items
        return 8;
      } else if (height >= 6.0) {
        // Between 6.0 and 6.5, allow 7 items
        return 7;
      } else if (height >= 5.5) {
        // Between 5.5 and 6.0, allow 6 items
        return 6;
      } else if (height >= 5.0) {
        // Between 5.0 and 5.5, allow 5 items
        return 5;
      } else if (height >= 4.5) {
        // Between 4.5 and 5.0, allow 4 items
        return 4;
      } else {
        // Below 4.5, minimum 3 items
        return 3;
      }
    });
    
    // Dynamic logo height based on invoice height
    const logoHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return 50; // Full size for 8+ inches
      } else {
        // Reduce very slowly - only 1px per inch below 8
        const scaledHeight = 50 - ((8 - height) * 1);
        // Minimum 42px for better visibility
        return Math.max(42, scaledHeight);
      }
    });
    
    // Dynamic header padding (top and bottom) based on invoice height
    const headerPaddingTop = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '0.5rem'; // Default top padding for 8+ inches
      } else {
        // Reduce padding very slowly - 0.05rem per inch below 8
        const padding = 0.5 - ((8 - height) * 0.05);
        return `${Math.max(0.3, padding)}rem`; // Minimum 0.3rem (higher minimum)
      }
    });
    
    const headerPaddingBottom = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '0.5rem'; // Default bottom padding for 8+ inches
      } else {
        // Reduce padding very slowly - 0.05rem per inch below 8
        const padding = 0.5 - ((8 - height) * 0.05);
        return `${Math.max(0.3, padding)}rem`; // Minimum 0.3rem (higher minimum)
      }
    });
    
    // Computed properties for page management
    const displayPageNumber = computed(() => {
      return `${String(currentPage.value).padStart(3, '0')}`;
    });

    // Calculate per-page invoice number
    const currentInvoiceNumber = computed(() => {
      // Automatically use page numbering when multiple copies are requested
      if (totalCopies.value > 1) {
        const baseNumber = receiptNumber.value || 1;
        return `${String(baseNumber + currentPage.value - 1).padStart(3, '0')}`;
      }
      // Always show the receipt number, never show '-' or empty
      return String(receiptNumber.value || 1);
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
      
      // Initialize data for new pages
      for (let i = 1; i <= newTotal; i++) {
        ensurePageData(i);
      }
      
      // Adjust current page if it exceeds new total
      if (currentPage.value > newTotal) {
        currentPage.value = Math.max(1, newTotal);
      }
      
      // Save the updated total copies
      const currentData = JSON.parse(localStorage.getItem('invoicePreviewData') || '{}');
      currentData.totalCopies = newTotal;
      currentData.pageData = pageData.value; // Save per-page data
      localStorage.setItem('invoicePreviewData', JSON.stringify(currentData));
    });
    
    // Watch for changes in current page to ensure it's valid
    watch(currentPage, (newPage) => {
      if (newPage < 1) {
        currentPage.value = 1;
      } else if (newPage > totalCopies.value) {
        currentPage.value = totalCopies.value;
      }
    });
    
    // Dynamic sizing based on invoice height
    const dynamicPadding = computed(() => {
      const height = invoiceHeight.value;
      const padding = Math.max(0.2, height * 0.02);
      return `${padding}rem`;
    });
    
    const dynamicGap = computed(() => {
      const height = invoiceHeight.value;
      const gap = Math.max(0.1, height * 0.01);
      return `${gap}rem`;
    });
    
    const dynamicSpacing = computed(() => {
      const height = invoiceHeight.value;
      const spacing = Math.max(0.1, height * 0.008);
      return `${spacing}rem`;
    });
    
    const signatureHeight = computed(() => {
      const height = invoiceHeight.value;
      // Scale signature area based on available space (minimum 3rem, maximum 5rem)
      const scaledHeight = Math.max(3, Math.min(5, height * 0.6));
      return `${scaledHeight}rem`;
    });
    
    const signatureImageHeight = computed(() => {
      const height = invoiceHeight.value;
      // Scale signature images (minimum 2.5rem, maximum 4.5rem)
      const scaledHeight = Math.max(2.5, Math.min(4.5, height * 0.55));
      return `${scaledHeight}rem`;
    });
    
    // Dynamic font sizes based on invoice height
    const organizationNameFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '20px'; // Full size for 8+ inches
      } else {
        // Reduce very slowly - only 0.8px per inch below 8
        const scaledSize = 20 - ((8 - height) * 0.8);
        return `${Math.max(16, scaledSize)}px`; // Minimum 16px (higher minimum)
      }
    });
    
    const organizationSubFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '10px';
      } else {
        // Reduce very slowly - only 0.3px per inch below 8
        const scaledSize = 10 - ((8 - height) * 0.3);
        return `${Math.max(9.2, scaledSize)}px`; // Minimum 9.2px (higher minimum)
      }
    });

    // Dynamic address and phone font sizes based on invoice height
    const addressFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '9px'; // Full size for 8+ inches
      } else {
        // Reduce by 0.4px per inch below 8
        const scaledSize = 9 - ((8 - height) * 0.4);
        return `${Math.max(7, scaledSize)}px`; // Minimum 7px
      }
    });

    const phoneFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '8px'; // Full size for 8+ inches
      } else {
        // Reduce by 0.3px per inch below 8
        const scaledSize = 8 - ((8 - height) * 0.3);
        return `${Math.max(6, scaledSize)}px`; // Minimum 6px
      }
    });

    // Dynamic footer font size (slightly larger than address font)
    const footerFontSize = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '11px'; // Full size for 8+ inches
      } else {
        // Reduce by 0.5px per inch below 8
        const scaledSize = 11 - ((8 - height) * 0.5);
        return `${Math.max(8.5, scaledSize)}px`; // Minimum 8.5px
      }
    });

    // Dynamic box heights based on invoice height
    const outlineBoxHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '60px'; // Full height for 8+ inches
      } else {
        // Reduce by 4px per inch below 8
        const scaledHeight = 60 - ((8 - height) * 4);
        return `${Math.max(40, scaledHeight)}px`; // Minimum 40px
      }
    });

    const customerBoxHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '80px'; // Full height for 8+ inches
      } else {
        // Reduce by 5px per inch below 8
        const scaledHeight = 80 - ((8 - height) * 5);
        return `${Math.max(50, scaledHeight)}px`; // Minimum 50px
      }
    });


    
    // Dynamic table row height based on invoice height
    const tableRowHeight = computed(() => {
      const height = invoiceHeight.value;
      if (height >= 8) {
        return '32px'; // Full size for 8+ inches
      } else {
        // Reduce very slowly - only 1px per inch below 8
        const scaledHeight = 32 - ((8 - height) * 1);
        return `${Math.max(28, scaledHeight)}px`; // Minimum 28px (higher minimum)
      }
    });
    
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    
    // Signature management
    const savedSignatures = ref([]);
    
    // Load invoice data from localStorage
    onMounted(() => {
      // Initialize page 1 data first
      ensurePageData(1);
      
      const savedData = localStorage.getItem('invoicePreviewData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        
        // Only load organization data if it came from a form or explicit user action
        // Check if the data has a formMode indicating it's from a form submission
        const shouldLoadOrganizationData = parsed.formMode === 'generate' || parsed.fromQuickFill === true;
        
        invoiceData.value = { ...invoiceData.value, ...parsed };
        
        // Load size and color settings (always load these)
        if (parsed.invoiceWidth) invoiceWidth.value = parsed.invoiceWidth;
        if (parsed.invoiceHeight) invoiceHeight.value = parsed.invoiceHeight;
        if (parsed.colorMode) colorMode.value = parsed.colorMode;
        
        // Load page/copies settings (always load these)
        if (parsed.totalCopies) totalCopies.value = parsed.totalCopies;
        if (parsed.currentPage) currentPage.value = parsed.currentPage;
        if (parsed.showPageNumbers !== undefined) showPageNumbers.value = parsed.showPageNumbers;
        
        // Load per-page data if it exists
        if (parsed.pageData) {
          pageData.value = parsed.pageData;
          // Initialize any missing pages
          for (let i = 1; i <= totalCopies.value; i++) {
            ensurePageData(i);
          }
        }

        // Load font settings from quick settings (always load these)
        const quickSettings = localStorage.getItem('invoiceQuickSettings');
        if (quickSettings) {
          const fontSettings = JSON.parse(quickSettings);
          if (fontSettings.selectedFont) selectedFont.value = fontSettings.selectedFont;
          if (fontSettings.baseFontSize) baseFontSize.value = fontSettings.baseFontSize;
          if (fontSettings.elementStyles) elementStyles.value = fontSettings.elementStyles;
          if (fontSettings.autoAdjustedElements) {
            autoAdjustedElements.value = new Set(fontSettings.autoAdjustedElements);
          }
          if (fontSettings.originalElementStyles) {
            originalElementStyles.value = fontSettings.originalElementStyles;
          }
        }
        
        // Only populate organization fields if user explicitly submitted form data or used Quick Fill
        if (shouldLoadOrganizationData) {
          logoDataUrl.value = parsed.logoDataUrl || '';
          organizationName.value = parsed.organizationName || '';
          organizationSubName.value = parsed.organizationSubName || '';
          businessNumber.value = parsed.businessNumber || '';
          headOfficeAddress.value = parsed.headOfficeAddress || '';
          headOfficePhone.value = parsed.headOfficePhone || '';
          branchAddress1.value = parsed.branchAddress1 || '';
          branch1Phone.value = parsed.branch1Phone || '';
          branchAddress2.value = parsed.branchAddress2 || '';
          branch2Phone.value = parsed.branch2Phone || '';
          receiptNumber.value = parsed.invoiceNumber || 1;
        } else {
          // Keep organization data empty if not from form/QuickFill
          logoDataUrl.value = '';
          organizationName.value = '';
          organizationSubName.value = '';
          businessNumber.value = '';
          headOfficeAddress.value = '';
          headOfficePhone.value = '';
          branchAddress1.value = '';
          branch1Phone.value = '';
          branchAddress2.value = '';
          branch2Phone.value = '';
          receiptNumber.value = 1;
        }
        
        // Load tax enabled setting (always load this)
        if (typeof parsed.taxEnabled !== 'undefined') {
          invoiceData.value.taxEnabled = parsed.taxEnabled;
        }
        
        // Always load customer and transaction data (this is expected to be filled during use)
        customerName.value = parsed.customerName || '';
        customerAddress.value = parsed.customerAddress || '';
        date.value = parsed.invoiceDate || '';
        lpo.value = parsed.lpo || '';
        items.value = parsed.items && parsed.items.length > 0 ? parsed.items : [
          { id: 1, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 2, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 3, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 4, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 5, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 6, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 7, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 8, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 9, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 10, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 11, quantity: 0, description: '', price: 0, tax: 0 },
          { id: 12, quantity: 0, description: '', price: 0, tax: 0 }
        ];
        sumOf.value = parsed.sumOf || '';
        sumOf2.value = parsed.sumOf2 || '';
      }
      
      // Load signatures
      loadSignatures();

      // Apply saved element styles
      applyAllSavedStyles();

      // Setup auto font adjustment
      setupAutoAdjustment();
      
      // Check if mobile
      isMobile.value = window.innerWidth < 768;
      calculateMobileScale();
      
      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 768;
        calculateMobileScale();
      });
      
      // Add click outside event listener for export dropdown
      document.addEventListener('click', handleClickOutside);
      
      // Auto-fit zoom when component is mounted
      setTimeout(autoFitZoom, 500);
    });
    
    // Clean up event listeners on unmount
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
    });
    
    // Calculate mobile scale
    const calculateMobileScale = () => {
      if (isMobile.value) {
        const screenWidth = window.innerWidth - 32; // Account for padding
        const invoiceWidthPx = invoiceWidth.value * 96; // 96 DPI
        mobileScale.value = Math.min(screenWidth / invoiceWidthPx, 1);
      } else {
        mobileScale.value = 1;
      }
    };
    
    // Content scale
    const contentScale = ref(1);
    
    const updateContentScale = () => {
      if (invoiceRef.value && contentWrapperRef.value) {
        const containerWidth = invoiceRef.value.clientWidth;
        const contentWidth = contentWrapperRef.value.scrollWidth;
        const containerHeight = invoiceRef.value.clientHeight;
        const contentHeight = contentWrapperRef.value.scrollHeight;

        const widthScale = containerWidth / contentWidth;
        const heightScale = containerHeight / contentHeight;
        
        contentScale.value = Math.min(widthScale, heightScale);
      }
    };
    
    onMounted(() => {
      updateContentScale();
      const resizeObserver = new ResizeObserver(updateContentScale);
      if (contentWrapperRef.value) {
        resizeObserver.observe(contentWrapperRef.value);
      }
    });

    watch([invoiceWidth, invoiceHeight, items], () => {
      nextTick(updateContentScale);
      // Auto-fit when dimensions change
      setTimeout(autoFitZoom, 100);
    }, { deep: true });

    // Watch MAX_ITEMS and remove excess items when height decreases
    watch(MAX_ITEMS, (newMaxItems) => {
      if (items.value.length > newMaxItems) {
        items.value.splice(newMaxItems);
      }
    });
    
    // Invoice dimensions
    const invoiceDimensions = computed(() => ({
      width: isMobile.value ? '100%' : `${invoiceWidth.value}in`,
      height: `${invoiceHeight.value}in`,
      minHeight: `${invoiceHeight.value}in`,
      minWidth: isMobile.value ? '100%' : `${invoiceWidth.value}in`,
      maxWidth: isMobile.value ? '100%' : `${invoiceWidth.value}in`
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

    // CMYK to RGB CSS string helper
    const cmykToRgbCss = (c, m, y, k) => {
      const rgb = cmykToRgb(c, m, y, k);
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    };
    
    // CMYK to HEX conversion
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
          styles.headerBg = `linear-gradient(135deg, ${color1Hex} 0%, ${color2Hex} 100%)`;
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = color2Hex;
          styles.borderColor = color1Hex;
          styles.organizationTextColor = color1Hex;
          styles.logoFilter = 'sepia(100%) saturate(300%)';
          break;
        case 'one-color':
          styles.headerBg = color1Hex;
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = color1Hex;
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = color1Hex;
          styles.borderColor = color1Hex;
          styles.organizationTextColor = color1Hex;
          styles.logoFilter = `grayscale(100%)`;
          break;
        default:
          styles.headerBg = '#1e40af';
          styles.headerText = '#ffffff';
          styles.tableHeaderBg = '#1e40af';
          styles.tableHeaderText = '#ffffff';
          styles.accentColor = '#3b82f6';
          styles.borderColor = '#e2e8f0';
          styles.organizationTextColor = '#1e40af';
          styles.logoFilter = 'none';
      }
      
      return styles;
    });
    
    // Calculate item amount
    const getItemAmount = (item) => {
      const baseAmount = (item.quantity || 0) * (item.price || 0);
      if (invoiceData.value.taxEnabled) {
        const taxAmount = baseAmount * ((item.tax || 0) / 100);
        return baseAmount + taxAmount;
      }
      return baseAmount;
    };
    
    // Calculate grand total
    const grandTotal = computed(() => {
      return invoiceData.value.items.reduce((sum, item) => {
        if (item.description && item.description.trim()) {
          return sum + getItemAmount(item);
        }
        return sum;
      }, 0);
    });
    
    // Currency formatter
    const toCurrency = (value) => {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(value || 0);
    };

    // Font selection methods
    const handleFontChange = () => {
      // Apply font family to invoice
      if (invoiceRef.value) {
        invoiceRef.value.style.fontFamily = selectedFont.value;
      }
      saveQuickSettings();
    };

    const handleFontSizeChange = () => {
      // Apply base font size to invoice
      if (invoiceRef.value) {
        invoiceRef.value.style.fontSize = baseFontSize.value + 'px';
      }
      saveQuickSettings();
    };

    const setFontSizePreset = (size) => {
      baseFontSize.value = size;
      handleFontSizeChange();
    };

    // Quick save function for settings changes
    const saveQuickSettings = () => {
      const quickSettings = {
        selectedFont: selectedFont.value,
        baseFontSize: baseFontSize.value,
        invoiceWidth: invoiceWidth.value,
        invoiceHeight: invoiceHeight.value,
        colorMode: colorMode.value,
        customColor1CMYK: customColor1CMYK.value,
        customColor2CMYK: customColor2CMYK.value,
        elementStyles: elementStyles.value,
        autoAdjustedElements: Array.from(autoAdjustedElements.value),
        originalElementStyles: originalElementStyles.value
      };
      localStorage.setItem('invoiceQuickSettings', JSON.stringify(quickSettings));
    };

    // Auto font adjustment methods

    const applySlimFont = (element, elementId) => {
      if (!element || !elementId) return;
      
      // Store original style if not already stored
      if (!originalElementStyles.value[elementId]) {
        originalElementStyles.value[elementId] = {
          fontFamily: element.style.fontFamily || window.getComputedStyle(element).fontFamily,
          fontSize: element.style.fontSize || window.getComputedStyle(element).fontSize
        };
      }
      
      // Apply slim font from the list
      const currentFontIndex = slimFonts.findIndex(font => 
        element.style.fontFamily?.includes(font.split(',')[0]));
      const nextFontIndex = currentFontIndex >= 0 ? 
        Math.min(currentFontIndex + 1, slimFonts.length - 1) : 0;
      
      element.style.fontFamily = slimFonts[nextFontIndex];
      
      // Also reduce font size slightly if still overflowing
      const currentSize = parseInt(element.style.fontSize) || baseFontSize.value;
      element.style.fontSize = Math.max(8, currentSize - 1) + 'px';
      
      // Mark as auto-adjusted
      autoAdjustedElements.value.add(elementId);
      
      // Save to element styles
      elementStyles.value[elementId] = {
        ...elementStyles.value[elementId],
        fontFamily: element.style.fontFamily,
        fontSize: parseInt(element.style.fontSize),
        autoAdjusted: true
      };
      
      saveQuickSettings();
    };

    const resetAutoAdjustment1 = (element) => {
      if (!element || !selectedElementId.value) return;
      
      const elementId = selectedElementId.value;
      const original = originalElementStyles.value[elementId];
      
      if (original) {
        element.style.fontFamily = original.fontFamily;
        element.style.fontSize = original.fontSize;
      }
      
      // Remove from auto-adjusted set
      autoAdjustedElements.value.delete(elementId);
      
      // Update element styles
      if (elementStyles.value[elementId]) {
        elementStyles.value[elementId].autoAdjusted = false;
      }
      
      saveQuickSettings();
    };

    const setupAutoAdjustment1 = () => {
      if (!invoiceRef.value) return;
      
      // Set up ResizeObserver to watch for text overflow
      const resizeObserver = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          const elementId = element.getAttribute('data-element-id') || 
                           element.id || 
                           `element-${Math.random().toString(36).substr(2, 9)}`;
          
          if (!elementId || autoAdjustedElements.value.has(elementId)) return;
          
          // Check if text content exists and is overflowing
          if (element.textContent.trim() && checkTextOverflow(element)) {
            applySlimFont(element, elementId);
          }
        });
      });
      
      // Observe all text elements in the invoice
      const textElements = invoiceRef.value.querySelectorAll(
        'input[type="text"], textarea, [contenteditable], p, span, div:not(:empty)'
      );
      
      textElements.forEach((element, index) => {
        // Add unique identifier if not exists
        if (!element.getAttribute('data-element-id')) {
          element.setAttribute('data-element-id', `text-${index}`);
        }
        resizeObserver.observe(element);
      });
      
      // Also set up input event listeners for real-time checking
      textElements.forEach((element) => {
        element.addEventListener('input', () => {
          const elementId = element.getAttribute('data-element-id');
          if (elementId && !autoAdjustedElements.value.has(elementId) && checkTextOverflow(element)) {
            applySlimFont(element, elementId);
          }
        });
      });
    };

    // Text picker methods
    const toggleTextPickerMode = () => {
      isTextPickerMode.value = !isTextPickerMode.value;
      selectedTextElement.value = null;
      selectedElementId.value = '';
      
      if (isTextPickerMode.value) {
        // Add hover effects and click handlers to all text elements
        addTextPickerListeners();
      } else {
        // Remove hover effects and click handlers
        removeTextPickerListeners();
      }
    };

    const addTextPickerListeners = () => {
      if (!invoiceRef.value) return;
      
      // Find all text elements
      const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th, input, textarea');
      
      textElements.forEach((element, index) => {
        // Skip if element has no text content or is empty
        if (!element.textContent.trim()) return;
        
        // Add unique ID for tracking
        element.setAttribute('data-text-id', `text-element-${index}`);
        
        // Add hover effect
        element.style.cursor = 'pointer';
        element.style.transition = 'all 0.2s ease';
        
        // Add event listeners
        element.addEventListener('mouseenter', handleTextHover);
        element.addEventListener('mouseleave', handleTextLeave);
        element.addEventListener('click', handleTextClick);
      });
    };

    const removeTextPickerListeners = () => {
      if (!invoiceRef.value) return;
      
      const textElements = invoiceRef.value.querySelectorAll('[data-text-id]');
      textElements.forEach(element => {
        element.style.cursor = '';
        element.style.backgroundColor = '';
        element.style.borderRadius = '';
        element.style.outline = '';
        element.title = '';
        element.removeEventListener('mouseenter', handleTextHover);
        element.removeEventListener('mouseleave', handleTextLeave);
        element.removeEventListener('click', handleTextClick);
      });
    };

    const handleTextHover = (event) => {
      if (!isTextPickerMode.value) return;
      
      const element = event.target;
      const elementId = element.getAttribute('data-text-id');
      
      // Don't override existing selection styles
      if (selectedElementIds.value.includes(elementId)) return;
      
      // Only highlight text, not create borders around containers
      // Use subtle background highlighting instead of text shadow
      element.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
      element.style.borderRadius = '2px';
      element.style.cursor = 'pointer';
      
      // Add tooltip hint
      element.title = selectedElementIds.value.length > 0 
        ? 'Click to add/remove from selection • Ctrl+Click for multi-select' 
        : 'Click to select • Ctrl+Click for multi-select';
    };

    const handleTextLeave = (event) => {
      if (!isTextPickerMode.value) return;
      
      const element = event.target;
      const elementId = element.getAttribute('data-text-id');
      
      // Don't clear styles if element is selected
      if (!selectedElementIds.value.includes(elementId)) {
        element.style.backgroundColor = '';
        element.style.borderRadius = '';
      }
      
      // Remove tooltip
      element.title = '';
    };

    const handleTextClick = (event) => {
      if (!isTextPickerMode.value) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      const element = event.target;
      const elementId = element.getAttribute('data-text-id');
      
      if (!elementId) return;
      
      // Check if Ctrl/Cmd key is held for multi-select
      const isMultiSelect = event.ctrlKey || event.metaKey || selectedElementIds.value.length > 0;
      
      if (isMultiSelect) {
        // Multi-select mode
        const index = selectedElementIds.value.indexOf(elementId);
        
        if (index > -1) {
          // Remove from selection
          selectedElementIds.value.splice(index, 1);
          element.style.backgroundColor = '';
          element.style.outline = '';
          element.style.borderRadius = '';
        } else {
          // Add to selection
          selectedElementIds.value.push(elementId);
          element.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
          element.style.borderRadius = '2px';
          element.style.outline = '1px solid #3b82f6';
        }
        
        // Update arrays
        updateSelectedElements();
        
        // Update single selection for style controls
        if (selectedElementIds.value.length === 1) {
          selectedTextElement.value = element;
          selectedElementId.value = elementId;
        } else {
          selectedTextElement.value = null;
          selectedElementId.value = '';
        }
      } else {
        // Single selection mode
        clearAllSelections();
        
        selectedTextElement.value = element;
        selectedElementId.value = elementId;
        selectedElementIds.value = [elementId];
        
        // Highlight selected element with different style for single selection
        element.style.outline = '3px solid #ef4444';
        element.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
        element.style.boxShadow = '0 0 0 1px rgba(239, 68, 68, 0.3)';
        
        updateSelectedElements();
      }
      
      // Get current styles for the style controls
      if (selectedTextElement.value) {
        const computedStyles = window.getComputedStyle(selectedTextElement.value);
        const savedStyles = elementStyles.value[selectedElementId.value];
        
        selectedElementStyles.value = {
          fontFamily: computedStyles.fontFamily || 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: parseInt(computedStyles.fontSize) || 12,
          cmykColor: savedStyles?.cmykColor || 'black'
        };
      }
    };



    const applySelectedElementStyles = () => {
      if (!selectedTextElement.value || !selectedElementId.value) return;
      
      const element = selectedTextElement.value;
      
      // Apply styles
      element.style.fontFamily = selectedElementStyles.value.fontFamily;
      element.style.fontSize = selectedElementStyles.value.fontSize + 'px';
      
      // Apply CMYK color based on selection
      let cmykColor;
      switch (selectedElementStyles.value.cmykColor) {
        case 'color1':
          cmykColor = customColor1CMYK.value;
          break;
        case 'color2':
          cmykColor = customColor2CMYK.value;
          break;
        default: // 'black'
          cmykColor = { c: 0, m: 0, y: 0, k: 100 };
      }
      element.style.color = cmykToRgbCss(cmykColor.c, cmykColor.m, cmykColor.y, cmykColor.k);
      
      // Save to element styles store
      elementStyles.value[selectedElementId.value] = { ...selectedElementStyles.value };
      
      // Save to localStorage
      saveQuickSettings();
    };

    // Quick color application function for CMYK buttons
    const applyQuickColor = (color) => {
      if (selectedElementIds.value.length === 0) return;
      
      // Apply color to all selected elements
      selectedElementIds.value.forEach(elementId => {
        const element = document.querySelector(`[data-text-id="${elementId}"]`);
        if (element) {
          let colorValue;
          switch (color) {
            case 'cyan':
              colorValue = 'rgb(6, 182, 212)'; // cyan-500
              break;
            case 'magenta':
              colorValue = 'rgb(236, 72, 153)'; // pink-500
              break;
            case 'yellow':
              colorValue = 'rgb(250, 204, 21)'; // yellow-400
              break;
            case 'black':
            default:
              colorValue = 'rgb(0, 0, 0)'; // black
              break;
          }
          
          element.style.color = colorValue;
          
          // Save to element styles store
          if (!elementStyles.value[elementId]) {
            elementStyles.value[elementId] = {
              fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: 12,
              cmykColor: color
            };
          } else {
            elementStyles.value[elementId].cmykColor = color;
          }
        }
      });
      
      // Save to localStorage
      saveQuickSettings();
    };

    const resetSelectedElementStyles = () => {
      if (!selectedTextElement.value || !selectedElementId.value) return;
      
      const element = selectedTextElement.value;
      
      // Reset to default styles
      element.style.fontFamily = '';
      element.style.fontSize = '';
      element.style.color = '';
      
      // Remove from element styles store
      delete elementStyles.value[selectedElementId.value];
      
      // Update selected styles to default
      selectedElementStyles.value = {
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: 12,
        cmykColor: 'black'
      };
      
      // Save to localStorage
      saveQuickSettings();
    };

    const applyAllSavedStyles = () => {
      // Apply saved styles to elements when component loads
      setTimeout(() => {
        if (!invoiceRef.value || !elementStyles.value) return;
        
        Object.keys(elementStyles.value).forEach(elementId => {
          const element = invoiceRef.value.querySelector(`[data-text-id="${elementId}"]`);
          if (element) {
            const styles = elementStyles.value[elementId];
            element.style.fontFamily = styles.fontFamily || '';
            element.style.fontSize = (styles.fontSize || '') + (styles.fontSize ? 'px' : '');
            
            // Apply CMYK color if available
            if (styles.cmykColor) {
              let cmykColor;
              switch (styles.cmykColor) {
                case 'color1':
                  cmykColor = customColor1CMYK.value;
                  break;
                case 'color2':
                  cmykColor = customColor2CMYK.value;
                  break;
                default: // 'black'
                  cmykColor = { c: 0, m: 0, y: 0, k: 100 };
              }
              element.style.color = cmykToRgbCss(cmykColor.c, cmykColor.m, cmykColor.y, cmykColor.k);
            } else if (styles.color) {
              // Fallback for old saved styles
              element.style.color = styles.color;
            }
          }
        });
      }, 100);
    };

    // Multi-select text picker functions
    const toggleMultiSelectMode = () => {
      isMultiSelectMode.value = !isMultiSelectMode.value;
      
      if (!isMultiSelectMode.value) {
        // Clear existing selections when disabling multi-select
        clearAllSelections();
      }
    };



    const updateSelectedElements = () => {
      selectedTextElements.value = [];
      
      selectedElementIds.value.forEach(elementId => {
        const element = invoiceRef.value?.querySelector(`[data-text-id="${elementId}"]`);
        if (element) {
          selectedTextElements.value.push(element);
        }
      });
    };

    const clearAllSelections = () => {
      selectedElementIds.value = [];
      selectedTextElements.value = [];
      selectedTextElement.value = null;
      selectedElementId.value = '';
      
      // Remove visual indicators
      if (invoiceRef.value) {
        const allElements = invoiceRef.value.querySelectorAll('[data-text-id]');
        allElements.forEach(element => {
          element.style.backgroundColor = '';
          element.style.outline = '';
          element.style.boxShadow = '';
          element.title = '';
        });
      }
    };

    const selectAllText = () => {
      if (!isTextPickerMode.value || !isMultiSelectMode.value || !invoiceRef.value) return;
      
      clearAllSelections();
      
      const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th');
      
      textElements.forEach((element, index) => {
        if (!element.textContent.trim()) return;
        
        const elementId = element.getAttribute('data-text-id') || `text-element-${index}`;
        element.setAttribute('data-text-id', elementId);
        
        selectedElementIds.value.push(elementId);
        element.style.backgroundColor = 'rgba(59, 130, 246, 0.3)';
        element.style.outline = '2px solid #3b82f6';
      });
      
      updateSelectedElements();
    };

    const applyStylesToSelectedElements = () => {
      if (selectedTextElements.value.length === 0) return;
      
      selectedTextElements.value.forEach(element => {
        // Apply font family
        if (selectedElementStyles.value.fontFamily) {
          element.style.fontFamily = selectedElementStyles.value.fontFamily;
        }
        
        // Apply font size
        if (selectedElementStyles.value.fontSize) {
          element.style.fontSize = selectedElementStyles.value.fontSize + 'px';
        }
        
        // Apply CMYK color
        if (selectedElementStyles.value.cmykColor) {
          let cmykColor;
          switch (selectedElementStyles.value.cmykColor) {
            case 'color1':
              cmykColor = customColor1CMYK.value;
              break;
            case 'color2':
              cmykColor = customColor2CMYK.value;
              break;
            default: // 'black'
              cmykColor = { c: 0, m: 0, y: 0, k: 100 };
          }
          element.style.color = cmykToRgbCss(cmykColor.c, cmykColor.m, cmykColor.y, cmykColor.k);
        }
        
        // Save to element styles store
        const elementId = element.getAttribute('data-text-id');
        if (elementId) {
          elementStyles.value[elementId] = { ...selectedElementStyles.value };
        }
      });
      
      // Save to localStorage
      saveQuickSettings();
    };

    const resetSelectedElements = () => {
      if (selectedTextElements.value.length === 0) return;
      
      selectedTextElements.value.forEach(element => {
        // Reset styles
        element.style.fontFamily = '';
        element.style.fontSize = '';
        element.style.color = '';
        
        // Remove from element styles store
        const elementId = element.getAttribute('data-text-id');
        if (elementId && elementStyles.value[elementId]) {
          delete elementStyles.value[elementId];
        }
      });
      
      // Save to localStorage
      saveQuickSettings();
    };
    
    // Check text overflow function
    const checkTextOverflow = (element) => {
      if (!element) return false;
      
      // Check if text is overflowing horizontally
      const isOverflowing = element.scrollWidth > element.offsetWidth || 
                           element.scrollHeight > element.offsetHeight;
      
      return isOverflowing;
    };

    const autoAdjustFont = (element) => {
      if (!element || autoAdjustedElements.value.has(element)) return;
      
      const elementId = element.getAttribute('data-text-id') || 
                       element.id || 
                       `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      if (!element.getAttribute('data-text-id')) {
        element.setAttribute('data-text-id', elementId);
      }

      const originalFont = window.getComputedStyle(element).fontFamily;
      const originalSize = parseInt(window.getComputedStyle(element).fontSize);
      
      // Try slim fonts first
      let adjusted = false;
      for (const slimFont of slimFonts) {
        element.style.fontFamily = slimFont;
        
        if (!checkTextOverflow(element)) {
          // Mark as auto-adjusted
          autoAdjustedElements.value.add(element);
          
          // Save the adjustment info
          if (!elementStyles.value[elementId]) {
            elementStyles.value[elementId] = {};
          }
          elementStyles.value[elementId].originalFont = originalFont;
          elementStyles.value[elementId].fontFamily = slimFont;
          elementStyles.value[elementId].fontSize = originalSize;
          elementStyles.value[elementId].autoAdjusted = true;
          
          adjusted = true;
          break;
        }
      }
      
      // If slim fonts don't work, try reducing font size
      if (!adjusted) {
        element.style.fontFamily = originalFont; // Reset font
        let newSize = originalSize;
        
        while (checkTextOverflow(element) && newSize > 8) {
          newSize -= 1;
          element.style.fontSize = newSize + 'px';
        }
        
        if (newSize < originalSize) {
          // Mark as auto-adjusted
          autoAdjustedElements.value.add(element);
          
          // Save the adjustment info
          if (!elementStyles.value[elementId]) {
            elementStyles.value[elementId] = {};
          }
          elementStyles.value[elementId].originalFont = originalFont;
          elementStyles.value[elementId].originalSize = originalSize;
          elementStyles.value[elementId].fontFamily = originalFont;
          elementStyles.value[elementId].fontSize = newSize;
          elementStyles.value[elementId].autoAdjusted = true;
        }
      }
      
      saveQuickSettings();
    };

    const setupAutoAdjustment = () => {
      if (!invoiceRef.value) return;
      
      // Set up mutation observer to watch for text changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' || mutation.type === 'characterData') {
            // Check all text elements for overflow
            const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th, input, textarea');
            textElements.forEach(element => {
              if (checkTextOverflow(element)) {
                autoAdjustFont(element);
              }
            });
          }
        });
      });
      
      // Observe the invoice for changes
      observer.observe(invoiceRef.value, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['value']
      });
      
      // Also check on input events
      const textInputs = invoiceRef.value.querySelectorAll('input, textarea');
      textInputs.forEach(input => {
        input.addEventListener('input', () => {
          setTimeout(() => {
            if (checkTextOverflow(input)) {
              autoAdjustFont(input);
            }
          }, 10);
        });
      });
      
      // Initial check
      setTimeout(() => {
        const textElements = invoiceRef.value.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, td, th, input, textarea');
        textElements.forEach(element => {
          if (checkTextOverflow(element)) {
            autoAdjustFont(element);
          }
        });
      }, 100);
    };

    const resetAutoAdjustment = (element) => {
      if (!element) return;
      
      const elementId = element.getAttribute('data-text-id');
      if (!elementId || !elementStyles.value[elementId]?.autoAdjusted) return;
      
      const savedStyles = elementStyles.value[elementId];
      
      // Reset to original styles
      if (savedStyles.originalFont) {
        element.style.fontFamily = savedStyles.originalFont;
      }
      if (savedStyles.originalSize) {
        element.style.fontSize = savedStyles.originalSize + 'px';
      }
      
      // Remove from auto-adjusted set
      autoAdjustedElements.value.delete(element);
      
      // Remove auto-adjusted flag but keep other custom styles
      if (elementStyles.value[elementId]) {
        delete elementStyles.value[elementId].autoAdjusted;
        delete elementStyles.value[elementId].originalFont;
        delete elementStyles.value[elementId].originalSize;
        
        // If no other styles remain, remove the element entirely
        if (Object.keys(elementStyles.value[elementId]).length === 0) {
          delete elementStyles.value[elementId];
        }
      }
      
      saveQuickSettings();
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
      }
      calculateMobileScale();
    };
    
    // Handle color mode change
    const handleColorModeChange = () => {
      if (colorMode.value === 'one-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 };
      } else if (colorMode.value === 'two-color') {
        customColor1CMYK.value = { c: 0, m: 0, y: 0, k: 100 };
        customColor2CMYK.value = { c: 100, m: 50, y: 0, k: 0 };
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
    
    // Export handlers
    const handleExportPDF = async (exportType = 'current', customName = null) => {
      if (!invoiceRef.value || isExporting.value) return;
      
      // Store original styles
      let originalTransform = '';
      let originalPosition = '';
      let originalLeft = '';
      let originalTop = '';
      let originalMargin = '';
      let originalWidth = '';
      let parentOriginalTransform = '';
      let parentOriginalWidth = '';
      let parentOriginalHeight = '';
      let parentOriginalMaxHeight = '';
      
      try {
        isExporting.value = true;
        
        // Get parent wrapper element
        const parentWrapper = invoiceRef.value.parentElement;
        
        // Store original styles from both invoice and parent
        originalTransform = invoiceRef.value.style.transform;
        originalPosition = invoiceRef.value.style.position;
        originalLeft = invoiceRef.value.style.left;
        originalTop = invoiceRef.value.style.top;
        originalMargin = invoiceRef.value.style.margin;
        originalWidth = invoiceRef.value.style.width;
        
        if (parentWrapper) {
          parentOriginalTransform = parentWrapper.style.transform;
          parentOriginalWidth = parentWrapper.style.width;
          parentOriginalHeight = parentWrapper.style.height;
          parentOriginalMaxHeight = parentWrapper.style.maxHeight;
          
          // Remove parent transform and constraints that affect positioning
          parentWrapper.style.transform = 'none';
          parentWrapper.style.width = 'auto';
          parentWrapper.style.height = 'auto';
          parentWrapper.style.maxHeight = 'none';
        }
        
        // Temporarily apply print styles and fix position
        invoiceRef.value.style.transform = 'none';
        invoiceRef.value.style.position = 'relative';
        invoiceRef.value.style.left = '0';
        invoiceRef.value.style.top = '0';
        invoiceRef.value.style.margin = '0 auto';
        
        // Capture and lock table row heights before export
        const tableRows = invoiceRef.value.querySelectorAll('table tbody tr');
        const originalRowHeights = [];
        tableRows.forEach((row, index) => {
          const computedHeight = window.getComputedStyle(row).height;
          originalRowHeights[index] = { 
            element: row, 
            height: computedHeight,
            originalStyle: row.style.height 
          };
          row.style.height = computedHeight;
          row.style.minHeight = computedHeight;
          row.style.maxHeight = computedHeight;
          
          // Also lock cell heights and inner div heights
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => {
            const cellStyles = window.getComputedStyle(cell);
            const cellHeight = cellStyles.height;
            const paddingTop = cellStyles.paddingTop;
            const paddingBottom = cellStyles.paddingBottom;
            
            cell.style.height = cellHeight;
            cell.style.minHeight = cellHeight;
            cell.style.maxHeight = cellHeight;
            cell.style.paddingTop = paddingTop;
            cell.style.paddingBottom = paddingBottom;
            cell.style.boxSizing = 'border-box';
            
            // Lock the height of print-only divs inside cells
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              const divStyles = window.getComputedStyle(div);
              const divHeight = divStyles.height;
              div.style.height = divHeight;
              div.style.minHeight = divHeight;
              div.style.maxHeight = divHeight;
              div.style.lineHeight = divStyles.lineHeight;
              div.style.boxSizing = 'border-box';
            });
          });
        });
        
        // Wait for styles to apply
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (exportType === 'all' && totalCopies.value > 1) {
          // Export all pages as single PDF with multiple pages
          const originalPage = currentPage.value;
          
          // Create PDF instance
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({
            unit: 'in',
            format: [invoiceWidth.value, invoiceHeight.value],
            orientation: 'portrait'
          });
          
          let isFirstPage = true;
          
          for (let page = 1; page <= totalCopies.value; page++) {
            currentPage.value = page;
            // Wait for page to update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Capture current page as canvas
            const canvas = await html2canvas(invoiceRef.value, {
              scale: 3,
              useCORS: true,
              logging: false,
              backgroundColor: '#ffffff'
            });
            
            // Add new page to PDF (except for the first page which already exists)
            if (!isFirstPage) {
              pdf.addPage([invoiceWidth.value, invoiceHeight.value], 'portrait');
            }
            isFirstPage = false;
            
            // Add canvas image to current PDF page
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(imgData, 'JPEG', 0, 0, invoiceWidth.value, invoiceHeight.value);
            
            // Small delay between captures
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          
          // Save the combined PDF
          const filename = customName ? `${customName}.pdf` : `Invoice-All-Pages-${totalCopies.value}-copies.pdf`;
          
          // For mobile/APK compatibility, try different save methods
          try {
            pdf.save(filename);
          } catch (error) {
            console.warn('Standard save failed, trying alternative method:', error);
            
            // Alternative method for mobile/APK
            const pdfOutput = pdf.output('blob');
            const url = URL.createObjectURL(pdfOutput);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
          
          // Restore original page
          currentPage.value = originalPage;
          return;
        }
        
        const filename = customName ? `${customName}.pdf` : `Invoice-${currentInvoiceNumber.value.replace('/', '-')}.pdf`;
        
        // For mobile/APK compatibility, use alternative approach
        try {
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
            jsPDF: { 
              unit: 'in', 
              format: [invoiceWidth.value, invoiceHeight.value], 
              orientation: 'portrait' 
            },
          };
          
          await html2pdf().set(options).from(invoiceRef.value).save();
        } catch (error) {
          console.warn('HTML2PDF failed, trying canvas to PDF method:', error);
          
          // Alternative method using canvas for mobile compatibility
          const canvas = await html2canvas(invoiceRef.value, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff'
          });
          
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF({
            unit: 'in',
            format: [invoiceWidth.value, invoiceHeight.value],
            orientation: 'portrait'
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.98);
          pdf.addImage(imgData, 'JPEG', 0, 0, invoiceWidth.value, invoiceHeight.value);
          
          // Try to save with fallback
          try {
            pdf.save(filename);
          } catch (saveError) {
            const pdfOutput = pdf.output('blob');
            const url = URL.createObjectURL(pdfOutput);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }
        }
        
        // Restore table row heights
        originalRowHeights.forEach(({ element, originalStyle }) => {
          element.style.height = originalStyle;
          element.style.minHeight = '';
          element.style.maxHeight = '';
          
          // Restore cell heights and inner div heights
          const cells = element.querySelectorAll('td');
          cells.forEach(cell => {
            cell.style.height = '';
            cell.style.minHeight = '';
            cell.style.maxHeight = '';
            cell.style.paddingTop = '';
            cell.style.paddingBottom = '';
            cell.style.boxSizing = '';
            
            // Restore print-only div heights
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              div.style.height = '';
              div.style.minHeight = '';
              div.style.maxHeight = '';
              div.style.lineHeight = '';
              div.style.boxSizing = '';
            });
          });
        });
        
        // Restore original styles
        if (parentWrapper) {
          parentWrapper.style.transform = parentOriginalTransform;
          parentWrapper.style.width = parentOriginalWidth;
          parentWrapper.style.height = parentOriginalHeight;
          parentWrapper.style.maxHeight = parentOriginalMaxHeight;
        }
        
        invoiceRef.value.style.transform = originalTransform;
        invoiceRef.value.style.position = originalPosition;
        invoiceRef.value.style.left = originalLeft;
        invoiceRef.value.style.top = originalTop;
        invoiceRef.value.style.margin = originalMargin;
        invoiceRef.value.style.width = originalWidth;
        
        if (exportType === 'all' && totalCopies.value > 1) {
          alert(`✅ All ${totalCopies.value} invoice pages exported as PDF successfully!`);
        } else {
          alert('✅ Invoice exported as PDF successfully!');
        }
      } catch (error) {
        console.error('Error exporting PDF:', error);
        alert(`❌ Failed to export PDF: ${error.message}`);
        
        // Restore styles on error
        if (invoiceRef.value) {
          const parentWrapper = invoiceRef.value.parentElement;
          if (parentWrapper) {
            parentWrapper.style.transform = parentOriginalTransform || '';
            parentWrapper.style.width = parentOriginalWidth || '';
            parentWrapper.style.height = parentOriginalHeight || '';
            parentWrapper.style.maxHeight = parentOriginalMaxHeight || '';
          }
          
          invoiceRef.value.style.transform = originalTransform || '';
          invoiceRef.value.style.position = originalPosition || '';
          invoiceRef.value.style.left = originalLeft || '';
          invoiceRef.value.style.top = originalTop || '';
          invoiceRef.value.style.margin = originalMargin || '';
          invoiceRef.value.style.width = originalWidth || '';
          
          const printOnlyElements = invoiceRef.value.querySelectorAll('.print-only');
          const noPrintElements = invoiceRef.value.querySelectorAll('.no-print');
          printOnlyElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
          noPrintElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
        }
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleExportJPEG = async (exportType = 'current', customName = null) => {
      if (!invoiceRef.value || isExporting.value) return;
      
      // Store original styles
      let originalTransform = '';
      let originalPosition = '';
      let originalLeft = '';
      let originalTop = '';
      let originalMargin = '';
      let originalWidth = '';
      let parentOriginalTransform = '';
      let parentOriginalWidth = '';
      let parentOriginalHeight = '';
      let parentOriginalMaxHeight = '';
      
      try {
        isExporting.value = true;
        
        // Get parent wrapper element
        const parentWrapper = invoiceRef.value.parentElement;
        
        // Store original styles from both invoice and parent
        originalTransform = invoiceRef.value.style.transform;
        originalPosition = invoiceRef.value.style.position;
        originalLeft = invoiceRef.value.style.left;
        originalTop = invoiceRef.value.style.top;
        originalMargin = invoiceRef.value.style.margin;
        originalWidth = invoiceRef.value.style.width;
        
        if (parentWrapper) {
          parentOriginalTransform = parentWrapper.style.transform;
          parentOriginalWidth = parentWrapper.style.width;
          parentOriginalHeight = parentWrapper.style.height;
          parentOriginalMaxHeight = parentWrapper.style.maxHeight;
          
          // Remove parent transform and constraints that affect positioning
          parentWrapper.style.transform = 'none';
          parentWrapper.style.width = 'auto';
          parentWrapper.style.height = 'auto';
          parentWrapper.style.maxHeight = 'none';
        }
        
        // Temporarily apply print styles and fix position
        invoiceRef.value.style.transform = 'none';
        invoiceRef.value.style.position = 'relative';
        invoiceRef.value.style.left = '0';
        invoiceRef.value.style.top = '0';
        invoiceRef.value.style.margin = '0';
        invoiceRef.value.style.width = `${invoiceWidth.value}in`;
        
        // Capture and lock table row heights before export
        const tableRows = invoiceRef.value.querySelectorAll('table tbody tr');
        const originalRowHeights = [];
        tableRows.forEach((row, index) => {
          const computedHeight = window.getComputedStyle(row).height;
          originalRowHeights[index] = { 
            element: row, 
            height: computedHeight,
            originalStyle: row.style.height 
          };
          row.style.height = computedHeight;
          row.style.minHeight = computedHeight;
          row.style.maxHeight = computedHeight;
          
          // Also lock cell heights and inner div heights
          const cells = row.querySelectorAll('td');
          cells.forEach(cell => {
            const cellStyles = window.getComputedStyle(cell);
            const cellHeight = cellStyles.height;
            const paddingTop = cellStyles.paddingTop;
            const paddingBottom = cellStyles.paddingBottom;
            
            cell.style.height = cellHeight;
            cell.style.minHeight = cellHeight;
            cell.style.maxHeight = cellHeight;
            cell.style.paddingTop = paddingTop;
            cell.style.paddingBottom = paddingBottom;
            cell.style.boxSizing = 'border-box';
            
            // Lock the height of print-only divs inside cells
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              const divStyles = window.getComputedStyle(div);
              const divHeight = divStyles.height;
              div.style.height = divHeight;
              div.style.minHeight = divHeight;
              div.style.maxHeight = divHeight;
              div.style.lineHeight = divStyles.lineHeight;
              div.style.boxSizing = 'border-box';
            });
          });
        });
        
        // Wait for styles to apply
        await new Promise(resolve => setTimeout(resolve, 150));
        
        if (exportType === 'all' && totalCopies.value > 1) {
          // Export all pages as separate JPEGs
          const originalPage = currentPage.value;
          for (let page = 1; page <= totalCopies.value; page++) {
            currentPage.value = page;
            // Wait for page to update
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const dataUrl = await htmlToImage.toJpeg(invoiceRef.value, { 
              quality: 0.98, 
              pixelRatio: 3,
              cacheBust: true,
              backgroundColor: '#ffffff'
            });
            
            // Create download link with custom filename
            const baseFilename = customName || `Invoice-${(receiptNumber.value || 1) + page - 1}`;
            const filename = `${baseFilename}-Page-${page}.jpg`;
            
            // Mobile-compatible download
            try {
              const link = document.createElement('a');
              link.download = filename;
              link.href = dataUrl;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (error) {
              console.warn('JPEG download failed:', error);
              // Fallback: open in new window for manual save
              const newWindow = window.open();
              newWindow.document.write(`<img src="${dataUrl}" alt="Invoice" />`);
            }
            
            // Small delay between exports
            await new Promise(resolve => setTimeout(resolve, 500));
          }
          // Restore original page
          currentPage.value = originalPage;
        } else {
          const dataUrl = await htmlToImage.toJpeg(invoiceRef.value, { 
            quality: 0.98, 
            pixelRatio: 3,
            cacheBust: true,
            backgroundColor: '#ffffff'
          });
          
          // Create download link with custom filename
          const filename = customName ? `${customName}.jpg` : `Invoice-${currentInvoiceNumber.value.replace('/', '-')}.jpg`;
          
          // Mobile-compatible download
          try {
            const link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (error) {
            console.warn('JPEG download failed:', error);
            // Fallback: open in new window for manual save
            const newWindow = window.open();
            newWindow.document.write(`<img src="${dataUrl}" alt="Invoice" style="max-width: 100%; height: auto;" />`);
          }
        }
        
        // Restore table row heights
        originalRowHeights.forEach(({ element, originalStyle }) => {
          element.style.height = originalStyle;
          element.style.minHeight = '';
          element.style.maxHeight = '';
          
          // Restore cell heights and inner div heights
          const cells = element.querySelectorAll('td');
          cells.forEach(cell => {
            cell.style.height = '';
            cell.style.minHeight = '';
            cell.style.maxHeight = '';
            cell.style.paddingTop = '';
            cell.style.paddingBottom = '';
            cell.style.boxSizing = '';
            
            // Restore print-only div heights
            const printDivs = cell.querySelectorAll('.print-only');
            printDivs.forEach(div => {
              div.style.height = '';
              div.style.minHeight = '';
              div.style.maxHeight = '';
              div.style.lineHeight = '';
              div.style.boxSizing = '';
            });
          });
        });
        
        // Restore original styles
        if (parentWrapper) {
          parentWrapper.style.transform = parentOriginalTransform;
          parentWrapper.style.width = parentOriginalWidth;
          parentWrapper.style.height = parentOriginalHeight;
          parentWrapper.style.maxHeight = parentOriginalMaxHeight;
        }
        
        invoiceRef.value.style.transform = originalTransform;
        invoiceRef.value.style.position = originalPosition;
        invoiceRef.value.style.left = originalLeft;
        invoiceRef.value.style.top = originalTop;
        invoiceRef.value.style.margin = originalMargin;
        invoiceRef.value.style.width = originalWidth;
        
        if (exportType === 'all' && totalCopies.value > 1) {
          alert(`✅ All ${totalCopies.value} invoice pages exported as JPEG successfully!`);
        } else {
          alert('✅ Invoice exported as JPEG successfully!');
        }
      } catch (error) {
        console.error('Error exporting JPEG:', error);
        alert(`❌ Failed to export JPEG: ${error.message}`);
        
        // Restore styles on error
        if (invoiceRef.value) {
          const parentWrapper = invoiceRef.value.parentElement;
          if (parentWrapper) {
            parentWrapper.style.transform = parentOriginalTransform || '';
            parentWrapper.style.width = parentOriginalWidth || '';
            parentWrapper.style.height = parentOriginalHeight || '';
            parentWrapper.style.maxHeight = parentOriginalMaxHeight || '';
          }
          
          invoiceRef.value.style.transform = originalTransform || '';
          invoiceRef.value.style.position = originalPosition || '';
          invoiceRef.value.style.left = originalLeft || '';
          invoiceRef.value.style.top = originalTop || '';
          invoiceRef.value.style.margin = originalMargin || '';
          invoiceRef.value.style.width = originalWidth || '';
          
          const printOnlyElements = invoiceRef.value.querySelectorAll('.print-only');
          const noPrintElements = invoiceRef.value.querySelectorAll('.no-print');
          printOnlyElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
          noPrintElements.forEach(el => {
            el.style.display = '';
            el.style.visibility = '';
          });
        }
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleSaveInvoice = async () => {
      console.log('🔥 handleSaveInvoice function called!');
      if (isExporting.value) {
        console.log('❌ Already exporting, returning...');
        return;
      }
      
      try {
        console.log('✅ Starting save process...');
        isExporting.value = true;
        
        // Get authenticated member data
        const memberData = localStorage.getItem('authenticatedMember');
        console.log('📝 Member data from localStorage:', memberData);
        if (!memberData) {
          console.log('❌ No member data found in localStorage');
          alert('❌ Please log in to save invoices');
          return;
        }
        
        const member = JSON.parse(memberData);
        console.log('👤 Parsed member:', member);
        if (!member?.branch) {
          console.log('❌ No branch information in member data');
          alert('❌ Branch information not found');
          return;
        }
        
        console.log('✅ Authentication passed, proceeding with save...');
        
        // Prepare invoice data to save
        const invoiceToSave = {
          organizationName: organizationName.value,
          organizationSubName: organizationSubName.value,
          headOfficeAddress: headOfficeAddress.value,
          headOfficePhone: headOfficePhone.value,
          branchAddress1: branchAddress1.value,
          branch1Phone: branch1Phone.value,
          branchAddress2: branchAddress2.value,
          branch2Phone: branch2Phone.value,
          logoDataUrl: logoDataUrl.value,
          invoiceNumber: receiptNumber.value,
          invoiceDate: date.value,
          customerName: customerName.value,
          customerAddress: customerAddress.value,
          lpo: lpo.value,
          items: items.value,
          sumOf: sumOf.value,
          sumOf2: sumOf2.value,
          invoiceWidth: invoiceWidth.value,
          invoiceHeight: invoiceHeight.value,
          colorMode: colorMode.value,
          customColor1CMYK: customColor1CMYK.value,
          customColor2CMYK: customColor2CMYK.value,
          selectedSignature1: selectedSignature1.value,
          selectedSignature2: selectedSignature2.value,
          totalCopies: totalCopies.value,
          currentPage: currentPage.value,
          showPageNumbers: showPageNumbers.value,
          signatureImage1: signatureImage1.value,
          signatureImage2: signatureImage2.value,
          grandTotal: grandTotal.value
        };
        
        // Save to localStorage (current invoice being edited)
        localStorage.setItem('invoicePreviewData', JSON.stringify(invoiceToSave));
        
        // Save to Firebase (permanent storage)
        const { saveInvoice } = await import('@/firebase/database');
        const result = await saveInvoice(member.branch, invoiceToSave);
        
        if (result.success) {
          const viewSaved = confirm(`✅ Invoice saved successfully!\n\nInvoice ID: ${result.id}\nBranch: ${member.branch}\n\nYour invoice is saved in:\n- localStorage (key: "invoices_${member.branch}")\n- Browser Storage under your branch\n\nWould you like to view all saved invoices in console?`);
          
          if (viewSaved) {
            // Get all saved invoices
            const { getAllInvoices } = await import('@/firebase/database');
            const allInvoices = await getAllInvoices(member.branch);
            /* eslint-disable no-console */
            console.log('=== SAVED INVOICES ===');
            console.log(`Branch: ${member.branch}`);
            console.log(`Total Invoices: ${allInvoices.invoices?.length || 0}`);
            console.table(allInvoices.invoices?.map(inv => ({
              ID: inv.id,
              Invoice_Number: inv.invoiceNumber,
              Customer: inv.customerName,
              Total: inv.grandTotal,
              Date: inv.invoiceDate,
              Created: new Date(inv.createdAt).toLocaleString()
            })));
            /* eslint-enable no-console */
            alert('Check your browser console (F12) to see all saved invoices!');
          }
        } else {
          alert(`⚠️ Invoice saved locally but Firebase save failed: ${result.error}\n\nYou can still access it from localStorage key: "invoices_${member.branch}"`);
        }
      } catch (error) {
        console.error('Error saving invoice:', error);
        alert(`❌ Failed to save invoice: ${error.message}\n\nCheck browser console for details.`);
      } finally {
        isExporting.value = false;
      }
    };
    
    const handleBack = () => {
      router.back();
    };
    
    // Auto-resize textarea
    const autoResize = (event) => {
      const textarea = event.target;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    };
    
    // Add item after index
    const addItemAfter = (index) => {
      if (items.value.length >= MAX_ITEMS.value) {
        alert(`⚠️ Maximum ${MAX_ITEMS.value} items allowed for ${invoiceHeight.value}" height invoice`);
        return;
      }
      const newItem = {
        id: Date.now(),
        quantity: 0,
        description: '',
        price: 0,
        tax: 0
      };
      items.value.splice(index + 1, 0, newItem);
    };
    
    // Add new item
    const addItem = () => {
      if (items.value.length >= MAX_ITEMS.value) {
        alert(`⚠️ Maximum ${MAX_ITEMS.value} items allowed for ${invoiceHeight.value}" height invoice`);
        return;
      }
      items.value.push({
        id: Date.now(),
        quantity: 0,
        description: '',
        price: 0,
        tax: 0
      });
    };
    
    // Remove item
    const removeItem = (id) => {
      if (items.value.length > 1) {
        items.value = items.value.filter(item => item.id !== id);
      }
    };
    
    // Handle sumOf overflow
    const handleSumOfOverflow = () => {
      // Optional: Add logic to handle text overflow between sumOf fields
    };
    
    // Handle sumOf2 input
    const handleSumOf2Input = () => {
      // Optional: Add logic for sumOf2 field
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
      }
    };

    // Handle signature 1 selection
    const handleSignature1Change = () => {
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature1.value);
      if (selected) {
        signatureImage1.value = selected.dataURL;
      } else {
        signatureImage1.value = '';
      }
    };

    // Handle signature 2 selection
    const handleSignature2Change = () => {
      const selected = savedSignatures.value.find(sig => sig.id === selectedSignature2.value);
      if (selected) {
        signatureImage2.value = selected.dataURL;
      } else {
        signatureImage2.value = '';
      }
    };

    // Handle create new signature
    const handleCreateSignature = () => {
      // Store the return path so SignaturePage knows where to redirect after creating signature
      localStorage.setItem('signatureReturnPath', '/invoice-preview');
      localStorage.setItem('signatureReturnType', 'invoice');
      router.push('/signature');
    };

    // Navigation functions
    const viewSavedInvoices = () => {
      router.push('/invoices/saved');
    };

    const createNewInvoice = () => {
      if (confirm('Are you sure you want to start a new invoice? Any unsaved changes will be lost.')) {
        // Clear all invoice data
        localStorage.removeItem('invoicePreviewData');
        localStorage.removeItem('generateInvoiceFormData');
        localStorage.removeItem('invoiceQuickSettings');
        
        // Navigate to new invoice creation
        router.push('/invoice-template/classic-professional');
      }
    };
    
    return {
      invoiceRef,
      exportDropdownRef,
      isExporting,
      invoiceData,
      showSettings,
      showPreview,
      invoiceWidth,
      invoiceHeight,
      isMobile,
      mobileScale,
      zoomLevel,
      minZoom,
      maxZoom,
      zoomIn,
      zoomOut,
      resetZoom,
      autoFitZoom,
      totalCopies,
      currentPage,
      goToPreviousPage,
      goToNextPage,
      goToPage,
      toggleExportOptions,
      closeExportOptions,
      handleClickOutside,
      validateCopiesInput,
      displayPageNumber,
      currentInvoiceNumber,
      showPageNumbers,
      showExportOptions,
      dynamicPadding,
      dynamicGap,
      dynamicSpacing,
      signatureHeight,
      signatureImageHeight,
      // Undo/Redo
      canUndo,
      canRedo,
      undo,
      redo,
      saveState,
      colorMode,
      customColor1CMYK,
      customColor2CMYK,
      // Font selection
      selectedFont,
      baseFontSize,
      fontSizePresets,
      // Text picker
      isTextPickerMode,
      selectedTextElement,
      selectedElementId,
      selectedElementStyles,
      elementStyles,
      toggleTextPickerMode,
      applySelectedElementStyles,
      resetSelectedElementStyles,
      applyAllSavedStyles,
      applyQuickColor,
      // Multi-select text picker
      isMultiSelectMode,
      selectedElementIds,
      selectedTextElements,
      groupStyles,
      toggleMultiSelectMode,
      selectAllText,
      clearAllSelections,
      applyStylesToSelectedElements,
      resetSelectedElements,
      contentScale,
      invoiceDimensions,
      colorStyles,
      grandTotal,
      // Global/shared fields
      logoDataUrl,
      organizationName,
      organizationSubName,
      businessNumber,
      headOfficeAddress,
      headOfficePhone,
      branchAddress1,
      branch1Phone,
      branchAddress2,
      branch2Phone,
      receiptNumber,
      autoReceiptNumber,
      autoDate,
      // Per-page data (computed properties)
      pageData,
      customerName,
      customerAddress,
      date,
      lpo,
      items,
      signatureImage1,
      signatureImage2,
      selectedSignature1,
      selectedSignature2,
      sumOf,
      sumOf2,
      // Helper functions
      createDefaultPageData,
      ensurePageData,
      MAX_ITEMS,
      logoHeight,
      headerPaddingTop,
      headerPaddingBottom,
      organizationNameFontSize,
      organizationSubFontSize,
      addressFontSize,
      phoneFontSize,
      footerFontSize,
      outlineBoxHeight,
      customerBoxHeight,
      sumOfInput1,
      sumOfInput2,
      // Signature management
      savedSignatures,
      // Methods
      getItemAmount,
      toCurrency,
      handlePresetChange,
      handleColorModeChange,
      getColorModeDescription,
      cmykToHex,
      cmykToRgbCss,
      handleExportPDF,
      handleExportJPEG,
      handleSaveInvoice,
      showFilenameDialog,
      cancelExport,
      confirmExport,
      showFilenameModal,
      customFilename,
      pendingExportType,
      handleBack,
      autoResize,
      addItemAfter,
      addItem,
      removeItem,
      handleSumOfOverflow,
      handleSumOf2Input,
      loadSignatures,
      handleSignature1Change,
      handleSignature2Change,
      handleCreateSignature,
      // Font methods
      handleFontChange,
      handleFontSizeChange,
      setFontSizePreset,
      // Auto adjustment variables
      autoAdjustedElements,
      slimFonts,
      originalElementStyles,
      // Auto adjustment methods
      checkTextOverflow,
      applySlimFont,
      setupAutoAdjustment,
      resetAutoAdjustment,
      // Navigation methods
      viewSavedInvoices,
      createNewInvoice
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
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0);
  opacity: 1;
}

/* Invoice preview styling */
#meblink-invoice {
  font-family: 'Arial', sans-serif;
}

#meblink-invoice table {
  border-collapse: collapse;
}

#meblink-invoice table td,
#meblink-invoice table th {
  border: 1px solid #d1d5db;
}

/* Mobile touch and scroll optimization */
@media (max-width: 768px) {
  /* Enable smooth scrolling and touch optimization for mobile */
  .relative.min-h-screen {
    touch-action: pan-x pan-y pinch-zoom;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure invoice container allows horizontal scrolling */
  section.w-full.overflow-auto {
    overflow-x: auto;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x pan-y pinch-zoom;
  }
  
  /* Prevent zoom conflicts with browser zoom */
  #meblink-invoice {
    touch-action: pan-x pan-y pinch-zoom;
  }
}

/* Font loading optimization */
#meblink-invoice {
  font-display: swap;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Fallback font for better compatibility */
#meblink-invoice * {
  font-family: inherit;
}

/* Print/No-Print classes for interactive editing */
@media screen {
  .print-only {
    display: none !important;
  }
}

@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}
</style>
