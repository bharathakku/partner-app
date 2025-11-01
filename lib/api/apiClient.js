// Shared API client utilities for partner app
// This follows the same pattern as the admin panel for consistency

// Ensure base URL is correctly formatted
const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4001';

// Helper to clean up URL formatting
const cleanUrl = (url) => {
  try {
    // Remove trailing slashes
    return (url || '').replace(/\/+$/, '');
  } catch (e) {
    console.error('Error cleaning URL:', e);
    return url;
  }
};

// Ensure the base includes '/api' suffix
export const API_BASE_URL = (() => {
  const base = cleanUrl(RAW_API_BASE);
  return base.endsWith('/api') ? base : `${base}/api`;
})();

// API response wrapper - consistent with admin panel
class ApiResponse {
  constructor(data, success = true, message = '', errors = []) {
    this.data = data;
    this.success = success;
    this.message = message;
    this.errors = errors;
    this.timestamp = new Date().toISOString();
  }

  static success(data, message = 'Success') {
    return new ApiResponse(data, true, message);
  }

  static error(message = 'Error', errors = [], data = null) {
    return new ApiResponse(data, false, message, errors);
  }
}

// HTTP client with error handling - consistent with admin panel
class HttpClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = cleanUrl(baseURL);
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  setAuthToken(token) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    let token = null;
    if (typeof window !== 'undefined') {
      try { token = localStorage.getItem('auth_token') || null } catch {}
    }
    // Detect FormData to avoid forcing JSON content-type
    const isForm = (typeof FormData !== 'undefined') && (options?.body instanceof FormData);
    const headers = {
      ...this.defaultHeaders,
      ...(options.headers || {})
    };
    if (isForm && headers['Content-Type']) {
      // Let the browser set multipart boundary
      delete headers['Content-Type'];
    }
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
      credentials: 'include', // Important for cookies
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`, { config });
      const response = await fetch(url, config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        let errorData = {};
        let rawText = '';
        try {
          rawText = await response.text();
          errorData = rawText ? JSON.parse(rawText) : {};
        } catch (e) {
          // Keep raw text for visibility when JSON parse fails
          errorData = { message: rawText || null };
        }
        const error = new Error(errorData.message || errorData.error || `HTTP ${response.status} ${response.statusText}`);
        error.status = response.status;
        error.response = errorData;
        throw error;
      }

      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return null;
      }

      // Parse and return the successful response
      try {
        const data = await response.json();
        return data;
      } catch (e) {
        // Fallback to text for endpoints that return plain text
        try {
          const txt = await response.text();
          return txt ? { data: txt } : null;
        } catch {}
        console.warn('Failed to parse JSON response:', e);
        return null;
      }
    } catch (error) {
      console.error('API Request failed:', {
        url,
        error: error.message,
        status: error.status,
        response: error.response
      });
      
      // Add more context to the error
      error.endpoint = endpoint;
      error.config = config;
      throw error;
    }
  }

  async get(endpoint, params = {}) {
    const queryString = Object.keys(params).length 
      ? '?' + new URLSearchParams(params).toString()
      : '';
    
    return this.request(endpoint + queryString, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create default client instance
export const apiClient = new HttpClient();

// Generic CRUD operations - consistent with admin panel
export class CrudService {
  constructor(resource) {
    this.resource = resource;
    this.client = apiClient;
  }

  async getAll(params = {}) {
    try {
      const response = await this.client.get(`/${this.resource}`, params);
      return ApiResponse.success(response.data, 'Data retrieved successfully');
    } catch (error) {
      return ApiResponse.error(`Failed to fetch ${this.resource}`, [error.message]);
    }
  }

  async getById(id) {
    try {
      const response = await this.client.get(`/${this.resource}/${id}`);
      return ApiResponse.success(response.data, 'Item retrieved successfully');
    } catch (error) {
      return ApiResponse.error(`Failed to fetch ${this.resource} with ID ${id}`, [error.message]);
    }
  }

  async create(data) {
    try {
      const response = await this.client.post(`/${this.resource}`, data);
      return ApiResponse.success(response.data, 'Item created successfully');
    } catch (error) {
      return ApiResponse.error(`Failed to create ${this.resource}`, [error.message]);
    }
  }

  async update(id, data) {
    try {
      const response = await this.client.put(`/${this.resource}/${id}`, data);
      return ApiResponse.success(response.data, 'Item updated successfully');
    } catch (error) {
      return ApiResponse.error(`Failed to update ${this.resource} with ID ${id}`, [error.message]);
    }
  }

  async patch(id, data) {
    try {
      const response = await this.client.patch(`/${this.resource}/${id}`, data);
      return ApiResponse.success(response.data, 'Item updated successfully');
    } catch (error) {
      return ApiResponse.error(`Failed to update ${this.resource} with ID ${id}`, [error.message]);
    }
  }

  async delete(id) {
    try {
      await this.client.delete(`/${this.resource}/${id}`);
      return ApiResponse.success(null, 'Item deleted successfully');
    } catch (error) {
      return ApiResponse.error(`Failed to delete ${this.resource} with ID ${id}`, [error.message]);
    }
  }
}

// Partner-specific services
export class PartnerService extends CrudService {
  constructor() {
    super('partners');
  }

  async getProfile() {
    try {
      const response = await this.client.get('/partner/profile');
      return ApiResponse.success(response.data, 'Profile retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Failed to get profile', [error.message]);
    }
  }

  async updateProfile(data) {
    try {
      const response = await this.client.put('/partner/profile', data);
      return ApiResponse.success(response.data, 'Profile updated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to update profile', [error.message]);
    }
  }

  async updateLocation(location) {
    try {
      const response = await this.client.patch('/partner/location', { location });
      return ApiResponse.success(response.data, 'Location updated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to update location', [error.message]);
    }
  }

  async toggleOnlineStatus() {
    try {
      const response = await this.client.post('/partner/toggle-status');
      return ApiResponse.success(response.data, 'Status updated successfully');
    } catch (error) {
      return ApiResponse.error('Failed to update status', [error.message]);
    }
  }

  async uploadDocument(documentType, file) {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', documentType);
      
      const response = await this.client.request('/partner/documents', {
        method: 'POST',
        body: formData,
        headers: {} // Remove content-type to let browser set it for FormData
      });
      
      return ApiResponse.success(response.data, 'Document uploaded successfully');
    } catch (error) {
      return ApiResponse.error('Failed to upload document', [error.message]);
    }
  }

  async getDocuments() {
    try {
      const response = await this.client.get('/partner/documents');
      return ApiResponse.success(response.data, 'Documents retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Failed to get documents', [error.message]);
    }
  }
}

export class OrdersService extends CrudService {
  constructor() {
    super('orders');
  }

  async getAvailableOrders(params = {}) {
    try {
      const response = await this.client.get('/orders/available', params);
      return ApiResponse.success(response.data, 'Available orders retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get available orders', [error.message]);
    }
  }

  async acceptOrder(orderId) {
    try {
      const response = await this.client.post(`/orders/${orderId}/accept`);
      return ApiResponse.success(response.data, 'Order accepted successfully');
    } catch (error) {
      return ApiResponse.error('Failed to accept order', [error.message]);
    }
  }

  async updateOrderStatus(orderId, status, data = {}) {
    try {
      const response = await this.client.patch(`/orders/${orderId}/status`, { status, ...data });
      return ApiResponse.success(response.data, 'Order status updated');
    } catch (error) {
      return ApiResponse.error('Failed to update order status', [error.message]);
    }
  }

  async getMyOrders(params = {}) {
    try {
      const response = await this.client.get('/orders/my-orders', params);
      return ApiResponse.success(response.data, 'Orders retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Failed to get orders', [error.message]);
    }
  }

  async getAssignedForMe() {
    try {
      const response = await this.client.get('/orders/assigned/me');
      return ApiResponse.success(response.data, 'Assigned orders retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get assigned orders', [error.message]);
    }
  }

  async getOrderHistory(params = {}) {
    try {
      const response = await this.client.get('/orders/history', params);
      return ApiResponse.success(response.data, 'Order history retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get order history', [error.message]);
    }
  }

  async uploadProofOfDelivery(orderId, file) {
    try {
      const formData = new FormData();
      formData.append('proof', file);
      
      const response = await this.client.request(`/orders/${orderId}/proof`, {
        method: 'POST',
        body: formData,
        headers: {}
      });
      
      return ApiResponse.success(response.data, 'Proof of delivery uploaded');
    } catch (error) {
      return ApiResponse.error('Failed to upload proof', [error.message]);
    }
  }

  async collectPayment(orderId, amount, paymentMethod) {
    try {
      const response = await this.client.post(`/orders/${orderId}/collect-payment`, {
        amount,
        paymentMethod
      });
      return ApiResponse.success(response.data, 'Payment collected successfully');
    } catch (error) {
      return ApiResponse.error('Failed to collect payment', [error.message]);
    }
  }
}

export class EarningsService {
  constructor() {
    this.client = apiClient;
  }

  async getDashboardStats(params = {}) {
    try {
      const response = await this.client.get('/earnings/dashboard', params);
      return ApiResponse.success(response.data, 'Dashboard stats retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get dashboard stats', [error.message]);
    }
  }

  async getEarningsHistory(params = {}) {
    try {
      const response = await this.client.get('/earnings/history', params);
      return ApiResponse.success(response.data, 'Earnings history retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get earnings history', [error.message]);
    }
  }

  async getPayoutHistory(params = {}) {
    try {
      const response = await this.client.get('/earnings/payouts', params);
      return ApiResponse.success(response.data, 'Payout history retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get payout history', [error.message]);
    }
  }

  async requestPayout(amount, bankAccountId) {
    try {
      const response = await this.client.post('/earnings/request-payout', {
        amount,
        bankAccountId
      });
      return ApiResponse.success(response.data, 'Payout request submitted');
    } catch (error) {
      return ApiResponse.error('Failed to request payout', [error.message]);
    }
  }

  async addBankAccount(bankDetails) {
    try {
      const response = await this.client.post('/earnings/bank-accounts', bankDetails);
      return ApiResponse.success(response.data, 'Bank account added successfully');
    } catch (error) {
      return ApiResponse.error('Failed to add bank account', [error.message]);
    }
  }

  async getBankAccounts() {
    try {
      const response = await this.client.get('/earnings/bank-accounts');
      return ApiResponse.success(response.data, 'Bank accounts retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get bank accounts', [error.message]);
    }
  }
}

export class SupportService extends CrudService {
  constructor() {
    super('support');
  }

  async createTicket(ticketData) {
    try {
      const response = await this.client.post('/support/tickets', ticketData);
      return ApiResponse.success(response.data, 'Support ticket created successfully');
    } catch (error) {
      return ApiResponse.error('Failed to create support ticket', [error.message]);
    }
  }

  async getMyTickets(params = {}) {
    try {
      const response = await this.client.get('/support/tickets/my-tickets', params);
      return ApiResponse.success(response.data, 'Support tickets retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get support tickets', [error.message]);
    }
  }

  async addMessage(ticketId, message) {
    try {
      const response = await this.client.post(`/support/tickets/${ticketId}/messages`, { message });
      return ApiResponse.success(response.data, 'Message sent successfully');
    } catch (error) {
      return ApiResponse.error('Failed to send message', [error.message]);
    }
  }

  async getFAQs(category = '') {
    try {
      const response = await this.client.get('/support/faqs', { category });
      return ApiResponse.success(response.data, 'FAQs retrieved successfully');
    } catch (error) {
      return ApiResponse.error('Failed to get FAQs', [error.message]);
    }
  }

  async submitFeedback(feedbackData) {
    try {
      const response = await this.client.post('/support/feedback', feedbackData);
      return ApiResponse.success(response.data, 'Feedback submitted successfully');
    } catch (error) {
      return ApiResponse.error('Failed to submit feedback', [error.message]);
    }
  }
}

export class NotificationService {
  constructor() {
    this.client = apiClient;
  }

  async getNotifications(params = {}) {
    try {
      const response = await this.client.get('/notifications', params);
      return ApiResponse.success(response.data, 'Notifications retrieved');
    } catch (error) {
      return ApiResponse.error('Failed to get notifications', [error.message]);
    }
  }

  async markAsRead(notificationId) {
    try {
      const response = await this.client.patch(`/notifications/${notificationId}/read`);
      return ApiResponse.success(response.data, 'Notification marked as read');
    } catch (error) {
      return ApiResponse.error('Failed to mark notification as read', [error.message]);
    }
  }

  async markAllAsRead() {
    try {
      const response = await this.client.patch('/notifications/read-all');
      return ApiResponse.success(response.data, 'All notifications marked as read');
    } catch (error) {
      return ApiResponse.error('Failed to mark all notifications as read', [error.message]);
    }
  }

  async updatePreferences(preferences) {
    try {
      const response = await this.client.put('/notifications/preferences', preferences);
      return ApiResponse.success(response.data, 'Notification preferences updated');
    } catch (error) {
      return ApiResponse.error('Failed to update preferences', [error.message]);
    }
  }

  async registerForPushNotifications(token) {
    try {
      const response = await this.client.post('/notifications/register-device', { token });
      return ApiResponse.success(response.data, 'Device registered for notifications');
    } catch (error) {
      return ApiResponse.error('Failed to register device', [error.message]);
    }
  }
}

// Service instances
export const partnerService = new PartnerService();
export const ordersService = new OrdersService();
export const earningsService = new EarningsService();
export const supportService = new SupportService();
export const notificationService = new NotificationService();

// React hook for API services
export const useApi = () => {
  return {
    partner: partnerService,
    orders: ordersService,
    earnings: earningsService,
    support: supportService,
    notifications: notificationService,
  };
};

// Error handling utilities
export const handleApiError = (error, fallbackMessage = 'An error occurred') => {
  if (error?.errors?.length > 0) {
    return error.errors.join(', ');
  }
  return error?.message || fallbackMessage;
};

// Data transformation utilities
export const transformListResponse = (response, defaultValue = []) => {
  if (!response?.success) return defaultValue;
  return Array.isArray(response.data) ? response.data : defaultValue;
};

export const transformItemResponse = (response, defaultValue = null) => {
  if (!response?.success) return defaultValue;
  return response.data || defaultValue;
};

// Location utilities for partner app
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const watchLocation = (callback, errorCallback) => {
  if (!navigator.geolocation) {
    errorCallback(new Error('Geolocation is not supported'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp
      });
    },
    (error) => {
      errorCallback(new Error(`Location error: ${error.message}`));
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // 1 minute
    }
  );
};

// Feature flags for development
export const isDevelopment = process.env.NODE_ENV === 'development';
export const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || isDevelopment;

const apiExports = {
  ApiResponse,
  HttpClient,
  CrudService,
  apiClient,
  setAuthToken: (token) => {
    try { if (typeof window !== 'undefined') localStorage.setItem('auth_token', token) } catch {}
    apiClient.setAuthToken(token)
  },
  useApi,
  handleApiError,
  transformListResponse,
  transformItemResponse,
  getCurrentLocation,
  watchLocation,
  isDevelopment,
  useMockAPI
};

export default apiExports;
