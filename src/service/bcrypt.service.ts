import bcrypt from 'bcrypt';

export const BcryptService = {
  hashPassword: async (password: string) => {
    try {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      throw new Error('Hashing failed');
    }
  },
  comparePassword: async (password: string, hashedPassword: string) => {
    return await bcrypt.compare(password, hashedPassword);
  },
};
