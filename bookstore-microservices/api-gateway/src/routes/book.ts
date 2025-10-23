import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { optionalAuth } from '../middleware/auth';
import { apiRateLimiter } from '../middleware/rateLimiter';
import { validateQuery } from '../utils/validator';
import { bookSchemas } from '../utils/validator';

const router = Router();

// Proxy configuration for book service
const bookServiceProxy = createProxyMiddleware({
  target: process.env.BOOK_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/books': '/api/books'
  },
  onError: (err, req, res) => {
    console.error('Book service proxy error:', err);
    res.status(503).json({
      error: 'Service Unavailable',
      message: 'Book service is temporarily unavailable'
    });
  }
});

// Public book routes (optional auth for personalized recommendations)
router.get('/', optionalAuth, apiRateLimiter, validateQuery(bookSchemas.search), bookServiceProxy);
router.get('/search', optionalAuth, apiRateLimiter, validateQuery(bookSchemas.search), bookServiceProxy);
router.get('/categories', optionalAuth, bookServiceProxy);
router.get('/featured', optionalAuth, bookServiceProxy);
router.get('/bestsellers', optionalAuth, bookServiceProxy);
router.get('/new-releases', optionalAuth, bookServiceProxy);
router.get('/:id', optionalAuth, bookServiceProxy);
router.get('/:id/reviews', optionalAuth, bookServiceProxy);

// Book management routes (admin only)
router.post('/', bookServiceProxy);
router.put('/:id', bookServiceProxy);
router.delete('/:id', bookServiceProxy);
router.post('/:id/reviews', bookServiceProxy);
router.put('/:id/reviews/:reviewId', bookServiceProxy);
router.delete('/:id/reviews/:reviewId', bookServiceProxy);

export { router as bookRoutes };
