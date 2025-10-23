# Book Store Microservices

This directory contains the microservices architecture for the Online Book Store application, built with Express and TypeScript.

## 🏗️ Architecture Overview

The microservices are organized as follows:

- **API Gateway** (Port 3000): Central entry point for all client requests
- **User Service** (Port 3003): User management, authentication, and profiles
- **Book Service** (Port 3004): Book catalog, inventory, and search (Java Spring Boot)
- **Order Service** (Port 3005): Order processing and management (Python Flask)
- **Payment Service** (Port 3006): Payment processing (Java Spring Boot)
- **Notification Service** (Port 3007): Email, SMS, and push notifications (Node.js)

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- MongoDB (for local development)
- Redis (for local development)

### Environment Setup

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Update the environment variables in `.env`:
```bash
# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@bookstore.com

# Client URLs
CLIENT_URL=http://localhost:3001
```

### Running with Docker Compose

1. Start all services:
```bash
docker-compose up -d
```

2. Check service health:
```bash
docker-compose ps
```

3. View logs:
```bash
docker-compose logs -f api-gateway
docker-compose logs -f user-service
```

### Local Development

#### API Gateway

```bash
cd api-gateway
npm install
npm run dev
```

#### User Service

```bash
cd user-service
npm install
npm run dev
```

## 📁 Project Structure

```
bookstore-microservices/
├── api-gateway/                 # API Gateway Service
│   ├── src/
│   │   ├── app.ts              # Main application
│   │   ├── config/             # Configuration files
│   │   ├── middleware/         # Express middleware
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── user-service/               # User Management Service
│   ├── src/
│   │   ├── app.ts              # Main application
│   │   ├── config/             # Configuration files
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Express middleware
│   │   ├── models/             # Database models
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   └── utils/              # Utility functions
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── shared/                     # Shared Libraries
│   └── types/                  # TypeScript type definitions
│
├── nginx/                      # Nginx configuration
│   └── nginx.conf
│
├── docker-compose.yml          # Docker orchestration
├── .env.example               # Environment variables template
└── README.md
```

## 🔧 API Endpoints

### API Gateway (Port 3000)

- `GET /health` - Health check
- `POST /api/v1/users/register` - User registration
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `GET /api/v1/books` - Get books
- `GET /api/v1/books/:id` - Get book by ID
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders` - Get user orders
- `POST /api/v1/payments` - Process payment
- `GET /api/v1/notifications` - Get notifications

### User Service (Port 3003)

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user profile

## 🛠️ Development

### TypeScript Configuration

Both services use TypeScript with strict type checking. The configuration includes:

- Strict null checks
- No implicit any
- Path mapping for clean imports
- Source maps for debugging

### Code Quality

- ESLint for code linting
- Prettier for code formatting
- Jest for unit testing
- Supertest for API testing

### Database

- **MongoDB**: User data, book catalog, orders
- **Redis**: Caching, session storage, rate limiting

### Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Input validation with Joi
- Helmet for security headers

## 🐳 Docker

### Building Images

```bash
# Build API Gateway
docker build -t api-gateway ./api-gateway

# Build User Service
docker build -t user-service ./user-service
```

### Running Individual Services

```bash
# Run API Gateway
docker run -p 3000:3000 api-gateway

# Run User Service
docker run -p 3003:3003 user-service
```

## 📊 Monitoring

### Health Checks

All services include health check endpoints:

- API Gateway: `http://localhost:3000/health`
- User Service: `http://localhost:3003/health`

### Logging

- Winston for structured logging
- Log levels: error, warn, info, debug
- Log rotation and file management
- Request/response logging

## 🔒 Security

### Authentication

- JWT tokens with configurable expiration
- Refresh token mechanism
- Password strength validation
- Account lockout after failed attempts

### Authorization

- Role-based access control
- Permission-based authorization
- Resource ownership validation

### Rate Limiting

- Global rate limiting
- Authentication endpoint rate limiting
- IP-based rate limiting
- Redis-backed rate limiting

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Set all required environment variables
2. **SSL/TLS**: Configure HTTPS with proper certificates
3. **Database**: Use managed database services
4. **Monitoring**: Set up application monitoring
5. **Logging**: Configure centralized logging
6. **Scaling**: Use load balancers and horizontal scaling

### Environment Variables

Required environment variables for production:

```bash
# Database
MONGODB_URI=mongodb://user:pass@host:port/database
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=redis-password

# Security
JWT_SECRET=very-secure-secret-key
JWT_REFRESH_SECRET=very-secure-refresh-secret

# Email
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
SMTP_USER=email@domain.com
SMTP_PASS=app-password
SMTP_FROM=noreply@domain.com

# Client
CLIENT_URL=https://your-domain.com
```

## 📝 API Documentation

For detailed API documentation, see:

- [API Gateway Documentation](./api-gateway/README.md)
- [User Service Documentation](./user-service/README.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
