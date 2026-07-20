import { z } from 'zod';

export const decisionQuerySchema = z.object({
  query: z.object({
    planId: z.string().uuid().optional(),
    pmUserId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt', 'decidedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});

export const decisionApproveSchema = z.object({
  body: z.object({
    comments: z.string().optional(),
    modifiedWeights: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const decisionRejectSchema = z.object({
  body: z.object({
    comments: z.string().optional(),
  }),
});
