import { Request, Response } from 'express';
import { UsersModel } from '@src/routes/users/users.model';
import { BcryptService } from '@src/service/bcrypt.service';
import { LogModel } from '@src/log/log.model';
import { RequestType } from '@src/types/request.type';

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
        return res.status(400).json({ error: 'User already exists' });
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
        action: 'CREATE USER',
        ip: req.ip,
        metadata: newUser,
      });

      return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      return res.status(500).json({ error });
    }
  },
  UpdateUser: async (req: RequestType, res: Response) => {
    try {
      console.log('first');
    } catch (error) {}
  },
};
export default UserControlerler;
