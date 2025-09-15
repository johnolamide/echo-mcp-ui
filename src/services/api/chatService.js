import { agentWebSocketService } from '../agentWebSocketService';

export const chatService = {
  /**
   * Send a message to the chat API via WebSocket
   * @param {string} message - User's input message
   * @param {string} [conversationId] - Optional conversation ID for continuing a conversation
   * @returns {Promise<Object>} - Response containing AI's reply and conversation metadata
   */
  sendMessage: async (message, conversationId = null) => {
    try {
      // Ensure WebSocket connection is established
      if (!agentWebSocketService.isConnected) {
        // Try to connect if not connected (assuming user ID is available)
        const userId = localStorage.getItem('user_id') || '1'; // Default to user 1 for demo
        await agentWebSocketService.connectAgentWebSocket(userId);

        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Send message via WebSocket
      agentWebSocketService.sendCommand(message, 'command');

      // Log the message for debugging
      console.log('Echo MCP Client WebSocket Message:', message);

      // Return a promise that resolves when we get a response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Agent response timeout'));
        }, 30000); // 30 second timeout

        // Listen for response
        const messageHandler = (response) => {
          if (response.type === 'response' || response.type === 'error') {
            clearTimeout(timeout);
            agentWebSocketService.messageHandlers =
              agentWebSocketService.messageHandlers.filter(h => h !== messageHandler);

            if (response.type === 'error') {
              reject(new Error(response.message));
            } else {
              // Format response to match expected structure
              resolve({
                response: response.message,
                success: true,
                message: response.message,
                conversation_id: conversationId,
                timestamp: response.timestamp || Date.now()
              });
            }
          }
        };

        agentWebSocketService.onMessage(messageHandler);
      });
    } catch (error) {
      console.error('Error sending message to echo-mcp-client WebSocket:', error);
      throw error;
    }
  },

  /**
   * Fetch conversation history
   * @param {string} conversationId - ID of the conversation to retrieve
   * @returns {Promise<Array>} - Array of messages in the conversation
   */
  getConversation: async (conversationId) => {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      throw error;
    }
  },

  /**
   * List all user conversations
   * @returns {Promise<Array>} - Array of conversation objects with metadata
   */
  listConversations: async () => {
    try {
      const response = await apiClient.get('/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  /**
   * Create a new conversation
   * @param {string} title - Optional title for the conversation
   * @returns {Promise<Object>} - New conversation object
   */
  createConversation: async (title = 'New Conversation') => {
    try {
      const response = await apiClient.post('/conversations', { title });
      return response.data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
};

export default chatService;
