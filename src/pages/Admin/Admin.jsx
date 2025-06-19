// pages/Admin/Admin.jsx - แก้ปัญหา JWT Error และ Modal ค้าง
import React, { useState, useEffect } from 'react';
import './Admin.css';
import Loading, { LoadingCard } from '../../components/common/Loading/Loading';
import { questionAPI } from '../../services/api';
import { errorUtils, dateUtils, validationUtils, questionUtils } from '../../utils/helpers';
import { TOAST_TYPES, QUESTION_STATUS, QUESTION_STATUS_OPTIONS, QUESTION_CATEGORIES, SUCCESS_MESSAGES, ADMIN_CONSTANTS } from '../../utils/constants';
import { useAuth } from '../../contexts/AuthContext';

const Admin = ({ showToast, isOnline, apiStatus, user, onLogout }) => {
  const { hasPermission, getAuthHeader, isAuthenticated, token } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // เพิ่ม state สำหรับ submit
  const [pagination, setPagination] = useState({});

  // ✅ FIX: เพิ่มฟังก์ชันตรวจสอบ auth state
  const checkAuthState = () => {
    if (!isAuthenticated || !token) {
      showToast('กรุณาเข้าสู่ระบบใหม่', TOAST_TYPES.ERROR);
      onLogout();
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (!checkAuthState()) return;
    
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else {
      loadQuestions();
    }
  }, [activeTab, filters]);

  const loadDashboardStats = async () => {
    if (!isOnline || apiStatus !== 'healthy' || !checkAuthState()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // ✅ FIX: ใช้ fetch แทน questionAPI.getStats และส่ง headers ที่ถูกต้อง
      const authHeaders = getAuthHeader();
      const response = await fetch('/api/questions/stats/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (response.status === 401) {
        showToast('กรุณาเข้าสู่ระบบใหม่', TOAST_TYPES.ERROR);
        onLogout();
        return;
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setDashboardStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to load dashboard stats');
      }
    } catch (error) {
      console.error('Dashboard stats error:', error);
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!isOnline || apiStatus !== 'healthy' || !checkAuthState()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // ✅ FIX: ใช้ fetch แทน questionAPI.getAll และส่ง headers ที่ถูกต้อง
      const authHeaders = getAuthHeader();
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      const response = await fetch(`/api/questions?${queryParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (response.status === 401) {
        showToast('กรุณาเข้าสู่ระบบใหม่', TOAST_TYPES.ERROR);
        onLogout();
        return;
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        setQuestions(data.data || []);
        setPagination(data.pagination || {});
      } else {
        throw new Error(data.message || 'Failed to load questions');
      }
    } catch (error) {
      console.error('Load questions error:', error);
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleEditQuestion = (question) => {
    if (!hasPermission('edit')) {
      showToast('คุณไม่มีสิทธิ์แก้ไขคำถาม', TOAST_TYPES.ERROR);
      return;
    }

    if (!checkAuthState()) return;

    setEditingQuestion({
      ...question,
      answer: question.answer || '',
      status: question.status || QUESTION_STATUS.PENDING,
      showInFAQ: question.showInFAQ || false,
      answeredBy: question.answeredBy || user?.username || ADMIN_CONSTANTS.DEFAULT_ANSWERER,
      adminNotes: question.adminNotes || ''
    });
    setIsModalOpen(true);
  };

  // ✅ FIX: แก้ไขฟังก์ชัน handleUpdateQuestion ให้ handle error และปิด modal ถูกต้อง
  const handleUpdateQuestion = async (formData) => {
    if (!hasPermission('edit')) {
      showToast('คุณไม่มีสิทธิ์แก้ไขคำถาม', TOAST_TYPES.ERROR);
      return;
    }

    if (!checkAuthState()) return;

    setIsSubmitting(true);

    try {
      const authHeaders = getAuthHeader();
      
      // ✅ FIX: Debug log เพื่อตรวจสอบ token
      console.log('Auth headers:', authHeaders);
      console.log('Token exists:', !!token);
      console.log('Question ID:', editingQuestion._id);

      const response = await fetch(`/api/questions/${editingQuestion._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      if (response.status === 401) {
        showToast('กรุณาเข้าสู่ระบบใหม่', TOAST_TYPES.ERROR);
        setIsModalOpen(false); // ✅ ปิด modal ก่อน logout
        setEditingQuestion(null);
        onLogout();
        return;
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (response.ok && data.success) {
        showToast(SUCCESS_MESSAGES.QUESTION_UPDATED || 'อัพเดทคำถามสำเร็จ', TOAST_TYPES.SUCCESS);
        setIsModalOpen(false);
        setEditingQuestion(null);
        loadQuestions(); // reload questions
      } else {
        throw new Error(data.message || 'Failed to update question');
      }
    } catch (error) {
      console.error('Update question error:', error);
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsSubmitting(false);
      // ✅ FIX: บังคับปิด modal ในกรณีที่เกิด error
      setIsModalOpen(false);
      setEditingQuestion(null);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!hasPermission('delete')) {
      showToast('คุณไม่มีสิทธิ์ลบคำถาม', TOAST_TYPES.ERROR);
      return;
    }

    if (!checkAuthState()) return;

    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคำถามนี้?')) return;

    try {
      const authHeaders = getAuthHeader();
      
      const response = await fetch(`/api/questions/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        }
      });

      if (response.status === 401) {
        showToast('กรุณาเข้าสู่ระบบใหม่', TOAST_TYPES.ERROR);
        onLogout();
        return;
      }

      const data = await response.json();
      
      if (response.ok && data.success) {
        showToast(SUCCESS_MESSAGES.QUESTION_DELETED || 'ลบคำถามสำเร็จ', TOAST_TYPES.SUCCESS);
        loadQuestions();
      } else {
        throw new Error(data.message || 'Failed to delete question');
      }
    } catch (error) {
      console.error('Delete question error:', error);
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    }
  };

  // ✅ FIX: เพิ่มฟังก์ชันปิด modal แบบ force
  const handleCloseModal = () => {
    if (isSubmitting) return; // ห้ามปิดขณะ submit
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  const renderAdminHeader = () => (
    <div className="admin-header">
      <div className="admin-header-content">
        <div className="admin-title-section">
          <h1>⚙️ จัดการระบบ</h1>
          <div className="admin-user-info">
            <span className="user-greeting">
              👋 สวัสดี <strong>{user?.username || 'ผู้ดูแล'}</strong>
            </span>
            <span className="user-role">
              {user?.role === 'super_admin' && '👑 Super Admin'}
              {user?.role === 'admin' && '🛡️ Admin'}
              {user?.role === 'moderator' && '⭐ Moderator'}
            </span>
          </div>
        </div>
        
        <div className="admin-actions">
          <button 
            className="btn btn-secondary"
            onClick={onLogout}
          >
            🚪 ออกจากระบบ
          </button>
        </div>
      </div>
      
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 ภาพรวม
        </button>
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          📝 จัดการคำถาม
        </button>
      </div>
    </div>
  );

  const renderDashboard = () => {
    if (isLoading) {
      return (
        <div className="dashboard-loading">
          {Array.from({ length: 6 }, (_, i) => (
            <LoadingCard key={i} height="120px" showImage={false} lines={2} />
          ))}
        </div>
      );
    }

    if (!dashboardStats) {
      return (
        <div className="no-data">
          <p>ไม่สามารถโหลดข้อมูลสถิติได้</p>
          <button className="btn btn-primary" onClick={loadDashboardStats}>
            ลองใหม่
          </button>
        </div>
      );
    }

    return (
      <div className="dashboard">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview?.total || 0}</div>
              <div className="stat-label">คำถามทั้งหมด</div>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview?.pending || 0}</div>
              <div className="stat-label">รอตอบ</div>
            </div>
          </div>

          <div className="stat-card answered">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview?.answered || 0}</div>
              <div className="stat-label">ตอบแล้ว</div>
            </div>
          </div>

          <div className="stat-card published">
            <div className="stat-icon">🌟</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview?.published || 0}</div>
              <div className="stat-label">เผยแพร่แล้ว</div>
            </div>
          </div>

          <div className="stat-card faq">
            <div className="stat-icon">❓</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview?.faq || 0}</div>
              <div className="stat-label">FAQ</div>
            </div>
          </div>
        </div>

        {dashboardStats.categoryStats && dashboardStats.categoryStats.length > 0 && (
          <div className="category-stats">
            <h3>สถิติตามหมวดหมู่</h3>
            <div className="category-grid">
              {dashboardStats.categoryStats.map(stat => (
                <div key={stat.category} className="category-stat">
                  <div className="category-name">{stat.category}</div>
                  <div className="category-count">{stat.count}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderQuestionList = () => {
    if (isLoading) {
      return <Loading message="กำลังโหลดคำถาม..." />;
    }

    return (
      <div className="question-management">
        {/* Filters */}
        <div className="filters">
          <input
            type="text"
            placeholder="ค้นหาคำถาม..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="filter-input"
          />
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">ทุกสถานะ</option>
            {QUESTION_STATUS_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
          >
            <option value="">ทุกหมวดหมู่</option>
            {QUESTION_CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Question List */}
        <div className="question-list">
          {questions.length === 0 ? (
            <div className="no-data">
              <p>ไม่พบคำถามตามเงื่อนไขที่กำหนด</p>
            </div>
          ) : (
            questions.map(question => (
              <div key={question._id} className="question-item">
                <div className="question-header">
                  <div className="question-info">
                    <h4>{question.name}</h4>
                    <span className="question-email">{question.email}</span>
                    <span className="question-date">
                      {dateUtils.formatDate(question.dateCreated, 'DD/MM/YYYY HH:mm')}
                    </span>
                  </div>
                  
                  <div className="question-meta">
                    <span className={`status-badge ${questionUtils.getStatusColor(question.status)}`}>
                      {question.status}
                    </span>
                    <span className="category-badge">{question.category}</span>
                  </div>
                </div>

                <div className="question-content">
                  <p className="question-text">{question.question}</p>
                  {question.answer && (
                    <div className="answer-preview">
                      <strong>คำตอบ:</strong> {question.answer.substring(0, 100)}
                      {question.answer.length > 100 && '...'}
                    </div>
                  )}
                </div>

                <div className="question-actions">
                  {hasPermission('edit') && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleEditQuestion(question)}
                    >
                      ✏️ แก้ไข
                    </button>
                  )}
                  {hasPermission('delete') && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteQuestion(question._id)}
                    >
                      🗑️ ลบ
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
            >
              ◀ ก่อนหน้า
            </button>
            <span>หน้า {filters.page} จาก {pagination.pages}</span>
            <button
              className="btn btn-secondary"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === pagination.pages}
            >
              ถัดไป ▶
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEditModal = () => {
    if (!isModalOpen || !editingQuestion) return null;

    return (
      <div className="modal-overlay" onClick={handleCloseModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>✏️ แก้ไขคำถาม</h3>
            <button 
              className="modal-close" 
              onClick={handleCloseModal}
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            handleUpdateQuestion({
              answer: formData.get('answer'),
              status: formData.get('status'),
              showInFAQ: formData.get('showInFAQ') === 'on',
              answeredBy: formData.get('answeredBy'),
              adminNotes: formData.get('adminNotes')
            });
          }}>
            <div className="modal-body">
              <div className="form-group">
                <label>คำถาม:</label>
                <p className="question-display">{editingQuestion.question}</p>
              </div>

              <div className="form-group">
                <label htmlFor="answer">คำตอบ *</label>
                <textarea
                  id="answer"
                  name="answer"
                  defaultValue={editingQuestion.answer}
                  rows="5"
                  className="form-control"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="status">สถานะ</label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={editingQuestion.status}
                    className="form-control"
                    disabled={isSubmitting}
                  >
                    {QUESTION_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="answeredBy">ผู้ตอบ</label>
                  <input
                    type="text"
                    id="answeredBy"
                    name="answeredBy"
                    defaultValue={editingQuestion.answeredBy}
                    className="form-control"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {hasPermission('publish') && (
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="showInFAQ"
                      defaultChecked={editingQuestion.showInFAQ}
                      disabled={isSubmitting}
                    />
                    แสดงใน FAQ
                  </label>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="adminNotes">หมายเหตุ</label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  defaultValue={editingQuestion.adminNotes}
                  rows="3"
                  className="form-control"
                  placeholder="หมายเหตุสำหรับผู้ดูแล..."
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCloseModal}
                disabled={isSubmitting}
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>🔄 กำลังบันทึก...</>
                ) : (
                  <>💾 บันทึก</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="container">
        {renderAdminHeader()}

        <div className="admin-content">
          {activeTab === 'dashboard' ? renderDashboard() : renderQuestionList()}
        </div>
      </div>

      {renderEditModal()}
    </div>
  );
};

export default Admin;