import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const initialState = {
  selectedUser: null,
  conversations: {},
  onlineUsers: [],
  isLoading: false,
  error: null,
};

const USER_CHAT_ACTIONS = {
  SET_SELECTED_USER: 'SET_SELECTED_USER',
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_ONLINE_USERS: 'SET_ONLINE_USERS',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

const userChatReducer = (state, action) => {
  switch (action.type) {
    case USER_CHAT_ACTIONS.SET_SELECTED_USER:
      return {
        ...state,
        selectedUser: action.payload,
      };

    case USER_CHAT_ACTIONS.SET_CONVERSATIONS:
      return {
        ...state,
        conversations: { ...state.conversations, ...action.payload },
      };

    case USER_CHAT_ACTIONS.ADD_MESSAGE:
      const { username, message } = action.payload;
      const conversation = state.conversations[username] || [];
      return {
        ...state,
        conversations: {
          ...state.conversations,
          [username]: [...conversation, message],
        },
      };

    case USER_CHAT_ACTIONS.SET_ONLINE_USERS:
      return {
        ...state,
        onlineUsers: action.payload,
      };

    case USER_CHAT_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case USER_CHAT_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case USER_CHAT_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

const UserChatContext = createContext();

export const UserChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(userChatReducer, initialState);
  const { user } = useAuth();

  // Fetch online users periodically
  useEffect(() => {
    if (user) {
      fetchOnlineUsers();
      const interval = setInterval(fetchOnlineUsers, 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000'}/chat/users`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const filteredUsers = (data.data?.users || data.users || []).filter(u => u.id !== user?.id);
        dispatch({ type: USER_CHAT_ACTIONS.SET_ONLINE_USERS, payload: filteredUsers });
      }
    } catch (error) {
      console.error('Error fetching online users:', error);
    }
  };

  const selectUser = (user) => {
    dispatch({ type: USER_CHAT_ACTIONS.SET_SELECTED_USER, payload: user });
    // Fetch conversation history if not already loaded
    if (!state.conversations[user.username]) {
      fetchConversation(user.username);
    }
  };

  const fetchConversation = async (username) => {
    try {
      dispatch({ type: USER_CHAT_ACTIONS.SET_LOADING, payload: true });
      const response = await fetch(`${import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000'}/chat/history/${username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: USER_CHAT_ACTIONS.SET_CONVERSATIONS,
          payload: { [username]: data.data.messages || [] }
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      dispatch({ type: USER_CHAT_ACTIONS.SET_ERROR, payload: 'Failed to load conversation' });
    } finally {
      dispatch({ type: USER_CHAT_ACTIONS.SET_LOADING, payload: false });
    }
  };

  const sendMessage = async (receiverUsername, content) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000'}/chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          receiver_username: receiverUsername,
          content: content
        })
      });

      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: USER_CHAT_ACTIONS.ADD_MESSAGE,
          payload: { username: receiverUsername, message: data.data }
        });
        return data.data;
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({ type: USER_CHAT_ACTIONS.SET_ERROR, payload: error.message });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: USER_CHAT_ACTIONS.CLEAR_ERROR });
  };

  const value = {
    ...state,
    selectUser,
    sendMessage,
    fetchConversation,
    clearError,
  };

  return (
    <UserChatContext.Provider value={value}>
      {children}
    </UserChatContext.Provider>
  );
};

export const useUserChat = () => {
  const context = useContext(UserChatContext);
  if (!context) {
    throw new Error('useUserChat must be used within a UserChatProvider');
  }
  return context;
};

export default UserChatContext;