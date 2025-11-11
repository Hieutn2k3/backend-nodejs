import { Request, Response } from 'express';
import { UsersModel } from '@src/routes/users/users.model';
import { BcryptService } from '@src/service/bcrypt.service';
import { JwtService } from '@src/service/jsonwebtoken.service';
import { RequestType } from '@src/types/request.type';
import { v4 as uuidv4 } from 'uuid';
import { StatusCode } from '@src/enums/status-code.enum';

export const AuthController = {
  Login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      // 1.kiểm tra user đã tồn tại chưa
      const existingUser = await UsersModel.findOne({ email });
      if (!existingUser) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Incorrect account information ' });
      }
      if (!existingUser.isActive) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Account is inactive. Please contact support.' });
      }
      // 2.so sánh password
      const isPasswordValid = await BcryptService.comparePassword(password, existingUser.password);
      if (!isPasswordValid) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'Incorrect  password' });
      }
      // 3.tạo access token và refresh token
      const ACCESS_TOKEN = JwtService.signToken({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
        idToken: uuidv4(),
      });
      const REFRESH_TOKEN = JwtService.signRefreshToken({
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      });
      // 4.lưu refresh token vào database
      await UsersModel.updateOne({ _id: existingUser._id }, { $set: { refreshToken: REFRESH_TOKEN } });

      // 5.Trả về thông tin user + token
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
    } catch (error) {
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
