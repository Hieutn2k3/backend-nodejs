import { Request, Response } from 'express';
import { UsersModel } from '@src/routes/users/users.model';
import { BcryptService } from '@src/service/bcrypt.service';

const UserControlerler = {
  createUser: async (req: Request, res: Response) => {
    try {
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
      });
      return res.status(201).json({ message: 'User created successfully', user: newUser });
    } catch (error) {
      return res.status(500).json({ error });
    }
  },
};
export default UserControlerler;
