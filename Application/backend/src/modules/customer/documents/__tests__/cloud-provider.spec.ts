import { CloudProviderService } from '../services/cloud-provider.service';

describe('CloudProviderService', () => {
  let service: CloudProviderService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      cloudConnection: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'cc1', accessToken: 'token', status: 'CONNECTED',
        }),
        create: jest.fn().mockResolvedValue({
          id: 'cc1', provider: 'GOOGLE_DRIVE', userId: 'u1', status: 'CONNECTED',
          accountEmail: 'test@gmail.com',
        }),
        update: jest.fn().mockResolvedValue({
          id: 'cc1', provider: 'GOOGLE_DRIVE', userId: 'u1', status: 'CONNECTED',
          accountEmail: 'test@gmail.com',
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
        findMany: jest.fn().mockResolvedValue([
          { id: 'cc1', provider: 'GOOGLE_DRIVE', accountEmail: 'test@gmail.com', status: 'CONNECTED' },
        ]),
      },
    };
(prisma as any).working = prisma;
    service = new CloudProviderService(prisma);
  });

  it('should connect a cloud provider', async () => {
    const result = await service.connectProvider('u1', 'GOOGLE_DRIVE' as any, 'token', 'refresh');
    expect(result.provider).toBe('GOOGLE_DRIVE');
    expect(result.status).toBe('CONNECTED');
  });

  it('should disconnect a cloud provider', async () => {
    await service.disconnectProvider('u1', 'GOOGLE_DRIVE' as any);
    expect(prisma.cloudConnection.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'REVOKED', isActive: false }),
      }),
    );
  });

  it('should list user connections', async () => {
    const result = await service.getConnections('u1');
    expect(result).toHaveLength(1);
    expect(result[0].provider).toBe('GOOGLE_DRIVE');
  });

  it('should get file metadata from Google Drive', async () => {
    const result = await service.getFileMetadata('u1', 'GOOGLE_DRIVE' as any, 'file123');
    expect(result.fileId).toBe('file123');
    expect(result.webViewUrl).toContain('drive.google.com');
  });
});
