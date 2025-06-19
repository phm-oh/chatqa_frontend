import React, { useState } from 'react';
import './QuestionForm.css'; // เปลี่ยนจาก module เป็น CSS ปกติ
import { questionAPI } from '../../../services/api';
import { validationUtils, errorUtils } from '../../../utils/helpers';
import { QUESTION_CATEGORIES, VALIDATION_RULES, TOAST_TYPES, SUCCESS_MESSAGES, FORM_DEFAULTS, APP_INFO } from '../../../utils/constants';
import Loading from '../../common/Loading/Loading';

const QuestionForm = ({ showToast, onSuccess }) => {
  const [formData, setFormData] = useState(FORM_DEFAULTS.QUESTION);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form validation rules
  const validationRules = {
    name: { required: true, type: 'text' },
    email: { required: true, type: 'email' },
    phone: { required: true, type: 'phone' },
    category: { required: true, type: 'text' },
    question: { required: true, type: 'text' }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const { isValid, errors: validationErrors } = validationUtils.validateForm(formData, validationRules);
    setErrors(validationErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast('กรุณาตรวจสอบข้อมูลที่กรอก', TOAST_TYPES.ERROR);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await questionAPI.create(formData);
      
      if (response.success) {
        showToast(SUCCESS_MESSAGES.QUESTION_CREATED, TOAST_TYPES.SUCCESS);
        setFormData(FORM_DEFAULTS.QUESTION);
        setErrors({});
        
        if (onSuccess) {
          onSuccess(response.data);
        }
      }
    } catch (error) {
      const errorMessage = errorUtils.parseError(error);
      showToast(errorMessage, TOAST_TYPES.ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form reset
  const handleReset = () => {
    setFormData(FORM_DEFAULTS.QUESTION);
    setErrors({});
  };

  return (
    <div className="question-form-container">
      <div className="form-header">
        <h2 className="form-title">ส่งคำถามของคุณ</h2>
        <p className="form-subtitle">เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง</p>
      </div>

      <form onSubmit={handleSubmit} className="question-form" noValidate>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            ชื่อ - นามสกุล <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`form-control ${errors.name ? 'error' : ''}`}
            placeholder="กรุณากรอกชื่อ-นามสกุล"
            disabled={isSubmitting}
            maxLength={VALIDATION_RULES.MAX_LENGTH?.name?.value || 100}
          />
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            อีเมล <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`form-control ${errors.email ? 'error' : ''}`}
            placeholder="example@email.com"
            disabled={isSubmitting}
            maxLength={VALIDATION_RULES.MAX_LENGTH?.email?.value || 100}
          />
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone" className="form-label">
            เบอร์โทรศัพท์ <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={`form-control ${errors.phone ? 'error' : ''}`}
            placeholder="081-234-5678"
            disabled={isSubmitting}
            maxLength={VALIDATION_RULES.MAX_LENGTH?.phone?.value || 20}
          />
          {errors.phone && <div className="form-error">{errors.phone}</div>}
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            หมวดหมู่คำถาม <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-control form-select ${errors.category ? 'error' : ''}`}
            disabled={isSubmitting}
          >
            <option value="">เลือกหมวดหมู่</option>
            {QUESTION_CATEGORIES?.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            )) || []}
          </select>
          {errors.category && <div className="form-error">{errors.category}</div>}
        </div>

        {/* Question */}
        <div className="form-group">
          <label htmlFor="question" className="form-label">
            คำถาม <span className="required">*</span>
          </label>
          <textarea
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            className={`form-control ${errors.question ? 'error' : ''}`}
            placeholder="กรุณาอธิบายคำถามของคุณให้ละเอียด..."
            rows="5"
            disabled={isSubmitting}
            maxLength={VALIDATION_RULES.MAX_LENGTH?.question?.value || 1000}
          />
          <div className="char-count">
            {formData.question.length} / {VALIDATION_RULES.MAX_LENGTH?.question?.value || 1000}
          </div>
          {errors.question && <div className="form-error">{errors.question}</div>}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            เคลียร์ฟอร์ม
          </button>
          
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loading variant="spinner" size="small" />
                <span>กำลังส่ง...</span>
              </>
            ) : (
              <>
                <span>📤</span>
                <span>ส่งคำถาม</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Form Notes */}
      <div className="form-notes">
        <h4>📝 หมายเหตุ:</h4>
        <ul>
          <li>กรุณาระบุข้อมูลให้ครบถ้วนเพื่อการติดต่อที่รวดเร็ว</li>
          <li>สำหรับคำถามเร่งด่วน กรุณาโทร {APP_INFO?.CONTACT_PHONE || '02-xxx-xxxx'}</li>
        </ul>
      </div>
    </div>
  );
};

export default QuestionForm;