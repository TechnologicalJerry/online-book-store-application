import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';
import { NotificationChannel } from '../models/Notification';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  template?: string;
  templateData?: any;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  async sendOrderConfirmationEmail(userEmail: string, userName: string, orderData: any): Promise<boolean> {
    const subject = 'Order Confirmation - Book Store';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Hi ${userName},</p>
        <p>Thank you for your order! Your order has been confirmed and is being processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderData.orderId}</p>
          <p><strong>Total Amount:</strong> $${orderData.totalAmount}</p>
          <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3001'}/orders/${orderData.orderId}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            View Order Details
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          We'll send you another email when your order ships.
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    });
  }

  async sendShippingNotificationEmail(userEmail: string, userName: string, shippingData: any): Promise<boolean> {
    const subject = 'Your Order Has Shipped - Book Store';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Order Has Shipped!</h1>
        <p>Hi ${userName},</p>
        <p>Great news! Your order has been shipped and is on its way to you.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Details</h3>
          <p><strong>Order ID:</strong> ${shippingData.orderId}</p>
          <p><strong>Tracking Number:</strong> ${shippingData.trackingNumber}</p>
          <p><strong>Carrier:</strong> ${shippingData.carrier}</p>
          <p><strong>Estimated Delivery:</strong> ${new Date(shippingData.estimatedDelivery).toLocaleDateString()}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${shippingData.trackingUrl}" 
             style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Track Your Package
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    });
  }

  async sendPaymentConfirmationEmail(userEmail: string, userName: string, paymentData: any): Promise<boolean> {
    const subject = 'Payment Confirmation - Book Store';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Payment Confirmed</h1>
        <p>Hi ${userName},</p>
        <p>Your payment has been successfully processed.</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Payment Details</h3>
          <p><strong>Transaction ID:</strong> ${paymentData.transactionId}</p>
          <p><strong>Amount:</strong> $${paymentData.amount}</p>
          <p><strong>Payment Method:</strong> ${paymentData.paymentMethod}</p>
          <p><strong>Date:</strong> ${new Date(paymentData.createdAt).toLocaleDateString()}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Thank you for your purchase!
        </p>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    });
  }

  async sendPromotionalEmail(userEmail: string, userName: string, promotionData: any): Promise<boolean> {
    const subject = promotionData.subject || 'Special Offer - Book Store';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${promotionData.title}</h1>
        <p>Hi ${userName},</p>
        <p>${promotionData.message}</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Special Offer</h3>
          <p><strong>Discount:</strong> ${promotionData.discount}% off</p>
          <p><strong>Valid Until:</strong> ${new Date(promotionData.validUntil).toLocaleDateString()}</p>
          <p><strong>Code:</strong> ${promotionData.code}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:3001'}/books?promo=${promotionData.code}" 
             style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Shop Now
          </a>
        </div>
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    });
  }

  async sendCustomEmail(userEmail: string, subject: string, message: string, data?: any): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">${subject}</h1>
        <p>${message}</p>
        ${data ? `
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Additional Information</h3>
            <pre style="white-space: pre-wrap;">${JSON.stringify(data, null, 2)}</pre>
          </div>
        ` : ''}
      </div>
    `;

    return this.sendEmail({
      to: userEmail,
      subject,
      html
    });
  }
}

export const emailService = new EmailService();
