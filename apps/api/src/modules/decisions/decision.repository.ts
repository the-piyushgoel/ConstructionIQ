import { Decision, Prisma } from '@prisma/client';
import prisma from '../../db/prisma';

export class DecisionRepository {
  async create(data: Prisma.DecisionUncheckedCreateInput): Promise<Decision> {
    return prisma.decision.create({ data });
  }

  async findById(id: string): Promise<Decision | null> {
    return prisma.decision.findUnique({ where: { id } });
  }

  async findAll(args: Prisma.DecisionFindManyArgs): Promise<{ data: Decision[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.decision.findMany(args),
      prisma.decision.count({ where: args.where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.DecisionUpdateInput): Promise<Decision> {
    return prisma.decision.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.decision.delete({ where: { id } });
  }
}
