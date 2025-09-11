import React, { createContext, useContext, useReducer } from 'react';
import agentAPI from '../services/api/agentAPI';

// Initial state
const initialState = {
  isOpen: false,
  messages: [],
  loading: false,
  error: null,
  typing: false,
  availableTools: [],
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

    default:
      return state;
  }
};

// Create context
const AgentContext = createContext();

// Agent provider component
export const AgentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(agentReducer, initialState);

  // Actions
  const toggleModal = () => {
    dispatch({ type: AGENT_ACTIONS.TOGGLE_MODAL });
  };

  const sendMessage = async (message) => {
    // Add user message
    const userMessage = {
      id: Date.now(),
      content: message,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: userMessage });
    dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: true });
    dispatch({ type: AGENT_ACTIONS.SET_TYPING, payload: true });

    try {
      const response = await agentAPI.sendPrompt(message);

      // Add agent response
      const agentMessage = {
        id: Date.now() + 1,
        content: response.response,
        sender: 'agent',
        timestamp: new Date().toISOString(),
        toolsUsed: response.toolsUsed || [],
        success: response.success,
      };

      dispatch({ type: AGENT_ACTIONS.ADD_MESSAGE, payload: agentMessage });
      dispatch({ type: AGENT_ACTIONS.SET_LOADING, payload: false });
      dispatch({ type: AGENT_ACTIONS.SET_TYPING, payload: false });

      return response;
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
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
  };

  const clearMessages = () => {
    dispatch({ type: AGENT_ACTIONS.CLEAR_MESSAGES });
  };

  const clearError = () => {
    dispatch({ type: AGENT_ACTIONS.CLEAR_ERROR });
  };

  const loadAvailableTools = async () => {
    try {
      const tools = await agentAPI.getAvailableTools();
      dispatch({ type: AGENT_ACTIONS.SET_TOOLS, payload: tools });
      return tools;
    } catch (error) {
      console.warn('Failed to load available tools:', error);
      return [];
    }
  };

  const value = {
    ...state,
    toggleModal,
    sendMessage,
    clearMessages,
    clearError,
    loadAvailableTools,
  };

  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

// Custom hook to use agent context
export const useAgent = () => {
  const context = useContext(AgentContext);
  if (!context) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
};

export default AgentContext;
