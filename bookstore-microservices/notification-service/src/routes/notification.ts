import { Router } from 'express';
import { notificationController } from '../controllers/notificationController';
import { authMiddleware, requireOwnershipOrAdmin, requireRole } from '../middleware/auth';
import { notificationRateLimiter, bulkOperationRateLimiter } from '../middleware/rateLimiter';
import { validate, validateQuery } from '../utils/validator';
import { notificationSchemas, commonSchemas } from '../utils/validator';

const router = Router();

// Get notifications (with pagination and filtering)
router.get('/', authMiddleware, validateQuery(commonSchemas.pagination), notificationController.getNotifications);

// Get unread notifications
router.get('/unread', authMiddleware, notificationController.getUnreadNotifications);

// Get notification by ID
router.get('/:id', authMiddleware, requireOwnershipOrAdmin, notificationController.getNotificationById);

// Mark notification as read
router.put('/:id/read', authMiddleware, requireOwnershipOrAdmin, notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', authMiddleware, notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', authMiddleware, requireOwnershipOrAdmin, notificationController.deleteNotification);

// Delete all notifications
router.delete('/', authMiddleware, notificationController.deleteAllNotifications);

// Get notification statistics
router.get('/stats', authMiddleware, notificationController.getNotificationStats);

// Create notification (admin only)
router.post('/', authMiddleware, requireRole(['admin']), notificationRateLimiter, validate(notificationSchemas.create), notificationController.createNotification);

// Send bulk notifications (admin only)
router.post('/bulk', authMiddleware, requireRole(['admin']), bulkOperationRateLimiter, validate(notificationSchemas.bulk), notificationController.sendBulkNotifications);

// Notification preferences
router.get('/preferences', authMiddleware, notificationController.getNotificationPreferences);
router.put('/preferences', authMiddleware, validate(notificationSchemas.preferences), notificationController.updateNotificationPreferences);

export { router as notificationRoutes };
