import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAgent } from '../contexts/AgentContext';

const API_BASE_URL = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000';
const AGENT_API_BASE_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8002';

const AgentChat = () => {
  const [inputMessage, setInputMessage] = useState('');
  const [agentServices, setAgentServices] = useState([]);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const { 
    messages, 
    loading, 
    isConnected, 
    error, 
    sendMessage, 
    clearError,
    connectAgent,
    disconnectAgent,
    useWebSocket 
  } = useAgent();

  useEffect(() => {
    fetchAgentServices();
    scrollToBottom();
    
    // Auto-connect when component mounts
    if (user && !isConnected) {
      connectAgent();
    }
  }, [user, connectAgent]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Clear error after 5 seconds
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const messageText = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage(messageText);
    } catch (error) {
      console.error('Error sending message:', error);
      // Error is already handled by AgentContext
    }
  };

  const fetchAgentServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAgentServices(data.data.services || []);
      }
    } catch (error) {
      console.error('Error fetching agent services:', error);
    }
  };

  const getMessageStyle = (sender, type) => {
    const baseStyle = "max-w-xs lg:max-w-md px-4 py-2 rounded-lg break-words";
    
    if (type === 'error') {
      return `${baseStyle} bg-red-100 text-red-800 border border-red-200`;
    }
    
    if (type === 'action') {
      return `${baseStyle} bg-blue-100 text-blue-800 border border-blue-200`;
    }
    
    if (sender === 'user') {
      return `${baseStyle} bg-indigo-600 text-white ml-auto`;
    }
    
    return `${baseStyle} bg-gray-100 text-gray-900`;
  };

  const getMessageAlignment = (sender, type) => {
    if (type === 'error' || type === 'action') {
      return 'justify-center';
    }
    return sender === 'user' ? 'justify-end' : 'justify-start';
  };

  const formatTimestamp = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatAgentResponse = (response) => {
    // Handle different response formats from the agent
    if (Array.isArray(response)) {
      // If it's an array of message parts
      return response.map((part, index) => {
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
    } else {
      // Fallback to pretty-printed JSON
      return JSON.stringify(response, null, 2);
    }
  };

  const getSuggestions = () => {
    const suggestions = [
      "Send a message to someone",
      "Process a payment",
      "Check my services",
      "Help me with available commands"
    ];
    
    if (agentServices.length > 0) {
      suggestions.unshift(`I have ${agentServices.length} services available`);
    }
    
    return suggestions;
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">AI Agent Chat</h3>
          <p className="text-sm text-gray-500">
            Chat with your personal AI agent
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Connected' : 'Disconnected'}
            {useWebSocket && <span className="ml-1 text-xs">(WebSocket)</span>}
          </span>
        </div>
      </div>

      {/* Agent Services Status */}
      {agentServices.length > 0 && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Active Services:</strong> {agentServices.filter(s => s.is_active).length} of {agentServices.length}
          </div>
        </div>
      )}

      {/* System Messages */}
      {messages.some(msg => msg.type === 'help' || msg.type === 'services' || msg.type === 'status') && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="text-sm text-gray-600">
            💡 <strong>System:</strong> Agent is ready with {agentServices.filter(s => s.is_active).length} active services
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-4">
              <div className="text-2xl mb-2">🤖</div>
              <div className="text-lg font-medium">Start a conversation</div>
              <div className="text-sm">Your AI agent is ready to help!</div>
            </div>
            
            {agentServices.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="text-yellow-800 text-sm">
                  <strong>Tip:</strong> Add services to your agent from the Service Marketplace to unlock more capabilities!
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="text-green-800 text-sm">
                  <strong>Ready:</strong> Your agent has {agentServices.filter(s => s.is_active).length} active services
                </div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700">Try saying:</div>
              {getSuggestions().map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(suggestion)}
                  className="block w-full text-left text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 p-2 rounded transition-colors"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`flex ${getMessageAlignment(message.sender, message.type)}`}>
              <div className="flex flex-col">
                <div className={getMessageStyle(message.sender, message.type)}>
                  <div>
                    {typeof message.content === 'object' 
                      ? formatAgentResponse(message.content) 
                      : message.content
                    }
                  </div>
                  {message.toolsUsed && message.toolsUsed.length > 0 && (
                    <div className="text-xs mt-2 opacity-75">
                      Tools used: {message.toolsUsed.join(', ')}
                    </div>
                  )}
                </div>
                <div className={`text-xs text-gray-400 mt-1 ${
                  message.sender === 'user' ? 'text-right' : 'text-left'
                }`}>
                  {formatTimestamp(new Date(message.timestamp))}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        {error && (
          <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to the agent..."
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

export default AgentChat;
