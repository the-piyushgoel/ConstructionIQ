import { ZodSchema, ZodError } from 'zod';
import { AIValidationError } from '../../../errors/ai.errors';

export class SchemaValidator {
  static validate<T>(data: unknown, schema: ZodSchema<T>): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AIValidationError('AI response failed schema validation', error);
      }
      throw error;
    }
  }
}
