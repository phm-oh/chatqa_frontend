const API_BASE_URL = 'http://localhost:5000/api';

// Response wrapper utility
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = `HTTP Error: ${response.status}`;
    
    if (contentType && contentType.includes('application/json')) {
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
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
    return makeRequest(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  // Delete question
  delete: async (id) => {
    return makeRequest(`/questions/${id}`, {
      method: 'DELETE',
    });
  },

  // Get dashboard statistics
  getStats: async () => {
    return makeRequest('/questions/stats/dashboard');
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

// Health check API
export const healthAPI = {
  check: async () => {
    return makeRequest('/health');
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
  health: healthAPI,
  utils: apiUtils,
  network: networkUtils,
};