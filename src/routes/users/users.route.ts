import { Router } from 'express';
import UserControlerler from './users.controller';
import { UserZod } from './users.zod';
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

/**Update user role user
 */

export const UserRoutes = router;
