import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

/**
 * Header component for the app
 */
const Header = () => {
  return (
    <motion.header
      className="bg-white border-b border-gray-200 py-4 px-6 sticky top-0 z-10"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <motion.div
            className="bg-primary-600 text-white p-2 rounded-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageSquare className="h-6 w-6" />
          </motion.div>
          <h1 className="text-xl font-semibold text-gray-900">Echo MCP Chat</h1>
        </div>
        <nav>
          <ul className="flex items-center gap-6">
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                Settings
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
