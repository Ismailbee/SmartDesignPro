<template>
<div class="scheduling-page">
    <!-- Breadcrumb -->
    <div class="breadcrumb-wrapper">
      <div class="breadcrumb">
        <router-link to="/home" class="breadcrumb-link">Home</router-link>
        <span class="breadcrumb-separator">›</span>
        <span class="breadcrumb-current">Schedule Selector</span>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="action-bar">
      <div class="flex justify-between items-center px-7 py-3">
        <!-- Schedule Selection Buttons -->
        <div class="button-group">
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
                <div class="holiday-items-container">
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

                <!-- Schedule Task Button in Dropdown -->
                <button class="holiday-schedule-btn" @click="openTaskModalFromDropdown">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Special Events Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('specialEvents')"
            @mouseleave="delayedCloseSpecificDropdown('specialEvents')"
          >
            <button :class="btnClasses('special-events')">
              Special Events
            </button>
            <transition name="fade">
              <div v-if="dropdowns.specialEvents" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('specialEvents')">
                    <input
                      :checked="selectAllStates.specialEvents"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in specialEventsItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('specialEvents', item)">
                    <input
                      :checked="selectedItems.specialEvents.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('specialEvents')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Business Advert Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('businessAdvert')"
            @mouseleave="delayedCloseSpecificDropdown('businessAdvert')"
          >
            <button :class="btnClasses('business-advert')">
              Business Advert
            </button>
            <transition name="fade">
              <div v-if="dropdowns.businessAdvert" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('businessAdvert')">
                    <input
                      :checked="selectAllStates.businessAdvert"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in businessAdvertItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('businessAdvert', item)">
                    <input
                      :checked="selectedItems.businessAdvert.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('businessAdvert')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Weekly Task Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('weeklyTask')"
            @mouseleave="delayedCloseSpecificDropdown('weeklyTask')"
          >
            <button :class="btnClasses('weekly-task')">
              Weekly Task
            </button>
            <transition name="fade">
              <div v-if="dropdowns.weeklyTask" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('weeklyTask')">
                    <input
                      :checked="selectAllStates.weeklyTask"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in weeklyTaskItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('weeklyTask', item)">
                    <input
                      :checked="selectedItems.weeklyTask.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('weeklyTask')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Monthly Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('monthly')"
            @mouseleave="delayedCloseSpecificDropdown('monthly')"
          >
            <button :class="btnClasses('monthly')">
              Monthly
            </button>
            <transition name="fade">
              <div v-if="dropdowns.monthly" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('monthly')">
                    <input
                      :checked="selectAllStates.monthly"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in monthlyItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('monthly', item)">
                    <input
                      :checked="selectedItems.monthly.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('monthly')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- Quote Dropdown -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('quote')"
            @mouseleave="delayedCloseSpecificDropdown('quote')"
          >
            <button :class="btnClasses('quote')">
              Quote
            </button>
            <transition name="fade">
              <div v-if="dropdowns.quote" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Select All Checkbox -->
                  <div class="dropdown-item select-all" @click="toggleSelectAllForMenu('quote')">
                    <input
                      :checked="selectAllStates.quote"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>Select All</span>
                  </div>
                  <!-- Menu Items -->
                  <div v-for="item in quoteItems" :key="item" class="dropdown-item" @click="toggleItemForMenu('quote', item)">
                    <input
                      :checked="selectedItems.quote.includes(item)"
                      type="checkbox"
                      class="dropdown-checkbox"
                      readonly
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
                <!-- Schedule Task Button -->
                <button class="schedule-btn" @click="scheduleDropdownTask('quote')">
                  Schedule Task
                </button>
              </div>
            </transition>
          </div>

          <!-- More Dropdown (No checkboxes) -->
          <div 
            class="dropdown-container"
            @click.stop
            @mouseenter="openSpecificDropdown('more')"
            @mouseleave="delayedCloseSpecificDropdown('more')"
          >
            <button :class="btnClasses('more')">
              More
            </button>
            <transition name="fade">
              <div v-if="dropdowns.more" class="dropdown-menu">
                <div class="dropdown-items-container">
                  <!-- Simple Menu Items (No checkboxes or Schedule Task) -->
                  <button v-for="item in moreItems" :key="item" class="more-item" @click="handleMoreAction(item)">
                    {{ item }}
                  </button>
                </div>
              </div>
            </transition>
          </div>
          
        </div>

         <!-- Social Share Buttons -->
        <div class="social-buttons">
          <button class="social-btn whatsapp" title="Share on WhatsApp" @click="shareToSocial('whatsapp')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
          </button>
          <button class="social-btn facebook" title="Share on Facebook" @click="shareToSocial('facebook')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>
          <button class="social-btn instagram" title="Share on Instagram" @click="shareToSocial('instagram')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
            </svg>
          </button>
          <button class="social-btn linkedin" title="Share on LinkedIn" @click="shareToSocial('linkedin')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </button>
          <button class="social-btn twitter" title="Share on Twitter" @click="shareToSocial('twitter')">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </button>
          <button class="social-btn tiktok" title="Share on TikTok" @click="shareToSocial('tiktok')">
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
        </div>

        <!-- Templates and Holidays Section -->
        <div class="templates-section">
          <!-- Grid Content -->
          <div class="content-grid">
            <!-- Left Side: Template Section -->
            <div class="template-section">
              <!-- Template Header -->
              <div class="header-box template">
                <p>Template</p>
              </div>
              <!-- Template Grid -->
              <div class="template-grid">
                <div v-for="n in 6" :key="n" class="template-item">
                  Template {{ n }}
                </div>
              </div>
            </div>

          <!-- Right Side: Holiday Section -->
            <div class="holiday-section">
              <!-- Holiday Header -->
              <div class="header-box holiday">
                <p>Upcoming Events</p>
              </div>
              <!-- Holiday Calendar -->
              <div class="holiday-display">
                <!-- Show placeholder when no tasks -->
                <div v-if="scheduledTasks.length === 0" class="placeholder-content">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  <span>Holiday Calendar</span>
                </div>

                <!-- Show scheduled tasks list -->
                <div v-else class="scheduled-tasks-list">
                  <div 
                    v-for="(taskItem, index) in scheduledTasks" 
                    :key="index"
                    class="scheduled-task-item"
                  >
                    <div class="task-image-box">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
                      </svg>
                    </div>
                    <div class="task-details">
                      <div class="task-name">{{ taskItem.name }}</div>
                      <div class="task-date-time">{{ taskItem.date }} at {{ taskItem.time }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Task Form Modal -->
      <transition name="modal-fade">
        <div v-if="showTaskModal" class="modal-overlay" @click="closeTaskModal">
          <div class="modal-content" @click.stop>
            <!-- Close Button -->
            <button class="modal-close" @click="closeTaskModal">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <!-- Modal Header -->
            <div class="modal-header">
              <h2 class="modal-title">Task Description</h2>
            </div>

            <!-- Events Banner (Horizontal Scrolling) -->
            <div v-if="selectedHolidays.length > 0" class="events-banner">
              <button class="scroll-arrow scroll-left" @click="scrollEventsLeft">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <div class="events-list-wrapper">
                <div class="events-list" ref="eventsList">
                  <button 
                    v-for="(holiday, idx) in selectedHolidays" 
                    :key="`event-${idx}`" 
                    class="event-item"
                    :class="{ active: activeHolidayIndices.includes(idx) }"
                    @click="toggleHoliday(idx)"
                  >
                    <span class="event-name">{{ holiday.name }}</span>
                    <span v-if="activeHolidayIndices.includes(idx)" class="checkmark">✓</span>
                  </button>
                </div>
              </div>
              <button class="scroll-arrow scroll-right" @click="scrollEventsRight">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>

            <div class="modal-body">
              <!-- Description Section (Button inside dashed box) -->
              <div class="description-row">
                <div class="description-section">
                  <label class="section-label">Description:</label>
                  <div class="description-flex">
                    <textarea 
                      v-model="organizerName" 
                      class="description-textarea" 
                      rows="6"
                      placeholder="E.g:  James Williams (Chairman, West Local Government)&#10;        Quote 'should be inside Quotation'&#10;        phone No: 08032-----54, 080.........&#10;        Email: lgb02@gmail.com&#10;        Facebook/Whatsaap: igb.02&#10;        Instagram: igb02_tn"
                    ></textarea>
                    <button class="btn-generate-quotes">Generate Quotes</button>
                  </div>
                  
                  <!-- Upload, Preview and Time Section -->
                  <div class="upload-time-container">
                <!-- Picture Upload Section -->
                <div class="upload-section-new" :class="{ disabled: uploadedPictures.length >= 3 }">
                  <label class="upload-label">
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple
                      class="upload-input"
                      :disabled="uploadedPictures.length >= 3"
                      @change="handlePictureUpload"
                    />
                    <div class="upload-box-new">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span class="upload-text-new">{{ uploadedPictures.length < 3 ? `Upload Pictures (${uploadedPictures.length}/3)` : 'Max 3 Pictures' }}</span>
                      <span class="upload-subtitle">Select multiple images to crop and upload</span>
                    </div>
                  </label>
                </div>

                <!-- Image Preview Section -->
                <div class="image-preview-section">




                  <div class="preview-container">
                    <div v-if="uploadedPictures.length === 0" class="preview-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/>
                        <polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span class="preview-text">Preview ({{ uploadedPictures.length }}/3)</span>
                    </div>
                    <div v-else class="image-carousel" @wheel="handleWheel">
                      <!-- Navigation arrows -->
                      <button 
                        v-if="uploadedPictures.length > 1" 
                        class="nav-arrow nav-left" 
                        @click="previousImage"
                        title="Previous image (continuous loop) - Use ← key"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="15 18 9 12 15 6"></polyline>
                        </svg>
                      </button>
                      
                      <!-- Current image with enhanced features -->
                      <div class="image-wrapper">
                        
                        <img 
                          :src="uploadedPictures[currentPreviewIndex]" 
                          alt="Preview Image" 
                          class="preview-image"
                          draggable="true"
                          @dblclick="openImagePreview"
                          @dragstart="handleDragStart($event, currentPreviewIndex)"
                          @dragover="handleDragOver"
                          @drop="handleDrop($event, currentPreviewIndex)"
                          @touchstart="handleTouchStart"
                          @touchend="handleTouchEnd"
                        />
                        
                        <button 
                          class="delete-image-btn" 
                          @click="deleteImage(currentPreviewIndex)" 
                          title="Delete this image">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          </svg>
                        </button>
                      </div>
                      
                      <button 
                        v-if="uploadedPictures.length > 1" 
                        class="nav-arrow nav-right" 
                        @click="nextImage"
                        title="Next image (continuous loop) - Use → key"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </button>
                      
                      <!-- Image indicators with drag & drop -->
                      <div v-if="uploadedPictures.length > 1" class="image-indicators">
                        <div 
                          v-for="(image, index) in uploadedPictures" 
                          :key="index"
                          class="indicator-wrapper"
                          draggable="true"
                          @dragstart="handleDragStart($event, index)"
                          @dragover="handleDragOver"
                          @drop="handleDrop($event, index)"
                        >
                          <button 
                            @click="currentPreviewIndex = index"
                            class="indicator" 
                            :class="{ active: index === currentPreviewIndex }"
                          >
                          </button>
                        </div>
                      </div>
                      
                      <!-- Image counter -->
                      <div class="image-counter">{{ currentPreviewIndex + 1 }}/{{ uploadedPictures.length }}</div>
                    </div>
                  </div>
                </div>

                <!-- Time Selector Section -->
                <div class="time-selector-section-new">
                  <div class="time-display-box-new" @click="initializeTimePicker(); showCustomTimePicker = true">
                    <div class="time-display-large">
                      <span class="time-value-large">{{ selectedTime ? formatDisplayTime(selectedTime) : '8:00' }}</span>
                      <div class="time-period-toggle-new">
                        <button 
                          type="button"
                          class="period-option-new" 
                          :class="{ active: getTimePeriod() === 'AM' }" 
                          @click.stop="setTimePeriod('AM')"
                        >
                          am
                        </button>
                        <button 
                          type="button"
                          class="period-option-new" 
                          :class="{ active: getTimePeriod() === 'PM' }" 
                          @click.stop="setTimePeriod('PM')"
                        >
                          pm
                        </button>
                      </div>
                    </div>

                    <!-- Custom Time Picker Dropdown -->
                    <div v-if="showCustomTimePicker" class="custom-time-picker" @click.stop>
                      <div class="time-picker-header">
                        <span>Select Time</span>
                        <button class="close-picker" @click="showCustomTimePicker = false">✕</button>
                      </div>
                      <div class="time-picker-body">
                        <!-- Hour Column -->
                        <div class="time-column">
                          <div class="column-label">Hour</div>
                          <div class="time-box-container">
                            <div class="time-numbers-list" ref="hourScroll" @scroll="handleHourScroll">
                              <div 
                                v-for="hour in 12" 
                                :key="hour"
                                class="time-number-item"
                                :class="{ 'selected': selectedHour === String(hour).padStart(2, '0') }"
                                :data-value="String(hour).padStart(2, '0')"
                              >
                                {{ String(hour).padStart(2, '0') }}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div class="time-separator">:</div>
                        
                        <!-- Minute Column -->
                        <div class="time-column">
                          <div class="column-label">Minute</div>
                          <div class="time-box-container">
                            <div class="time-numbers-list" ref="minuteScroll" @scroll="handleMinuteScroll">
                              <div 
                                v-for="minute in 60" 
                                :key="minute - 1"
                                class="time-number-item"
                                :class="{ 'selected': selectedMinute === String(minute - 1).padStart(2, '0') }"
                                :data-value="String(minute - 1).padStart(2, '0')"
                              >
                                {{ String(minute - 1).padStart(2, '0') }}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <!-- AM/PM Column -->
                        <div class="time-column period-column">
                          <div class="column-label">Period</div>
                          <div class="time-box-container period-container">
                            <div class="period-option" :class="{ 'selected': timePeriod === 'am' }" @click="timePeriod = 'am'">
                              AM
                            </div>
                            <div class="period-option" :class="{ 'selected': timePeriod === 'pm' }" @click="timePeriod = 'pm'">
                              PM
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="time-picker-footer">
                        <button class="btn-confirm-time" @click="confirmTime">Confirm</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                </div>
              </div>

              <!-- Social Media and Action Buttons Section -->
              <div class="bottom-actions-container">
                <!-- Social Media Section -->
                <div class="social-media-section">
                  <div class="social-header-new">
                    <span>Social Media</span>
                    <button type="button" class="btn-select-all-social" @click="toggleSelectAllSocial">{{ selectAllButtonText }}</button>
                  </div>
                  <div class="social-icons">
                    <button type="button" class="social-icon facebook" :class="{ selected: selectedSocialMedia.includes('facebook') }" @click="toggleSocialMedia('facebook')" title="Facebook">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon whatsapp" :class="{ selected: selectedSocialMedia.includes('whatsapp') }" @click="toggleSocialMedia('whatsapp')" title="WhatsApp">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon instagram" :class="{ selected: selectedSocialMedia.includes('instagram') }" @click="toggleSocialMedia('instagram')" title="Instagram">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.630c-.789.306-1.459.717-2.126 1.384S.935 3.35.630 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.630c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon twitter" :class="{ selected: selectedSocialMedia.includes('twitter') }" @click="toggleSocialMedia('twitter')" title="Twitter">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon tiktok" :class="{ selected: selectedSocialMedia.includes('tiktok') }" @click="toggleSocialMedia('tiktok')" title="TikTok">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon youtube" :class="{ selected: selectedSocialMedia.includes('youtube') }" @click="toggleSocialMedia('youtube')" title="YouTube">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon linkedin" :class="{ selected: selectedSocialMedia.includes('linkedin') }" @click="toggleSocialMedia('linkedin')" title="LinkedIn">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon telegram" :class="{ selected: selectedSocialMedia.includes('telegram') }" @click="toggleSocialMedia('telegram')" title="Telegram">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                      </svg>
                    </button>
                    <button type="button" class="social-icon snapchat" :class="{ selected: selectedSocialMedia.includes('snapchat') }" @click="toggleSocialMedia('snapchat')" title="Snapchat">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.510.075.045.203.09.401.09.3-0 .73-.329 1.05-.54.26-.171.354-.21.442-.21.027 0 .049.003.065.008.261.043.264.361.264.431 0 .54-.494 1.085-1.226 1.085-.31 0-.599-.074-.896-.15-.295-.074-.591-.15-.968-.15-.18 0-.368.025-.562.075-.05.014-.101.028-.153.044l.009.009-.013-.004c-.077 1.529-.138 2.772-.415 3.734-.302 1.047-.837 1.857-1.592 2.408-1.03.754-2.367 1.094-3.625 1.094-1.25 0-2.582-.34-3.61-1.094-.755-.551-1.29-1.361-1.593-2.408-.274-.952-.334-2.171-.407-3.67-.014-.257-.029-.52-.048-.794-.17-.047-.357-.082-.557-.082-.374 0-.666.076-.957.15-.296.076-.588.15-.897.15-.73 0-1.224-.546-1.224-1.085 0-.069.003-.387.263-.43.016-.005.038-.008.065-.008.089 0 .183.039.444.21.319.211.75.54 1.049.54.199 0 .325-.045.401-.09-.006-.12-.013-.246-.023-.376l-.021-.289c-.106-1.628-.232-3.654.297-4.847 1.582-3.545 4.939-3.821 5.929-3.821zm.001 1.321c-.81 0-3.784.212-5.135 3.197-.433.967-.32 2.626-.218 4.167.014.203.028.408.042.615l.029.427c.011.161.022.326.033.492.023.346.186.591.453.591.122 0 .227-.039.317-.125.296-.283.481-.791.725-1.403.251-.63.53-1.343 1.017-1.788.332-.304.785-.453 1.386-.453.603 0 1.056.149 1.388.453.487.445.767 1.158 1.018 1.788.244.612.429 1.12.725 1.403.09.086.195.125.317.125.267 0 .43-.245.453-.591.012-.166.023-.331.034-.492l.029-.427c.014-.207.028-.412.042-.615.102-1.541.215-3.2-.218-4.167-1.35-2.985-4.324-3.197-5.134-3.197z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons-new">
                  <button class="btn-schedule-selected-new" @click="scheduleTask">
                    Schedule Selected Task
                  </button>
                  <button class="btn-schedule-all-new" @click="scheduleAllTasks">
                    Schedule All Task
                  </button>
                </div>
              </div>

              <!-- Scheduled Task Card -->
              <div v-if="scheduledTask" class="scheduled-task-card">
                <div class="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3 class="card-title">Task Scheduled Successfully!</h3>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>



  <!-- Image Cropper Modal -->
  <LogoCropper
    v-if="showCropper && currentImageToCrop"
    :is-open="showCropper"
    :image-url="currentImageToCrop"
    @crop="handleCropComplete"
    @close="closeCropper"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import LogoCropper from '../components/LogoCropper.vue'

// State
const selectedDate = ref<string | null>(null)
const selectedTime = ref('08:00')
const task = ref('')
const scheduledTask = ref(false)
const selection = ref('holiday')
const selectedHolidays = ref<Array<{ date: string; name: string }>>([])
const holidayDropdownOpen = ref(false)
const allSelected = ref(false)
const showTaskModal = ref(false)
const scheduledTasks = ref<Array<{ date: string; time: string; name: string; source: string }>>([])
const uploadedLogo = ref<string | null>(null)
const uploadedPictures = ref<string[]>([])
const currentPreviewIndex = ref(0)
const currentHolidayIndex = ref<number>(0)

// Image cropping state
const showCropper = ref(false)
const currentImageToCrop = ref('')
const pendingImages = ref<string[]>([])
const currentCropIndex = ref(0)

// Advanced carousel features
const isDragging = ref(false)
const dragStartIndex = ref(-1)
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const activeHolidayIndices = ref<number[]>([])
const organizerName = ref('')
const timePeriod = ref<'am' | 'pm'>('am')
const timeInput = ref<HTMLInputElement | null>(null)
const eventsList = ref<HTMLDivElement | null>(null)
const hourScroll = ref<HTMLDivElement | null>(null)
const minuteScroll = ref<HTMLDivElement | null>(null)
let closeTimeout: number | null = null

// Social Media Selection State
const selectedSocialMedia = ref<string[]>([])

// New Dropdown System
const dropdowns = ref({
  specialEvents: false,
  businessAdvert: false,
  weeklyTask: false,
  monthly: false,
  quote: false,
  more: false
})

const selectedItems = ref({
  specialEvents: [] as string[],
  businessAdvert: [] as string[],
  weeklyTask: [] as string[],
  monthly: [] as string[],
  quote: [] as string[]
})

const selectAllStates = ref({
  specialEvents: false,
  businessAdvert: false,
  weeklyTask: false,
  monthly: false,
  quote: false
})

// Menu Items
const specialEventsItems = ['Birthday', 'Congratulatory Msg', 'Appointment']
const businessAdvertItems = ['Product Launch', 'Promo', 'Business Update']
const weeklyTaskItems = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const monthlyItems = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const quoteItems = ['Daily Quote', 'Motivational', 'Wisdom Quote']
const moreItems = ['Set-up Signee', 'Document Schedule', 'Set-up Colour']

// Custom Time Picker State
const showCustomTimePicker = ref(false)
const selectedHour = ref('08')
const selectedMinute = ref('00')
const hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const minutes = [
  '00', '01', '02', '03', '04', '05', '06', '07', '08', '09',
  '10', '11', '12', '13', '14', '15', '16', '17', '18', '19',
  '20', '21', '22', '23', '24', '25', '26', '27', '28', '29',
  '30', '31', '32', '33', '34', '35', '36', '37', '38', '39',
  '40', '41', '42', '43', '44', '45', '46', '47', '48', '49',
  '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'
]

// Initialize picker with current time if available
function initializeTimePicker() {
  if (selectedTime.value) {
    const [hours24, mins] = selectedTime.value.split(':')
    let hour12 = parseInt(hours24)
    
    // Convert 24-hour to 12-hour format
    if (hour12 === 0) {
      hour12 = 12
      timePeriod.value = 'am'
    } else if (hour12 < 12) {
      timePeriod.value = 'am'
    } else if (hour12 === 12) {
      timePeriod.value = 'pm'
    } else {
      hour12 -= 12
      timePeriod.value = 'pm'
    }
    
    selectedHour.value = hour12.toString().padStart(2, '0')
    selectedMinute.value = mins
  }
}

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

function openTaskModal() {
  showTaskModal.value = true
}

function openTaskModalFromDropdown() {
  showTaskModal.value = true
  holidayDropdownOpen.value = false
}

function closeTaskModal() {
  showTaskModal.value = false
}

// New Dropdown Functions
function toggleDropdown(menuName: keyof typeof dropdowns.value) {
  // Close all other dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== menuName) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
    }
  })
  
  // Toggle the current dropdown
  dropdowns.value[menuName] = !dropdowns.value[menuName]
  
  // Close holiday dropdown if it's open
  if (dropdowns.value[menuName]) {
    holidayDropdownOpen.value = false
  }
}

function toggleSelectAllForMenu(menuName: keyof typeof selectedItems.value) {
  const items = getItemsForMenu(String(menuName))
  const currentlyAllSelected = selectAllStates.value[menuName]
  
  // Toggle the state
  selectAllStates.value[menuName] = !currentlyAllSelected
  
  // Update selected items based on new state
  if (selectAllStates.value[menuName]) {
    selectedItems.value[menuName] = [...items]
  } else {
    selectedItems.value[menuName] = []
  }
}

function toggleItemForMenu(menuName: keyof typeof selectedItems.value, item: string) {
  const currentItems = selectedItems.value[menuName] || []
  
  if (currentItems.includes(item)) {
    // Remove item
    selectedItems.value[menuName] = currentItems.filter(i => i !== item)
  } else {
    // Add item
    selectedItems.value[menuName] = [...currentItems, item]
  }
  
  // Update select all state based on whether all items are selected
  const allItems = getItemsForMenu(String(menuName))
  selectAllStates.value[menuName] = selectedItems.value[menuName].length === allItems.length
}

function getItemsForMenu(menuName: string): string[] {
  switch (menuName) {
    case 'specialEvents': return specialEventsItems
    case 'businessAdvert': return businessAdvertItems
    case 'weeklyTask': return weeklyTaskItems
    case 'monthly': return monthlyItems
    case 'quote': return quoteItems
    default: return []
  }
}

function scheduleDropdownTask(menuName: keyof typeof selectedItems.value) {
  const selected = selectedItems.value[menuName]
  if (selected.length > 0) {
    // Open the task modal with the selected items
    showTaskModal.value = true
    // Close the dropdown
    dropdowns.value[menuName as keyof typeof dropdowns.value] = false
  } else {
    alert('Please select at least one item before scheduling.')
  }
}

function handleMoreAction(action: string) {
  // Handle the "More" menu actions here
  switch (action) {
    case 'Set-up Signee':
      // Handle signee setup
      break
    case 'Document Schedule':
      // Handle document schedule
      break
    case 'Set-up Colour':
      // Handle color setup
      break
  }
  // Close the dropdown
  dropdowns.value.more = false
}

// Hover functions for new dropdowns
let specificDropdownTimeout: number | null = null

function openSpecificDropdown(menuName: keyof typeof dropdowns.value) {
  if (specificDropdownTimeout) {
    window.clearTimeout(specificDropdownTimeout)
  }
  
  // Close all other dropdowns first
  Object.keys(dropdowns.value).forEach(key => {
    if (key !== menuName) {
      dropdowns.value[key as keyof typeof dropdowns.value] = false
    }
  })
  
  // Close holiday dropdown if it's open
  holidayDropdownOpen.value = false
  
  // Open the current dropdown
  dropdowns.value[menuName] = true
}

function delayedCloseSpecificDropdown(menuName: keyof typeof dropdowns.value) {
  specificDropdownTimeout = window.setTimeout(() => {
    dropdowns.value[menuName] = false
  }, 200)
}

// Close dropdowns when clicking outside
function handleClickOutside() {
  Object.keys(dropdowns.value).forEach(key => {
    dropdowns.value[key as keyof typeof dropdowns.value] = false
  })
}

// Add click outside listener
document.addEventListener('click', handleClickOutside)

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      uploadedLogo.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function handlePictureUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  if (files.length === 0) {
    return
  }
  
  // Calculate how many more images we can add
  const remainingSlots = 3 - uploadedPictures.value.length
  const filesToProcess = files.slice(0, remainingSlots)
  
  // Convert files to base64 for cropping
  const imagePromises = filesToProcess.map(file => {
    return new Promise<string>((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'))
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
    })
  })
  
  Promise.all(imagePromises)
    .then(images => {
      pendingImages.value = images
      currentCropIndex.value = 0
      startCropping()
    })
    .catch(error => {
      console.error('Error loading images:', error)
    })
  
  // Reset input to allow selecting the same file again
  target.value = ''
}

function deleteImage(index: number) {
  uploadedPictures.value.splice(index, 1)
  // Adjust current index if necessary
  if (currentPreviewIndex.value >= uploadedPictures.value.length) {
    currentPreviewIndex.value = Math.max(0, uploadedPictures.value.length - 1)
  }
}

function nextImage() {
  if (uploadedPictures.value.length > 1) {
    currentPreviewIndex.value = (currentPreviewIndex.value + 1) % uploadedPictures.value.length
  }
}

function previousImage() {
  if (uploadedPictures.value.length > 1) {
    currentPreviewIndex.value = currentPreviewIndex.value === 0 
      ? uploadedPictures.value.length - 1 
      : currentPreviewIndex.value - 1
  }
}

// Touch handling for swipe navigation
let touchStartX = 0
let touchEndX = 0

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.touches[0].clientX
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX = event.changedTouches[0].clientX
  handleSwipe()
}

function handleSwipe() {
  const swipeThreshold = 30 // Reduced for more sensitive swiping
  const diff = touchStartX - touchEndX
  
  if (Math.abs(diff) > swipeThreshold && uploadedPictures.value.length > 1) {
    if (diff > 0) {
      // Swiped left - go to next image (continuous loop)
      nextImage()
    } else {
      // Swiped right - go to previous image (continuous loop)
      previousImage()
    }
  }
}

// Advanced Features

// Keyboard navigation
function handleKeydown(event: KeyboardEvent) {
  if (!uploadedPictures.value.length) return
  
  switch (event.key) {
    case 'ArrowLeft':
      if (!showImagePreview.value) previousImage()
      break
    case 'ArrowRight':
      if (!showImagePreview.value) nextImage()
      break
    case 'Escape':
      if (showImagePreview.value) {
        closeImagePreview()
      }
      break
  }
}

// Image interaction handlers
function openImagePreview() {
  previewImageUrl.value = uploadedPictures.value[currentPreviewIndex.value]
  showImagePreview.value = true
}

function closeImagePreview() {
  showImagePreview.value = false
  previewImageUrl.value = ''
}

// Drag & Drop reordering
function handleDragStart(event: DragEvent, index: number) {
  isDragging.value = true
  dragStartIndex.value = index
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/html', index.toString())
  }
}

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
}

function handleDrop(event: DragEvent, dropIndex: number) {
  event.preventDefault()
  const dragIndex = dragStartIndex.value
  
  if (dragIndex !== -1 && dragIndex !== dropIndex) {
    const newPictures = [...uploadedPictures.value]
    const [draggedItem] = newPictures.splice(dragIndex, 1)
    newPictures.splice(dropIndex, 0, draggedItem)
    uploadedPictures.value = newPictures
    
    // Update current index if needed
    if (currentPreviewIndex.value === dragIndex) {
      currentPreviewIndex.value = dropIndex
    } else if (dragIndex < currentPreviewIndex.value && dropIndex >= currentPreviewIndex.value) {
      currentPreviewIndex.value--
    } else if (dragIndex > currentPreviewIndex.value && dropIndex <= currentPreviewIndex.value) {
      currentPreviewIndex.value++
    }
  }
  
  isDragging.value = false
  dragStartIndex.value = -1
}



function toggleSocialMedia(platform: string) {
  const index = selectedSocialMedia.value.indexOf(platform)
  if (index > -1) {
    selectedSocialMedia.value.splice(index, 1)
  } else {
    selectedSocialMedia.value.push(platform)
  }
}

function toggleSelectAllSocial() {
  const allPlatforms = ['facebook', 'whatsapp', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'telegram', 'snapchat']
  if (selectedSocialMedia.value.length === allPlatforms.length) {
    selectedSocialMedia.value = []
  } else {
    selectedSocialMedia.value = [...allPlatforms]
  }
}

const selectAllButtonText = computed(() => {
  const allPlatforms = ['facebook', 'whatsapp', 'instagram', 'twitter', 'tiktok', 'youtube', 'linkedin', 'telegram', 'snapchat']
  return selectedSocialMedia.value.length === allPlatforms.length ? 'Unselect All' : 'Select All'
})

// Image cropping functions
function startCropping() {
  if (pendingImages.value.length > 0) {
    currentImageToCrop.value = pendingImages.value[currentCropIndex.value]
    showCropper.value = true
  }
}

function handleCropComplete(croppedImageData: string) {
  // Add the cropped image to uploaded pictures
  uploadedPictures.value.push(croppedImageData)
  currentPreviewIndex.value = uploadedPictures.value.length - 1
  
  // Move to next image or finish
  currentCropIndex.value++
  if (currentCropIndex.value < pendingImages.value.length) {
    currentImageToCrop.value = pendingImages.value[currentCropIndex.value]
    // Keep cropper open for next image
  } else {
    closeCropper()
  }
}

function closeCropper() {
  showCropper.value = false
  pendingImages.value = []
  currentCropIndex.value = 0
  currentImageToCrop.value = ''

}

function selectHoliday(index: number) {
  currentHolidayIndex.value = index
  // Reset form for new holiday entry
  uploadedLogo.value = null
  uploadedPicture.value = null
  selectedTime.value = ''
  task.value = ''
  organizerName.value = ''
}

function toggleHoliday(index: number) {
  const idx = activeHolidayIndices.value.indexOf(index)
  if (idx > -1) {
    // Remove if already selected
    activeHolidayIndices.value.splice(idx, 1)
  } else {
    // Add if not selected
    activeHolidayIndices.value.push(index)
  }
  
  // Set current index to the last selected
  if (activeHolidayIndices.value.length > 0) {
    currentHolidayIndex.value = activeHolidayIndices.value[activeHolidayIndices.value.length - 1]
  }
}

function formatDisplayTime(time: string): string {
  if (!time) return 'Select Time'
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:${minutes || '00'}`
}

function getTimePeriod(): string {
  if (!selectedTime.value) return 'AM'
  const [hours] = selectedTime.value.split(':')
  return parseInt(hours) >= 12 ? 'PM' : 'AM'
}

function setTimePeriod(period: 'AM' | 'PM') {
  if (!selectedTime.value) {
    // Set default time based on period
    selectedTime.value = period === 'AM' ? '08:00' : '20:00'
    updateTimePeriod()
    return
  }
  
  const [hours, minutes] = selectedTime.value.split(':')
  let hour = parseInt(hours)
  
  // Convert to 12-hour format first
  const currentPeriod = hour >= 12 ? 'PM' : 'AM'
  
  // Only change if different period selected
  if (currentPeriod !== period) {
    if (period === 'AM' && hour >= 12) {
      hour -= 12
    } else if (period === 'PM' && hour < 12) {
      hour += 12
    }
    
    selectedTime.value = `${hour.toString().padStart(2, '0')}:${minutes}`
    updateTimePeriod()
  }
}

// Custom Time Picker Functions

function validateHour() {
  // Remove non-digits
  selectedHour.value = selectedHour.value.replace(/\D/g, '')
  
  if (selectedHour.value === '') return
  
  let value = parseInt(selectedHour.value)
  if (isNaN(value) || value < 1) {
    selectedHour.value = '01'
  } else if (value > 12) {
    selectedHour.value = '12'
  } else if (selectedHour.value.length === 2 || value > 1) {
    selectedHour.value = value.toString().padStart(2, '0')
  }
}

function validateMinute() {
  // Remove non-digits
  selectedMinute.value = selectedMinute.value.replace(/\D/g, '')
  
  if (selectedMinute.value === '') return
  
  let value = parseInt(selectedMinute.value)
  if (isNaN(value) || value < 0) {
    selectedMinute.value = '00'
  } else if (value > 59) {
    selectedMinute.value = '59'
  } else if (selectedMinute.value.length === 2) {
    selectedMinute.value = value.toString().padStart(2, '0')
  }
}

function incrementHour() {
  let value = parseInt(selectedHour.value) || 12
  value++
  if (value > 12) value = 1
  selectedHour.value = value.toString().padStart(2, '0')
}

function decrementHour() {
  let value = parseInt(selectedHour.value) || 12
  value--
  if (value < 1) value = 12
  selectedHour.value = value.toString().padStart(2, '0')
}

function incrementMinute() {
  let value = parseInt(selectedMinute.value) || 0
  value++
  if (value > 59) value = 0
  selectedMinute.value = value.toString().padStart(2, '0')
}

function decrementMinute() {
  let value = parseInt(selectedMinute.value) || 0
  value--
  if (value < 0) value = 59
  selectedMinute.value = value.toString().padStart(2, '0')
}

function handleHourKey(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    incrementHour()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrementHour()
  }
}

function handleMinuteKey(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    incrementMinute()
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    decrementMinute()
  }
}

function confirmTime() {
  const period = timePeriod.value
  let hour = parseInt(selectedHour.value)
  
  // Convert to 24-hour format
  if (period === 'pm' && hour !== 12) {
    hour += 12
  } else if (period === 'am' && hour === 12) {
    hour = 0
  }
  
  const formattedHour = hour.toString().padStart(2, '0')
  selectedTime.value = `${formattedHour}:${selectedMinute.value}`
  showCustomTimePicker.value = false
}

let hourScrollTimeout: number | null = null
let minuteScrollTimeout: number | null = null
let isScrollingProgrammatically = false

function handleHourScroll() {
  if (isScrollingProgrammatically) return
  if (hourScrollTimeout) clearTimeout(hourScrollTimeout)
  
  hourScrollTimeout = window.setTimeout(() => {
    const scrollContainer = hourScroll.value
    if (!scrollContainer) return
    
    const items = scrollContainer.querySelectorAll('.time-number-item')
    const containerRect = scrollContainer.getBoundingClientRect()
    const containerCenter = containerRect.top + containerRect.height / 2
    
    let closestItem: HTMLElement | null = null
    let closestDistance = Infinity
    
    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect()
      const itemCenter = itemRect.top + itemRect.height / 2
      const distance = Math.abs(containerCenter - itemCenter)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestItem = item as HTMLElement
      }
    })
    
    if (closestItem) {
      const value = closestItem.getAttribute('data-value')
      if (value && value !== selectedHour.value) {
        selectedHour.value = value
      }
    }
  }, 150)
}

function handleMinuteScroll() {
  if (isScrollingProgrammatically) return
  if (minuteScrollTimeout) clearTimeout(minuteScrollTimeout)
  
  minuteScrollTimeout = window.setTimeout(() => {
    const scrollContainer = minuteScroll.value
    if (!scrollContainer) return
    
    const items = scrollContainer.querySelectorAll('.time-number-item')
    const containerRect = scrollContainer.getBoundingClientRect()
    const containerCenter = containerRect.top + containerRect.height / 2
    
    let closestItem: HTMLElement | null = null
    let closestDistance = Infinity
    
    items.forEach((item) => {
      const itemRect = item.getBoundingClientRect()
      const itemCenter = itemRect.top + itemRect.height / 2
      const distance = Math.abs(containerCenter - itemCenter)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestItem = item as HTMLElement
      }
    })
    
    if (closestItem) {
      const value = closestItem.getAttribute('data-value')
      if (value && value !== selectedMinute.value) {
        selectedMinute.value = value
      }
    }
  }, 150)
}

function updateTimePeriod() {
  if (selectedTime.value) {
    const [hours] = selectedTime.value.split(':')
    timePeriod.value = parseInt(hours) >= 12 ? 'pm' : 'am'
  }
}

function scrollEventsLeft() {
  if (eventsList.value) {
    eventsList.value.scrollBy({ left: -350, behavior: 'smooth' })
  }
}

function scrollEventsRight() {
  if (eventsList.value) {
    eventsList.value.scrollBy({ left: 350, behavior: 'smooth' })
  }
}

function scheduleAllTasks() {
  if (selectedHolidays.value.length === 0 || !selectedTime.value) {
    alert('Please select holidays and time.')
    return
  }

  selectedHolidays.value.forEach(holiday => {
    scheduledTasks.value.push({
      date: holiday.date,
      time: selectedTime.value,
      name: holiday.name,
      source: 'holiday'
    })
  })

  // Clear and close
  selectedHolidays.value = []
  allSelected.value = false
  scheduledTask.value = true
  
  setTimeout(() => {
    closeTaskModal()
    scheduledTask.value = false
  }, 1500)
}

function scheduleTask() {
  // Check if we have valid input:
  // Either: (date + time + task) OR (holidays + time)
  const hasCalendarTask = selectedDate.value && selectedTime.value && task.value.trim()
  const hasHolidayTask = selectedHolidays.value.length > 0 && selectedTime.value
  
  if (hasCalendarTask || hasHolidayTask) {
    // Add task from calendar date or manual entry (if provided)
    if (hasCalendarTask) {
      scheduledTasks.value.push({
        date: selectedDate.value,
        time: selectedTime.value,
        name: task.value,
        source: 'calendar'
      })
    }
    
    // Add selected holidays as scheduled tasks
    if (selectedHolidays.value.length > 0 && selectedTime.value) {
      selectedHolidays.value.forEach(holiday => {
        scheduledTasks.value.push({
          date: holiday.date,
          time: selectedTime.value,
          name: holiday.name,
          source: 'holiday'
        })
      })
      // Clear selected holidays after scheduling
      selectedHolidays.value = []
      allSelected.value = false
    }
    
    scheduledTask.value = true
    
    // Reset form fields
    task.value = ''
    selectedTime.value = ''
    selectedDate.value = null
    
    setTimeout(() => {
      closeTaskModal()
      scheduledTask.value = false
    }, 1500)
  } else {
    alert('Please select holidays and time, or fill in date, time, and task description.')
  }
}

const btnClasses = (val: string) => {
  const base = 'action-btn'
  let active = selection.value === val ? 'active' : ''
  
  // Check if any of the new dropdowns are open and mark as active
  if (val === 'special-events' && dropdowns.value.specialEvents) active = 'active'
  if (val === 'business-advert' && dropdowns.value.businessAdvert) active = 'active'
  if (val === 'weekly-task' && dropdowns.value.weeklyTask) active = 'active'
  if (val === 'monthly' && dropdowns.value.monthly) active = 'active'
  if (val === 'quote' && dropdowns.value.quote) active = 'active'
  if (val === 'more' && dropdowns.value.more) active = 'active'
  
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
  openTaskModal()
}

function isSelected(day: number | null) {
  if (!selectedDate.value || !day) return false
  const [y, m, d] = selectedDate.value.split("-").map(Number)
  return y === currentYear.value && m === currentMonth.value + 1 && d === day
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// Computed properties for advanced features
const hasMultipleImages = computed(() => uploadedPictures.value.length > 1)
</script>

<style scoped>
.scheduling-page {
  min-height: 100vh;
  background: linear-gradient(to bottom, #f8fafc 0%, #e2e8f0 100%);
}

/* Breadcrumb */
.breadcrumb-wrapper {
  background: white;
  border-bottom: solid 1px #eee;
  padding: 0.5rem 3rem;
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
  padding: 2rem 3rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Action Bar */
.action-bar {
  background: white;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 1rem;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.button-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
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
  display: flex;
  flex-direction: column;
}

.holiday-items-container {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  max-height: 320px;
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

.holiday-schedule-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.625rem 1rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.holiday-schedule-btn:hover {
  background: #059669;
  transform: translateY(-1px);
}

/* New Dropdown Containers */
.dropdown-container {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
  max-height: 300px;
  margin-top: 0.25rem;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f1f5f9;
  user-select: none;
  font-size: 0.875rem;
  border-radius: 6px;
}

.dropdown-items-container {
  flex: 1;
  overflow-y: auto;
  max-height: 220px;
}

.dropdown-item:hover {
  background-color: #fef3c7;
}

.dropdown-item.select-all {
  background-color: #f1f5f9;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  padding: 0.5rem 0.75rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.5rem;
}

.dropdown-item.select-all:hover {
  background-color: #fef3c7;
}

.dropdown-checkbox {
  width: 1rem;
  height: 1rem;
  margin-right: 0.5rem;
  accent-color: #f59e0b;
  cursor: pointer;
}

.schedule-btn {
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.625rem 1rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  flex-shrink: 0;
}

.schedule-btn:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.more-item {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  color: #1e293b;
  border: none;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  border-radius: 6px;
}

.more-item:last-child {
  border-bottom: none;
}

.more-item:hover {
  background-color: #fef3c7;
}

/* Dropdown Animation */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Social Buttons */
.social-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-btn {
  width: 1.75rem;
  height: 1.75rem;
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
  width: 0.875rem;
  height: 0.875rem;
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
  gap: 0.5rem;
}

.attach-btn,
.send-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 6px;
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
  width: 1rem;
  height: 1rem;
}

.send-btn {
  background: #f59e0b;
  color: white;
}

.send-btn:hover {
  background: #d97706;
}

.send-btn svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Main Grid */
.main-grid {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  padding: 1rem 2rem ;
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

/* Form Styles */
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
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #f59e0b;
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
  height: 100%; /* Fill the grid cell height */
  display: flex;
  flex-direction: column;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  align-items: stretch; /* Make both columns equal height */
  flex: 1; /* Take all remaining space in templates-section */
}

/* Template Section Container */
.template-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%; /* Fill parent height */
}

/* Holiday Section Container */
.holiday-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%; /* Fill parent height */
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

.template-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  flex: 1; /* Take remaining space after header */
}

.template-item {
  min-height: 8rem;
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1; /* Take remaining space after header, matching template grid */
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

/* Scheduled Tasks List */
.scheduled-tasks-list {
  width: 100%;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  max-height: 100%;
}

.scheduled-task-item {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  background: white;
  padding: 0.875rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.scheduled-task-item:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.task-image-box {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.task-image-box svg {
  width: 1.75rem;
  height: 1.75rem;
  stroke-width: 2;
}

.task-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.task-name {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.task-date-time {
  font-size: 0.8125rem;
  color: #6b7280;
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
  .content-grid {
    grid-template-columns: 1fr;
  }

  .holiday-display {
    min-height: 300px;
  }
}

@media (max-width: 768px) {
  .main-grid {
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 20px;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-close {
  position: absolute;
  top: 0.75rem;
  right: 1.25rem;
  width: 2rem;
  height: 2rem;
  border: none;
  background: white;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.modal-close:hover {
  background: #f5f5f5;
  color: #333;
  transform: scale(1.1);
}

.modal-close svg {
  width: 1rem;
  height: 1rem;
}

/* Modal Header */
.modal-header {
  background: linear-gradient(135deg, #4a5ff5 0%, #2d3eb8 100%);
  padding: 0.5rem 2rem 0.75rem 2rem;
  text-align: center;
}

.modal-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: 0.5px;
}

/* Events Banner (Horizontal Scrolling) */
.events-banner {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 0.125rem 1.5rem;
  position: relative;
  border-bottom: 1px solid #dee2e6;
  box-shadow: inset 0 -2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.events-list-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.events-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
  align-items: center;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  padding: 0.75rem 1rem 0.75rem 0.75rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.events-list::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.scroll-arrow {
  background: #2c5aa0;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.scroll-arrow svg {
  width: 20px;
  height: 20px;
  stroke: white;
  stroke-width: 3;
}

.scroll-arrow:hover {
  background: #1e3a6f;
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.scroll-arrow:active {
  transform: scale(0.95);
}

.event-item {
  background: #2c5aa0;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border: 2px solid transparent;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: visible;
  box-shadow: 0 1px 3px rgba(44, 90, 160, 0.15);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.event-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 26px;
}

.event-item:hover {
  background: #1e3a6f;
  transform: translateY(-2px);
  box-shadow: 0 2px 6px rgba(30, 58, 111, 0.25);
}

.event-item:hover::before {
  opacity: 1;
}

.event-item.active {
  background: linear-gradient(135deg, #ff7a3d 0%, #ff5722 100%);
  box-shadow: 0 2px 6px rgba(255, 87, 34, 0.25);
  transform: translateY(-1px) scale(1.02);
  font-weight: 700;
  border: 2px solid rgba(255, 255, 255, 0.6);
}

.event-item.active::before {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 1;
}

.event-name {
  position: relative;
  z-index: 1;
}

.checkmark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  background: white;
  color: #ff5722;
  border-radius: 50%;
  font-size: 0.65rem;
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
  animation: checkmark-pop 0.3s ease-out;
}

@keyframes checkmark-pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.modal-body {
  padding: 1rem 2rem 2rem;
  overflow-y: auto;
  flex: 1;
  background: #fafafa;
}

/* Form Group */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #333;
  background: white;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #4a5ff5;
  box-shadow: 0 0 0 3px rgba(74, 95, 245, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  color: #333;
  background: white;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;
}

.form-textarea:focus {
  outline: none;
  border-color: #4a5ff5;
  box-shadow: 0 0 0 3px rgba(74, 95, 245, 0.1);
}

.form-textarea::placeholder {
  color: #9ca3af;
}

/* Upload Sections Container (3 columns) */
.upload-sections-container {
  display: grid;
  grid-template-columns: 0.93fr 0.96fr 1.11fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.upload-section {
  display: flex;
  flex-direction: column;
  height: 40px;
}

.upload-label {
  display: block;
  cursor: pointer;
  height: 100%;
}

.upload-input,
.time-input-hidden {
  display: none;
}

.upload-box {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 1.5rem 1rem;
  text-align: center;
  transition: all 0.3s;
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  height: 100%;
}

.upload-box.picture-box {
  border-color: #fbbf24;
  background: #fffbeb;
}

.upload-box:hover {
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.upload-box svg {
  width: 2.5rem;
  height: 2.5rem;
  color: #9ca3af;
  margin-bottom: 0.75rem;
  flex-shrink: 0;
}

.upload-box.picture-box svg {
  color: #fbbf24;
}

.uploaded-image {
  max-width: 100%;
  max-height: 80px;
  object-fit: contain;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.upload-text {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #6b7280;
  text-align: center;
  line-height: 1.4;
}

.upload-box.picture-box .upload-text {
  color: #d97706;
}

/* Time Selector Section */
.time-selector-section {
  display: flex;
  flex-direction: column;
}

.time-display-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem 1rem;
  cursor: pointer;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
  overflow: hidden;
}

.time-display-box::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.time-display-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.45);
}

.time-display-box:hover::before {
  opacity: 1;
}

.time-display-box:active {
  transform: translateY(-1px);
}

/* Custom Time Picker Dropdown */
.custom-time-picker {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 200px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.time-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.close-picker {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 0.95rem;
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  line-height: 1;
  padding: 0;
}

.close-picker:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.time-picker-body {
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0.3rem 0.6rem;
  gap: 0.4rem;
  height: 90px;
  background: linear-gradient(to bottom, #f8f9ff 0%, #ffffff 50%);
  flex-shrink: 0;
}

.time-column {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: 70px;
  min-width: 0;
  height: 100%;
}

.period-column {
  max-width: 60px;
}

.column-label {
  text-align: center;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.2rem;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.time-box-container {
  flex: 1;
  border: 2.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(229, 231, 235, 0.3);
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: 50px;
  align-items: center;
  justify-content: center;
}

.time-numbers-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.3rem;
  scrollbar-width: thin;
  scrollbar-color: #9ca3af #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  scroll-snap-type: y proximity;
  scroll-behavior: auto;
}

.time-numbers-list::-webkit-scrollbar {
  width: 5px;
}

.time-numbers-list::-webkit-scrollbar-track {
  background: #e5e7eb;
  border-radius: 4px;
  margin: 2px 0;
}

.time-numbers-list::-webkit-scrollbar-thumb {
  background: #9ca3af;
  border-radius: 4px;
}

.time-numbers-list::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}

.time-number-item {
  padding: 0.5rem 0.2rem;
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #3b5998;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  border-radius: 5px;
  margin-bottom: 0.1rem;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 50px;
  scroll-snap-align: center;
  flex-shrink: 0;
}

.time-number-item:last-child {
  margin-bottom: 0;
}

.time-number-item:hover {
  background: #f0f4ff;
  color: #3b5998;
}

.time-number-item.selected {
  background: transparent;
  color: #3b5998;
  font-weight: 700;
  box-shadow: none;
}

.time-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 900;
  color: #667eea;
  padding: 0 0.3rem;
  margin-top: 0.3rem;
  flex-shrink: 0;
  min-width: 12px;
}

.period-container {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.3rem;
  height: 50px;
}

.period-container .period-option {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  line-height: 1;
}

.period-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.15);
  background: #f3f4f6;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.period-option.selected {
  background: #b8bcc4;
  color: #3b5998;
  box-shadow: none;
  outline: none;
  border: none;
}

.time-picker-footer {
  padding: 0.4rem 0.6rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  flex-shrink: 0;
}

.btn-confirm-time {
  width: 100%;
  padding: 0.85rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-confirm-time:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-confirm-time:active {
  transform: translateY(0);
}

.time-display {
  text-align: center;
  color: white;
  width: 100%;
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.adjust-time-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  opacity: 0.95;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.time-value {
  display: block;
  font-size: 62px;
  font-weight: 700;
  line-height: 1;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);
  letter-spacing: 1px;
  margin: 0;
  user-select: none;
}

/* Smaller font for "Select Time" placeholder */
.time-value.is-placeholder {
  font-size: 32px;
  padding-bottom: 6px;
}

.time-period-toggle {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 0;
}

.period-option {
  padding: 0.4rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: #262626;
  backdrop-filter: blur(10px);
}

.period-option:active {
  transform: scale(1);
}

.period-option.active {
  background: white;
  color: #667eea;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border-color: white;
  transform: scale(1.05);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-schedule-selected,
.btn-schedule-all {
  flex: 1;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-schedule-selected {
  background: #f59e0b;
  color: white;
}

.btn-schedule-selected:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(245, 158, 11, 0.3);
}

.btn-schedule-all {
  background: #10b981;
  color: white;
}

.btn-schedule-all:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(16, 185, 129, 0.3);
}

.btn-schedule-selected:active,
.btn-schedule-all:active {
  transform: translateY(0);
}

/* New Design Styles */
.description-row {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.description-flex {
  display: flex;
  align-items: stretch; /* stretch children to same height */
  gap: 1rem;
}

.description-section {
  margin-top: -0.5rem;
  margin-bottom: 0.25rem;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
  padding: 0.25rem 1.5rem 0.75rem; /* tighter bottom to bring border closer */
  background: white;
  flex: 1 1 auto;
}

.section-label {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.125rem;
  margin-top: 0;
}

.description-textarea {
  width: 100%;
  padding: 0.5rem 1rem 0.75rem; /* reduced top padding and slightly tighter bottom */
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9375rem;
  line-height: 1.35; /* reduced line spacing */
  color: #64748b;
  background: white;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s;
  min-height: 150px;
  margin-bottom: 0; /* keep bottom tight to border */
}

.description-flex .description-textarea {
  flex: 1 1 auto;
  min-width: 0;
  margin-bottom: 0; /* keep row tight when button is beside */
}

.description-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.description-textarea::placeholder {
  color: #cbd5e1;
  line-height: 1.35; /* match textarea line-height */
}

.btn-generate-quotes {
  height: auto; /* let flex stretch control height */
  align-self: stretch; /* fill description-flex height */
  min-height: 150px; /* match textarea's min-height */
  padding: 0 1.25rem; /* vertical padding removed to avoid overflow */
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-generate-quotes:hover {
  background: #d97706;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.upload-time-container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-top: 0.5rem;
  margin-bottom: 0;
  clear: both;
}

.upload-section-new {
  border: 2px dashed #fbbf24;
  border-radius: 12px;
  padding: 1rem;
  background: #fffbeb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-section {
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 1rem;
  background: #ecfdf5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.preview-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #10b981;
  opacity: 0.6;
}

.preview-placeholder svg {
  width: 3rem;
  height: 3rem;
}

.preview-text {
  font-size: 1rem;
  font-weight: 500;
  color: #10b981;
}

.preview-image {
  max-width: 100%;
  max-height: 120px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  user-select: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.image-carousel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.image-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;
}

.nav-arrow:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.05);
}

.nav-arrow svg {
  width: 16px;
  height: 16px;
  color: #6b7280;
}

.nav-left {
  left: -40px;
}

.nav-right {
  right: -40px;
}

.delete-image-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 3;
}

.delete-image-btn:hover {
  background: #dc2626;
  transform: scale(1.1);
}

.delete-image-btn svg {
  width: 12px;
  height: 12px;
}

.image-indicators {
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
}

.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: #d1d5db;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  background: #10b981;
}

.indicator:hover {
  background: #9ca3af;
}

.indicator.active:hover {
  background: #059669;
}

.image-counter {
  position: absolute;
  top: -8px;
  left: -8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 500;
}



/* Bulk Selection Controls */
.bulk-controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 0.5rem;
  border: 2px solid #e9ecef;
  flex-wrap: wrap;
}

.bulk-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid #6c757d;
  border-radius: 0.25rem;
  background: white;
  color: #6c757d;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-btn:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.bulk-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-selected-btn {
  border-color: #dc3545;
  color: #dc3545;
}

.delete-selected-btn:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.exit-select-btn {
  border-color: #6c757d;
  color: #6c757d;
}

.exit-select-btn:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

/* Full-screen image preview modal */
.image-preview-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  cursor: pointer;
}

.preview-modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  cursor: default;
}

.full-preview-image {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 0.5rem;
}

.close-preview-btn {
  position: absolute;
  top: -2.5rem;
  right: 0;
  width: 2.5rem;
  height: 2.5rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-preview-btn:hover {
  background: white;
  transform: scale(1.1);
}

.preview-navigation {
  position: absolute;
  bottom: -3rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.7);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
}

.preview-nav-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preview-nav-btn:hover {
  background: white;
  transform: scale(1.1);
}

.preview-counter {
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  min-width: 3rem;
  text-align: center;
}



/* Updated Indicators for Drag & Drop */
.indicator-wrapper {
  position: relative;
  display: inline-block;
  cursor: grab;
}

.indicator-wrapper:active {
  cursor: grabbing;
}

.indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid #ccc;
  background: transparent;
  margin: 0 0.125rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.indicator.active {
  background: #007bff;
  border-color: #007bff;
}



/* Drag & Drop Visual Feedback */
.image-wrapper {
  position: relative;
  transition: transform 0.2s ease;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 0.5rem;
}

.preview-image:hover {
  opacity: 0.9;
}



.upload-section-new.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.upload-section-new.disabled .upload-label {
  cursor: not-allowed;
}

.upload-box-new {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
}

.upload-box-new svg {
  width: 3rem;
  height: 3rem;
  color: #f59e0b;
  opacity: 0.5;
}

.upload-text-new {
  font-size: 1rem;
  font-weight: 500;
  color: #f59e0b;
}

.upload-subtitle {
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: block;
  font-weight: normal;
}

.time-selector-section-new {
  border: 2px solid #6366f1;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.time-display-box-new {
  width: 100%;
  cursor: pointer;
}

.time-display-large {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.time-value-large {
  font-size: 4rem;
  font-weight: 700;
  color: white;
  line-height: 1;
  letter-spacing: -0.02em;
}

.time-period-toggle-new {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
}

.period-option-new {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 50px;
  text-transform: lowercase;
}

.period-option-new:hover {
  background: rgba(255, 255, 255, 0.3);
}

.period-option-new.active {
  background: white;
  color: #6366f1;
  border-color: white;
}

.bottom-actions-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-top: 0;
}

.social-media-section {
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 0.5rem 1rem 0.25rem;
  background: #fffbeb;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.social-header-new {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.social-header-new span {
  font-size: 1rem;
  font-weight: 600;
  color: #f59e0b;
}

.btn-select-all-social {
  padding: 0.5rem 1rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-select-all-social:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.social-title {
  font-size: 1rem;
  font-weight: 600;
  color: #f59e0b;
  margin: 0;
  text-align: center;
}

.social-icons {
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  gap: 0.125rem;
}

.social-icon {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  color: white;
  background: #9ca3af !important;
  filter: grayscale(100%);
  flex-shrink: 0;
}

.social-icon svg {
  width: 16px;
  height: 16px;
}

.social-icon.selected {
  filter: none;
}

.social-icon.facebook.selected { background: #1877f2 !important; }
.social-icon.whatsapp.selected { background: #25d366 !important; }
.social-icon.instagram.selected { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%) !important; }
.social-icon.twitter.selected { background: #1da1f2 !important; }
.social-icon.tiktok.selected { background: #000000 !important; }
.social-icon.youtube.selected { background: #ff0000 !important; }
.social-icon.linkedin.selected { background: #0077b5 !important; }
.social-icon.telegram.selected { background: #0088cc !important; }
.social-icon.snapchat.selected { background: #fffc00 !important; color: #000; }

.social-icon:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-select-all {
  padding: 0.75rem;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-select-all:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.action-buttons-new {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-schedule-selected-new,
.btn-schedule-all-new {
  width: 100%;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-schedule-selected-new {
  background: #f59e0b;
  color: white;
}

.btn-schedule-selected-new:hover {
  background: #d97706;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
}

.btn-schedule-all-new {
  background: #10b981;
  color: white;
}

.btn-schedule-all-new:hover {
  background: #059669;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

/* Scheduled Task Card */
.scheduled-task-card {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  text-align: center;
  color: white;
  animation: slideIn 0.5s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.success-icon {
  width: 3rem;
  height: 3rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.success-icon svg {
  width: 1.5rem;
  height: 1.5rem;
  stroke-width: 3;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

/* Modal Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-content,
.modal-fade-leave-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-fade-enter-from .modal-content {
  transform: scale(0.8) translateY(-20px);
}

.modal-fade-leave-to .modal-content {
  transform: scale(0.8) translateY(20px);
}

/* Responsive Modal Styles */
@media (max-width: 768px) {
  .modal-content {
    max-width: 95%;
    border-radius: 16px;
  }

  .modal-header {
    padding: 1.25rem 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .upload-sections-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .time-display-box {
    min-height: 150px;
  }

  .time-value {
    font-size: 2rem;
  }

  .events-list {
    justify-content: flex-start;
  }

  .event-item {
    font-size: 0.8125rem;
    padding: 0.4rem 0.875rem;
  }

  /* Responsive adjustments for image preview */
  
  .bulk-controls {
    gap: 0.25rem;
    padding: 0.5rem;
  }
  
  .bulk-btn {
    padding: 0.3rem 0.5rem;
    font-size: 0.7rem;
  }



  .preview-navigation {
    bottom: -2.5rem;
    padding: 0.4rem 0.8rem;
  }

  .preview-nav-btn {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 0.9rem;
  }

  .close-preview-btn {
    width: 2rem;
    height: 2rem;
    font-size: 1.2rem;
  }
}
</style>