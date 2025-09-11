import { useEffect, useState } from 'react';
import apiClient from '../services/api/apiClient';

/**
 * Custom hook to check the API health when the application loads
 * @returns {Object} API health status
 */
const useApiHealth = () => {
  const [health, setHealth] = useState({
    isChecked: false,
    isHealthy: false,
    message: 'Checking API connection...',
    details: null,
    error: null,
  });

  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Call the health check endpoint
        const response = await apiClient.get('/health');
        console.log('API Health Check Response:', response.data);
        
        setHealth({
          isChecked: true,
          isHealthy: response.data.status === 'healthy',
          message: `API is ${response.data.status === 'healthy' ? 'connected' : 'unhealthy'}`,
          details: response.data,
          error: null,
        });
      } catch (error) {
        console.error('API Health Check Failed:', error);
        
        setHealth({
          isChecked: true,
          isHealthy: false,
          message: 'Failed to connect to the API',
          details: null,
          error: error.message || 'Unknown error',
        });
        
        // Fallback to checking the root endpoint
        try {
          const rootResponse = await apiClient.get('/');
          console.log('API Root Endpoint Response:', rootResponse.data);
          
          setHealth({
            isChecked: true,
            isHealthy: true,
            message: 'API is available but health check failed',
            details: rootResponse.data,
            error: error.message || 'Health check endpoint not available',
          });
        } catch (rootError) {
          console.error('API Root Endpoint Check Failed:', rootError);
        }
      }
    };

    checkApiHealth();
  }, []);

  return health;
};

export default useApiHealth;
