import { RecoveryPlan, Prisma } from '@prisma/client';
import prisma from '../../db/prisma';

export class RecoveryPlanRepository {
  async create(data: Prisma.RecoveryPlanUncheckedCreateInput): Promise<RecoveryPlan> {
    return prisma.recoveryPlan.create({ data });
  }

  async findById(id: string): Promise<RecoveryPlan | null> {
    return prisma.recoveryPlan.findUnique({ where: { id } });
  }

  async findAll(args: Prisma.RecoveryPlanFindManyArgs): Promise<{ data: RecoveryPlan[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.recoveryPlan.findMany(args),
      prisma.recoveryPlan.count({ where: args.where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.RecoveryPlanUpdateInput): Promise<RecoveryPlan> {
    return prisma.recoveryPlan.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.recoveryPlan.delete({ where: { id } });
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
