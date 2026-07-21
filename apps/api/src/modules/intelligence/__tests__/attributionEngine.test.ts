import { AttributionEngine } from '../attributionEngine';
import { AIService } from '../../../services/ai/aiService';
import { AIValidationError } from '../../../errors/ai.errors';

jest.mock('../../../services/ai/aiService');

describe('AttributionEngine', () => {
  let aiService: jest.Mocked<AIService>;
  let engine: AttributionEngine;

  beforeEach(() => {
    aiService = new AIService() as jest.Mocked<AIService>;
    engine = new AttributionEngine(aiService);
  });

  it('should return attribution output successfully', async () => {
    const mockContext = {
      projectDetails: {},
      identifiedRisks: [],
      historicalPredictions: [],
      publicSignals: []
    };

    aiService.executeRequest.mockResolvedValueOnce({
      rootCauses: ['Cause A'],
      evidence: ['Evidence A'],
      confidence: 85,
      recommendedNextAnalysis: ['Check budget']
    });

    const result = await engine.generateAttribution('pred-1', mockContext, 'req-1');

    expect(result.rootCauses).toEqual(['Cause A']);
    expect(result.evidence).toEqual(['Evidence A']);
    expect(result.confidence).toBe(85);
    expect(aiService.executeRequest).toHaveBeenCalledTimes(1);
  });

  it('should throw AIValidationError when AI output is invalid', async () => {
    const mockContext = {
      projectDetails: {},
      identifiedRisks: [],
      historicalPredictions: [],
      publicSignals: []
    };

    aiService.executeRequest.mockRejectedValueOnce(new AIValidationError('Invalid schema'));

    await expect(engine.generateAttribution('pred-1', mockContext, 'req-1')).rejects.toThrow(AIValidationError);
    expect(aiService.executeRequest).toHaveBeenCalledTimes(1);
  });
});
