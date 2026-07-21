import { Request, Response, NextFunction } from 'express';
import { IntelligenceService } from './intelligence.service';
import { RequestContext } from '../../utils/requestContext';

export class IntelligenceController {
  constructor(private readonly service: IntelligenceService) {}

  runFull = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, riskEventId } = req.body;
      const reqWithId = req as Request & { id?: string };
      const requestId = RequestContext.getRequestId() || reqWithId.id || 'unknown';

      const recoveryPackage = await this.service.runFull(projectId, riskEventId, requestId);

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

  runPrediction = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, riskEventId } = req.body;
      const reqWithId = req as Request & { id?: string };
      const requestId = RequestContext.getRequestId() || reqWithId.id || 'unknown';

      const result = await this.service.runPredictionOnly(projectId, riskEventId, requestId);

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

  runDecision = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { projectId, prediction, attribution, intelligenceContext } = req.body;
      const reqWithId = req as Request & { id?: string };
      const requestId = RequestContext.getRequestId() || reqWithId.id || 'unknown';

      const decisionPackage = await this.service.runDecisionOnly(
        projectId,
        requestId,
        prediction,
        attribution,
        intelligenceContext
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
