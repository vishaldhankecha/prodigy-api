import { ZodSchema } from 'zod';
import { ValidationError } from '../../../application/errors/AppError';

export const parseOrThrow = <T>(schema: ZodSchema<T>, payload: unknown): T => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join(', '));
  }

  return result.data;
};
