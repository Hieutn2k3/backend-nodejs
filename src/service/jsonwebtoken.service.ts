// src/services/jwt.service.ts
import { envConfig } from '@src/config/env';
import { JwtPayload } from '@src/types/jwt.type';
import jwt from 'jsonwebtoken';

export const JwtService = {
  signToken: (payload: object): string => {
    return jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: envConfig.TOKEN_EXPIRES_IN as '1h' | '7d' | '30d',
    });
  },

  verifyToken: (token: string): JwtPayload => {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },

  signRefreshToken: (payload: object): string => {
    return jwt.sign(payload, envConfig.JWT_SECRET, {
      expiresIn: envConfig.REFRESH_TOKEN_EXPIRES_IN as '1h' | '7d' | '30d',
    });
  },

  verifyRefreshToken: (token: string): JwtPayload => {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  },
};
