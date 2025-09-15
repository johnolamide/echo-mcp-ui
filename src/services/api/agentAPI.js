import { agentAPI as agentAPIClient } from '../apiClient';

/**
 * AI Agent API service
 * Integration with echo-mcp-client for AI assistant functionality
 */

const agentAPI = {
  /**
   * Send prompt to AI agent
   */
  sendPrompt: async (prompt, options = {}) => {
    try {
      const response = await agentAPIClient.post('/prompt', {
        prompt: prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        top_p: options.topP || 0.9,
        ...options,
      });

      return {
        response: response.data.response,
        success: response.data.success,
        toolsUsed: response.data.tools_used || [],
        message: response.data.message,
      };
    } catch (error) {
      throw {
        message: error.response?.data?.detail || error.message,
        status: error.response?.status,
        error: error.response?.data,
      };
    }
  },

  /**
   * Get available tools from AI agent
   */
  getAvailableTools: async () => {
    try {
      const response = await agentAPIClient.get('/tools');
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.detail || error.message,
        status: error.response?.status,
      };
    }
  },

  /**
   * Check AI agent health
   */
  checkHealth: async () => {
    try {
      const response = await agentAPIClient.get('/health');
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.detail || error.message,
        status: error.response?.status,
      };
    }
  },

  /**
   * Send prompt with streaming response (for future implementation)
   */
  sendPromptStream: async (prompt, options = {}) => {
    try {
      // Note: This would need to be implemented on the backend
      const response = await agentAPIClient.post('/prompt/stream', {
        prompt: prompt,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 4096,
        top_p: options.topP || 0.9,
        ...options,
      });
      return response.data;
    } catch (error) {
      // Fallback to regular prompt if streaming not available
      return await this.sendPrompt(prompt, options);
    }
  },

  /**
   * Format prompt for specific use cases
   */
  formatPrompt: {
    /**
     * Format prompt for user operations
     */
    user: (operation, data) => {
      const prompts = {
        searchUsers: `Find users matching "${data.query}"`,
        getUserStats: `Get user statistics summary`,
        getUserDetails: `Get details for user ${data.userId}`,
        getUserActivity: `Get activity for user ${data.userId}`,
      };
      return prompts[operation] || `Perform ${operation} operation for user`;
    },

    /**
     * Format prompt for general assistance
     */
    general: (query) => {
      return `Help me with: ${query}`;
    },
  },
};

export default agentAPI;
