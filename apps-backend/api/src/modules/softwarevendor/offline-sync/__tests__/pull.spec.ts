import { BadRequestException } from '@nestjs/common';
import { PullService } from '../services/pull.service';

const mockEntityResolver = {
  getEntityConfig: jest.fn(),
  getDelegate: jest.fn(),
};

const mockScopeResolver = {
  resolveScope: jest.fn().mockResolvedValue({}),
};

const makeDelegate = (records: any[] = [], count = 0) => ({
  findMany: jest.fn().mockResolvedValue(records),
  count: jest.fn().mockResolvedValue(count),
});

const mockPrisma = {
  syncPolicy: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
  },
  syncDevice: {
    findFirst: jest.fn().mockResolvedValue(null),
    update: jest.fn(),
  },
  syncAuditLog: {
    create: jest.fn(),
  },
} as any;
(mockPrisma as any).working = mockPrisma;

function createService() {
  return new PullService(mockPrisma, mockEntityResolver as any, mockScopeResolver as any);
}

describe('PullService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns delta records after lastPulledAt', async () => {
    const lastPulled = new Date('2025-01-01T00:00:00Z');
    const records = [
      { id: 'r1', name: 'Record 1', updatedAt: new Date('2025-01-02') },
      { id: 'r2', name: 'Record 2', updatedAt: new Date('2025-01-03') },
    ];

    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Contact',
      direction: 'BIDIRECTIONAL',
      downloadScope: 'OWNED',
      downloadFilter: null,
      maxRowsOffline: null,
      isEnabled: true,
    });

    const delegate = makeDelegate(records, 50);
    mockEntityResolver.getDelegate.mockReturnValue(delegate);
    mockEntityResolver.getEntityConfig.mockReturnValue({
      syncInclude: null,
      excludeFields: [],
      softDeleteField: 'isActive',
      terminalStatuses: [],
    });

    const service = createService();
    const result = await service.pull({
      entityName: 'Contact',
      userId: 'user-1',
      deviceId: 'dev-1',
      lastPulledAt: lastPulled,
    });

    expect(result.records).toHaveLength(2);
    expect(result.entityName).toBe('Contact');
    expect(result.totalAvailable).toBe(50);
    // Verify delta where clause included updatedAt
    const findManyCall = delegate.findMany.mock.calls[0][0];
    expect(findManyCall.where.updatedAt).toEqual({ gt: lastPulled });
  });

  it('returns all records on full sync (lastPulledAt = null)', async () => {
    const records = [
      { id: 'r1', name: 'Rec 1', updatedAt: new Date() },
    ];

    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Lead',
      direction: 'BIDIRECTIONAL',
      downloadScope: 'OWNED',
      downloadFilter: null,
      maxRowsOffline: null,
      isEnabled: true,
    });

    const delegate = makeDelegate(records, 1);
    mockEntityResolver.getDelegate.mockReturnValue(delegate);
    mockEntityResolver.getEntityConfig.mockReturnValue({
      syncInclude: { contact: true },
      excludeFields: [],
      softDeleteField: null,
      terminalStatuses: ['LOST'],
    });

    const service = createService();
    const result = await service.pull({
      entityName: 'Lead',
      userId: 'user-1',
      deviceId: 'dev-1',
      lastPulledAt: null,
    });

    expect(result.records).toHaveLength(1);
    expect(result.deletedIds).toHaveLength(0);
  });

  it('respects maxRowsOffline limit', async () => {
    const records = Array.from({ length: 4 }, (_, i) => ({
      id: `r${i}`, name: `Rec ${i}`, updatedAt: new Date(),
    }));

    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Activity',
      direction: 'BIDIRECTIONAL',
      downloadScope: 'OWNED',
      downloadFilter: null,
      maxRowsOffline: 3,
      isEnabled: true,
    });

    const delegate = makeDelegate(records, 100);
    mockEntityResolver.getDelegate.mockReturnValue(delegate);
    mockEntityResolver.getEntityConfig.mockReturnValue({
      syncInclude: null,
      excludeFields: [],
      softDeleteField: null,
      terminalStatuses: [],
    });

    const service = createService();
    const result = await service.pull({
      entityName: 'Activity',
      userId: 'user-1',
      deviceId: 'dev-1',
      lastPulledAt: null,
      limit: 500,
    });

    // take should be maxRowsOffline + 1 (to detect hasMore)
    const findManyCall = delegate.findMany.mock.calls[0][0];
    expect(findManyCall.take).toBe(4); // 3 + 1
  });

  it('allows DOWNLOAD_ONLY direction', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'LookupValue',
      direction: 'DOWNLOAD_ONLY',
      downloadScope: 'ALL',
      downloadFilter: null,
      maxRowsOffline: null,
      isEnabled: true,
    });

    const delegate = makeDelegate([{ id: 'lv1', value: 'test' }], 1);
    mockEntityResolver.getDelegate.mockReturnValue(delegate);
    mockEntityResolver.getEntityConfig.mockReturnValue({
      syncInclude: { lookup: true },
      excludeFields: [],
      softDeleteField: 'isActive',
      terminalStatuses: [],
    });

    const service = createService();
    const result = await service.pull({
      entityName: 'LookupValue',
      userId: 'user-1',
      deviceId: 'dev-1',
      lastPulledAt: null,
    });

    expect(result.records).toHaveLength(1);
  });

  it('rejects UPLOAD_ONLY direction', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Activity',
      direction: 'UPLOAD_ONLY',
      isEnabled: true,
    });

    const service = createService();
    await expect(
      service.pull({
        entityName: 'Activity',
        userId: 'user-1',
        deviceId: 'dev-1',
        lastPulledAt: null,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects DISABLED direction', async () => {
    mockPrisma.syncPolicy.findFirst.mockResolvedValue({
      entityName: 'Activity',
      direction: 'DISABLED',
      isEnabled: true,
    });

    const service = createService();
    await expect(
      service.pull({
        entityName: 'Activity',
        userId: 'user-1',
        deviceId: 'dev-1',
        lastPulledAt: null,
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
