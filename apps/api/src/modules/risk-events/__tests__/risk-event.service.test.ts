import { RiskEventService } from '../risk-event.service';
import { RiskEventRepository } from '../risk-event.repository';
import { AppError } from '../../../types';
import prisma from '../../../db/prisma';

jest.mock('../../../db/prisma', () => ({
  project: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  riskEvent: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('RiskEventService', () => {
  let service: RiskEventService;
  let repository: RiskEventRepository;

  beforeEach(() => {
    repository = new RiskEventRepository();
    service = new RiskEventService(repository);
    jest.clearAllMocks();
  });

  describe('createRiskEvent', () => {
    it('should create a risk event if user owns project', async () => {
      const mockProject = { id: 'project-1', ownerId: 'user-1' };
      const mockRiskEvent = { id: 'event-1', projectId: 'project-1', sourceSignalIds: ['sig-1'] };
      
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (prisma.riskEvent.create as jest.Mock).mockResolvedValue(mockRiskEvent);

      const result = await service.createRiskEvent('user-1', 'PM', {
        projectId: 'project-1',
        sourceSignalIds: ['sig-1'],
      });

      expect(result).toEqual(mockRiskEvent);
      expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'project-1' }, select: { ownerId: true } });
    });

    it('should throw 403 if user does not own project', async () => {
      const mockProject = { id: 'project-1', ownerId: 'user-2' };
      
      (prisma.project.findUnique as jest.Mock).mockResolvedValue(mockProject);

      await expect(service.createRiskEvent('user-1', 'PM', {
        projectId: 'project-1',
        sourceSignalIds: ['sig-1'],
      })).rejects.toThrow(AppError);
    });
  });
});
