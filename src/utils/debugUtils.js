// utils/debugUtils.js - Debug utilities สำหรับ JWT และ Auth
export const debugUtils = {
  // Debug JWT token
  debugJWT: (token) => {
    console.group('🔍 JWT Debug');
    
    if (!token) {
      console.log('❌ No token provided');
      console.groupEnd();
      return { valid: false, error: 'No token' };
    }

    if (typeof token !== 'string') {
      console.log('❌ Token is not a string:', typeof token);
      console.groupEnd();
      return { valid: false, error: 'Invalid token type' };
    }

    const trimmedToken = token.trim();
    console.log('📝 Token length:', trimmedToken.length);
    console.log('🔤 Token preview:', trimmedToken.substring(0, 30) + '...');

    const parts = trimmedToken.split('.');
    console.log('🧩 Token parts:', parts.length);

    if (parts.length !== 3) {
      console.log('❌ Invalid JWT format - should have 3 parts');
      console.groupEnd();
      return { valid: false, error: 'Invalid JWT format' };
    }

    try {
      // Decode header
      const header = JSON.parse(atob(parts[0]));
      console.log('📋 Header:', header);

      // Decode payload
      const payload = JSON.parse(atob(parts[1]));
      console.log('📦 Payload:', {
        adminId: payload.adminId,
        iat: payload.iat,
        exp: payload.exp,
        iss: payload.iss
      });

      // Check expiration
      const now = Math.floor(Date.now() / 1000);
      const isExpired = payload.exp < now;
      const timeLeft = payload.exp - now;

      console.log('⏰ Current time:', now);
      console.log('⏰ Expires at:', payload.exp);
      console.log('⏰ Time left:', timeLeft, 'seconds');
      console.log('✅ Is valid:', !isExpired);

      console.groupEnd();

      return {
        valid: !isExpired,
        header,
        payload,
        timeLeft,
        isExpired
      };
    } catch (error) {
      console.log('❌ Error parsing JWT:', error.message);
      console.groupEnd();
      return { valid: false, error: error.message };
    }
  },

  // Debug auth headers
  debugAuthHeaders: (headers) => {
    console.group('🔍 Auth Headers Debug');
    console.log('📋 Headers:', headers);
    
    if (headers.Authorization) {
      const authHeader = headers.Authorization;
      console.log('🔑 Authorization header found');
      console.log('📝 Auth type:', authHeader.split(' ')[0]);
      console.log('🔤 Token preview:', authHeader.substring(0, 30) + '...');
      
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        debugUtils.debugJWT(token);
      } else {
        console.log('❌ Invalid auth header format - should start with "Bearer "');
      }
    } else {
      console.log('❌ No Authorization header found');
    }
    
    console.groupEnd();
  },

  // Debug API call
  debugAPICall: (method, url, headers, body) => {
    console.group(`🌐 API Call Debug: ${method} ${url}`);
    console.log('📋 Headers:', headers);
    if (body) {
      console.log('📦 Body:', body);
    }
    debugUtils.debugAuthHeaders(headers);
    console.groupEnd();
  },

  // Debug localStorage auth
  debugStoredAuth: () => {
    console.group('💾 Stored Auth Debug');
    
    try {
      const storedAuth = localStorage.getItem('admin_auth');
      if (!storedAuth) {
        console.log('❌ No stored auth found');
        console.groupEnd();
        return null;
      }

      console.log('📝 Raw stored data length:', storedAuth.length);
      
      const parsed = JSON.parse(storedAuth);
      console.log('📦 Parsed auth data:', {
        hasToken: !!parsed.token,
        hasUser: !!parsed.user,
        username: parsed.user?.username,
        role: parsed.user?.role,
        loginTime: parsed.loginTime ? new Date(parsed.loginTime).toLocaleString() : 'N/A'
      });

      if (parsed.token) {
        debugUtils.debugJWT(parsed.token);
      }

      console.groupEnd();
      return parsed;
    } catch (error) {
      console.log('❌ Error parsing stored auth:', error.message);
      console.groupEnd();
      return null;
    }
  },

  // Debug fetch response
  debugFetchResponse: async (response, label = 'API Response') => {
    console.group(`📡 ${label} Debug`);
    console.log('📊 Status:', response.status, response.statusText);
    console.log('✅ OK:', response.ok);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));
    
    try {
      const clonedResponse = response.clone();
      const text = await clonedResponse.text();
      console.log('📝 Raw response:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
      try {
        const json = JSON.parse(text);
        console.log('📦 Parsed JSON:', json);
      } catch (e) {
        console.log('❌ Not valid JSON');
      }
    } catch (error) {
      console.log('❌ Error reading response:', error.message);
    }
    
    console.groupEnd();
  },

  // Clear all debug logs
  clearLogs: () => {
    console.clear();
    console.log('🧹 Debug logs cleared');
  },

  // Test auth flow
  testAuthFlow: () => {
    console.group('🧪 Auth Flow Test');
    
    console.log('1. Testing stored auth...');
    const storedAuth = debugUtils.debugStoredAuth();
    
    if (storedAuth && storedAuth.token) {
      console.log('2. Testing auth headers...');
      const headers = { 'Authorization': `Bearer ${storedAuth.token}` };
      debugUtils.debugAuthHeaders(headers);
    } else {
      console.log('2. ❌ No token to test headers with');
    }
    
    console.groupEnd();
  }
};

// Global debug function สำหรับใช้ใน console
if (typeof window !== 'undefined') {
  window.debugAuth = debugUtils;
  console.log('🔧 Debug utils available as window.debugAuth');
  console.log('💡 Try: debugAuth.testAuthFlow()');
}

export default debugUtils;