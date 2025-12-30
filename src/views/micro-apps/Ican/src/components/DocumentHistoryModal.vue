<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      @click.self="$emit('close')"
    >
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-white">Saved {{ documentType }}s</h2>
              <p class="text-sm text-white/80">View, edit, or delete your saved documents</p>
            </div>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
          >
            <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p class="mt-4 text-slate-600 dark:text-slate-400">Loading your documents...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="documents.length === 0" class="p-12 text-center">
          <div class="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-slate-900 dark:text-white mb-2">No saved {{ documentType }}s</h3>
          <p class="text-slate-600 dark:text-slate-400">Start creating {{ documentType }}s and save them to the cloud!</p>
        </div>

        <!-- Documents List -->
        <div v-else class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="mb-4 flex items-center justify-between">
            <p class="text-sm text-slate-600 dark:text-slate-400">
              Found {{ documents.length }} saved {{ documentType.toLowerCase() }}{{ documents.length !== 1 ? 's' : '' }}
            </p>
            <div class="flex gap-2">
              <button
                @click="viewMode = 'grid'"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium transition',
                  viewMode === 'grid' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                @click="viewMode = 'list'"
                :class="[
                  'px-3 py-1 rounded-lg text-sm font-medium transition',
                  viewMode === 'list' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                ]"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl p-4 hover:shadow-lg transition-shadow"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h3 class="font-semibold text-slate-900 dark:text-white truncate">
                    {{ documentType === 'Invoice' ? `Invoice #${doc.receiptNumber || doc.id}` : `Receipt #${doc.receiptNumber || doc.id}` }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {{ formatDate(doc.createdAt) }}
                  </p>
                </div>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                  {{ doc.status || 'Active' }}
                </span>
              </div>

              <div class="space-y-1 mb-4 text-sm">
                <p class="text-slate-700 dark:text-slate-300">
                  <span class="font-medium">Customer:</span> {{ doc.customerName || doc.receivedFrom || 'N/A' }}
                </p>
                <p class="text-slate-700 dark:text-slate-300">
                  <span class="font-medium">Amount:</span> <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ formatCurrency(doc.grandTotal || doc.naira || 0) }}</span>
                </p>
                <p v-if="doc.date" class="text-slate-700 dark:text-slate-300">
                  <span class="font-medium">Date:</span> {{ doc.date }}
                </p>
              </div>

              <div class="flex gap-2">
                <button
                  @click="$emit('load', doc)"
                  class="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button
                  @click="confirmDelete(doc)"
                  class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div v-else class="space-y-2">
            <div
              v-for="doc in documents"
              :key="doc.id"
              class="bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Document ID</p>
                    <p class="font-semibold text-slate-900 dark:text-white">
                      {{ documentType === 'Invoice' ? `INV-${doc.receiptNumber || doc.id.slice(-6)}` : `RCP-${doc.receiptNumber || doc.id.slice(-6)}` }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Customer</p>
                    <p class="font-medium text-slate-700 dark:text-slate-300 truncate">
                      {{ doc.customerName || doc.receivedFrom || 'N/A' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Amount</p>
                    <p class="font-bold text-emerald-600 dark:text-emerald-400">
                      {{ formatCurrency(doc.grandTotal || doc.naira || 0) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Created</p>
                    <p class="text-sm text-slate-700 dark:text-slate-300">
                      {{ formatDate(doc.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="flex gap-2 ml-4">
                  <button
                    @click="$emit('load', doc)"
                    class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    @click="confirmDelete(doc)"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <transition name="modal-fade">
          <div
            v-if="showDeleteConfirm"
            class="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl"
            @click.self="showDeleteConfirm = false"
          >
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 max-w-md mx-4">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <svg class="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Delete Document</h3>
                  <p class="text-sm text-slate-600 dark:text-slate-400">This action cannot be undone</p>
                </div>
              </div>
              <p class="text-slate-700 dark:text-slate-300 mb-6">
                Are you sure you want to delete this {{ documentType.toLowerCase() }}? All data will be permanently removed from the cloud.
              </p>
              <div class="flex gap-3">
                <button
                  @click="showDeleteConfirm = false"
                  class="flex-1 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  @click="handleDelete"
                  :disabled="deleting"
                  class="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span v-if="deleting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>{{ deleting ? 'Deleting...' : 'Delete' }}</span>
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'DocumentHistoryModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    documents: {
      type: Array,
      default: () => []
    },
    documentType: {
      type: String,
      default: 'Invoice' // 'Invoice' or 'Receipt'
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'load', 'delete'],
  setup(props, { emit }) {
    const viewMode = ref('grid'); // 'grid' or 'list'
    const showDeleteConfirm = ref(false);
    const documentToDelete = ref(null);
    const deleting = ref(false);

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A';
      
      // Handle Firestore Timestamp
      if (timestamp?.toDate) {
        return timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      
      // Handle regular date
      try {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch (e) {
        return 'N/A';
      }
    };

    const formatCurrency = (amount) => {
      const num = parseFloat(amount) || 0;
      return `₦${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const confirmDelete = (doc) => {
      documentToDelete.value = doc;
      showDeleteConfirm.value = true;
    };

    const handleDelete = async () => {
      if (!documentToDelete.value) return;
      
      deleting.value = true;
      try {
        emit('delete', documentToDelete.value);
        // Wait a bit for the parent to handle the deletion
        await new Promise(resolve => setTimeout(resolve, 500));
      } finally {
        deleting.value = false;
        showDeleteConfirm.value = false;
        documentToDelete.value = null;
      }
    };

    // Reset delete confirmation when modal closes
    watch(() => props.isOpen, (newVal) => {
      if (!newVal) {
        showDeleteConfirm.value = false;
        documentToDelete.value = null;
      }
    });

    return {
      viewMode,
      showDeleteConfirm,
      documentToDelete,
      deleting,
      formatDate,
      formatCurrency,
      confirmDelete,
      handleDelete
    };
  }
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .bg-white,
.modal-fade-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .bg-white,
.modal-fade-leave-to .bg-white {
  transform: scale(0.9);
}
</style>
