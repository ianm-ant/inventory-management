<template>
  <div class="app">
    <aside class="sidebar" :class="{ collapsed }">
      <button class="sidebar-toggle" @click="toggleSidebar" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="13 16 7 10 13 4"/>
        </svg>
      </button>
      <div class="sidebar-logo">
        <span class="logo-monogram">FI</span>
        <h1>{{ t('nav.companyName') }}</h1>
        <span class="subtitle">{{ t('nav.subtitle') }}</span>
      </div>
      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item" :title="t('nav.overview')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="7" height="7" rx="1"/>
            <rect x="11" y="2" width="7" height="7" rx="1"/>
            <rect x="2" y="11" width="7" height="7" rx="1"/>
            <rect x="11" y="11" width="7" height="7" rx="1"/>
          </svg>
          <span class="nav-label">{{ t('nav.overview') }}</span>
        </router-link>
        <router-link to="/inventory" class="nav-item" :title="t('nav.inventory')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 2L2 6v8l8 4 8-4V6z"/>
            <polyline points="2 6 10 10 18 6"/>
            <line x1="10" y1="10" x2="10" y2="18"/>
          </svg>
          <span class="nav-label">{{ t('nav.inventory') }}</span>
        </router-link>
        <router-link to="/orders" class="nav-item" :title="t('nav.orders')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="3" width="12" height="14" rx="1"/>
            <path d="M7 3a3 3 0 0 1 6 0"/>
            <line x1="7" y1="10" x2="13" y2="10"/>
            <line x1="7" y1="14" x2="11" y2="14"/>
          </svg>
          <span class="nav-label">{{ t('nav.orders') }}</span>
        </router-link>
        <router-link to="/spending" class="nav-item" :title="t('nav.finance')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="6" width="16" height="10" rx="1"/>
            <circle cx="10" cy="11" r="2.5"/>
            <line x1="2" y1="9.5" x2="5" y2="9.5"/>
            <line x1="2" y1="12.5" x2="5" y2="12.5"/>
            <line x1="15" y1="9.5" x2="18" y2="9.5"/>
            <line x1="15" y1="12.5" x2="18" y2="12.5"/>
          </svg>
          <span class="nav-label">{{ t('nav.finance') }}</span>
        </router-link>
        <router-link to="/demand" class="nav-item" :title="t('nav.demandForecast')">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="2 16 7 9 12 13 18 4"/>
            <polyline points="14 4 18 4 18 8"/>
          </svg>
          <span class="nav-label">{{ t('nav.demandForecast') }}</span>
        </router-link>
        <router-link to="/reports" class="nav-item" title="Reports">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="12" width="4" height="6" rx="1"/>
            <rect x="8" y="7" width="4" height="11" rx="1"/>
            <rect x="14" y="3" width="4" height="15" rx="1"/>
          </svg>
          <span class="nav-label">Reports</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <template v-if="!collapsed">
          <LanguageSwitcher />
          <ProfileMenu
            @show-profile-details="showProfileDetails = true"
            @show-tasks="showTasks = true"
          />
        </template>
        <template v-else>
          <LanguageSwitcher compact />
          <button class="footer-avatar" @click="showProfileDetails = true" title="Profile">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="10" cy="7" r="4"/>
              <path d="M2 18c0-4.4 3.6-8 8-8s8 3.6 8 8"/>
            </svg>
          </button>
        </template>
      </div>
    </aside>
    <div class="content">
      <FilterBar />
      <main class="main-content">
        <router-view />
      </main>
    </div>

    <ProfileDetailsModal
      :is-open="showProfileDetails"
      @close="showProfileDetails = false"
    />
    <TasksModal
      :is-open="showTasks"
      :tasks="tasks"
      @close="showTasks = false"
      @add-task="addTask"
      @delete-task="deleteTask"
      @toggle-task="toggleTask"
    />
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { api } from './api'
import { useAuth } from './composables/useAuth'
import { useI18n } from './composables/useI18n'
import FilterBar from './components/FilterBar.vue'
import ProfileMenu from './components/ProfileMenu.vue'
import ProfileDetailsModal from './components/ProfileDetailsModal.vue'
import TasksModal from './components/TasksModal.vue'
import LanguageSwitcher from './components/LanguageSwitcher.vue'

export default {
  name: 'App',
  components: {
    FilterBar,
    ProfileMenu,
    ProfileDetailsModal,
    TasksModal,
    LanguageSwitcher
  },
  setup() {
    const { currentUser } = useAuth()
    const { t } = useI18n()
    const showProfileDetails = ref(false)
    const showTasks = ref(false)
    const apiTasks = ref([])

    const STORAGE_KEY = 'sidebar-collapsed'
    // A user's explicit collapse choice should win over the responsive default,
    // so we only auto-adjust on resize until the user toggles manually.
    let userToggled = false
    const stored = localStorage.getItem(STORAGE_KEY)
    const collapsed = ref(stored !== null ? stored === 'true' : window.innerWidth < 900)
    if (stored !== null) userToggled = true

    const toggleSidebar = () => {
      collapsed.value = !collapsed.value
      userToggled = true
      localStorage.setItem(STORAGE_KEY, String(collapsed.value))
    }

    let resizeTimer = null
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (!userToggled) collapsed.value = window.innerWidth < 900
      }, 150)
    }

    // Merge mock tasks from currentUser with API tasks
    const tasks = computed(() => {
      return [...currentUser.value.tasks, ...apiTasks.value]
    })

    const loadTasks = async () => {
      try {
        apiTasks.value = await api.getTasks()
      } catch (err) {
        console.error('Failed to load tasks:', err)
      }
    }

    const addTask = async (taskData) => {
      try {
        const newTask = await api.createTask(taskData)
        // Add new task to the beginning of the array
        apiTasks.value.unshift(newTask)
      } catch (err) {
        console.error('Failed to add task:', err)
      }
    }

    const deleteTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const isMockTask = currentUser.value.tasks.some(t => t.id === taskId)

        if (isMockTask) {
          // Remove from mock tasks
          const index = currentUser.value.tasks.findIndex(t => t.id === taskId)
          if (index !== -1) {
            currentUser.value.tasks.splice(index, 1)
          }
        } else {
          // Remove from API tasks
          await api.deleteTask(taskId)
          apiTasks.value = apiTasks.value.filter(t => t.id !== taskId)
        }
      } catch (err) {
        console.error('Failed to delete task:', err)
      }
    }

    const toggleTask = async (taskId) => {
      try {
        // Check if it's a mock task (from currentUser)
        const mockTask = currentUser.value.tasks.find(t => t.id === taskId)

        if (mockTask) {
          // Toggle mock task status
          mockTask.status = mockTask.status === 'pending' ? 'completed' : 'pending'
        } else {
          // Toggle API task
          const updatedTask = await api.toggleTask(taskId)
          const index = apiTasks.value.findIndex(t => t.id === taskId)
          if (index !== -1) {
            apiTasks.value[index] = updatedTask
          }
        }
      } catch (err) {
        console.error('Failed to toggle task:', err)
      }
    }

    onMounted(() => {
      loadTasks()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (resizeTimer) clearTimeout(resizeTimer)
    })

    return {
      t,
      showProfileDetails,
      showTasks,
      tasks,
      addTask,
      deleteTask,
      toggleTask,
      collapsed,
      toggleSidebar
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --sidebar-w: 240px;
  --sidebar-w-collapsed: 64px;
  --c-bg: #f8fafc;
  --c-surface: #ffffff;
  --c-border: #e2e8f0;
  --c-text: #0f172a;
  --c-text-muted: #64748b;
  --c-accent: #2563eb;
  --c-accent-soft: #eff6ff;
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-5: 24px;
  --sp-6: 32px;
  --radius: 8px;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  font-family: var(--font-sans);
  background: var(--c-bg);
  color: var(--c-text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border-right: 1px solid var(--c-border);
  position: sticky;
  top: 0;
  height: 100vh;
  padding: var(--sp-5) var(--sp-4);
  gap: var(--sp-5);
  transition: width 0.2s ease;
}

.sidebar.collapsed {
  width: var(--sidebar-w-collapsed);
  padding-left: var(--sp-2);
  padding-right: var(--sp-2);
}

.sidebar-toggle {
  align-self: flex-end;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-muted);
  padding: var(--sp-1);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: var(--c-bg);
  color: var(--c-text);
}

.sidebar-toggle svg {
  transition: transform 0.2s ease;
}

.sidebar.collapsed .sidebar-toggle {
  align-self: center;
}

.sidebar.collapsed .sidebar-toggle svg {
  transform: rotate(180deg);
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  padding: 0 var(--sp-2);
  overflow: hidden;
}

.logo-monogram {
  display: none;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--c-accent);
  letter-spacing: 0.05em;
}

.sidebar.collapsed .logo-monogram {
  display: block;
  text-align: center;
}

.sidebar-logo h1 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--c-text);
  letter-spacing: -0.025em;
}

.subtitle {
  font-size: 0.75rem;
  color: var(--c-text-muted);
  font-weight: 400;
}

.sidebar.collapsed .sidebar-logo h1,
.sidebar.collapsed .sidebar-logo .subtitle {
  display: none;
}

.sidebar.collapsed .sidebar-logo {
  align-items: center;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: var(--sp-1);
  overflow: hidden;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  padding: var(--sp-2) var(--sp-3);
  border-radius: var(--radius);
  color: var(--c-text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: all 0.15s ease;
}

.nav-item svg {
  flex-shrink: 0;
}

.nav-label {
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: var(--c-bg);
  color: var(--c-text);
}

.nav-item.router-link-active {
  background: var(--c-accent-soft);
  color: var(--c-accent);
  border-left-color: var(--c-accent);
}

.sidebar.collapsed .nav-label {
  display: none;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: var(--sp-2);
  border-left: none;
}

.sidebar.collapsed .nav-item.router-link-active {
  border-left: none;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: var(--sp-3);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--c-border);
}

.sidebar.collapsed .sidebar-footer {
  align-items: center;
}

.footer-avatar {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--c-text-muted);
  padding: var(--sp-2);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-avatar:hover {
  background: var(--c-bg);
  color: var(--c-text);
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--sp-6);
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.375rem;
  letter-spacing: -0.025em;
}

.page-header p {
  color: #64748b;
  font-size: 0.938rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.25rem;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.stat-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.stat-label {
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.625rem;
}

.stat-value {
  font-size: 2.25rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.stat-card.warning .stat-value {
  color: #ea580c;
}

.stat-card.success .stat-value {
  color: #059669;
}

.stat-card.danger .stat-value {
  color: #dc2626;
}

.stat-card.info .stat-value {
  color: #2563eb;
}

.card {
  background: white;
  border-radius: 10px;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  margin-bottom: 1.25rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid #e2e8f0;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.025em;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

th {
  text-align: left;
  padding: 0.5rem 0.75rem;
  font-weight: 600;
  color: #475569;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

td {
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #f1f5f9;
  color: #334155;
  font-size: 0.875rem;
}

tbody tr {
  transition: background-color 0.15s ease;
}

tbody tr:hover {
  background: #f8fafc;
}

.badge {
  display: inline-block;
  padding: 0.313rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.badge.success {
  background: #d1fae5;
  color: #065f46;
}

.badge.warning {
  background: #fed7aa;
  color: #92400e;
}

.badge.danger {
  background: #fecaca;
  color: #991b1b;
}

.badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.badge.increasing {
  background: #d1fae5;
  color: #065f46;
}

.badge.decreasing {
  background: #fecaca;
  color: #991b1b;
}

.badge.stable {
  background: #e0e7ff;
  color: #3730a3;
}

.badge.high {
  background: #fecaca;
  color: #991b1b;
}

.badge.medium {
  background: #fed7aa;
  color: #92400e;
}

.badge.low {
  background: #dbeafe;
  color: #1e40af;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #64748b;
  font-size: 0.938rem;
}

.error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  margin: 1rem 0;
  font-size: 0.938rem;
}
</style>
