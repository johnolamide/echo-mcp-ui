import { useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatMessage from './ChatMessage';

/**
 * Component to display a list of chat messages with auto-scroll
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.isLoading - Whether a response is being loaded
 */
const ChatMessageList = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence>
        {messages.map((message, index) => (
          <ChatMessage
            key={message.id || index}
            content={message.content}
            isUser={message.role === 'user'}
            timestamp={formatTimestamp(message.timestamp)}
            index={index}
          />
        ))}
      </AnimatePresence>
      
      {isLoading && (
        <div className="flex items-center space-x-2 text-gray-500 animate-pulse">
          <div className="h-2 w-2 rounded-full bg-gray-400"></div>
          <div className="h-2 w-2 rounded-full bg-gray-400 animation-delay-200"></div>
          <div className="h-2 w-2 rounded-full bg-gray-400 animation-delay-500"></div>
          <span className="text-sm">AI is thinking...</span>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessageList;
