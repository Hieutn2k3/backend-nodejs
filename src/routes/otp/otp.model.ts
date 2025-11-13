// models/Otp.ts – COPY NGUYÊN, DÙNG NGAY!
import mongoose, { Schema, Document } from 'mongoose';

export interface IOtp extends Document {
  otp: string;
  userId: mongoose.Types.ObjectId;
  expiresAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    otp: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 8,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 1000),
    },
  },
  {
    timestamps: true,
    collection: 'otps',
  },
);

// Index để query expiresAt nhanh (tùy chọn, nhưng nên có)
OtpSchema.index({ expiresAt: 1 });

export const OtpModel = mongoose.model<IOtp>('Otp', OtpSchema);
