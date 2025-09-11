import { serverAPI } from '../apiClient';

/**
 * Order/Service API service
 * Direct integration with echo-mcp-server Bolt Food/Stores endpoints
 */

const orderAPI = {
  // ========== Bolt Food API ==========
  
  /**
   * Get restaurant menu
   */
  getRestaurantMenu: async (providerId) => {
    try {
      const response = await serverAPI.get(`/api/bolt-food/menu/${providerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Accept food order (for restaurant providers)
   */
  acceptFoodOrder: async (orderId, providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-food/orders/${orderId}/accept`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reject food order (for restaurant providers)
   */
  rejectFoodOrder: async (orderId, providerId, reason) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-food/orders/${orderId}/reject`,
        { 
          provider_id: providerId,
          reason: reason 
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark food order as ready
   */
  markFoodOrderReady: async (orderId, providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-food/orders/${orderId}/ready`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Start accepting food orders
   */
  startAcceptingFoodOrders: async (providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-food/providers/${providerId}/start-accepting`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Pause food orders
   */
  pauseFoodOrders: async (providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-food/providers/${providerId}/pause`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========== Bolt Stores API ==========

  /**
   * Get store menu/products
   */
  getStoreMenu: async (providerId) => {
    try {
      const response = await serverAPI.get(`/api/bolt-stores/menu/${providerId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Accept store order
   */
  acceptStoreOrder: async (orderId, providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-stores/orders/${orderId}/accept`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Reject store order
   */
  rejectStoreOrder: async (orderId, providerId, reason) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-stores/orders/${orderId}/reject`,
        { 
          provider_id: providerId,
          reason: reason 
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Mark store order as ready
   */
  markStoreOrderReady: async (orderId, providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-stores/orders/${orderId}/ready`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Start accepting store orders
   */
  startAcceptingStoreOrders: async (providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-stores/providers/${providerId}/start-accepting`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Pause store orders
   */
  pauseStoreOrders: async (providerId) => {
    try {
      const response = await serverAPI.post(
        `/api/bolt-stores/providers/${providerId}/pause`,
        { provider_id: providerId }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // ========== Demo/Sample Data ==========

  /**
   * Get demo food menu samples
   */
  getDemoFoodMenu: async () => {
    try {
      const response = await serverAPI.get('/api/bolt-demo/samples/bolt-food/menu');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get demo food order samples
   */
  getDemoFoodOrders: async () => {
    try {
      const response = await serverAPI.get('/api/bolt-demo/samples/bolt-food/order-management');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get demo store products
   */
  getDemoStoreProducts: async () => {
    try {
      const response = await serverAPI.get('/api/bolt-demo/samples/bolt-stores/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get demo store pricing
   */
  getDemoStorePricing: async () => {
    try {
      const response = await serverAPI.get('/api/bolt-demo/samples/bolt-stores/pricing');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get test endpoints
   */
  getTestEndpoints: async () => {
    try {
      const response = await serverAPI.get('/api/bolt-demo/test-endpoints');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default orderAPI;
