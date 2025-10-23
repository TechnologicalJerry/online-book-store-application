import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/bcrypt';
import { logger } from '../utils/logger';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthenticatedRequest } from '../middleware/auth';

export const userController = {
  getProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });
  }),

  updateProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const { firstName, lastName, phone, dateOfBirth, address } = req.body;

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = new Date(dateOfBirth);
    if (address !== undefined) user.address = address;

    await user.save();

    logger.info(`Profile updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          updatedAt: user.updatedAt
        }
      }
    });
  }),

  deleteProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;

    // Soft delete - deactivate account instead of hard delete
    user.isActive = false;
    await user.save();

    logger.info(`Profile deactivated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Profile deleted successfully'
    });
  }),

  getUsers: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { page = 1, limit = 10, sort = 'desc', sortBy = 'createdAt' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const sortOptions: any = {};
    sortOptions[sortBy as string] = sort === 'desc' ? -1 : 1;

    const users = await User.find()
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  }),

  getUserById: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -emailVerificationToken -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  }),

  updateUser: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { firstName, lastName, phone, dateOfBirth, address, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = new Date(dateOfBirth);
    if (address !== undefined) user.address = address;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    logger.info(`User updated: ${user.email}`);

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          address: user.address,
          role: user.role,
          isActive: user.isActive,
          isEmailVerified: user.isEmailVerified,
          updatedAt: user.updatedAt
        }
      }
    });
  }),

  deleteUser: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Soft delete - deactivate account
    user.isActive = false;
    await user.save();

    logger.info(`User deactivated: ${user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  }),

  getPublicUserProfile: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id).select('firstName lastName email role createdAt');
    if (!user || !user.isActive) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          memberSince: user.createdAt
        }
      }
    });
  }),

  getUserPreferences: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;

    // This would typically come from a separate preferences collection
    // For now, we'll return a basic structure
    res.json({
      success: true,
      data: {
        preferences: {
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false
          },
          preferences: {
            language: 'en',
            timezone: 'UTC',
            currency: 'USD'
          }
        }
      }
    });
  }),

  updateUserPreferences: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;
    const preferences = req.body;

    // This would typically update a separate preferences collection
    // For now, we'll just return success
    logger.info(`Preferences updated for user: ${user.email}`);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences }
    });
  }),

  getUserActivity: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user!;

    // This would typically come from an activity log collection
    // For now, we'll return a basic structure
    res.json({
      success: true,
      data: {
        activity: [
          {
            type: 'login',
            timestamp: user.lastLogin,
            description: 'Last login'
          },
          {
            type: 'registration',
            timestamp: user.createdAt,
            description: 'Account created'
          }
        ]
      }
    });
  }),

  getUserAnalytics: asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    // This would typically aggregate data from various collections
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const verifiedUsers = await User.countDocuments({ isEmailVerified: true });

    res.json({
      success: true,
      data: {
        analytics: {
          totalUsers,
          activeUsers,
          verifiedUsers,
          verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
        }
      }
    });
  })
};
