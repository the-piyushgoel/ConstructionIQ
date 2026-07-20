import { Project, Prisma } from '@prisma/client';
import prisma from '../../db/prisma';

export class ProjectRepository {
  async create(data: Prisma.ProjectUncheckedCreateInput): Promise<Project> {
    return prisma.project.create({ data });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({ where: { id } });
  }

  async findAll(args: Prisma.ProjectFindManyArgs): Promise<{ data: Project[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.project.findMany(args),
      prisma.project.count({ where: args.where }),
    ]);
    return { data, total };
  }

  async update(id: string, data: Prisma.ProjectUpdateInput): Promise<Project> {
    return prisma.project.update({ where: { id }, data });
  }

  async delete(id: string): Promise<void> {
    await prisma.project.delete({ where: { id } });
  }
}
