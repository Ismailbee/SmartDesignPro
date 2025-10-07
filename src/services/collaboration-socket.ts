import { io, Socket } from 'socket.io-client'
import { CollaborationEvent } from '@/types/collaboration'
import type {
  CanvasUpdatePayload,
  CursorMovePayload,
  CommentPayload,
  UserPresencePayload,
  ChatMessagePayload,
  CollaboratorUser,
} from '@/types/collaboration'

/**
 * WebSocket Service for Real-Time Collaboration
 * 
 * This service manages the Socket.io connection and provides
 * methods for real-time collaboration features.
 */
class CollaborationSocketService {
  private socket: Socket | null = null
  private currentProjectId: string | null = null
  private currentUser: CollaboratorUser | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private cursorThrottle: number | null = null
  private readonly CURSOR_THROTTLE_MS = 16 // ~60fps

  /**
   * Initialize the WebSocket connection
   */
  connect(serverUrl: string = 'http://localhost:3000'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        })

        this.socket.on('connect', () => {
          console.log('✅ WebSocket connected:', this.socket?.id)
          this.reconnectAttempts = 0
          resolve()
        })

        this.socket.on('disconnect', (reason) => {
          console.warn('⚠️ WebSocket disconnected:', reason)
        })

        this.socket.on('connect_error', (error) => {
          console.error('❌ WebSocket connection error:', error)
          this.reconnectAttempts++
          
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Failed to connect after maximum attempts'))
          }
        })

        this.socket.on('error', (error) => {
          console.error('❌ WebSocket error:', error)
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      if (this.currentProjectId) {
        this.leaveProject(this.currentProjectId)
      }
      this.socket.disconnect()
      this.socket = null
      this.currentProjectId = null
      this.currentUser = null
    }
  }

  /**
   * Join a project room
   */
  joinProject(projectId: string, user: CollaboratorUser): void {
    if (!this.socket) {
      console.error('Socket not connected')
      return
    }

    this.currentProjectId = projectId
    this.currentUser = user

    const payload: UserPresencePayload = {
      projectId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      color: user.color,
      role: user.role,
      action: 'join',
    }

    this.socket.emit(CollaborationEvent.JOIN_PROJECT, payload)
    console.log(`📍 Joined project: ${projectId}`)
  }

  /**
   * Leave a project room
   */
  leaveProject(projectId: string): void {
    if (!this.socket || !this.currentUser) return

    const payload: UserPresencePayload = {
      projectId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      color: this.currentUser.color,
      role: this.currentUser.role,
      action: 'leave',
    }

    this.socket.emit(CollaborationEvent.LEAVE_PROJECT, payload)
    this.currentProjectId = null
    console.log(`📍 Left project: ${projectId}`)
  }

  /**
   * Broadcast canvas update
   */
  broadcastCanvasUpdate(payload: CanvasUpdatePayload): void {
    if (!this.socket || !this.currentProjectId) return
    this.socket.emit(CollaborationEvent.CANVAS_UPDATE, payload)
  }

  /**
   * Broadcast cursor position (throttled)
   */
  broadcastCursorMove(x: number, y: number): void {
    if (!this.socket || !this.currentProjectId || !this.currentUser) return

    // Throttle cursor updates to ~60fps
    if (this.cursorThrottle) return

    const payload: CursorMovePayload = {
      projectId: this.currentProjectId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      color: this.currentUser.color,
      x,
      y,
      timestamp: Date.now(),
    }

    this.socket.emit(CollaborationEvent.CURSOR_MOVE, payload)

    this.cursorThrottle = window.setTimeout(() => {
      this.cursorThrottle = null
    }, this.CURSOR_THROTTLE_MS)
  }

  /**
   * Hide cursor (when leaving canvas)
   */
  hideCursor(): void {
    if (!this.socket || !this.currentProjectId || !this.currentUser) return
    
    this.socket.emit(CollaborationEvent.CURSOR_HIDE, {
      projectId: this.currentProjectId,
      userId: this.currentUser.id,
    })
  }

  /**
   * Add a comment
   */
  addComment(payload: CommentPayload): void {
    if (!this.socket) return
    this.socket.emit(CollaborationEvent.COMMENT_ADD, payload)
  }

  /**
   * Update a comment
   */
  updateComment(payload: CommentPayload): void {
    if (!this.socket) return
    this.socket.emit(CollaborationEvent.COMMENT_UPDATE, payload)
  }

  /**
   * Delete a comment
   */
  deleteComment(payload: CommentPayload): void {
    if (!this.socket) return
    this.socket.emit(CollaborationEvent.COMMENT_DELETE, payload)
  }

  /**
   * Resolve a comment
   */
  resolveComment(payload: CommentPayload): void {
    if (!this.socket) return
    this.socket.emit(CollaborationEvent.COMMENT_RESOLVE, payload)
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    if (!this.socket || !this.currentProjectId || !this.currentUser) return

    const payload: ChatMessagePayload = {
      projectId: this.currentProjectId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userAvatar: this.currentUser.avatar,
      message,
      timestamp: new Date(),
    }

    this.socket.emit(CollaborationEvent.CHAT_MESSAGE, payload)
  }

  /**
   * Request full canvas sync (on reconnect)
   */
  requestCanvasSync(): void {
    if (!this.socket || !this.currentProjectId) return
    
    this.socket.emit(CollaborationEvent.CANVAS_SYNC_REQUEST, {
      projectId: this.currentProjectId,
    })
  }

  /**
   * Event listeners
   */
  on(event: CollaborationEvent, callback: (data: any) => void): void {
    if (!this.socket) return
    this.socket.on(event, callback)
  }

  off(event: CollaborationEvent, callback?: (data: any) => void): void {
    if (!this.socket) return
    if (callback) {
      this.socket.off(event, callback)
    } else {
      this.socket.off(event)
    }
  }

  /**
   * Get connection status
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * Get current project ID
   */
  getCurrentProjectId(): string | null {
    return this.currentProjectId
  }

  /**
   * Get current user
   */
  getCurrentUser(): CollaboratorUser | null {
    return this.currentUser
  }
}

// Export singleton instance
export const collaborationSocket = new CollaborationSocketService()

