import { Router } from 'express';
import UserControlerler from './users.controller';
import { ChangePasswordZod, DeleteUserZod, UpdateProfileZod, UserZod } from './users.zod';
import { validate } from '@src/middleware/validate.middleware';
import { authentication } from '@src/middleware/auth.middleware';
import { adminPermission } from '@src/permissions/admin.permissions';

const router = Router();

/**Create user role admin
 * 1. Check authentication
 * 2. Check quyền xem có phải là admin k
 * 3. Validate dữ liệu đầu vào xem có đủ k
 */
router.post('/users', authentication, adminPermission, validate(UserZod, 'body'), UserControlerler.createUser);

/**Update active user role admin
 * 1. Check authentication
 * 2. Check quyền xem có phải là admin k
 * 3. Validate dữ liệu đầu vào xem có đủ k
 */
router.put(
  '/users/:id',
  authentication,
  adminPermission,
  validate(DeleteUserZod, 'body'),
  UserControlerler.changeActiveUser,
);

/**Get all user role admin
 * 1. Check authentication
 * 2. Check quyền xem có phải là admin k
 * 3. Validate dữ liệu đầu vào xem có đủ k
 */
router.get('/users', authentication, adminPermission, UserControlerler.getAllUser);

/** get detail user check role as admin*/
router.get('/users/:id', authentication, adminPermission, UserControlerler.getUser);

/** get me*/
router.get('/get-me', authentication, UserControlerler.getMe);

/** update me*/
router.put('/user/update-profile', authentication, validate(UpdateProfileZod, 'body'), UserControlerler.updateProfile);

/** change password*/
router.put(
  '/user/change-password',
  authentication,
  validate(ChangePasswordZod, 'body'),
  UserControlerler.changePassWord,
);
export const UserRoutes = router;
