export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}
