import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import {
  Search,
  Star,
  ShoppingCart,
  CheckCircle,
  MessageSquare,
  CreditCard,
  Truck,
  Phone,
  Mail,
  Wifi,
  Zap,
  Filter
} from 'lucide-react';

// Mock service data - in real app, this would come from API
const mockServices = [
  {
    id: 1,
    name: 'Email Service',
    description: 'Send and receive emails through your agent',
    category: 'Communication',
    icon: Mail,
    rating: 4.8,
    reviews: 1247,
    price: 'Free',
    features: ['SMTP Integration', 'Email Templates', 'Auto-responders'],
    isInstalled: false
  },
  {
    id: 2,
    name: 'SMS Service',
    description: 'Send text messages via your agent',
    category: 'Communication',
    icon: Phone,
    rating: 4.6,
    reviews: 892,
    price: '$0.02/message',
    features: ['Bulk SMS', 'Delivery Reports', 'International Support'],
    isInstalled: true
  },
  {
    id: 3,
    name: 'Payment Processor',
    description: 'Handle payments and transactions',
    category: 'Finance',
    icon: CreditCard,
    rating: 4.9,
    reviews: 2156,
    price: '2.9% + $0.30',
    features: ['Multiple Currencies', 'Fraud Protection', 'Instant Settlements'],
    isInstalled: false
  },
  {
    id: 4,
    name: 'Delivery Tracking',
    description: 'Track packages and shipments',
    category: 'Logistics',
    icon: Truck,
    rating: 4.7,
    reviews: 1543,
    price: '$0.50/tracking',
    features: ['Real-time Updates', 'Multiple Carriers', 'Delivery Notifications'],
    isInstalled: false
  },
  {
    id: 5,
    name: 'Weather Service',
    description: 'Get weather information and forecasts',
    category: 'Information',
    icon: Wifi,
    rating: 4.5,
    reviews: 678,
    price: 'Free',
    features: ['Current Conditions', '7-day Forecast', 'Weather Alerts'],
    isInstalled: true
  },
  {
    id: 6,
    name: 'Task Automation',
    description: 'Automate repetitive tasks and workflows',
    category: 'Productivity',
    icon: Zap,
    rating: 4.8,
    reviews: 987,
    price: '$9.99/month',
    features: ['Workflow Builder', 'API Integration', 'Scheduled Tasks'],
    isInstalled: false
  }
];

const categories = ['All', 'Communication', 'Finance', 'Logistics', 'Information', 'Productivity'];

const ServiceMarketplace = () => {
  const [services, setServices] = useState(mockServices);
  const [filteredServices, setFilteredServices] = useState(mockServices);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [installingService, setInstallingService] = useState(null);

  useEffect(() => {
    let filtered = services;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  }, [services, selectedCategory, searchTerm]);

  const handleInstallService = async (serviceId) => {
    setInstallingService(serviceId);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setServices(prevServices =>
      prevServices.map(service =>
        service.id === serviceId
          ? { ...service, isInstalled: true }
          : service
      )
    );

    setInstallingService(null);
  };

  const handleUninstallService = async (serviceId) => {
    setInstallingService(serviceId);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setServices(prevServices =>
      prevServices.map(service =>
        service.id === serviceId
          ? { ...service, isInstalled: false }
          : service
      )
    );

    setInstallingService(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Service Marketplace
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover and integrate powerful services to enhance your AI agent's capabilities
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        layout
      >
        <AnimatePresence>
          {filteredServices.map((service) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{service.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {service.category}
                          </Badge>
                        </div>
                      </div>
                      {service.isInstalled && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <CardDescription className="mt-2">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* Rating */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium ml-1">{service.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({service.reviews} reviews)
                      </span>
                    </div>

                    {/* Features */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-2">Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {service.features.slice(0, 2).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                            {feature}
                          </li>
                        ))}
                        {service.features.length > 2 && (
                          <li className="text-primary text-xs">
                            +{service.features.length - 2} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Price and Action */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-primary">
                          {service.price}
                        </span>
                      </div>

                      <Button
                        className="w-full"
                        variant={service.isInstalled ? 'outline' : 'default'}
                        onClick={() => service.isInstalled
                          ? handleUninstallService(service.id)
                          : handleInstallService(service.id)
                        }
                        disabled={installingService === service.id}
                      >
                        {installingService === service.id ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span>{service.isInstalled ? 'Uninstalling...' : 'Installing...'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {service.isInstalled ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Installed</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4" />
                                <span>Add to Agent</span>
                              </>
                            )}
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredServices.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No services found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ServiceMarketplace;
