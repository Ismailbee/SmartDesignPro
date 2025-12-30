<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 overflow-hidden animate-scale-in">
      <!-- Header -->
      <div class="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div>
            <h2 class="text-xl font-bold">Forgot Password</h2>
            <p class="text-sm text-amber-100">Reset your account password</p>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Step 1: Select Member -->
        <div v-if="step === 1">
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Select your member account to reset the password:
          </p>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Your Account
            </label>
            <select
              v-model="selectedMemberId"
              :disabled="isLoadingMembers"
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            >
              <option value="" disabled>{{ isLoadingMembers ? 'Loading members...' : '-- Choose your account --' }}</option>
              <option v-for="member in availableMembers" :key="member.id" :value="member.id">
                {{ member.name }} ({{ member.role }})
              </option>
            </select>
            <p v-if="availableMembers.length === 0 && !isLoadingMembers" class="text-xs text-amber-600 dark:text-amber-400 mt-2">
              No members found. Please create an account first.
            </p>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="cancel"
              class="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="goToStep2"
              :disabled="!selectedMemberId"
              class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              Next
            </button>
          </div>
        </div>

        <!-- Step 2: Security Question -->
        <div v-if="step === 2">
          <div class="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p class="text-sm text-slate-700 dark:text-slate-300">
              <span class="font-medium">Account:</span> 
              <span class="font-bold text-amber-700 dark:text-amber-400">{{ selectedMemberName }}</span>
            </p>
          </div>

          <div class="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p class="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Security Verification</p>
                <p class="text-xs text-blue-700 dark:text-blue-400">
                  To verify your identity, please correctly enter the member's name and role as registered.
                </p>
              </div>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter Full Name (Case Sensitive)
            </label>
            <input
              v-model="securityName"
              type="text"
              placeholder="Enter your full name exactly as registered"
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Enter Role/Position (Case Sensitive)
            </label>
            <input
              v-model="securityRole"
              type="text"
              placeholder="Enter your role exactly as registered"
              class="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            />
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="step = 1"
              class="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Back
            </button>
            <button
              @click="verifySecurityInfo"
              :disabled="!securityName || !securityRole || isVerifying"
              class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white font-medium hover:from-amber-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <span v-if="!isVerifying">Verify</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            </button>
          </div>
        </div>

        <!-- Step 3: Reset Password -->
        <div v-if="step === 3">
          <div class="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p class="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span class="font-medium">Identity verified! Set your new password.</span>
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              New Password
            </label>
            <div class="relative">
              <input
                v-model="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Enter new password (min. 6 characters)"
                minlength="6"
                class="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showNewPassword = !showNewPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg v-if="!showNewPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Password must be at least 6 characters long
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Confirm New Password
            </label>
            <div class="relative">
              <input
                v-model="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                placeholder="Re-enter new password"
                @keyup.enter="resetPassword"
                class="w-full px-4 py-3 pr-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <svg v-if="!showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Password Match Indicator -->
          <div v-if="newPassword && confirmPassword" class="mb-4">
            <div v-if="newPassword === confirmPassword" class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
              <span>Passwords match</span>
            </div>
            <div v-else class="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <span>Passwords do not match</span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p class="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              {{ error }}
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button
              @click="step = 2"
              :disabled="isResetting"
              class="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              Back
            </button>
            <button
              @click="resetPassword"
              :disabled="!newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6 || isResetting"
              class="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <span v-if="!isResetting">Reset Password</span>
              <span v-else class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Resetting...
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed, onMounted } from 'vue';
import { getAllMembers, updateMember, saveMemberActivity } from '../api-service';

export default {
  name: 'ForgotPasswordModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  emits: ['close', 'success'],
  setup(props, { emit }) {
    const step = ref(1); // 1: Select Member, 2: Security Questions, 3: Reset Password
    const selectedMemberId = ref('');
    const selectedMemberName = ref('');
    const securityName = ref('');
    const securityRole = ref('');
    const newPassword = ref('');
    const confirmPassword = ref('');
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    const error = ref('');
    const isVerifying = ref(false);
    const isResetting = ref(false);
    const availableMembers = ref([]);
    const isLoadingMembers = ref(false);
    const selectedMemberData = ref(null);

    // Load members from Firebase
    const loadMembers = async () => {
      try {
        isLoadingMembers.value = true;
        error.value = '';

        const branchName = localStorage.getItem('branchName') || 'default';
        const result = await getAllMembers(branchName);
        
        if (result.success) {
          availableMembers.value = result.data;
        } else {
          error.value = 'Failed to load members. Please try again.';
          availableMembers.value = [];
        }
      } catch (err) {
        console.error('Error loading members:', err);
        error.value = 'An error occurred while loading members.';
        availableMembers.value = [];
      } finally {
        isLoadingMembers.value = false;
      }
    };

    // Watch for modal open
    watch(() => props.isOpen, (newVal) => {
      if (newVal) {
        resetForm();
        loadMembers();
      }
    });

    // Load on mount if already open
    onMounted(() => {
      if (props.isOpen) {
        loadMembers();
      }
    });

    const resetForm = () => {
      step.value = 1;
      selectedMemberId.value = '';
      selectedMemberName.value = '';
      securityName.value = '';
      securityRole.value = '';
      newPassword.value = '';
      confirmPassword.value = '';
      showNewPassword.value = false;
      showConfirmPassword.value = false;
      error.value = '';
      selectedMemberData.value = null;
    };

    const goToStep2 = () => {
      if (!selectedMemberId.value) {
        error.value = 'Please select a member account';
        return;
      }

      const member = availableMembers.value.find(m => m.id == selectedMemberId.value);
      if (!member) {
        error.value = 'Selected member not found';
        return;
      }

      selectedMemberData.value = member;
      selectedMemberName.value = member.name;
      error.value = '';
      step.value = 2;
    };

    const verifySecurityInfo = () => {
      if (!securityName.value || !securityRole.value) {
        error.value = 'Please fill in all security information';
        return;
      }

      isVerifying.value = true;
      error.value = '';

      // Verify name and role match exactly (case sensitive)
      if (securityName.value === selectedMemberData.value.name && 
          securityRole.value === selectedMemberData.value.role) {
        // Security info verified
        isVerifying.value = false;
        step.value = 3;
      } else {
        error.value = 'Security information does not match. Please enter your name and role exactly as registered.';
        isVerifying.value = false;
      }
    };

    const resetPassword = async () => {
      if (!newPassword.value || !confirmPassword.value) {
        error.value = 'Please fill in all password fields';
        return;
      }

      if (newPassword.value.length < 6) {
        error.value = 'Password must be at least 6 characters long';
        return;
      }

      if (newPassword.value !== confirmPassword.value) {
        error.value = 'Passwords do not match';
        return;
      }

      isResetting.value = true;
      error.value = '';

      try {
        // Update password in Firebase
        const branchName = localStorage.getItem('branchName') || 'default';
        const updatedMemberData = {
          ...selectedMemberData.value,
          password: newPassword.value
        };

        const result = await updateMember(branchName, selectedMemberId.value, updatedMemberData);

        if (result.success) {
          // Log activity
          const activityData = {
            memberName: selectedMemberName.value,
            memberId: selectedMemberId.value,
            action: 'Password reset successfully',
            timestamp: new Date().toISOString(),
            branch: branchName,
            page: 'Forgot Password'
          };

          await saveMemberActivity(branchName, activityData);

          // Success
          emit('success', {
            memberName: selectedMemberName.value,
            message: 'Password reset successfully! You can now login with your new password.'
          });
          resetForm();
        } else {
          error.value = result.error || 'Failed to reset password. Please try again.';
        }
      } catch (err) {
        console.error('Error resetting password:', err);
        error.value = 'An error occurred while resetting password. Please try again.';
      } finally {
        isResetting.value = false;
      }
    };

    const cancel = () => {
      resetForm();
      emit('close');
    };

    return {
      step,
      selectedMemberId,
      selectedMemberName,
      securityName,
      securityRole,
      newPassword,
      confirmPassword,
      showNewPassword,
      showConfirmPassword,
      error,
      isVerifying,
      isResetting,
      availableMembers,
      isLoadingMembers,
      goToStep2,
      verifySecurityInfo,
      resetPassword,
      cancel
    };
  }
};
</script>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}
</style>
