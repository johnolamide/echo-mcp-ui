import apiClient from './apiClient';

export const chatService = {
  /**
   * Send a message to the chat API
   * @param {string} message - User's input message
   * @param {string} [conversationId] - Optional conversation ID for continuing a conversation
   * @returns {Promise<Object>} - Response containing AI's reply and conversation metadata
   */
  sendMessage: async (message, conversationId = null) => {
    try {
      // Call the /prompt endpoint according to the echo-mcp-client API
      // Based on the router.py PromptRequest model
      const response = await apiClient.post('/prompt', {
        prompt: message,
        temperature: 0.7,
        max_tokens: 4096,
        top_p: 0.9
      });
      
      // Log the response data for debugging
      console.log('Echo MCP Client API Response:', response.data);
      
      // The response should follow the PromptResponse model
      // with fields: response, success, message, tools_used
      return response.data;
    } catch (error) {
      console.error('Error sending message to echo-mcp-client API:', error);
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
