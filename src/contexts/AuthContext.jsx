// src/contexts/AuthContext.jsx - แก้ปัญหา JWT Malformed
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
          // ✅ FIX: ตรวจสอบ token format ก่อนใช้
          if (typeof savedAuth.token === 'string' && savedAuth.token.trim().length > 0) {
            // Check if token is not expired (simple check)
            const tokenData = parseJWT(savedAuth.token);
            if (tokenData && tokenData.exp > Date.now() / 1000) {
              setUser(savedAuth.user);
              setToken(savedAuth.token);
              setIsAuthenticated(true);
              console.log('✅ Auth initialized successfully with token:', savedAuth.token.substring(0, 20) + '...');
            } else {
              console.log('❌ Token expired, clearing auth');
              logout();
            }
          } else {
            console.log('❌ Invalid token format, clearing auth');
            logout();
          }
        } else {
          console.log('ℹ️ No saved auth found');
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
      if (!token || typeof token !== 'string') {
        console.log('❌ Invalid token type:', typeof token);
        return null;
      }

      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('❌ Invalid token format - parts:', tokenParts.length);
        return null;
      }

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const payload = JSON.parse(jsonPayload);
      console.log('✅ JWT parsed successfully:', { exp: payload.exp, iat: payload.iat });
      return payload;
    } catch (error) {
      console.error('❌ Error parsing JWT:', error);
      return null;
    }
  };

  // Login function - แก้ให้รองรับ response structure ที่ถูกต้อง
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      console.log('🔑 Attempting login for:', credentials.username);
      
      // API call to login endpoint
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();
      console.log('📋 Login response:', { success: data.success, hasToken: !!data.token, hasUser: !!(data.user || data.admin) });

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // ✅ FIX: รองรับทั้ง data.user และ data.admin
      const userData = data.user || data.admin;
      
      if (data.success && data.token && userData) {
        // ✅ FIX: ตรวจสอบ token format ก่อนเก็บ
        if (typeof data.token !== 'string' || data.token.trim().length === 0) {
          throw new Error('Invalid token format received');
        }

        const authData = {
          token: data.token.trim(), // ตัด whitespace
          user: userData,
          loginTime: Date.now()
        };

        // Save to localStorage
        storageUtils.set(STORAGE_KEYS.ADMIN_AUTH, authData);
        
        // Update state
        setUser(userData);
        setToken(data.token.trim());
        setIsAuthenticated(true);

        console.log('✅ Login successful for:', userData.username);
        return { success: true, user: userData };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
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
      console.log('🚪 Logging out user');
      
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

  // ✅ FIX: แก้ไข getAuthHeader ให้ส่ง format ที่ถูกต้อง
  const getAuthHeader = () => {
    if (!token) {
      console.log('❌ No token available for auth header');
      return {};
    }

    // ตรวจสอบ token format
    if (typeof token !== 'string' || token.trim().length === 0) {
      console.log('❌ Invalid token format for auth header:', typeof token);
      logout(); // logout ถ้า token เสียหาย
      return {};
    }

    const cleanToken = token.trim();
    console.log('🔑 Creating auth header with token:', cleanToken.substring(0, 20) + '...');
    
    return {
      'Authorization': `Bearer ${cleanToken}`
    };
  };

  // Refresh token function (optional)
  const refreshToken = async () => {
    try {
      if (!token) {
        console.log('❌ No token for refresh');
        return false;
      }

      console.log('🔄 Refreshing token...');
      
      const response = await fetch('/api/admin/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.token) {
        // ✅ FIX: ตรวจสอบ token format ก่อนเก็บ
        if (typeof data.token === 'string' && data.token.trim().length > 0) {
          const authData = storageUtils.get(STORAGE_KEYS.ADMIN_AUTH) || {};
          authData.token = data.token.trim();
          
          // รองรับทั้ง data.user และ data.admin สำหรับ refresh
          const userData = data.user || data.admin;
          if (userData) {
            authData.user = userData;
            setUser(userData);
          }
          
          storageUtils.set(STORAGE_KEYS.ADMIN_AUTH, authData);
          setToken(data.token.trim());
          
          console.log('✅ Token refreshed successfully');
          return true;
        } else {
          console.log('❌ Invalid refresh token format');
          return false;
        }
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
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

        console.log('⏰ Token expires in:', Math.round(timeUntilExpiry / 1000 / 60), 'minutes');

        // If token expires in less than 5 minutes, try to refresh
        if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
          console.log('🔄 Token expiring soon, attempting refresh...');
          refreshToken().catch(() => {
            console.log('❌ Auto-refresh failed, logging out');
            logout();
          });
        } else if (timeUntilExpiry <= 0) {
          console.log('❌ Token expired, logging out');
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