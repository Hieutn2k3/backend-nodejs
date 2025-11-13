import { StatusCode } from '@src/enums/status-code.enum';
import { OtpModel } from '@src/routes/otp/otp.model';
import { RequestType } from '@src/types/request.type';
import { Response } from 'express';
import { OtpAuditZodTypy } from './otp.zod';
import { JwtService } from '@src/service/jsonwebtoken.service';
import { UsersModel } from '../users/users.model';

const OtpController = {
  auditOTP: async (req: RequestType, res: Response) => {
    try {
      const { id } = req.params;
      const { otp } = req.body as OtpAuditZodTypy;
      const existingUser = await UsersModel.findById(id);
      //  1.Kiểm tra lấy user hiện tại phục vụ tạo token
      if (!existingUser) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Incorrect account information ' });
      }
      //   2. Lấy otp theo user login
      const OTPResult = await OtpModel.findOne({ userId: id }).select('expiresAt otp');
      //   3. Nếu không có otp nào theo user đó bắn lỗi
      if (!OTPResult) {
        return res.status(StatusCode.NOT_FOUND).json({
          message: "Don't have record",
        });
      }
      //   4. Check xem còn hạn 60s kể từ khi tạo không
      const now = new Date();
      if (OTPResult.expiresAt < now) {
        return res.status(StatusCode.BAD_REQUEST).json({
          message: 'OTP is expired!',
        });
      }
      //   5. Check otp có đúng k
      if (OTPResult.otp !== otp) {
        return res.status(StatusCode.BAD_REQUEST).json({
          message: 'OTP is wrong!',
        });
      }
      // 6.tạo access token và refresh token
      const ACCESS_TOKEN = JwtService.signToken({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      });
      const REFRESH_TOKEN = JwtService.signRefreshToken({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      });
      // 7.lưu refresh token vào db
      await UsersModel.updateOne({ _id: existingUser._id }, { $set: { refreshToken: REFRESH_TOKEN } });

      res.status(StatusCode.OK).json({
        message: 'Login successful',
        data: {
          userId: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          avatar: existingUser.avatar,
          accessToken: ACCESS_TOKEN,
          refreshToken: REFRESH_TOKEN,
        },
      });

      return res.json({
        OTPResult,
      });
    } catch (error) {}
  },
};

export default OtpController;
