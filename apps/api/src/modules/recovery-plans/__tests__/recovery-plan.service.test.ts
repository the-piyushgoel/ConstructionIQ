import { RecoveryPlanService } from '../recovery-plan.service';
import { RecoveryPlanRepository } from '../recovery-plan.repository';
import { AppError } from '../../../types';
import prisma from '../../../db/prisma';

jest.mock('../../../db/prisma', () => ({
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  riskEvent: {
    findUnique: jest.fn(),
  },
  recoveryPlan: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('RecoveryPlanService', () => {
  let service: RecoveryPlanService;
  let repository: RecoveryPlanRepository;

  beforeEach(() => {
    repository = new RecoveryPlanRepository();
    service = new RecoveryPlanService(repository);
    jest.clearAllMocks();
  });

  describe('getRecoveryPlan', () => {
    it('should throw 403 if user does not own project', async () => {
      const mockPlan = { id: 'plan-1', riskEventId: 'event-1' };
      const mockRiskEvent = { id: 'event-1', projectId: 'project-1' };
      const mockProject = { id: 'project-1', ownerId: 'user-2' };
      
      (prisma.recoveryPlan.findUnique as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.riskEvent.findUnique as jest.Mock).mockResolvedValue(mockRiskEvent);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      await expect(service.getRecoveryPlan('plan-1', 'user-1', 'PM')).rejects.toThrow(AppError);
    });
  });

  describe('Internal AI Methods', () => {
    it('should generate plan with ownership checks', async () => {
      const mockPlan = { id: 'plan-1', status: 'generated' };
      const mockRiskEvent = { id: 'risk-1', projectId: 'project-1' };
      const mockProject = { id: 'project-1', ownerId: 'user-1' };

      (prisma.recoveryPlan.create as jest.Mock).mockResolvedValue(mockPlan);
      (prisma.riskEvent.findUnique as jest.Mock).mockResolvedValue(mockRiskEvent);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const result = await service.generateRecoveryPlan('user-1', 'PM', {
        riskEventId: 'risk-1',
        rankedOptions: { options: [{ description: 'Option 1' }] },
        finalScoreBreakdown: { cost: 80 },
        recommendationConfidence: 0.9,
        reasoningConfidence: '0.85',
      });

      expect(result).toEqual(mockPlan);
      expect(prisma.project.findUnique).toHaveBeenCalled();
    });
  });
});
