import { z } from 'zod';

export const createRiskEventSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
    sourceSignalIds: z.array(z.string()).min(1),
    predictedScore: z.number().min(0).max(100).optional(),
    horizonDays: z.number().int().min(1).optional(),
    attributionBreakdown: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const updateRiskEventSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    sourceSignalIds: z.array(z.string()).min(1).optional(),
    predictedScore: z.number().min(0).max(100).optional(),
    horizonDays: z.number().int().min(1).optional(),
    attributionBreakdown: z.record(z.string(), z.unknown()).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be updated",
  }),
});

export const riskEventQuerySchema = z.object({
  query: z.object({
    projectId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'identifiedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
