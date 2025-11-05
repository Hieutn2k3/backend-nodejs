import { z } from 'zod';

export const UserZod = z.object({
  name: z.string('Name is required').min(2, 'Name is required and must be at least 2 characters'),
  email: z.string('Email is required').email('Email is required and must be valid'),
  password: z.string('Password is required').min(6, 'Password is required and must be at least 6 characters'),
  role: z
    .enum(['user', 'admin'], {
      message: 'Role must be either user or admin',
    })
    .optional(),
  avatar: z.string().optional(),
  refreshToken: z.string().optional(),
  createdAt: z.date().optional(),
});

export type UserInput = z.infer<typeof UserZod>;
