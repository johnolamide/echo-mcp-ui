import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AgentProvider, useAgent } from './contexts/AgentContext';
import { UserChatProvider } from './contexts/UserChatContext';
import AgentChat from './components/AgentChat';
import ServiceMarketplace from './components/ServiceMarketplace';
import AdminServicePanel from './components/AdminServicePanel';
import UserList from './components/UserList';
import DirectMessage from './components/DirectMessage';

// API Configuration
const API_CONFIG = {
  serverUrl: import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000',
  agentUrl: import.meta.env.VITE_AGENT_API_URL || 'http://localhost:8002',
};

// Registration Component
const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    setMessage(`Creating account for: ${username}...`);
    
    try {
      const response = await fetch(`${API_CONFIG.serverUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        setMessage('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Connection error. Please check if the server is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Create Echo MCP Account</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your desired username"
              required
              disabled={isLoading}
              minLength={3}
              maxLength={50}
              pattern="[a-zA-Z0-9_-]+"
              title="Username can only contain letters, numbers, underscores, and hyphens"
            />
            <p className="text-xs text-gray-500 mt-1">3-50 characters, letters, numbers, underscore, hyphen only</p>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

// Login Component
const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    setMessage(`Logging in as: ${username}...`);
    
    try {
      const response = await fetch(`${API_CONFIG.serverUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.status === 'success') {
        // Store tokens and user data
        localStorage.setItem('access_token', data.data.access_token);
        localStorage.setItem('refresh_token', data.data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));
        
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      } else {
        setMessage(data.message || 'Login failed. Please check your username.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('Connection error. Please check if the server is running.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-4">Echo MCP Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your username"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
        <div className="mt-4 text-center">
          <button
            onClick={() => navigate('/register')}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            Don't have an account? Create one
          </button>
        </div>
        <p className="mt-4 text-center text-sm text-gray-500">
          Server Status: Connected to {API_CONFIG.serverUrl}
        </p>
      </div>
    </div>
  );
};

// Dashboard Component with Tabbed Interface
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [serverStatus, setServerStatus] = useState('checking...');
  const [agentStatus, setAgentStatus] = useState('checking...');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAgentModal, setShowAgentModal] = useState(false);

  const {
    useWebSocket,
    connectAgent,
    disconnectAgent
  } = useAgent();

  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Check if user is logged in when component mounts
  React.useEffect(() => {
    let isMounted = true;

    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      if (isMounted) {
        setUser(parsedUser);

        // Check server and agent status (only once)
        if (!isCheckingStatus) {
          checkServiceStatus();
        }

        // Connect to agent if WebSocket mode is enabled
        if (useWebSocket && parsedUser) {
          connectAgent();
        }
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }

    return () => {
      isMounted = false;
    };
  }, [navigate, useWebSocket, connectAgent, isCheckingStatus]);

  // Function to check service status
  const checkServiceStatus = async () => {
    if (isCheckingStatus) return; // Prevent multiple simultaneous calls

    setIsCheckingStatus(true);

    try {
      // Check server status with timeout
      const serverController = new AbortController();
      const serverTimeoutId = setTimeout(() => serverController.abort(), 5000); // 5 second timeout

      try {
        const serverResponse = await fetch(`${API_CONFIG.serverUrl}/health`, {
          signal: serverController.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        clearTimeout(serverTimeoutId);

        if (serverResponse.ok) {
          setServerStatus('healthy');
        } else {
          setServerStatus('error');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Server health check timed out');
        } else {
          console.error('Server health check failed:', error);
        }
        setServerStatus('error');
      }
    } catch (error) {
      console.error('Error checking server status:', error);
      setServerStatus('error');
    }

    // Small delay before checking agent to reduce load
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Check agent status with timeout
      const agentController = new AbortController();
      const agentTimeoutId = setTimeout(() => agentController.abort(), 5000); // 5 second timeout

      try {
        const agentResponse = await fetch(`${API_CONFIG.agentUrl}/health`, {
          signal: agentController.signal,
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        clearTimeout(agentTimeoutId);

        if (agentResponse.ok) {
          setAgentStatus('healthy');
        } else {
          setAgentStatus('error');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Agent health check timed out');
        } else {
          console.error('Agent health check failed:', error);
        }
        setAgentStatus('error');
      }
    } catch (error) {
      console.error('Error checking agent status:', error);
      setAgentStatus('error');
    }

    setIsCheckingStatus(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    disconnectAgent();
    navigate('/login');
  };

  const isAdmin = user?.is_admin || false;

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'marketplace', label: 'Service Marketplace', icon: '🛍️' },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Panel', icon: '⚙️' }] : [])
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Echo MCP</h1>
              <div className="ml-4 flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    serverStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Server</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    agentStatus === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm text-gray-600">Agent</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              {isAdmin && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Admin
                </span>
              )}
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Tab Content */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">User Chat</h2>
                <p className="text-lg text-gray-600">
                  Connect and chat with other users in real-time
                </p>
              </div>

              {/* User Chat Components */}
              <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <UserList
                      onUserSelect={(user) => setSelectedUser(user)}
                      selectedUserId={selectedUser?.id}
                    />
                  </div>
                  <div className="lg:col-span-2">
                    <DirectMessage
                      selectedUser={selectedUser}
                      onBack={() => setSelectedUser(null)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'marketplace' && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Marketplace</h2>
                <p className="text-lg text-gray-600">
                  Browse and add services to enhance your AI agent's capabilities
                </p>
              </div>

              {/* Service Marketplace Component */}
              <ServiceMarketplace />
            </div>
          )}

          {activeTab === 'admin' && isAdmin && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h2>
                <p className="text-lg text-gray-600">
                  Manage services and oversee the Echo MCP platform
                </p>
              </div>

              {/* Admin Service Panel Component */}
              <AdminServicePanel />
            </div>
          )}
        </div>
      </div>

      {/* Floating AI Agent Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowAgentModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-110"
          title="Chat with AI Agent"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* AI Agent Modal */}
      {showAgentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAgentModal(false)}
            ></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Modal header */}
              <div className="bg-indigo-600 px-4 py-3 sm:px-6 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="ml-2 text-lg leading-6 font-medium text-white">
                    AI Agent Chat
                  </h3>
                </div>
                <button
                  onClick={() => setShowAgentModal(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal body */}
              <div className="bg-white px-4 py-4 sm:p-6 max-h-96 overflow-y-auto">
                <AgentChat />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AgentProvider>
        <UserChatProvider>
          <Router>
            <Routes>
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/" element={<LoginForm />} />
            </Routes>
          </Router>
        </UserChatProvider>
      </AgentProvider>
    </AuthProvider>
  );
};

export default App;
