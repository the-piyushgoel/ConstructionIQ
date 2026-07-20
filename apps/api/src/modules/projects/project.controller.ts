import { Response, NextFunction } from 'express';
import { ProjectService } from './project.service';
import { AuthenticatedRequest, ApiResponse } from '../../types';

export class ProjectController {
  constructor(private readonly service: ProjectService) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.createProject(req.user!.id, req.body);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getProject(req.params.id, req.user!.id, req.user!.role);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      
      const query = {
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        status: req.query.status as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      
      const { data, meta } = await this.service.getProjects(req.user!.id, req.user!.role, query);
      
      const response: ApiResponse<typeof data> = {
        success: true,
        data,
        meta: {
          requestId: req.id || 'unknown',
          timestamp: new Date().toISOString(),
          ...meta
        },
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.updateProject(req.params.id, req.user!.id, req.user!.role, req.body);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await this.service.deleteProject(req.params.id, req.user!.id, req.user!.role);
      
      const response: ApiResponse<null> = {
        success: true,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };
}
