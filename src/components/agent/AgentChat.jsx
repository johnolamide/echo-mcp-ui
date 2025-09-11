import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '../../contexts/AgentContext';
import MarkdownRenderer from '../common/MarkdownRenderer';

/**
 * AI Agent Chat Component
 */
const AgentChat = () => {
  const { 
    messages, 
    loading, 
    typing, 
    error, 
    sendMessage, 
    clearMessages, 
    clearError 
  } = useAgent();
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Focus input when modal opens
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || loading) return;

    const message = inputMessage.trim();
    setInputMessage('');
    clearError();

    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Suggested prompts for new users
  const suggestedPrompts = [
    "What tools do you have available?",
    "Show me the restaurant menu for provider test_provider_1001",
    "Get user statistics summary",
    "Find online users",
    "Help me manage orders"
  ];

  const handleSuggestedPrompt = (prompt) => {
    setInputMessage(prompt);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Welcome Message */}
        {messages.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-4 sm:py-8"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 sm:w-8 sm:h-8 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H16C17.1 7 18 7.9 18 9V10.27C18.61 10.6 19 11.26 19 12C19 12.74 18.61 13.4 18 13.73V15C18 16.1 17.1 17 16 17H13V18.27C13.6 18.61 14 19.26 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 19.26 10.4 18.61 11 18.27V17H8C6.9 17 6 16.1 6 15V13.73C5.39 13.4 5 12.74 5 12C5 11.26 5.39 10.6 6 10.27V9C6 7.9 6.9 7 8 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z" />
              </svg>
            </div>
            
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              Hello! I'm your AI Assistant
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto px-4 sm:px-0">
              I can help you with restaurant orders, chat management, user administration, and more using the Echo MCP platform.
            </p>

            {/* Suggested Prompts */}
            <div className="space-y-2">
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3">Try asking me:</p>
              <div className="space-y-2">
                {suggestedPrompts.map((prompt, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="block w-full text-left p-2 sm:p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs sm:text-sm text-gray-700 transition-colors duration-200"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    "{prompt}"
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Messages */}
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-3 py-2 sm:px-4 sm:py-3 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : message.isError
                    ? 'bg-red-50 border border-red-200 text-red-800'
                    : 'bg-gray-50 text-gray-800'
                }`}
              >
                {message.sender === 'user' ? (
                  <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                ) : (
                  <div>
                    {/* AI Response with Markdown */}
                    <MarkdownRenderer 
                      content={message.content}
                      className="text-xs sm:text-sm"
                    />
                    
                    {/* Tools Used Indicator */}
                    {message.toolsUsed && message.toolsUsed.length > 0 && (
                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                        <p className="text-xs text-gray-500 mb-1">Tools used:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.toolsUsed.map((tool, i) => (
                            <span
                              key={i}
                              className="inline-block px-1.5 py-0.5 sm:px-2 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Timestamp */}
                <p className={`text-xs mt-1 sm:mt-2 ${
                  message.sender === 'user' 
                    ? 'text-blue-100' 
                    : 'text-gray-500'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {typing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex justify-start"
          >
            <div className="bg-gray-50 rounded-lg px-3 py-2 sm:px-4 sm:py-3">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 sm:px-4 sm:py-3 max-w-sm">
              <p className="text-red-800 text-xs sm:text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 text-xs underline mt-1"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="w-full px-2 py-2 sm:px-3 sm:py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm"
              rows="2"
              disabled={loading}
            />
          </div>
          
          <div className="flex flex-col space-y-1">
            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-200 ${
                inputMessage.trim() && !loading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>

            {/* Clear Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={clearMessages}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                title="Clear messages"
              >
                <svg
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AgentChat;
