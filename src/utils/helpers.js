import { 
  VALIDATION_RULES, 
  DATE_FORMATS, 
  ERROR_MESSAGES,
  QUESTION_STATUS,
  CATEGORY_ICONS 
} from './constants.js';

// Date utilities
export const dateUtils = {
  // Format date for display
  formatDate: (date, format = DATE_FORMATS.DISPLAY) => {
    if (!date) return '';
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    switch (format) {
      case DATE_FORMATS.DISPLAY:
        return `${day}/${month}/${year}`;
      case DATE_FORMATS.DISPLAY_WITH_TIME:
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case DATE_FORMATS.API:
        return d.toISOString().split('T')[0];
      case DATE_FORMATS.API_WITH_TIME:
        return d.toISOString();
      default:
        return `${day}/${month}/${year}`;
    }
  },

  // Get relative time (เช่น "2 ชั่วโมงที่แล้ว")
  getRelativeTime: (date) => {
    if (!date) return '';
    
    const now = new Date();
    const target = new Date(date);
    const diffMs = now - target;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'เมื่อสักครู่';
    if (diffMins < 60) return `${diffMins} นาทีที่แล้ว`;
    if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
    if (diffDays < 30) return `${diffDays} วันที่แล้ว`;
    
    return dateUtils.formatDate(date);
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const targetDate = new Date(date);
    return today.toDateString() === targetDate.toDateString();
  },

  // Check if date is this week
  isThisWeek: (date) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const targetDate = new Date(date);
    return targetDate >= oneWeekAgo && targetDate <= now;
  }
};

// Form validation utilities
export const validationUtils = {
  // Validate required field
  validateRequired: (value, fieldName) => {
    if (!value || value.toString().trim() === '') {
      return VALIDATION_RULES.REQUIRED_FIELDS[fieldName] || 'กรุณากรอกข้อมูล';
    }
    return null;
  },

  // Validate email format
  validateEmail: (email) => {
    if (!email) return 'กรุณากรอกอีเมล';
    
    if (!VALIDATION_RULES.EMAIL_PATTERN.test(email)) {
      return VALIDATION_RULES.EMAIL_MESSAGE;
    }
    
    if (email.length > VALIDATION_RULES.MAX_LENGTH.email.value) {
      return VALIDATION_RULES.MAX_LENGTH.email.message;
    }
    
    return null;
  },

  // Validate phone number
  validatePhone: (phone) => {
    if (!phone) return 'กรุณากรอกเบอร์โทรศัพท์';
    
    if (!VALIDATION_RULES.PHONE_PATTERN.test(phone)) {
      return VALIDATION_RULES.PHONE_MESSAGE;
    }
    
    if (phone.length > VALIDATION_RULES.MAX_LENGTH.phone.value) {
      return VALIDATION_RULES.MAX_LENGTH.phone.message;
    }
    
    return null;
  },

  // Validate text length
  validateLength: (value, fieldName, required = true) => {
    if (!value || value.trim() === '') {
      return required ? (VALIDATION_RULES.REQUIRED_FIELDS[fieldName] || 'กรุณากรอกข้อมูล') : null;
    }
    
    const trimmedValue = value.trim();
    const minRule = VALIDATION_RULES.MIN_LENGTH[fieldName];
    const maxRule = VALIDATION_RULES.MAX_LENGTH[fieldName];
    
    if (minRule && trimmedValue.length < minRule.value) {
      return minRule.message;
    }
    
    if (maxRule && trimmedValue.length > maxRule.value) {
      return maxRule.message;
    }
    
    return null;
  },

  // Validate entire form
  validateForm: (formData, rules) => {
    const errors = {};
    let isValid = true;
    
    Object.keys(rules).forEach(fieldName => {
      const rule = rules[fieldName];
      const value = formData[fieldName];
      let error = null;
      
      if (rule.required) {
        error = validationUtils.validateRequired(value, fieldName);
      }
      
      if (!error && value) {
        switch (rule.type) {
          case 'email':
            error = validationUtils.validateEmail(value);
            break;
          case 'phone':
            error = validationUtils.validatePhone(value);
            break;
          case 'text':
            error = validationUtils.validateLength(value, fieldName, rule.required);
            break;
        }
      }
      
      if (error) {
        errors[fieldName] = error;
        isValid = false;
      }
    });
    
    return { isValid, errors };
  }
};

// String utilities
export const stringUtils = {
  // Truncate text
  truncate: (text, maxLength = 100, suffix = '...') => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Capitalize first letter
  capitalize: (text) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  // Convert to title case
  toTitleCase: (text) => {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Remove HTML tags
  stripHtml: (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  },

  // Highlight search terms
  highlightSearchTerms: (text, searchTerm, className = 'search-highlight') => {
    if (!text || !searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  },

  // Generate slug from text
  generateSlug: (text) => {
    if (!text) return '';
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }
};

// Array utilities
export const arrayUtils = {
  // Group array by key
  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },

  // Sort array by key
  sortBy: (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Remove duplicates from array
  unique: (array, key = null) => {
    if (!key) {
      return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },

  // Chunk array into smaller arrays
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
};

// URL utilities
export const urlUtils = {
  // Get query parameters
  getQueryParams: (url = window.location.search) => {
    const params = new URLSearchParams(url);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Build URL with query parameters
  buildUrl: (baseUrl, params = {}) => {
    const url = new URL(baseUrl, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      }
    });
    return url.toString();
  },

  // Update browser URL without page reload
  updateUrl: (params = {}, replace = false) => {
    const url = new URL(window.location);
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.set(key, value);
      } else {
        url.searchParams.delete(key);
      }
    });
    
    if (replace) {
      window.history.replaceState({}, '', url);
    } else {
      window.history.pushState({}, '', url);
    }
  }
};

// Local storage utilities
export const storageUtils = {
  // Get item from localStorage
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // Set item in localStorage
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error writing to localStorage:', error);
      return false;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }
};

// Question/FAQ specific utilities
export const questionUtils = {
  // Get status badge color
  getStatusColor: (status) => {
    switch (status) {
      case QUESTION_STATUS.PENDING:
        return 'warning';
      case QUESTION_STATUS.ANSWERED:
        return 'success';
      case QUESTION_STATUS.PUBLISHED:
        return 'primary';
      default:
        return 'secondary';
    }
  },

  // Get category icon
  getCategoryIcon: (category) => {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS['อื่นๆ'];
  },

  // Filter questions by criteria
  filterQuestions: (questions, filters) => {
    return questions.filter(question => {
      if (filters.status && question.status !== filters.status) {
        return false;
      }
      
      if (filters.category && question.category !== filters.category) {
        return false;
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = `${question.name} ${question.question} ${question.answer}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      if (filters.dateFrom) {
        const questionDate = new Date(question.dateCreated);
        const filterDate = new Date(filters.dateFrom);
        if (questionDate < filterDate) {
          return false;
        }
      }
      
      if (filters.dateTo) {
        const questionDate = new Date(question.dateCreated);
        const filterDate = new Date(filters.dateTo);
        if (questionDate > filterDate) {
          return false;
        }
      }
      
      return true;
    });
  },

  // Sort questions by criteria
  sortQuestions: (questions, sortBy = 'dateCreated', direction = 'desc') => {
    return arrayUtils.sortBy(questions, sortBy, direction);
  }
};

// Error handling utilities
export const errorUtils = {
  // Parse error messages
  parseError: (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }
    
    // Check for common HTTP status codes
    if (error?.status || error?.response?.status) {
      const status = error.status || error.response.status;
      switch (status) {
        case 400:
          return ERROR_MESSAGES.VALIDATION;
        case 401:
          return ERROR_MESSAGES.FORBIDDEN;
        case 404:
          return ERROR_MESSAGES.NOT_FOUND;
        case 500:
          return ERROR_MESSAGES.SERVER_ERROR;
        case 0:
        case 'ERR_NETWORK':
          return ERROR_MESSAGES.NETWORK;
        default:
          return ERROR_MESSAGES.UNKNOWN;
      }
    }
    
    return ERROR_MESSAGES.UNKNOWN;
  },

  // Check if error is network related
  isNetworkError: (error) => {
    return error?.code === 'ERR_NETWORK' || 
           error?.message?.includes('fetch') ||
           error?.status === 0;
  },

  // Log error to console with context
  logError: (error, context = '') => {
    console.error(`[${new Date().toISOString()}] ${context}:`, error);
  }
};

// Debounce utility
export const debounce = (func, wait, immediate = false) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func(...args);
  };
};

// Throttle utility
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// DOM utilities
export const domUtils = {
  // Scroll to element
  scrollToElement: (element, offset = 0) => {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const absoluteElementTop = rect.top + window.pageYOffset;
    const middle = absoluteElementTop - (window.innerHeight / 2) + offset;
    
    window.scrollTo({
      top: middle,
      behavior: 'smooth'
    });
  },

  // Check if element is in viewport
  isInViewport: (element) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Add/remove class with animation
  animateClass: (element, className, duration = 300) => {
    if (!element) return;
    
    element.classList.add(className);
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }
};

// Export all utilities
export default {
  dateUtils,
  validationUtils,
  stringUtils,
  arrayUtils,
  urlUtils,
  storageUtils,
  questionUtils,
  errorUtils,
  debounce,
  throttle,
  domUtils
};