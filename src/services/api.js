// Path: src/utils/api.js หรือ src/services/api.js - ไฟล์สมบูรณ์

const API_BASE_URL = 'http://localhost:5000/api';

// Response wrapper utility
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        // Fallback to status text if JSON parsing fails
        errorMessage = response.statusText || errorMessage;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  return await response.text();
};

// Generic API request function
const makeRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, finalOptions);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API Request Error (${endpoint}):`, error);
    throw error;
  }
};

// Questions API
export const questionAPI = {
  // Get all questions (Admin) with optional filters and pagination
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) searchParams.append('status', params.status);
    if (params.category) searchParams.append('category', params.category);
    if (params.search) searchParams.append('search', params.search);
    if (params.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) searchParams.append('dateTo', params.dateTo);
    
    const queryString = searchParams.toString();
    const endpoint = `/questions${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest(endpoint);
  },

  // Get specific question by ID
  getById: async (id) => {
    return makeRequest(`/questions/${id}`);
  },

  // Create new question
  create: async (questionData) => {
    return makeRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  // Update question (Admin)
  update: async (id, updateData) => {
    const token = localStorage.getItem('token');
    return makeRequest(`/questions/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });
  },

  // Delete question
  delete: async (id) => {
    const token = localStorage.getItem('token');
    return makeRequest(`/questions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Get dashboard statistics
  getStats: async () => {
    const token = localStorage.getItem('token');
    return makeRequest('/questions/stats/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// FAQ API
export const faqAPI = {
  // Get all FAQ (public - showInFAQ=true AND status="เผยแพร่")
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.category) searchParams.append('category', params.category);
    
    const queryString = searchParams.toString();
    const endpoint = `/faq${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest(endpoint);
  },

  // Get FAQ categories with counts
  getCategories: async () => {
    return makeRequest('/faq/categories');
  },

  // Get popular FAQ (10 latest)
  getPopular: async () => {
    return makeRequest('/faq/popular');
  },

  // Get specific FAQ by ID
  getById: async (id) => {
    return makeRequest(`/faq/${id}`);
  },

  // Search FAQ
  search: async (query, params = {}) => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.category) searchParams.append('category', params.category);
    
    const queryString = searchParams.toString();
    const endpoint = `/faq/search/${encodeURIComponent(query)}${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest(endpoint);
  },
};

// Admin API
export const adminAPI = {
  // Admin login
  login: async (credentials) => {
    return makeRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Get current admin profile
  getProfile: async () => {
    const token = localStorage.getItem('token');
    return makeRequest('/admin/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Update admin profile
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('token');
    return makeRequest('/admin/profile', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    const token = localStorage.getItem('token');
    return makeRequest('/admin/change-password', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(passwordData),
    });
  },

  // Admin logout
  logout: async () => {
    const token = localStorage.getItem('token');
    return makeRequest('/admin/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Register new admin (super_admin only)
  register: async (adminData) => {
    const token = localStorage.getItem('token');
    return makeRequest('/admin/register', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(adminData),
    });
  },

  // Get all admins (super_admin only)
  getAll: async (params = {}) => {
    const token = localStorage.getItem('token');
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.role) searchParams.append('role', params.role);
    if (params.isActive !== undefined) searchParams.append('isActive', params.isActive);
    
    const queryString = searchParams.toString();
    const endpoint = `/admin/list${queryString ? `?${queryString}` : ''}`;
    
    return makeRequest(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Toggle admin status (super_admin only)
  toggleStatus: async (adminId) => {
    const token = localStorage.getItem('token');
    return makeRequest(`/admin/${adminId}/toggle-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  // Get admin statistics
  getStats: async () => {
    const token = localStorage.getItem('token');
    return makeRequest('/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },
};

// Health check API
export const healthAPI = {
  check: async () => {
    return makeRequest('/health');
  },
};

// Auth utilities
export const authUtils = {
  // Store token
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  // Get token
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Remove token
  removeToken: () => {
    localStorage.removeItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    
    try {
      // Parse JWT token to check expiry (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  },

  // Auto logout when token expires
  setupTokenExpiry: (onExpiry) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000;
      const currentTime = Date.now();
      
      if (expiryTime > currentTime) {
        const timeUntilExpiry = expiryTime - currentTime;
        setTimeout(() => {
          authUtils.removeToken();
          onExpiry();
        }, timeUntilExpiry);
      }
    } catch (error) {
      console.error('Error parsing token:', error);
    }
  },
};

// Utility functions for API
export const apiUtils = {
  // Format date for API requests
  formatDate: (date) => {
    if (!date) return null;
    return date instanceof Date ? date.toISOString().split('T')[0] : date;
  },

  // Parse API error messages
  parseError: (error) => {
    if (error.message) {
      return error.message;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    return 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  },

  // Validate response structure
  validateResponse: (response) => {
    if (!response || typeof response !== 'object') {
      throw new Error('Invalid response format');
    }
    
    if (!response.success) {
      throw new Error(response.message || 'API request was not successful');
    }
    
    return response;
  },

  // Build query parameters
  buildQueryParams: (params) => {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    return searchParams.toString();
  },
};

// Network status utilities
export const networkUtils = {
  // Check if online
  isOnline: () => navigator.onLine,

  // Add network event listeners
  addNetworkListeners: (onOnline, onOffline) => {
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    
    // Return cleanup function
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  },

  // Retry function for failed requests
  retryRequest: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) {
          break;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
    
    throw lastError;
  },
};

// Default export with all APIs
export default {
  question: questionAPI,
  faq: faqAPI,
  admin: adminAPI,
  health: healthAPI,
  utils: apiUtils,
  auth: authUtils,
  network: networkUtils,
};