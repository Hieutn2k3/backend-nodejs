import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      const groupedErrors: Record<string, string[]> = {};

      error.errors.forEach((err: any) => {
        const field = err.path.join('.');
        if (!groupedErrors[field]) {
          groupedErrors[field] = [];
        }
        groupedErrors[field].push(err.message);
      });

      return res.status(400).json({
        message: 'Validation error',
        errors: groupedErrors,
      });
    }
  };
