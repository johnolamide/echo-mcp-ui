// Authentication API for Echo MCP Server
import { serverAPI } from '../apiClient.js';

const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username for registration
   * @returns {Promise<Object>} Registration response
   */
  register: async (userData) => {
    try {
      const response = await serverAPI.post('/auth/register', {
        username: userData.username
      });
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.username - Username for login
   * @returns {Promise<Object>} Login response with tokens
   */
  login: async (credentials) => {
    try {
      const response = await serverAPI.post('/auth/login', {
        username: credentials.username
      });

      // Store tokens in localStorage
      if (response.data.data) {
        const { access_token, refresh_token, user } = response.data.data;
        localStorage.setItem('auth_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        localStorage.setItem('user_data', JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  logout: async () => {
    try {
      // Clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  /**
   * Get stored token
   * @returns {string|null} Stored auth token
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  /**
   * Get stored user data
   * @returns {Object|null} Stored user data
   */
  getStoredUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} New token response
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await serverAPI.post('/auth/refresh', {
        refresh_token: refreshToken
      });

      // Update stored tokens
      if (response.data.data) {
        const { access_token } = response.data.data;
        localStorage.setItem('auth_token', access_token);
      }

      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user profile - No-op for demo
   */
  updateProfile: async () => {
    return { success: true };
  },

  /**
   * Refresh token - No-op for demo
   */
  refreshToken: async () => {
    return { success: true };
  },

  /**
   * Get current user profile - Returns demo user
   */
  getCurrentUser: async () => {
    return {
      id: 1,
      username: "demo",
      is_active: true
    };
  },

  /**
   * Request password reset - No-op for demo
   */
  requestPasswordReset: async () => {
    return { success: true };
  },

  /**
   * Reset password - No-op for demo
   */
  resetPassword: async () => {
    return { success: true };
  },

  /**
   * Verify email - No-op for demo
   */
  verifyEmail: async () => {
    return { success: true };
  },

  /**
   * Resend email verification - No-op for demo
   */
  resendVerification: async () => {
    return { success: true };
  },
};

export default authAPI;
