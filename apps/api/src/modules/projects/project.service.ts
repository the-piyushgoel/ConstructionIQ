import { ProjectRepository } from './project.repository';
import { AppError } from '../../types';
import { Prisma } from '@prisma/client';
import { CreateProjectInput, UpdateProjectInput, ProjectQuery } from './project.types';

export class ProjectService {
  constructor(private readonly repo: ProjectRepository) {}

  async createProject(userId: string, data: CreateProjectInput) {
    return this.repo.create({
      ...data,
      ownerId: userId,
    });
  }

  async getProject(id: string, userId: string, role: string) {
    const project = await this.repo.findById(id);
    if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found');
    
    if (role !== 'ADMIN' && project.ownerId !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'Access denied');
    }
    return project;
  }

  async getProjects(userId: string, role: string, query: ProjectQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};
    if (role !== 'ADMIN') {
      where.ownerId = userId;
    }
    if (query.status) {
      where.status = query.status as import('@prisma/client').ProjectStatus;
    }

    let orderBy: Prisma.ProjectOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy) {
      orderBy = { [query.sortBy]: query.sortOrder || 'asc' };
    }

    const { data, total } = await this.repo.findAll({
      where,
      skip,
      take: limit,
      orderBy,
    });

    return { data, meta: { total, page, limit } };
  }

  async updateProject(id: string, userId: string, role: string, data: UpdateProjectInput) {
    const project = await this.getProject(id, userId, role);
    return this.repo.update(project.id, data as unknown as Prisma.ProjectUpdateInput);
  }

  async deleteProject(id: string, userId: string, role: string) {
    const project = await this.getProject(id, userId, role);
    await this.repo.delete(project.id);
  }
}
