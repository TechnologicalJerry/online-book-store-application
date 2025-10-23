// Common API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// User Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: Address;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: Address;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: Address;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: Address;
}

export interface RegisterResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  permissions: string[];
}

export interface RefreshTokenPayload {
  id: string;
}

// Book Types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  publishedDate?: Date;
  publisher?: string;
  language?: string;
  pages?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookRequest {
  title: string;
  author: string;
  isbn: string;
  description?: string;
  price: number;
  category: string;
  stock: number;
  publishedDate?: Date;
  publisher?: string;
  language?: string;
  pages?: number;
  imageUrl?: string;
}

export interface UpdateBookRequest {
  title?: string;
  author?: string;
  isbn?: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  publishedDate?: Date;
  publisher?: string;
  language?: string;
  pages?: number;
  imageUrl?: string;
}

export interface BookSearchRequest {
  query?: string;
  category?: string;
  author?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  bookId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

export interface UpdateOrderRequest {
  status?: OrderStatus;
  trackingNumber?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'stripe';

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentDetails?: PaymentDetails;
}

export interface PaymentDetails {
  cardNumber?: string;
  expiryMonth?: number;
  expiryYear?: number;
  cvv?: string;
  cardholderName?: string;
}

export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment';

// Common Query Parameters
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  sortBy?: string;
}

export interface SearchQuery extends PaginationQuery {
  query?: string;
}

// Error Types
export interface ApiError {
  error: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
  method: string;
}

// Service Configuration Types
export interface ServiceConfig {
  name: string;
  url: string;
  timeout: number;
  retries: number;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

// Health Check Types
export interface HealthCheck {
  status: 'OK' | 'ERROR';
  timestamp: string;
  service: string;
  version: string;
  dependencies?: {
    database: 'OK' | 'ERROR';
    redis: 'OK' | 'ERROR';
  };
}
