import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserServiceResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export class UserService {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.USER_SERVICE_URL || 'http://localhost:3003';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        logger.info(`Making request to User Service: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        logger.error('User Service request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        logger.info(`User Service response: ${response.status} ${response.statusText}`);
        return response;
      },
      (error) => {
        logger.error('User Service response error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  async register(userData: Partial<User>): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.post('/api/users/register', userData);
      return {
        success: true,
        data: response.data,
        message: 'User registered successfully'
      };
    } catch (error: any) {
      logger.error('User registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'User registration failed'
      };
    }
  }

  async login(email: string, password: string): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.post('/api/users/login', {
        email,
        password
      });
      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error: any) {
      logger.error('User login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  }

  async getUserById(id: string, token?: string): Promise<UserServiceResponse> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response: AxiosResponse = await this.client.get(`/api/users/${id}`, { headers });
      return {
        success: true,
        data: response.data,
        message: 'User retrieved successfully'
      };
    } catch (error: any) {
      logger.error('Get user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve user'
      };
    }
  }

  async updateUser(id: string, userData: Partial<User>, token: string): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.put(`/api/users/${id}`, userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        success: true,
        data: response.data,
        message: 'User updated successfully'
      };
    } catch (error: any) {
      logger.error('Update user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update user'
      };
    }
  }

  async deleteUser(id: string, token: string): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.delete(`/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return {
        success: true,
        data: response.data,
        message: 'User deleted successfully'
      };
    } catch (error: any) {
      logger.error('Delete user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete user'
      };
    }
  }

  async getUsers(queryParams?: any, token?: string): Promise<UserServiceResponse> {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response: AxiosResponse = await this.client.get('/api/users', {
        headers,
        params: queryParams
      });
      return {
        success: true,
        data: response.data,
        message: 'Users retrieved successfully'
      };
    } catch (error: any) {
      logger.error('Get users error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to retrieve users'
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.post('/api/users/refresh-token', {
        refreshToken
      });
      return {
        success: true,
        data: response.data,
        message: 'Token refreshed successfully'
      };
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed'
      };
    }
  }

  async forgotPassword(email: string): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.post('/api/users/forgot-password', {
        email
      });
      return {
        success: true,
        data: response.data,
        message: 'Password reset email sent'
      };
    } catch (error: any) {
      logger.error('Forgot password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to send password reset email'
      };
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<UserServiceResponse> {
    try {
      const response: AxiosResponse = await this.client.post('/api/users/reset-password', {
        token,
        newPassword
      });
      return {
        success: true,
        data: response.data,
        message: 'Password reset successfully'
      };
    } catch (error: any) {
      logger.error('Reset password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed'
      };
    }
  }
}

export const userService = new UserService();
