/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import agentAPI from '../services/api/agentAPI';
import agentWebSocketService from '../services/agentWebSocketService';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  isOpen: false,
  messages: [],
  loading: false,
  error: null,
  typing: false,
  availableTools: [],
  isConnected: false,
  useWebSocket: true, // Default to WebSocket for real-time communication
};

// Action types
const AGENT_ACTIONS = {
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_LOADING: 'SET_LOADING',
  SET_TYPING: 'SET_TYPING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_MESSAGES: 'CLEAR_MESSAGES',
  SET_TOOLS: 'SET_TOOLS',
  SET_CONNECTED: 'SET_CONNECTED',
  TOGGLE_WEBSOCKET: 'TOGGLE_WEBSOCKET',
};

// Helper function to format agent responses
const formatAgentResponse = (response) => {
  if (!response) return '';

  // Handle different response formats from the agent
  if (Array.isArray(response)) {
    // If it's an array of message parts
    return response.map((part) => {
      if (typeof part === 'string') {
        return part;
      } else if (part.type === 'text' && part.text) {
        return part.text;
      } else if (part.content) {
        return part.content;
      } else {
        return JSON.stringify(part, null, 2);
      }
    }).join(' ');
  } else if (response.type === 'text' && response.text) {
    // OpenAI-style text response
    return response.text;
  } else if (response.content) {
    // Generic content field
    return response.content;
  } else if (response.message) {
    // Message field
    return response.message;
  } else if (typeof response === 'string') {
    // Plain string
    return response;
  } else {
    // Fallback to pretty-printed JSON
    return JSON.stringify(response, null, 2);
  }
};

// Reducer
const agentReducer = (state, action) => {
  switch (action.type) {
    case AGENT_ACTIONS.TOGGLE_MODAL:
      return {
        ...state,
        isOpen: !state.isOpen,
        error: null,
      };

    case AGENT_ACTIONS.ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };

    case AGENT_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case AGENT_ACTIONS.SET_TYPING:
      return {
        ...state,
        typing: action.payload,
      };

    case AGENT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
        typing: false,
      };

    case AGENT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AGENT_ACTIONS.CLEAR_MESSAGES:
      return {
        ...state,
        messages: [],
      };

    case AGENT_ACTIONS.SET_TOOLS:
      return {
        ...state,
        availableTools: action.payload,
      };

    case AGENT_ACTIONS.SET_CONNECTED:
      return {
        ...state,
        isConnected: action.payload,
      };

    case AGENT_ACTIONS.TOGGLE_WEBSOCKET:
      return {
        ...state,
        useWebSocket: !state.useWebSocket,
      };

    default:
      return state;
  }
};

// Create context
const AgentContext = createContext();

// Agent provider component
export const AgentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);
  const { user } = useAuth();
  const messageHandlerRef = useRef(null);
  const connectionHandlerRef = useRef(null);
  const processedMessagesRef = useRef(new Set());

  // Initialize WebSocket connection when user is available
  // Moved to after function definitions to avoid temporal dead zone

  // Cleanup WebSocket handlers
  const cleanupWebSocketHandlers = () => {
    if (messageHandlerRef.current) {
      messageHandlerRef.current();
      messageHandlerRef.current = null;
    }
    if (connectionHandlerRef.current) {
      connectionHandlerRef.current();
      connectionHandlerRef.current = null;
    }
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((message) => {
    console.log('Received agent message:', message);

    // Create a unique message identifier
    const messageId = `${message.type}_${message.timestamp || Date.now()}_${JSON.stringify(message).length}`;
    
    // Check if we've already processed this message
    if (processedMessagesRef.current.has(messageId)) {
      console.log('Ignoring duplicate message:', messageId);
      return;
    }
    
    // Mark message as processed
    processedMessagesRef.current.add(messageId);
    
    // Limit the size of the processed messages set to prevent memory leaks
    if (processedMessagesRef.current.size > 1000) {
      const oldestMessages = Array.from(processedMessagesRef.current).slice(0, 500);
      oldestMessages.forEach(id => processedMessagesRef.current.delete(id));
    }

    // Filter out system messages that shouldn't be displayed as chat messages
    const systemMessageTypes = ['welcome', 'system', 'help', 'services', 'status', 'pong', 'ping'];
    if (systemMessageTypes.includes(message.type)) {
      console.log('Ignoring system message:', message);
      return;
    }

    const agentMessage = {
      id: messageId, // Use the unique message ID instead of Date.now()
      content: formatAgentResponse(message.message) || formatAgentResponse(message.response) || 'Agent response received',
      sender: 'agent',
      timestamp: new Date().toISOString(),
      type: message.type,
      toolsUsed: message.tools_used || [],
      status: message.status,
    };

    dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: agentMessage });
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: false });
    dispatch({ type: AGENT_ACTIONS.SET_TYPING, payload: false });
  }, [dispatch]);

  // Initialize WebSocket connection
  const initializeAgentWebSocket = useCallback(async () => {
    try {
      await agentWebSocketService.connectAgentWebSocket(user.id);
      dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: true });
      
      // Clean up any existing handlers before registering new ones
      cleanupWebSocketHandlers();
      
      // Set up message handler
      messageHandlerRef.current = agentWebSocketService.onMessage((message) => {
        handleWebSocketMessage(message);
      });

      // Set up connection handler
      connectionHandlerRef.current = agentWebSocketService.onConnection((event) => {
        if (event.type === 'connected') {
          dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: true });
          dispatch({ type: AGENT_ACTIONS.CLEAR_ERROR });
        } else if (event.type === 'disconnected') {
          dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: false });
        } else if (event.type === 'error') {
          dispatch({ type: AGENT_ACTIONS.SET_ERROR, payload: 'Agent connection error' });
        }
      });

    } catch (error) {
      console.warn('Agent WebSocket connection failed, falling back to HTTP:', error.message);
      // Don't set a critical error - WebSocket is optional, HTTP fallback will work
      dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: false });
      // Clear any existing handlers
      cleanupWebSocketHandlers();
    }
  }, [user?.id, handleWebSocketMessage, dispatch]);

  // Actions
  const toggleModal = useCallback(() => {
    dispatch({ type: AGENT_ACTIONS.TOGGLE_MODAL });
  }, []);

  const sendMessage = useCallback(async (message) => {
    // Add user message
    const userMessageId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userMessage = {
      id: userMessageId,
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AGENT_ACTIONS.SET_TYPING, payload: true });

    try {
      if (state.useWebSocket && state.isConnected) {
        try {
          // Use WebSocket for real-time communication
          agentWebSocketService.sendCommand(message);
          // Response will be handled by WebSocket message handler
        } catch (wsError) {
          console.warn('WebSocket send failed, falling back to HTTP:', wsError.message);
          // Fall back to HTTP API
          const response = await agentAPI.sendPrompt(message);

          // Add agent response
          const agentMessageId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const agentMessage = {
            id: agentMessageId,
            content: formatAgentResponse(response.response),
            sender: 'agent',
            timestamp: new Date().toISOString(),
            toolsUsed: response.toolsUsed || [],
            success: response.success,
          };

          dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: agentMessage });
          dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: false });
          dispatch({ type: AGENT_ACTIONS.SET_TYPING, payload: false });

          return response;
        }
      } else {
        // Use HTTP API directly
        const response = await agentAPI.sendPrompt(message);

        // Add agent response
        const agentMessageId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const agentMessage = {
          id: agentMessageId,
          content: formatAgentResponse(response.response),
          sender: 'agent',
          timestamp: new Date().toISOString(),
          toolsUsed: response.toolsUsed || [],
          success: response.success,
        };

        dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: agentMessage });
        dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: false });
        dispatch({ type: AGENT_ACTIONS.SET_TYPING, payload: false });

        return response;
      }
    } catch (error) {
      const errorMessageId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const errorMessage = {
        id: errorMessageId,
        content: `Sorry, I encountered an error: ${error.message}`,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        isError: true,
      };

      dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: errorMessage });
      dispatch({
        type: AGENT_ACTIONS.SET_ERROR,
        payload: error.message || 'Failed to send message',
      });

      throw error;
    }
  }, [state.useWebSocket, state.isConnected]);

  const clearMessages = useCallback(() => {
    dispatch({ type: AGENT_ACTIONS.CLEAR_MESSAGES });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: AGENT_ACTIONS.CLEAR_ERROR });
  }, []);

  const loadAvailableTools = useCallback(async () => {
    try {
      const tools = await agentAPI.getAvailableTools();
      dispatch({ type: AGENT_ACTIONS.SET_TOOLS, payload: tools });
      return tools;
    } catch (error) {
      console.warn('Failed to load available tools:', error);
      return [];
    }
  }, []);

  const toggleWebSocketMode = useCallback(() => {
    dispatch({ type: AGENT_ACTIONS.TOGGLE_WEBSOCKET });
  }, []);

  const connectAgent = useCallback(async () => {
    if (user && state.useWebSocket) {
      await initializeAgentWebSocket();
    }
  }, [user, state.useWebSocket, initializeAgentWebSocket]);

  const disconnectAgent = useCallback(() => {
    agentWebSocketService.disconnect();
    dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: false });
  }, []);

  // Initialize WebSocket connection when user is available
  useEffect(() => {
    if (user && state.useWebSocket) {
      initializeAgentWebSocket();
    } else {
      cleanupWebSocketHandlers();
      agentWebSocketService.disconnect();
      dispatch({ type: AGENT_ACTIONS.SET_CONNECTED, payload: false });
    }

    return () => {
      cleanupWebSocketHandlers();
      agentWebSocketService.disconnect();
    };
  }, [user, state.useWebSocket, initializeAgentWebSocket]);

  const value = {
    ...state,
    toggleModal,
    sendMessage,
    clearMessages,
    clearError,
    loadAvailableTools,
    toggleWebSocketMode,
    connectAgent,
    disconnectAgent,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

// Custom hook to use agent context
/* eslint-disable react-refresh/only-export-components */
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};
