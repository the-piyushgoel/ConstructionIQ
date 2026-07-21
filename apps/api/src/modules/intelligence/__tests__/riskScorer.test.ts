import { RiskScorer } from '../riskScorer';

describe('RiskScorer', () => {
  it('should score LOW for 0-29', () => {
    const scorer = new RiskScorer();
    expect(scorer.score(0)).toBe('LOW');
    expect(scorer.score(15)).toBe('LOW');
    expect(scorer.score(29)).toBe('LOW');
  });

  it('should score MEDIUM for 30-59', () => {
    const scorer = new RiskScorer();
    expect(scorer.score(30)).toBe('MEDIUM');
    expect(scorer.score(45)).toBe('MEDIUM');
    expect(scorer.score(59)).toBe('MEDIUM');
  });

  it('should score HIGH for 60-84', () => {
    const scorer = new RiskScorer();
    expect(scorer.score(60)).toBe('HIGH');
    expect(scorer.score(75)).toBe('HIGH');
    expect(scorer.score(84)).toBe('HIGH');
  });

  it('should score CRITICAL for 85-100', () => {
    const scorer = new RiskScorer();
    expect(scorer.score(85)).toBe('CRITICAL');
    expect(scorer.score(95)).toBe('CRITICAL');
    expect(scorer.score(100)).toBe('CRITICAL');
  });
});
