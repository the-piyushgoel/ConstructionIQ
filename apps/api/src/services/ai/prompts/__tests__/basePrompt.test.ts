import { RiskPrompt } from '../riskPrompt';

describe('PromptBuilder', () => {
  it('should build prompt template accurately without business logic', () => {
    const prompt = new RiskPrompt();
    const result = prompt.build({ projectDetails: { name: 'P1' }, identifiedRisks: [] });
    
    expect(result.system).toBe('You are an AI assistant specialized in construction risk analysis.');
    expect(result.context.projectDetails).toEqual({ name: 'P1' });
    expect(result.expectedSchema).toBeDefined();
  });

  it('should build messages array accurately', () => {
    const prompt = new RiskPrompt();
    const messages = prompt.buildMessages({ projectDetails: { name: 'P1' }, identifiedRisks: [] });
    
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toContain('Context: {"projectDetails":{"name":"P1"},"identifiedRisks":[]}');
  });
});
