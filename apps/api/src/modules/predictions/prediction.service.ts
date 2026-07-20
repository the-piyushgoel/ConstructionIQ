import { PredictionRepository } from './prediction.repository';
import { PredictionQuery, CreateSystemPredictionInput, UpdateSystemPredictionInput } from './prediction.types';
import { AppError } from '../../types';
import { Prisma } from '@prisma/client';

export class PredictionService {
  constructor(private readonly repository: PredictionRepository) {}

  /**
   * Internal authorization check navigating up to Project
   */
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

  async getPrediction(id: string, userId: string, role: string) {
    const prediction = await this.repository.findById(id);
    if (!prediction) {
      throw new AppError(404, 'NOT_FOUND', 'Prediction not found');
    }

    const projectId = await this.getProjectIdForRiskEvent(prediction.riskEventId);
    await this.verifyProjectOwnership(projectId, userId, role);

    return prediction;
  }

  async getPredictions(userId: string, role: string, query: PredictionQuery) {
    const where: Prisma.PredictionWhereInput = {};

    if (query.projectId) {
      await this.verifyProjectOwnership(query.projectId, userId, role);
      // Filter predictions belonging to risk events of this project
      where.riskEvent = { projectId: query.projectId };
    } else if (role !== 'ADMIN') {
      const projectIds = await this.repository.findProjectIdsByOwner(userId);
      where.riskEvent = { projectId: { in: projectIds } };
    }

    if (query.riskEventId) {
      // If a specific riskEventId is provided, we must ensure it's within the authorized projects
      where.riskEventId = query.riskEventId;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const orderBy: Prisma.PredictionOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.PredictionOrderByWithRelationInput] = query.sortOrder || 'desc';
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

  async createSystemPrediction(data: CreateSystemPredictionInput) {
    const createData: Prisma.PredictionUncheckedCreateInput = {
      riskEventId: data.riskEventId,
      score: data.score,
      horizonDays: data.horizonDays,
      modelConfig: (data.modelConfig || { status: 'PENDING' }) as Prisma.InputJsonValue,
    };
    return this.repository.create(createData);
  }

  async updateSystemPrediction(id: string, data: UpdateSystemPredictionInput) {
    const updateData: Prisma.PredictionUpdateInput = {
      ...(data.score !== undefined && { score: data.score }),
      ...(data.horizonDays !== undefined && { horizonDays: data.horizonDays }),
      ...(data.modelConfig && { modelConfig: data.modelConfig as Prisma.InputJsonValue }),
    };
    return this.repository.update(id, updateData);
  }

  async markCompleted(id: string) {
    const prediction = await this.repository.findById(id);
    if (!prediction) throw new Error('Prediction not found');
    const modelConfig = (prediction.modelConfig as Prisma.InputJsonValue as Record<string, unknown>) || {};
    modelConfig.status = 'COMPLETED';
    return this.repository.update(id, { modelConfig: modelConfig as Prisma.InputJsonValue });
  }

  async markFailed(id: string, errorReason: string) {
    const prediction = await this.repository.findById(id);
    if (!prediction) throw new Error('Prediction not found');
    const modelConfig = (prediction.modelConfig as Prisma.InputJsonValue as Record<string, unknown>) || {};
    modelConfig.status = 'FAILED';
    modelConfig.error = errorReason;
    return this.repository.update(id, { modelConfig: modelConfig as Prisma.InputJsonValue });
  }

  async listByProject(projectId: string) {
    return this.repository.findAll({
      where: { riskEvent: { projectId } }
    });
  }
}
