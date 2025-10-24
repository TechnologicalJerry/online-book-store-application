# Complete Project Structure

## 📁 Full File and Folder Structure

```
online-book-store-application/
├── README.md
├── PROJECT_STRUCTURE.md
├── docker-compose.yml                    # Main orchestration file
├── .gitignore
├── .env.example
│
├── bookstore-microservices/              # Backend Microservices
│   ├── README.md
│   ├── docker-compose.yml               # Microservices orchestration
│   ├── .env.example
│   ├── nginx/
│   │   └── nginx.conf                   # Load balancer configuration
│   │
│   ├── api-gateway/                     # API Gateway Service (Express + TypeScript)
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── src/
│   │   │   ├── app.ts                   # Express application configuration
│   │   │   ├── server.ts               # Server startup and lifecycle
│   │   │   ├── config/
│   │   │   │   ├── cors.ts
│   │   │   │   └── database.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rateLimiter.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── routes/
│   │   │   │   ├── user.ts
│   │   │   │   ├── book.ts
│   │   │   │   ├── order.ts
│   │   │   │   ├── payment.ts
│   │   │   │   └── notification.ts
│   │   │   ├── services/
│   │   │   │   └── userService.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       └── validator.ts
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   │
│   ├── user-service/                    # User Management Service (Express + TypeScript)
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── src/
│   │   │   ├── app.ts                   # Express application configuration
│   │   │   ├── server.ts               # Server startup and lifecycle
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   └── cors.ts
│   │   │   ├── models/
│   │   │   │   └── User.ts
│   │   │   ├── controllers/
│   │   │   │   ├── authController.ts
│   │   │   │   └── userController.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts
│   │   │   │   └── user.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rateLimiter.ts
│   │   │   │   └── errorHandler.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       ├── bcrypt.ts
│   │   │       ├── jwt.ts
│   │   │       └── email.ts
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   │
│   ├── book-service/                    # Book Catalog Service
│   │   ├── pom.xml                     # Maven configuration
│   │   ├── Dockerfile
│   │   ├── .env
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/bookstore/book/
│   │   │       │       ├── BookServiceApplication.java
│   │   │       │       ├── controller/
│   │   │       │       │   └── BookController.java
│   │   │       │       ├── model/
│   │   │       │       │   ├── Book.java
│   │   │       │       │   └── Category.java
│   │   │       │       ├── repository/
│   │   │       │       │   └── BookRepository.java
│   │   │       │       ├── service/
│   │   │       │       │   └── BookService.java
│   │   │       │       └── config/
│   │   │       │           └── DatabaseConfig.java
│   │   │       └── resources/
│   │   │           ├── application.yml
│   │   │           └── application.properties
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   │
│   ├── order-service/                   # Order Processing Service
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   ├── .env
│   │   ├── src/
│   │   │   ├── app.py
│   │   │   ├── models/
│   │   │   │   ├── order.py
│   │   │   │   └── order_item.py
│   │   │   ├── controllers/
│   │   │   │   └── order_controller.py
│   │   │   ├── routes/
│   │   │   │   └── order_routes.py
│   │   │   ├── services/
│   │   │   │   ├── order_service.py
│   │   │   │   └── payment_integration.py
│   │   │   ├── utils/
│   │   │   │   ├── database.py
│   │   │   │   └── validators.py
│   │   │   └── config/
│   │   │       └── settings.py
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   │
│   ├── payment-service/                 # Payment Processing Service
│   │   ├── pom.xml
│   │   ├── Dockerfile
│   │   ├── .env
│   │   ├── src/
│   │   │   └── main/
│   │   │       ├── java/
│   │   │       │   └── com/bookstore/payment/
│   │   │       │       ├── PaymentServiceApplication.java
│   │   │       │       ├── controller/
│   │   │       │       │   └── PaymentController.java
│   │   │       │       ├── model/
│   │   │       │       │   ├── Payment.java
│   │   │       │       │   └── Transaction.java
│   │   │       │       ├── repository/
│   │   │       │       │   └── PaymentRepository.java
│   │   │       │       ├── service/
│   │   │       │       │   ├── PaymentService.java
│   │   │       │       │   └── StripeService.java
│   │   │       │       └── config/
│   │   │       │           └── DatabaseConfig.java
│   │   │       └── resources/
│   │   │           ├── application.yml
│   │   │           └── application.properties
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   │
│   ├── notification-service/            # Notification Service (Express + TypeScript)
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   ├── README.md
│   │   ├── src/
│   │   │   ├── app.ts                   # Express application configuration
│   │   │   ├── server.ts               # Server startup and lifecycle
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── redis.ts
│   │   │   │   └── cors.ts
│   │   │   ├── models/
│   │   │   │   └── Notification.ts
│   │   │   ├── controllers/
│   │   │   │   └── notificationController.ts
│   │   │   ├── routes/
│   │   │   │   └── notification.ts
│   │   │   ├── services/
│   │   │   │   ├── emailService.ts
│   │   │   │   ├── smsService.ts
│   │   │   │   ├── pushNotificationService.ts
│   │   │   │   └── notificationService.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── rateLimiter.ts
│   │   │   │   └── errorHandler.ts
│   │   │   ├── workers/
│   │   │   │   └── queueManager.ts
│   │   │   └── utils/
│   │   │       ├── logger.ts
│   │   │       └── validator.ts
│   │   └── tests/
│   │       ├── unit/
│   │       └── integration/
│   │
│   └── shared/                          # Shared Libraries
│       ├── types/
│       │   └── index.ts                 # TypeScript type definitions
│       ├── common/
│       │   ├── models/
│       │   ├── utils/
│       │   └── constants/
│       └── database/
│           ├── migrations/
│           └── seeds/
│
├── react-client/                        # React Frontend
│   ├── package.json
│   ├── package-lock.json
│   ├── next.config.js
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── .env.local
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── images/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── globals.css
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   ├── forms/
│   │   │   │   ├── navigation/
│   │   │   │   └── layout/
│   │   │   ├── pages/
│   │   │   │   ├── books/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   ├── profile/
│   │   │   │   └── auth/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.ts
│   │   │   │   └── books.ts
│   │   │   ├── store/
│   │   │   │   ├── authStore.ts
│   │   │   │   ├── cartStore.ts
│   │   │   │   └── bookStore.ts
│   │   │   ├── utils/
│   │   │   │   ├── constants.ts
│   │   │   │   ├── helpers.ts
│   │   │   │   └── validation.ts
│   │   │   └── types/
│   │   │       ├── auth.ts
│   │   │       ├── book.ts
│   │   │       └── order.ts
│   │   └── styles/
│   │       ├── globals.css
│   │       └── components/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── angular-client/                      # Angular Frontend
│   ├── package.json
│   ├── package-lock.json
│   ├── angular.json
│   ├── tsconfig.json
│   ├── Dockerfile
│   ├── .env
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── app.component.html
│   │   │   ├── app.component.scss
│   │   │   ├── app.module.ts
│   │   │   ├── app.routes.ts
│   │   │   ├── components/
│   │   │   │   ├── book-list/
│   │   │   │   ├── book-detail/
│   │   │   │   ├── cart/
│   │   │   │   ├── checkout/
│   │   │   │   ├── login/
│   │   │   │   └── navigation/
│   │   │   ├── services/
│   │   │   │   ├── api.service.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── book.service.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   └── order.service.ts
│   │   │   ├── models/
│   │   │   │   ├── user.model.ts
│   │   │   │   ├── book.model.ts
│   │   │   │   └── order.model.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   └── shared/
│   │   │       ├── components/
│   │   │       ├── pipes/
│   │   │       └── directives/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   ├── environments/
│   │   │   ├── environment.ts
│   │   │   └── environment.prod.ts
│   │   └── styles/
│   │       ├── styles.scss
│   │       └── themes/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── vue-client/                          # Vue.js Frontend
│   ├── package.json
│   ├── package-lock.json
│   ├── nuxt.config.ts
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   ├── .env
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── logo.svg
│   │   └── images/
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── navigation/
│   │   └── layout/
│   ├── pages/
│   │   ├── index.vue
│   │   ├── books/
│   │   │   ├── index.vue
│   │   │   └── [id].vue
│   │   ├── cart/
│   │   │   └── index.vue
│   │   ├── checkout/
│   │   │   └── index.vue
│   │   ├── profile/
│   │   │   └── index.vue
│   │   └── auth/
│   │       ├── login.vue
│   │       └── register.vue
│   ├── composables/
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useBooks.ts
│   │
│   ├── services/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── books.ts
│   │   └── orders.ts
│   ├── stores/
│   │   ├── auth.ts
│   │   ├── cart.ts
│   │   └── books.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── book.ts
│   │   └── order.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   └── validation.ts
│   ├── middleware/
│   │   └── auth.ts
│   ├── plugins/
│   │   └── api.client.ts
│   ├── layouts/
│   │   ├── default.vue
│   │   └── auth.vue
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css
│   │   └── images/
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
│
├── shared-docs/                         # Shared Documentation
│   ├── api-documentation/
│   │   ├── user-service-api.md
│   │   ├── book-service-api.md
│   │   ├── order-service-api.md
│   │   ├── payment-service-api.md
│   │   └── notification-service-api.md
│   ├── database-schemas/
│   │   ├── user-schema.sql
│   │   ├── book-schema.sql
│   │   ├── order-schema.sql
│   │   └── payment-schema.sql
│   └── deployment/
│       ├── docker-setup.md
│       ├── kubernetes-setup.md
│       └── production-deployment.md
│
├── scripts/                             # Utility Scripts
│   ├── setup.sh
│   ├── start-all.sh
│   ├── stop-all.sh
│   ├── build-all.sh
│   └── test-all.sh
│
└── monitoring/                          # Monitoring & Logging
    ├── prometheus/
    │   ├── prometheus.yml
    │   └── Dockerfile
    ├── grafana/
    │   ├── dashboards/
    │   └── Dockerfile
    ├── elasticsearch/
    │   └── Dockerfile
    ├── kibana/
    │   └── Dockerfile
    └── jaeger/
        └── Dockerfile
```

## 🗂️ Key Directories Explained

### Backend Microservices
- **api-gateway/**: Central entry point, routing, authentication (Express + TypeScript)
- **user-service/**: User management, authentication, profiles (Express + TypeScript)
- **book-service/**: Book catalog, inventory, search (Java Spring Boot)
- **order-service/**: Order processing, order history (Python Flask)
- **payment-service/**: Payment processing, transactions (Java Spring Boot)
- **notification-service/**: Email, SMS, push notifications (Express + TypeScript)

### Frontend Applications
- **react-client/**: Next.js React application with TypeScript
- **angular-client/**: Angular application with Material UI
- **vue-client/**: Nuxt.js Vue.js application with TypeScript

### Shared Resources
- **shared/**: Common libraries and utilities
- **shared-docs/**: API documentation and schemas
- **scripts/**: Automation and utility scripts
- **monitoring/**: Observability and logging tools

## 🔧 TypeScript Implementation Features

### API Gateway, User Service & Notification Service (Express + TypeScript)
- **Full Type Safety**: Comprehensive TypeScript interfaces and types
- **Strict Configuration**: Strict null checks, no implicit any
- **Path Mapping**: Clean imports with @ aliases
- **Source Maps**: Full debugging support
- **App/Server Separation**: Clean separation of Express app configuration and server lifecycle
- **JWT Authentication**: Token-based authentication with refresh tokens
- **Rate Limiting**: Redis-backed rate limiting with different tiers
- **Input Validation**: Joi schema validation for all endpoints
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Winston structured logging with multiple transports
- **Security**: Helmet security headers, CORS configuration
- **Database**: MongoDB with Mongoose ODM
- **Email Service**: Nodemailer integration for notifications
- **SMS Service**: Twilio integration for SMS notifications
- **Push Notifications**: Firebase Admin SDK for cross-platform push notifications
- **Background Processing**: Redis-backed queues with Bull for async processing
- **Graceful Shutdown**: Proper cleanup of connections and resources
- **Docker Support**: Multi-stage Docker builds with health checks

## 🚀 Quick Start Commands

```bash
# Start all microservices with Docker
cd bookstore-microservices
docker-compose up -d

# Or run services locally for development
cd bookstore-microservices/api-gateway
npm install && npm run dev

cd ../user-service
npm install && npm run dev

cd ../notification-service
npm install && npm run dev

# Start React client
cd ../../react-client
npm install && npm run dev

# Start Angular client
cd ../angular-client
npm install && ng serve

# Start Vue client
cd ../vue-client
npm install && npm run dev
```

## 📊 Port Assignments

- **API Gateway**: 3000
- **React Client**: 3001
- **Vue Client**: 3002
- **Angular Client**: 4200
- **User Service**: 3003
- **Book Service**: 3004
- **Order Service**: 3005
- **Payment Service**: 3006
- **Notification Service**: 3007
- **MongoDB**: 27017
- **MySQL**: 3306
- **PostgreSQL**: 5432
- **RabbitMQ**: 5672
- **Redis**: 6379
