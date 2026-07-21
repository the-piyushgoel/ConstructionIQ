import { AIValidationError } from '../../../errors/ai.errors';

export class JsonValidator {
  /**
   * Attempts to extract JSON from a markdown string if it's wrapped in blocks,
   * but does NOT repair malformed JSON.
   */
  static extractJsonString(content: string): string {
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/i;
    const match = content.match(jsonBlockRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    return content.trim();
  }

  static parse(content: string): unknown {
    const raw = this.extractJsonString(content);
    try {
      return JSON.parse(raw);
    } catch (error) {
      throw new AIValidationError('Failed to parse AI response as valid JSON', error);
    }
  }
}
