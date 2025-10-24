# Notification Service

A comprehensive notification service built with Express and TypeScript for the Online Book Store application. This service handles email, SMS, push notifications, and in-app notifications with background processing and queue management.

## 🚀 Features

### **Multi-Channel Notifications**
- **Email Notifications**: Order confirmations, shipping updates, promotional emails
- **SMS Notifications**: Order updates, delivery notifications, OTP verification
- **Push Notifications**: Real-time mobile and web push notifications
- **In-App Notifications**: User dashboard notifications

### **Advanced Features**
- **Background Processing**: Redis-backed queue system with Bull
- **Scheduled Notifications**: Send notifications at specific times
- **Retry Logic**: Automatic retry for failed notifications
- **Template System**: Pre-built templates for common notification types
- **Bulk Operations**: Send notifications to multiple users
- **User Preferences**: Granular notification preferences per user

### **Technical Features**
- **TypeScript**: Full type safety and IntelliSense support
- **MongoDB**: Scalable document storage for notifications
- **Redis**: High-performance caching and queue management
- **Rate Limiting**: Protection against spam and abuse
- **Health Checks**: Service monitoring and status reporting
- **Docker Support**: Containerized deployment

## 📁 Project Structure

```
notification-service/
├── src/
│   ├── app.ts                    # Main application entry point
│   ├── config/                   # Configuration files
│   │   ├── database.ts          # MongoDB connection
│   │   ├── redis.ts             # Redis connection
│   │   └── cors.ts              # CORS configuration
│   ├── controllers/             # Request handlers
│   │   └── notificationController.ts
│   ├── middleware/              # Express middleware
│   │   ├── auth.ts              # Authentication middleware
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   └── errorHandler.ts      # Error handling
│   ├── models/                  # Database models
│   │   └── Notification.ts      # Notification schema
│   ├── routes/                  # API routes
│   │   └── notification.ts      # Notification endpoints
│   ├── services/                # Business logic
│   │   ├── emailService.ts      # Email notifications
│   │   ├── smsService.ts        # SMS notifications
│   │   ├── pushNotificationService.ts # Push notifications
│   │   └── notificationService.ts # Core service logic
│   ├── utils/                   # Utility functions
│   │   ├── logger.ts            # Logging configuration
│   │   └── validator.ts          # Input validation
│   └── workers/                 # Background workers
│       └── queueManager.ts      # Queue management
├── package.json
├── tsconfig.json
├── Dockerfile
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- MongoDB
- Redis
- SMTP server (Gmail, SendGrid, etc.)
- Twilio account (for SMS)
- Firebase project (for push notifications)

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Service Configuration
NODE_ENV=development
PORT=3007

# Database
MONGODB_URI=mongodb://localhost:27017/bookstore_notifications

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@bookstore.com

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Firebase (Push Notifications)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
FIREBASE_PROJECT_ID=your-firebase-project-id

# Client
CLIENT_URL=http://localhost:3001
```

### Installation

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### **Notifications**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications` | Get user notifications | ✅ |
| GET | `/api/notifications/:id` | Get notification by ID | ✅ |
| POST | `/api/notifications` | Create notification | ✅ (Admin) |
| PUT | `/api/notifications/:id/read` | Mark as read | ✅ |
| PUT | `/api/notifications/mark-all-read` | Mark all as read | ✅ |
| DELETE | `/api/notifications/:id` | Delete notification | ✅ |
| DELETE | `/api/notifications` | Delete all notifications | ✅ |
| GET | `/api/notifications/stats` | Get notification statistics | ✅ |
| POST | `/api/notifications/bulk` | Send bulk notifications | ✅ (Admin) |

### **Preferences**

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/notifications/preferences` | Get user preferences | ✅ |
| PUT | `/api/notifications/preferences` | Update preferences | ✅ |

## 🔧 Usage Examples

### **Create a Notification**

```typescript
const notification = {
  userId: "user123",
  type: "order",
  title: "Order Confirmed",
  message: "Your order #12345 has been confirmed",
  channels: ["email", "sms", "push"],
  data: {
    orderId: "12345",
    totalAmount: 99.99,
    userEmail: "user@example.com",
    userPhone: "+1234567890",
    fcmToken: "firebase-token"
  }
};

// POST /api/notifications
const response = await fetch('/api/notifications', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(notification)
});
```

### **Send Bulk Notifications**

```typescript
const bulkNotification = {
  userIds: ["user1", "user2", "user3"],
  type: "promotion",
  title: "Special Offer",
  message: "Get 20% off on all books!",
  channels: ["email", "push"],
  data: {
    discount: 20,
    code: "SAVE20",
    validUntil: "2024-12-31"
  }
};

// POST /api/notifications/bulk
const response = await fetch('/api/notifications/bulk', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(bulkNotification)
});
```

### **Get User Notifications**

```typescript
// GET /api/notifications?page=1&limit=20&type=order
const response = await fetch('/api/notifications?page=1&limit=20&type=order', {
  headers: {
    'Authorization': 'Bearer your-jwt-token'
  }
});

const { notifications, pagination } = await response.json();
```

## 🔄 Background Processing

The service uses Redis and Bull for background processing:

### **Queue Types**
- **Notification Queue**: Processes individual notifications
- **Retry Queue**: Handles failed notification retries
- **Scheduled Queue**: Processes scheduled notifications

### **Automatic Tasks**
- **Retry Failed Notifications**: Every 5 minutes
- **Process Scheduled Notifications**: Every minute
- **Cleanup Old Jobs**: Automatic cleanup of completed jobs

## 📊 Monitoring

### **Health Check**
```bash
curl http://localhost:3007/health
```

### **Queue Statistics**
```typescript
// Get queue stats
const stats = await queueManager.getQueueStats();
console.log(stats);
```

### **Notification Statistics**
```typescript
// Get notification stats
const stats = await notificationService.getNotificationStats();
console.log(stats);
```

## 🐳 Docker Deployment

### **Build and Run**
```bash
# Build the image
docker build -t notification-service .

# Run the container
docker run -p 3007:3007 notification-service
```

### **Docker Compose**
```yaml
notification-service:
  build: ./notification-service
  ports:
    - "3007:3007"
  environment:
    - MONGODB_URI=mongodb://mongodb:27017/bookstore_notifications
    - REDIS_HOST=redis
  depends_on:
    - mongodb
    - redis
```

## 🔒 Security Features

- **JWT Authentication**: Secure API access
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Joi schema validation
- **CORS Configuration**: Cross-origin request security
- **Error Handling**: Secure error responses

## 📈 Performance Features

- **Redis Caching**: Fast data access
- **Queue Processing**: Asynchronous processing
- **Connection Pooling**: Efficient database connections
- **Background Workers**: Non-blocking operations
- **Health Monitoring**: Service status tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

## 📝 Logging

The service uses Winston for structured logging:

- **Console Logging**: Development environment
- **File Logging**: Production environment
- **Log Rotation**: Automatic log file rotation
- **Error Tracking**: Detailed error logging

## 🚀 Production Deployment

### **Environment Setup**
1. Set all required environment variables
2. Configure SMTP, Twilio, and Firebase credentials
3. Set up MongoDB and Redis clusters
4. Configure load balancers and monitoring

### **Scaling Considerations**
- **Horizontal Scaling**: Multiple service instances
- **Queue Scaling**: Multiple queue workers
- **Database Scaling**: MongoDB sharding
- **Cache Scaling**: Redis clustering

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
