import { Response, NextFunction } from 'express';
import { IntelligenceService } from './intelligence.service';
import { RequestContext } from '../../utils/requestContext';
import { AuthenticatedRequest, AppError } from '../../types';

export class IntelligenceController {
  constructor(private readonly service: IntelligenceService) {}

  runFull = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId, riskEventId } = req.body;
      const requestId = RequestContext.getRequestId() || req.id || 'unknown';

      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');

      const recoveryPackage = await this.service.runFull(
        projectId, riskEventId, requestId, req.user.id, req.user.role
      );

      res.status(200).json({
        success: true,
        requestId,
        data: recoveryPackage,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  runPrediction = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId, riskEventId } = req.body;
      const requestId = RequestContext.getRequestId() || req.id || 'unknown';

      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');

      const result = await this.service.runPredictionOnly(
        projectId, riskEventId, requestId, req.user.id, req.user.role
      );

      res.status(200).json({
        success: true,
        requestId,
        data: result,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };

  runDecision = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId, prediction, attribution, intelligenceContext } = req.body;
      const requestId = RequestContext.getRequestId() || req.id || 'unknown';

      if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'User not authenticated');

      const decisionPackage = await this.service.runDecisionOnly(
        projectId,
        requestId,
        prediction,
        attribution,
        intelligenceContext,
        req.user.id,
        req.user.role
      );

      res.status(200).json({
        success: true,
        requestId,
        data: decisionPackage,
        metadata: {
          generatedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
