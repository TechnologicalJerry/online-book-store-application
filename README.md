# Online Book Store Application

A comprehensive **microservices-based bookstore application** with multiple client interfaces. This project demonstrates modern software architecture patterns using microservices, containerization, and multiple frontend technologies.

## 🏗️ Architecture Overview

This application follows a **microservices architecture** where each service is independent, handles a specific responsibility, and communicates with others via APIs or messaging queues. This design makes the application **scalable, maintainable, and flexible**.

## 📁 Project Structure

```
online-book-store-application/
├── bookstore-microservices/          # Backend microservices
│   ├── api-gateway/                  # Single entry point for all requests
│   ├── user-service/                 # User management
│   ├── book-service/                 # Book catalog management
│   ├── order-service/                # Order processing
│   ├── payment-service/              # Payment processing
│   ├── notification-service/         # Notifications & messaging
│   ├── docker-compose.yml           # Service orchestration
│   └── README.md                    # Microservices documentation
├── react-client/                     # React frontend application
├── angular-client/                   # Angular frontend application
├── vue-client/                       # Vue.js frontend application
└── README.md                        # This file
```

## 🚀 Microservices Architecture

### 1️⃣ **API Gateway** (`api-gateway/`)
- **Tech Stack:** Node.js (Express/NestJS)
- **Purpose:** Single entry point for all client requests
- **Responsibilities:**
  - Routes requests to appropriate microservices
  - Handles authentication and authorization (JWT tokens)
  - Rate limiting, logging, and caching
  - Load balancing across services

### 2️⃣ **User Service** (`user-service/`)
- **Tech Stack:** Node.js + MongoDB
- **Purpose:** User management and authentication
- **Responsibilities:**
  - User registration and login
  - Profile management
  - Password encryption and JWT token generation
  - User data storage in MongoDB

### 3️⃣ **Book Service** (`book-service/`)
- **Tech Stack:** Java + MySQL (Spring Boot)
- **Purpose:** Book catalog and inventory management
- **Responsibilities:**
  - CRUD operations for books
  - Book search and filtering
  - Inventory management
  - Book metadata storage in MySQL

### 4️⃣ **Order Service** (`order-service/`)
- **Tech Stack:** Python + PostgreSQL (FastAPI/Flask)
- **Purpose:** Order processing and management
- **Responsibilities:**
  - Order creation and validation
  - Order history tracking
  - Integration with payment and notification services
  - Order status management

### 5️⃣ **Payment Service** (`payment-service/`)
- **Tech Stack:** Java + PostgreSQL/MySQL
- **Purpose:** Secure payment processing
- **Responsibilities:**
  - Payment gateway integration (Stripe, PayPal)
  - Transaction processing and validation
  - Payment history storage
  - Refund processing

### 6️⃣ **Notification Service** (`notification-service/`)
- **Tech Stack:** Node.js + RabbitMQ/SMTP
- **Purpose:** User notifications and messaging
- **Responsibilities:**
  - Email notifications (order confirmations, password resets)
  - Asynchronous messaging via RabbitMQ
  - Push notifications for mobile apps
  - Notification templates and delivery

## 🖥️ Frontend Applications

### React Client (`react-client/`)
- **Tech Stack:** Next.js + TypeScript
- **Purpose:** Modern React-based web application
- **Features:**
  - Server-side rendering (SSR)
  - TypeScript for type safety
  - Modern UI components
  - Responsive design

### Angular Client (`angular-client/`)
- **Tech Stack:** Angular + TypeScript
- **Purpose:** Enterprise-grade Angular application
- **Features:**
  - Component-based architecture
  - TypeScript for type safety
  - Angular Material UI
  - Progressive Web App (PWA) capabilities

### Vue Client (`vue-client/`)
- **Tech Stack:** Nuxt.js + Vue.js + TypeScript
- **Purpose:** Modern Vue.js-based web application
- **Features:**
  - Server-side rendering (SSR) and static site generation (SSG)
  - Vue.js 3 with Composition API
  - TypeScript for type safety
  - Vue ecosystem (Vuex/Pinia for state management)
  - Responsive design with modern UI frameworks
  - Auto-imports and file-based routing

## 🔄 Service Communication Flow

1. **Client Request** → API Gateway
2. **API Gateway** → Routes to appropriate microservice
3. **Authentication** → User Service validates JWT tokens
4. **Book Browsing** → Book Service provides catalog data
5. **Order Creation** → Order Service processes orders
6. **Payment Processing** → Payment Service handles transactions
7. **Notifications** → Notification Service sends confirmations
8. **Response** → API Gateway returns result to client

## 🐳 Docker & Containerization

The entire application is containerized using Docker:

- **Docker Compose** orchestrates all microservices
- Each service runs in its own container
- Databases (MongoDB, MySQL, PostgreSQL) are containerized
- RabbitMQ for message queuing
- Network configuration for service communication

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local development)
- Java (for book-service and payment-service)
- Python (for order-service)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd online-book-store-application
   ```

2. **Start all microservices:**
   ```bash
   cd bookstore-microservices
   docker-compose up -d
   ```

3. **Start React client:**
   ```bash
   cd react-client
   npm install
   npm run dev
   ```

4. **Start Angular client:**
   ```bash
   cd angular-client
   npm install
   ng serve
   ```

5. **Start Vue client:**
   ```bash
   cd vue-client
   npm install
   npm run dev
   ```

### Access Points
- **API Gateway:** http://localhost:3000
- **React Client:** http://localhost:3001
- **Angular Client:** http://localhost:4200
- **Vue Client:** http://localhost:3002
- **Database Admin:** Various ports (see docker-compose.yml)

## 📊 Database Schema

- **MongoDB:** User data and profiles
- **MySQL:** Book catalog and inventory
- **PostgreSQL:** Orders and payment transactions
- **RabbitMQ:** Message queuing for notifications

## 🔧 Development

### Adding New Features
1. Identify which microservice should handle the feature
2. Implement the feature in the appropriate service
3. Update API Gateway routing if needed
4. Update client applications to consume new APIs
5. Test with Docker Compose

### Scaling Services
- Each microservice can be scaled independently
- Use Docker Compose scaling: `docker-compose up --scale service-name=3`
- Load balancers can distribute traffic across service instances

## 🧪 Testing

- **Unit Tests:** Each service has its own test suite
- **Integration Tests:** Test service communication
- **End-to-End Tests:** Test complete user workflows
- **Load Testing:** Test service performance under load

## 📚 API Documentation

Each microservice provides its own API documentation:
- **User Service:** `/api/users/docs`
- **Book Service:** `/api/books/docs`
- **Order Service:** `/api/orders/docs`
- **Payment Service:** `/api/payments/docs`
- **Notification Service:** `/api/notifications/docs`

## 🔒 Security

- JWT-based authentication
- API rate limiting
- Input validation and sanitization
- Secure payment processing
- HTTPS encryption
- CORS configuration

## 📈 Monitoring & Logging

- Centralized logging across all services
- Health check endpoints
- Performance monitoring
- Error tracking and alerting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For questions and support:
- Check the individual service README files
- Review the API documentation
- Open an issue on GitHub

---

**Note:** This is a demonstration project showcasing microservices architecture. For production use, additional considerations like security hardening, monitoring, and deployment strategies should be implemented.