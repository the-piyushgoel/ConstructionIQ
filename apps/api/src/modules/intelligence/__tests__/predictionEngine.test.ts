import { PredictionEngine } from '../predictionEngine';
import { AIService } from '../../../services/ai/aiService';
import { PredictionRepository } from '../../predictions/prediction.repository';
import { AIValidationError } from '../../../errors/ai.errors';
import { Prediction } from '@prisma/client';

jest.mock('../../../services/ai/aiService');
jest.mock('../../predictions/prediction.repository');

describe('PredictionEngine', () => {
  let aiService: jest.Mocked<AIService>;
  let repository: jest.Mocked<PredictionRepository>;
  let engine: PredictionEngine;

  beforeEach(() => {
    aiService = new AIService() as jest.Mocked<AIService>;
    repository = new PredictionRepository() as jest.Mocked<PredictionRepository>;
    engine = new PredictionEngine(aiService, repository);
  });

  it('should execute prediction and store it successfully', async () => {
    const mockContext = {
      projectDetails: {},
      identifiedRisks: [],
      historicalPredictions: [],
      publicSignals: []
    };

    aiService.executeRequest.mockResolvedValueOnce({
      predictedRisks: [
        { type: 'Delay', probability: 0.8, severity: 90, description: 'High risk' },
        { type: 'Cost', probability: 0.5, severity: 50, description: 'Med risk' }
      ]
    });

    const mockStoredPrediction = { id: 'pred-1', score: 72 } as Prediction;
    repository.create.mockResolvedValueOnce(mockStoredPrediction);

    const result = await engine.executePrediction('risk-1', mockContext, 'req-1');

    expect(result).toEqual(mockStoredPrediction);
    expect(aiService.executeRequest).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({
      riskEventId: 'risk-1',
      score: 72, // Math.round(0.8 * 90) = 72
      horizonDays: 30,
      modelConfig: expect.any(Object)
    });
  });

  it('should throw AIValidationError when AI output is invalid', async () => {
    const mockContext = {
      projectDetails: {},
      identifiedRisks: [],
      historicalPredictions: [],
      publicSignals: []
    };

    aiService.executeRequest.mockRejectedValueOnce(new AIValidationError('Invalid schema'));

    await expect(engine.executePrediction('risk-1', mockContext, 'req-1')).rejects.toThrow(AIValidationError);
    expect(aiService.executeRequest).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
