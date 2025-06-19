// components/common/Header/Header.jsx (Updated)
import React, { useState, useEffect } from 'react';
import './Header.css';
import { APP_INFO } from '../../../utils/constants';
import { useAuth } from '../../../contexts/AuthContext';

const Header = ({ 
  currentPage, 
  onNavigate, 
  isOnline = true, 
  apiStatus = 'healthy',
  onLogout
}) => {
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when page changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [currentPage]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isUserMenuOpen && !event.target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isUserMenuOpen]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle navigation
  const handleNavigation = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    if (onLogout) {
      onLogout();
    }
    // Navigate to home after logout
    handleNavigation('home');
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (!isOnline) {
      return (
        <div className="status-indicator offline">
          <span className="status-dot"></span>
          <span className="status-text">ออฟไลน์</span>
        </div>
      );
    }
    
    if (apiStatus === 'unhealthy') {
      return (
        <div className="status-indicator warning">
          <span className="status-dot"></span>
          <span className="status-text">ปรับปรุงระบบ</span>
        </div>
      );
    }
    
    return (
      <div className="status-indicator online">
        <span className="status-dot"></span>
        <span className="status-text">ออนไลน์</span>
      </div>
    );
  };

  // Get user role display
  const getUserRoleDisplay = (role) => {
    switch (role) {
      case 'super_admin':
        return { icon: '👑', label: 'Super Admin' };
      case 'admin':
        return { icon: '🛡️', label: 'Admin' };
      case 'moderator':
        return { icon: '⭐', label: 'Moderator' };
      default:
        return { icon: '👤', label: 'User' };
    }
  };

  // Navigation items
  const navItems = [
    { id: 'home', label: 'หน้าแรก', icon: '🏠' },
    { id: 'faq', label: 'คลัง FAQ', icon: '❓' },
    { id: 'admin', label: 'จัดการระบบ', icon: '⚙️' }
  ];

  // Render user menu
  const renderUserMenu = () => {
    if (!isAuthenticated || !user) return null;

    const roleInfo = getUserRoleDisplay(user.role);

    return (
      <div className="user-menu-container">
        <button 
          className="user-menu-trigger"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          aria-label="เมนูผู้ใช้"
        >
          <div className="user-avatar">
            <span className="user-icon">{roleInfo.icon}</span>
          </div>
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className="user-role">{roleInfo.label}</span>
          </div>
          <span className="menu-arrow">▼</span>
        </button>

        {isUserMenuOpen && (
          <div className="user-menu-dropdown">
            <div className="user-menu-header">
              <div className="user-details">
                <div className="user-avatar-large">
                  <span className="user-icon-large">{roleInfo.icon}</span>
                </div>
                <div className="user-meta">
                  <strong className="user-display-name">{user.username}</strong>
                  <span className="user-role-text">{roleInfo.label}</span>
                  {user.email && (
                    <span className="user-email">{user.email}</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="user-menu-actions">
              {currentPage !== 'admin' && (
                <button
                  className="user-menu-item"
                  onClick={() => handleNavigation('admin')}
                >
                  <span className="menu-item-icon">⚙️</span>
                  <span className="menu-item-text">จัดการระบบ</span>
                </button>
              )}
              
              <button
                className="user-menu-item logout-item"
                onClick={handleLogout}
              >
                <span className="menu-item-icon">🚪</span>
                <span className="menu-item-text">ออกจากระบบ</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <header className={`app-header ${isScrolled ? 'header-scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          {/* Logo and title */}
          <div className="header-brand" onClick={() => handleNavigation('home')}>
            <div className="brand-icon">💬</div>
            <div className="brand-text">
              <h1 className="brand-title">{APP_INFO.NAME}</h1>
              <span className="brand-subtitle">ถาม-ตอบออนไลน์</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button 
            className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={toggleMobileMenu}
            aria-label="เมนูหลัก"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Desktop navigation */}
          <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <ul className="nav-list">
              {navItems.map(item => (
                <li key={item.id} className="nav-item">
                  <button
                    className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.id)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Header right section */}
          <div className="header-right">
            {/* Status indicator */}
            <div className="header-status">
              {getStatusIndicator()}
            </div>

            {/* User menu or login prompt */}
            <div className="header-auth">
              {isAuthenticated ? (
                renderUserMenu()
              ) : (
                <button
                  className="login-prompt-btn"
                  onClick={() => handleNavigation('admin')}
                >
                  <span className="login-icon">🔐</span>
                  <span className="login-text">เข้าสู่ระบบ</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;