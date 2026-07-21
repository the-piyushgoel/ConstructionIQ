import { ResponseParser } from '../responseParser';
import { z } from 'zod';
import { AIValidationError } from '../../../../errors/ai.errors';

describe('ResponseParser', () => {
  const schema = z.object({
    key: z.string(),
  });

  it('should parse and validate correctly', () => {
    const input = '{"key": "value"}';
    expect(ResponseParser.parseAndValidate(input, schema)).toEqual({ key: 'value' });
  });

  it('should throw AIValidationError on schema mismatch', () => {
    const input = '{"key": 123}';
    expect(() => ResponseParser.parseAndValidate(input, schema)).toThrow(AIValidationError);
  });
});
