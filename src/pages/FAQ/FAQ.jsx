import React, { useState, useEffect } from 'react';
import './FAQ.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import Loading, { LoadingCard } from '../../components/common/Loading/Loading';
import { faqAPI } from '../../services/api';
import { errorUtils, stringUtils, debounce } from '../../utils/helpers';
import { TOAST_TYPES, QUESTION_CATEGORIES, SEARCH_DEFAULTS, CATEGORY_ICONS } from '../../utils/constants';

const FAQ = ({ showToast, isOnline, apiStatus }) => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  // Debounced search
  const debouncedSearch = debounce((term) => {
    if (term.length >= SEARCH_DEFAULTS.MIN_SEARCH_LENGTH || term === '') {
      loadFAQs(1, term, selectedCategory);
    }
  }, SEARCH_DEFAULTS.SEARCH_DELAY);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    loadFAQs(1, searchTerm, selectedCategory);
  }, [selectedCategory]);

  const loadInitialData = async () => {
    if (!isOnline || apiStatus !== 'healthy') {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [faqResponse, categoriesResponse] = await Promise.all([
        faqAPI.getAll({ page: 1, limit: pagination.limit }),
        faqAPI.getCategories()
      ]);

      if (faqResponse.success) {
        setFaqs(faqResponse.data);
        setPagination(faqResponse.pagination || pagination);
      }

      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFAQs = async (page = 1, search = '', category = '') => {
    if (!isOnline || apiStatus !== 'healthy') return;

    try {
      setIsLoading(page === 1);
      
      let response;
      if (search) {
        response = await faqAPI.search(search, { page, limit: pagination.limit, category });
      } else {
        response = await faqAPI.getAll({ page, limit: pagination.limit, category });
      }

      if (response.success) {
        setFaqs(response.data);
        setPagination(response.pagination || pagination);
      }
    } catch (error) {
      showToast(errorUtils.parseError(error), TOAST_TYPES.ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handlePageChange = (newPage) => {
    loadFAQs(newPage, searchTerm, selectedCategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const renderCategories = () => {
  // ใช้ค่าจาก pagination.total แทนการรวม count จาก categories
  const totalCount = pagination.total || categories.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <div className="category-filters">
      <button
        className={`category-btn ${selectedCategory === '' ? 'active' : ''}`}
        onClick={() => handleCategoryChange('')}
      >
        <span className="category-icon">📋</span>
        <span>ทั้งหมด</span>
        <span className="category-count">
          {totalCount}
        </span>
      </button>
      
      {QUESTION_CATEGORIES.map(category => {
        const categoryData = categories.find(cat => cat.category === category);
        const count = categoryData?.count || 0;
        
        return (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            <span className="category-icon">{CATEGORY_ICONS[category]}</span>
            <span>{category}</span>
            <span className="category-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
};

  const renderFAQs = () => {
    if (isLoading) {
      return (
        <div className="faq-loading">
          {Array.from({ length: 5 }, (_, i) => (
            <LoadingCard key={i} height="120px" showImage={false} lines={3} />
          ))}
        </div>
      );
    }

    if (!faqs.length) {
      return (
        <div className="no-results">
          <div className="no-results-icon">🔍</div>
          <h3>ไม่พบ FAQ ที่ตรงกับการค้นหา</h3>
          <p>ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่น</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('');
            }}
          >
            ดู FAQ ทั้งหมด
          </button>
        </div>
      );
    }

    return (
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div 
            key={faq._id} 
            className={`faq-item ${expandedFAQ === faq._id ? 'expanded' : ''}`}
          >
            <button
              className="faq-header"
              onClick={() => toggleFAQ(faq._id)}
              aria-expanded={expandedFAQ === faq._id}
            >
              <div className="faq-question">
                <span className="faq-number">Q{index + 1}</span>
                <span className="question-text">
                  {searchTerm ? 
                    <span dangerouslySetInnerHTML={{
                      __html: stringUtils.highlightSearchTerms(faq.question, searchTerm)
                    }} /> :
                    faq.question
                  }
                </span>
              </div>
              
              <div className="faq-meta">
                <span className="faq-category">{faq.category}</span>
                <span className="expand-icon">
                  {expandedFAQ === faq._id ? '−' : '+'}
                </span>
              </div>
            </button>

            <div className="faq-answer">
              <div className="answer-content">
                <span className="answer-label">A:</span>
                <div className="answer-text">
                  {searchTerm ?
                    <span dangerouslySetInnerHTML={{
                      __html: stringUtils.highlightSearchTerms(faq.answer, searchTerm)
                    }} /> :
                    faq.answer
                  }
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          ← ก่อนหน้า
        </button>
        
        <div className="pagination-info">
          หน้า {pagination.page} จาก {pagination.pages}
          <span className="total-items">({pagination.total} รายการ)</span>
        </div>
        
        <button
          className="pagination-btn"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.pages}
        >
          ถัดไป →
        </button>
      </div>
    );
  };

  return (
    <div className="faq-page">
      <div className="container">
        {/* Header */}
        <div className="faq-header">
          <h1 className="page-title">❓ คลัง FAQ</h1>
          <p className="page-subtitle">
            ค้นหาคำตอบที่คุณต้องการได้ที่นี่ หรือส่งคำถามใหม่หากไม่พบคำตอบ
          </p>
        </div>

        {/* Search */}
        <div className="search-section">
          <div className="search-box">
            <div className="search-icon">🔍</div>
            <input
              type="text"
              placeholder="ค้นหา FAQ..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button
                className="search-clear"
                onClick={() => setSearchTerm('')}
                aria-label="ล้างการค้นหา"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="categories-section">
          <h3 className="section-title">หมวดหมู่</h3>
          {renderCategories()}
        </div>

        {/* Results */}
        <div className="results-section">
          {searchTerm && (
            <div className="search-info">
              ผลการค้นหา "{searchTerm}" 
              {selectedCategory && ` ในหมวดหมู่ "${selectedCategory}"`}
              {!isLoading && ` - พบ ${pagination.total} รายการ`}
            </div>
          )}
          
          {renderFAQs()}
          {renderPagination()}
        </div>
      </div>
    </div>
  );
};

export default FAQ;