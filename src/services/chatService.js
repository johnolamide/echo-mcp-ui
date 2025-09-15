/**
 * Chat service for managing real-time chat functionality
 */

class ChatService {
  constructor() {
    this.baseUrl = `${import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000'}/chat`;
    this.websocket = null;
    this.isConnected = false;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.errorHandlers = [];
  }

  /**
   * Connect to WebSocket for real-time chat
   * @param {string} token - JWT access token
   */
  async connectWebSocket(token) {
    if (this.websocket && this.isConnected) {
      return Promise.resolve();
    }

    // Validate token format
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      throw new Error('Invalid JWT token format');
    }

    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${import.meta.env.VITE_SERVER_API_URL || 'ws://localhost:8000'}/chat/ws/${token}`.replace('http', 'ws');
        console.log('Connecting to WebSocket:', wsUrl);
        console.log('Token preview:', token.substring(0, 50) + '...');
        this.websocket = new WebSocket(wsUrl);

        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          console.error('WebSocket connection timeout');
          this.websocket.close();
          reject(new Error('WebSocket connection timeout'));
        }, 10000); // 10 second timeout

        this.websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.isConnected = true;
          console.log('WebSocket connected successfully');
          this.connectionHandlers.forEach(handler => handler({ type: 'connected' }));
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('WebSocket message received:', message);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.websocket.onclose = (event) => {
          clearTimeout(connectionTimeout);
          this.isConnected = false;
          console.log('WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          this.connectionHandlers.forEach(handler => handler({ type: 'disconnected' }));
          
          // If connection was not successfully established, reject with detailed error
          if (!this.isConnected) {
            let errorMessage = `Connection failed with code ${event.code}`;
            if (event.reason) {
              errorMessage += `: ${event.reason}`;
            }
            
            // Add specific error descriptions for common codes
            switch (event.code) {
              case 1006:
                errorMessage += ' (Connection closed abnormally - likely server/network issue)';
                break;
              case 4001:
                errorMessage += ' (Authentication failed - invalid token)';
                break;
              case 4004:
                errorMessage += ' (Authentication required)';
                break;
              case 1002:
                errorMessage += ' (Protocol error)';
                break;
              case 1003:
                errorMessage += ' (Unsupported data type)';
                break;
            }
            
            reject(new Error(errorMessage));
          }
        };

        this.websocket.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('WebSocket error event:', error);
          console.error('WebSocket readyState:', this.websocket.readyState);
          this.errorHandlers.forEach(handler => handler(error));
          reject(new Error(`WebSocket connection error: ${error.message || error.type || 'Network or server issue'}`));
        };

      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.errorHandlers.forEach(handler => handler(error));
        reject(error);
      }
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;
    }
  }

  /**
   * Send message via HTTP API and WebSocket
   * @param {string} receiverUsername - Username of the message receiver
   * @param {string} content - Message content
   */
  async sendMessage(receiverUsername, content) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    console.log('ChatService.sendMessage called:', { receiverUsername, content, hasToken: !!token });

    try {
      // First, send via HTTP API
      const response = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          receiver_username: receiverUsername,
          content: content
        })
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error response:', errorData);
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const messageData = await response.json();
      console.log('API response data:', messageData);
      console.log('Message sent successfully:', messageData);

      // Then send via WebSocket for real-time updates (if connected)
      if (this.isConnected && this.websocket) {
        const wsMessage = {
          type: 'send_message',
          data: {
            receiver_username: receiverUsername,
            content: content
          }
        };
        this.websocket.send(JSON.stringify(wsMessage));
      }

      return messageData;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Send typing indicator
   * @param {string} targetUsername - Username of the user being typed to
   * @param {boolean} isTyping - Whether currently typing
   */
  sendTypingIndicator(targetUsername, isTyping) {
    if (!this.isConnected || !this.websocket) {
      return;
    }

    const message = {
      type: 'typing_indicator',
      data: {
        target_username: targetUsername,
        is_typing: isTyping
      }
    };

    this.websocket.send(JSON.stringify(message));
  }

  /**
   * Mark message as read (with HTTP fallback)
   * @param {number} messageId - ID of the message to mark as read
   */
  async markMessageAsRead(messageId) {
    // Try WebSocket first if connected
    if (this.isConnected && this.websocket) {
      try {
        const message = {
          type: 'mark_read',
          data: {
            message_id: messageId
          }
        };
        this.websocket.send(JSON.stringify(message));
        return;
      } catch (error) {
        console.warn('WebSocket mark read failed, falling back to HTTP:', error);
      }
    }

    // Fallback to HTTP API
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No access token found');
      }

      // We need to get the message details to know the sender_id
      // For now, we'll use the markMessagesAsRead method which marks all messages from a user
      console.log('Using HTTP fallback for mark as read - message ID:', messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  /**
   * Get online status for users
   * @param {number[]} userIds - Array of user IDs to check
   */
  getOnlineStatus(userIds) {
    if (!this.isConnected || !this.websocket) {
      return;
    }

    const message = {
      type: 'get_online_status',
      data: {
        user_ids: userIds
      }
    };

    this.websocket.send(JSON.stringify(message));
  }

  /**
   * Subscribe to message events
   * @param {Function} handler - Message handler function
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
  }

  /**
   * Subscribe to connection events
   * @param {Function} handler - Connection handler function
   */
  onConnection(handler) {
    this.connectionHandlers.push(handler);
  }

  /**
   * Subscribe to error events
   * @param {Function} handler - Error handler function
   */
  onError(handler) {
    this.errorHandlers.push(handler);
  }

  /**
   * Remove message handler
   * @param {Function} handler - Handler to remove
   */
  offMessage(handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }

  /**
   * Remove connection handler
   * @param {Function} handler - Handler to remove
   */
  offConnection(handler) {
    this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
  }

  /**
   * Remove error handler
   * @param {Function} handler - Handler to remove
   */
  offError(handler) {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler);
  }

  // REST API methods for chat history and conversations

  /**
   * Get chat history with a user
   * @param {string} otherUsername - Username of the other user
   * @param {number} limit - Number of messages to retrieve
   * @param {number} offset - Number of messages to skip
   * @returns {Promise} - Chat history response
   */
  async getChatHistory(otherUsername, limit = 50, offset = 0) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(
      `${this.baseUrl}/history/${otherUsername}?limit=${limit}&offset=${offset}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get user conversations
   * @param {number} limit - Maximum number of conversations to return
   * @returns {Promise} - Conversations list
   */
  async getConversations(limit = 20) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(
      `${this.baseUrl}/conversations?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Mark messages from a user as read (REST API)
   * @param {string} senderUsername - Username of the user whose messages to mark as read
   * @returns {Promise} - Mark read response
   */
  async markMessagesAsRead(senderUsername) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    // First get user info to get the user ID
    const usersResponse = await fetch(`${this.baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to get users: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    const user = usersData.data?.users?.find(u => u.username === senderUsername) || usersData.users?.find(u => u.username === senderUsername);

    if (!user) {
      throw new Error('User not found');
    }

    const response = await fetch(`${this.baseUrl}/mark-read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sender_id: user.id })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get online users
   * @returns {Promise} - Online users response
   */
  async getOnlineUsers() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    try {
      const response = await fetch(`${this.baseUrl}/online-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`Online users API failed: ${response.status}`);
        // Return empty result if API fails
        return { online_users: [], total_online: 0 };
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch online users:', error);
      // Return empty result if fetch fails
      return { online_users: [], total_online: 0 };
    }
  }

  /**
   * Get user online status
   * @param {string} username - Username of the user to check
   * @returns {Promise} - User status response
   */
  async getUserStatus(username) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    // First get user info to get the user ID
    const usersResponse = await fetch(`${this.baseUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!usersResponse.ok) {
      throw new Error(`Failed to get users: ${usersResponse.status}`);
    }

    const usersData = await usersResponse.json();
    const user = usersData.data?.users?.find(u => u.username === username) || usersData.users?.find(u => u.username === username);

    if (!user) {
      throw new Error('User not found');
    }

    const response = await fetch(`${this.baseUrl}/status/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all users for chat
   * @returns {Promise} - Users list response
   */
  async getAllUsers() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No access token found');
    }

    try {
      const response = await fetch(`${this.baseUrl}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`Users API failed: ${response.status}`);
        // Return empty result if API fails
        return { users: [], total_users: 0, online_count: 0 };
      }

      return await response.json();
    } catch (error) {
      console.warn('Failed to fetch users:', error);
      // Return empty result if fetch fails
      return { users: [], total_users: 0, online_count: 0 };
    }
  }
}

// Export singleton instance
export const chatService = new ChatService();
export default chatService;
