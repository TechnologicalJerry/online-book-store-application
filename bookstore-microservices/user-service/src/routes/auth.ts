import { Router } from 'express';
import { authController } from '../controllers/authController';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../utils/validator';
import { userSchemas } from '../utils/validator';

const router = Router();

// Authentication routes
router.post('/register', authRateLimiter, validate(userSchemas.register), authController.register);
router.post('/login', authRateLimiter, validate(userSchemas.login), authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Password reset routes
router.post('/forgot-password', passwordResetRateLimiter, authController.forgotPassword);
router.post('/reset-password', passwordResetRateLimiter, authController.resetPassword);

// Email verification
router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authRateLimiter, authController.resendVerification);

export { router as authRoutes };
