import { RiskEventRepository } from './risk-event.repository';
import { CreateRiskEventInput, UpdateRiskEventInput, RiskEventQuery } from './risk-event.types';
import { AppError } from '../../types';
import prisma from '../../db/prisma';
import { Prisma } from '@prisma/client';

export class RiskEventService {
  constructor(private readonly repository: RiskEventRepository) {}

  private async verifyProjectOwnership(projectId: string, userId: string, role: string) {
    if (role === 'ADMIN') return;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      throw new AppError(404, 'NOT_FOUND', 'Project not found');
    }

    if (project.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden: You do not have access to this project');
    }
  }

  async createRiskEvent(userId: string, role: string, data: CreateRiskEventInput) {
    await this.verifyProjectOwnership(data.projectId, userId, role);

    const createData: Prisma.RiskEventUncheckedCreateInput = {
      projectId: data.projectId,
      sourceSignalIds: data.sourceSignalIds,
      predictedScore: data.predictedScore,
      horizonDays: data.horizonDays,
      attributionBreakdown: data.attributionBreakdown as Prisma.InputJsonValue | undefined,
    };

    return this.repository.create(createData);
  }

  async getRiskEvent(id: string, userId: string, role: string) {
    const riskEvent = await this.repository.findById(id);
    if (!riskEvent) {
      throw new AppError(404, 'NOT_FOUND', 'Risk Event not found');
    }

    await this.verifyProjectOwnership(riskEvent.projectId, userId, role);

    return riskEvent;
  }

  async getRiskEvents(userId: string, role: string, query: RiskEventQuery) {
    if (query.projectId) {
      await this.verifyProjectOwnership(query.projectId, userId, role);
    } else if (role !== 'ADMIN') {
      // If no project specified, restrict to user's projects
      const userProjects = await prisma.project.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      const projectIds = userProjects.map(p => p.id);
      
      if (projectIds.length === 0) {
        return { data: [], meta: { total: 0, page: 1, limit: query.limit || 10, totalPages: 0 } };
      }

      // We modify query conceptually here
      // But we construct args directly
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.RiskEventWhereInput = {};
    if (query.projectId) {
      where.projectId = query.projectId;
    } else if (role !== 'ADMIN') {
      const userProjects = await prisma.project.findMany({
        where: { ownerId: userId },
        select: { id: true },
      });
      where.projectId = { in: userProjects.map(p => p.id) };
    }

    const orderBy: Prisma.RiskEventOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy as keyof Prisma.RiskEventOrderByWithRelationInput] = query.sortOrder || 'desc';
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
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateRiskEvent(id: string, userId: string, role: string, data: UpdateRiskEventInput) {
    const riskEvent = await this.repository.findById(id);
    if (!riskEvent) {
      throw new AppError(404, 'NOT_FOUND', 'Risk Event not found');
    }

    await this.verifyProjectOwnership(riskEvent.projectId, userId, role);

    const updateData: Prisma.RiskEventUpdateInput = {
      ...(data.sourceSignalIds && { sourceSignalIds: data.sourceSignalIds }),
      ...(data.predictedScore !== undefined && { predictedScore: data.predictedScore }),
      ...(data.horizonDays !== undefined && { horizonDays: data.horizonDays }),
      ...(data.attributionBreakdown && { attributionBreakdown: data.attributionBreakdown as Prisma.InputJsonValue }),
    };

    return this.repository.update(id, updateData);
  }

  async deleteRiskEvent(id: string, userId: string, role: string) {
    const riskEvent = await this.repository.findById(id);
    if (!riskEvent) {
      throw new AppError(404, 'NOT_FOUND', 'Risk Event not found');
    }

    await this.verifyProjectOwnership(riskEvent.projectId, userId, role);

    await this.repository.delete(id);
  }
}
