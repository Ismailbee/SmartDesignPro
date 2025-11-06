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
        <section class="w-full max-w-4xl">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              📝 Letterhead Configuration
            </h2>
            <p class="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Customize your letterhead design below
            </p>

            <div class="space-y-6">
              <!-- Organization Settings Section -->
              <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                <h3 class="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-3 flex items-center gap-2">
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
                        @click="logoInput?.click()"
                        class="h-24 flex items-center justify-center bg-white dark:bg-slate-800 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:border-purple-500 hover:shadow"
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
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs resize-none"
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
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs resize-none"
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
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs resize-none"
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
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <p class="text-xs text-purple-700 dark:text-purple-300 mt-3 flex items-start gap-1">
                  <svg class="w-3 h-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>These details will appear in the letterhead header. Upload a logo image (PNG, JPG) or leave empty.</span>
                </p>
              </div>

              <!-- Contact Information Section -->
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <h3 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Information
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Phone -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      v-model="phone"
                      type="text"
                      placeholder="e.g., +234 123 456 7890"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>

                  <!-- Email -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input
                      v-model="email"
                      type="email"
                      placeholder="e.g., info@company.com"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
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
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
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
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Design Settings Section -->
              <div class="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                <h3 class="text-sm font-semibold text-emerald-900 dark:text-emerald-300 mb-3 flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Design Options
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Header Style -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Header Style
                    </label>
                    <select
                      v-model="headerStyle"
                      class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                    >
                      <option value="centered">Centered</option>
                      <option value="left">Left Aligned</option>
                      <option value="split">Split (Logo Left, Info Right)</option>
                    </select>
                  </div>

                  <!-- Accent Color -->
                  <div>
                    <label class="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Accent Color
                    </label>
                    <div class="flex gap-2">
                      <input
                        v-model="accentColor"
                        type="color"
                        class="w-14 h-10 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer"
                      />
                      <input
                        v-model="accentColor"
                        type="text"
                        placeholder="#3B82F6"
                        class="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>

                  <!-- Show Footer -->
                  <div class="flex items-center gap-2">
                    <input
                      id="showFooter"
                      v-model="showFooter"
                      type="checkbox"
                      class="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                    />
                    <label for="showFooter" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Show Footer
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Letter Head Preview Section -->
<section class="w-full max-w-5xl flex items-center justify-center md:ml-4">
  <div class="w-full flex items-center justify-center p-4">
    <div
      id="letterhead-preview"
      ref="letterheadRef"
      class="relative bg-white shadow-2xl border border-slate-200 overflow-hidden"
      style="width: 8.268in; height: 11.693in;"
    >
      <!-- TOP-RIGHT PATTERN -->
      <svg class="absolute top-0 right-0 pointer-events-none" width="350" height="260" viewBox="0 0 350 260">
        <rect x="200" y="10" width="90" height="90" rx="6" fill="none" stroke="#006C63" stroke-width="12" transform="rotate(50, 280, 150)"/>
        <rect x="60" y="00" width="90" height="90" rx="6" fill="none" stroke="#D5BD8F" stroke-width="12" transform="rotate(50, 150, 120)"/>
        <rect x="60" y="20" width="35" height="35" rx="6" fill="none" stroke="#006C63" stroke-width="8" transform="rotate(53, 199, 210)"/>
        <rect x="60" y="20" width="70" height="70" rx="6" fill="none" stroke="#006C63" stroke-width="12" transform="rotate(50, 90, 250)"/>
        <rect x="60" y="20" width="35" height="35" rx="6" fill="none" stroke="#D5BD8F" stroke-width="8" transform="rotate(53, 100, 370)"/>
      </svg>

      <!-- BOTTOM-RIGHT PATTERN -->
      <svg class="absolute bottom-0 right-0 pointer-events-none" width="350" height="260" viewBox="0 0 350 260">
        <rect x="260" y="30" width="70" height="70" rx="6" fill="none" stroke="#006C63" stroke-width="14" transform="rotate(10, 175, 295)"/>
        <rect x="220" y="140" width="110" height="110" rx="6" fill="none" stroke="#D5BD8F" stroke-width="14" transform="rotate(10, 275, 395)"/>
        <rect x="130" y="165" width="85" height="85" rx="6" fill="none" stroke="#006C63" stroke-width="14" transform="rotate(10, 172, 257)"/>
      </svg>

      <!-- TOP LEFT LOGO + NAME -->
      <div class="absolute top-16 left-12 flex items-center gap-3">
        <img v-if="logoDataUrl" :src="logoDataUrl" class="h-14 object-contain" />
        <div class="ml-5">
          <h1 class="text-xl font-extrabold" :style="{ color: accentColor }">
            {{ organizationName || 'Organization Name' }}
          </h1>
          <p v-if="tagline" class="text-xs text-slate-600 mt-1">
            {{ tagline }}
          </p>
        </div>
      </div>

      <!-- WRITING AREA -->
      <div class="absolute inset-0 p-32"></div>

      <!-- BOTTOM FOOTER -->
      <div
        class="absolute bottom-0 left-0 right-0 flex items-center justify-between px-10 py-3 text-xs text-slate-700 font-medium"
        :style="{ backgroundColor: '#D5BD8F' }"
      >
        <div class="flex flex-col">
          <strong>LAGOS:</strong>
          <span>No. 9 Olowogbowo Street, Lagos State</span>
        </div>
        <div class="flex flex-col">
          <strong>ABUJA:</strong>
          <span>No. 10, Quito Street, Maitama</span>
        </div>
        <div class="font-bold text-base">+234 813 8535 549</div>
      </div>
    </div>
  </div>
</section>


      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/BaseButton.vue'
import LogoCropper from '@/components/LogoCropper.vue'
import html2pdf from 'html2pdf.js'
import * as htmlToImage from 'html-to-image'

const router = useRouter()
const authenticatedMember = ref<{ name?: string; role?: string } | null>(null)
const letterheadRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)

// Organization Details
const organizationName = ref('Enter organization name')
const tagline = ref('')
const address = ref('Enter organization address')
const logoDataUrl = ref('')

// Contact Information
const phone = ref('Enter phone number')
const email = ref('Enter email address')
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
