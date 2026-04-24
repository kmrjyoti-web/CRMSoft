import { DocumentActivityService } from '../services/document-activity.service';

describe('DocumentActivityService', () => {
  let service: DocumentActivityService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      documentActivity: {
        create: jest.fn().mockResolvedValue({
          id: 'act1', documentId: 'd1', action: 'UPLOADED', userId: 'u1',
        }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'act1', action: 'UPLOADED', user: { id: 'u1', firstName: 'Test', lastName: 'User' } },
          { id: 'act2', action: 'VIEWED', user: { id: 'u1', firstName: 'Test', lastName: 'User' } },
        ]),
        count: jest.fn().mockResolvedValue(2),
      },
    };
    (prisma as any).working = prisma;
    service = new DocumentActivityService(prisma);
  });

  it('should log a document activity', async () => {
    const result = await service.log({
      documentId: 'd1', action: 'UPLOADED', userId: 'u1',
      details: { fileName: 'test.pdf' },
    });
    expect(result.action).toBe('UPLOADED');
    expect(prisma.documentActivity.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: 'UPLOADED', documentId: 'd1' }),
      }),
    );
  });

  it('should return paginated document activity', async () => {
    const result = await service.getDocumentActivity('d1');
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
  });

  it('should return paginated user activity', async () => {
    const result = await service.getUserActivity('u1');
    expect(result.data).toHaveLength(2);
  });

  describe('error cases', () => {
    it('should propagate DB error from documentActivity.create', async () => {
      prisma.documentActivity.create.mockRejectedValue(new Error('Insert failed'));
      await expect(service.log({ documentId: 'd1', action: 'UPLOADED', userId: 'u1', details: {} }))
        .rejects.toThrow('Insert failed');
    });

    it('should return empty data for document with no activity', async () => {
      prisma.documentActivity.findMany.mockResolvedValue([]);
      prisma.documentActivity.count.mockResolvedValue(0);
      const result = await service.getDocumentActivity('unknown-doc');
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should propagate DB error from documentActivity.findMany', async () => {
      prisma.documentActivity.findMany.mockRejectedValue(new Error('DB connection lost'));
      await expect(service.getUserActivity('u1')).rejects.toThrow('DB connection lost');
    });
  });
});
