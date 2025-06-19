import React, { useState, useEffect } from 'react';
import './App.css';
import './styles/global.css';

// Import pages
import Home from './pages/Home/Home';
import FAQ from './pages/FAQ/FAQ';
import Admin from './pages/Admin/Admin';

// Import components
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import Toast from './components/common/Toast/Toast';
import Loading from './components/common/Loading/Loading';

// Import services and utilities
import { healthAPI } from './services/api';
import { errorUtils } from './utils/helpers';
import { TOAST_TYPES } from './utils/constants';

// App component
const App = () => {
  // State management
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Initialize app
  useEffect(() => {
    initializeApp();
    setupNetworkListeners();
    
    return () => {
      // Cleanup
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize application
  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Check API health
      await checkAPIHealth();
      
      // Set initial page from URL hash
      const hash = window.location.hash.slice(1) || 'home';
      setCurrentPage(hash);
      
      // Listen to hash changes
      window.addEventListener('hashchange', handleHashChange);
      
    } catch (error) {
      console.error('App initialization error:', error);
      showToast('เกิดข้อผิดพลาดในการเริ่มต้นระบบ', TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  // Check API health
  const checkAPIHealth = async () => {
    try {
      const response = await healthAPI.check();
      setApiStatus('healthy');
      return response;
    } catch (error) {
      setApiStatus('unhealthy');
      console.error('API health check failed:', error);
      // Don't show toast for initial health check failure
      // User will see offline indicator instead
    }
  };

  // Setup network event listeners
  const setupNetworkListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  };

  // Handle online event
  const handleOnline = () => {
    setIsOnline(true);
    checkAPIHealth();
    showToast('กลับมาออนไลน์แล้ว', TOAST_TYPES.SUCCESS);
  };

  // Handle offline event
  const handleOffline = () => {
    setIsOnline(false);
    setApiStatus('offline');
    showToast('ขาดการเชื่อมต่ออินเทอร์เน็ต', TOAST_TYPES.WARNING);
  };

  // Handle hash change for navigation
  const handleHashChange = () => {
    const hash = window.location.hash.slice(1) || 'home';
    setCurrentPage(hash);
  };

  // Navigation function
  const navigateTo = (page) => {
    window.location.hash = page;
    setCurrentPage(page);
  };

  // Toast management
  const showToast = (message, type = TOAST_TYPES.INFO, duration = 5000) => {
    const id = Date.now();
    const toast = {
      id,
      message,
      type,
      duration
    };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Error boundary fallback
  const handleError = (error, errorInfo) => {
    console.error('App Error:', error, errorInfo);
    showToast('เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณารีเฟรชหน้าเว็บ', TOAST_TYPES.ERROR);
  };

  // Render current page
  const renderCurrentPage = () => {
    const pageProps = {
      showToast,
      navigateTo,
      isOnline,
      apiStatus
    };

    switch (currentPage) {
      case 'home':
        return <Home {...pageProps} />;
      case 'faq':
        return <FAQ {...pageProps} />;
      case 'admin':
        return <Admin {...pageProps} />;
      default:
        return <Home {...pageProps} />;
    }
  };

  // Show loading screen during initialization
  if (isLoading) {
    return (
      <div className="app-loading">
        <Loading message="กำลังโหลดระบบ..." />
      </div>
    );
  }

  return (
    <div className="app">
      {/* Header */}
      <Header 
        currentPage={currentPage}
        onNavigate={navigateTo}
        isOnline={isOnline}
        apiStatus={apiStatus}
      />

      {/* Main content */}
      <main className="app-main">
        {/* Offline indicator */}
        {!isOnline && (
          <div className="offline-banner">
            <div className="container">
              <span className="offline-icon">⚠️</span>
              <span>คุณกำลังใช้งานแบบออฟไลน์ ฟีเจอร์บางอย่างอาจไม่สามารถใช้งานได้</span>
            </div>
          </div>
        )}

        {/* API status indicator */}
        {isOnline && apiStatus === 'unhealthy' && (
          <div className="api-error-banner">
            <div className="container">
              <span className="error-icon">🔧</span>
              <span>ระบบกำลังปรับปรุง กรุณาลองใหม่ภายหลัง</span>
              <button 
                className="btn btn-sm btn-secondary"
                onClick={checkAPIHealth}
              >
                ลองเชื่อมต่อใหม่
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="page-content">
          {renderCurrentPage()}
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Toast notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

// Error boundary wrapper
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="container">
            <div className="error-content">
              <h1>เกิดข้อผิดพลาด</h1>
              <p>ขออภัย เกิดข้อผิดพลาดที่ไม่คาดคิด</p>
              <div className="error-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  รีเฟรชหน้าเว็บ
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => window.location.hash = 'home'}
                >
                  กลับหน้าแรก
                </button>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <details className="error-details">
                  <summary>รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)</summary>
                  <pre>{this.state.error?.toString()}</pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App with Error Boundary
const AppWithErrorBoundary = () => (
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);

export default AppWithErrorBoundary;