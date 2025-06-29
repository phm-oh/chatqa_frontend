// App.jsx (Updated)
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
import LoginModal from './components/common/LoginModal/LoginModal';

// Import services and utilities
import { healthAPI } from './services/api';
import { errorUtils } from './utils/helpers';
import { TOAST_TYPES } from './utils/constants';

// Import Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Main App component (inside AuthProvider)
const AppContent = () => {
  // State management
  const [currentPage, setCurrentPage] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiStatus, setApiStatus] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Auth context
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  // Initialize app
  useEffect(() => {
    initializeApp();
    setupNetworkListeners();
    console.log("Testing auto deploy v2");
    console.log("Testing auto deploy v3");
    
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

  // Navigation function with authentication check
  const navigateTo = (page) => {
    // Check if trying to access admin page
    if (page === 'admin') {
      if (!isAuthenticated || !isAdmin()) {
        // Show login modal if not authenticated or not admin
        setIsLoginModalOpen(true);
        return;
      }
    }
    
    window.location.hash = page;
    setCurrentPage(page);
  };

  // Handle successful login
  const handleLoginSuccess = (loggedInUser) => {
    setIsLoginModalOpen(false);
    
    // Check if user can access admin
    if (loggedInUser && ['super_admin', 'admin', 'moderator'].includes(loggedInUser.role)) {
      // Navigate to admin page after successful login
      window.location.hash = 'admin';
      setCurrentPage('admin');
      showToast(`ยินดีต้อนรับ ${loggedInUser.username}!`, TOAST_TYPES.SUCCESS);
    } else {
      showToast('คุณไม่มีสิทธิ์เข้าถึงหน้าจัดการระบบ', TOAST_TYPES.ERROR);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    if (currentPage === 'admin') {
      navigateTo('home');
    }
    showToast('ออกจากระบบเรียบร้อยแล้ว', TOAST_TYPES.SUCCESS);
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

  // Render current page with auth protection
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
        // Check authentication for admin page
        if (!isAuthenticated || !isAdmin()) {
          // If not authenticated, show login prompt
          return (
            <div className="admin-access-denied">
              <div className="container">
                <div className="access-denied-content">
                  <h2>🔐 จำเป็นต้องเข้าสู่ระบบ</h2>
                  <p>หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setIsLoginModalOpen(true)}
                  >
                    เข้าสู่ระบบ
                  </button>
                </div>
              </div>
            </div>
          );
        }
        return <Admin {...pageProps} user={user} onLogout={handleLogout} />;
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
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
        showToast={showToast}
      />

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

// Main App with AuthProvider and Error Boundary
const AppWithProviders = () => (
  <AppErrorBoundary>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </AppErrorBoundary>
);

export default AppWithProviders;