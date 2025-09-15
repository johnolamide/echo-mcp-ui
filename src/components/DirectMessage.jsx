import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import chatService from '../services/chatService';

const API_BASE_URL = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000';

const DirectMessage = ({ selectedUser, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  // Memoize filtered and sorted messages to prevent unnecessary re-renders
  const validMessages = useMemo(() => {
    const filtered = messages
      .filter(message => message && message.id && message.sender_id !== undefined)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)); // Sort by timestamp ascending (oldest first)
    
    // Debug summary of message positioning
    if (process.env.NODE_ENV === 'development' && filtered.length > 0 && !filtered._summaryLogged) {
      filtered._summaryLogged = true;
      const sentCount = filtered.filter(m => m.sender_id === user?.id).length;
      const receivedCount = filtered.length - sentCount;
      console.log('💬 Message Positioning Summary:', {
        totalMessages: filtered.length,
        sentByYou: sentCount,
        received: receivedCount,
        userId: user?.id,
        conversationWith: selectedUser?.username || selectedUser?.id
      });
    }
    
    return filtered;
  }, [messages, user?.id, selectedUser]);

  useEffect(() => {
    if (selectedUser?.id) {
      fetchMessages();
      connectWebSocket();
      scrollToBottom();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [selectedUser?.id]); // Use selectedUser.id instead of selectedUser object

    useEffect(() => {
    if (validMessages.length > 0) {
      scrollToBottom();
    }
  }, [validMessages]); // Use validMessages instead of messages

  const connectWebSocket = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token && !chatService.isConnected) {
        await chatService.connectWebSocket(token);
        chatService.onMessage(handleWebSocketMessage);
        console.log('Connected to chat WebSocket');
      }
    } catch (error) {
      console.error('Failed to connect to chat WebSocket:', error);
    }
  };

  const disconnectWebSocket = () => {
    chatService.disconnect();
  };

  const handleWebSocketMessage = (message) => {
    console.log('Received WebSocket message:', message);
    
    // Handle incoming messages - add messages from both current user and selected user
    if (message.type === 'new_message' && 
        (message.sender_id === selectedUser.id || message.receiver_id === selectedUser.id)) {
      setMessages(prev => {
        // Avoid duplicates by checking if message already exists
        const messageExists = prev.some(m => m.id === message.id);
        if (!messageExists) {
          // Add new message and sort by timestamp to maintain chronological order
          const newMessages = [...prev, message];
          return newMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
        return prev;
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/chat/history/${selectedUser.username}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Sort messages by timestamp ascending (oldest first) for proper chat flow
        const sortedMessages = (data.data.messages || []).sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        setMessages(sortedMessages);
        setError(null);
      } else {
        setError('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

    const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    // Optimistically add message to UI
    const tempMessage = {
      id: `temp_${Date.now()}`,
      content: messageText,
      sender_id: user.id,
      receiver_id: selectedUser.id,
      timestamp: new Date().toISOString(),
      isSending: true,
      sender_username: user.username,
      receiver_username: selectedUser.username
    };

    setMessages(prev => [...prev, tempMessage]);

    try {
      // Send via ChatService (which handles both HTTP and WebSocket)
      const result = await chatService.sendMessage(selectedUser.username, messageText);
      
      // Replace temp message with actual message and maintain chronological order
      setMessages(prev => {
        const updatedMessages = prev.map(msg =>
          msg.id === tempMessage.id ? { ...result, isSending: false } : msg
        );
        return updatedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temp message and show error, then re-sort
      setMessages(prev => {
        const filteredMessages = prev.filter(msg => msg.id !== tempMessage.id);
        return filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      });
      setError('Failed to send message');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!selectedUser) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a user to start chatting</h3>
        <p className="text-gray-500">Choose someone from the user list to begin a conversation</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-medium text-sm">
                {selectedUser.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedUser.username}</h3>
              <p className="text-sm text-gray-500">
                {selectedUser.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading && validMessages.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Loading messages...</span>
          </div>
        ) : validMessages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h4>
            <p className="text-gray-500">Start the conversation by sending a message below</p>
          </div>
        ) : (
          validMessages
            .map((message, index) => {
            const isSentByUser = message.sender_id === user?.id;
            
            // Only log once per message, not on every render
            if (process.env.NODE_ENV === 'development' && !message._logged) {
              message._logged = true; // Mark as logged to prevent repetition
              console.log(`Message ${message.id} positioning:`, {
                messageId: message.id,
                senderId: message.sender_id,
                userId: user?.id,
                isSentByUser,
                content: message.content?.substring(0, 30),
                timestamp: message.timestamp
              });
            }
            
            return (
              <div
                key={message.id || `message_${index}`}
                className={`flex ${isSentByUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className="flex flex-col max-w-xs lg:max-w-md">
                  {/* Message bubble with better styling */}
                  <div
                    className={`px-4 py-2 rounded-lg break-words shadow-sm relative ${
                      isSentByUser
                        ? 'bg-indigo-600 text-white ml-12 rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 mr-12 rounded-bl-sm'
                    } ${message.isSending ? 'opacity-70' : ''}`}
                  >
                    {/* Message content */}
                    <div className="text-sm leading-relaxed">
                      {message.content}
                    </div>
                    
                    {/* Sending indicator */}
                    {message.isSending && (
                      <span className="ml-2 text-xs opacity-70 italic">Sending...</span>
                    )}
                    
                    {/* Message status indicator */}
                    <div className={`absolute bottom-1 ${isSentByUser ? 'left-2' : 'right-2'} text-xs opacity-60`}>
                      {isSentByUser ? '→' : '←'}
                    </div>
                  </div>
                  
                  {/* Timestamp */}
                  <div
                    className={`text-xs text-gray-400 mt-1 px-2 ${
                      isSentByUser ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTimestamp(message.timestamp)}
                    {isSentByUser && <span className="ml-1 text-indigo-400">• You</span>}
                    {!isSentByUser && <span className="ml-1 text-gray-400">• {selectedUser?.username || 'Them'}</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message ${selectedUser.username}...`}
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectMessage;