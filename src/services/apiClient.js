import axios from 'axios';

/**
 * Base API client configuration
 */

// Echo MCP Server client (main backend)
export const serverAPI = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Echo MCP Client (AI Agent)
export const agentAPI = axios.create({
  baseURL: import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8002',
  timeout: 30000, // AI responses can take longer
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
serverAPI.interceptors.request.use(
  (config) => {
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

// Response interceptor to handle auth errors
serverAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Agent API doesn't need auth for now
agentAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Agent API Error:', error);
    return Promise.reject(error);
  }
);

export default { serverAPI, agentAPI };
