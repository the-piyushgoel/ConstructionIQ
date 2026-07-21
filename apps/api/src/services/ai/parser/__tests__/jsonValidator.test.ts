import { JsonValidator } from '../jsonValidator';
import { AIValidationError } from '../../../../errors/ai.errors';

describe('JsonValidator', () => {
  it('should extract JSON from markdown blocks', () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(JsonValidator.parse(input)).toEqual({ key: 'value' });
  });

  it('should parse raw JSON string', () => {
    const input = '{"key": "value"}';
    expect(JsonValidator.parse(input)).toEqual({ key: 'value' });
  });

  it('should throw AIValidationError for malformed JSON, not repair it', () => {
    const input = '{"key": "value", }'; // Trailing comma makes it invalid
    expect(() => JsonValidator.parse(input)).toThrow(AIValidationError);
  });
});
