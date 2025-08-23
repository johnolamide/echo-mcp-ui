import axios from 'axios';

// Define the API base URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.echo-mcp.com' // Replace with your production API URL
  : 'http://localhost:3000'; // Replace with your local development API URL

// Create an axios instance with default configs
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
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
