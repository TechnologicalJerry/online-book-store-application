import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './middleware/rateLimiter';
import { corsOptions } from './config/cors';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { notificationRoutes } from './routes/notification';
import { initializeQueues } from './workers/queueManager';

// Load environment variables
dotenv.config();

class NotificationService {
  private app: Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3007', 10);
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());
    
    // CORS configuration
    this.app.use(cors(corsOptions));
    
    // Logging middleware
    this.app.use(morgan('combined', {
      stream: { write: (message: string) => logger.info(message.trim()) }
    }));
    
    // Rate limiting
    this.app.use(rateLimiter);
    
    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // Request logging
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      logger.info(`${req.method} ${req.path} - ${req.ip}`);
      next();
    });
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Notification Service',
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/notifications', notificationRoutes);

    // Catch-all route for undefined endpoints
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`,
        timestamp: new Date().toISOString()
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDatabase();
      
      // Connect to Redis
      await connectRedis();
      
      // Initialize queues
      await initializeQueues();
      
      // Start the server
      this.app.listen(this.port, () => {
        logger.info(`Notification Service server running on port ${this.port}`);
        logger.info(`Environment: ${process.env.NODE_ENV}`);
      });
    } catch (error) {
      logger.error('Failed to start Notification Service:', error);
      process.exit(1);
    }
  }

  public getApp(): Application {
    return this.app;
  }
}

// Start the server
const notificationService = new NotificationService();
notificationService.start();

export default notificationService;
