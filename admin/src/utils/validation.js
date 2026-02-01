// src/utils/validation.js - CENTRALIZED VALIDATION

/**
 * Validate product fields
 * @param {Object} data - Product data to validate
 * @returns {Object} - Object containing field errors
 */
export const validateProduct = (data) => {
  const errors = {};

  // Name validation
  if (!data.name?.trim()) {
    errors.name = 'اسم المنتج مطلوب';
  } else if (data.name.trim().length < 3) {
    errors.name = 'اسم المنتج يجب أن يكون 3 أحرف على الأقل';
  } else if (data.name.trim().length > 100) {
    errors.name = 'اسم المنتج يجب ألا يتجاوز 100 حرف';
  }

  // Description validation
  if (!data.description?.trim()) {
    errors.description = 'الوصف مطلوب';
  } else if (data.description.trim().length < 10) {
    errors.description = 'الوصف يجب أن يكون 10 أحرف على الأقل';
  } else if (data.description.trim().length > 2000) {
    errors.description = 'الوصف يجب ألا يتجاوز 2000 حرف';
  }

  // Price validation
  const price = Number(data.price);
  if (!data.price) {
    errors.price = 'السعر مطلوب';
  } else if (isNaN(price) || price <= 0) {
    errors.price = 'السعر يجب أن يكون رقماً موجباً';
  } else if (price > 999999) {
    errors.price = 'السعر مرتفع جداً';
  }

  // Stock validation
  const stock = Number(data.stock);
  if (data.stock !== '' && (isNaN(stock) || stock < 0)) {
    errors.stock = 'الكمية يجب أن تكون رقماً موجباً';
  }

  // Category validation
  if (!data.category) {
    errors.category = 'الفئة مطلوبة';
  }

  return errors;
};

/**
 * Validate image file
 * @param {File} file - Image file to validate
 * @param {number} maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validateImage = (file, maxSize = 5 * 1024 * 1024) => {
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'يرجى اختيار صورة' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `حجم الصورة كبير جداً. الحد الأقصى ${(maxSize / 1024 / 1024).toFixed(0)}MB` };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'نوع الصورة غير مدعوم. JPG, PNG, GIF, WebP فقط' };
  }

  return { valid: true, error: null };
};

/**
 * Validate email
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { valid: boolean, error: string|null }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, error: 'كلمة المرور مطلوبة' };
  }

  if (password.length < 6) {
    return { valid: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }

  return { valid: true, error: null };
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @returns {string}
 */
export const formatPrice = (price) => {
  return Number(price).toFixed(2);
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string}
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Parse tags from comma-separated string
 * @param {string} tagsString - Tags as comma-separated string
 * @returns {string[]}
 */
export const parseTags = (tagsString) => {
  if (!tagsString?.trim()) return [];
  return tagsString
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag);
};

/**
 * Prepare FormData for product submission
 * @param {Object} data - Product data
 * @param {File|null} image - Image file (optional)
 * @returns {FormData}
 */
export const prepareProductFormData = (data, image = null) => {
  const formData = new FormData();

  // Required fields
  formData.append('name', data.name.trim());
  formData.append('description', data.description.trim());
  formData.append('category', data.category);
  formData.append('price', formatPrice(data.price));

  // Optional image
  if (image) {
    formData.append('image', image);
  }

  // Optional fields
  if (data.stock) {
    formData.append('stock', Number(data.stock));
  }

  if (data.brand?.trim()) {
    formData.append('brand', data.brand.trim());
  }

  formData.append('isFeatured', data.isFeatured);

  if (data.tags?.trim()) {
    const tagsArray = parseTags(data.tags);
    formData.append('tags', JSON.stringify(tagsArray));
  }

  return formData;
};

/**
 * Check if object has any properties
 * @param {Object} obj
 * @returns {boolean}
 */
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

/**
 * Debounce function for search inputs
 * @param {Function} func
 * @param {number} delay
 * @returns {Function}
 */
export const debounce = (func, delay = 300) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};