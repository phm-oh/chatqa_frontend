import React from 'react';
import './Footer.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import { APP_INFO } from '../../../utils/constants';
import { dateUtils } from '../../../utils/helpers';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'หน้าแรก', href: '#home' },
    { label: 'คลัง FAQ', href: '#faq' },
    { label: 'จัดการระบบ', href: '#admin' }
  ];

  const contactInfo = [
    { icon: '📧', label: 'อีเมล', value: APP_INFO.CONTACT_EMAIL },
    { icon: '📞', label: 'โทรศัพท์', value: APP_INFO.CONTACT_PHONE }
  ];

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section footer-brand">
            <div className="brand-info">
              <div className="brand-icon">💬</div>
              <div>
                <h3 className="brand-name">{APP_INFO.NAME}</h3>
                <p className="brand-desc">{APP_INFO.DESCRIPTION}</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-title">เมนูหลัก</h4>
            <ul className="footer-links">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="footer-title">ติดต่อเรา</h4>
            <ul className="contact-list">
              {contactInfo.map((contact, index) => (
                <li key={index} className="contact-item">
                  <span className="contact-icon">{contact.icon}</span>
                  <div className="contact-details">
                    <span className="contact-label">{contact.label}:</span>
                    <span className="contact-value">{contact.value}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* System Info */}
          <div className="footer-section">
            <h4 className="footer-title">ข้อมูลระบบ</h4>
            <div className="system-info">
              <p>เวอร์ชัน {APP_INFO.VERSION}</p>
              <p>อัพเดทล่าสุด: {dateUtils.formatDate(new Date())}</p>
              <div className="status-badge online">
                <span className="status-dot"></span>
                <span>ระบบพร้อมใช้งาน</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} {APP_INFO.NAME}. สงวนลิขสิทธิ์.</p>
          </div>
          
          <div className="footer-meta">
            <span className="footer-powered">
              พัฒนาด้วย ❤️ สำหรับการศึกษา
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;