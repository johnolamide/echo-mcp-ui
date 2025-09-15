/**
 * Agent WebSocket Service
 * Handles real-time communication with echo-mcp-client agent API
 */
class AgentWebSocketService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.messageHandlers = [];
    this.connectionHandlers = [];
    this.userId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
  }

  /**
   * Connect to Agent WebSocket for real-time communication
   */
  async connectAgentWebSocket(userId) {
    if (this.websocket && this.isConnected) {
      // Only log in development and limit frequency
      if (process.env.NODE_ENV === 'development' && !this._connectionLogged) {
        console.log('Agent WebSocket already connected');
        this._connectionLogged = true;
      }
      return;
    }

    // Reset logging flag when connecting
    this._connectionLogged = false;

    if (!userId) {
      throw new Error('User ID is required for agent WebSocket connection');
    }

    this.userId = userId;

    return new Promise((resolve, reject) => {
      try {
        const agentApiUrl = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8002';
        const wsUrl = agentApiUrl.replace(/^http/, 'ws').replace(/^https/, 'wss') + `/ws/agent/${userId}`;
        console.log('Connecting to Agent WebSocket:', wsUrl);
        
        this.websocket = new WebSocket(wsUrl);

        // Set a timeout for connection
        const connectionTimeout = setTimeout(() => {
          console.error('Agent WebSocket connection timeout');
          this.websocket.close();
          reject(new Error('Agent WebSocket connection timeout'));
        }, 10000); // 10 second timeout

        this.websocket.onopen = () => {
          clearTimeout(connectionTimeout);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          console.log('Agent WebSocket connected successfully');
          this.connectionHandlers.forEach(handler => handler({ type: 'connected' }));
          resolve();
        };

        this.websocket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            console.log('Agent WebSocket message received:', message);
            this.messageHandlers.forEach(handler => handler(message));
          } catch (error) {
            console.error('Error parsing Agent WebSocket message:', error);
          }
        };

        this.websocket.onclose = (event) => {
          this.isConnected = false;
          console.log('Agent WebSocket disconnected. Code:', event.code, 'Reason:', event.reason);
          this.connectionHandlers.forEach(handler => handler({ 
            type: 'disconnected', 
            code: event.code, 
            reason: event.reason 
          }));

          // Auto-reconnect logic
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect Agent WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
              this.connectAgentWebSocket(this.userId);
            }, this.reconnectInterval);
          }
        };

        this.websocket.onerror = (error) => {
          console.error('Agent WebSocket error:', error);
          this.connectionHandlers.forEach(handler => handler({ 
            type: 'error', 
            error: error 
          }));
        };

      } catch (error) {
        console.error('Failed to create Agent WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Send command to agent via WebSocket
   */
  sendCommand(command, type = 'command') {
    if (!this.isConnected || !this.websocket) {
      throw new Error('Agent WebSocket is not connected');
    }

    const message = {
      type: type,
      content: command,
      timestamp: Date.now()
    };

    try {
      this.websocket.send(JSON.stringify(message));
      console.log('Sent command to agent:', message);
    } catch (error) {
      console.error('Failed to send command to agent:', error);
      throw error;
    }
  }

  /**
   * Add message handler
   */
  onMessage(handler) {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Add connection handler
   */
  onConnection(handler) {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  /**
   * Disconnect from Agent WebSocket
   */
  disconnect() {
    if (this.websocket) {
      this.isConnected = false;
      this.websocket.close(1000, 'Client initiated disconnect');
      this.websocket = null;
      console.log('Agent WebSocket disconnected by client');
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      readyState: this.websocket ? this.websocket.readyState : WebSocket.CLOSED,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Export singleton instance
export const agentWebSocketService = new AgentWebSocketService();
export default agentWebSocketService;
