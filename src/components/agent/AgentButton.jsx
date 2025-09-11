import React from 'react';
import { motion } from 'framer-motion';
import { useAgent } from '../../contexts/AgentContext';

/**
 * Custom AI Assistant Icon
 */
const AIIcon = ({ className = '' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* AI Brain/Circuit pattern */}
    <path
      d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H16C17.1 7 18 7.9 18 9V10.27C18.61 10.6 19 11.26 19 12C19 12.74 18.61 13.4 18 13.73V15C18 16.1 17.1 17 16 17H13V18.27C13.6 18.61 14 19.26 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 19.26 10.4 18.61 11 18.27V17H8C6.9 17 6 16.1 6 15V13.73C5.39 13.4 5 12.74 5 12C5 11.26 5.39 10.6 6 10.27V9C6 7.9 6.9 7 8 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z"
      fill="currentColor"
    />
    {/* Neural network nodes */}
    <circle cx="8" cy="9" r="1" fill="white" />
    <circle cx="16" cy="9" r="1" fill="white" />
    <circle cx="8" cy="15" r="1" fill="white" />
    <circle cx="16" cy="15" r="1" fill="white" />
    <circle cx="12" cy="12" r="1.5" fill="white" />
    {/* Connection lines */}
    <path
      d="M8 9L12 12M16 9L12 12M8 15L12 12M16 15L12 12"
      stroke="white"
      strokeWidth="0.5"
      opacity="0.7"
    />
  </svg>
);

/**
 * Floating AI Agent Button Component
 */
const AgentButton = () => {
  const { isOpen, toggleModal, messages } = useAgent();

  // Check if there are unread messages (for notification indicator)
  const hasNewMessages = messages.length > 0 && !isOpen;

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20,
          delay: 0.5 
        }}
      >
        <motion.button
          onClick={toggleModal}
          className={`
            relative w-12 h-12 sm:w-16 sm:h-16 rounded-full shadow-lg
            bg-gradient-to-r from-blue-600 to-purple-600
            hover:from-blue-700 hover:to-purple-700
            text-white cursor-pointer
            flex items-center justify-center
            transition-all duration-200
            focus:outline-none focus:ring-4 focus:ring-blue-300
            ${isOpen ? 'rotate-45' : ''}
          `}
          whileHover={{ 
            scale: 1.1,
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)" 
          }}
          whileTap={{ scale: 0.95 }}
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* AI Icon */}
          <motion.div
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <AIIcon className="w-6 h-6 sm:w-8 sm:h-8" />
          </motion.div>

          {/* Close Icon when modal is open */}
          <motion.div
            animate={isOpen ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute"
          >
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </motion.div>

          {/* Notification indicator */}
          {hasNewMessages && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full border-2 border-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <div className="w-full h-full bg-red-500 rounded-full animate-ping" />
            </motion.div>
          )}
        </motion.button>

        {/* Tooltip */}
        <motion.div
          className={`
            absolute bottom-full right-0 mb-2 
            px-2 py-1 sm:px-3 sm:py-1 bg-gray-800 text-white text-xs sm:text-sm rounded-lg
            whitespace-nowrap pointer-events-none
            transition-opacity duration-200
            ${isOpen ? 'opacity-0' : 'opacity-0 hover:opacity-100'}
          `}
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          AI Assistant
          {/* Tooltip arrow */}
          <div className="absolute top-full right-2 sm:right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
        </motion.div>
      </motion.div>

      {/* Pulse effect when button appears */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue-400 pointer-events-none z-40"
        initial={{ scale: 1, opacity: 0.8 }}
        animate={{ 
          scale: [1, 1.5, 2], 
          opacity: [0.8, 0.3, 0] 
        }}
        transition={{ 
          duration: 2, 
          repeat: 2,
          delay: 0.5 
        }}
      />
    </>
  );
};

export default AgentButton;
