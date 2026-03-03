import { FolderService } from '../services/folder.service';

describe('FolderService', () => {
  let service: FolderService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      documentFolder: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'f1', name: 'Projects', isActive: true,
          _count: { documents: 0, children: 0 },
        }),
        create: jest.fn().mockResolvedValue({
          id: 'f1', name: 'Projects', isActive: true,
          createdBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
          _count: { documents: 0, children: 0 },
        }),
        update: jest.fn().mockResolvedValue({
          id: 'f1', name: 'Updated', isActive: true,
          createdBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
          _count: { documents: 0, children: 0 },
        }),
        findMany: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue({ _max: { sortOrder: 0 } }),
      },
    };
    service = new FolderService(prisma);
  });

  it('should create a folder', async () => {
    const result = await service.create({ name: 'Projects', createdById: 'u1' });
    expect(result.name).toBe('Projects');
    expect(prisma.documentFolder.create).toHaveBeenCalled();
  });

  it('should update a folder', async () => {
    const result = await service.update('f1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should not delete folder with documents', async () => {
    prisma.documentFolder.findUnique.mockResolvedValue({
      id: 'f1', isActive: true, _count: { documents: 3, children: 0 },
    });
    await expect(service.softDelete('f1')).rejects.toThrow('contains documents');
  });

  it('should delete empty folder', async () => {
    await service.softDelete('f1');
    expect(prisma.documentFolder.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });
});
