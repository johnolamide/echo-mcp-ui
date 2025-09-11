import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageCircle, User, Clock, Check, CheckCheck } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useAuth } from '../contexts/AuthContext';
import chatService from '../services/chatService';

const Chat = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [lastMessageTimestamp, setLastMessageTimestamp] = useState(null);
  const [currentView, setCurrentView] = useState('conversations'); // 'conversations' or 'users'
  const [allUsers, setAllUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const userData = localStorage.getItem('user_data');
        
        console.log('Chat Debug - Token:', token ? 'Present' : 'Missing');
        console.log('Chat Debug - User Data:', userData ? JSON.parse(userData) : 'Missing');
        console.log('Chat Debug - Auth Context User:', user);
        
        if (!token) {
          setError('No access token found. Please log in again.');
          return;
        }

        // Test token validity before attempting WebSocket
        console.log('Testing token validity...');
        try {
          const testResponse = await fetch(`${import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000'}/chat/conversations`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (!testResponse.ok) {
            if (testResponse.status === 401) {
              setError('Authentication expired. Please log in again.');
              return;
            }
            throw new Error(`API test failed: ${testResponse.status}`);
          }
          console.log('Token is valid');
        } catch (tokenError) {
          console.error('Token validation failed:', tokenError);
          setError(`Authentication error: ${tokenError.message}`);
          return;
        }

        // Load conversations first (this is most important)
        console.log('Loading conversations...');
        await loadConversations();
        console.log('Conversations loaded successfully');

        // Try WebSocket connection (non-blocking)
        console.log('Attempting WebSocket connection...');
        try {
          await chatService.connectWebSocket(token);
          console.log('WebSocket connected successfully');
          setIsConnected(true);
          setError(null);
        } catch (wsError) {
          console.warn('WebSocket connection failed, continuing without real-time features:', wsError);
          setIsConnected(false);

          // Set a user-friendly error message for WebSocket failure
          let wsErrorMessage = 'Real-time features unavailable';

          if (wsError.message) {
            if (wsError.message.includes('Authentication failed')) {
              wsErrorMessage = 'Authentication expired. Please refresh the page and log in again.';
            } else if (wsError.message.includes('Connection closed abnormally')) {
              wsErrorMessage = 'Server connection issue. Messages will work but real-time updates are disabled.';
            } else if (wsError.message.includes('timeout')) {
              wsErrorMessage = 'Connection timed out. Server may be busy.';
            } else if (wsError.message.includes('Invalid JWT token')) {
              wsErrorMessage = 'Session expired. Please log in again.';
            }
          }

          // Only show error if it's critical (auth issues), otherwise just log it
          if (wsErrorMessage.includes('Authentication') || wsErrorMessage.includes('Session expired')) {
            setError(wsErrorMessage);
          }
        }

        // Load online users (don't block on this)
        loadOnlineUsers().catch(error => {
          console.warn('Failed to load online users:', error);
        });

        // Load all users (don't block on this)
        loadAllUsers().catch(error => {
          console.warn('Failed to load all users:', error);
        });

        // Load all users (don't block on this)
        loadAllUsers().catch(error => {
          console.warn('Failed to load all users:', error);
        });

        console.log('Chat initialization complete');

      } catch (error) {
        console.error('Error initializing chat:', error);
        setError(`Failed to load chat: ${error.message}`);
      }
    };

    // Only initialize if we have auth context or stored auth data
    const hasStoredAuth = localStorage.getItem('auth_token') && localStorage.getItem('user_data');
    
    if (user || hasStoredAuth) {
      initializeChat();
    } else {
      console.log('Waiting for authentication...');
    }

    return () => {
      chatService.disconnect();
    };
  }, [user]); // Add user as dependency

  // Set up WebSocket event handlers
  useEffect(() => {
    const handleMessage = (message) => {
      switch (message.type) {
        case 'connection_confirmed':
          setIsConnected(true);
          setError(null);
          break;
        
        case 'new_message':
          handleNewMessage(message.data);
          break;
        
        case 'message_sent':
          // Message sent confirmation
          break;
        
        case 'typing_indicator':
          handleTypingIndicator(message.data);
          break;
        
        case 'read_receipt':
          handleReadReceipt(message.data);
          break;
        
        case 'online_status':
          const onlineUserIds = Object.keys(message.data.online_status).filter(
            userId => message.data.online_status[userId]
          ).map(Number);
          setOnlineUsers(onlineUserIds);
          
          // Update allUsers with new online status
          setAllUsers(prevUsers => 
            prevUsers.map(user => ({
              ...user,
              is_online: onlineUserIds.includes(user.id)
            }))
          );
          break;
        
        case 'error':
          setError(message.data.message);
          break;
        
        default:
          console.log('Unknown message type:', message.type);
      }
    };

    const handleConnection = (event) => {
      if (event.type === 'connected') {
        setIsConnected(true);
        setError(null);
      } else if (event.type === 'disconnected') {
        setIsConnected(false);
      }
    };

    const handleError = (error) => {
      console.error('WebSocket error in Chat:', error);

      // Provide specific error messages based on error type
      let errorMessage = 'Connection failed';

      if (error.message) {
        // Use the detailed error message from chatService
        errorMessage = error.message;
      } else if (error.type) {
        // Handle different error types
        switch (error.type) {
          case 'network':
            errorMessage = 'Network connection failed. Check your internet connection.';
            break;
          case 'timeout':
            errorMessage = 'Connection timed out. The server may be busy.';
            break;
          case 'server':
            errorMessage = 'Server error occurred. Please try again later.';
            break;
          default:
            errorMessage = `Connection error: ${error.type}`;
        }
      }

      setError(`WebSocket: ${errorMessage}`);
      setIsConnected(false);
    };

    chatService.onMessage(handleMessage);
    chatService.onConnection(handleConnection);
    chatService.onError(handleError);

    return () => {
      chatService.offMessage(handleMessage);
      chatService.offConnection(handleConnection);
      chatService.offError(handleError);
    };
  }, [selectedConversation]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await chatService.getConversations();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load online users
  const loadOnlineUsers = async () => {
    try {
      const data = await chatService.getOnlineUsers();
      setOnlineUsers(data.online_users || []);
    } catch (error) {
      console.error('Error loading online users:', error);
    }
  };

  // Load all users
  const loadAllUsers = async () => {
    try {
      const data = await chatService.getAllUsers();
      setAllUsers(data.users || []);
    } catch (error) {
      console.error('Error loading all users:', error);
    }
  };

  // Load chat history for selected conversation
  const loadChatHistory = async (otherUserId) => {
    try {
      setLoading(true);
      const data = await chatService.getChatHistory(otherUserId);
      setMessages(data.messages.reverse() || []); // Reverse to show oldest first
      
      // Mark messages as read
      try {
        await chatService.markMessagesAsRead(otherUserId);
      } catch (error) {
        console.log('Mark as read API call failed:', error);
      }
      
      // Update conversation unread count
      setConversations(prev => prev.map(conv => 
        conv.other_user_id === otherUserId 
          ? { ...conv, unread_count: 0 }
          : conv
      ));
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error loading chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  // Poll for new messages when WebSocket is not available
  const pollForNewMessages = async () => {
    if (!selectedConversation) return;

    setIsPolling(true);
    try {
      const data = await chatService.getChatHistory(selectedConversation.other_user_id);
      const newMessages = data.messages || [];

      // Find messages newer than our last known message
      const lastKnownTimestamp = lastMessageTimestamp || new Date(0).toISOString();
      const newerMessages = newMessages.filter(msg =>
        new Date(msg.timestamp) > new Date(lastKnownTimestamp)
      );

      if (newerMessages.length > 0) {
        console.log('Polled new messages:', newerMessages.length);

        // Add new messages to the UI immediately
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNewMessages = newerMessages.filter(m => !existingIds.has(m.id));
          return [...prev, ...uniqueNewMessages];
        });

        // Update last message timestamp
        const latestMessage = newerMessages[newerMessages.length - 1];
        setLastMessageTimestamp(latestMessage.timestamp);

        // Scroll to bottom to show new messages
        setTimeout(scrollToBottom, 100);

        // Mark new messages as read if they're from the other user
        const unreadMessages = newerMessages.filter(msg =>
          msg.sender_id === selectedConversation.other_user_id
        );

        if (unreadMessages.length > 0) {
          try {
            await chatService.markMessagesAsRead(selectedConversation.other_user_id);
          } catch (error) {
            console.log('Mark as read failed:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error polling for messages:', error);
    } finally {
      setIsPolling(false);
    }
  };

  // Start/stop polling based on conversation selection
  useEffect(() => {
    if (selectedConversation) {
      // Always poll for new messages, regardless of WebSocket status
      // This ensures messages appear immediately even if WebSocket has issues
      const interval = setInterval(pollForNewMessages, 5000); // Poll every 5 seconds
      setPollingInterval(interval);
      console.log('Started aggressive polling for messages');

      // Reset last message timestamp when switching conversations
      setLastMessageTimestamp(null);
    } else {
      // Stop polling when no conversation is selected
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
        console.log('Stopped polling for messages');
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [selectedConversation]);

  // Handle new incoming message (from WebSocket)
  const handleNewMessage = (messageData) => {
    const newMsg = {
      ...messageData,
      timestamp: new Date(messageData.timestamp)
    };

    // If message is for current conversation, add to messages
    if (selectedConversation &&
        (messageData.sender_id === selectedConversation.other_user_id ||
         messageData.receiver_id === selectedConversation.other_user_id)) {
      setMessages(prev => [...prev, newMsg]);

      // Update last message timestamp for polling
      setLastMessageTimestamp(messageData.timestamp);

      setTimeout(scrollToBottom, 100);

      // Mark as read if we received it
      if (messageData.receiver_id === user.id) {
        chatService.markMessageAsRead(messageData.id);
      }
    }

    // Update conversation list
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv =>
        conv.other_user_id === messageData.sender_id ||
        conv.other_user_id === messageData.receiver_id
      );

      const otherUserId = messageData.sender_id === user.id
        ? messageData.receiver_id
        : messageData.sender_id;

      const updatedConv = {
        other_user_id: otherUserId,
        other_username: messageData.sender_id === user.id
          ? messageData.receiver_username
          : messageData.sender_username,
        last_message: {
          content: messageData.content,
          timestamp: messageData.timestamp,
          is_from_me: messageData.sender_id === user.id
        },
        unread_count: messageData.receiver_id === user.id &&
                     (!selectedConversation || selectedConversation.other_user_id !== messageData.sender_id) ? 1 : 0,
        total_messages: 1
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...updatedConv,
          unread_count: messageData.receiver_id === user.id &&
                       (!selectedConversation || selectedConversation.other_user_id !== messageData.sender_id)
                       ? updated[existingIndex].unread_count + 1
                       : updated[existingIndex].unread_count
        };
        return updated;
      } else {
        return [updatedConv, ...prev];
      }
    });
  };

  // Manual refresh for immediate message checking
  const refreshMessages = async () => {
    if (!selectedConversation) return;

    setIsPolling(true);
    try {
      const data = await chatService.getChatHistory(selectedConversation.other_user_id);
      const allMessages = data.messages || [];

      // Replace all messages with fresh data
      setMessages(allMessages);

      // Update last message timestamp
      if (allMessages.length > 0) {
        const latestMessage = allMessages[allMessages.length - 1];
        setLastMessageTimestamp(latestMessage.timestamp);
      }

      // Scroll to bottom
      setTimeout(scrollToBottom, 100);

      // Mark messages as read
      try {
        await chatService.markMessagesAsRead(selectedConversation.other_user_id);
      } catch (error) {
        console.log('Mark as read failed:', error);
      }

      console.log('Messages refreshed manually');
    } catch (error) {
      console.error('Error refreshing messages:', error);
      setError('Failed to refresh messages');
    } finally {
      setIsPolling(false);
    }
  };

  // Keyboard shortcuts for message refresh
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Ctrl/Cmd + R to refresh messages
      if ((event.ctrlKey || event.metaKey) && event.key === 'r' && selectedConversation) {
        event.preventDefault();
        refreshMessages();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedConversation]);

  // Handle typing indicator
  const handleTypingIndicator = (data) => {
    if (selectedConversation && data.user_id === selectedConversation.other_user_id) {
      setTypingUsers(prev => {
        const updated = new Set(prev);
        if (data.is_typing) {
          updated.add(data.user_id);
        } else {
          updated.delete(data.user_id);
        }
        return updated;
      });
    }
  };

  // Handle read receipt
  const handleReadReceipt = (data) => {
    setMessages(prev => prev.map(msg => 
      msg.id === data.message_id 
        ? { ...msg, is_read: true }
        : msg
    ));
  };

  // Send message with immediate UI feedback
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    const tempId = `temp_${Date.now()}_${Math.random()}`;

    console.log('Chat.jsx sendMessage called:', {
      message: messageContent,
      selectedConversation,
      isConnected: isConnected
    });

    try {
      // Add message to UI immediately for instant feedback
      const tempMessage = {
        id: tempId,
        sender_id: user?.id,
        receiver_id: selectedConversation.other_user_id,
        content: messageContent,
        timestamp: new Date().toISOString(),
        is_temp: true,
        sending: true,
        sender_username: user?.username || 'You'
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');

      // Scroll immediately to show the new message
      setTimeout(scrollToBottom, 50);

      // Send via API
      const response = await chatService.sendMessage(selectedConversation.other_user_id, messageContent);
      console.log('Message sent successfully:', response);

      // Update the temporary message with real data and mark as sent
      if (response && response.id) {
        setMessages(prev =>
          prev.map(msg =>
            msg.id === tempId
              ? { ...response, is_temp: false, sending: false, sent: true }
              : msg
          )
        );

        // Clear sent status after a brief moment
        setTimeout(() => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === response.id
                ? { ...msg, sent: false }
                : msg
            )
          );
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark message as failed
      setMessages(prev =>
        prev.map(msg =>
          msg.id === tempId
            ? { ...msg, sending: false, failed: true }
            : msg
        )
      );
      setNewMessage(messageContent); // Restore the message
      setError(`Failed to send message: ${error.message}`);
    }
  };

  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (selectedConversation && isConnected) {
      // Send typing indicator
      chatService.sendTypingIndicator(selectedConversation.other_user_id, true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        chatService.sendTypingIndicator(selectedConversation.other_user_id, false);
      }, 2000);
    }
  };

  // Handle key press in message input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Conversations/Users List */}
      <div className="w-1/3 border-r bg-muted/10">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2 mb-3">
            {currentView === 'conversations' ? (
              <MessageCircle className="h-5 w-5 text-primary" />
            ) : (
              <Users className="h-5 w-5 text-primary" />
            )}
            <h3 className="font-semibold">
              {currentView === 'conversations' ? 'Messages' : 'Users'}
            </h3>
            <Badge variant={isConnected ? "default" : "destructive"} className="ml-auto">
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
          
          {/* View Toggle Buttons */}
          <div className="flex gap-1">
            <Button
              variant={currentView === 'conversations' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('conversations')}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Messages
            </Button>
            <Button
              variant={currentView === 'users' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentView('users')}
              className="flex-1"
            >
              <Users className="h-4 w-4 mr-1" />
              Users
            </Button>
          </div>
          
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded mt-2">
              {error}
            </div>
          )}
        </div>
        
        <ScrollArea className="h-[calc(100%-120px)]">
          {currentView === 'conversations' ? (
            // Conversations View
            <>
              {loading && conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading conversations...
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-xs">Start chatting with other users</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.other_user_id}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation?.other_user_id === conv.other_user_id 
                        ? 'bg-muted' 
                        : ''
                    }`}
                    onClick={() => {
                      setSelectedConversation(conv);
                      loadChatHistory(conv.other_user_id);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        </Avatar>
                        {isUserOnline(conv.other_user_id) && (
                          <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {conv.other_username}
                          </p>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(conv.last_message.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.last_message.is_from_me ? 'You: ' : ''}
                          {conv.last_message.content}
                        </p>
                        
                        {conv.unread_count > 0 && (
                          <Badge variant="default" className="mt-1 h-5 text-xs">
                            {conv.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          ) : (
            // Users View
            <>
              {allUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No users found</p>
                  <p className="text-xs">Check back later</p>
                </div>
              ) : (
                allUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedConversation?.other_user_id === user.id 
                        ? 'bg-muted' 
                        : ''
                    }`}
                    onClick={() => {
                      // Create a conversation-like object for the selected user
                      const conversationData = {
                        other_user_id: user.id,
                        other_username: user.username,
                        last_message: {
                          content: '',
                          timestamp: new Date().toISOString(),
                          is_from_me: false
                        },
                        unread_count: 0,
                        total_messages: 0
                      };
                      setSelectedConversation(conversationData);
                      loadChatHistory(user.id);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        </Avatar>
                        {user.is_online && (
                          <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm truncate">
                            {user.username}
                          </p>
                          <Badge 
                            variant={user.is_online ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {user.is_online ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-muted/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                  </Avatar>
                  {isUserOnline(selectedConversation.other_user_id) && (
                    <div className="absolute -bottom-0 -right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{selectedConversation.other_username}</h4>
                    {isPolling && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 border border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-muted-foreground">Checking for messages...</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isUserOnline(selectedConversation.other_user_id) ? 'Online' : 'Offline'}
                  </p>
                </div>

                {/* Refresh Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={refreshMessages}
                  disabled={isPolling}
                  className="h-8 w-8 p-0"
                  title="Refresh messages"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {loading && messages.length === 0 ? (
                <div className="text-center text-muted-foreground">
                  Loading messages...
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isFromMe = message.sender_id === user.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isFromMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isFromMe
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            isFromMe ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className={`text-xs ${
                              isFromMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                            }`}>
                              {formatTime(message.timestamp)}
                            </span>
                            {isFromMe && (
                              <div className="ml-1 flex items-center gap-1">
                                {message.sending && (
                                  <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 border border-primary-foreground/70 border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-xs text-primary-foreground/70">Sending...</span>
                                  </div>
                                )}
                                {message.sent && !message.sending && (
                                  <div className="flex items-center gap-1">
                                    <Check className="h-3 w-3 text-green-400" />
                                    <span className="text-xs text-green-400">Sent</span>
                                  </div>
                                )}
                                {message.failed && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs text-red-400">Failed</span>
                                  </div>
                                )}
                                {!message.sending && !message.sent && !message.failed && (
                                  <>
                                    {message.is_read ? (
                                      <CheckCheck className="h-3 w-3 text-primary-foreground/70" />
                                    ) : (
                                      <Check className="h-3 w-3 text-primary-foreground/70" />
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Typing indicator */}
                  {typingUsers.size > 0 && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                        <div className="flex items-center gap-1">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-muted-foreground ml-2">typing...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-muted/5">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={handleKeyPress}
                  placeholder={selectedConversation ? "Type a message..." : "Select a conversation to start chatting"}
                  disabled={!selectedConversation}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={!newMessage.trim() || !selectedConversation}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Connection Status */}
              <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                <span>
                  Status: {isConnected ? 
                    <span className="text-green-600">Connected</span> : 
                    <span className="text-red-600">Disconnected</span>
                  }
                </span>
                {error && (
                  <span className="text-red-600">Error: {error}</span>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
