<template>
  <div>
    <!-- Logo Cropper Modal -->
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
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Complete receipt with customer payment details</p>
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
                <span class="text-slate-600 dark:text-slate-400">Amount:</span>
                <span class="font-bold text-slate-900 dark:text-white ml-1">₦{{ naira || 0 }}</span>
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
            Fill out this form with customer payment details
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

                  <UploadPreviewBox
                    v-model="logoFile"
                    :image-src="logoDataUrl"
                    upload-text="Click to upload logo"
                    upload-hint="PNG, JPG up to 5MB"
                    image-alt="Organization Logo Preview"
                    accept="image/*"
                    height="h-20"
                    @change="handleLogoUpload"
                  />
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
                      Organization Subtitle (Optional)
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
                <span>These details will appear in the receipt header.</span>
              </p>
            </div>

            <!-- Customer Payment Details Section -->
            <div class="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <h3 class="text-xs font-semibold text-emerald-900 dark:text-emerald-300 mb-2.5 flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Payment Information
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <!-- Received From -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Received From
                  </label>
                  <input
                    v-model="receivedFrom"
                    type="text"
                    placeholder="Enter payer name"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <!-- Amount (Naira) -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (Naira)
                  </label>
                  <input
                    v-model.number="naira"
                    type="number"
                    min="0"
                    placeholder="0"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <!-- Amount (Kobo) -->
                <div>
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount (Kobo)
                  </label>
                  <input
                    v-model.number="kobo"
                    type="number"
                    min="0"
                    max="99"
                    placeholder="0"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <!-- Amount in Words (Line 1) -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount in Words (Line 1)
                  </label>
                  <input
                    v-model="sumOf"
                    @input="handleSumOfOverflow"
                    type="text"
                    :placeholder="amountInWords.words || 'Amount in words'"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <!-- Amount in Words (Line 2) -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Amount in Words (Line 2)
                  </label>
                  <input
                    v-model="sumOf2"
                    @input="handleSumOf2Input"
                    type="text"
                    placeholder="Overflow text appears here automatically"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <!-- Payment Description (Line 1) -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Description (Line 1)
                  </label>
                  <input
                    v-model="paymentFor"
                    @input="handlePaymentForOverflow"
                    type="text"
                    placeholder="Enter payment description"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <!-- Payment Description (Line 2) -->
                <div class="md:col-span-2">
                  <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Payment Description (Line 2)
                  </label>
                  <input
                    v-model="paymentFor2"
                    @input="handlePaymentFor2Input"
                    type="text"
                    placeholder="Overflow text appears here automatically"
                    class="w-full px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>
            </div>

            <!-- Total Display -->
            <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div class="flex items-center justify-between">
                <span class="text-xs font-medium text-blue-900 dark:text-blue-300">
                  Total Amount:
                </span>
                <span class="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ₦{{ naira || 0 }}.{{ String(kobo || 0).padStart(2, '0') }}
                </span>
              </div>
              <div v-if="amountInWords.words" class="mt-1.5 text-[10px] text-blue-700 dark:text-blue-300 italic">
                {{ amountInWords.words }}
              </div>
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
              <span>Preview Receipt</span>
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
import UploadPreviewBox from '@/components/common/UploadPreviewBox.vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'CustomerReceiptPage',
  components: { 
    LogoCropper,
    UploadPreviewBox
  },
  setup() {
    const router = useRouter();
    const authenticatedMember = ref(null);
    
    // Form fields
    const organizationName = ref('');
    const organizationSubName = ref('');
    const organizationAddress = ref('');
    const organizationPhone = ref('');
    const logoFile = ref(null);
    const logoDataUrl = ref('');
    const receivedFrom = ref('');
    const naira = ref(0);
    const kobo = ref(0);
    const sumOf = ref('');
    const sumOf2 = ref('');
    const paymentFor = ref('');
    const paymentFor2 = ref('');
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    const logoInput = ref(null);

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
      const totalNaira = Number(naira.value) || 0;
      const totalKobo = Number(kobo.value) || 0;
      const words = `${numberToWords(totalNaira)} naira${totalKobo ? ' and ' + numberToWords(totalKobo) + ' kobo' : ''}`;
      return { words: words.replace(/\b\w/g, (s) => s.toUpperCase()), formatted: `${totalNaira} Naira ${totalKobo} Kobo` };
    });

    onMounted(() => {
      const memberData = localStorage.getItem('authenticatedMember');
      if (memberData) {
        authenticatedMember.value = JSON.parse(memberData);
      }

      // Load saved form data if any
      const savedFormData = localStorage.getItem('customerReceiptFormData');
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData);
          if (formData.organizationName !== undefined) organizationName.value = formData.organizationName;
          if (formData.organizationSubName !== undefined) organizationSubName.value = formData.organizationSubName;
          if (formData.organizationAddress !== undefined) organizationAddress.value = formData.organizationAddress;
          if (formData.organizationPhone !== undefined) organizationPhone.value = formData.organizationPhone;
          if (formData.logoDataUrl !== undefined) logoDataUrl.value = formData.logoDataUrl;
          if (formData.receivedFrom !== undefined) receivedFrom.value = formData.receivedFrom;
          if (formData.naira !== undefined) naira.value = formData.naira;
          if (formData.kobo !== undefined) kobo.value = formData.kobo;
          if (formData.paymentFor !== undefined) paymentFor.value = formData.paymentFor;
          if (formData.paymentFor2 !== undefined) paymentFor2.value = formData.paymentFor2;
        } catch (error) {
          console.error('Error loading saved form data:', error);
        }
      }
    });

    // Logo upload handler
    const handleLogoUpload = (file) => {
      if (file) {
        logoFile.value = file;
        
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
      } else {
        // Handle file removal
        logoFile.value = null;
        logoDataUrl.value = '';
        saveFormData();
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

    const handleSumOfOverflow = () => {
      const maxLength = 60;
      if (sumOf.value.length > maxLength) {
        const overflow = sumOf.value.substring(maxLength);
        sumOf.value = sumOf.value.substring(0, maxLength);
        sumOf2.value = overflow + sumOf2.value;
      }
    };

    const handleSumOf2Input = () => {
      const maxLength = 80;
      if (sumOf2.value.length > maxLength) {
        sumOf2.value = sumOf2.value.substring(0, maxLength);
      }
    };

    const handlePaymentForOverflow = () => {
      const maxLength = 60;
      if (paymentFor.value.length > maxLength) {
        const overflow = paymentFor.value.substring(maxLength);
        paymentFor.value = paymentFor.value.substring(0, maxLength);
        paymentFor2.value = overflow + paymentFor2.value;
      }
    };

    const handlePaymentFor2Input = () => {
      const maxLength = 80;
      if (paymentFor2.value.length > maxLength) {
        paymentFor2.value = paymentFor2.value.substring(0, maxLength);
      }
    };

    // Auto-fill amount in words
    watch([naira, kobo], () => {
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
        receivedFrom: receivedFrom.value,
        naira: naira.value,
        kobo: kobo.value,
        paymentFor: paymentFor.value,
        paymentFor2: paymentFor2.value
      };
      
      localStorage.setItem('customerReceiptFormData', JSON.stringify(formData));
    };

    // Auto-save on field changes
    watch(
      [
        organizationName, organizationSubName, organizationAddress, organizationPhone,
        logoDataUrl, receivedFrom, naira, kobo, paymentFor, paymentFor2
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
        receivedFrom: receivedFrom.value,
        naira: naira.value,
        kobo: kobo.value,
        sumOf: sumOf.value,
        sumOf2: sumOf2.value,
        paymentFor: paymentFor.value,
        paymentFor2: paymentFor2.value,
        formMode: 'customer'
      };
      
      localStorage.setItem('receiptPreviewData', JSON.stringify(previewData));
      
      router.push({ name: 'receipt-preview' });
    };

    const handleRefreshForm = () => {
      if (confirm('Are you sure you want to clear all form data and start fresh?')) {
        organizationName.value = '';
        organizationSubName.value = '';
        organizationAddress.value = '';
        organizationPhone.value = '';
        logoDataUrl.value = '';
        receivedFrom.value = '';
        naira.value = 0;
        kobo.value = 0;
        sumOf.value = '';
        sumOf2.value = '';
        paymentFor.value = '';
        paymentFor2.value = '';
        
        localStorage.removeItem('customerReceiptFormData');
        
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
      receivedFrom,
      naira,
      kobo,
      sumOf,
      sumOf2,
      paymentFor,
      paymentFor2,
      autoReceiptNumber,
      autoDate,
      amountInWords,
      showImageCropper,
      tempImageUrl,
      logoInput,
      handleLogoUpload,
      handleCroppedImage,
      handleCropperClose,
      handlePreviewClick,
      handleRefreshForm,
      handleSumOfOverflow,
      handleSumOf2Input,
      handlePaymentForOverflow,
      handlePaymentFor2Input
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
