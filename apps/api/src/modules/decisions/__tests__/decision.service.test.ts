import { DecisionService } from '../decision.service';
import { DecisionRepository } from '../decision.repository';
import { AppError } from '../../../types';
import prisma from '../../../db/prisma';

jest.mock('../../../db/prisma', () => ({
  decision: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
}));

describe('DecisionService', () => {
  let service: DecisionService;
  let repository: DecisionRepository;

  beforeEach(() => {
    repository = new DecisionRepository();
    service = new DecisionService(repository);
    jest.clearAllMocks();
  });

  describe('approveDecision', () => {
    it('should throw 403 if PM does not own decision', async () => {
      const mockDecision = { id: 'dec-1', pmUserId: 'user-2' };
      (prisma.decision.findUnique as jest.Mock).mockResolvedValue(mockDecision);

      await expect(service.approveDecision('dec-1', 'user-1', 'PM', {})).rejects.toThrow(AppError);
    });

    it('should update decision to approved if ownership matches', async () => {
      const mockDecision = { id: 'dec-1', pmUserId: 'user-1' };
      (prisma.decision.findUnique as jest.Mock).mockResolvedValue(mockDecision);
      (prisma.decision.update as jest.Mock).mockResolvedValue({ ...mockDecision, action: 'approved' });

      const result = await service.approveDecision('dec-1', 'user-1', 'PM', { comments: 'Looks good' });
      
      expect(result.action).toBe('approved');
      expect(prisma.decision.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ action: 'approved' }) })
      );
    });
  });
});
