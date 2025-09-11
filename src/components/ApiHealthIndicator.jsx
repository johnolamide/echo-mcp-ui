import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon } from 'lucide-react';
import useApiHealth from '../hooks/useApiHealth';

/**
 * A component that displays the API health status
 * Shows a small indicator in the UI to help with debugging
 */
const ApiHealthIndicator = () => {
  const health = useApiHealth();
  
  if (!health.isChecked) {
    return (
      <div className="fixed bottom-4 right-4 bg-gray-700 text-white p-2 rounded-md flex items-center space-x-2 text-sm shadow-lg z-50">
        <div className="animate-pulse h-2 w-2 rounded-full bg-blue-400"></div>
        <span>Checking API...</span>
      </div>
    );
  }
  
  if (health.isHealthy) {
    return (
      <div className="fixed bottom-4 right-4 bg-green-700 text-white p-2 rounded-md flex items-center space-x-2 text-sm shadow-lg z-50 hover:bg-green-600 transition-colors duration-200 cursor-pointer group">
        <CheckCircleIcon size={16} />
        <span>API Connected</span>
        
        {/* Hover details */}
        <div className="invisible group-hover:visible absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-md text-xs w-64 shadow-xl">
          <div className="font-bold mb-1">API Status: {health.details?.status}</div>
          {health.details?.model && <div>Model: {health.details.model}</div>}
          {health.details?.region && <div>Region: {health.details.region}</div>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-red-700 text-white p-2 rounded-md flex items-center space-x-2 text-sm shadow-lg z-50 hover:bg-red-600 transition-colors duration-200 cursor-pointer group">
      {health.error?.includes('Network Error') ? (
        <AlertTriangleIcon size={16} />
      ) : (
        <XCircleIcon size={16} />
      )}
      <span>API Disconnected</span>
      
      {/* Hover details */}
      <div className="invisible group-hover:visible absolute bottom-full right-0 mb-2 p-3 bg-gray-800 rounded-md text-xs w-64 shadow-xl">
        <div className="font-bold mb-1 text-red-400">Connection Error</div>
        <div className="mb-1">{health.error}</div>
        <div className="text-gray-400 mt-2">
          Make sure the echo-mcp-client API is running on port 8002
        </div>
      </div>
    </div>
  );
};

export default ApiHealthIndicator;
