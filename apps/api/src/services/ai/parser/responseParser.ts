import { ZodSchema } from 'zod';
import { JsonValidator } from './jsonValidator';
import { SchemaValidator } from './schemaValidator';

export class ResponseParser {
  static parseAndValidate<T>(rawContent: string, schema: ZodSchema<T>): T {
    const parsedData = JsonValidator.parse(rawContent);
    return SchemaValidator.validate(parsedData, schema);
  }
}
