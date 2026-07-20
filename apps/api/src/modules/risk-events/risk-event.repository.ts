import { RiskEvent, Prisma } from '@prisma/client';
import prisma from '../../db/prisma';

export class RiskEventRepository {
  async create(data: Prisma.RiskEventUncheckedCreateInput): Promise<RiskEvent> {
    return prisma.riskEvent.create({ data });
  }

  async findById(id: string): Promise<RiskEvent | null> {
    return prisma.riskEvent.findUnique({ where: { id } });
  }

  async findAll(args: Prisma.RiskEventFindManyArgs): Promise<{ data: RiskEvent[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.riskEvent.findMany(args),
      prisma.riskEvent.count({ where: args.where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.RiskEventUpdateInput): Promise<RiskEvent> {
    return prisma.riskEvent.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.riskEvent.delete({ where: { id } });
  }

  async findProjectOwner(projectId: string): Promise<string | null> {
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } });
    return project?.ownerId || null;
  }

  async findProjectIdsByOwner(userId: string): Promise<string[]> {
    const projects = await prisma.project.findMany({ where: { ownerId: userId }, select: { id: true } });
    return projects.map(p => p.id);
  }
}
