<template>
  <div class="scheduling-page">
    
    <!-- Main Content -->
    <div class="scheduling-content">
      <!-- Unified Button Group -->
      <div class="action-bar">
        
        <!-- Breadcrumb -->
  <div class="breadcrumb-wrapper">
    <div class="breadcrumb">
      <router-link to="/home" class="breadcrumb-link">Home</router-link>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-current">Schedule Selector</span>
    </div>
  </div>
        <div class="button-group">
          <button type="button" :class="btnClasses('today')" @click="selection = 'today'">
            Today
          </button>
          <button type="button" :class="btnClasses('tomorrow')" @click="selection = 'tomorrow'">
            Tomorrow
          </button>
          <button type="button" :class="btnClasses('everyday')" @click="selection = 'everyday'">
            Everyday
          </button>
          <button type="button" :class="btnClasses('all-friday')" @click="selection = 'all-friday'">
            All Friday
          </button>

          <!-- National Public Holidays Dropdown -->
          <div 
            class="holiday-dropdown-container"
            @mouseenter="openHolidayDropdown"
            @mouseleave="delayedCloseHolidayDropdown"
          >
            <button :class="btnClasses('holiday')">
              National Public Holidays
            </button>

            <!-- Dropdown Menu -->
            <transition name="fade">
              <div v-if="holidayDropdownOpen" class="holiday-dropdown-menu">
                <!-- Select All Checkbox -->
                <label class="holiday-item holiday-select-all">
                  <input
                    v-model="allSelected"
                    type="checkbox"
                    class="holiday-checkbox"
                    @change="toggleSelectAll"
                  />
                  <span>Select All</span>
                </label>

                <!-- Holidays -->
                <label
                  v-for="(holiday, idx) in holidays"
                  :key="idx"
                  class="holiday-item"
                  :title="holiday.date + ' – ' + holiday.name"
                >
                  <input
                    v-model="selectedHolidays"
                    :value="holiday"
                    type="checkbox"
                    class="holiday-checkbox"
                  />
                  <span class="holiday-text">
                    {{ holiday.date }} – {{ holiday.name }}
                  </span>
                </label>
              </div>
            </transition>
          </div>
        </div>

        <!-- Social Share Buttons -->
        <div class="social-buttons">  
          <button @click="shareToSocial('whatsapp')" class="social-btn whatsapp" title="Share on WhatsApp">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </button>
          <button @click="shareToSocial('facebook')" class="social-btn facebook" title="Share on Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button @click="shareToSocial('instagram')" class="social-btn instagram" title="Share on Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
            </svg>
          </button>
          <button @click="shareToSocial('linkedin')" class="social-btn linkedin" title="Share on LinkedIn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button @click="shareToSocial('twitter')" class="social-btn twitter" title="Share on Twitter">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button @click="shareToSocial('tiktok')" class="social-btn tiktok" title="Share on TikTok">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
            </svg>
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button type="button" class="attach-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
            </svg>
            Attach
          </button>
          <button type="button" class="send-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            Send
          </button>
        </div>
      </div>

      <!-- Main Grid Layout -->
      <div class="main-grid">
        <!-- Calendar and Task Section -->
        <div class="calendar-section">
          <!-- Custom Calendar -->
          <div class="calendar-card">
            <!-- Header -->
            <div class="calendar-header">
              <button @click="prevMonth" class="calendar-nav-btn">‹</button>
              <h2 class="calendar-title">
                {{ monthNames[currentMonth] }} {{ currentYear }}
              </h2>
              <button @click="nextMonth" class="calendar-nav-btn">›</button>
            </div>

            <!-- Week Days -->
            <div class="calendar-weekdays">
              <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
            </div>

            <!-- Dates -->
            <div class="calendar-dates">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="calendar-day"
                :class="{
                  'selected': isSelected(day),
                  'empty': !day,
                  'clickable': day
                }"
                @click="selectDate(day)"
              >
                {{ day || '' }}
              </div>
            </div>

            <!-- Selected date -->
            <div v-if="selectedDate" class="selected-date">
              Selected: {{ selectedDate }}
            </div>
          </div>

          <!-- Task Form -->
          <div class="task-form">
            <div class="form-group">
              <label class="form-label">Task Description</label>
              <textarea 
                v-model="task" 
                class="form-textarea" 
                rows="4"
                placeholder="Describe your task..."
              ></textarea>
            </div>

            <div class="form-group hidden">
              <label class="form-label">Select Time</label>
              <input 
                v-model="selectedTime" 
                type="time" 
                class="form-input"
              />
            </div>

            <button @click="scheduleTask" class="schedule-btn">
              Schedule Task
            </button>

            <!-- Scheduled Task Card -->
            <div v-if="scheduledTask" class="scheduled-task-card">
              <h3 class="card-title">Scheduled Task</h3>
              <div class="card-content">
                <p><strong>Date:</strong> {{ selectedDate }}</p>
                <p><strong>Time:</strong> {{ selectedTime }}</p>
                <p><strong>Task:</strong> {{ task }}</p>
                <div v-if="selectedHolidays.length" class="holidays-list">
                  <p><strong>Holidays Selected:</strong></p>
                  <ul>
                    <li v-for="(h, i) in selectedHolidays" :key="i">
                      {{ h.date }} – {{ h.name }}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Templates and Holidays Section -->
        <div class="templates-section">
          <!-- Headers -->
          <div class="section-headers">
            <div class="header-box template">
              <p>Template</p>
            </div>
            <div class="header-box holiday">
              <p>Holiday</p>
            </div>
          </div>

          <!-- Grid Content -->
          <div class="content-grid">
            <!-- Left Side Grid (Templates) -->
            <div class="template-grid">
              <div v-for="n in 10" :key="n" class="template-item">
                Template {{ n }}
              </div>
            </div>

            <!-- Right Side (Holiday Placeholder) -->
            <div class="holiday-display">
              <div class="placeholder-content">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>Holiday Calendar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// State
const selectedDate = ref<string | null>(null)
const selectedTime = ref('')
const task = ref('')
const scheduledTask = ref(false)
const selection = ref('today')
const selectedHolidays = ref<Array<{ date: string; name: string }>>([])
const holidayDropdownOpen = ref(false)
const allSelected = ref(false)
let closeTimeout: number | null = null

const holidays = ref([
  { date: '2025-01-01', name: "New Year's Day" },
  { date: '2025-03-31', name: 'Eid el-Fitr' },
  { date: '2025-04-01', name: 'Eid el-Fitr Holiday' },
  { date: '2025-04-18', name: 'Good Friday' },
  { date: '2025-04-21', name: 'Easter Monday' },
  { date: '2025-05-01', name: "Workers' Day" },
  { date: '2025-06-06', name: 'Eid-ul-Adha' },
  { date: '2025-06-09', name: 'Eid-ul-Adha Holiday' },
  { date: '2025-06-12', name: 'Democracy Day' },
  { date: '2025-07-15', name: 'Day of Mourning (Buhari)' },
  { date: '2025-09-04', name: 'Eid-el-Maulud' },
  { date: '2025-10-01', name: 'Independence Day' },
  { date: '2025-12-25', name: 'Christmas Day' },
  { date: '2025-12-26', name: 'Boxing Day' }
])

// Hover dropdown handling
function openHolidayDropdown() {
  if (closeTimeout) {
    window.clearTimeout(closeTimeout)
  }
  holidayDropdownOpen.value = true
}

function delayedCloseHolidayDropdown() {
  closeTimeout = window.setTimeout(() => {
    holidayDropdownOpen.value = false
  }, 200)
}

function toggleSelectAll() {
  if (allSelected.value) {
    selectedHolidays.value = [...holidays.value]
  } else {
    selectedHolidays.value = []
  }
}

function scheduleTask() {
  if (selectedDate.value && selectedTime.value && task.value.trim()) {
    scheduledTask.value = true
    alert('Task Scheduled!')
  } else {
    alert('Please fill in all fields.')
  }
}

const btnClasses = (val: string) => {
  const base = 'action-btn'
  const active = selection.value === val ? 'active' : ''
  return `${base} ${active}`
}

// Social Media Share
function shareToSocial(platform: string) {
  const url = encodeURIComponent("https://smartdesignpro.com")
  const text = encodeURIComponent(`Check out this: ${task.value || 'My scheduled item'}`)

  let shareUrl = ""
  switch (platform) {
    case "whatsapp":
      shareUrl = `https://wa.me/?text=${text}%20${url}`
      break
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
      break
    case "instagram":
      alert("Instagram sharing requires native app integration. Copying link instead.")
      navigator.clipboard.writeText(`${text} ${url}`)
      return
    case "linkedin":
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
      break
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`
      break
    case "tiktok":
      alert("TikTok sharing is not available via web. Copying link instead.")
      navigator.clipboard.writeText(`${text} ${url}`)
      return
  }

  if (shareUrl) {
    window.open(shareUrl, "_blank")
  }
}

// Calendar State
const today = new Date()
const currentMonth = ref(today.getMonth())
const currentYear = ref(today.getFullYear())

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]
const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Generate calendar days
const calendarDays = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  const daysInMonth = new Date(currentYear.value, currentMonth.value + 1, 0).getDate()

  const days: (number | null)[] = Array(firstDay).fill(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  return days
})

// Navigation
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

// Select date
function selectDate(day: number | null) {
  if (!day) return
  selectedDate.value = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function isSelected(day: number | null) {
  if (!selectedDate.value || !day) return false
  const [y, m, d] = selectedDate.value.split("-").map(Number)
  return y === currentYear.value && m === currentMonth.value + 1 && d === day
}
</script>

<style scoped>
.scheduling-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%);
}

/* Breadcrumb */
.breadcrumb-wrapper {
  background: white;
  border-bottom: solid 1px #e2e8f0;
  padding: 0.5rem 3rem;
  width: 100%;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: #06b6d4;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-link:hover {
  color: #0891b2;
}

.breadcrumb-separator {
  color: #64748b;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 600;
}

/* Main Content */
.scheduling-content {
  padding: 0.75rem 3rem 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Action Bar */
.action-bar {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  width: 100%;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background: #fef3c7;
  border-color: #f59e0b;
  color: #92400e;
}

.action-btn.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: white;
}

/* Holiday Dropdown */
.holiday-dropdown-container {
  position: relative;
}

.holiday-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  z-index: 50;
  width: 18rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
}

.holiday-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
}

.holiday-item:hover {
  background: #fef3c7;
}

.holiday-select-all {
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.holiday-checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #f59e0b;
  cursor: pointer;
}

.holiday-text {
  font-size: 0.875rem;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Social Buttons */
.social-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.social-btn {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.social-btn:hover {
  transform: scale(1.1);
}

.social-btn svg {
  width: 1rem;
  height: 1rem;
}

.social-btn.whatsapp { background: #25d366; color: white; }
.social-btn.facebook { background: #1877f2; color: white; }
.social-btn.instagram { background: #e4405f; color: white; }
.social-btn.linkedin { background: #0a66c2; color: white; }
.social-btn.twitter { background: #1da1f2; color: white; }
.social-btn.tiktok { background: #000000; color: white; }

/* Action Buttons */
.action-buttons {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.attach-btn,
.send-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
}

.attach-btn {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.attach-btn:hover {
  background: #f8fafc;
}

.attach-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.send-btn {
  background: #f59e0b;
  color: white;
}

.send-btn:hover {
  background: #d97706;
}

.send-btn svg {
  width: 1rem;
  height: 1rem;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

/* Calendar Section */
.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.calendar-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.calendar-nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border: none;
  border-radius: 6px;
  font-size: 1.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.calendar-nav-btn:hover {
  background: #e2e8f0;
}

.calendar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  font-weight: 500;
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.75rem;
}

.weekday {
  padding: 0.5rem;
}

.calendar-dates {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  text-align: center;
}

.calendar-day {
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.calendar-day.empty {
  background: transparent;
}

.calendar-day.clickable {
  cursor: pointer;
  color: #1e293b;
}

.calendar-day.clickable:hover {
  background: #fef3c7;
}

.calendar-day.selected {
  background: #f59e0b;
  color: white;
  font-weight: 600;
}

.selected-date {
  margin-top: 1.5rem;
  text-align: center;
  font-weight: 500;
  color: #1e293b;
}

/* Task Form */
.task-form {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group.hidden {
  display: none;
}

.form-label {
  display: block;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #f59e0b;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
}

.schedule-btn {
  width: 100%;
  padding: 0.875rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.schedule-btn:hover {
  background: #059669;
}

.scheduled-task-card {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.card-content p {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.card-content strong {
  color: #1e293b;
}

.holidays-list {
  margin-top: 0.75rem;
}

.holidays-list ul {
  list-style: disc;
  padding-left: 1.5rem;
  margin-top: 0.5rem;
}

.holidays-list li {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 0.25rem;
}

/* Templates Section */
.templates-section {
  background: #fffbeb;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-headers {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.header-box {
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-weight: 600;
  color: white;
}

.header-box.template {
  background: #f59e0b;
}

.header-box.holiday {
  background: #f59e0b;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: calc(100% - 4rem);
}

.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  height: fit-content;
}

.template-item {
  height: 5rem;
  background: #ef4444;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.template-item:hover {
  transform: translateY(-2px);
}

.holiday-display {
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.placeholder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  color: #9ca3af;
}

.placeholder-content svg {
  width: 4rem;
  height: 4rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1200px) {
  .main-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .holiday-display {
    min-height: 200px;
  }
}

@media (max-width: 768px) {
  .breadcrumb-wrapper,
  .scheduling-content {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .action-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .button-group,
  .social-buttons,
  .action-buttons {
    justify-content: center;
  }

  .section-headers {
    grid-template-columns: 1fr;
  }

  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
