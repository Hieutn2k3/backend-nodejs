import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@src/middleware/validate.middleware';
import { LoginZod, RefreshTokenZod } from './auth.zod';
import { authentication } from '@src/middleware/auth.middleware';

const router = Router();

// Login route
router.post('/auth/login', validate(LoginZod, 'body'), AuthController.Login);
// Logout route
router.post('/auth/logout', authentication, AuthController.Logout);
// refresh token  route
router.post('/auth/refresh-token', validate(RefreshTokenZod, 'body'), AuthController.RefreshToken);

export const AuthRoutes = router;
