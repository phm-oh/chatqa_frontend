// src/components/common/LoginModal/LoginModal.jsx
import React, { useState, useEffect } from 'react';
import './LoginModal.css';
import { useAuth } from '../../../contexts/AuthContext';
import { validationUtils } from '../../../utils/helpers';
import { TOAST_TYPES } from '../../../utils/constants';

const LoginModal = ({ isOpen, onClose, onSuccess, showToast }) => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ username: '', password: '' });
      setErrors({});
    }
  }, [isOpen]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'กรุณากรอกชื่อผู้ใช้';
    }

    if (!formData.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (formData.password.length < 4) {
      newErrors.password = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await login({
        username: formData.username.trim(),
        password: formData.password
      });

      if (result.success) {
        showToast('เข้าสู่ระบบสำเร็จ', TOAST_TYPES.SUCCESS);
        onSuccess && onSuccess(result.user);
        onClose();
      } else {
        // Handle login failure
        const errorMessage = result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        showToast(errorMessage, TOAST_TYPES.ERROR);
        
        // Clear password field on failed login
        setFormData(prev => ({ ...prev, password: '' }));
      }
    } catch (error) {
      console.error('Login submission error:', error);
      showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', TOAST_TYPES.ERROR);
      setFormData(prev => ({ ...prev, password: '' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (isSubmitting) return; // Don't allow close while submitting
    onClose();
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, isSubmitting]);

  if (!isOpen) return null;

  return (
    <div className="login-modal-overlay" onClick={handleBackdropClick}>
      <div className="login-modal-content">
        <div className="login-modal-header">
          <h2>🔐 เข้าสู่ระบบผู้ดูแล</h2>
          <button 
            className="login-modal-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="ปิด"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-modal-body">
            <div className="form-group">
              <label htmlFor="username">ชื่อผู้ใช้</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`form-control ${errors.username ? 'error' : ''}`}
                placeholder="กรอกชื่อผู้ใช้"
                disabled={isSubmitting}
                autoComplete="username"
                autoFocus
              />
              {errors.username && (
                <div className="error-message">{errors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">รหัสผ่าน</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`form-control ${errors.password ? 'error' : ''}`}
                placeholder="กรอกรหัสผ่าน"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            <div className="login-info">
              <p>📝 สำหรับผู้ดูแลระบบเท่านั้น</p>
              <p>💡 หากลืมรหัสผ่าน กรุณาติดต่อผู้ดูแลระบบหลัก</p>
            </div>
          </div>

          <div className="login-modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <span className="spinner"></span>
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;