import { AttachmentService } from '../services/attachment.service';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      document: {
        findUnique: jest.fn().mockResolvedValue({ id: 'd1', isActive: true }),
      },
      documentAttachment: {
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({
          id: 'a1', documentId: 'd1', entityType: 'LEAD', entityId: 'l1',
          document: { id: 'd1', originalName: 'test.pdf' },
          attachedBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
        }),
        delete: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(5),
      },
    };
(prisma as any).working = prisma;
    service = new AttachmentService(prisma);
  });

  it('should attach a document to an entity', async () => {
    const result = await service.attachDocument('d1', 'LEAD', 'l1', 'u1');
    expect(result.documentId).toBe('d1');
    expect(prisma.documentAttachment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ documentId: 'd1', entityType: 'LEAD', entityId: 'l1' }),
      }),
    );
  });

  it('should reject invalid entity types', async () => {
    await expect(service.attachDocument('d1', 'INVALID', 'e1', 'u1')).rejects.toThrow('Invalid entity type');
  });

  it('should reject duplicate attachments', async () => {
    prisma.documentAttachment.findFirst.mockResolvedValue({ id: 'existing' });
    await expect(service.attachDocument('d1', 'LEAD', 'l1', 'u1')).rejects.toThrow('already attached');
  });

  it('should detach a document', async () => {
    prisma.documentAttachment.findFirst.mockResolvedValue({ id: 'a1' });
    await service.detachDocument('d1', 'LEAD', 'l1');
    expect(prisma.documentAttachment.delete).toHaveBeenCalledWith({ where: { id: 'a1' } });
  });
});
