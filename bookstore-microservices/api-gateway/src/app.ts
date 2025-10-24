import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import { corsOptions } from './config/cors';
import { userRoutes } from './routes/user';
import { bookRoutes } from './routes/book';
import { orderRoutes } from './routes/order';
import { paymentRoutes } from './routes/payment';
import { notificationRoutes } from './routes/notification';

class ApiGatewayApp {
  private app: Application;

  constructor() {
    this.app = express();
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
        service: 'API Gateway',
        version: '1.0.0'
      });
    });

    // API routes
    this.app.use('/api/v1/users', userRoutes);
    this.app.use('/api/v1/books', bookRoutes);
    this.app.use('/api/v1/orders', orderRoutes);
    this.app.use('/api/v1/payments', paymentRoutes);
    this.app.use('/api/v1/notifications', notificationRoutes);

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

  public getApp(): Application {
    return this.app;
  }
}

// Create and export the app instance
const apiGatewayApp = new ApiGatewayApp();
export const app = apiGatewayApp.getApp();
export default app;
