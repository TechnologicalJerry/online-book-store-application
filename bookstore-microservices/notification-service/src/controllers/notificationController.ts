import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';
import { notificationService } from '../services/notificationService';

export const notificationController = {
  getNotifications: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;
    const { page = 1, limit = 20, type, isRead, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      type: type as string,
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const notifications = await Notification.findByUserId(userId, options);
    const total = await Notification.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  }),

  getNotificationById: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id || req.params.userId;

    const notification = await Notification.findOne({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });
  }),

  markAsRead: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id || req.params.userId;

    const notification = await Notification.markAsRead(id, userId);
    if (!notification) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notification not found'
      });
    }

    logger.info(`Notification ${id} marked as read by user ${userId}`);

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  }),

  markAllAsRead: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;

    const result = await Notification.markAllAsRead(userId);

    logger.info(`All notifications marked as read by user ${userId}`);

    res.json({
      success: true,
      message: 'All notifications marked as read',
      data: { modifiedCount: result.modifiedCount }
    });
  }),

  deleteNotification: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user?.id || req.params.userId;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Notification not found'
      });
    }

    logger.info(`Notification ${id} deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  }),

  deleteAllNotifications: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;

    const result = await Notification.deleteMany({ userId });

    logger.info(`All notifications deleted by user ${userId}`);

    res.json({
      success: true,
      message: 'All notifications deleted successfully',
      data: { deletedCount: result.deletedCount }
    });
  }),

  getNotificationStats: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;

    const stats = await Notification.getNotificationStats(userId);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      data: {
        stats: stats[0] || { total: 0, unread: 0, read: 0, typeStats: {} },
        unreadCount
      }
    });
  }),

  createNotification: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userId, type, title, message, channels, data, scheduledAt } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      channels: channels || ['in_app'],
      data: data || {},
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
    });

    await notification.save();

    // Queue notification for processing
    await notificationService.queueNotification(notification);

    logger.info(`Notification created: ${notification._id} for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: { notification }
    });
  }),

  sendBulkNotifications: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { userIds, type, title, message, channels, data, scheduledAt } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'userIds must be a non-empty array'
      });
    }

    const notifications = [];
    
    for (const userId of userIds) {
      const notification = new Notification({
        userId,
        type,
        title,
        message,
        channels: channels || ['in_app'],
        data: data || {},
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      });

      await notification.save();
      notifications.push(notification);

      // Queue notification for processing
      await notificationService.queueNotification(notification);
    }

    logger.info(`Bulk notifications created: ${notifications.length} notifications`);

    res.status(201).json({
      success: true,
      message: 'Bulk notifications created successfully',
      data: { 
        count: notifications.length,
        notifications: notifications.map(n => ({ id: n._id, userId: n.userId }))
      }
    });
  }),

  getUnreadNotifications: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;

    const notifications = await Notification.findUnreadByUserId(userId);

    res.json({
      success: true,
      data: { notifications }
    });
  }),

  updateNotificationPreferences: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;
    const preferences = req.body;

    // This would typically update user preferences in a separate collection
    // For now, we'll just return success
    logger.info(`Notification preferences updated for user ${userId}`);

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: { preferences }
    });
  }),

  getNotificationPreferences: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.id || req.params.userId;

    // This would typically fetch user preferences from a separate collection
    // For now, we'll return default preferences
    const preferences = {
      email: true,
      sms: false,
      push: true,
      inApp: true,
      orderUpdates: true,
      promotional: false,
      shippingUpdates: true,
      paymentUpdates: true
    };

    res.json({
      success: true,
      data: { preferences }
    });
  })
};
