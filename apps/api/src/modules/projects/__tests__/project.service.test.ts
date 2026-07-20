import { ProjectService } from '../project.service';
import { ProjectRepository } from '../project.repository';
import { AppError } from '../../../types';

jest.mock('../project.repository');

describe('ProjectService', () => {
  let service: ProjectService;
  let repoMock: jest.Mocked<ProjectRepository>;

  beforeEach(() => {
    repoMock = new ProjectRepository() as jest.Mocked<ProjectRepository>;
    service = new ProjectService(repoMock);
  });

  describe('createProject', () => {
    it('should create a project and attach ownerId', async () => {
      const input = {
        name: 'Test Project',
        startDate: '2023-01-01T00:00:00Z',
        endDate: '2023-12-31T00:00:00Z',
        budget: 1000,
      };

      repoMock.create.mockResolvedValue({ id: '1', ...input, ownerId: 'user1' } as unknown as import('@prisma/client').Project);

      const result = await service.createProject('user1', input);

      expect(repoMock.create).toHaveBeenCalledWith({
        ...input,
        ownerId: 'user1',
      });
      expect(result.ownerId).toBe('user1');
    });
  });

  describe('getProject', () => {
    it('should throw NOT_FOUND if project does not exist', async () => {
      repoMock.findById.mockResolvedValue(null);

      await expect(service.getProject('1', 'user1', 'PM')).rejects.toThrow(AppError);
    });

    it('should throw FORBIDDEN if user is not owner and not ADMIN', async () => {
      repoMock.findById.mockResolvedValue({ id: '1', ownerId: 'user2' } as unknown as import('@prisma/client').Project);

      await expect(service.getProject('1', 'user1', 'PM')).rejects.toThrow(AppError);
    });

    it('should return project if user is owner', async () => {
      repoMock.findById.mockResolvedValue({ id: '1', ownerId: 'user1' } as unknown as import('@prisma/client').Project);

      const result = await service.getProject('1', 'user1', 'PM');
      expect(result.id).toBe('1');
    });

    it('should return project if user is ADMIN', async () => {
      repoMock.findById.mockResolvedValue({ id: '1', ownerId: 'user2' } as unknown as import('@prisma/client').Project);

      const result = await service.getProject('1', 'user1', 'ADMIN');
      expect(result.id).toBe('1');
    });
  });
});
