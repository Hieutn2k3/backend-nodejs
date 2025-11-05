import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

export const validate =
  (schema: ZodTypeAny, type: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req[type] ?? {}; // đảm bảo không undefined
      schema.parse(data);
      next();
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        const groupedErrors: Record<string, string[]> = {};
        error.issues.forEach((err) => {
          const field = err.path.join('.') || 'root';
          if (!groupedErrors[field]) groupedErrors[field] = [];
          groupedErrors[field].push(err.message);
        });
        return res.status(400).json({
          message: 'Validation error',
          errors: groupedErrors,
        });
      }

      return res.status(500).json({
        message: 'Internal server error',
        error,
      });
    }
  };
