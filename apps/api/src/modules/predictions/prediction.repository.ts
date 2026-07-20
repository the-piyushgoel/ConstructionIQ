import { Prediction, Prisma } from '@prisma/client';
import prisma from '../../db/prisma';

export class PredictionRepository {
  async create(data: Prisma.PredictionUncheckedCreateInput): Promise<Prediction> {
    return prisma.prediction.create({ data });
  }

  async findById(id: string): Promise<Prediction | null> {
    return prisma.prediction.findUnique({ where: { id } });
  }

  async findAll(args: Prisma.PredictionFindManyArgs): Promise<{ data: Prediction[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.prediction.findMany(args),
      prisma.prediction.count({ where: args.where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.PredictionUpdateInput): Promise<Prediction> {
    return prisma.prediction.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.prediction.delete({ where: { id } });
  }

  async findProjectOwner(projectId: string): Promise<string | null> {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
    return project?.ownerId || null;
  }

  async findProjectIdsByOwner(userId: string): Promise<string[]> {
    const projects = await prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } });
    return projects.map(p => p.id);
  }

  async findRiskEventProjectId(riskEventId: string): Promise<string | null> {
    const riskEvent = await prisma.riskEvent.findUnique({ where: { id: riskEventId }, select: { projectId: true } });
    return riskEvent?.projectId || null;
  }
}
