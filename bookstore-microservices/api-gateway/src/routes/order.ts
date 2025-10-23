import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validate, validateQuery } from '../utils/validator';
import { orderSchemas, commonSchemas } from '../utils/validator';

const router = Router();

// Proxy configuration for order service
const orderServiceProxy = createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/orders': '/api/orders'
  },
  onError: (err, req, res) => {
    console.error('Order service proxy error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Order service is temporarily unavailable'
    });
  }
});

// Order routes (all require authentication)
router.post('/', authMiddleware, apiRateLimiter, validate(orderSchemas.create), orderServiceProxy);
router.get('/', authMiddleware, validateQuery(commonSchemas.pagination), orderServiceProxy);
router.get('/:id', authMiddleware, orderServiceProxy);
router.put('/:id', authMiddleware, validate(orderSchemas.update), orderServiceProxy);
router.delete('/:id', authMiddleware, orderServiceProxy);

// Order status and tracking
router.get('/:id/status', authMiddleware, orderServiceProxy);
router.get('/:id/tracking', authMiddleware, orderServiceProxy);
router.post('/:id/cancel', authMiddleware, orderServiceProxy);

// Order history and analytics
router.get('/user/:userId', authMiddleware, validateQuery(commonSchemas.pagination), orderServiceProxy);
router.get('/analytics/summary', authMiddleware, orderServiceProxy);

export { router as orderRoutes };
