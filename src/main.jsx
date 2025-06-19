// main.jsx (Updated)
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';

// Enhanced error handling for uncaught errors
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Don't show alert in production
  if (process.env.NODE_ENV === 'development') {
    console.warn('Development error caught:', {
      message: event.error?.message,
      filename: event.filename,
      lineno: event.lineno,
      stack: event.error?.stack
    });
  }
});

// Enhanced promise rejection handling
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Prevent the default browser behavior (showing error in console)
  event.preventDefault();
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('Development promise rejection:', {
      reason: event.reason,
      promise: event.promise
    });
  }
  
  // Handle authentication errors globally
  if (event.reason?.status === 401 || event.reason?.message?.includes('Unauthorized')) {
    console.warn('Authentication error detected globally');
    // Could dispatch custom event here for auth context to handle
    window.dispatchEvent(new CustomEvent('auth:unauthorized', {
      detail: event.reason
    }));
  }
});

// Performance monitoring for development
if (process.env.NODE_ENV === 'development') {
  // Log performance metrics in development
  window.addEventListener('load', () => {
    // Use requestIdleCallback for non-critical performance logging
    const logPerformance = () => {
      try {
        const perfData = performance.getEntriesByType('navigation')[0];
        if (perfData) {
          console.log('🚀 Page Load Performance:', {
            'DOM Content Loaded': Math.round(perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart) + 'ms',
            'Load Complete': Math.round(perfData.loadEventEnd - perfData.loadEventStart) + 'ms',
            'Total Time': Math.round(perfData.loadEventEnd - perfData.fetchStart) + 'ms',
            'DNS Lookup': Math.round(perfData.domainLookupEnd - perfData.domainLookupStart) + 'ms',
            'TCP Connection': Math.round(perfData.connectEnd - perfData.connectStart) + 'ms'
          });
        }
        
        // Log largest contentful paint
        const lcp = performance.getEntriesByType('largest-contentful-paint');
        if (lcp.length > 0) {
          console.log('🎨 Largest Contentful Paint:', Math.round(lcp[lcp.length - 1].startTime) + 'ms');
        }
        
        // Log cumulative layout shift
        const cls = performance.getEntriesByType('layout-shift');
        if (cls.length > 0) {
          const totalCLS = cls.reduce((sum, entry) => sum + entry.value, 0);
          console.log('📐 Cumulative Layout Shift:', totalCLS.toFixed(4));
        }
      } catch (error) {
        console.warn('Performance logging failed:', error);
      }
    };

    if (window.requestIdleCallback) {
      window.requestIdleCallback(logPerformance, { timeout: 2000 });
    } else {
      setTimeout(logPerformance, 0);
    }
  });

  // Log memory usage periodically (development only)
  if (performance.memory) {
    setInterval(() => {
      const memory = performance.memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // Alert if > 50MB
        console.warn('🧠 High memory usage detected:', {
          'Used': Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
          'Total': Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
          'Limit': Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
        });
      }
    }, 30000); // Check every 30 seconds
  }
}

// Service Worker registration (for future PWA features)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('🔧 Service Worker registered successfully:', registration.scope);
        
        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available, could show update notification
              console.log('🆕 New version available');
              window.dispatchEvent(new CustomEvent('app:update-available'));
            }
          });
        });
      })
      .catch((error) => {
        console.warn('Service Worker registration failed:', error);
      });
  });
}

// Network status monitoring
const updateOnlineStatus = () => {
  const isOnline = navigator.onLine;
  console.log(`🌐 Network status: ${isOnline ? 'Online' : 'Offline'}`);
  
  // Dispatch custom event for app components to handle
  window.dispatchEvent(new CustomEvent('network:status-change', {
    detail: { isOnline }
  }));
};

window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

// Keyboard shortcuts for development
if (process.env.NODE_ENV === 'development') {
  window.addEventListener('keydown', (event) => {
    // Ctrl+Shift+D = Toggle dark mode (if implemented)
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      console.log('🌙 Dark mode toggle shortcut pressed');
      window.dispatchEvent(new CustomEvent('app:toggle-dark-mode'));
    }
    
    // Ctrl+Shift+L = Clear localStorage
    if (event.ctrlKey && event.shiftKey && event.key === 'L') {
      if (confirm('Clear all localStorage data?')) {
        localStorage.clear();
        console.log('🧹 localStorage cleared');
        window.location.reload();
      }
    }
    
    // Ctrl+Shift+R = Hard refresh
    if (event.ctrlKey && event.shiftKey && event.key === 'R') {
      window.location.reload(true);
    }
  });
}

// Initialize React app with enhanced error boundary
const root = ReactDOM.createRoot(document.getElementById('root'));

// Check if root element exists
if (!document.getElementById('root')) {
  console.error('Root element not found');
  document.body.innerHTML = `
    <div style="padding: 2rem; text-align: center; font-family: system-ui;">
      <h1>❌ Application Error</h1>
      <p>Root element not found. Please check your HTML structure.</p>
      <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; margin-top: 1rem;">
        Reload Page
      </button>
    </div>
  `;
} else {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

// Hot Module Replacement (HMR) for development
if (process.env.NODE_ENV === 'development' && import.meta.hot) {
  import.meta.hot.accept('./App.jsx', (newModule) => {
    console.log('🔄 HMR: App updated');
  });
  
  // Handle HMR errors
  import.meta.hot.on('vite:error', (error) => {
    console.error('🔥 HMR Error:', error);
  });
  
  // Clean up on HMR dispose
  import.meta.hot.dispose(() => {
    console.log('🧹 HMR: Cleaning up');
  });
}

// Expose helpful debugging functions in development
if (process.env.NODE_ENV === 'development') {
  window.__APP_DEBUG__ = {
    clearAuth: () => {
      localStorage.removeItem('chatqa_admin_auth');
      console.log('🔐 Auth data cleared');
    },
    clearAll: () => {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 All storage cleared');
    },
    getAuthInfo: () => {
      const auth = localStorage.getItem('chatqa_admin_auth');
      console.log('🔐 Auth info:', auth ? JSON.parse(auth) : 'Not found');
    },
    networkTest: () => {
      fetch('/api/health')
        .then(res => res.json())
        .then(data => console.log('🏥 Health check:', data))
        .catch(err => console.error('🏥 Health check failed:', err));
    }
  };
  
  console.log('🛠️ Debug functions available: window.__APP_DEBUG__');
}