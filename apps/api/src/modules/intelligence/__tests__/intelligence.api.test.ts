import request from 'supertest';
import app from '../../../app';
import { sign } from 'jsonwebtoken';
import { env } from '../../../config/env';
import { IntelligenceService } from '../intelligence.service';

jest.mock('../intelligence.service');

const generateToken = (userId: string, role: string) => {
  return sign({ id: userId, role }, env.JWT_SECRET, { expiresIn: '1h' });
};

describe('Intelligence API', () => {
  let adminToken: string;

  beforeAll(() => {
    adminToken = generateToken('admin-id', 'ADMIN');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/v1/intelligence/full', () => {
    it('should successfully execute the full pipeline and return a RecoveryPackage', async () => {
      const mockRecoveryPackage = {
        decisionPackage: {},
        simulationResults: [],
        recoveryPlans: [],
        recommendedRecoveryPlan: { id: 'plan-1' },
        humanApprovalRequired: true,
        metadata: {}
      };
      
      jest.spyOn(IntelligenceService.prototype, 'runFull').mockResolvedValue(mockRecoveryPackage as never);

      const response = await request(app)
        .post('/api/v1/intelligence/full')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          riskEventId: '123e4567-e89b-12d3-a456-426614174001'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.humanApprovalRequired).toBe(true);
      expect(IntelligenceService.prototype.runFull).toHaveBeenCalled();
    });

    it('should return standardized validation error for invalid body', async () => {
      const response = await request(app)
        .post('/api/v1/intelligence/full')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          projectId: 'not-a-uuid',
          riskEventId: 'not-a-uuid'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/intelligence/prediction', () => {
    it('should run prediction only and return prediction context', async () => {
      jest.spyOn(IntelligenceService.prototype, 'runPredictionOnly').mockResolvedValue({
        prediction: { id: 'pred-1' },
        attribution: { confidence: 90 },
        context: {}
      } as never);

      const response = await request(app)
        .post('/api/v1/intelligence/prediction')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          riskEventId: '123e4567-e89b-12d3-a456-426614174001'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.prediction).toBeDefined();
    });
  });

  describe('POST /api/v1/intelligence/decision', () => {
    it('should run decision orchestrator using provided context', async () => {
      jest.spyOn(IntelligenceService.prototype, 'runDecisionOnly').mockResolvedValue({
        agentResponses: [],
        consensus: {}
      } as never);

      const response = await request(app)
        .post('/api/v1/intelligence/decision')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          projectId: '123e4567-e89b-12d3-a456-426614174000',
          prediction: {
            id: '123e4567-e89b-12d3-a456-426614174001',
            predictedScore: 85,
            horizonDays: 14
          },
          attribution: {
            rootCauses: ['delay'],
            evidence: ['schedule slip'],
            confidence: 90
          },
          intelligenceContext: {
            projectDetails: {},
            identifiedRisks: [],
            historicalPredictions: [],
            publicSignals: []
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.consensus).toBeDefined();
    });
  });
});
