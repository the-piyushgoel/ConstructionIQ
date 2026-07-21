import { z } from 'zod';

export const runFullSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid projectId'),
    riskEventId: z.string().uuid('Invalid riskEventId'),
  }),
});

export const runPredictionSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid projectId'),
    riskEventId: z.string().uuid('Invalid riskEventId'),
  }),
});

export const runDecisionSchema = z.object({
  body: z.object({
    projectId: z.string().uuid('Invalid projectId'),
    prediction: z.object({
      id: z.string().uuid(),
      predictedScore: z.number(),
      horizonDays: z.number().optional(),
    }).passthrough(),
    attribution: z.object({
      rootCauses: z.array(z.string()),
      evidence: z.array(z.string()),
      confidence: z.number(),
    }).passthrough(),
    intelligenceContext: z.object({
      projectDetails: z.record(z.string(), z.unknown()),
      identifiedRisks: z.array(z.unknown()),
      historicalPredictions: z.array(z.unknown()),
      publicSignals: z.array(z.object({
        source: z.string(),
        type: z.string(),
        value: z.unknown(),
        confidence: z.number(),
        timestamp: z.string(),
      })),
    }),
  }),
});
