import { defineStore } from 'pinia'

export interface NotificationItem {
	id: string
	title: string
	message?: string
	type?: 'info' | 'success' | 'warning' | 'error'
	read: boolean
	createdAt: string // ISO string
	link?: string // optional deep link path
}

interface NotificationState {
	items: NotificationItem[]
}

export const useNotificationStore = defineStore('notification', {
	state: (): NotificationState => ({
		items: []
	}),
	getters: {
		unreadCount: (state) => state.items.filter(n => !n.read).length,
		sorted: (state) => [...state.items].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
	},
	actions: {
		add(notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read'> & { id?: string, createdAt?: string, read?: boolean }) {
			const item: NotificationItem = {
				id: notification.id || cryptoRandomId(),
				title: notification.title,
				message: notification.message,
				type: notification.type || 'info',
				read: notification.read ?? false,
				createdAt: notification.createdAt || new Date().toISOString(),
				link: notification.link
			}
			this.items.unshift(item)
		},
		markAllRead() {
			this.items = this.items.map(n => ({ ...n, read: true }))
		},
		markRead(id: string) {
			const idx = this.items.findIndex(n => n.id === id)
			if (idx !== -1) this.items[idx].read = true
		},
		clear() {
			this.items = []
		},
		// Optional: seed some demo notifications (can be called on app start in dev)
		seedDemo() {
			if (this.items.length) return
			this.add({ title: 'Welcome to SmartDesignPro', message: 'Thanks for joining! Explore new templates today.', type: 'success' })
			this.add({ title: 'Design Approved', message: 'Your design “Brand Poster” was approved by the team.', type: 'info' })
			this.add({ title: 'New Comment', message: 'Alex commented on “Summer Flyer”.', type: 'info' })
		}
	}
})

function cryptoRandomId(): string {
	try {
		// Browser crypto
		const arr = new Uint8Array(16)
		crypto.getRandomValues(arr)
		return Array.from(arr).map(x => x.toString(16).padStart(2, '0')).join('')
	} catch {
		// Fallback
		return Math.random().toString(36).slice(2) + Date.now().toString(36)
	}
}

