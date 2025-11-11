import { z } from 'zod';

export const UserZod = z.object({
  name: z.string('Name is required').min(2, 'Name is required and must be at least 2 characters'),
  email: z.string('Email is required').email('Email is required and must be valid'),
  password: z.string('Password is required').min(6, 'Password is required and must be at least 6 characters'),
  role: z.enum(['user', 'admin'], {
    message: 'Role must be either user or admin',
  }),
  avatar: z.string().optional(),
  refreshToken: z.string().optional(),
  createdAt: z.date().optional(),
});

export const DeleteUserZod = z.object({
  isActive: z.boolean('isActive is required '),
});

export const UpdateProfileZod = z.object({
  name: z.string('Name is required').min(2, 'Name is required and must be at least 2 characters'),
  avatar: z.string(),
  password: z.string('Password is required').min(6, 'Password is required and must be at least 6 characters'),
});

export const ChangePasswordZod = z.object({
  password: z.string('Password is required').min(6, 'Password is required and must be at least 6 characters'),
  new_password: z
    .string('new_password is required')
    .min(6, 'new_password is required and must be at least 6 characters'),
});

export type UserInput = z.infer<typeof UserZod>;
export type DeleteUserZodType = z.infer<typeof DeleteUserZod>;
export type ChangePasswordZodType = z.infer<typeof ChangePasswordZod>;
