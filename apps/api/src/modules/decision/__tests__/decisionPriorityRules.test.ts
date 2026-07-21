import { DecisionPriorityRules } from '../decisionPriorityRules';

describe('DecisionPriorityRules', () => {
  let rules: DecisionPriorityRules;

  beforeEach(() => {
    rules = new DecisionPriorityRules();
  });

  it('should return IMMEDIATE for CRITICAL severity and high consensus', () => {
    expect(rules.calculatePriority('CRITICAL', 90)).toBe('IMMEDIATE');
  });

  it('should return HIGH for CRITICAL severity and low consensus', () => {
    expect(rules.calculatePriority('CRITICAL', 50)).toBe('HIGH');
  });

  it('should return HIGH for HIGH severity and high consensus', () => {
    expect(rules.calculatePriority('HIGH', 80)).toBe('HIGH');
  });

  it('should return MEDIUM for MEDIUM severity', () => {
    expect(rules.calculatePriority('MEDIUM', 60)).toBe('MEDIUM');
  });
});
