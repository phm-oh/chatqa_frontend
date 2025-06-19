import React, { useState, useEffect } from 'react';
import './Toast.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import { TOAST_TYPES } from '../../../utils/constants';

const Toast = ({ 
  message, 
  type = TOAST_TYPES?.INFO || 'info', 
  duration = 5000, 
  onClose,
  autoClose = true,
  position = 'top-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    // Auto close timer
    let closeTimer;
    if (autoClose && duration > 0) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(showTimer);
      if (closeTimer) clearTimeout(closeTimer);
    };
  }, [duration, autoClose]);

  const handleClose = () => {
    setIsClosing(true);
    
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
      default:
        return 'ℹ️';
    }
  };

  const getProgressColor = () => {
    switch (type) {
      case 'success':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'info':
      default:
        return '#3b82f6';
    }
  };

  return (
    <div 
      className={`toast toast-${type} toast-${position} ${isVisible ? 'toast-visible' : ''} ${isClosing ? 'toast-closing' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-content">
        <div className="toast-icon">
          {getIcon()}
        </div>
        
        <div className="toast-message">
          {message}
        </div>
        
        <button 
          className="toast-close"
          onClick={handleClose}
          aria-label="ปิดการแจ้งเตือน"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path 
              d="M13 1L1 13M1 1L13 13" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      
      {/* Progress bar for auto-close */}
      {autoClose && duration > 0 && (
        <div className="toast-progress">
          <div 
            className="toast-progress-bar"
            style={{
              backgroundColor: getProgressColor(),
              animationDuration: `${duration}ms`
            }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container component for managing multiple toasts
export const ToastContainer = ({ children, position = 'top-right' }) => {
  return (
    <div className={`toast-container toast-container-${position}`}>
      {children}
    </div>
  );
};

export default Toast;