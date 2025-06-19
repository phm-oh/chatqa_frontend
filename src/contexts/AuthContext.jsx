// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageUtils } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth ต้องใช้ภายใน AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const savedAuth = storageUtils.get(STORAGE_KEYS.ADMIN_AUTH);
        if (savedAuth && savedAuth.token && savedAuth.user) {
          // Check if token is not expired (simple check)
          const tokenData = parseJWT(savedAuth.token);
          if (tokenData && tokenData.exp > Date.now() / 1000) {
            setUser(savedAuth.user);
            setToken(savedAuth.token);
            setIsAuthenticated(true);
          } else {
            // Token expired, clear storage
            logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Parse JWT token (simple implementation)
  const parseJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // API call to login endpoint
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (data.success && data.token && data.user) {
        const authData = {
          token: data.token,
          user: data.user,
          loginTime: Date.now()
        };

        // Save to localStorage
        storageUtils.set(STORAGE_KEYS.ADMIN_AUTH, authData);
        
        // Update state
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);

        return { success: true, user: data.user };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      storageUtils.remove(STORAGE_KEYS.ADMIN_AUTH);
      
      // Reset state
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      
      // Optional: Call logout API
      if (token) {
        fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }).catch(err => console.warn('Logout API call failed:', err));
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user has specific permission
  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    
    const rolePermissions = {
      'super_admin': ['view', 'edit', 'delete', 'publish', 'admin'],
      'admin': ['view', 'edit', 'publish'],
      'moderator': ['view', 'edit'],
      'viewer': ['view']
    };

    const userPermissions = rolePermissions[user.role] || [];
    return userPermissions.includes(permission);
  };

  // Check if user is admin (can access admin panel)
  const isAdmin = () => {
    return user && ['super_admin', 'admin', 'moderator'].includes(user.role);
  };

  // Get authorization header for API calls
  const getAuthHeader = () => {
    if (!token) return {};
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  // Refresh token function (optional)
  const refreshToken = async () => {
    try {
      if (!token) return false;

      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.token) {
        const authData = storageUtils.get(STORAGE_KEYS.ADMIN_AUTH) || {};
        authData.token = data.token;
        storageUtils.set(STORAGE_KEYS.ADMIN_AUTH, authData);
        setToken(data.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  };

  // Check token expiration and auto-refresh
  useEffect(() => {
    if (!token || !isAuthenticated) return;

    const checkTokenExpiry = () => {
      const tokenData = parseJWT(token);
      if (tokenData && tokenData.exp) {
        const expiryTime = tokenData.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expiryTime - currentTime;

        // If token expires in less than 5 minutes, try to refresh
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          refreshToken().catch(() => {
            // If refresh fails, logout
            logout();
          });
        } else if (timeUntilExpiry <= 0) {
          // Token already expired
          logout();
        }
      }
    };

    // Check immediately
    checkTokenExpiry();

    // Check every minute
    const interval = setInterval(checkTokenExpiry, 60000);

    return () => clearInterval(interval);
  }, [token, isAuthenticated]);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    token,
    login,
    logout,
    hasPermission,
    isAdmin,
    getAuthHeader,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;