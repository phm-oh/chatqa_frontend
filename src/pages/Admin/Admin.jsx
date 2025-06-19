import React, { useState, useEffect } from 'react';
import './Admin.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import Loading, { LoadingCard } from '../../components/common/Loading/Loading';
import { questionAPI } from '../../services/api';
import { errorUtils, dateUtils, validationUtils, questionUtils } from '../../utils/helpers';
import { TOAST_TYPES, QUESTION_STATUS, QUESTION_STATUS_OPTIONS, QUESTION_CATEGORIES, SUCCESS_MESSAGES, ADMIN_CONSTANTS } from '../../utils/constants';

const Admin = ({ showToast, isOnline, apiStatus }) => {
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
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadDashboardStats();
    } else {
      loadQuestions();
    }
  }, [activeTab, filters]);

  const loadDashboardStats = async () => {
    if (!isOnline || apiStatus !== 'healthy') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await questionAPI.getStats();
      if (response.success) {
        setDashboardStats(response.data);
      }
    } catch (error) {
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async () => {
    if (!isOnline || apiStatus !== 'healthy') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await questionAPI.getAll(filters);
      if (response.success) {
        setQuestions(response.data);
        setPagination(response.pagination);
      }
    } catch (error) {
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion({
      ...question,
      answer: question.answer || '',
      status: question.status || QUESTION_STATUS.PENDING,
      showInFAQ: question.showInFAQ || false,
      answeredBy: question.answeredBy || ADMIN_CONSTANTS.DEFAULT_ANSWERER,
      adminNotes: question.adminNotes || ''
    });
    setIsModalOpen(true);
  };

  const handleUpdateQuestion = async (formData) => {
    try {
      const response = await questionAPI.update(editingQuestion._id, formData);
      if (response.success) {
        showToast(SUCCESS_MESSAGES.QUESTION_UPDATED, TOAST_TYPES.SUCCESS);
        setIsModalOpen(false);
        setEditingQuestion(null);
        loadQuestions();
      }
    } catch (error) {
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบคำถามนี้?')) return;

    try {
      const response = await questionAPI.delete(id);
      if (response.success) {
        showToast(SUCCESS_MESSAGES.QUESTION_DELETED, TOAST_TYPES.SUCCESS);
        loadQuestions();
      }
    } catch (error) {
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    }
  };

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

    if (!dashboardStats) return null;

    return (
      <div className="dashboard">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview.total}</div>
              <div className="stat-label">คำถามทั้งหมด</div>
            </div>
          </div>

          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview.pending}</div>
              <div className="stat-label">รอตอบ</div>
            </div>
          </div>

          <div className="stat-card answered">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview.answered}</div>
              <div className="stat-label">ตอบแล้ว</div>
            </div>
          </div>

          <div className="stat-card published">
            <div className="stat-icon">🌟</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview.published}</div>
              <div className="stat-label">เผยแพร่แล้ว</div>
            </div>
          </div>

          <div className="stat-card faq">
            <div className="stat-icon">❓</div>
            <div className="stat-content">
              <div className="stat-number">{dashboardStats.overview.faq}</div>
              <div className="stat-label">FAQ</div>
            </div>
          </div>
        </div>

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
          {questions.map(question => (
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
                    <strong>คำตอบ:</strong> {question.answer.substring(0, 100)}...
                  </div>
                )}
              </div>

              <div className="question-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleEditQuestion(question)}
                >
                  แก้ไข
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteQuestion(question._id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button
              className="btn btn-secondary"
              onClick={() => handleFilterChange('page', filters.page - 1)}
              disabled={filters.page === 1}
            >
              ก่อนหน้า
            </button>
            <span>หน้า {filters.page} จาก {pagination.pages}</span>
            <button
              className="btn btn-secondary"
              onClick={() => handleFilterChange('page', filters.page + 1)}
              disabled={filters.page === pagination.pages}
            >
              ถัดไป
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderEditModal = () => {
    if (!isModalOpen || !editingQuestion) return null;

    return (
      <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>แก้ไขคำถาม</h3>
            <button className="modal-close" onClick={() => setIsModalOpen(false)}>×</button>
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
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="showInFAQ"
                    defaultChecked={editingQuestion.showInFAQ}
                  />
                  แสดงใน FAQ
                </label>
              </div>

              <div className="form-group">
                <label htmlFor="adminNotes">หมายเหตุ</label>
                <textarea
                  id="adminNotes"
                  name="adminNotes"
                  defaultValue={editingQuestion.adminNotes}
                  rows="3"
                  className="form-control"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                ยกเลิก
              </button>
              <button type="submit" className="btn btn-primary">
                บันทึก
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
        <div className="admin-header">
          <h1>⚙️ จัดการระบบ</h1>
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

        <div className="admin-content">
          {activeTab === 'dashboard' ? renderDashboard() : renderQuestionList()}
        </div>
      </div>

      {renderEditModal()}
    </div>
  );
};

export default Admin;