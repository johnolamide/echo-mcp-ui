import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import Chat from './Chat';
import ServiceMarketplace from './marketplace/ServiceMarketplace';
import AdminServicePanel from './admin/AdminServicePanel';
import AgentDashboard from './agent/AgentDashboard';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MessageSquare,
  Package,
  Settings,
  BarChart3,
  Users,
  Bell,
  LogOut,
  ChevronRight,
  Home,
  ShoppingBag,
  Shield,
  Bot,
  Menu,
  X
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleWidgetClick = (widget) => {
    switch (widget) {
      case 'service':
        setActiveView('marketplace');
        break;
      case 'chat':
        setActiveView('chat');
        break;
      case 'users':
        setActiveView('admin');
        break;
      case 'agent':
        setActiveView('agent-dashboard');
        break;
      default:
        setActiveView('dashboard');
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'orders':
        setActiveView('marketplace');
        break;
      case 'chat':
        setActiveView('chat');
        break;
      case 'users':
        setActiveView('admin');
        break;
      case 'agent':
        setActiveView('agent-dashboard');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  const stats = [
    { title: 'Active Orders', value: '24', change: '+12%', icon: Package },
    { title: 'Total Users', value: '1,243', change: '+5%', icon: Users },
    { title: 'Messages', value: '89', change: '+23%', icon: MessageSquare },
    { title: 'Revenue', value: '$12,426', change: '+8%', icon: BarChart3 },
  ];

  const quickActions = [
    { label: 'View Orders', description: 'Manage restaurant and store orders', action: 'orders', icon: Package },
    { label: 'Open Chat', description: 'Start real-time conversations', action: 'chat', icon: MessageSquare },
    { label: 'Agent Dashboard', description: 'Monitor and manage your AI agent', action: 'agent', icon: Bot },
    ...(user?.is_admin ? [{ label: 'User Stats', description: 'View platform statistics', action: 'users', icon: Users, isAdmin: true }] : []),
  ];

  const renderDashboardView = () => (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Welcome back, {user?.username}
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your restaurant orders, chat with users, and leverage AI assistance for various platform operations.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Feature Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {/* Chat Management */}
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWidgetClick('chat')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Real-time Chat</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Connect with other users, manage conversations, and track online status.
                </CardDescription>
                <div className="flex items-center mt-4 text-sm text-primary">
                  Open Chat <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Service Management */}
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWidgetClick('service')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Service Marketplace</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Browse and integrate powerful services to enhance your AI agent's capabilities.
                </CardDescription>
                <div className="flex items-center mt-4 text-sm text-primary">
                  Explore Services <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Agent Dashboard */}
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWidgetClick('agent')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Agent Dashboard</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  Monitor your AI agent's performance, manage services, and view real-time metrics.
                </CardDescription>
                <div className="flex items-center mt-4 text-sm text-primary">
                  View Dashboard <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* User Management - Admin Only */}
            {user?.is_admin && (
              <Card
                className="cursor-pointer transition-all hover:shadow-md border-orange-200 bg-gradient-to-br from-orange-50 to-red-50"
                onClick={() => handleWidgetClick('users')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        Admin Panel
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full">
                          Admin
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    Manage services, view statistics, and monitor platform performance.
                  </CardDescription>
                  <div className="flex items-center mt-4 text-sm text-primary">
                    Admin Panel <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription className="text-sm">
                Frequently used operations and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start h-auto p-3 ${
                      action.isAdmin ? 'border border-orange-200 bg-orange-50 hover:bg-orange-100' : ''
                    }`}
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-left">
                        <div className="font-medium text-sm flex items-center">
                          {action.label}
                          {action.isAdmin && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Assistant Card */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white text-lg">AI Assistant</CardTitle>
              <CardDescription className="text-blue-100 text-sm">
                Get intelligent help with platform operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100 mb-4">
                Use the floating AI button to get contextual assistance with any task.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-200">Always available</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feature Cards */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chat Management */}
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWidgetClick('chat')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Real-time Chat</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with other users, manage conversations, and track online status.
                </CardDescription>
                <div className="flex items-center mt-4 text-sm text-primary">
                  Open Chat <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Service Management */}
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWidgetClick('service')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Package className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Service Marketplace</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Browse and integrate powerful services to enhance your AI agent's capabilities.
                </CardDescription>
                <div className="flex items-center mt-4 text-sm text-primary">
                  Explore Services <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* Agent Dashboard */}
            <Card
              className="cursor-pointer transition-all hover:shadow-md"
              onClick={() => handleWidgetClick('agent')}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Agent Dashboard</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Monitor your AI agent's performance, manage services, and view real-time metrics.
                </CardDescription>
                <div className="flex items-center mt-4 text-sm text-primary">
                  View Dashboard <ChevronRight className="h-4 w-4 ml-1" />
                </div>
              </CardContent>
            </Card>

            {/* User Management - Admin Only */}
            {user?.is_admin && (
              <Card
                className="cursor-pointer transition-all hover:shadow-md border-orange-200 bg-gradient-to-br from-orange-50 to-red-50"
                onClick={() => handleWidgetClick('users')}
              >
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Users className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center">
                        Admin Panel
                        <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full">
                          Admin
                        </span>
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Manage services, view statistics, and monitor platform performance.
                  </CardDescription>
                  <div className="flex items-center mt-4 text-sm text-primary">
                    Admin Panel <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used operations and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start h-auto p-3 ${
                      action.isAdmin ? 'border border-orange-200 bg-orange-50 hover:bg-orange-100' : ''
                    }`}
                    onClick={() => handleQuickAction(action.action)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground" />
                      <div className="text-left">
                        <div className="font-medium text-sm flex items-center">
                          {action.label}
                          {action.isAdmin && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-200 text-orange-800 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {action.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* AI Assistant Card */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">AI Assistant</CardTitle>
              <CardDescription className="text-blue-100">
                Get intelligent help with platform operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-100 mb-4">
                Use the floating AI button to get contextual assistance with any task.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-blue-200">Always available</span>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );

  const renderChatView = () => (
    <motion.div
      key="chat"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 md:mb-6">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
          Real-time Chat
        </h2>
        <p className="text-sm md:text-base text-muted-foreground">
          Connect and communicate with other users in real-time using WebSocket technology.
        </p>
      </div>
      <Chat />
    </motion.div>
  );

  const renderMarketplaceView = () => (
    <motion.div
      key="marketplace"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ServiceMarketplace />
    </motion.div>
  );

  const renderAdminView = () => (
    <motion.div
      key="admin"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AdminServicePanel />
    </motion.div>
  );

  const renderAgentDashboardView = () => (
    <motion.div
      key="agent-dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <AgentDashboard />
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Echo MCP</h1>
            {user?.is_admin && (
              <span className="hidden sm:inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                Admin
              </span>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('dashboard')}
              className="flex items-center space-x-2"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant={activeView === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('chat')}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chat</span>
            </Button>
            <Button
              variant={activeView === 'marketplace' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('marketplace')}
              className="flex items-center space-x-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Marketplace</span>
            </Button>
            <Button
              variant={activeView === 'agent-dashboard' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView('agent-dashboard')}
              className="flex items-center space-x-2"
            >
              <Bot className="h-4 w-4" />
              <span>Agent</span>
            </Button>
            {user?.is_admin && (
              <Button
                variant={activeView === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveView('admin')}
                className="flex items-center space-x-2"
              >
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            )}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Bell className="h-4 w-4" />
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} alt={user?.username} />
              <AvatarFallback>
                {user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" onClick={logout} size="sm" className="hidden sm:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t bg-background/95 backdrop-blur"
            >
              <div className="container px-4 py-4 space-y-2">
                <Button
                  variant={activeView === 'dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveView('dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant={activeView === 'chat' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveView('chat');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat
                </Button>
                <Button
                  variant={activeView === 'marketplace' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveView('marketplace');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Marketplace
                </Button>
                <Button
                  variant={activeView === 'agent-dashboard' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    setActiveView('agent-dashboard');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Agent
                </Button>
                {user?.is_admin && (
                  <Button
                    variant={activeView === 'admin' ? 'default' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveView('admin');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                )}
                <div className="border-t pt-2 mt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="container px-4 py-6 md:py-8">
        <AnimatePresence mode="wait">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'chat' && renderChatView()}
          {activeView === 'marketplace' && renderMarketplaceView()}
          {activeView === 'admin' && renderAdminView()}
          {activeView === 'agent-dashboard' && renderAgentDashboardView()}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
