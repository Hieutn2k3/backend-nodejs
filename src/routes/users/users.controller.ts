import { Request, Response } from 'express';
import { UsersModel } from '@src/routes/users/users.model';
import { BcryptService } from '@src/service/bcrypt.service';
import { LogModel } from '@src/log/log.model';
import { RequestType } from '@src/types/request.type';
import { ROLE } from '@src/enums/role.enum';
import { StatusCode } from '@src/enums/status-code.enum';
import { ChangePasswordZodType } from './users.zod';

const UserControlerler = {
  createUser: async (req: RequestType, res: Response) => {
    try {
      const user = req.user;
      const { name, email, password } = req.body;
      // kiểm tra user đã tồn tại chưa
      const existingUser = await UsersModel.find({
        email,
      });
      if (existingUser.length > 0) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'User already exists' });
      }
      // brypt password trước khi lưu vào database
      const passwordHash = await BcryptService.hashPassword(password);
      // tạo user  mới
      const newUser = await UsersModel.create({
        name,
        email,
        password: passwordHash,
        isActive: true,
      });

      // lưu log
      await LogModel.create({
        userId: user!.id,
        action: `CREATE USER ->${newUser.name}<-`,
        ip: req.ip,
        metadata: newUser,
      });

      return res.status(StatusCode.CREATED).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error });
    }
  },
  changeActiveUser: async (req: RequestType, res: Response) => {
    try {
      const { id } = req.params;
      const user = req.user;
      const { isActive } = req.body;
      const existingUser = await UsersModel.findById(id);
      if (!existingUser) {
        return res.status(StatusCode.BAD_REQUEST).json({ error: 'User not exists' });
      }
      const userUpdate = await UsersModel.findByIdAndUpdate(id, { $set: { isActive: isActive } }, { new: true }).lean();
      // lưu log
      await LogModel.create({
        userId: user!.id,
        action: isActive ? `ACTIVE USER ->${userUpdate?.name}<-` : `INACTIVE USER ->${userUpdate?.name}<-`,
        ip: req.ip,
        metadata: userUpdate,
      });
      return res.status(StatusCode.OK).json({
        data: {
          ...userUpdate,
        },
      });
    } catch (error) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error });
    }
  },
  getAllUser: async (req: RequestType, res: Response) => {
    try {
      const { page = 1, limit = 10, search = '', isActive, role = 'all', sort = '-createdAt' } = req.query;

      // Build query
      const query: any = {};

      if (search) {
        query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
      }
      // lọc theo active
      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }
      // lọc theo role
      if (role !== 'all') {
        query.role = role as [ROLE.ADMIN, ROLE.USER];
      }

      // DÙNG mongoose-paginate-v2 để lấy dữ liệu theo pagination!
      const result = await UsersModel.paginate(query, {
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        sort,
        select: '-password -__v -refreshToken -createdAt -updatedAt',
      });

      return res.status(StatusCode.OK).json({
        data: result.docs,
        pagination: {
          total: result.totalDocs,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage,
        },
        message: 'Lấy danh sách người dùng thành công',
      });
    } catch (error: any) {
      console.error('getAllUser error:', error);
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Lỗi server', details: error.message });
    }
  },
  getUser: async (req: RequestType, res: Response) => {
    try {
      const { id } = req.params;
      const user = await UsersModel.findById(id).select('-password -refreshToken -__v').lean();
      return res.status(StatusCode.OK).json({ data: user });
    } catch (error: any) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Lỗi server', details: error.message });
    }
  },
  getMe: async (req: RequestType, res: Response) => {
    try {
      const { user } = req;
      const result = await UsersModel.findById(user!.id).select('-password -refreshToken -__v').lean();
      return res.status(StatusCode.OK).json({ data: result });
    } catch (error: any) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Lỗi server', details: error.message });
    }
  },
  updateProfile: async (req: RequestType, res: Response) => {
    try {
      const { user } = req;
      const { name, password, avatar } = req.body;
      // 1.kiểm tra user đã tồn tại chưa
      const existingUser = await UsersModel.findById(user!.id);
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
      // 3.Nếu đúng password thì cho cập nhật name và avatar
      const result = await UsersModel.findByIdAndUpdate(
        user!.id,
        {
          $set: {
            name: name,
            avatar: avatar,
          },
        },
        { new: true },
      ).lean();
      // lưu log
      await LogModel.create({
        userId: user!.id,
        action: `Update USER ->${user!.id}<-`,
        ip: req.ip,
        metadata: result,
      });
      return res.status(StatusCode.OK).json({
        data: result,
      });
    } catch (error: any) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Lỗi server', details: error.message });
    }
  },
  changePassWord: async (req: RequestType, res: Response) => {
    try {
      const { user } = req;
      const { password, new_password } = req.body as ChangePasswordZodType;
      // 1.kiểm tra user đã tồn tại chưa
      const existingUser = await UsersModel.findById(user!.id);
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
      // 3.cập nhật password ở đây
      // hash password trước khi lưu
      const passwordHash = await BcryptService.hashPassword(new_password);
      const result = await UsersModel.findByIdAndUpdate(
        user!.id,
        {
          $set: {
            password: passwordHash,
          },
        },
        { new: true },
      ).lean();
      // lưu log
      await LogModel.create({
        userId: user!.id,
        action: `USER ->${user!.id}<- change password to ${new_password}`,
        ip: req.ip,
        metadata: result,
      });
      return res.status(StatusCode.OK).json({
        data: result,
      });
    } catch (error: any) {
      return res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: 'Lỗi server', details: error.message });
    }
  },
};
export default UserControlerler;
