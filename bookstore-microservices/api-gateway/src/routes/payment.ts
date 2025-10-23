import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validate, validateQuery } from '../utils/validator';
import { paymentSchemas, commonSchemas } from '../utils/validator';

const router = Router();

// Proxy configuration for payment service
const paymentServiceProxy = createProxyMiddleware({
  target: process.env.PAYMENT_SERVICE_URL || 'http://localhost:3006',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/payments': '/api/payments'
  },
  onError: (err, req, res) => {
    console.error('Payment service proxy error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Payment service is temporarily unavailable'
    });
  }
});

// Payment routes (all require authentication)
router.post('/', authMiddleware, apiRateLimiter, validate(paymentSchemas.create), paymentServiceProxy);
router.get('/', authMiddleware, validateQuery(commonSchemas.pagination), paymentServiceProxy);
router.get('/:id', authMiddleware, paymentServiceProxy);
router.post('/:id/refund', authMiddleware, paymentServiceProxy);
router.get('/:id/status', authMiddleware, paymentServiceProxy);

// Payment methods management
router.get('/methods', authMiddleware, paymentServiceProxy);
router.post('/methods', authMiddleware, paymentServiceProxy);
router.put('/methods/:id', authMiddleware, paymentServiceProxy);
router.delete('/methods/:id', authMiddleware, paymentServiceProxy);

// Payment history
router.get('/user/:userId', authMiddleware, validateQuery(commonSchemas.pagination), paymentServiceProxy);

// Webhook endpoints (no auth required for external services)
router.post('/webhooks/stripe', paymentServiceProxy);
router.post('/webhooks/paypal', paymentServiceProxy);

export { router as paymentRoutes };
