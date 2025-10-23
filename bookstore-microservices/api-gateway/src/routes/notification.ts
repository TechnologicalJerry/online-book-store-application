import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validateQuery } from '../utils/validator';
import { commonSchemas } from '../utils/validator';

const router = Router();

// Proxy configuration for notification service
const notificationServiceProxy = createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/notifications': '/api/notifications'
  },
  onError: (err, req, res) => {
    console.error('Notification service proxy error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Notification service is temporarily unavailable'
    });
  }
});

// Notification routes (all require authentication)
router.get('/', authMiddleware, validateQuery(commonSchemas.pagination), notificationServiceProxy);
router.get('/:id', authMiddleware, notificationServiceProxy);
router.put('/:id/read', authMiddleware, notificationServiceProxy);
router.put('/:id/unread', authMiddleware, notificationServiceProxy);
router.delete('/:id', authMiddleware, notificationServiceProxy);
router.delete('/', authMiddleware, notificationServiceProxy); // Delete all notifications

// Notification preferences
router.get('/preferences', authMiddleware, notificationServiceProxy);
router.put('/preferences', authMiddleware, notificationServiceProxy);

// Notification types and templates (admin only)
router.get('/types', authMiddleware, notificationServiceProxy);
router.get('/templates', authMiddleware, notificationServiceProxy);
router.post('/templates', authMiddleware, notificationServiceProxy);
router.put('/templates/:id', authMiddleware, notificationServiceProxy);
router.delete('/templates/:id', authMiddleware, notificationServiceProxy);

// Bulk operations
router.post('/mark-all-read', authMiddleware, notificationServiceProxy);
router.post('/mark-all-unread', authMiddleware, notificationServiceProxy);

export { router as notificationRoutes };
