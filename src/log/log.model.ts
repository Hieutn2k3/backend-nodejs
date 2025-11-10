// src/models/log.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ILog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string; // LOGIN, REGISTER, UPDATE_PROFILE, DELETE_ACCOUNT...
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const LogSchema = new Schema<ILog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
    },
    ip: String,
    userAgent: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    collection: 'log_systems',
  },
);

LogSchema.index({ createdAt: -1 });
LogSchema.index({ userId: 1, createdAt: -1 });

export const LogModel = mongoose.model<ILog>('log_system', LogSchema);
