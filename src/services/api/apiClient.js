import axios from 'axios';

// Define the API base URL - point to the echo-mcp-client API
const API_BASE_URL = import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8002';

console.log(`Configuring API client to use base URL: ${API_BASE_URL}`);

// Create an axios instance with default configs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased timeout to 60 seconds for potentially longer API operations
  withCredentials: false, // For CORS support
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // Add authorization header if user is logged in
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error statuses
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          localStorage.removeItem('auth_token');
          // You can add redirection logic here
          break;
        case 429:
          // Rate limiting
          console.warn('Rate limit exceeded. Please try again later.');
          break;
        default:
          break;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
