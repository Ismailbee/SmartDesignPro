<template>
  <div class="relative min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
    <!-- Header Bar -->
    <div class="bg-white dark:bg-slate-800 shadow-sm px-2 py-1.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div>
          <h1 class="text-sm font-bold text-slate-900 dark:text-white">Invoice Preview</h1>
          <p class="text-[10px] text-slate-500 dark:text-slate-400">Invoice #{{ invoiceData.invoiceNumber }}</p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Zoom Controls -->
        <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded p-0.5">
          <button
            :disabled="zoomLevel <= 0.5"
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
            :disabled="zoomLevel >= 2"
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
            title="Reset Zoom"
            @click="resetZoom"
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
            @click="handleSaveInvoice"
          >
            💾 Save Invoice
          </button>
        </div>
      </div>
    </div>

    <!-- Invoice Preview Section - always visible on all screen sizes -->
    <section 
      class="w-full flex items-center justify-center pb-[30vh] pt-[2vh]"
    >
      <!-- Mobile wrapper - scales down on mobile, full size on desktop -->
      <div 
        class="w-full flex items-center justify-center" 
        :style="{ 
          transform: isMobile ? `scale(${mobileScale * zoomLevel})` : `scale(${zoomLevel})`, 
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
            boxShadow: '0 0 15px rgba(0,0,0,0.1)'
          }"
        >
          <div 
            ref="contentWrapperRef"
            class="absolute inset-0"
            :style="{ transform: `scale(${contentScale})`, transformOrigin: 'top left' }"
          >
            <div class="invoice-content-wrapper flex flex-col justify-between h-full w-full p-2">
         <!-- Header -->
        <div class="text-center border-b border-black" :style="{ paddingBottom: headerPadding }">
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
            
          
             <!-- Organization Name (Dynamically scales with invoice height) -->
            <div class="w-auto text-center items-center max-w-[420px]">
                 <!-- Business Number (BN) -->
            <div>
                <p 
                v-if="businessNumber"
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
              
              <p 
                v-else
                class="text-right text-gray-400"
                :style="{ 
                  fontSize: '10px',
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }"
              >
                <strong>BN:</strong> Enter business number
              </p>
            </div>
              <h2 
                v-if="organizationName"
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
              <h2 
                v-else
                class="font-bold text-left text-black"
                :style="{ 
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
                Enter organization name
              </h2>

              <p 
                v-if="organizationSubName"
                class="text-left mt-[-8px] text-slate-900 dark:text-slate-100"
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
              <p 
                v-else
                class="text-left mt-[-8px] text-black"
                :style="{ 
                  fontSize: organizationSubFontSize,
                  wordWrap: 'break-word',
                  wordBreak: 'break-all',
                  overflowWrap: 'break-word',
                  whiteSpace: 'normal'
                }"
              >
                Enter organization subtitle
              </p>
              
           
              
            </div>
        
        </div>
        
      </div>
     
      <div class="flex items-center justify-between mt-1 pl-4">
       
        <!-- Head Office Address & Phone -->
        <div class="max-w-[280px] text-center  mx-auto">
          <!-- Head Office Address -->
          <p 
            v-if="headOfficeAddress"
            class="text-[10px] text-left text-slate-900 dark:text-slate-100"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            <strong>Head Office Address:</strong> {{ headOfficeAddress }}
          </p>
          <p 
            v-else
            class="text-[10px] text-left text-black"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            <strong>Head Office Address:</strong> Enter head office address
          </p>
          
          <!-- Head Office Phone -->
          <p 
            v-if="headOfficePhone"
            class="text-[10px] text-left mt-0.5 font-bold text-slate-900 dark:text-slate-100"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            Tel: {{ headOfficePhone }}
          </p>
          <p 
            v-else
            class="text-[10px] text-left mt-0.5 font-bold text-black"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            Tel: Enter head office phone number
          </p>
        </div>
       
        <!-- Branch Address 1 (Only show if filled) -->
        <div v-if="branchAddress1 || branch1Phone" class="max-w-[280px] text-center ml-2 mx-auto">
          <!-- Branch 1 Address -->
          <p 
            v-if="branchAddress1"
            class="text-[10px] text-left text-slate-900 dark:text-slate-100"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            <strong>Branch Address 1:</strong> {{ branchAddress1 }}
          </p>
          
          <!-- Branch 1 Phone -->
          <p 
            v-if="branch1Phone"
            class="text-[10px] text-left mt-0.5 font-bold text-slate-900 dark:text-slate-100"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            Tel: {{ branch1Phone }}
          </p>
        </div>

        <!-- Branch Address 2 (Only show if filled) -->
        <div v-if="branchAddress2 || branch2Phone" class="max-w-[280px] text-center ml-2 mx-auto">
          <!-- Branch 2 Address -->
          <p 
            v-if="branchAddress2"
            class="text-[10px] text-left text-slate-900 dark:text-slate-100"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            <strong>Branch Address 2:</strong> {{ branchAddress2 }}
          </p>
          
          <!-- Branch 2 Phone -->
          <p 
            v-if="branch2Phone"
            class="text-[10px] text-left mt-0.5 font-bold text-slate-900 dark:text-slate-100"
            style="word-wrap: break-word; word-break: break-word; white-space: normal;"
          >
            Tel: {{ branch2Phone }}
          </p>
        </div>
      
      </div>
        
          <!-- Receipt Title -->
          <div class="flex justify-center items-center my-2">
            <p 
              class="text-sm font-semibold  inline-block px-3 py-1 rounded"
              :style="{
                background: colorStyles.accentColor,
                color: colorStyles.headerText
              }"
            >
              CASH/CREDIT INVOICE
            </p>
            
           
            <div class="gap-1 ml-6">
                 <span>No.:</span>
              <div class="print-only w-16 text-center">{{ receiptNumber || '-' }}</div>
              <input
                v-model.number="receiptNumber"
                :disabled="autoReceiptNumber"
                type="number"
                min="1"
                class="no-print w-16 bg-transparent border-none focus:outline-none text-center"
              />
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
        <div class="mt-3 overflow-visible rounded relative">
          <table class="w-full text-xs table-fixed border-collapse overflow-visible">
            <thead 
              class="uppercase text-[10px]"
              :style="{
                background: colorStyles.tableHeaderBg,
                color: colorStyles.tableHeaderText
              }"
            >
              <tr>
                <th class="w-[7%] px-1.5 py-1 text-center" style="border-top: 1px solid #000000; border-right: 1px solid #000000; border-bottom: 1px solid #000000; border-left: 1px solid #000000;">QTY</th>
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
        <div class="text-[9px] flex-1 justify-start">
            <p class="m-0" >Received the above Goods in a good condition</p>    
          <p class="mt-[-10px]" >No refund of money after payment.</p>    
        
        </div>
          <div class="flex-1 justify-end flex">
          <span class="mr-5">TOTAL</span>
              <span>{{ toCurrency(grandTotal) }}</span>
       
        </div>  
        </div>

        <!-- Footer -->
        <div class="mt-auto text-[12px]">

          <div>
            <div class="flex items-center gap-1">
            <span class="flex whitespace-nowrap">Amount in words:</span>
            <div class="print-only flex-1 text-[10px] border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important;">{{ sumOf || '-' }}</div>
            <input
              ref="sumOfInput1"
              v-model="sumOf"
              class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none text-[10px]"
              @input="handleSumOfOverflow"
            />
          </div>

          <div class="flex items-center h-7 gap-2">
            <div class="print-only flex-1 text-[10px] border-b border-dotted border-black" style="border-bottom: 1px dotted #000000 !important;">{{ sumOf2 || '-' }}</div>
            <input
              ref="sumOfInput2"
              v-model="sumOf2"
              type="text"
              class="no-print flex-1 bg-transparent border-b border-dotted border-black focus:outline-none text-[10px]"
              @input="handleSumOf2Input"
            />
            <span>Naira</span>
            <div class="w-14 bg-transparent border-b border-dotted border-black flex items-center justify-center text-center">
              <span>Only</span>
            </div>
            <span>Kobo</span>
          </div>

          </div>

           <div class="flex justify-between items-start mt-1">
           
            <!-- Signature 1 -->
            <div class="flex flex-col items-center gap-1 mt-[-20px]">
              <!-- Signature 1 Image -->
              <div v-if="signatureImage1" class="h-20 flex items-center">
                <img :src="signatureImage1" alt="Signature 1" class="h-full w-auto object-contain max-w-[180px]" />
              </div>

              <div v-else class="h-20 w-28 border border-dashed border-black flex items-center justify-center text-[9px] text-black">
                No signature
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
              <div v-if="signatureImage2" class="h-20 flex items-center">
                <img :src="signatureImage2" alt="Signature 2" class="h-full w-auto object-contain max-w-[180px]" />
              </div>

              <div v-else class="h-20 w-28 border border-dashed border-black flex items-center justify-center text-[9px] text-black">
                No signature
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
                  v-model.number="invoiceWidth"
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
                  v-model.number="invoiceHeight"
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
import { defineComponent, ref, computed, onMounted, watch, nextTick } from 'vue';
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
    const isExporting = ref(false);
    
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
    
    // Size settings
    const invoiceWidth = ref(5.827);
    const invoiceHeight = ref(8.268);
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
    
  // Preview toggle for mobile (default true so preview is visible on all screen sizes)
  const showPreview = ref(true);
    
    // Editable fields from the new template
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
    const receiptNumber = ref('');
    const autoReceiptNumber = ref(true);
    const customerName = ref('');
    const customerAddress = ref('');
    const date = ref('');
    const autoDate = ref(true);
    const lpo = ref('');
    const items = ref([
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
    ]);
    
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
    
    const sumOf = ref('');
    const sumOf2 = ref('');
    const sumOfInput1 = ref(null);
    const sumOfInput2 = ref(null);
    const signatureImage1 = ref('');
    const signatureImage2 = ref('');
    
    // Signature management
    const savedSignatures = ref([]);
    const selectedSignature1 = ref('');
    const selectedSignature2 = ref('');
    
    // Load invoice data from localStorage
    onMounted(() => {
      const savedData = localStorage.getItem('invoicePreviewData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        invoiceData.value = { ...invoiceData.value, ...parsed };
        
        // Load size and color settings
        if (parsed.invoiceWidth) invoiceWidth.value = parsed.invoiceWidth;
        if (parsed.invoiceHeight) invoiceHeight.value = parsed.invoiceHeight;
        if (parsed.colorMode) colorMode.value = parsed.colorMode;
        
        // Populate editable fields from invoiceData
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
        receiptNumber.value = parsed.invoiceNumber || '';
        
        // Load tax enabled setting
        if (typeof parsed.taxEnabled !== 'undefined') {
          invoiceData.value.taxEnabled = parsed.taxEnabled;
        }
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
      
      // Check if mobile
      isMobile.value = window.innerWidth < 768;
      calculateMobileScale();
      
      window.addEventListener('resize', () => {
        isMobile.value = window.innerWidth < 768;
        calculateMobileScale();
      });
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
    const handleExportPDF = async () => {
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
        
        const filename = `Invoice-${invoiceData.value.invoiceNumber || Date.now()}.pdf`;
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
        
        alert('✅ Invoice exported as PDF successfully!');
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
    
    const handleExportJPEG = async () => {
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
        
        const dataUrl = await htmlToImage.toJpeg(invoiceRef.value, { 
          quality: 0.98, 
          pixelRatio: 3,
          cacheBust: true,
          backgroundColor: '#ffffff'
        });
        
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
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `Invoice-${invoiceData.value.invoiceNumber || Date.now()}.jpg`;
        link.click();
        
        alert('✅ Invoice exported as JPEG successfully!');
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
      if (isExporting.value) return;
      
      try {
        isExporting.value = true;
        
        // Get authenticated member data
        const memberData = localStorage.getItem('authenticatedMember');
        if (!memberData) {
          alert('❌ Please log in to save invoices');
          return;
        }
        
        const member = JSON.parse(memberData);
        if (!member?.branch) {
          alert('❌ Branch information not found');
          return;
        }
        
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
    
    return {
      invoiceRef,
      isExporting,
      invoiceData,
      showSettings,
      showPreview,
      invoiceWidth,
      invoiceHeight,
      isMobile,
      mobileScale,
      zoomLevel,
      zoomIn,
      zoomOut,
      resetZoom,
      colorMode,
      customColor1CMYK,
      customColor2CMYK,
      contentScale,
      invoiceDimensions,
      colorStyles,
      grandTotal,
      // New editable fields
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
      customerName,
      customerAddress,
      date,
      autoDate,
      lpo,
      items,
      MAX_ITEMS,
      logoHeight,
      headerPaddingTop,
      headerPaddingBottom,
      organizationNameFontSize,
      organizationSubFontSize,
      sumOf,
      sumOf2,
      sumOfInput1,
      sumOfInput2,
      signatureImage1,
      signatureImage2,
      // Signature management
      savedSignatures,
      selectedSignature1,
      selectedSignature2,
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
