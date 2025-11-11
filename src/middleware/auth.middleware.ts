import { StatusCode } from '@src/enums/status-code.enum';
import { JwtService } from '@src/service/jsonwebtoken.service';
import { NextFunction, Request, Response } from 'express';
export const authentication = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  // Kiểm tra có header Authorization không
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = JwtService.verifyToken(token);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Invalid or expired token.' });
  }
};
