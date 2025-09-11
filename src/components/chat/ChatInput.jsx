import { useState } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '../common/Textarea';
import { Button } from '../common/Button';
import { motion } from 'framer-motion';

/**
 * Chat input component with expandable textarea and send button
 * @param {Object} props - Component props
 * @param {Function} props.onSendMessage - Function to call when message is sent
 * @param {boolean} props.isLoading - Whether the app is waiting for a response
 */
const ChatInput = ({ onSendMessage, isLoading = false }) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <motion.div 
      className="p-4 border-t border-gray-200 bg-white rounded-b-lg"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form 
        className="flex items-end gap-2"
        onSubmit={handleSendMessage}
      >
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="min-h-[52px] max-h-36 resize-none py-3 px-4 rounded-xl"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isLoading}
          className="rounded-full h-[52px] w-[52px] flex-shrink-0"
        >
          <Send className="h-5 w-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </motion.div>
  );
};

export default ChatInput;
