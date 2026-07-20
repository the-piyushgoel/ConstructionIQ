import { PredictionService } from '../prediction.service';
import { PredictionRepository } from '../prediction.repository';
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
  prediction: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('PredictionService', () => {
  let service: PredictionService;
  let repository: PredictionRepository;

  beforeEach(() => {
    repository = new PredictionRepository();
    service = new PredictionService(repository);
    jest.clearAllMocks();
  });

  describe('getPrediction', () => {
    it('should throw 403 if user does not own project', async () => {
      const mockPrediction = { id: 'pred-1', riskEventId: 'event-1' };
      const mockRiskEvent = { id: 'event-1', projectId: 'project-1' };
      const mockProject = { id: 'project-1', ownerId: 'user-2' };
      
      (prisma.prediction.findUnique as jest.Mock).mockResolvedValue(mockPrediction);
      (prisma.riskEvent.findUnique as jest.Mock).mockResolvedValue(mockRiskEvent);
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      await expect(service.getPrediction('pred-1', 'user-1', 'PM')).rejects.toThrow(AppError);
    });
  });

  describe('Internal AI Methods', () => {
    it('should allow system prediction creation without ownership checks', async () => {
      const mockPrediction = { id: 'pred-1' };
      (prisma.prediction.create as jest.Mock).mockResolvedValue(mockPrediction);

      const result = await service.createSystemPrediction({
        riskEventId: 'event-1',
        score: 85,
        horizonDays: 30,
      });

      expect(result).toEqual(mockPrediction);
      expect(prisma.project.findUnique).not.toHaveBeenCalled();
    });
  });
});
