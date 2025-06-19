import React, { useState, useEffect } from 'react';
import './Header.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import { APP_INFO } from '../../../utils/constants';

const Header = ({ 
  currentPage, 
  onNavigate, 
  isOnline = true, 
  apiStatus = 'healthy' 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
  }, [currentPage]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle navigation
  const handleNavigation = (page) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  // Get status indicator
  const getStatusIndicator = () => {
    if (!isOnline) {
      return (
        <div className="status-indicator offline">
          <span className="status-dot"></span>
          <span>ออฟไลน์</span>
        </div>
      );
    }
    
    if (apiStatus === 'unhealthy') {
      return (
        <div className="status-indicator warning">
          <span className="status-dot"></span>
          <span>ปรับปรุงระบบ</span>
        </div>
      );
    }
    
    return (
      <div className="status-indicator online">
        <span className="status-dot"></span>
        <span>ออนไลน์</span>
      </div>
    );
  };

  // Navigation items
  const navItems = [
    { id: 'home', label: 'หน้าแรก', icon: '🏠' },
    { id: 'faq', label: 'คลัง FAQ', icon: '❓' },
    { id: 'admin', label: 'จัดการระบบ', icon: '⚙️' }
  ];

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

          {/* Desktop navigation */}
          <nav className="header-nav">
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

          {/* Status */}
          <div className="header-status">
            {getStatusIndicator()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;