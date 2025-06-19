// src/services/authAPI.js
import { API_ENDPOINTS, ERROR_MESSAGES } from '../utils/constants';
import { errorUtils } from '../utils/helpers';

// Base API configuration
const API_BASE = API_ENDPOINTS.BASE || 'http://localhost:5000/api';
const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE}/admin/login`,
  LOGOUT: `${API_BASE}/admin/logout`,
  REFRESH: `${API_BASE}/admin/refresh`,
  PROFILE: `${API_BASE}/admin/profile`,
  VERIFY: `${API_BASE}/admin/verify`
};

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000;

// Create request with timeout
const createRequestWithTimeout = (url, options = {}) => {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), REQUEST_TIMEOUT)
    )
  ]);
};

// Handle API response
const handleResponse = async (response) => {
  let data;
  
  try {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }
  } catch (error) {
    data = { message: 'Invalid response format' };
  }

  if (!response.ok) {
    const error = new Error(data.message || ERROR_MESSAGES.UNKNOWN);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

// Authentication API service
export const authAPI = {
  // Login admin user
  login: async (credentials) => {
    try {
      if (!credentials.username || !credentials.password) {
        throw new Error('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      }

      const response = await createRequestWithTimeout(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password
        }),
      });

      const data = await handleResponse(response);
      
      // Validate response structure
      if (!data.token || !data.user) {
        throw new Error('Invalid login response');
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message || 'เข้าสู่ระบบสำเร็จ'
      };
    } catch (error) {
      console.error('Login API error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      
      if (error.message === 'Request timeout') {
        throw new Error(ERROR_MESSAGES.TIMEOUT);
      }
      
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Logout admin user
  logout: async (token) => {
    try {
      if (!token) {
        return { success: true, message: 'Already logged out' };
      }

      const response = await createRequestWithTimeout(AUTH_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        message: data.message || 'ออกจากระบบสำเร็จ'
      };
    } catch (error) {
      console.error('Logout API error:', error);
      // Don't throw error for logout - just log it
      return {
        success: false,
        message: 'Logout completed locally'
      };
    }
  },

  // Refresh token
  refresh: async (token) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const response = await createRequestWithTimeout(AUTH_ENDPOINTS.REFRESH, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      if (!data.token) {
        throw new Error('Invalid refresh response');
      }

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message || 'Token refreshed'
      };
    } catch (error) {
      console.error('Refresh token API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Get user profile
  getProfile: async (token) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const response = await createRequestWithTimeout(AUTH_ENDPOINTS.PROFILE, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      console.error('Get profile API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Verify token
  verify: async (token) => {
    try {
      if (!token) {
        throw new Error('No token provided');
      }

      const response = await createRequestWithTimeout(AUTH_ENDPOINTS.VERIFY, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        valid: data.valid || false,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      console.error('Verify token API error:', error);
      return {
        success: false,
        valid: false,
        message: errorUtils.parseError(error)
      };
    }
  }
};

// Admin management API (for super admin)
export const adminManagementAPI = {
  // Get all admin users
  getAdmins: async (token) => {
    try {
      const response = await createRequestWithTimeout(`${API_BASE}/admin/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        users: data.users || [],
        message: data.message
      };
    } catch (error) {
      console.error('Get admins API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Create new admin user
  createAdmin: async (token, userData) => {
    try {
      const response = await createRequestWithTimeout(`${API_BASE}/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        user: data.user,
        message: data.message || 'สร้างผู้ใช้สำเร็จ'
      };
    } catch (error) {
      console.error('Create admin API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Update admin user
  updateAdmin: async (token, userId, userData) => {
    try {
      const response = await createRequestWithTimeout(`${API_BASE}/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        user: data.user,
        message: data.message || 'อัพเดทผู้ใช้สำเร็จ'
      };
    } catch (error) {
      console.error('Update admin API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Delete admin user
  deleteAdmin: async (token, userId) => {
    try {
      const response = await createRequestWithTimeout(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        message: data.message || 'ลบผู้ใช้สำเร็จ'
      };
    } catch (error) {
      console.error('Delete admin API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  },

  // Change password
  changePassword: async (token, passwordData) => {
    try {
      const response = await createRequestWithTimeout(`${API_BASE}/admin/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      const data = await handleResponse(response);
      
      return {
        success: true,
        message: data.message || 'เปลี่ยนรหัสผ่านสำเร็จ'
      };
    } catch (error) {
      console.error('Change password API error:', error);
      throw new Error(errorUtils.parseError(error));
    }
  }
};

// Export default
export default authAPI;