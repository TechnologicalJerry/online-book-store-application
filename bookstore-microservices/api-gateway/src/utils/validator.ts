import Joi from 'joi';

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]')).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().optional()
  })
};

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: commonSchemas.email,
    password: commonSchemas.password,
    phone: commonSchemas.phone,
    dateOfBirth: Joi.date().max('now').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  }),

  login: Joi.object({
    email: commonSchemas.email,
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phone: commonSchemas.phone,
    dateOfBirth: Joi.date().max('now').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      zipCode: Joi.string().optional(),
      country: Joi.string().optional()
    }).optional()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: commonSchemas.password
  })
};

// Book validation schemas
export const bookSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    author: Joi.string().min(1).max(100).required(),
    isbn: Joi.string().pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).required(),
    description: Joi.string().max(2000).optional(),
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().min(1).max(50).required(),
    stock: Joi.number().integer().min(0).required(),
    publishedDate: Joi.date().max('now').optional(),
    publisher: Joi.string().min(1).max(100).optional(),
    language: Joi.string().min(2).max(10).optional(),
    pages: Joi.number().integer().min(1).optional(),
    imageUrl: Joi.string().uri().optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(200).optional(),
    author: Joi.string().min(1).max(100).optional(),
    isbn: Joi.string().pattern(/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/).optional(),
    description: Joi.string().max(2000).optional(),
    price: Joi.number().positive().precision(2).optional(),
    category: Joi.string().min(1).max(50).optional(),
    stock: Joi.number().integer().min(0).optional(),
    publishedDate: Joi.date().max('now').optional(),
    publisher: Joi.string().min(1).max(100).optional(),
    language: Joi.string().min(2).max(10).optional(),
    pages: Joi.number().integer().min(1).optional(),
    imageUrl: Joi.string().uri().optional()
  }),

  search: Joi.object({
    query: Joi.string().min(1).max(100).optional(),
    category: Joi.string().optional(),
    author: Joi.string().optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().optional(),
    ...commonSchemas.pagination.describe()
  })
};

// Order validation schemas
export const orderSchemas = {
  create: Joi.object({
    items: Joi.array().items(
      Joi.object({
        bookId: commonSchemas.id,
        quantity: Joi.number().integer().min(1).required(),
        price: Joi.number().positive().precision(2).required()
      })
    ).min(1).required(),
    shippingAddress: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      zipCode: Joi.string().required(),
      country: Joi.string().required()
    }).required(),
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'stripe').required()
  }),

  update: Joi.object({
    status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').optional(),
    trackingNumber: Joi.string().optional()
  })
};

// Payment validation schemas
export const paymentSchemas = {
  create: Joi.object({
    orderId: commonSchemas.id,
    amount: Joi.number().positive().precision(2).required(),
    currency: Joi.string().length(3).uppercase().default('USD'),
    paymentMethod: Joi.string().valid('credit_card', 'debit_card', 'paypal', 'stripe').required(),
    paymentDetails: Joi.object({
      cardNumber: Joi.string().pattern(/^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/).optional(),
      expiryMonth: Joi.number().integer().min(1).max(12).optional(),
      expiryYear: Joi.number().integer().min(new Date().getFullYear()).optional(),
      cvv: Joi.string().pattern(/^\d{3,4}$/).optional(),
      cardholderName: Joi.string().min(1).max(100).optional()
    }).optional()
  })
};

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details
      });
    }

    req.body = value;
    next();
  };
};

// Query validation middleware
export const validateQuery = (schema: Joi.ObjectSchema) => {
  return (req: any, res: any, next: any) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        error: 'Validation Error',
        message: errorMessage,
        details: error.details
      });
    }

    req.query = value;
    next();
  };
};
