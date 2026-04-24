import { ConflictResolverService } from '../services/conflict-resolver.service';

const mockDelegate = {
  update: jest.fn(),
};

const mockEntityResolver = {
  getDelegate: jest.fn().mockReturnValue(mockDelegate),
};

const mockPrisma = {
  syncConflict: {
    create: jest.fn().mockResolvedValue({ id: 'conflict-1' }),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
} as any;
(mockPrisma as any).working = mockPrisma;

function createService() {
  return new ConflictResolverService(mockPrisma, mockEntityResolver as any);
}

const baseParams = {
  entityName: 'Lead',
  entityId: 'lead-1',
  clientData: { status: 'QUALIFIED', notes: 'Client note', priority: 'HIGH' },
  serverData: { status: 'CONTACTED', notes: 'Server note', priority: 'HIGH' },
  clientTimestamp: new Date('2025-01-10T00:00:00Z'),
  serverTimestamp: new Date('2025-01-11T00:00:00Z'),
  userId: 'user-1',
  deviceId: 'dev-1',
};

describe('ConflictResolverService', () => {
  beforeEach(() => jest.clearAllMocks());

  it('SERVER_WINS: resolves with server data, no DB write', async () => {
    const service = createService();
    const result = await service.resolve({
      ...baseParams,
      strategy: 'SERVER_WINS' as any,
    });

    expect(result.resolved).toBe(true);
    expect(result.strategy).toBe('SERVER_WINS');
    expect(result.finalData).toEqual(baseParams.serverData);
    expect(mockDelegate.update).not.toHaveBeenCalled();
  });

  it('CLIENT_WINS: resolves with client data and applies to DB', async () => {
    const service = createService();
    const result = await service.resolve({
      ...baseParams,
      strategy: 'CLIENT_WINS' as any,
    });

    expect(result.resolved).toBe(true);
    expect(result.strategy).toBe('CLIENT_WINS');
    expect(mockDelegate.update).toHaveBeenCalled();
  });

  it('LATEST_WINS: picks server when server timestamp is later', async () => {
    const service = createService();
    const result = await service.resolve({
      ...baseParams,
      clientTimestamp: new Date('2025-01-10T00:00:00Z'),
      serverTimestamp: new Date('2025-01-11T00:00:00Z'),
      strategy: 'LATEST_WINS' as any,
    });

    expect(result.resolved).toBe(true);
    expect(result.finalData).toEqual(baseParams.serverData);
    expect(mockDelegate.update).not.toHaveBeenCalled();
  });

  it('MERGE_FIELDS: auto-merges non-conflicting fields with base data', async () => {
    const service = createService();
    const result = await service.resolve({
      ...baseParams,
      baseData: { status: 'NEW', notes: 'Original note', priority: 'LOW' },
      clientData: { status: 'QUALIFIED', notes: 'Original note', priority: 'LOW' },
      serverData: { status: 'NEW', notes: 'Server changed', priority: 'LOW' },
      strategy: 'MERGE_FIELDS' as any,
    });

    // status changed by client only, notes changed by server only → no true conflicts
    expect(result.resolved).toBe(true);
    expect(result.conflictingFields).toHaveLength(0);
    expect(result.autoMergedFields.length).toBeGreaterThan(0);
    expect(mockDelegate.update).toHaveBeenCalled();
  });

  it('MERGE_FIELDS: detects true conflicts when both sides changed same field', async () => {
    const service = createService();
    const result = await service.resolve({
      ...baseParams,
      baseData: { status: 'NEW', notes: 'Original' },
      clientData: { status: 'QUALIFIED', notes: 'Client changed' },
      serverData: { status: 'CONTACTED', notes: 'Server changed' },
      strategy: 'MERGE_FIELDS' as any,
    });

    // Both status and notes changed by both sides → true conflicts
    expect(result.resolved).toBe(false);
    expect(result.conflictingFields.length).toBeGreaterThan(0);
    expect(mockDelegate.update).not.toHaveBeenCalled();
  });

  it('MANUAL: creates pending conflict without resolving', async () => {
    const service = createService();
    const result = await service.resolve({
      ...baseParams,
      strategy: 'MANUAL' as any,
    });

    expect(result.resolved).toBe(false);
    expect(result.conflictId).toBe('conflict-1');
    expect(mockDelegate.update).not.toHaveBeenCalled();
    expect(mockPrisma.syncConflict.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'PENDING',
        }),
      }),
    );
  });

  describe('edge cases', () => {
    it('LATEST_WINS: picks client when client timestamp is later', async () => {
      const service = createService();
      const result = await service.resolve({
        ...baseParams,
        clientTimestamp: new Date('2025-01-12T00:00:00Z'),
        serverTimestamp: new Date('2025-01-11T00:00:00Z'),
        strategy: 'LATEST_WINS' as any,
      });
      expect(result.resolved).toBe(true);
      expect(result.finalData).toEqual(baseParams.clientData);
      expect(mockDelegate.update).toHaveBeenCalled();
    });

    it('MERGE_FIELDS: treats missing baseData as empty object', async () => {
      const service = createService();
      const result = await service.resolve({
        ...baseParams,
        baseData: undefined,
        clientData: { status: 'QUALIFIED' },
        serverData: { status: 'CONTACTED' },
        strategy: 'MERGE_FIELDS' as any,
      });
      // Without baseData, cannot determine who changed what — should handle gracefully
      expect(result).toBeDefined();
      expect(result.strategy).toBe('MERGE_FIELDS');
    });

    it('should propagate DB error from syncConflict.create during MANUAL strategy', async () => {
      mockPrisma.syncConflict.create.mockRejectedValue(new Error('DB insert failed'));
      const service = createService();
      await expect(service.resolve({ ...baseParams, strategy: 'MANUAL' as any }))
        .rejects.toThrow('DB insert failed');
    });
  });
});
