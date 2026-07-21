import { ConfidenceEngine } from '../confidenceEngine';

describe('ConfidenceEngine', () => {
  it('should calculate overall confidence based on weights', () => {
    const engine = new ConfidenceEngine();

    // AI Confidence (0.4) * 90 = 36
    // Data Completeness (0.3) * 80 = 24
    // Signal Quality (0.2) * 70 = 14
    // Historical Consistency (0.1) * 60 = 6
    // Total = 80
    const score = engine.calculate(90, 80, 70, 60);

    expect(score).toBe(80);
  });

  it('should clamp scores between 0 and 100', () => {
    const engine = new ConfidenceEngine();

    expect(engine.calculate(-10, -20, 0, 0)).toBe(0);
    expect(engine.calculate(150, 150, 150, 150)).toBe(100);
  });
});
