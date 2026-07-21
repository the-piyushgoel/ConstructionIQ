import { AIService } from '../../services/ai/aiService';
import { RiskPrompt } from '../../services/ai/prompts/riskPrompt';
import { PredictionRepository } from '../predictions/prediction.repository';
import { IntelligenceContext } from './intelligence.types';
import { z } from 'zod';
import { Prediction, Prisma } from '@prisma/client';

export class PredictionEngine {
  constructor(
    private readonly aiService: AIService,
    private readonly predictionRepository: PredictionRepository
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

    // The schema built in Phase 2B for RiskPrediction
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

    // Calculate a naive overall score based on the highest probability * severity from AI
    const highestRisk = response.predictedRisks.reduce((max, curr) => 
      (curr.probability * curr.severity) > (max.probability * max.severity) ? curr : max
    , response.predictedRisks[0] || { probability: 0, severity: 0 });

    const calculatedScore = Math.round(highestRisk.probability * highestRisk.severity) || 50;

    // Store Prediction using the existing repository
    return this.predictionRepository.create({
      riskEventId,
      score: calculatedScore,
      horizonDays: 30, // Default horizon
      modelConfig: response as Prisma.InputJsonValue // Store raw AI response as model config
    });
  }
}
