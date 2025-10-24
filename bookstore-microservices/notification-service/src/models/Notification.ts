import mongoose, { Document, Schema, Model } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  data?: any;
  channels: NotificationChannel[];
  status: NotificationStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  readAt?: Date;
  retryCount: number;
  maxRetries: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationModel extends Model<INotification> {
  findByUserId(userId: string, options?: any): Promise<INotification[]>;
  findUnreadByUserId(userId: string): Promise<INotification[]>;
  markAsRead(notificationId: string, userId: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<number>;
  getNotificationStats(userId: string): Promise<any>;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'order' | 'payment' | 'shipping' | 'promotion';
export type NotificationChannel = 'email' | 'sms' | 'push' | 'in_app';
export type NotificationStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'cancelled';

const notificationSchema = new Schema<INotification>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'order', 'payment', 'shipping', 'promotion'],
    required: [true, 'Notification type is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  data: {
    type: Schema.Types.Mixed,
    default: {}
  },
  channels: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true
  }],
  status: {
    type: String,
    enum: ['pending', 'processing', 'sent', 'failed', 'cancelled'],
    default: 'pending',
    index: true
  },
  scheduledAt: {
    type: Date,
    index: true
  },
  sentAt: {
    type: Date
  },
  readAt: {
    type: Date
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ status: 1, scheduledAt: 1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for notification age
notificationSchema.virtual('age').get(function() {
  return Date.now() - this.createdAt.getTime();
});

// Instance methods
notificationSchema.methods.markAsRead = function() {
  this.isRead = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsSent = function() {
  this.status = 'sent';
  this.sentAt = new Date();
  return this.save();
};

notificationSchema.methods.markAsFailed = function(errorMessage: string) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  return this.save();
};

notificationSchema.methods.canRetry = function() {
  return this.retryCount < this.maxRetries && this.status === 'failed';
};

// Static methods
notificationSchema.statics.findByUserId = function(userId: string, options: any = {}) {
  const { page = 1, limit = 20, type, isRead, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const skip = (page - 1) * limit;
  
  const query: any = { userId };
  if (type) query.type = type;
  if (isRead !== undefined) query.isRead = isRead;
  
  const sortOptions: any = {};
  sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
  
  return this.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);
};

notificationSchema.statics.findUnreadByUserId = function(userId: string) {
  return this.find({ userId, isRead: false }).sort({ createdAt: -1 });
};

notificationSchema.statics.markAsRead = function(notificationId: string, userId: string) {
  return this.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

notificationSchema.statics.markAllAsRead = function(userId: string) {
  return this.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

notificationSchema.statics.getNotificationStats = function(userId: string) {
  return this.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } },
        byType: {
          $push: {
            type: '$type',
            isRead: '$isRead'
          }
        }
      }
    },
    {
      $project: {
        total: 1,
        unread: 1,
        read: { $subtract: ['$total', '$unread'] },
        typeStats: {
          $reduce: {
            input: '$byType',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $let: {
                    vars: {
                      type: '$$this.type',
                      isRead: '$$this.isRead'
                    },
                    in: {
                      $mergeObjects: [
                        { $ifNull: [`$$value.$$type`, { total: 0, unread: 0 }] },
                        {
                          total: { $add: [{ $ifNull: [`$$value.$$type.total`, 0] }, 1] },
                          unread: { $add: [{ $ifNull: [`$$value.$$type.unread`, 0] }, { $cond: ['$$isRead', 0, 1] }] }
                        }
                      ]
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]);
};

export const Notification: INotificationModel = mongoose.model<INotification, INotificationModel>('Notification', notificationSchema);
