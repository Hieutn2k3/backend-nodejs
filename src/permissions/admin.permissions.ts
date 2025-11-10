// src/permissions/admin.permission.ts   (hoặc .js nếu không dùng TS)

import { ROLE } from '@src/enums/role.enum';
import { RequestType } from '@src/types/request.type';
import { NextFunction, Response } from 'express';

export const adminPermission = (req: RequestType, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    // 1. Kiểm tra user có tồn tại không
    if (!user) {
      return res.status(401).json({
        message: 'Unauthorized: Bạn cần đăng nhập!',
      });
    }

    // 2. Kiểm tra role chính xác là "admin"
    if (user.role !== ROLE.ADMIN) {
      return res.status(403).json({
        message: 'Chỉ admin có quyền này!',
        requiredRole: ROLE.ADMIN,
        yourRole: user.role,
      });
    }

    next();
  } catch (error) {
    console.error('Lỗi trong adminPermission:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};
