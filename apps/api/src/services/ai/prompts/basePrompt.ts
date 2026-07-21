export interface PromptTemplate<TContext, TSchema> {
  system: string;
  context: TContext;
  instructions: string;
  expectedSchema: TSchema;
}

export abstract class BasePrompt<TContext, TSchema> {
  protected abstract getSystemPrompt(): string;
  protected abstract getInstructions(): string;
  protected abstract getExpectedSchema(): TSchema;

  build(context: TContext): PromptTemplate<TContext, TSchema> {
    return {
      system: this.getSystemPrompt(),
      context,
      instructions: this.getInstructions(),
      expectedSchema: this.getExpectedSchema(),
    };
  }

  buildMessages(context: TContext) {
    const template = this.build(context);
    return [
      { role: 'system' as const, content: template.system },
      { 
        role: 'user' as const, 
        content: `Context: ${JSON.stringify(template.context)}\n\nInstructions: ${template.instructions}\n\nPlease respond with a JSON object matching this schema structure: ${JSON.stringify(template.expectedSchema)}`
      }
    ];
  }
}
