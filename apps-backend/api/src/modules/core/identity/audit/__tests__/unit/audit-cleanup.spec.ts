import { AuditCleanupService } from '../../services/audit-cleanup.service';

describe('AuditCleanupService', () => {
  let prisma: any;
  let service: AuditCleanupService;

  beforeEach(() => {
    prisma = {
      auditRetentionPolicy: {
        findMany: jest.fn().mockResolvedValue([
          { entityType: 'LEAD', retentionDays: 365, isActive: true },
          { entityType: 'ACTIVITY', retentionDays: 180, isActive: true },
        ]),
      },
      auditLog: {
        deleteMany: jest.fn().mockResolvedValue({ count: 10 }),
        count: jest.fn().mockResolvedValue(100),
      },
      auditFieldChange: {
        deleteMany: jest.fn().mockResolvedValue({ count: 50 }),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    service = new AuditCleanupService(prisma);
  });

  it('should delete logs older than retention policy', async () => {
    const result = await service.cleanupOldLogs();
    expect(result.totalDeleted).toBeGreaterThanOrEqual(0);
    expect(prisma.auditLog.deleteMany).toHaveBeenCalled();
    expect(prisma.auditFieldChange.deleteMany).toHaveBeenCalled();
  });

  it('should respect per-entity retention days', async () => {
    await service.cleanupOldLogs();
    // Called once for LEAD, once for ACTIVITY, once for default
    expect(prisma.auditLog.deleteMany).toHaveBeenCalledTimes(3);
    expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ entityType: 'LEAD' }),
      }),
    );
    expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ entityType: 'ACTIVITY' }),
      }),
    );
  });

  it('should apply default 730 days for entities without policy', async () => {
    await service.cleanupOldLogs();
    // The third call should be for entities NOT in the policy list
    expect(prisma.auditLog.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entityType: { notIn: ['LEAD', 'ACTIVITY'] },
        }),
      }),
    );
  });

  it('should return correct counts in cleanup preview', async () => {
    prisma.auditLog.count
      .mockResolvedValueOnce(500)   // total for LEAD
      .mockResolvedValueOnce(50)    // would delete for LEAD
      .mockResolvedValueOnce(300)   // total for ACTIVITY
      .mockResolvedValueOnce(100);  // would delete for ACTIVITY
    const preview = await service.getCleanupPreview();
    expect(preview).toHaveLength(2);
    expect(preview[0]).toEqual({
      entityType: 'LEAD', totalRecords: 500, wouldDelete: 50, retentionDays: 365,
    });
    expect(preview[1]).toEqual({
      entityType: 'ACTIVITY', totalRecords: 300, wouldDelete: 100, retentionDays: 180,
    });
  });

  describe('error cases', () => {
    it('should return 0 totalDeleted when no active policies exist', async () => {
      prisma.auditRetentionPolicy.findMany.mockResolvedValue([]);
      const result = await service.cleanupOldLogs();
      expect(result.totalDeleted).toBe(0);
    });

    it('should return empty preview array when no policies found', async () => {
      prisma.auditRetentionPolicy.findMany.mockResolvedValue([]);
      const preview = await service.getCleanupPreview();
      expect(preview).toEqual([]);
    });

    it('should propagate DB error from auditLog.deleteMany', async () => {
      prisma.auditLog.deleteMany.mockRejectedValue(new Error('Query timeout'));
      await expect(service.cleanupOldLogs()).rejects.toThrow();
    });
  });
});
