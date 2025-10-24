import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { initializeQueues } from './workers/queueManager';
import app from './app';

// Load environment variables
dotenv.config();

class NotificationServer {
  private port: number;

  constructor() {
    this.port = parseInt(process.env.PORT || '3007', 10);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      logger.info('Database connected successfully');
      
      // Connect to Redis
      await connectRedis();
      logger.info('Redis connected successfully');
      
      // Initialize queues
      await initializeQueues();
      logger.info('Queues initialized successfully');
      
      // Start the server
      const server = app.listen(this.port, () => {
        logger.info(`🚀 Notification Service server running on port ${this.port}`);
        logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        logger.info(`📊 Health check: http://localhost:${this.port}/health`);
      });

      // Graceful shutdown handling
      this.setupGracefulShutdown(server);
      
    } catch (error) {
      logger.error('❌ Failed to start Notification Service:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(server: any): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`📡 Received ${signal}. Starting graceful shutdown...`);
      
      server.close(async () => {
        logger.info('🔌 HTTP server closed');
        
        try {
          // Close database connections
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          logger.info('📊 Database connection closed');
          
          // Close Redis connections
          const { redisConfig } = require('./config/redis');
          await redisConfig.disconnect();
          logger.info('🔴 Redis connection closed');
          
          // Close queues
          const { queueManager } = require('./workers/queueManager');
          await queueManager.closeQueues();
          logger.info('⚡ Queues closed');
          
          logger.info('✅ Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          logger.error('❌ Error during graceful shutdown:', error);
          process.exit(1);
        }
      });
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('💥 Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }
}

// Start the server
const notificationServer = new NotificationServer();
notificationServer.start();

export default notificationServer;
