import { serverAPI } from '../apiClient';

/**
 * Chat API service
 * Direct integration with echo-mcp-server chat endpoints
 */

const chatAPI = {
  /**
   * Send a chat message
   */
  sendMessage: async (messageData) => {
    try {
      const response = await serverAPI.post('/chat/send', {
        recipient_id: messageData.recipientId,
        content: messageData.content,
        message_type: messageData.type || 'text',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get chat history with another user
   */
  getChatHistory: async (otherUserId, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      const response = await serverAPI.get(
        `/chat/history/${otherUserId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark messages as read
   */
  markMessagesAsRead: async (messageIds) => {
    try {
      const response = await serverAPI.post('/chat/mark-read', {
        message_ids: messageIds,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user conversations
   */
  getConversations: async (limit = 50) => {
    try {
      const response = await serverAPI.get(`/chat/conversations?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get user online status
   */
  getUserStatus: async (userId) => {
    try {
      const response = await serverAPI.get(`/chat/status/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get all online users
   */
  getOnlineUsers: async () => {
    try {
      const response = await serverAPI.get('/chat/online-users');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Search users for chat
   */
  searchUsers: async (query, options = {}) => {
    try {
      const params = new URLSearchParams();
      params.append('search', query);
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      const response = await serverAPI.get(
        `/admin/users?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default chatAPI;
