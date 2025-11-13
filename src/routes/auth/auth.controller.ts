import { Request, Response } from 'express';
import { UsersModel } from '@src/routes/users/users.model';
import { BcryptService } from '@src/service/bcrypt.service';
import { JwtService } from '@src/service/jsonwebtoken.service';
import { RequestType } from '@src/types/request.type';
import { StatusCode } from '@src/enums/status-code.enum';
import OTPService from '@src/service/otp.service';
import { OtpModel } from '@src/routes/otp/otp.model';

export const AuthController = {
  Login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      // 1.kiểm tra user đã tồn tại chưa
      const existingUser = await UsersModel.findOne({ email });
      if (!existingUser) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Incorrect account information ' });
      }
      // 1.1 Kiểm tra xem user có được active không
      if (!existingUser.isActive) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Account is inactive. Please contact support.' });
      }
      // 2.so sánh password
      const isPasswordValid = await BcryptService.comparePassword(password, existingUser.password);
      if (!isPasswordValid) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Incorrect  password' });
      }
      //  3.tạo otp và lưu vào DB
      const otpCode = OTPService.generateOTP();
      await OtpModel.deleteOne({ userId: existingUser._id });
      await OtpModel.create({
        otp: otpCode,
        userId: existingUser._id,
      });
      // Gửi email (giả lập)
      console.log(`OTP cho ${email}: ${otpCode} (hết hạn sau 60s)`);

      res.status(StatusCode.OK).json({
        message: 'Verify account',
      });
    } catch (error) {
      console.log(error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error });
    }
  },
  Logout: async (req: RequestType, res: Response) => {
    const user = req.user;
    console.log(user);
    if (!user || !user.id) {
      return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized !' });
    }
    try {
      await UsersModel.updateOne({ _id: user.id }, { $set: { refreshToken: '' } });
      return res.status(StatusCode.OK).json({ message: 'Logout successful' });
    } catch (error) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error });
    }
  },
  RefreshToken: async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    try {
      const decoded = JwtService.verifyRefreshToken(refreshToken);
      const existingUser = await UsersModel.findOne({ _id: decoded.id, refreshToken });
      if (!existingUser) {
        return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Refresh token has expired. Please log in again.' });
      }
      const NEW_ACCESS_TOKEN = JwtService.signToken({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      });
      const NEW_REFRESH_TOKEN = JwtService.signRefreshToken({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      });

      await UsersModel.updateOne({ _id: existingUser._id }, { $set: { refreshToken: NEW_REFRESH_TOKEN } });
      return res.status(StatusCode.OK).json({
        message: 'Token refreshed successfully.',
        data: {
          accessToken: NEW_ACCESS_TOKEN,
          refreshToken: NEW_REFRESH_TOKEN,
        },
      });
    } catch (error) {
      return res.status(StatusCode.UNAUTHORIZED).json({ message: 'Unauthorized !' });
    }
  },
};
