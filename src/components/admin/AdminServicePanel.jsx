import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Users,
  Activity,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';

// Mock service data for admin management
const mockManagedServices = [
  {
    id: 1,
    name: 'Email Service',
    description: 'Send and receive emails through your agent',
    category: 'Communication',
    status: 'active',
    version: '2.1.0',
    users: 1247,
    uptime: '99.9%',
    lastUpdated: '2024-01-15',
    apiCalls: 45632,
    revenue: '$2,340.50'
  },
  {
    id: 2,
    name: 'SMS Service',
    description: 'Send text messages via your agent',
    category: 'Communication',
    status: 'maintenance',
    version: '1.8.3',
    users: 892,
    uptime: '95.2%',
    lastUpdated: '2024-01-10',
    apiCalls: 28941,
    revenue: '$1,156.80'
  },
  {
    id: 3,
    name: 'Payment Processor',
    description: 'Handle payments and transactions',
    category: 'Finance',
    status: 'active',
    version: '3.0.1',
    users: 2156,
    uptime: '99.8%',
    lastUpdated: '2024-01-20',
    apiCalls: 78923,
    revenue: '$8,945.20'
  }
];

const AdminServicePanel = () => {
  const [services, setServices] = useState(mockManagedServices);
  const [selectedService, setSelectedService] = useState(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    description: '',
    category: '',
    version: '',
    status: 'active'
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <AlertTriangle className="h-4 w-4" />;
      case 'inactive': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleCreateService = () => {
    const service = {
      ...newService,
      id: services.length + 1,
      users: 0,
      uptime: '100%',
      lastUpdated: new Date().toISOString().split('T')[0],
      apiCalls: 0,
      revenue: '$0.00'
    };
    setServices([...services, service]);
    setNewService({
      name: '',
      description: '',
      category: '',
      version: '',
      status: 'active'
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditService = () => {
    setServices(services.map(service =>
      service.id === selectedService.id ? selectedService : service
    ));
    setIsEditDialogOpen(false);
    setSelectedService(null);
  };

  const handleDeleteService = (serviceId) => {
    setServices(services.filter(service => service.id !== serviceId));
  };

  const handleStatusChange = (serviceId, newStatus) => {
    setServices(services.map(service =>
      service.id === serviceId ? { ...service, status: newStatus } : service
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Service Management</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Monitor and manage your deployed services
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>
                Add a new service to your marketplace
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Service Name</label>
                <Input
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="Enter service name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Enter service description"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newService.category} onValueChange={(value) => setNewService({...newService, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Communication">Communication</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Information">Information</SelectItem>
                    <SelectItem value="Productivity">Productivity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input
                  value={newService.version}
                  onChange={(e) => setNewService({...newService, version: e.target.value})}
                  placeholder="e.g., 1.0.0"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateService}>
                  Create Service
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.reduce((sum, service) => sum + service.users, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${services.reduce((sum, service) => {
                const revenue = parseFloat(service.revenue.replace(/[$,]/g, ''));
                return sum + revenue;
              }, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Uptime</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.7%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Service Overview</CardTitle>
          <CardDescription>
            Manage your deployed services and monitor their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{service.name}</h3>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <Badge className={getStatusColor(service.status)}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(service.status)}
                        <span className="capitalize">{service.status}</span>
                      </div>
                    </Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedService(service);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Version</p>
                    <p className="font-medium">{service.version}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Users</p>
                    <p className="font-medium">{service.users.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Uptime</p>
                    <p className="font-medium">{service.uptime}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">API Calls</p>
                    <p className="font-medium">{service.apiCalls.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Revenue</p>
                    <p className="font-medium">{service.revenue}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p className="font-medium">{service.lastUpdated}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Select
                    value={service.status}
                    onValueChange={(value) => handleStatusChange(service.id, value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service information and settings
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Service Name</label>
                <Input
                  value={selectedService.name}
                  onChange={(e) => setSelectedService({...selectedService, name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={selectedService.description}
                  onChange={(e) => setSelectedService({...selectedService, description: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Version</label>
                <Input
                  value={selectedService.version}
                  onChange={(e) => setSelectedService({...selectedService, version: e.target.value})}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditService}>
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServicePanel;
