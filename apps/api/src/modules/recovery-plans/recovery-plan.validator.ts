import { z } from 'zod';

export const recoveryPlanQuerySchema = z.object({
  query: z.object({
    riskEventId: z.string().uuid().optional(),
    projectId: z.string().uuid().optional(),
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    sortBy: z.enum(['createdAt', 'updatedAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
});
