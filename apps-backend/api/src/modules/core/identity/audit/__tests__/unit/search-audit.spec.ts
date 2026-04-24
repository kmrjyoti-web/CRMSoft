import { SearchAuditLogsHandler } from '../../application/queries/search-audit-logs/search-audit-logs.handler';

describe('SearchAuditLogs', () => {
  let prisma: any;
  let handler: SearchAuditLogsHandler;

  const mockResults = [
    {
      id: 'log-1', entityType: 'LEAD', entityId: 'lead-1', entityLabel: 'Lead #L-001',
      action: 'UPDATE', summary: 'Updated lead status', changeCount: 1,
      performedByName: 'Alice', performedById: 'u-1', source: 'API', module: 'leads',
      isSensitive: false, createdAt: new Date(),
      fieldChanges: [{ fieldName: 'status', fieldLabel: 'Status', oldDisplayValue: 'New', newDisplayValue: 'Verified' }],
    },
  ];

  beforeEach(() => {
    prisma = {
      auditLog: {
        findMany: jest.fn().mockResolvedValue(mockResults),
        count: jest.fn().mockResolvedValue(1),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    handler = new SearchAuditLogsHandler(prisma);
  });

  it('should search by text query in summary', async () => {
    const result = await handler.execute({ q: 'status' } as any);
    expect(result.results).toHaveLength(1);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ summary: expect.objectContaining({ contains: 'status' }) }),
          ]),
        }),
      }),
    );
  });

  it('should filter by entityType + dateRange', async () => {
    await handler.execute({
      entityType: 'LEAD',
      dateFrom: new Date('2026-01-01'),
      dateTo: new Date('2026-02-28'),
    } as any);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          entityType: 'LEAD',
          createdAt: expect.objectContaining({ gte: expect.any(Date), lte: expect.any(Date) }),
        }),
      }),
    );
  });

  it('should filter by userId (who made the change)', async () => {
    await handler.execute({ userId: 'u-1' } as any);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ performedById: 'u-1' }),
      }),
    );
  });

  it('should filter by specific field name', async () => {
    await handler.execute({ field: 'status' } as any);
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          fieldChanges: { some: { fieldName: 'status' } },
        }),
      }),
    );
  });

  describe('error cases', () => {
    it('should return empty results when no logs match query', async () => {
      prisma.auditLog.findMany.mockResolvedValue([]);
      prisma.auditLog.count.mockResolvedValue(0);
      const result = await handler.execute({ q: 'nonexistent-term' } as any);
      expect(result.results).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should propagate DB error from auditLog.findMany', async () => {
      prisma.auditLog.findMany.mockRejectedValue(new Error('Query failed'));
      await expect(handler.execute({ q: 'status' } as any)).rejects.toThrow('Query failed');
    });

    it('should return results when no filters are provided', async () => {
      const result = await handler.execute({} as any);
      expect(result.results).toHaveLength(1);
    });
  });
});
