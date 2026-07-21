import { AIService } from '../../services/ai/aiService';
import { RiskPrompt } from '../../services/ai/prompts/riskPrompt';
import { PredictionRepository } from '../predictions/prediction.repository';
import { IntelligenceContext } from './intelligence.types';
import { ConfidenceEngine } from './confidenceEngine';
import { z } from 'zod';
import { Prediction, Prisma } from '@prisma/client';

export class PredictionEngine {
  constructor(
    private readonly aiService: AIService,
    private readonly predictionRepository: PredictionRepository,
    private readonly confidenceEngine: ConfidenceEngine
  ) {}

  async executePrediction(
    riskEventId: string,
    context: IntelligenceContext,
    requestId: string
  ): Promise<Prediction> {
    const prompt = new RiskPrompt();
    
    const messages = prompt.buildMessages({
      projectDetails: context.projectDetails,
      identifiedRisks: context.identifiedRisks
    });

    const predictionSchema = z.object({
      predictedRisks: z.array(z.object({
        type: z.string(),
        probability: z.number(),
        severity: z.number(),
        description: z.string()
      }))
    });

    const response = await this.aiService.executeRequest(
      { messages },
      predictionSchema,
      { requestId }
    );

    const highestRisk = response.predictedRisks.reduce((max, curr) => 
      (curr.probability * curr.severity) > (max.probability * max.severity) ? curr : max
    , response.predictedRisks[0] || { probability: 0, severity: 0 });

    const aiConfidence = Math.round((highestRisk.probability + highestRisk.severity) / 2) || 50;
    
    const calculatedScore = this.confidenceEngine.calculate(
      aiConfidence, 90, 85, 80 // dummy metrics for now
    );

    return this.predictionRepository.create({
      riskEventId,
      score: calculatedScore,
      horizonDays: 30,
      modelConfig: response as Prisma.InputJsonValue
    });
  }
}

