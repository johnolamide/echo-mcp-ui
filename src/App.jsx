import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AgentProvider } from './contexts/AgentContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './components/Dashboard';
import AgentButton from './components/agent/AgentButton';
import AgentModal from './components/agent/AgentModal';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Auth Page Component
const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      {showLogin ? (
        <LoginForm 
          onSwitchToRegister={() => setShowLogin(false)}
        />
      ) : (
        <RegisterForm 
          onSwitchToLogin={() => setShowLogin(true)}
        />
      )}
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <AgentProvider>
        <Router>
          <div className="App w-full min-h-screen">
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                    <AgentButton />
                    <AgentModal />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AgentProvider>
    </AuthProvider>
  );
}

export default App;
