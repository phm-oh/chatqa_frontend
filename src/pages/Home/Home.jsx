import React, { useState, useEffect } from 'react';
import './Home.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import QuestionForm from '../../components/forms/QuestionForm/QuestionForm';
import Loading, { LoadingCard } from '../../components/common/Loading/Loading';
import { faqAPI, questionAPI } from '../../services/api'; 
import { errorUtils, stringUtils, dateUtils } from '../../utils/helpers';
import { TOAST_TYPES } from '../../utils/constants';

const Home = ({ showToast, navigateTo, isOnline, apiStatus }) => {
  const [popularFAQs, setPopularFAQs] = useState([]);
  const [isLoadingFAQs, setIsLoadingFAQs] = useState(true);
  const [LoadingStats ,setIsLoadingStats] =useState(true);
  const [stats, setStats] = useState({
    totalQuestions: 0,
    avgResponseTime: '12 ชั่วโมง',
    satisfactionRate: '86%'
  });

  // Load popular FAQs
  useEffect(() => {
    loadPopularFAQs();
    loadStats();
  }, []);

  const loadPopularFAQs = async () => {
    if (!isOnline || apiStatus !== 'healthy') {
      setIsLoadingFAQs(false);
      return;
    }

    try {
      setIsLoadingFAQs(true);
      const response = await faqAPI.getPopular();
      
      if (response.success) {
        setPopularFAQs(response.data.slice(0, 5)); // Show only 5
      }
    } catch (error) {
      const errorMessage = errorUtils.parseError(error);
      showToast(errorMessage, TOAST_TYPES.ERROR);
    } finally {
      setIsLoadingFAQs(false);
    }
  };

    const loadStats = async () => {
    if (!isOnline || apiStatus !== 'healthy') {
      setIsLoadingStats(false);
      return;
    }

    try {
      setIsLoadingStats(true);
      const response = await questionAPI.getStats();
      
      if (response.success) {
        setStats(prev => ({
          ...prev,
          totalQuestions: response.data.overview.published // ใช้ค่า published จาก API
        }));
      }
    } catch (error) {
      const errorMessage = errorUtils.parseError(error);
      showToast(errorMessage, TOAST_TYPES.ERROR);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleQuestionSuccess = () => {
    // Optionally refresh stats or do something after successful submission
    loadStats();
  };

  const renderPopularFAQs = () => {
    if (isLoadingFAQs) {
      return (
        <div className="faq-loading">
          {Array.from({ length: 3 }, (_, i) => (
            <LoadingCard key={i} height="120px" showImage={false} lines={2} />
          ))}
        </div>
      );
    }

    if (!popularFAQs.length) {
      return (
        <div className="no-faqs">
          <p>🤔 ยังไม่มี FAQ คำถามที่ถามบ่อย</p>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigateTo('faq')}
          >
            ดูคลัง FAQ
          </button>
        </div>
      );
    }

    return popularFAQs.map((faq, index) => (
      <div key={faq._id} className="faq-item">
        <div className="faq-number">#{index + 1}</div>
        <div className="faq-content">
          <h4 className="faq-question">
            {stringUtils.truncate(faq.question, 80)}
          </h4>
          <p className="faq-answer">
            {stringUtils.truncate(faq.answer, 120)}
          </p>
          <div className="faq-meta">
            <span className="faq-category">{faq.category}</span>
            <span className="faq-date">{dateUtils.getRelativeTime(faq.dateAnswered)}</span>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                🎓 ระบบถาม-ตอบออนไลน์
                <br />
                <span className="hero-highlight">สำหรับสถานศึกษา</span>
              </h1>
              <p className="hero-description">
                ส่งคำถามของคุณที่ต้องการถาม หรือดูใน
                คลัง FAQ 
              </p>
              
              <div className="hero-stats">
                <div className="stat-item">
                  <div className="stat-number">{stats.totalQuestions}+</div>
                  <div className="stat-label">คำถามที่ตอบแล้ว</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{stats.avgResponseTime}</div>
                  <div className="stat-label">เวลาตอบเฉลี่ย</div>
                </div>
                {/* <div className="stat-item">
                  <div className="stat-number">{stats.satisfactionRate}</div>
                  <div className="stat-label">ความพึงพอใจ</div>
                </div> */}
              </div>

              <div className="hero-actions">
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => document.getElementById('question-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  📝 ส่งคำถามเลย
                </button>
                <button 
                  className="btn btn-secondary btn-lg"
                  onClick={() => navigateTo('faq')}
                >
                  ❓ ดูคลัง FAQ
                </button>
              </div>
            </div>

            <div className="hero-image">
              <div className="hero-illustration">
                <div className="illustration-bubble bubble-1">💬</div>
                <div className="illustration-bubble bubble-2">🤔</div>
                <div className="illustration-bubble bubble-3">💡</div>
                <div className="illustration-main">
                  <div className="illustration-icon">🎓</div>
                  <div className="illustration-text">24/7</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">🎓 จุดเด่นของระบบ</h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>ตอบเร็วทันใจ</h3>
              <p>เจ้าหน้าที่ตอบกลับภายใน 24 ชั่วโมง พร้อมแจ้งเตือนทาง Email</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>คลังความรู้</h3>
              <p>FAQ ครบครันจัดหมวดหมู่ชัดเจน ค้นหาข้อมูลการศึกษาได้รวดเร็ว</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👨‍🏫</div>
              <h3>เจ้าหน้าที่พร้อมจะให้คำตอบ</h3>
              <p>เต็มใจให้บริการคำปรึกษาด้านการศึกษา</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>เข้าถึงง่าย</h3>
              <p>ใช้งานได้ทุกที่ทุกเวลา รองรับทุกอุปกรณ์ มือถือ แท็บเล็ต คอมพิวเตอร์</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular FAQ Section */}
      <section className="popular-faq-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">🔥 FAQ คำถามที่ถามบ่อย</h2>
            <button 
              className="btn btn-primary"
              onClick={() => navigateTo('faq')}
            >
              ดูทั้งหมด
            </button>
          </div>

          <div className="popular-faqs">
            {renderPopularFAQs()}
          </div>
        </div>
      </section>

      {/* Question Form Section */}
      <section className="form-section" id="question-form">
        <div className="container-sm">
          <QuestionForm 
            showToast={showToast}
            onSuccess={handleQuestionSuccess}
          />
        </div>
      </section>
    </div>
  );
};

export default Home;