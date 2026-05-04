import { FlushService } from '../services/flush.service';

function makeMockPrisma() {
  const obj: any = {
    syncFlushCommand: {
      create: jest.fn().mockResolvedValue({ id: 'flush-1', flushType: 'FULL', status: 'PENDING' }),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
    },
    syncDevice: {
      updateMany: jest.fn(),
      findFirst: jest.fn().mockResolvedValue({
        id: 'device-db-1',
        entitySyncState: { Lead: { lastPulledAt: '2025-01-01' } },
        storageUsedMb: 100,
        recordCounts: { Lead: 500 },
      }),
      update: jest.fn(),
    },
    syncAuditLog: {
      create: jest.fn(),
    },
  };
  obj.working = obj;
  return obj;
}

describe('FlushService', () => {
  it('issueFlush creates a PENDING command and updates devices', async () => {
    const prisma = makeMockPrisma();
    const service = new FlushService(prisma);

    const result = await service.issueFlush({
      flushType: 'FULL',
      targetUserId: 'user-1',
      reason: 'Data corruption detected',
      issuedById: 'admin-1',
      issuedByName: 'System Admin',
    });

    expect(result.status).toBe('PENDING');
    expect(prisma.syncFlushCommand.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flushType: 'FULL',
          status: 'PENDING',
          reason: 'Data corruption detected',
        }),
      }),
    );
    expect(prisma.syncDevice.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1' }),
        data: expect.objectContaining({ status: 'FLUSH_PENDING' }),
      }),
    );
  });

  it('acknowledgeFlush marks command ACKNOWLEDGED and resets device', async () => {
    const prisma = makeMockPrisma();
    prisma.syncFlushCommand.findUnique.mockResolvedValue({
      id: 'flush-1',
      status: 'PENDING',
      targetUserId: 'user-1',
      flushType: 'FULL',
    });

    const service = new FlushService(prisma);
    await service.acknowledgeFlush('flush-1', 'dev-1');

    expect(prisma.syncFlushCommand.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACKNOWLEDGED' }),
      }),
    );
    expect(prisma.syncDevice.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ACTIVE', pendingFlushId: null }),
      }),
    );
  });

  it('issueFlush targets user+entity for ENTITY flush type', async () => {
    const prisma = makeMockPrisma();
    prisma.syncFlushCommand.create.mockResolvedValue({
      id: 'flush-2',
      flushType: 'ENTITY',
      targetEntity: 'Lead',
      status: 'PENDING',
    });

    const service = new FlushService(prisma);
    const result = await service.issueFlush({
      flushType: 'ENTITY',
      targetUserId: 'user-1',
      targetEntity: 'Lead',
      reason: 'Stale lead data',
      issuedById: 'admin-1',
      issuedByName: 'Admin User',
    });

    expect(result.flushType).toBe('ENTITY');
    expect(prisma.syncFlushCommand.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          flushType: 'ENTITY',
          targetEntity: 'Lead',
        }),
      }),
    );
  });
});
