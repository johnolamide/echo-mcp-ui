import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import {
  Bot,
  MessageSquare,
  Settings,
  Activity,
  Zap,
  Shield,
  Database,
  Wifi,
  WifiOff,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  TrendingUp
} from 'lucide-react';

// Mock agent data
const mockAgent = {
  id: 'agent-001',
  name: 'Echo Assistant',
  description: 'Your intelligent AI assistant for communication and task automation',
  status: 'online',
  version: '2.1.0',
  uptime: '7d 14h 32m',
  lastActive: '2 minutes ago',
  totalInteractions: 15432,
  activeConversations: 8,
  responseTime: '1.2s',
  memoryUsage: 68,
  cpuUsage: 45,
  services: [
    { name: 'Email Service', status: 'active', usage: 89 },
    { name: 'SMS Service', status: 'active', usage: 67 },
    { name: 'Payment Processor', status: 'maintenance', usage: 34 },
    { name: 'Weather Service', status: 'active', usage: 92 }
  ],
  recentActivities: [
    { id: 1, type: 'message', description: 'Processed customer inquiry', timestamp: '2 min ago' },
    { id: 2, type: 'service', description: 'Updated payment service', timestamp: '15 min ago' },
    { id: 3, type: 'system', description: 'Performed routine maintenance', timestamp: '1h ago' },
    { id: 4, type: 'message', description: 'Sent automated response', timestamp: '2h ago' },
    { id: 5, type: 'error', description: 'Handled API timeout gracefully', timestamp: '3h ago' }
  ]
};

const AgentDashboard = () => {
  const [agent, setAgent] = useState(mockAgent);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAgent, setEditedAgent] = useState(mockAgent);
  const [autoRestart, setAutoRestart] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4" />;
      case 'offline': return <WifiOff className="h-4 w-4" />;
      case 'maintenance': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleSaveChanges = () => {
    setAgent(editedAgent);
    setIsEditing(false);
  };

  const handleToggleStatus = () => {
    const newStatus = agent.status === 'online' ? 'offline' : 'online';
    setAgent({ ...agent, status: newStatus });
  };

  const handleRestart = () => {
    // Simulate restart
    setAgent({ ...agent, status: 'maintenance' });
    setTimeout(() => {
      setAgent({ ...agent, status: 'online' });
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Bot className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">{agent.name}</h1>
            <p className="text-xl text-muted-foreground">{agent.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className={getStatusColor(agent.status)}>
            <div className="flex items-center space-x-1">
              {getStatusIcon(agent.status)}
              <span className="capitalize">{agent.status}</span>
            </div>
          </Badge>

          <Button
            variant="outline"
            onClick={handleToggleStatus}
            disabled={agent.status === 'maintenance'}
          >
            {agent.status === 'online' ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start
              </>
            )}
          </Button>

          <Button variant="outline" onClick={handleRestart}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Restart
          </Button>

          <Button onClick={() => setIsEditing(!isEditing)}>
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
      </div>

      {/* Edit Mode */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border rounded-lg p-4 bg-muted/50"
        >
          <h3 className="font-medium mb-4">Edit Agent Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                value={editedAgent.name}
                onChange={(e) => setEditedAgent({...editedAgent, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editedAgent.description}
                onChange={(e) => setEditedAgent({...editedAgent, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>
                Save Changes
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.activeConversations}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.responseTime}</div>
            <p className="text-xs text-muted-foreground">
              -0.2s from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agent.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Last restart: 2 days ago
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time system performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Memory Usage</span>
                  <span>{agent.memoryUsage}%</span>
                </div>
                <Progress value={agent.memoryUsage} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>CPU Usage</span>
                  <span>{agent.cpuUsage}%</span>
                </div>
                <Progress value={agent.cpuUsage} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Active</p>
                  <p className="font-medium">{agent.lastActive}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Version</p>
                  <p className="font-medium">{agent.version}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Services Status */}
          <Card>
            <CardHeader>
              <CardTitle>Connected Services</CardTitle>
              <CardDescription>
                Status and usage of integrated services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agent.services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        service.status === 'active' ? 'bg-green-500' :
                        service.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{service.usage}%</span>
                      <Progress value={service.usage} className="w-20 h-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>
                Latest agent activities and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agent.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`p-1 rounded ${
                      activity.type === 'message' ? 'bg-blue-100' :
                      activity.type === 'service' ? 'bg-green-100' :
                      activity.type === 'system' ? 'bg-purple-100' :
                      'bg-red-100'
                    }`}>
                      {activity.type === 'message' && <MessageSquare className="h-3 w-3" />}
                      {activity.type === 'service' && <Settings className="h-3 w-3" />}
                      {activity.type === 'system' && <Activity className="h-3 w-3" />}
                      {activity.type === 'error' && <AlertCircle className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Settings</CardTitle>
              <CardDescription>
                Configure agent behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Restart</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically restart on failure
                  </p>
                </div>
                <Switch
                  checked={autoRestart}
                  onCheckedChange={setAutoRestart}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable agent responses
                  </p>
                </div>
                <Switch
                  checked={maintenanceMode}
                  onCheckedChange={setMaintenanceMode}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
