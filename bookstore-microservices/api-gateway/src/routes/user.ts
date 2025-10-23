import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { authMiddleware, optionalAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';
import { validate, validateQuery } from '../utils/validator';
import { userSchemas, commonSchemas } from '../utils/validator';

const router = Router();

// Proxy configuration for user service
const userServiceProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/users': '/api/users'
  },
  onError: (err, req, res) => {
    console.error('User service proxy error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'User service is temporarily unavailable'
    });
  }
});

// Authentication routes (with stricter rate limiting)
router.post('/register', authRateLimiter, userServiceProxy);
router.post('/login', authRateLimiter, userServiceProxy);
router.post('/logout', authMiddleware, userServiceProxy);
router.post('/refresh-token', authMiddleware, userServiceProxy);
router.post('/forgot-password', authRateLimiter, userServiceProxy);
router.post('/reset-password', authRateLimiter, userServiceProxy);

// User profile routes
router.get('/profile', authMiddleware, userServiceProxy);
router.put('/profile', authMiddleware, userServiceProxy);
router.delete('/profile', authMiddleware, userServiceProxy);

// User management routes (admin only)
router.get('/', authMiddleware, userServiceProxy);
router.get('/:id', authMiddleware, userServiceProxy);
router.put('/:id', authMiddleware, userServiceProxy);
router.delete('/:id', authMiddleware, userServiceProxy);

// Public user routes (optional auth for personalized content)
router.get('/public/:id', optionalAuth, userServiceProxy);

export { router as userRoutes };
