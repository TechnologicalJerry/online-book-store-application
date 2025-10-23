import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authMiddleware, requireOwnershipOrAdmin, requireRole } from '../middleware/auth';
import { validate, validateQuery } from '../utils/validator';
import { userSchemas, commonSchemas } from '../utils/validator';

const router = Router();

// User profile routes (require authentication)
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, validate(userSchemas.updateProfile), userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteProfile);

// User management routes (admin only)
router.get('/', authMiddleware, requireRole(['admin']), validateQuery(commonSchemas.pagination), userController.getUsers);
router.get('/:id', authMiddleware, requireOwnershipOrAdmin, userController.getUserById);
router.put('/:id', authMiddleware, requireOwnershipOrAdmin, validate(userSchemas.updateProfile), userController.updateUser);
router.delete('/:id', authMiddleware, requireRole(['admin']), userController.deleteUser);

// Public user routes (optional authentication for personalized content)
router.get('/public/:id', userController.getPublicUserProfile);

// User preferences and settings
router.get('/preferences', authMiddleware, userController.getUserPreferences);
router.put('/preferences', authMiddleware, userController.updateUserPreferences);

// User activity and analytics
router.get('/activity', authMiddleware, userController.getUserActivity);
router.get('/analytics', authMiddleware, requireRole(['admin']), userController.getUserAnalytics);

export { router as userRoutes };
