import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

export const rateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) / 1000)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10) / 1000)
    });
  },
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Stricter rate limiting for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many authentication attempts, please try again later.',
      retryAfter: 900
    });
  }
});

// Rate limiting for API endpoints
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: {
    error: 'Too Many Requests',
    message: 'Too many API requests, please try again later.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    logger.warn(`API rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too Many Requests',
      message: 'Too many API requests, please try again later.',
      retryAfter: 60
    });
  }
});
