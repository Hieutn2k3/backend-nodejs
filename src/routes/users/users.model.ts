import mongoose, { Schema } from 'mongoose';
import paginate from 'mongoose-paginate-v2';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar: string;
  isActive: boolean;
  refreshToken: string;
  createdAt: Date;
}

const UsersSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    refreshToken: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

UsersSchema.plugin(paginate);

export const UsersModel = mongoose.model<IUser, mongoose.PaginateModel<IUser>>('Users', UsersSchema);
