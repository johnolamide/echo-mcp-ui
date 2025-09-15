import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAgent } from '../contexts/AgentContext';
import ServiceMarketplace from '../components/ServiceMarketplace';
import AdminServicePanel from '../components/AdminServicePanel';
import AgentChat from '../components/AgentChat';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isOpen, toggleModal, sendMessage, messages, loading } = useAgent();
  const [activeTab, setActiveTab] = useState('chat');

  const handleLogout = () => {
    logout();
  };

  // Check if user is admin (you can adjust this logic based on your user model)
  const isAdmin = user?.is_admin || user?.role === 'admin';

  const tabs = [
    { id: 'chat', name: 'Agent Chat', icon: '🤖' },
    { id: 'marketplace', name: 'Service Marketplace', icon: '🛒' },
    ...(isAdmin ? [{ id: 'admin', name: 'Admin Panel', icon: '⚙️' }] : [])
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <AgentChat />;
      case 'marketplace':
        return <ServiceMarketplace />;
      case 'admin':
        return isAdmin ? <AdminServicePanel /> : <div>Access denied</div>;
      default:
        return <AgentChat />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Echo MCP Dashboard</h1>
              <p className="text-gray-600 mt-1">
                Welcome back, <span className="font-medium">{user?.username}</span>
                {isAdmin && <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">Admin</span>}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-500">
                User ID: {user?.id}
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'chat' ? (
            <div className="h-[calc(100vh-300px)]">
              {renderTabContent()}
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
