import twilio from 'twilio';
import { logger } from '../utils/logger';

export interface SMSOptions {
  to: string;
  message: string;
  from?: string;
}

export class SMSService {
  private client: twilio.Twilio;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      logger.warn('Twilio credentials not configured. SMS service will be disabled.');
      this.client = null as any;
      return;
    }

    this.client = twilio(accountSid, authToken);
  }

  async sendSMS(options: SMSOptions): Promise<boolean> {
    try {
      if (!this.client) {
        logger.warn('SMS service not configured');
        return false;
      }

      const message = await this.client.messages.create({
        body: options.message,
        from: options.from || process.env.TWILIO_PHONE_NUMBER,
        to: options.to
      });

      logger.info(`SMS sent successfully: ${message.sid}`);
      return true;
    } catch (error) {
      logger.error('Error sending SMS:', error);
      return false;
    }
  }

  async sendOrderConfirmationSMS(phoneNumber: string, orderData: any): Promise<boolean> {
    const message = `Order Confirmation: Your order #${orderData.orderId} for $${orderData.totalAmount} has been confirmed. We'll notify you when it ships.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendShippingNotificationSMS(phoneNumber: string, shippingData: any): Promise<boolean> {
    const message = `Your order #${shippingData.orderId} has shipped! Tracking: ${shippingData.trackingNumber}. Track at: ${shippingData.trackingUrl}`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendPaymentConfirmationSMS(phoneNumber: string, paymentData: any): Promise<boolean> {
    const message = `Payment Confirmed: $${paymentData.amount} charged to your ${paymentData.paymentMethod}. Transaction ID: ${paymentData.transactionId}`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendPromotionalSMS(phoneNumber: string, promotionData: any): Promise<boolean> {
    const message = `${promotionData.title}: ${promotionData.message} Use code ${promotionData.code} for ${promotionData.discount}% off. Valid until ${new Date(promotionData.validUntil).toLocaleDateString()}`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendCustomSMS(phoneNumber: string, message: string): Promise<boolean> {
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendOTP(phoneNumber: string, otp: string): Promise<boolean> {
    const message = `Your Book Store verification code is: ${otp}. This code expires in 10 minutes.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendDeliveryNotificationSMS(phoneNumber: string, deliveryData: any): Promise<boolean> {
    const message = `Your order #${deliveryData.orderId} has been delivered! Thank you for shopping with Book Store.`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }

  async sendReturnNotificationSMS(phoneNumber: string, returnData: any): Promise<boolean> {
    const message = `Return Request: Your return request for order #${returnData.orderId} has been processed. Return label: ${returnData.returnLabel}`;
    
    return this.sendSMS({
      to: phoneNumber,
      message
    });
  }
}

export const smsService = new SMSService();
