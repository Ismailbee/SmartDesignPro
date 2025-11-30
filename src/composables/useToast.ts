/**
 * Simple Toast Notification Composable
 * For showing exit messages and other brief notifications
 */

import { ref } from 'vue'

interface ToastMessage {
  id: number
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  duration: number
}

const toasts = ref<ToastMessage[]>([])
let nextId = 1

export function useToast() {
  const showToast = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    duration: number = 3000
  ) => {
    const toast: ToastMessage = {
      id: nextId++,
      message,
      type,
      duration
    }

    toasts.value.push(toast)

    // Auto remove after duration
    setTimeout(() => {
      removeToast(toast.id)
    }, duration)

    return toast.id
  }

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const showExitToast = () => {
    return showToast('Press back again to exit', 'info', 2000)
  }

  return {
    toasts,
    showToast,
    removeToast,
    showExitToast
  }
}