// middleware/validation.js - Complete Validation System
import validator from 'validator';

// =====================
// User Registration Validation
// =====================
export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  } else if (name.trim().length > 50) {
    errors.push('Name must not exceed 50 characters');
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (password.length > 100) {
      errors.push('Password must not exceed 100 characters');
    }
    // Check for at least one number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    // Check for at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('Password must contain at least one letter');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// =====================
// User Login Validation
// =====================
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// =====================
// Product Validation
// =====================
export const validateProduct = (req, res, next) => {
  const { name, description, price, category } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (name.trim().length < 3) {
    errors.push('Product name must be at least 3 characters');
  } else if (name.trim().length > 100) {
    errors.push('Product name must not exceed 100 characters');
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  } else if (description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }

  // Price validation (سعر البيع الفعلي)
  if (!price) {
    errors.push('سعر البيع مطلوب');
  } else {
    const priceNum = Number(price);
    if (isNaN(priceNum)) {
      errors.push('سعر البيع يجب أن يكون رقماً');
    } else if (priceNum < 0) {
      errors.push('سعر البيع يجب أن يكون موجباً');
    } else if (priceNum > 1000000) {
      errors.push('سعر البيع تجاوز الحد الأقصى');
    }
  }

  // originalPrice validation (السعر قبل الخصم)
  if (req.body.originalPrice !== undefined && req.body.originalPrice !== null && req.body.originalPrice !== '') {
    const origNum = Number(req.body.originalPrice);
    if (isNaN(origNum) || origNum < 0) {
      errors.push('السعر الأصلي يجب أن يكون رقماً موجباً');
    }
  }

  // costPrice validation (سعر التكلفة/الاستيراد)
  if (req.body.costPrice !== undefined && req.body.costPrice !== null && req.body.costPrice !== '') {
    const costNum = Number(req.body.costPrice);
    if (isNaN(costNum) || costNum < 0) {
      errors.push('سعر التكلفة يجب أن يكون رقماً موجباً');
    }
  }

  // Category validation
  if (!category || category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// =====================
// Order Validation
// =====================
export const validateOrder = (req, res, next) => {
  const { items, address, amount } = req.body;
  const errors = [];

  // Items validation
  if (!items) {
    errors.push('Items are required');
  } else if (!Array.isArray(items)) {
    errors.push('Items must be an array');
  } else if (items.length === 0) {
    errors.push('Cart is empty');
  } else {
    // Validate each item
    items.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.quantity || item.quantity < 1) {
        errors.push(`Item ${index + 1}: Valid quantity is required`);
      }
    });
  }

  // Address validation
  if (!address) {
    errors.push('Address is required');
  } else if (typeof address !== 'object') {
    errors.push('Address must be an object');
  } else {
    const requiredFields = ['street', 'city', 'phone'];
    requiredFields.forEach((field) => {
      if (!address[field] || address[field].trim().length === 0) {
        errors.push(`Address ${field} is required`);
      }
    });

    // Phone validation
    if (address.phone && !validator.isMobilePhone(address.phone, 'any')) {
      errors.push('Please provide a valid phone number');
    }
  }

  // Amount validation
  if (!amount) {
    errors.push('Amount is required');
  } else {
    const amountNum = Number(amount);
    if (isNaN(amountNum)) {
      errors.push('Amount must be a valid number');
    } else if (amountNum <= 0) {
      errors.push('Amount must be greater than 0');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// =====================
// Order Status Update Validation
// =====================
export const validateOrderStatus = (req, res, next) => {
  const { orderId, status } = req.body;
  const errors = [];

  if (!orderId) {
    errors.push('Order ID is required');
  } else if (!validator.isMongoId(orderId)) {
    errors.push('Invalid Order ID format');
  }

  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!status) {
    errors.push('Status is required');
  } else if (!validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

// =====================
// MongoDB ID Validation
// =====================
export const validateMongoId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName] || req.body[paramName];

    if (!id) {
      return res.status(400).json({
        success: false,
        message: `${paramName} is required`,
      });
    }

    if (!validator.isMongoId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`,
      });
    }

    next();
  };
};