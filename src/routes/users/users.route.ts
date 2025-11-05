import { Router } from 'express';
import UserControlerler from './users.controller';
import { UserZod } from './users.zod';
import { validate } from '@src/middleware/validate.middleware';

const router = Router();

// create user admin
router.post('/users', validate(UserZod, 'body'), UserControlerler.createUser);

export const UserRoutes = router;
