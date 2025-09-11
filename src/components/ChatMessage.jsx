import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

/**
 * Renders a single chat message with proper styling based on the sender
 * @param {Object} props
 * @param {Object} props.message - The message object
 * @param {boolean} props.isLoading - Whether the response is still loading
 */
const ChatMessage = ({ message, isLoading = false }) => {
  const isUser = message.role === 'user';
  
  // Check if there are tools used in the response
  const toolsUsed = message.metadata?.tools_used || [];
  const hasTools = Array.isArray(toolsUsed) && toolsUsed.length > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`py-6 ${isUser ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-900/30'}`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-4 sm:gap-6">
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
              <User size={18} />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white">
              <Bot size={18} />
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-hidden">
          <div className="space-y-2 prose prose-p:leading-relaxed prose-pre:p-0 max-w-none">
            {isLoading && !isUser ? (
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse"></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            ) : (
              <div className="prose dark:prose-invert">
                <ReactMarkdown>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
            
            {/* Tools Used Indicator */}
            {hasTools && (
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1 text-gray-400">
                  <Wrench size={12} />
                  <span>Tools used:</span>
                </div>
                {toolsUsed.map((tool, idx) => (
                  <span 
                    key={idx} 
                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
