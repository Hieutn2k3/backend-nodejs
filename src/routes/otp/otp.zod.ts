import { z } from 'zod';

export const OtpAuditZod = z.object({
  otp: z.string('Otp is required').length(8, 'otp must hae 8 character'),
});

export type OtpAuditZodTypy = z.infer<typeof OtpAuditZod>;
