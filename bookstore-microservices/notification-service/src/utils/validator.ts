import Joi from 'joi';

// Common validation schemas
export const commonSchemas = {
  id: Joi.string().uuid().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().valid('asc', 'desc').default('desc'),
    sortBy: Joi.string().optional()
  })
};

// Notification validation schemas
export const notificationSchemas = {
  create: Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('info', 'success', 'warning', 'error', 'order', 'payment', 'shipping', 'promotion').required(),
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(1000).required(),
    channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'in_app')).min(1).required(),
    data: Joi.object().optional(),
    scheduledAt: Joi.date().min('now').optional()
  }),

  bulk: Joi.object({
    userIds: Joi.array().items(Joi.string()).min(1).max(1000).required(),
    type: Joi.string().valid('info', 'success', 'warning', 'error', 'order', 'payment', 'shipping', 'promotion').required(),
    title: Joi.string().min(1).max(200).required(),
    message: Joi.string().min(1).max(1000).required(),
    channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'in_app')).min(1).required(),
    data: Joi.object().optional(),
    scheduledAt: Joi.date().min('now').optional()
  }),

  preferences: Joi.object({
    email: Joi.boolean().optional(),
    sms: Joi.boolean().optional(),
    push: Joi.boolean().optional(),
    inApp: Joi.boolean().optional(),
    orderUpdates: Joi.boolean().optional(),
    promotional: Joi.boolean().optional(),
    shippingUpdates: Joi.boolean().optional(),
    paymentUpdates: Joi.boolean().optional()
  }),

  update: Joi.object({
    isRead: Joi.boolean().optional(),
    channels: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'in_app')).optional(),
    data: Joi.object().optional()
  }),

  query: Joi.object({
    type: Joi.string().valid('info', 'success', 'warning', 'error', 'order', 'payment', 'shipping', 'promotion').optional(),
    isRead: Joi.boolean().optional(),
    channels: Joi.string().valid('email', 'sms', 'push', 'in_app').optional(),
    ...commonSchemas.pagination.describe()
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
