import { Router } from 'express';
import OtpController from './otp.controller';
import { validate } from '@src/middleware/validate.middleware';
import { OtpAuditZod } from './otp.zod';

const router = Router();

router.post('/otp/:id', validate(OtpAuditZod, 'body'), OtpController.auditOTP);

export const OtpRouter = router;
