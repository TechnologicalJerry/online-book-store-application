import Queue from 'bull';
import { logger } from '../utils/logger';
import { notificationService } from '../services/notificationService';

export class QueueManager {
  private notificationQueue: Queue.Queue;
  private retryQueue: Queue.Queue;
  private scheduledQueue: Queue.Queue;

  constructor() {
    // Initialize notification processing queue
    this.notificationQueue = new Queue('notification processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
      }
    });

    // Initialize retry queue for failed notifications
    this.retryQueue = new Queue('notification retry', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
      }
    });

    // Initialize scheduled notifications queue
    this.scheduledQueue = new Queue('scheduled notifications', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD
      }
    });

    this.setupProcessors();
    this.setupSchedulers();
  }

  private setupProcessors(): void {
    // Process notification queue
    this.notificationQueue.process('process-notification', async (job) => {
      try {
        logger.info(`Processing notification job: ${job.id}`);
        const result = await notificationService.processNotification(job.data);
        
        if (result) {
          logger.info(`Notification job ${job.id} completed successfully`);
        } else {
          logger.error(`Notification job ${job.id} failed`);
          throw new Error('Notification processing failed');
        }
      } catch (error) {
        logger.error(`Error processing notification job ${job.id}:`, error);
        throw error;
      }
    });

    // Process retry queue
    this.retryQueue.process('retry-notification', async (job) => {
      try {
        logger.info(`Retrying notification job: ${job.id}`);
        await notificationService.retryFailedNotifications();
      } catch (error) {
        logger.error(`Error in retry job ${job.id}:`, error);
        throw error;
      }
    });

    // Process scheduled notifications
    this.scheduledQueue.process('process-scheduled', async (job) => {
      try {
        logger.info(`Processing scheduled notifications job: ${job.id}`);
        await notificationService.processScheduledNotifications();
      } catch (error) {
        logger.error(`Error in scheduled job ${job.id}:`, error);
        throw error;
      }
    });

    // Handle job events
    this.notificationQueue.on('completed', (job) => {
      logger.info(`Notification job ${job.id} completed`);
    });

    this.notificationQueue.on('failed', (job, err) => {
      logger.error(`Notification job ${job.id} failed:`, err);
    });

    this.retryQueue.on('completed', (job) => {
      logger.info(`Retry job ${job.id} completed`);
    });

    this.scheduledQueue.on('completed', (job) => {
      logger.info(`Scheduled job ${job.id} completed`);
    });
  }

  private setupSchedulers(): void {
    // Schedule retry job to run every 5 minutes
    this.retryQueue.add('retry-failed-notifications', {}, {
      repeat: { cron: '*/5 * * * *' }, // Every 5 minutes
      removeOnComplete: 10,
      removeOnFail: 5
    });

    // Schedule scheduled notifications check to run every minute
    this.scheduledQueue.add('process-scheduled-notifications', {}, {
      repeat: { cron: '* * * * *' }, // Every minute
      removeOnComplete: 10,
      removeOnFail: 5
    });
  }

  async addNotificationJob(notificationData: any): Promise<void> {
    try {
      await this.notificationQueue.add('process-notification', notificationData, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000
        },
        removeOnComplete: 10,
        removeOnFail: 5
      });
    } catch (error) {
      logger.error('Error adding notification job:', error);
      throw error;
    }
  }

  async getQueueStats(): Promise<any> {
    try {
      const notificationStats = await this.notificationQueue.getJobCounts();
      const retryStats = await this.retryQueue.getJobCounts();
      const scheduledStats = await this.scheduledQueue.getJobCounts();

      return {
        notification: notificationStats,
        retry: retryStats,
        scheduled: scheduledStats
      };
    } catch (error) {
      logger.error('Error getting queue stats:', error);
      return {};
    }
  }

  async pauseQueues(): Promise<void> {
    await this.notificationQueue.pause();
    await this.retryQueue.pause();
    await this.scheduledQueue.pause();
    logger.info('All queues paused');
  }

  async resumeQueues(): Promise<void> {
    await this.notificationQueue.resume();
    await this.retryQueue.resume();
    await this.scheduledQueue.resume();
    logger.info('All queues resumed');
  }

  async closeQueues(): Promise<void> {
    await this.notificationQueue.close();
    await this.retryQueue.close();
    await this.scheduledQueue.close();
    logger.info('All queues closed');
  }
}

export const queueManager = new QueueManager();

export const initializeQueues = async (): Promise<void> => {
  try {
    logger.info('Queue manager initialized');
  } catch (error) {
    logger.error('Error initializing queues:', error);
    throw error;
  }
};
