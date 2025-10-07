<template>
  <div class="auth-view">
    <!-- Header -->
    <div class="auth-header">
      <div class="auth-icon">
        <svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
      </div>
      <h2 class="auth-title">Welcome Back</h2>
      <p class="auth-subtitle">Sign in to continue to your design projects</p>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="auth-error">
      <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{{ error }}</span>
    </div>

    <!-- Login Form -->
    <form @submit.prevent="handleLogin" class="auth-form">
      <!-- Email -->
      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <input
          id="email"
          v-model="formData.email"
          type="email"
          class="form-input"
          placeholder="your@email.com"
          required
          autocomplete="email"
        />
      </div>

      <!-- Password -->
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
          />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            aria-label="Toggle password visibility"
          >
            <svg v-if="!showPassword" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Remember Me & Forgot Password -->
      <div class="form-row">
        <label class="checkbox-label">
          <input v-model="formData.rememberMe" type="checkbox" class="checkbox-input" />
          <span>Remember me</span>
        </label>
        <button type="button" class="link-button" @click="setAuthModalView('forgot-password')">
          Forgot password?
        </button>
      </div>

      <!-- Submit Button -->
      <button type="submit" class="btn-primary" :disabled="isLoading">
        <span v-if="!isLoading">Sign In</span>
        <span v-else class="loading-spinner">
          <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        </span>
      </button>
    </form>

    <!-- Divider -->
    <div class="divider">
      <span>or</span>
    </div>

    <!-- Register Link -->
    <div class="auth-footer">
      <p>
        Don't have an account?
        <button type="button" class="link-button-primary" @click="setAuthModalView('register')">
          Create account
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import type { LoginData } from '@/types/auth'


const authStore = useAuthStore()
const { isLoading, error } = storeToRefs(authStore)
const { loginUser, setAuthModalView, clearError } = authStore

const formData = ref<LoginData>({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)

async function handleLogin() {
  clearError()
  try {
    await loginUser(formData.value)
  } catch (err) {
    // Error is handled by store
  }
}
</script>

<style scoped>
@import './auth-styles.css';
</style>

