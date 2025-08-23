import { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

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
        <div className="prose prose-sm">
          {content}
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
