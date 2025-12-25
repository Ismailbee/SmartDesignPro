/**
 * ICAN SSO Authentication Service
 * Handles Single Sign-On integration with ICAN Portal
 */

export interface ICANUser {
  user_id: string
  email: string
  name: string
  role?: string
  branch?: string
  permissions?: string[]
}

export interface ICANSSOToken {
  token: string
  user: ICANUser
  expires_at: number
  signature: string
}

export interface ICANAuthResponse {
  success: boolean
  token?: string
  url?: string
  error?: string
}

/**
 * ICAN SSO Service
 */
export class ICANSSOService {
  private static readonly ICAN_BASE_URL = import.meta.env.DEV 
    ? 'http://localhost:4000' 
    : 'https://your-ican-app.com' // Replace with actual ICAN URL
  private static readonly SSO_SECRET = 'your-shared-secret-key' // Replace with actual secret
  private static readonly TOKEN_EXPIRY = 3600 // 1 hour in seconds

  /**
   * Generate SSO token for ICAN authentication
   */
  static async generateSSOToken(user: ICANUser): Promise<string> {
    try {
      // Create payload
      const payload = {
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        branch: user.branch || 'main',
        permissions: user.permissions || ['read'],
        timestamp: Date.now(),
        expires_at: Date.now() + (this.TOKEN_EXPIRY * 1000)
      }

      // In production, this should be done on the backend with proper HMAC
      // For now, using base64 encoding (NOT secure for production)
      const token = btoa(JSON.stringify(payload))
      
      console.log('🔐 Generated ICAN SSO token for user:', user.email)
      return token

    } catch (error) {
      console.error('❌ Failed to generate ICAN SSO token:', error)
      throw new Error('Failed to generate authentication token')
    }
  }

  /**
   * Generate ICAN authentication URL with SSO token
   */
  static async generateAuthURL(user: ICANUser): Promise<string> {
    try {
      const ssoToken = await this.generateSSOToken(user)
      
      const params = new URLSearchParams({
        token: ssoToken,
        user_id: user.user_id,
        email: user.email,
        name: user.name,
        origin: 'smartdesignpro',
        timestamp: Date.now().toString()
      })

      const authUrl = `${this.ICAN_BASE_URL}/sso/auth?${params.toString()}`
      
      console.log('🌐 Generated ICAN auth URL')
      return authUrl

    } catch (error) {
      console.error('❌ Failed to generate ICAN auth URL:', error)
      throw new Error('Failed to generate authentication URL')
    }
  }

  /**
   * Validate user has ICAN access
   */
  static validateICANAccess(user: any): boolean {
    if (!user) return false

    // Check user role
    const allowedRoles = ['admin', 'moderator', 'special']
    if (allowedRoles.includes(user.role)) {
      return true
    }

    // Check special ICAN access flag
    if (user.hasICANAccess === true) {
      return true
    }

    // Check if user is in allowed email domains (optional)
    const allowedDomains = ['your-company.com'] // Replace with actual domains
    if (user.email && allowedDomains.some(domain => user.email.endsWith(`@${domain}`))) {
      return true
    }

    return false
  }

  /**
   * Check ICAN service health
   */
  static async checkICANHealth(): Promise<{ status: 'online' | 'offline', latency?: number }> {
    try {
      const startTime = Date.now()
      
      const response = await fetch(`${this.ICAN_BASE_URL}/health`, {
        method: 'GET',
        timeout: 5000
      } as RequestInit)

      const latency = Date.now() - startTime

      if (response.ok) {
        return { status: 'online', latency }
      } else {
        return { status: 'offline' }
      }

    } catch (error) {
      console.warn('⚠️ ICAN health check failed:', error)
      return { status: 'offline' }
    }
  }

  /**
   * Handle ICAN iframe messages
   */
  static handleICANMessage(event: MessageEvent, allowedOrigin: string): any {
    // Security check: Only accept messages from ICAN domain
    if (!event.origin.includes(allowedOrigin)) {
      console.warn('⚠️ Rejected message from unauthorized origin:', event.origin)
      return null
    }

    try {
      const message = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
      
      console.log('📨 Received ICAN message:', message.type)
      
      return message

    } catch (error) {
      console.error('❌ Failed to parse ICAN message:', error)
      return null
    }
  }
}

// Development helper functions
export const ICANDevHelpers = {
  /**
   * Enable development bypass for ICAN access
   */
  enableDevBypass(): void {
    if (import.meta.env.DEV) {
      localStorage.setItem('ican_dev_bypass', 'true')
      console.log('🔓 ICAN development bypass enabled')
    }
  },

  /**
   * Disable development bypass
   */
  disableDevBypass(): void {
    localStorage.removeItem('ican_dev_bypass')
    console.log('🔒 ICAN development bypass disabled')
  },

  /**
   * Check if development bypass is enabled
   */
  isDevBypassEnabled(): boolean {
    const envBypass = import.meta.env.DEV && import.meta.env.VITE_ALLOW_MICROAPP_BYPASS === 'true'
    const localBypass = import.meta.env.DEV && localStorage.getItem('ican_dev_bypass') === 'true'
    const result = envBypass || localBypass
    
    console.log('🔧 ICAN Bypass Check:', {
      isDev: import.meta.env.DEV,
      envVar: import.meta.env.VITE_ALLOW_MICROAPP_BYPASS,
      envBypass,
      localBypass,
      result
    })
    
    return result
  },

  /**
   * Simulate ICAN access for testing
   */
  simulateICANAccess(user: any): ICANUser {
    return {
      user_id: user.id || 'demo-user-123',
      email: user.email || 'demo@example.com',
      name: user.name || 'Demo User',
      role: 'admin', // Grant admin access for testing
      branch: 'Main Branch',
      permissions: ['read', 'write', 'admin']
    }
  }
}

// Export for global access in development
if (import.meta.env.DEV) {
  (window as any).ICANDevHelpers = ICANDevHelpers
}

export default ICANSSOService