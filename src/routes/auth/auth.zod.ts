import { z } from 'zod';

export const LoginZod = z.object({
  email: z.string('Email is required').email('Email is required and must be valid'),
  password: z.string('Password is required').min(6, 'Password is required and must be at least 6 characters'),
});

export const RefreshTokenZod = z.object({
  refreshToken: z.string('Refresh token is required'),
});

export type LoginInput = z.infer<typeof LoginZod>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenZod>;
