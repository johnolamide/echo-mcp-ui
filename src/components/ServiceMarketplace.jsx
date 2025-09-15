import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:8000';

const ServiceMarketplace = () => {
  const [services, setServices] = useState([]);
  const [userServices, setUserServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchServices();
    if (user) {
      fetchUserServices();
    }
  }, [user]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // API returns: { status, message, data: { services: [], total, active_count } }
        setServices(data.data?.services || []);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserServices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/agent/services`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // API returns: { status, message, data: { services: [] } }
        setUserServices(data.data?.services || []);
      }
    } catch (error) {
      console.error('Error fetching user services:', error);
    }
  };

  const addServiceToAgent = async (serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/agent/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ service_id: serviceId })
      });

      if (response.ok) {
        fetchUserServices(); // Refresh user services
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to add service');
      }
    } catch (error) {
      console.error('Error adding service:', error);
      setError('Failed to add service to agent');
    }
  };

  const removeServiceFromAgent = async (serviceId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/agent/services/${serviceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        fetchUserServices(); // Refresh user services
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to remove service');
      }
    } catch (error) {
      console.error('Error removing service:', error);
      setError('Failed to remove service from agent');
    }
  };

  const isServiceAdded = (serviceId) => {
    return (userServices || []).some(us => us.service_id === serviceId && us.is_active);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Service Marketplace</h2>
        <p className="text-gray-600">Browse and add services to your AI agent</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {services.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No services available</div>
          <p className="text-gray-400 mt-2">Check back later for new services</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(services || []).map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  service.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {service.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <p className="text-gray-600 mb-4 text-sm">{service.description}</p>

              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">
                  <strong>Category:</strong> {service.category}
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  <strong>API URL:</strong> <code className="bg-gray-100 px-1 rounded">{service.api_url}</code>
                </div>
                {service.auth_type && (
                  <div className="text-sm text-gray-500">
                    <strong>Auth:</strong> {service.auth_type}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                {isServiceAdded(service.id) ? (
                  <button
                    onClick={() => removeServiceFromAgent(service.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Remove from Agent
                  </button>
                ) : (
                  <button
                    onClick={() => addServiceToAgent(service.id)}
                    disabled={!service.is_active}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Add to Agent
                  </button>
                )}
                
                <div className="text-xs text-gray-400">
                  ID: {service.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {(userServices || []).length > 0 && (
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Agent's Services</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid gap-2">
              {(userServices || []).filter(us => us.is_active).map((userService) => {
                const service = (services || []).find(s => s.id === userService.service_id);
                return service ? (
                  <div key={userService.id} className="flex items-center justify-between bg-white p-3 rounded-md">
                    <div>
                      <span className="font-medium">{service.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({service.category})</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      Added: {new Date(userService.added_at).toLocaleDateString()}
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceMarketplace;
