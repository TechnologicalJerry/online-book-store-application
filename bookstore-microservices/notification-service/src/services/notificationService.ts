import { Notification, INotification, NotificationChannel } from '../models/Notification';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { pushNotificationService } from './pushNotificationService';
import { logger } from '../utils/logger';
import { redisConfig } from '../config/redis';

export class NotificationService {
  private redis = redisConfig.getClient();

  async queueNotification(notification: INotification): Promise<void> {
    try {
      // Add notification to processing queue
      await this.redis.lpush('notification_queue', JSON.stringify({
        id: notification._id.toString(),
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        channels: notification.channels,
        data: notification.data,
        scheduledAt: notification.scheduledAt
      }));

      logger.info(`Notification ${notification._id} queued for processing`);
    } catch (error) {
      logger.error('Error queueing notification:', error);
      throw error;
    }
  }

  async processNotification(notificationData: any): Promise<boolean> {
    try {
      const notification = await Notification.findById(notificationData.id);
      if (!notification) {
        logger.error(`Notification ${notificationData.id} not found`);
        return false;
      }

      // Check if notification should be sent now
      if (notification.scheduledAt && notification.scheduledAt > new Date()) {
        logger.info(`Notification ${notification._id} scheduled for later`);
        return true;
      }

      // Update status to processing
      notification.status = 'processing';
      await notification.save();

      let allChannelsSuccessful = true;

      // Process each channel
      for (const channel of notification.channels) {
        const success = await this.sendNotificationToChannel(notification, channel);
        if (!success) {
          allChannelsSuccessful = false;
        }
      }

      if (allChannelsSuccessful) {
        notification.status = 'sent';
        notification.sentAt = new Date();
        await notification.save();
        logger.info(`Notification ${notification._id} sent successfully`);
      } else {
        notification.status = 'failed';
        notification.errorMessage = 'One or more channels failed';
        await notification.save();
        logger.error(`Notification ${notification._id} failed to send`);
      }

      return allChannelsSuccessful;
    } catch (error) {
      logger.error('Error processing notification:', error);
      
      // Update notification status to failed
      try {
        const notification = await Notification.findById(notificationData.id);
        if (notification) {
          notification.status = 'failed';
          notification.errorMessage = error instanceof Error ? error.message : 'Unknown error';
          await notification.save();
        }
      } catch (updateError) {
        logger.error('Error updating notification status:', updateError);
      }

      return false;
    }
  }

  private async sendNotificationToChannel(notification: INotification, channel: NotificationChannel): Promise<boolean> {
    try {
      switch (channel) {
        case 'email':
          return await this.sendEmailNotification(notification);
        case 'sms':
          return await this.sendSMSNotification(notification);
        case 'push':
          return await this.sendPushNotification(notification);
        case 'in_app':
          // In-app notifications are already stored in the database
          return true;
        default:
          logger.warn(`Unknown notification channel: ${channel}`);
          return false;
      }
    } catch (error) {
      logger.error(`Error sending ${channel} notification:`, error);
      return false;
    }
  }

  private async sendEmailNotification(notification: INotification): Promise<boolean> {
    try {
      // Get user email from user service or notification data
      const userEmail = notification.data?.userEmail || notification.data?.email;
      if (!userEmail) {
        logger.warn(`No email address found for notification ${notification._id}`);
        return false;
      }

      const userName = notification.data?.userName || 'User';
      
      // Send based on notification type
      switch (notification.type) {
        case 'order':
          return await emailService.sendOrderConfirmationEmail(userEmail, userName, notification.data);
        case 'payment':
          return await emailService.sendPaymentConfirmationEmail(userEmail, userName, notification.data);
        case 'shipping':
          return await emailService.sendShippingNotificationEmail(userEmail, userName, notification.data);
        case 'promotion':
          return await emailService.sendPromotionalEmail(userEmail, userName, notification.data);
        default:
          return await emailService.sendCustomEmail(userEmail, notification.title, notification.message, notification.data);
      }
    } catch (error) {
      logger.error('Error sending email notification:', error);
      return false;
    }
  }

  private async sendSMSNotification(notification: INotification): Promise<boolean> {
    try {
      // Get user phone from notification data
      const userPhone = notification.data?.userPhone || notification.data?.phone;
      if (!userPhone) {
        logger.warn(`No phone number found for notification ${notification._id}`);
        return false;
      }

      // Send based on notification type
      switch (notification.type) {
        case 'order':
          return await smsService.sendOrderConfirmationSMS(userPhone, notification.data);
        case 'payment':
          return await smsService.sendPaymentConfirmationSMS(userPhone, notification.data);
        case 'shipping':
          return await smsService.sendShippingNotificationSMS(userPhone, notification.data);
        case 'promotion':
          return await smsService.sendPromotionalSMS(userPhone, notification.data);
        default:
          return await smsService.sendCustomSMS(userPhone, notification.message);
      }
    } catch (error) {
      logger.error('Error sending SMS notification:', error);
      return false;
    }
  }

  private async sendPushNotification(notification: INotification): Promise<boolean> {
    try {
      // Get user FCM token from notification data
      const userToken = notification.data?.fcmToken || notification.data?.pushToken;
      if (!userToken) {
        logger.warn(`No FCM token found for notification ${notification._id}`);
        return false;
      }

      // Send based on notification type
      switch (notification.type) {
        case 'order':
          return (await pushNotificationService.sendOrderConfirmationPush(userToken, notification.data)).success;
        case 'payment':
          return (await pushNotificationService.sendPaymentConfirmationPush(userToken, notification.data)).success;
        case 'shipping':
          return (await pushNotificationService.sendShippingNotificationPush(userToken, notification.data)).success;
        case 'promotion':
          return (await pushNotificationService.sendPromotionalPush(userToken, notification.data)).success;
        default:
          return (await pushNotificationService.sendCustomPush(userToken, notification.title, notification.message, notification.data)).success;
      }
    } catch (error) {
      logger.error('Error sending push notification:', error);
      return false;
    }
  }

  async retryFailedNotifications(): Promise<void> {
    try {
      const failedNotifications = await Notification.find({
        status: 'failed',
        retryCount: { $lt: 3 } // Max 3 retries
      });

      for (const notification of failedNotifications) {
        if (notification.canRetry()) {
          logger.info(`Retrying notification ${notification._id}`);
          await this.queueNotification(notification);
        }
      }
    } catch (error) {
      logger.error('Error retrying failed notifications:', error);
    }
  }

  async processScheduledNotifications(): Promise<void> {
    try {
      const now = new Date();
      const scheduledNotifications = await Notification.find({
        status: 'pending',
        scheduledAt: { $lte: now }
      });

      for (const notification of scheduledNotifications) {
        await this.queueNotification(notification);
      }
    } catch (error) {
      logger.error('Error processing scheduled notifications:', error);
    }
  }

  async getNotificationStats(): Promise<any> {
    try {
      const stats = await Notification.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            processing: { $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] } },
            sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
            failed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
            byType: {
              $push: {
                type: '$type',
                status: '$status'
              }
            }
          }
        }
      ]);

      return stats[0] || { total: 0, pending: 0, processing: 0, sent: 0, failed: 0 };
    } catch (error) {
      logger.error('Error getting notification stats:', error);
      return { total: 0, pending: 0, processing: 0, sent: 0, failed: 0 };
    }
  }
}

export const notificationService = new NotificationService();
