// Firebase error handling utility for ICAN app
// Provides error handling wrapper for async operations

/**
 * Wraps an async function with error handling
 * @param {Function} asyncFn - The async function to wrap
 * @param {Object} options - Error handling options
 * @returns {Promise} Result of the async function or error
 */
export const withFirebaseErrorHandling = async (asyncFn, options = {}) => {
  const {
    defaultValue = null,
    errorMessage = 'An error occurred',
    showToast = false,
    logError = true
  } = options;

  try {
    const result = await asyncFn();
    return result;
  } catch (error) {
    if (logError) {
      console.error(errorMessage, error);
    }

    if (showToast) {
      // Simple error notification (can be enhanced with toast library)
      console.warn('Error:', error.message || errorMessage);
    }

    return defaultValue;
  }
};

/**
 * Handle Firebase/LocalStorage errors with user-friendly messages
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  if (!error) return 'An unknown error occurred';

  // Handle common error types
  if (error.code) {
    switch (error.code) {
      case 'permission-denied':
        return 'You do not have permission to perform this action';
      case 'not-found':
        return 'The requested data was not found';
      case 'already-exists':
        return 'This item already exists';
      case 'quota-exceeded':
        return 'Storage quota exceeded. Please clear some data.';
      default:
        return error.message || 'An error occurred';
    }
  }

  return error.message || 'An error occurred';
};

/**
 * Log activity with error handling
 * @param {string} action - The action being performed
 * @param {Object} data - Additional data to log
 */
export const logActivityWithErrorHandling = (action, data = {}) => {
  try {
    const logEntry = {
      action,
      timestamp: new Date().toISOString(),
      ...data
    };
    console.log('Activity:', logEntry);
    
    // Store in localStorage for activity tracking
    const activities = JSON.parse(localStorage.getItem('ican_activities') || '[]');
    activities.push(logEntry);
    
    // Keep only last 100 activities
    if (activities.length > 100) {
      activities.shift();
    }
    
    localStorage.setItem('ican_activities', JSON.stringify(activities));
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};

export default {
  withFirebaseErrorHandling,
  getErrorMessage,
  logActivityWithErrorHandling
};
