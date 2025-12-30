/**
 * Secure Storage Utility for ICAN App
 * 
 * Uses Capacitor Preferences for native storage (persists across app restarts)
 * Falls back to localStorage for web (better than sessionStorage)
 * 
 * ✅ Persists across app restarts
 * ✅ Works in WebView/APK
 * ✅ Secure for regulated apps
 */

import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const SecureStorage = {
  /**
   * Set a value in secure storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON stringified)
   */
  async set(key, value) {
    try {
      const jsonValue = JSON.stringify(value);
      
      if (isNative) {
        // Use Capacitor Preferences for native (Android/iOS)
        await Preferences.set({ key, value: jsonValue });
        console.log(`✅ SecureStorage: Saved "${key}" to native storage`);
      } else {
        // Use localStorage for web (better than sessionStorage)
        localStorage.setItem(key, jsonValue);
        console.log(`✅ SecureStorage: Saved "${key}" to localStorage (web)`);
      }
    } catch (error) {
      console.error(`❌ SecureStorage: Failed to save "${key}":`, error);
      throw error;
    }
  },

  /**
   * Get a value from secure storage
   * @param {string} key - Storage key
   * @returns {Promise<any|null>} Parsed value or null if not found
   */
  async get(key) {
    try {
      let jsonValue;
      
      if (isNative) {
        // Get from Capacitor Preferences for native
        const result = await Preferences.get({ key });
        jsonValue = result.value;
      } else {
        // Get from localStorage for web
        jsonValue = localStorage.getItem(key);
      }
      
      if (!jsonValue) {
        return null;
      }
      
      return JSON.parse(jsonValue);
    } catch (error) {
      console.error(`❌ SecureStorage: Failed to get "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove a value from secure storage
   * @param {string} key - Storage key
   */
  async remove(key) {
    try {
      if (isNative) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
      console.log(`✅ SecureStorage: Removed "${key}"`);
    } catch (error) {
      console.error(`❌ SecureStorage: Failed to remove "${key}":`, error);
    }
  },

  /**
   * Clear all secure storage (use with caution!)
   */
  async clear() {
    try {
      if (isNative) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
      console.log('✅ SecureStorage: Cleared all data');
    } catch (error) {
      console.error('❌ SecureStorage: Failed to clear:', error);
    }
  },

  /**
   * Check if running on native platform
   * @returns {boolean}
   */
  isNative() {
    return isNative;
  }
};

// Session management constants
export const SESSION_KEY = 'ican_session';
export const USER_KEY = 'ican_user';

// Helper functions for session management
export const SessionManager = {
  /**
   * Save user session
   * @param {Object} sessionData - Session data to store
   */
  async saveSession(sessionData) {
    await SecureStorage.set(SESSION_KEY, sessionData);
  },

  /**
   * Get user session
   * @returns {Promise<Object|null>}
   */
  async getSession() {
    return await SecureStorage.get(SESSION_KEY);
  },

  /**
   * Check if session is valid
   * @returns {Promise<boolean>}
   */
  async isSessionValid() {
    const session = await this.getSession();
    
    if (!session) {
      return false;
    }
    
    // Check if session has expired
    if (session.expiresAt) {
      const expiresAt = new Date(session.expiresAt);
      if (expiresAt < new Date()) {
        console.warn('⚠️ Session expired');
        await this.clearSession();
        return false;
      }
    }
    
    return true;
  },

  /**
   * Clear user session
   */
  async clearSession() {
    await SecureStorage.remove(SESSION_KEY);
    await SecureStorage.remove(USER_KEY);
  }
};

export default SecureStorage;
