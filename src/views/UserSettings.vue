<template>
  <div class="settings-page">
    <!-- Header -->
    <div class="settings-header">
      <button @click="goBack" class="back-button">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      <h1 class="settings-title">Settings</h1>
      <p class="settings-subtitle">Manage your account settings and preferences</p>
    </div>

    <!-- Settings Navigation -->
    <div class="settings-container">
      <nav class="settings-nav">
        <button
          v-for="section in sections"
          :key="section.id"
          :class="['nav-item', { active: activeSection === section.id }]"
          @click="activeSection = section.id"
        >
          <span class="nav-icon">{{ section.icon }}</span>
          <span class="nav-label">{{ section.label }}</span>
        </button>
      </nav>

      <!-- Settings Content -->
      <div class="settings-content">
        <!-- Account Settings -->
        <div v-if="activeSection === 'account'" class="settings-section">
          <h2 class="section-title">Account Settings</h2>
          <p class="section-description">Manage your account information and profile</p>

          <!-- Profile Picture -->
          <div class="setting-group">
            <label class="setting-label">Profile Picture</label>
            <div class="avatar-upload">
              <div class="avatar-preview">
                <img v-if="profileData.avatar" :src="profileData.avatar" alt="Avatar" />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(profileData.name || 'User') }}
                </div>
              </div>
              <div class="avatar-actions">
                <button @click="uploadAvatar" class="btn-secondary">Upload Photo</button>
                <button v-if="profileData.avatar" @click="removeAvatar" class="btn-text">Remove</button>
              </div>
            </div>
          </div>

          <!-- Name -->
          <div class="setting-group">
            <label class="setting-label">Full Name</label>
            <input
              v-model="profileData.name"
              type="text"
              class="setting-input"
              placeholder="Enter your full name"
            />
          </div>

          <!-- Username -->
          <div class="setting-group">
            <label class="setting-label">Username</label>
            <input
              v-model="profileData.username"
              type="text"
              class="setting-input"
              placeholder="Enter your username"
            />
          </div>

          <!-- Email -->
          <div class="setting-group">
            <label class="setting-label">Email Address</label>
            <input
              v-model="profileData.email"
              type="email"
              class="setting-input"
              placeholder="Enter your email"
            />
            <p class="setting-hint">We'll send a verification email if you change this</p>
          </div>

          <!-- Bio -->
          <div class="setting-group">
            <label class="setting-label">Bio</label>
            <textarea
              v-model="profileData.bio"
              class="setting-textarea"
              placeholder="Tell us about yourself"
              rows="4"
            ></textarea>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveProfile" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Privacy Settings -->
        <div v-if="activeSection === 'privacy'" class="settings-section">
          <h2 class="section-title">Privacy Settings</h2>
          <p class="section-description">Control who can see your information and activity</p>

          <!-- Profile Visibility -->
          <div class="setting-group">
            <label class="setting-label">Profile Visibility</label>
            <select v-model="settings.privacy.profileVisibility" class="setting-select">
              <option value="public">Public - Anyone can view your profile</option>
              <option value="private">Private - Only you can view your profile</option>
            </select>
          </div>

          <!-- Show Email -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Show Email Address</label>
                <p class="setting-hint">Display your email on your public profile</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.privacy.showEmail" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Activity Visibility -->
          <div class="setting-group">
            <label class="setting-label">Activity Visibility</label>
            <select v-model="settings.privacy.activityVisibility" class="setting-select">
              <option value="public">Public - Everyone can see your activity</option>
              <option value="friends">Friends - Only friends can see your activity</option>
              <option value="private">Private - Only you can see your activity</option>
            </select>
          </div>

          <!-- Data Sharing -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Data Sharing</label>
                <p class="setting-hint">Allow us to use your data to improve our services</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.privacy.dataSharing" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Notification Settings -->
        <div v-if="activeSection === 'notifications'" class="settings-section">
          <h2 class="section-title">Notification Settings</h2>
          <p class="section-description">Choose what notifications you want to receive</p>

          <!-- Email Notifications -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Email Notifications</label>
                <p class="setting-hint">Receive notifications via email</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.emailNotifications" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Push Notifications -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Push Notifications</label>
                <p class="setting-hint">Receive push notifications in your browser</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.pushNotifications" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Design Comments -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Design Comments</label>
                <p class="setting-hint">Get notified when someone comments on your designs</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.designComments" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Design Likes -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Design Likes</label>
                <p class="setting-hint">Get notified when someone likes your designs</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.designLikes" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- New Followers -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">New Followers</label>
                <p class="setting-hint">Get notified when someone follows you</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.newFollowers" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Marketplace Updates -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Marketplace Updates</label>
                <p class="setting-hint">Get notified about new templates and marketplace news</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.marketplaceUpdates" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- System Announcements -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">System Announcements</label>
                <p class="setting-hint">Get notified about important system updates</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.notifications.systemAnnouncements" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Preferences -->
        <div v-if="activeSection === 'preferences'" class="settings-section">
          <h2 class="section-title">Preferences</h2>
          <p class="section-description">Customize your experience</p>

          <!-- Theme -->
          <div class="setting-group">
            <label class="setting-label">Theme</label>
            <select v-model="settings.preferences.theme" @change="applyTheme" class="setting-select">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>

          <!-- Language -->
          <div class="setting-group">
            <label class="setting-label">Language</label>
            <select v-model="settings.preferences.language" class="setting-select">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="zh">Chinese</option>
            </select>
          </div>

          <!-- Timezone -->
          <div class="setting-group">
            <label class="setting-label">Timezone</label>
            <select v-model="settings.preferences.timezone" class="setting-select">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">London (GMT)</option>
              <option value="Europe/Paris">Paris (CET)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>

          <!-- Auto Save -->
          <div class="setting-group">
            <div class="setting-toggle">
              <div>
                <label class="setting-label">Auto Save</label>
                <p class="setting-hint">Automatically save your work every few minutes</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" v-model="settings.preferences.autoSave" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>

          <!-- Save Button -->
          <div class="setting-actions">
            <button @click="saveSettings" class="btn-primary" :disabled="isSaving">
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- Security -->
        <div v-if="activeSection === 'security'" class="settings-section">
          <h2 class="section-title">Security</h2>
          <p class="section-description">Manage your password and account security</p>

          <!-- Change Password -->
          <div class="setting-group">
            <label class="setting-label">Change Password</label>
            <input
              v-model="passwordData.currentPassword"
              type="password"
              class="setting-input"
              placeholder="Current password"
            />
            <input
              v-model="passwordData.newPassword"
              type="password"
              class="setting-input"
              placeholder="New password"
              style="margin-top: 12px"
            />
            <input
              v-model="passwordData.confirmPassword"
              type="password"
              class="setting-input"
              placeholder="Confirm new password"
              style="margin-top: 12px"
            />
            <button @click="changePassword" class="btn-secondary" style="margin-top: 12px" :disabled="isSaving">
              {{ isSaving ? 'Changing...' : 'Change Password' }}
            </button>
          </div>

          <!-- Delete Account -->
          <div class="setting-group danger-zone">
            <label class="setting-label">Delete Account</label>
            <p class="setting-hint">Once you delete your account, there is no going back. Please be certain.</p>
            <button @click="confirmDeleteAccount" class="btn-danger">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import type { UserSettings, ProfileUpdateData } from '@/types/auth'

const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const activeSection = ref('account')
const isSaving = ref(false)

const sections = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  { id: 'security', label: 'Security', icon: '🛡️' }
]

const profileData = reactive({
  name: '',
  username: '',
  email: '',
  avatar: '',
  bio: ''
})

const settings = reactive<UserSettings>({
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    activityVisibility: 'public',
    dataSharing: true
  },
  notifications: {
    emailNotifications: true,
    pushNotifications: true,
    designComments: true,
    designLikes: true,
    newFollowers: true,
    marketplaceUpdates: false,
    systemAnnouncements: true
  },
  preferences: {
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
    autoSave: true,
    defaultCanvasSize: '1920x1080'
  }
})

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  loadUserData()
  loadSettings()
  // Sync theme with theme store
  settings.preferences.theme = themeStore.mode
})

function loadUserData() {
  if (authStore.user) {
    profileData.name = authStore.user.name || ''
    profileData.username = authStore.user.username || ''
    profileData.email = authStore.user.email || ''
    profileData.avatar = authStore.user.avatar || ''
  }
}

function loadSettings() {
  const saved = localStorage.getItem('userSettings')
  if (saved) {
    Object.assign(settings, JSON.parse(saved))
  }
  // Sync with theme store
  settings.preferences.theme = themeStore.mode
}

function getInitials(name: string): string {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

async function saveProfile() {
  isSaving.value = true
  try {
    // TODO: Implement API call to update profile
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    authStore.showNotification({
      title: 'Success',
      message: 'Profile updated successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to update profile',
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

async function saveSettings() {
  isSaving.value = true
  try {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    await new Promise(resolve => setTimeout(resolve, 500))
    
    authStore.showNotification({
      title: 'Success',
      message: 'Settings saved successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to save settings',
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

function applyTheme() {
  const theme = settings.preferences.theme
  themeStore.setTheme(theme)
}

async function changePassword() {
  if (passwordData.newPassword !== passwordData.confirmPassword) {
    authStore.showNotification({
      title: 'Error',
      message: 'Passwords do not match',
      type: 'error'
    })
    return
  }

  isSaving.value = true
  try {
    // TODO: Implement password change API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    passwordData.currentPassword = ''
    passwordData.newPassword = ''
    passwordData.confirmPassword = ''
    
    authStore.showNotification({
      title: 'Success',
      message: 'Password changed successfully',
      type: 'success'
    })
  } catch (error) {
    authStore.showNotification({
      title: 'Error',
      message: 'Failed to change password',
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

function uploadAvatar() {
  // TODO: Implement avatar upload
  console.log('Upload avatar')
}

function removeAvatar() {
  profileData.avatar = ''
}

function confirmDeleteAccount() {
  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
    deleteAccount()
  }
}

async function deleteAccount() {
  // TODO: Implement account deletion
  console.log('Delete account')
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 24px;
}

.settings-header {
  max-width: 1200px;
  margin: 0 auto 32px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.back-button:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.back-button svg {
  width: 16px;
  height: 16px;
}

.settings-title {
  font-size: 32px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.settings-subtitle {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

.settings-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 24px;
}

.settings-nav {
  background: white;
  border-radius: 12px;
  padding: 8px;
  height: fit-content;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.nav-item:hover {
  background: #f8fafc;
  color: #1e293b;
}

.nav-item.active {
  background: #eff6ff;
  color: #2563eb;
}

.nav-icon {
  font-size: 18px;
}

.settings-content {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.settings-section {
  max-width: 600px;
}

.section-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px;
}

.section-description {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 32px;
}

.setting-group {
  margin-bottom: 24px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
}

.setting-hint {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0;
}

.setting-input,
.setting-select,
.setting-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  transition: all 0.2s;
}

.setting-input:focus,
.setting-select:focus,
.setting-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.setting-textarea {
  resize: vertical;
  font-family: inherit;
}

.setting-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
  flex-shrink: 0;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: #2563eb;
}

input:checked + .toggle-slider:before {
  transform: translateX(22px);
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #e2e8f0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
  font-size: 24px;
  font-weight: 600;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-actions {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary,
.btn-danger,
.btn-text {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f1f5f9;
  color: #1e293b;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-text {
  background: transparent;
  color: #64748b;
  padding: 8px 12px;
}

.btn-text:hover {
  color: #1e293b;
}

.danger-zone {
  margin-top: 48px;
  padding-top: 24px;
  border-top: 2px solid #fee2e2;
}

@media (max-width: 768px) {
  .settings-container {
    grid-template-columns: 1fr;
  }

  .settings-nav {
    display: flex;
    overflow-x: auto;
    padding: 4px;
  }

  .nav-item {
    flex-shrink: 0;
  }

  .nav-label {
    display: none;
  }

  .settings-content {
    padding: 24px 16px;
  }
}
</style>

