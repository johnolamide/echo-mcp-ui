import { useState, useEffect, useCallback } from 'react';
import chatService from '../services/api/chatService';

/**
 * Custom hook for managing chat state and interactions
 * @param {string} initialConversationId - Optional initial conversation ID
 * @returns {Object} Chat state and methods
 */
export const useChat = (initialConversationId = null) => {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(initialConversationId);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load conversations on mount
  useEffect(() => {
    const loadConversations = async () => {
      try {
        // In a real implementation, this would call the API
        // const data = await chatService.listConversations();
        // setConversations(data);
        
        // For now, we'll use mock data
        setConversations([
          { id: '1', title: 'First Conversation', updatedAt: new Date().toISOString() },
          { id: '2', title: 'Another Chat', updatedAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
        
        // Set first conversation as active if none provided
        if (!initialConversationId && !currentConversationId) {
          setCurrentConversationId('1');
        }
      } catch (err) {
        setError('Failed to load conversations');
        console.error(err);
      }
    };
    
    loadConversations();
  }, [initialConversationId, currentConversationId]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!currentConversationId) return;
    
    const loadMessages = async () => {
      setIsLoading(true);
      try {
        // In a real implementation, this would call the API
        // const data = await chatService.getConversation(currentConversationId);
        // setMessages(data.messages);
        
        // For now, we'll use mock data
        setMessages([
          { 
            id: '1', 
            role: 'system', 
            content: 'Hello! How can I assist you today?', 
            timestamp: new Date(Date.now() - 3600000).toISOString() 
          },
        ]);
      } catch (err) {
        setError('Failed to load messages');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [currentConversationId]);

  /**
   * Send a message to the API
   * @param {string} content - Message content
   */
  const sendMessage = useCallback(async (content) => {
    if (!content.trim()) return;
    
    // Add user message immediately
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // const response = await chatService.sendMessage(content, currentConversationId);
      
      // For demo, simulate API delay and response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiResponse = {
        id: Date.now().toString(),
        role: 'system',
        content: `I received your message: "${content}". This is a simulated response. In a real implementation, this would come from the Echo MCP API.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId]);

  /**
   * Create a new conversation
   */
  const createNewConversation = useCallback(async () => {
    try {
      // In a real implementation, this would call the API
      // const newConversation = await chatService.createConversation();
      
      // For demo, simulate creating a new conversation
      const newId = Date.now().toString();
      const newConversation = {
        id: newId,
        title: 'New Conversation',
        updatedAt: new Date().toISOString(),
      };
      
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newId);
      setMessages([]);
    } catch (err) {
      setError('Failed to create conversation');
      console.error(err);
    }
  }, []);

  return {
    conversations,
    messages,
    currentConversationId,
    isLoading,
    error,
    sendMessage,
    createNewConversation,
    setCurrentConversationId,
  };
};

export default useChat;
