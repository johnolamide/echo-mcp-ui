import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAgent } from '../../contexts/AgentContext';
import AgentChat from './AgentChat';

/**
 * AI Agent Modal Component
 */
const AgentModal = () => {
  const { isOpen, toggleModal } = useAgent();
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        // Don't close if clicking on the floating button
        const floatingButton = document.querySelector('[data-agent-button]');
        if (!floatingButton?.contains(event.target)) {
          toggleModal();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, toggleModal]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        toggleModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, toggleModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            className="fixed inset-0 sm:inset-auto sm:bottom-16 sm:right-4 lg:bottom-24 lg:right-6 w-full h-full sm:w-80 lg:w-96 sm:h-[500px] lg:h-[600px] z-50"
            initial={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50,
              transformOrigin: 'bottom right'
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8, 
              y: 50 
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 30 
            }}
          >
            {/* Modal Container */}
            <div className="bg-white sm:rounded-lg shadow-2xl h-full flex flex-col overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-3 sm:px-4 sm:py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* AI Avatar */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 sm:w-5 sm:h-5 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H16C17.1 7 18 7.9 18 9V10.27C18.61 10.6 19 11.26 19 12C19 12.74 18.61 13.4 18 13.73V15C18 16.1 17.1 17 16 17H13V18.27C13.6 18.61 14 19.26 14 20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20C10 19.26 10.4 18.61 11 18.27V17H8C6.9 17 6 16.1 6 15V13.73C5.39 13.4 5 12.74 5 12C5 11.26 5.39 10.6 6 10.27V9C6 7.9 6.9 7 8 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2Z" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-semibold text-sm sm:text-lg">AI Assistant</h3>
                    <p className="text-blue-100 text-xs hidden sm:block">Powered by Amazon Nova Pro</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={toggleModal}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors duration-200"
                >
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <AgentChat />
              </div>

              {/* Footer */}
              <div className="px-3 py-2 sm:px-4 sm:py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  AI assistant can help with orders, chat, and system management
                </p>
              </div>
            </div>

            {/* Resize handle (optional for future) - only show on larger screens */}
            <div className="absolute top-0 left-0 w-2 h-2 cursor-nw-resize opacity-0 hover:opacity-50 bg-gray-400 rounded-br-lg transition-opacity hidden sm:block" />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AgentModal;
