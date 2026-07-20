import { Response, NextFunction } from 'express';
import { PredictionService } from './prediction.service';
import { AuthenticatedRequest, ApiResponse } from '../../types';

export class PredictionController {
  constructor(private readonly service: PredictionService) {}

  getOne = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.getPrediction(req.params.id, req.user!.id, req.user!.role);
      
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
        riskEventId: req.query.riskEventId as string,
        projectId: req.query.projectId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc',
      };
      
      const { data, meta } = await this.service.getPredictions(req.user!.id, req.user!.role, query);
      
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
}
