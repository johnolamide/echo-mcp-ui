import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import MarkdownRenderer from '../common/MarkdownRenderer';

/**
 * Component to render an individual chat message
 * @param {Object} props - Component props
 * @param {string} props.content - Message content
 * @param {boolean} props.isUser - Whether the message is from the user
 * @param {string} props.timestamp - Message timestamp
 * @param {number} props.index - Message index for animation delay
 */
const ChatMessage = memo(({ content, isUser, timestamp, index = 0 }) => {
  return (
    <motion.div
      className={cn(
        "flex w-full mb-4",
        isUser ? "justify-end" : "justify-start"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        delay: index * 0.1, // Staggered animation
      }}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser 
            ? "bg-primary-600 text-white" 
            : "bg-gray-100 text-gray-800"
        )}
      >
        <div className={cn(
          "prose prose-sm max-w-none",
          isUser ? "prose-invert" : ""
        )}>
          {isUser ? (
            // For user messages, keep simple text formatting
            typeof content === 'string' 
              ? content.split('\n').map((line, i) => (
                  <p key={i} className={line.trim() === '' ? 'h-4' : ''}>
                    {line.trim() === '' ? '\u00A0' : line}
                  </p>
                ))
              : JSON.stringify(content)
          ) : (
            // For AI messages, render as beautiful markdown
            <MarkdownRenderer 
              content={typeof content === 'string' ? content : JSON.stringify(content)}
              className={isUser ? "prose-invert" : ""}
            />
          )}
        </div>
        <div 
          className={cn(
            "text-xs mt-1",
            isUser ? "text-primary-100" : "text-gray-500"
          )}
        >
          {timestamp}
        </div>
      </div>
    </motion.div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default ChatMessage;
