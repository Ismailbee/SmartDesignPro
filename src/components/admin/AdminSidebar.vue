<template>
  <aside class="w-64 bg-white dark:bg-gray-800 shadow-lg">
    <nav class="p-4">
      <ul class="space-y-2">
        <li v-for="item in menuItems" :key="item.path">
          <router-link
            :to="item.path"
            class="block px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            active-class="bg-blue-500 text-white"
          >
            {{ item.label }}
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
const menuItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Payments', path: '/admin/payments' },
  { label: 'Templates', path: '/admin/templates' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' }
]
</script>

