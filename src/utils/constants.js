// Question categories
export const QUESTION_CATEGORIES = [
  'ข้อมูลทั่วไป',
  'การสมัครเรียน',
  'หลักสูตร',
  'สิ่งอำนวยความสะดวก',
  'อื่นๆ'
];

// Question status
export const QUESTION_STATUS = {
  PENDING: 'รอตอบ',
  ANSWERED: 'ตอบแล้ว',
  PUBLISHED: 'เผยแพร่'
};

// Question status options for select
export const QUESTION_STATUS_OPTIONS = [
  { value: QUESTION_STATUS.PENDING, label: 'รอตอบ', color: 'warning' },
  { value: QUESTION_STATUS.ANSWERED, label: 'ตอบแล้ว', color: 'success' },
  { value: QUESTION_STATUS.PUBLISHED, label: 'เผยแพร่', color: 'primary' }
];

// Category icons mapping
export const CATEGORY_ICONS = {
  'ข้อมูลทั่วไป': '📋',
  'การสมัครเรียน': '📝',
  'หลักสูตร': '📚',
  'สิ่งอำนวยความสะดวก': '🏢',
  'อื่นๆ': '❓'
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
  LIMITS: [5, 10, 20, 50],
};

// Form validation rules
export const VALIDATION_RULES = {
  REQUIRED_FIELDS: {
    name: 'กรุณากรอกชื่อ-นามสกุล',
    email: 'กรุณากรอกอีเมล',
    phone: 'กรุณากรอกเบอร์โทรศัพท์',
    category: 'กรุณาเลือกหมวดหมู่',
    question: 'กรุณากรอกคำถาม'
  },
  
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  EMAIL_MESSAGE: 'รูปแบบอีเมลไม่ถูกต้อง',
  
  PHONE_PATTERN: /^[0-9-+().\s]+$/,
  PHONE_MESSAGE: 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง',
  
  MIN_LENGTH: {
    name: { value: 2, message: 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร' },
    question: { value: 10, message: 'คำถามต้องมีอย่างน้อย 10 ตัวอักษร' },
    answer: { value: 10, message: 'คำตอบต้องมีอย่างน้อย 10 ตัวอักษร' }
  },
  
  MAX_LENGTH: {
    name: { value: 100, message: 'ชื่อต้องไม่เกิน 100 ตัวอักษร' },
    email: { value: 100, message: 'อีเมลต้องไม่เกิน 100 ตัวอักษร' },
    phone: { value: 20, message: 'เบอร์โทรศัพท์ต้องไม่เกิน 20 ตัวอักษร' },
    question: { value: 1000, message: 'คำถามต้องไม่เกิน 1000 ตัวอักษร' },
    answer: { value: 2000, message: 'คำตอบต้องไม่เกิน 2000 ตัวอักษร' },
    adminNotes: { value: 500, message: 'หมายเหตุต้องไม่เกิน 500 ตัวอักษร' }
  }
};

// Toast notification types
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Toast default settings
export const TOAST_DEFAULTS = {
  DURATION: 5000, // 5 seconds
  POSITION: 'top-right'
};

// Local storage keys
export const STORAGE_KEYS = {
  ADMIN_AUTH: 'chatqa_admin_auth',
  THEME: 'chatqa_theme',
  LANGUAGE: 'chatqa_language',
  RECENT_SEARCHES: 'chatqa_recent_searches',
  USER_PREFERENCES: 'chatqa_user_preferences'
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  API: 'YYYY-MM-DD',
  API_WITH_TIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
};

// ⭐ API endpoints - เปลี่ยนเป็น relative path
export const API_ENDPOINTS = {
  BASE: '/api',  // แทนที่จะเป็น 'http://localhost:5555/api'
  QUESTIONS: '/questions',
  FAQ: '/faq',
  HEALTH: '/health'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
  TIMEOUT: 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง',
  SERVER_ERROR: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง',
  NOT_FOUND: 'ไม่พบข้อมูลที่ต้องการ',
  FORBIDDEN: 'คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้',
  VALIDATION: 'ข้อมูลที่กรอกไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง',
  UNKNOWN: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ'
};

// Success messages
export const SUCCESS_MESSAGES = {
  QUESTION_CREATED: 'ส่งคำถามเรียบร้อยแล้ว เจ้าหน้าที่จะติดต่อกลับภายใน 24 ชั่วโมง',
  QUESTION_UPDATED: 'อัพเดทคำถามเรียบร้อยแล้ว',
  QUESTION_DELETED: 'ลบคำถามเรียบร้อยแล้ว',
  FAQ_PUBLISHED: 'เผยแพร่ FAQ เรียบร้อยแล้ว',
  DATA_SAVED: 'บันทึกข้อมูลเรียบร้อยแล้ว',
  DATA_LOADED: 'โหลดข้อมูลเรียบร้อยแล้ว'
};

// Loading messages
export const LOADING_MESSAGES = {
  QUESTIONS: 'กำลังโหลดคำถาม...',
  FAQ: 'กำลังโหลด FAQ...',
  SAVING: 'กำลังบันทึก...',
  DELETING: 'กำลังลบ...',
  UPDATING: 'กำลังอัพเดท...',
  SEARCHING: 'กำลังค้นหา...',
  PUBLISHING: 'กำลังเผยแพร่...'
};

// Application metadata
export const APP_INFO = {
  NAME: 'ระบบ ChatQ&A วิทยาลัยอาชีวศึกษาอุดรธานี',
  VERSION: '1.0.0',
  DESCRIPTION: 'ระบบถาม-ตอบออนไลน์สำหรับสถานศึกษา',
  CONTACT_EMAIL: 'udvc@udvc.ac.th',
  CONTACT_PHONE: '0-4224-6690'
};

// UI Constants
export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
  FOOTER_HEIGHT: 60,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  
  // Animation durations (ms)
  ANIMATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350
  },
  
  // Z-index layers
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080
  }
};

// Search and filter defaults
export const SEARCH_DEFAULTS = {
  MIN_SEARCH_LENGTH: 2,
  SEARCH_DELAY: 300, // ms delay for search input
  MAX_SEARCH_RESULTS: 50,
  SEARCH_PLACEHOLDER: 'ค้นหาคำถาม...',
  FAQ_SEARCH_PLACEHOLDER: 'ค้นหาในคลัง FAQ...'
};

// Admin panel constants
export const ADMIN_CONSTANTS = {
  DEFAULT_ANSWERER: 'เจ้าหน้าที่',
  ITEMS_PER_PAGE_OPTIONS: [10, 25, 50, 100],
  EXPORT_FORMATS: ['CSV', 'Excel', 'PDF'],
  
  // Dashboard refresh interval (ms)
  DASHBOARD_REFRESH_INTERVAL: 30000, // 30 seconds
  
  // Permission levels
  PERMISSIONS: {
    VIEW: 'view',
    EDIT: 'edit',
    DELETE: 'delete',
    PUBLISH: 'publish',
    ADMIN: 'admin'
  }
};

// FAQ specific constants
export const FAQ_CONSTANTS = {
  POPULAR_LIMIT: 10,
  RECENT_LIMIT: 5,
  CATEGORIES_DISPLAY_LIMIT: 6,
  SEARCH_HIGHLIGHT_CLASS: 'search-highlight'
};

// Feature flags
export const FEATURES = {
  ENABLE_NOTIFICATIONS: true,
  ENABLE_DARK_MODE: false,
  ENABLE_EXPORT: true,
  ENABLE_ANALYTICS: false,
  ENABLE_FILE_UPLOAD: false,
  ENABLE_EMAIL_NOTIFICATIONS: true
};

// Default values for forms
export const FORM_DEFAULTS = {
  QUESTION: {
    name: '',
    email: '',
    phone: '',
    category: '',
    question: ''
  },
  
  ADMIN_UPDATE: {
    answer: '',
    status: QUESTION_STATUS.ANSWERED,
    showInFAQ: false,
    answeredBy: ADMIN_CONSTANTS.DEFAULT_ANSWERER,
    adminNotes: ''
  }
};

// Export all as default for easier importing
export default {
  QUESTION_CATEGORIES,
  QUESTION_STATUS,
  QUESTION_STATUS_OPTIONS,
  CATEGORY_ICONS,
  PAGINATION_DEFAULTS,
  VALIDATION_RULES,
  TOAST_TYPES,
  TOAST_DEFAULTS,
  STORAGE_KEYS,
  DATE_FORMATS,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOADING_MESSAGES,
  APP_INFO,
  UI_CONSTANTS,
  SEARCH_DEFAULTS,
  ADMIN_CONSTANTS,
  FAQ_CONSTANTS,
  FEATURES,
  FORM_DEFAULTS
};