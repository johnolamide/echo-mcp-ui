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
        receiver_username: messageData.receiverUsername,
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
  getChatHistory: async (otherUsername, options = {}) => {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit);
      if (options.offset) params.append('offset', options.offset);

      const response = await serverAPI.get(
        `/chat/history/${otherUsername}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark messages as read
   */
  markMessagesAsRead: async (senderUsername) => {
    try {
      // First get user info to get the user ID
      const usersResponse = await serverAPI.get('/chat/users');
      const user = usersResponse.data.data?.users?.find(u => u.username === senderUsername) || usersResponse.data.users?.find(u => u.username === senderUsername);

      if (!user) {
        throw new Error('User not found');
      }

      const response = await serverAPI.post('/chat/mark-read', {
        sender_id: user.id,
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
  getUserStatus: async (username) => {
    try {
      // First get user info to get the user ID
      const usersResponse = await serverAPI.get('/chat/users');
      const user = usersResponse.data.data?.users?.find(u => u.username === username) || usersResponse.data.users?.find(u => u.username === username);

      if (!user) {
        throw new Error('User not found');
      }

      const response = await serverAPI.get(`/chat/status/${user.id}`);
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
      // Get all users and filter client-side since server doesn't have dedicated search endpoint
      const response = await serverAPI.get('/chat/users');
      const allUsers = response.data.data?.users || response.data.users || [];

      // Filter users based on search query
      const filteredUsers = allUsers.filter(user =>
        user.username.toLowerCase().includes(query.toLowerCase())
      );

      // Apply limit if specified
      const limit = options.limit || filteredUsers.length;
      const limitedUsers = filteredUsers.slice(0, limit);

      return {
        data: {
          users: limitedUsers,
          total_count: limitedUsers.length
        }
      };
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default chatAPI;
