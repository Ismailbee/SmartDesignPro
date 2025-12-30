<template>
  <div class="h-screen overflow-y-auto bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-emerald-900 py-10">
    <!-- Background Pattern -->
    <div class="fixed inset-0 opacity-5 pointer-events-none">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(16,185,129,0.3),_transparent_50%)]"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,_rgba(6,182,212,0.2),_transparent_50%)]"></div>
    </div>

    <!-- Main Content -->
    <div class="relative min-h-full py-8 px-4 sm:px-6 lg:px-8">
      <!-- Header Section -->
      <div class="max-w-7xl mx-auto mb-8">
        <div class="text-center mb-8 relative">
          <div class="inline-flex items-center gap-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-4 py-2 text-emerald-700 dark:text-emerald-300 text-sm font-semibold uppercase tracking-wide mb-4">
            <span class="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {{ branchTitle }} Member Management
          </div>
          <h1 class="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Member Management
          </h1>
          <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage ICAN members for {{ branchTitle }} Branch
          </p>
        </div>
      </div>

      <!-- Member Management Content -->
      <div class="max-w-7xl mx-auto">
        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <!-- Add New Member -->
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl transition-all duration-300">
            <div class="text-center">
              <div class="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Add New Member</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Register a new ICAN member</p>
              <button class="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors">
                Add Member
              </button>
            </div>
          </div>

          <!-- View All Members -->
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl transition-all duration-300">
            <div class="text-center">
              <div class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">View Members</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Browse all registered members</p>
              <button class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                View All
              </button>
            </div>
          </div>

          <!-- Member Statistics -->
          <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 p-6 hover:shadow-2xl transition-all duration-300">
            <div class="text-center">
              <div class="mx-auto w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                <svg class="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">Statistics</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">Member analytics and reports</p>
              <button class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                View Stats
              </button>
            </div>
          </div>
        </div>

        <!-- Recent Members Table -->
        <div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Recent Members</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">Latest member registrations</p>
          </div>
          
          <div class="p-6">
            <div class="text-center py-12">
              <svg class="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p class="text-slate-600 dark:text-slate-400 text-lg font-medium">No members found</p>
              <p class="text-slate-500 dark:text-slate-500 text-sm mt-1">Start by adding your first member</p>
            </div>
          </div>
        </div>

        <!-- Back to Dashboard -->
        <div class="mt-8 text-center">
          <button 
            @click="$router.push({ name: 'Dashboard', query: { branch: branch } })"
            class="inline-flex items-center gap-2 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  branch?: string
}

const props = withDefaults(defineProps<Props>(), {
  branch: 'Main'
})

const branchTitle = computed(() => {
  return props.branch || 'Main'
})
</script>
