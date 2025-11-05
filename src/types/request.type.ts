import { Request } from 'express';
export interface RequestType extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    idToken: string;
    iat: number;
    exp: number;
  };
}
