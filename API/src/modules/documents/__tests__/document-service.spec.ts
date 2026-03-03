import { DocumentService } from '../services/document.service';

describe('DocumentService', () => {
  let service: DocumentService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      document: {
        create: jest.fn().mockResolvedValue({
          id: 'd1', fileName: 'test.pdf', originalName: 'test.pdf',
          mimeType: 'application/pdf', fileSize: 1024, storageType: 'LOCAL',
          category: 'GENERAL', version: 1, isActive: true,
          uploadedBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
          folder: null,
        }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'd1', fileName: 'test.pdf', originalName: 'test.pdf',
          mimeType: 'application/pdf', isActive: true, parentVersionId: null,
          storageProvider: 'NONE', category: 'GENERAL', description: null,
          tags: [], folderId: null, version: 1,
          uploadedBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
          folder: null, attachments: [], shareLinks: [],
          _count: { childVersions: 0, activityLogs: 0 },
        }),
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue({ version: 1 }),
        count: jest.fn().mockResolvedValue(10),
        update: jest.fn().mockResolvedValue({ id: 'd1' }),
        aggregate: jest.fn().mockResolvedValue({ _sum: { fileSize: 5242880 } }),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      documentFolder: {
        findUnique: jest.fn().mockResolvedValue({ id: 'f1', isActive: true }),
      },
    };
    service = new DocumentService(prisma);
  });

  it('should create a document', async () => {
    const result = await service.createDocument({
      fileName: 'test.pdf', originalName: 'test.pdf',
      mimeType: 'application/pdf', fileSize: 1024,
      storageType: 'LOCAL' as any, uploadedById: 'u1',
    });
    expect(result.id).toBe('d1');
    expect(prisma.document.create).toHaveBeenCalled();
  });

  it('should get document by id', async () => {
    const result = await service.getById('d1');
    expect(result.id).toBe('d1');
    expect(prisma.document.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'd1', isActive: true } }),
    );
  });

  it('should throw NotFoundException for missing document', async () => {
    prisma.document.findUnique.mockResolvedValue(null);
    await expect(service.getById('missing')).rejects.toThrow('Document not found');
  });

  it('should soft delete a document', async () => {
    await service.softDelete('d1');
    expect(prisma.document.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'd1' },
        data: expect.objectContaining({ isActive: false, status: 'DELETED' }),
      }),
    );
  });

  it('should categorize by mime type', () => {
    expect(service.categorizeByMimeType('image/jpeg')).toBe('IMAGE');
    expect(service.categorizeByMimeType('video/mp4')).toBe('VIDEO');
    expect(service.categorizeByMimeType('audio/mpeg')).toBe('AUDIO');
    expect(service.categorizeByMimeType('application/vnd.ms-excel')).toBe('SPREADSHEET');
    expect(service.categorizeByMimeType('application/vnd.ms-powerpoint')).toBe('PRESENTATION');
  });

  it('should get document stats', async () => {
    const result = await service.getStats();
    expect(result.totalDocuments).toBe(10);
    expect(result.totalSizeBytes).toBe(5242880);
    expect(result.totalSizeMB).toBe(5);
  });
});
