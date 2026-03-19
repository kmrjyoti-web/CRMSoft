import { PushService } from '../services/push.service';

const mockDelegate = {
  create: jest.fn(),
  findUnique: jest.fn(),
  update: jest.fn(),
};

const mockEntityResolver = {
  getDelegate: jest.fn().mockReturnValue(mockDelegate),
  getEntityConfig: jest.fn().mockReturnValue({
    softDeleteField: 'isActive',
    terminalStatuses: [],
  }),
};

const mockConflictResolver = {
  resolve: jest.fn(),
};

const mockPrisma = {
  syncPolicy: {
    findFirst: jest.fn(),
  },
  syncChangeLog: {
    create: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
  syncDevice: {
    findFirst: jest.fn().mockResolvedValue({ id: 'device-db-1' }),
    update: jest.fn(),
  },
  syncAuditLog: {
    create: jest.fn(),
  },
} as any;

function createService() {
  return new PushService(mockPrisma, mockEntityResolver as any, mockConflictResolver as any);
}

describe('PushService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('CREATE inserts a new record', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Contact',
      direction: 'BIDIRECTIONAL',
      conflictStrategy: 'LATEST_WINS',
      isEnabled: true,
    });

    mockDelegate.create.mockResolvedValue({ id: 'new-contact-1' });

    const service = createService();
    const result = await service.push({
      userId: 'user-1',
      deviceId: 'dev-1',
      changes: [
        {
          entityName: 'Contact',
          action: 'CREATE',
          data: { firstName: 'John', lastName: 'Doe' },
          clientTimestamp: new Date().toISOString(),
          clientVersion: 1,
        },
      ],
    });

    expect(result.successful).toBe(1);
    expect(result.results[0].status).toBe('CREATED');
    expect(result.results[0].serverId).toBe('new-contact-1');
    expect(mockDelegate.create).toHaveBeenCalled();
  });

  it('UPDATE applies changes when no conflict', async () => {
    const clientTimestamp = new Date('2025-01-10T00:00:00Z');
    const serverUpdatedAt = new Date('2025-01-05T00:00:00Z'); // server is older

    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Lead',
      direction: 'BIDIRECTIONAL',
      conflictStrategy: 'LATEST_WINS',
      isEnabled: true,
    });

    mockDelegate.findUnique.mockResolvedValue({
      id: 'lead-1',
      status: 'NEW',
      updatedAt: serverUpdatedAt,
    });
    mockDelegate.update.mockResolvedValue({ id: 'lead-1' });

    const service = createService();
    const result = await service.push({
      userId: 'user-1',
      deviceId: 'dev-1',
      changes: [
        {
          entityName: 'Lead',
          entityId: 'lead-1',
          action: 'UPDATE',
          data: { status: 'CONTACTED', notes: 'Called' },
          clientTimestamp: clientTimestamp.toISOString(),
          clientVersion: 2,
        },
      ],
    });

    expect(result.successful).toBe(1);
    expect(result.results[0].status).toBe('SUCCESS');
  });

  it('DELETE soft-deletes via isActive=false', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Contact',
      direction: 'BIDIRECTIONAL',
      conflictStrategy: 'SERVER_WINS',
      isEnabled: true,
    });

    mockDelegate.findUnique.mockResolvedValue({ id: 'contact-1', isActive: true });
    mockDelegate.update.mockResolvedValue({ id: 'contact-1' });
    mockEntityResolver.getEntityConfig.mockReturnValue({
      softDeleteField: 'isActive',
      terminalStatuses: [],
    });

    const service = createService();
    const result = await service.push({
      userId: 'user-1',
      deviceId: 'dev-1',
      changes: [
        {
          entityName: 'Contact',
          entityId: 'contact-1',
          action: 'DELETE',
          data: {},
          clientTimestamp: new Date().toISOString(),
          clientVersion: 1,
        },
      ],
    });

    expect(result.results[0].status).toBe('DELETED');
    expect(mockDelegate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { isActive: false },
      }),
    );
  });

  it('rejects DOWNLOAD_ONLY direction', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Quotation',
      direction: 'DOWNLOAD_ONLY',
      isEnabled: true,
    });

    const service = createService();
    const result = await service.push({
      userId: 'user-1',
      deviceId: 'dev-1',
      changes: [
        {
          entityName: 'Quotation',
          entityId: 'q-1',
          action: 'UPDATE',
          data: { amount: 5000 },
          clientTimestamp: new Date().toISOString(),
          clientVersion: 1,
        },
      ],
    });

    expect(result.failed).toBe(1);
    expect(result.results[0].status).toBe('REJECTED');
  });

  it('detects conflicts when server record is newer', async () => {
    const clientTimestamp = new Date('2025-01-05T00:00:00Z');
    const serverUpdatedAt = new Date('2025-01-10T00:00:00Z'); // server is newer

    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Lead',
      direction: 'BIDIRECTIONAL',
      conflictStrategy: 'SERVER_WINS',
      isEnabled: true,
    });

    mockDelegate.findUnique.mockResolvedValue({
      id: 'lead-1',
      status: 'CONTACTED',
      updatedAt: serverUpdatedAt,
    });

    mockConflictResolver.resolve.mockResolvedValue({
      resolved: true,
      strategy: 'SERVER_WINS',
      conflictId: 'conflict-1',
      conflictingFields: [],
      autoMergedFields: [],
    });

    const service = createService();
    const result = await service.push({
      userId: 'user-1',
      deviceId: 'dev-1',
      changes: [
        {
          entityName: 'Lead',
          entityId: 'lead-1',
          action: 'UPDATE',
          data: { status: 'QUALIFIED' },
          clientTimestamp: clientTimestamp.toISOString(),
          clientVersion: 2,
        },
      ],
    });

    expect(result.conflicts).toBe(1);
    expect(mockConflictResolver.resolve).toHaveBeenCalled();
  });

  it('batch processes multiple changes in order', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Activity',
      direction: 'BIDIRECTIONAL',
      conflictStrategy: 'CLIENT_WINS',
      isEnabled: true,
    });

    mockDelegate.create
      .mockResolvedValueOnce({ id: 'a1' })
      .mockResolvedValueOnce({ id: 'a2' });

    const service = createService();
    const result = await service.push({
      userId: 'user-1',
      deviceId: 'dev-1',
      changes: [
        {
          entityName: 'Activity',
          action: 'CREATE',
          data: { type: 'CALL', notes: 'First' },
          clientTimestamp: '2025-01-01T10:00:00Z',
          clientVersion: 1,
        },
        {
          entityName: 'Activity',
          action: 'CREATE',
          data: { type: 'VISIT', notes: 'Second' },
          clientTimestamp: '2025-01-01T11:00:00Z',
          clientVersion: 1,
        },
      ],
    });

    expect(result.totalProcessed).toBe(2);
    expect(result.successful).toBe(2);
  });
});
