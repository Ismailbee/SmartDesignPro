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
                      @change="handleLogoUpload"
                      class="hidden"
                    />

                    <!-- Clickable White Box -->
                    <div
                      @click="$refs.logoInput.click()"
                      class="h-20 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-blue-500 hover:shadow"
                    >
                      <span class="text-[10px] text-slate-500 dark:text-slate-300">
                        Click to upload logo
                      </span>
                    </div>

                    <!-- Preview -->
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

                  <!-- Organization Address -->
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

                  <!-- Organization Phone -->
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
                <span>These details will appear in the invoice header. Upload a logo image (PNG, JPG) or leave empty.</span>
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
import { defineComponent, ref, onMounted } from 'vue';
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
    const organizationAddress = ref('');
    const organizationPhone = ref('');
    const logoDataUrl = ref('');
    const autoReceiptNumber = ref(true);
    const autoDate = ref(true);
    
    // Image cropper state
    const showImageCropper = ref(false);
    const tempImageUrl = ref('');
    const logoInput = ref(null);

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
          if (formData.organizationAddress !== undefined) organizationAddress.value = formData.organizationAddress;
          if (formData.organizationPhone !== undefined) organizationPhone.value = formData.organizationPhone;
          if (formData.logoDataUrl !== undefined) logoDataUrl.value = formData.logoDataUrl;
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
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value
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
        organizationAddress: organizationAddress.value,
        organizationPhone: organizationPhone.value,
        logoDataUrl: logoDataUrl.value,
        formMode: 'generate'
      };
      
      localStorage.setItem('invoicePreviewData', JSON.stringify(previewData));
      
      // Navigate to preview page
      router.push({ name: 'InvoicePreview' });
    };

    const handleRefreshForm = () => {
      if (confirm('Are you sure you want to clear all form data and start fresh?')) {
        organizationName.value = '';
        organizationSubName.value = '';
        organizationAddress.value = '';
        organizationPhone.value = '';
        logoDataUrl.value = '';
        
        localStorage.removeItem('generateInvoiceFormData');
        
        alert('✅ Form cleared successfully!');
        // Force a reload of the current route to ensure the UI reflects cleared state
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
      autoReceiptNumber,
      autoDate,
      showImageCropper,
      tempImageUrl,
      logoInput,
      handleLogoUpload,
      handleCroppedImage,
      handleCropperClose,
      handlePreviewClick,
      handleRefreshForm
    };
  },
});
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
