import { agentWebSocketService } from '../agentWebSocketService';

/**
 * AI Agent API service
 * Integration with echo-mcp-client for AI assistant functionality
 * Updated to use WebSocket communication instead of HTTP
 */

const agentAPI = {
  /**
   * Send prompt to AI agent via WebSocket
   */
  sendPrompt: async (prompt, options = {}) => {
    try {
      // Ensure WebSocket connection is established
      if (!agentWebSocketService.isConnected) {
        // Try to connect if not connected (assuming user ID is available)
        const userId = localStorage.getItem('user_id') || '1'; // Default to user 1 for demo
        await agentWebSocketService.connectAgentWebSocket(userId);

        // Wait a bit for connection to establish
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Send command via WebSocket
      agentWebSocketService.sendCommand(prompt, 'command');

      // Return a promise that resolves when we get a response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Agent response timeout'));
        }, 30000); // 30 second timeout

        // Listen for response
        const messageHandler = (message) => {
          if (message.type === 'response' || message.type === 'error') {
            clearTimeout(timeout);
            agentWebSocketService.messageHandlers =
              agentWebSocketService.messageHandlers.filter(h => h !== messageHandler);

            if (message.type === 'error') {
              reject(new Error(message.message));
            } else {
              resolve({
                response: message.message,
                success: true,
                toolsUsed: message.tools_used || [],
                message: message.message,
              });
            }
          }
        };

        agentWebSocketService.onMessage(messageHandler);
      });
    } catch (error) {
      throw {
        message: error.message || 'Failed to send prompt to agent',
        status: 500,
        error: error.message,
      };
    }
  },

  /**
   * Get available tools from AI agent via WebSocket
   */
  getAvailableTools: async () => {
    try {
      // Send command to get services/tools
      agentWebSocketService.sendCommand('services', 'command');

      // Return a promise that resolves when we get a response
      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Agent response timeout'));
        }, 10000); // 10 second timeout

        // Listen for response
        const messageHandler = (message) => {
          if (message.type === 'services') {
            clearTimeout(timeout);
            agentWebSocketService.messageHandlers =
              agentWebSocketService.messageHandlers.filter(h => h !== messageHandler);

            resolve({
              tools: message.services || [],
              count: message.services?.length || 0,
            });
          } else if (message.type === 'error') {
            clearTimeout(timeout);
            agentWebSocketService.messageHandlers =
              agentWebSocketService.messageHandlers.filter(h => h !== messageHandler);
            reject(new Error(message.message));
          }
        };

        agentWebSocketService.onMessage(messageHandler);
      });
    } catch (error) {
      throw {
        message: error.message || 'Failed to get available tools',
        status: 500,
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
   * Send streaming prompt to AI agent (same as regular sendPrompt for now)
   */
  sendPromptStream: async (prompt, options = {}) => {
    // For now, just use the regular sendPrompt method
    return await this.sendPrompt(prompt, options);
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
