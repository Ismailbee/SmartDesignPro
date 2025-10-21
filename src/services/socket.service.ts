// src/services/socket.service.ts
import { io, Socket } from 'socket.io-client'

class SocketService {
  private socket: Socket | null = null
  private url: string = 'http://localhost:3003' // Auto Design Socket Server
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  /**
   * Connect to Socket.io server
   */
  connect(userId: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected')
      return
    }

    console.log('Connecting to Socket.io server...', this.url)

    this.socket = io(this.url, {
      auth: {
        userId
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts
    })

    this.setupEventListeners()
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting from Socket.io server...')
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.reconnectAttempts++
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached')
      }
    })

    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
    })
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.error('Socket not connected. Cannot emit event:', event)
      return
    }

    this.socket.emit(event, data)
  }

  /**
   * Listen to event from server
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      console.error('Socket not initialized. Cannot listen to event:', event)
      return
    }

    this.socket.on(event, callback)
  }

  /**
   * Remove event listener
   */
  off(event: string, callback?: (data: any) => void): void {
    if (!this.socket) return

    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false
  }

  /**
   * Get socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id
  }
}

// Export singleton instance
export const socketService = new SocketService()

