import { RecoveryPlanRepository } from './recovery-plan.repository';
import { RecoveryPlanQuery, GenerateRecoveryPlanInput } from './recovery-plan.types';
import { AppError } from '../../types';
import { Prisma } from '@prisma/client';

export class RecoveryPlanService {
  constructor(private readonly repository: RecoveryPlanRepository) {}

  private async verifyProjectOwnership(projectId: string, userId: string, role: string) {
    if (role === 'ADMIN') return;

    const ownerId = await this.repository.findProjectOwner(projectId);

    if (!ownerId) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden: You do not have access to this project');
    }
  }

  private async getProjectIdForRiskEvent(riskEventId: string): Promise<string> {
    const projectId = await this.repository.findRiskEventProjectId(riskEventId);
    if (!projectId) throw new AppError(404, 'NOT_FOUND', 'RiskEvent not found');
    return projectId;
  }

  // ==========================================
  // Public HTTP Facing Methods
  // ==========================================

  async getRecoveryPlan(id: string, userId: string, role: string) {
    const plan = await this.repository.findById(id);
    if (!plan) {
      throw new AppError(404, 'NOT_FOUND', 'Recovery Plan not found');
    }

    const projectId = await this.getProjectIdForRiskEvent(plan.riskEventId);
    await this.verifyProjectOwnership(projectId, userId, role);

    return plan;
  }

  async getRecoveryPlans(userId: string, role: string, query: RecoveryPlanQuery) {
    const where: Prisma.RecoveryPlanWhereInput = {};

    if (query.projectId) {
      await this.verifyProjectOwnership(query.projectId, userId, role);
      where.riskEvent = { projectId: query.projectId };
    } else if (role !== 'ADMIN') {
      const projectIds = await this.repository.findProjectIdsByOwner(userId);
      where.riskEvent = { projectId: { in: projectIds } };
    }

    if (query.riskEventId) {
      where.riskEventId = query.riskEventId;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.RecoveryPlanOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.RecoveryPlanOrderByWithRelationInput] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
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

  // ==========================================
  // Internal AI & System Facing Methods
  // ==========================================

  async generateRecoveryPlan(userId: string, role: string, data: GenerateRecoveryPlanInput) {
    const projectId = await this.getProjectIdForRiskEvent(data.riskEventId);
    await this.verifyProjectOwnership(projectId, userId, role);

    const createData: Prisma.RecoveryPlanUncheckedCreateInput = {
      riskEventId: data.riskEventId,
      rankedOptions: data.rankedOptions as Prisma.InputJsonValue | undefined,
      finalScoreBreakdown: data.finalScoreBreakdown as Prisma.InputJsonValue | undefined,
      recommendationConfidence: data.recommendationConfidence,
      reasoningConfidence: data.reasoningConfidence,
      status: 'generated',
    };
    return this.repository.create(createData);
  }

  async archiveRecoveryPlan(id: string, userId: string, role: string) {
    const plan = await this.repository.findById(id);
    if (!plan) throw new AppError(404, 'NOT_FOUND', 'Recovery Plan not found');
    const projectId = await this.getProjectIdForRiskEvent(plan.riskEventId);
    await this.verifyProjectOwnership(projectId, userId, role);

    return this.repository.update(id, { status: 'archived' });
  }

  async approveRecoveryPlan(id: string, userId: string, role: string) {
    const plan = await this.repository.findById(id);
    if (!plan) throw new AppError(404, 'NOT_FOUND', 'Recovery Plan not found');
    const projectId = await this.getProjectIdForRiskEvent(plan.riskEventId);
    await this.verifyProjectOwnership(projectId, userId, role);

    return this.repository.update(id, { status: 'approved' });
  }
}
