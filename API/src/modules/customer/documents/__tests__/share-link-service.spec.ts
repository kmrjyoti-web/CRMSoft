import { ShareLinkService } from '../services/share-link.service';

describe('ShareLinkService', () => {
  let service: ShareLinkService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      document: {
        findUnique: jest.fn().mockResolvedValue({ id: 'd1', isActive: true }),
      },
      documentShareLink: {
        create: jest.fn().mockResolvedValue({
          id: 'sl1', documentId: 'd1', token: 'abc123', access: 'VIEW',
          isActive: true, viewCount: 0,
          document: { id: 'd1', originalName: 'test.pdf' },
          createdBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
        }),
        findUnique: jest.fn().mockResolvedValue({
          id: 'sl1', token: 'abc123', isActive: true, password: null,
          expiresAt: null, maxViews: null, viewCount: 0, createdById: 'u1',
          access: 'VIEW',
          document: {
            id: 'd1', originalName: 'test.pdf',
            uploadedBy: { id: 'u1', firstName: 'Test', lastName: 'User' },
          },
        }),
        update: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    };
    service = new ShareLinkService(prisma);
  });

  it('should create a share link', async () => {
    const result = await service.createLink({ documentId: 'd1', createdById: 'u1' });
    expect(result.token).toBeTruthy();
    expect(result.access).toBe('VIEW');
  });

  it('should access a valid share link', async () => {
    const result = await service.accessLink('abc123');
    expect(result.document.id).toBe('d1');
    expect(result.access).toBe('VIEW');
    expect(prisma.documentShareLink.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { viewCount: { increment: 1 } } }),
    );
  });

  it('should reject expired share link', async () => {
    prisma.documentShareLink.findUnique.mockResolvedValue({
      id: 'sl1', isActive: true, expiresAt: new Date('2020-01-01'),
      password: null, maxViews: null, viewCount: 0,
      document: { id: 'd1' },
    });
    await expect(service.accessLink('expired')).rejects.toThrow('expired');
  });

  it('should reject wrong password', async () => {
    prisma.documentShareLink.findUnique.mockResolvedValue({
      id: 'sl1', isActive: true, expiresAt: null, password: 'secret',
      maxViews: null, viewCount: 0,
      document: { id: 'd1' },
    });
    await expect(service.accessLink('token', 'wrong')).rejects.toThrow('Invalid password');
  });

  it('should revoke own share link', async () => {
    await service.revokeLink('sl1', 'u1');
    expect(prisma.documentShareLink.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isActive: false } }),
    );
  });

  it('should reject revoking another user share link', async () => {
    await expect(service.revokeLink('sl1', 'u2')).rejects.toThrow('only revoke your own');
  });
});
