/**
 * OAuth2 Authentication Utility Class
 * Handles Google and Facebook OAuth2 login flow
 */

import { oauth2API } from '../api/authApi';

export class OAuth2Auth {
  constructor() {
    this.supportedProviders = ['google', 'facebook'];
    this.baseURL = import.meta.env.VITE_API_URL || 'https://project-back-end-2swp.onrender.com/api/v1';
  }

  /**
   * Generate a random state parameter for CSRF protection
   * @returns {string} Random state string
   */
  generateState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Store state parameter in localStorage with expiration
   * @param {string} state - State parameter to store
   */
  storeState(state) {
    const stateData = {
      value: state,
      timestamp: Date.now(),
      expiresIn: 10 * 60 * 1000 // 10 minutes
    };
    localStorage.setItem('oauth2_state', JSON.stringify(stateData));
  }

  /**
   * Retrieve and validate stored state parameter
   * @returns {string|null} Valid state or null if expired/missing
   */
  getStoredState() {
    try {
      const stateData = JSON.parse(localStorage.getItem('oauth2_state'));
      if (!stateData) return null;

      const now = Date.now();
      if (now - stateData.timestamp > stateData.expiresIn) {
        localStorage.removeItem('oauth2_state');
        return null;
      }

      return stateData.value;
    } catch (error) {
      console.error('Error retrieving state:', error);
      localStorage.removeItem('oauth2_state');
      return null;
    }
  }

  /**
   * Clear stored state parameter
   */
  clearState() {
    localStorage.removeItem('oauth2_state');
  }

  /**
   * Validate state parameter to prevent CSRF attacks
   * @param {string} receivedState - State received from OAuth2 callback
   * @returns {boolean} True if state is valid
   */
  validateState(receivedState) {
    const storedState = this.getStoredState();
    const isValid = storedState && storedState === receivedState;
    
    if (isValid) {
      this.clearState();
    }
    
    return isValid;
  }

  /**
   * Initiate OAuth2 login flow
   * @param {string} provider - OAuth2 provider ('google' or 'facebook')
   * @returns {Promise<void>}
   */
  async login(provider) {
    try {
      if (!this.supportedProviders.includes(provider)) {
        throw new Error(`Unsupported OAuth2 provider: ${provider}`);
      }

      // Generate and store state parameter
      const state = this.generateState();
      this.storeState(state);

      // Get authorization URL from backend
      const response = await oauth2API.getAuthUrl(provider);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to get authorization URL');
      }

      const authUrl = response.data.authorizationUrl || response.data.url;
      if (!authUrl) {
        throw new Error('Authorization URL not found in response');
      }

      // Redirect to OAuth2 provider
      window.location.href = authUrl;
      
    } catch (error) {
      console.error(`OAuth2 ${provider} login error:`, error);
      this.clearState();
      throw error;
    }
  }

  /**
   * Process OAuth2 callback after user returns from provider
   * @param {string} provider - OAuth2 provider
   * @param {string} code - Authorization code from provider
   * @param {string} state - State parameter from provider
   * @returns {Promise<object>} Login response with token and user data
   */
  async processCallback(provider, code, state) {
    try {
      // Validate state parameter
      if (!this.validateState(state)) {
        throw new Error('Invalid state parameter. Possible CSRF attack.');
      }

      // Process callback with backend
      const response = await oauth2API.processCallback(provider, code, state);
      
      if (!response.success) {
        throw new Error(response.message || 'OAuth2 callback processing failed');
      }

      return response;
      
    } catch (error) {
      console.error(`OAuth2 ${provider} callback error:`, error);
      this.clearState();
      throw error;
    }
  }

  /**
   * Check if current page is an OAuth2 callback
   * @returns {object|null} Callback data or null if not a callback
   */
  checkForCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const pathname = window.location.pathname;
    
    // Check if this is a callback URL pattern
    const callbackPattern = /\/auth\/callback\/(.+)$/;
    const match = pathname.match(callbackPattern);
    
    if (match || urlParams.has('code')) {
      const provider = match ? match[1] : (urlParams.get('provider') || 'google');
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      if (error) {
        return {
          isCallback: true,
          provider,
          error: error,
          errorDescription: errorDescription || 'OAuth2 authentication failed'
        };
      }

      if (code && state) {
        return {
          isCallback: true,
          provider,
          code,
          state
        };
      }
    }

    return null;
  }

  /**
   * Handle direct OAuth2 success (when backend redirects with token in URL)
   * @returns {object|null} Token data or null if not a direct success
   */
  handleDirectSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userDataParam = urlParams.get('user');
    const error = urlParams.get('error');
    const provider = urlParams.get('provider');

    if (error) {
      return {
        isDirectCallback: true,
        error: error,
        provider: provider || 'unknown'
      };
    }

    if (token && userDataParam) {
      try {
        const userData = JSON.parse(decodeURIComponent(userDataParam));
        return {
          isDirectCallback: true,
          token: token,
          user: userData,
          provider: provider || 'unknown'
        };
      } catch (parseError) {
        return {
          isDirectCallback: true,
          error: 'parse_error',
          provider: provider || 'unknown'
        };
      }
    }

    return null;
  }

  /**
   * Show error message to user
   * @param {string} message - Error message to display
   * @param {string} type - Error type ('error', 'warning', 'info')
   */
  showError(message, type = 'error') {
    // This can be customized based on your notification system
    console.error('OAuth2 Error:', message);
    
    // Try to use global notification function if available
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(message, type);
    } else {
      // Fallback to console logging for development
      console.error(`OAuth2 ${type.toUpperCase()}:`, message);
    }
  }

  /**
   * Show success message to user
   * @param {string} message - Success message to display
   */
  showSuccess(message) {
    console.log('OAuth2 Success:', message);
    
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(message, 'success');
    } else {
      console.log('OAuth2 SUCCESS:', message);
    }
  }

  /**
   * Get OAuth2 status from backend
   * @returns {Promise<object>} OAuth2 status information
   */
  async getStatus() {
    try {
      const response = await oauth2API.getStatus();
      return response;
    } catch (error) {
      console.error('Error getting OAuth2 status:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth2 provider-specific errors
   * @param {string} error - Error code from provider
   * @param {string} provider - OAuth2 provider
   * @returns {string} User-friendly error message
   */
  getErrorMessage(error, provider) {
    const errorMessages = {
      'access_denied': `Bạn đã từ chối quyền truy cập với ${provider}`,
      'invalid_request': 'Yêu cầu không hợp lệ',
      'unauthorized_client': 'Ứng dụng không được ủy quyền',
      'unsupported_response_type': 'Loại phản hồi không được hỗ trợ',
      'invalid_scope': 'Phạm vi truy cập không hợp lệ',
      'server_error': `Lỗi máy chủ ${provider}`,
      'temporarily_unavailable': `Dịch vụ ${provider} tạm thời không khả dụng`,
    };

    return errorMessages[error] || `Lỗi đăng nhập với ${provider}: ${error}`;
  }
}

// Export singleton instance
export const oauth2Auth = new OAuth2Auth();

// Export for direct usage
export default OAuth2Auth;
