import admin from 'firebase-admin';
import { logger } from '../utils/logger';

export interface PushNotificationOptions {
  token: string;
  title: string;
  body: string;
  data?: any;
  imageUrl?: string;
}

export interface PushNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class PushNotificationService {
  private app: admin.app.App;

  constructor() {
    try {
      // Initialize Firebase Admin SDK
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (!serviceAccount) {
        logger.warn('Firebase service account key not configured. Push notifications will be disabled.');
        return;
      }

      const serviceAccountKey = JSON.parse(serviceAccount);
      
      this.app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountKey),
        projectId: process.env.FIREBASE_PROJECT_ID
      });

      logger.info('Firebase Admin SDK initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendPushNotification(options: PushNotificationOptions): Promise<PushNotificationResult> {
    try {
      if (!this.app) {
        return {
          success: false,
          error: 'Firebase not initialized'
        };
      }

      const message = {
        token: options.token,
        notification: {
          title: options.title,
          body: options.body,
          imageUrl: options.imageUrl
        },
        data: options.data || {},
        android: {
          priority: 'high',
          notification: {
            sound: 'default',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      logger.info(`Push notification sent successfully: ${response}`);
      
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Error sending push notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async sendOrderConfirmationPush(userToken: string, orderData: any): Promise<PushNotificationResult> {
    return this.sendPushNotification({
      token: userToken,
      title: 'Order Confirmed',
      body: `Your order #${orderData.orderId} for $${orderData.totalAmount} has been confirmed`,
      data: {
        type: 'order_confirmation',
        orderId: orderData.orderId,
        totalAmount: orderData.totalAmount.toString()
      }
    });
  }

  async sendShippingNotificationPush(userToken: string, shippingData: any): Promise<PushNotificationResult> {
    return this.sendPushNotification({
      token: userToken,
      title: 'Order Shipped',
      body: `Your order #${shippingData.orderId} has shipped! Track it with ${shippingData.trackingNumber}`,
      data: {
        type: 'shipping',
        orderId: shippingData.orderId,
        trackingNumber: shippingData.trackingNumber,
        trackingUrl: shippingData.trackingUrl
      }
    });
  }

  async sendPaymentConfirmationPush(userToken: string, paymentData: any): Promise<PushNotificationResult> {
    return this.sendPushNotification({
      token: userToken,
      title: 'Payment Confirmed',
      body: `Payment of $${paymentData.amount} has been processed successfully`,
      data: {
        type: 'payment_confirmation',
        transactionId: paymentData.transactionId,
        amount: paymentData.amount.toString()
      }
    });
  }

  async sendPromotionalPush(userToken: string, promotionData: any): Promise<PushNotificationResult> {
    return this.sendPushNotification({
      token: userToken,
      title: promotionData.title,
      body: promotionData.message,
      data: {
        type: 'promotion',
        discount: promotionData.discount.toString(),
        code: promotionData.code,
        validUntil: promotionData.validUntil
      }
    });
  }

  async sendDeliveryNotificationPush(userToken: string, deliveryData: any): Promise<PushNotificationResult> {
    return this.sendPushNotification({
      token: userToken,
      title: 'Order Delivered',
      body: `Your order #${deliveryData.orderId} has been delivered! Thank you for shopping with us`,
      data: {
        type: 'delivery',
        orderId: deliveryData.orderId
      }
    });
  }

  async sendCustomPush(userToken: string, title: string, body: string, data?: any): Promise<PushNotificationResult> {
    return this.sendPushNotification({
      token: userToken,
      title,
      body,
      data
    });
  }

  async sendBulkPushNotifications(tokens: string[], title: string, body: string, data?: any): Promise<PushNotificationResult[]> {
    const results: PushNotificationResult[] = [];
    
    for (const token of tokens) {
      const result = await this.sendPushNotification({
        token,
        title,
        body,
        data
      });
      results.push(result);
    }
    
    return results;
  }

  async sendToTopic(topic: string, title: string, body: string, data?: any): Promise<PushNotificationResult> {
    try {
      if (!this.app) {
        return {
          success: false,
          error: 'Firebase not initialized'
        };
      }

      const message = {
        topic,
        notification: {
          title,
          body
        },
        data: data || {},
        android: {
          priority: 'high'
        },
        apns: {
          payload: {
            aps: {
              sound: 'default'
            }
          }
        }
      };

      const response = await admin.messaging().send(message);
      
      logger.info(`Topic notification sent successfully: ${response}`);
      
      return {
        success: true,
        messageId: response
      };
    } catch (error) {
      logger.error('Error sending topic notification:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

export const pushNotificationService = new PushNotificationService();
