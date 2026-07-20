import { Response, NextFunction } from 'express';
import { DecisionService } from './decision.service';
import { AuthenticatedRequest, ApiResponse } from '../../types';

export class DecisionController {
  constructor(private readonly service: DecisionService) {}

  getOne = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getDecision(req.params.id, req.user!.id, req.user!.role);
      
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
        planId: req.query.planId as string,
        pmUserId: req.query.pmUserId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      
      const { data, meta } = await this.service.getDecisions(req.user!.id, req.user!.role, query);
      
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

  approve = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.approveDecision(req.params.id, req.user!.id, req.user!.role, req.body);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };

  reject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.rejectDecision(req.params.id, req.user!.id, req.user!.role, req.body);
      
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
      };
      res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  };
}
