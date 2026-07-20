import { DecisionRepository } from './decision.repository';
import { DecisionQuery, DecisionApproveInput, DecisionRejectInput } from './decision.types';
import { AppError } from '../../types';
import { Prisma } from '@prisma/client';

export class DecisionService {
  constructor(private readonly repository: DecisionRepository) {}

  private async verifyDecisionOwnership(decisionId: string, userId: string, role: string) {
    if (role === 'ADMIN') return;

    const decision = await this.repository.findById(decisionId);
    if (!decision) {
      throw new AppError(404, 'NOT_FOUND', 'Decision not found');
    }

    if (decision.pmUserId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden: You do not have access to this decision');
    }
  }

  // ==========================================
  // Public HTTP Facing Methods
  // ==========================================

  async getDecision(id: string, userId: string, role: string) {
    const decision = await this.repository.findById(id);
    if (!decision) {
      throw new AppError(404, 'NOT_FOUND', 'Decision not found');
    }
    await this.verifyDecisionOwnership(id, userId, role);
    return decision;
  }

  async getDecisions(userId: string, role: string, query: DecisionQuery) {
    const where: Prisma.DecisionWhereInput = {};

    if (role !== 'ADMIN') {
      where.pmUserId = userId;
    }
    
    if (query.pmUserId && role === 'ADMIN') {
      where.pmUserId = query.pmUserId;
    }

    if (query.planId) {
      where.planId = query.planId;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.DecisionOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.DecisionOrderByWithRelationInput] = query.sortOrder || 'desc';
    } else {
      orderBy.decidedAt = 'desc';
    }

    const { data, total } = await this.repository.findAll({
      where,
      skip,
      take: limit,
      orderBy,
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async approveDecision(id: string, userId: string, role: string, data: DecisionApproveInput) {
    const decision = await this.repository.findById(id);
    if (!decision) {
      throw new AppError(404, 'NOT_FOUND', 'Decision not found');
    }
    
    await this.verifyDecisionOwnership(id, userId, role);

    const updateData: Prisma.DecisionUpdateInput = {
      action: 'approved',
      modifiedWeights: {
        ...(decision.modifiedWeights as Record<string, unknown> || {}),
        ...data.modifiedWeights,
        ...(data.comments && { comments: data.comments }),
      },
      decidedAt: new Date(),
    };

    return this.repository.update(id, updateData);
  }

  async rejectDecision(id: string, userId: string, role: string, data: DecisionRejectInput) {
    const decision = await this.repository.findById(id);
    if (!decision) {
      throw new AppError(404, 'NOT_FOUND', 'Decision not found');
    }
    
    await this.verifyDecisionOwnership(id, userId, role);

    const updateData: Prisma.DecisionUpdateInput = {
      action: 'rejected',
      modifiedWeights: {
        ...(decision.modifiedWeights as Record<string, unknown> || {}),
        ...(data.comments && { comments: data.comments }),
      },
      decidedAt: new Date(),
    };

    return this.repository.update(id, updateData);
  }
}
