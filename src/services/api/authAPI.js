import { serverAPI } from '../apiClient';

/**
 * Authentication API service
 * Direct integration with echo-mcp-server auth endpoints
 */

const authAPI = {
  /**
   * Register a new user
   */
  register: async (userData) => {
    try {
      const response = await serverAPI.post('/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Login user
   */
  login: async (credentials) => {
    try {
      const response = await serverAPI.post('/auth/login', {
        username: credentials.username,
        password: credentials.password,
      });
      
      // Store token and user data
      if (response.data.access_token) {
        localStorage.setItem('auth_token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      await serverAPI.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await serverAPI.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      // Update stored tokens
      localStorage.setItem('auth_token', response.data.access_token);
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token);
      }

      return response.data;
    } catch (error) {
      // If refresh fails, clear all tokens
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await serverAPI.get('/auth/me');
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData) => {
    try {
      const response = await serverAPI.put('/auth/me', userData);
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(response.data));
      
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await serverAPI.post('/auth/request-password-reset', {
        email: email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await serverAPI.post('/auth/reset-password', {
        token: token,
        new_password: newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Verify email
   */
  verifyEmail: async (token) => {
    try {
      const response = await serverAPI.get(`/auth/verify-email?token=${token}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Resend email verification
   */
  resendVerification: async () => {
    try {
      const response = await serverAPI.post('/auth/resend-verification');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    return !!(token && userData);
  },

  /**
   * Get stored user data
   */
  getStoredUser: () => {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  },

  /**
   * Get stored auth token
   */
  getToken: () => {
    return localStorage.getItem('auth_token');
  },
};

export default authAPI;
