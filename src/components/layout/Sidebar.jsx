import { motion } from 'framer-motion';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Sidebar component for navigation and conversation history
 * @param {Object} props - Component props
 * @param {Array} props.conversations - List of conversations
 * @param {Function} props.onNewConversation - Function to call when creating a new conversation
 * @param {Function} props.onSelectConversation - Function to call when selecting a conversation
 * @param {string} props.activeConversationId - ID of the active conversation
 */
const Sidebar = ({ 
  conversations = [], 
  onNewConversation, 
  onSelectConversation,
  activeConversationId
}) => {
  return (
    <motion.aside
      className="w-64 bg-white border-r border-gray-200 h-full flex flex-col"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4">
        <Button 
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          New Conversation
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
          Recent Conversations
        </h2>
        <ul className="space-y-1">
          {conversations.map((conversation) => (
            <li key={conversation.id}>
              <button
                onClick={() => onSelectConversation(conversation.id)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                  activeConversationId === conversation.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{conversation.title}</span>
              </button>
            </li>
          ))}
          
          {conversations.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-500">
              No conversations yet
            </li>
          )}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-700 font-medium">
            U
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-700">User</div>
            <div className="text-gray-500 text-xs">Free Plan</div>
          </div>
        </div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
