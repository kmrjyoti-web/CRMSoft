import { GetEntityTimelineHandler } from '../../application/queries/get-entity-timeline/get-entity-timeline.handler';

describe('GetEntityTimeline', () => {
  let prisma: any;
  let snapshotService: any;
  let handler: GetEntityTimelineHandler;

  const mockLogs = [
    {
      id: 'log-3', action: 'UPDATE', summary: 'Updated lead status', changeCount: 1,
      performedByName: 'Alice', performedById: 'u-1',
      createdAt: new Date(Date.now() - 3600000),
      fieldChanges: [
        { fieldName: 'status', fieldLabel: 'Lead Status', oldValue: 'NEW', newValue: 'VERIFIED',
          oldDisplayValue: 'New', newDisplayValue: 'Verified', fieldType: 'ENUM' },
      ],
    },
    {
      id: 'log-2', action: 'UPDATE', summary: 'Updated priority', changeCount: 1,
      performedByName: 'Bob', performedById: 'u-2',
      createdAt: new Date(Date.now() - 86400000),
      fieldChanges: [
        { fieldName: 'priority', fieldLabel: 'Priority', oldValue: 'MEDIUM', newValue: 'HIGH',
          oldDisplayValue: 'Medium', newDisplayValue: 'High', fieldType: 'ENUM' },
      ],
    },
    {
      id: 'log-1', action: 'CREATE', summary: 'Created lead', changeCount: 0,
      performedByName: 'Amit', performedById: 'u-3',
      createdAt: new Date(Date.now() - 172800000),
      fieldChanges: [],
    },
  ];

  beforeEach(() => {
    prisma = {
      auditLog: {
        findMany: jest.fn().mockResolvedValue(mockLogs),
        count: jest.fn().mockResolvedValue(3),
      },
    };
    (prisma as any).identity = prisma;
    (prisma as any).platform = prisma;
    snapshotService = {
      captureSnapshot: jest.fn().mockResolvedValue({ id: 'lead-1', status: 'VERIFIED' }),
      getEntityLabel: jest.fn().mockReturnValue('Lead #L-2026-00045'),
    };
    handler = new GetEntityTimelineHandler(prisma, snapshotService);
  });

  it('should return timeline sorted by createdAt DESC', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1',
    } as any);
    expect(result.timeline).toHaveLength(3);
    expect(result.timeline[0].id).toBe('log-3');
    expect(result.timeline[2].id).toBe('log-1');
  });

  it('should include field changes with display values', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1',
    } as any);
    const updateLog = result.timeline[0];
    expect(updateLog.fieldChanges).toHaveLength(1);
    expect(updateLog.fieldChanges[0].oldDisplayValue).toBe('New');
    expect(updateLog.fieldChanges[0].newDisplayValue).toBe('Verified');
  });

  it('should show entity label for CREATE action', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1',
    } as any);
    expect(result.entity.label).toBe('Lead #L-2026-00045');
  });

  it('should filter by action type', async () => {
    prisma.auditLog.findMany.mockResolvedValue([mockLogs[2]]);
    prisma.auditLog.count.mockResolvedValue(1);
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', action: 'CREATE',
    } as any);
    expect(result.timeline).toHaveLength(1);
    expect(result.timeline[0].action).toBe('CREATE');
  });

  it('should paginate correctly', async () => {
    const result = await handler.execute({
      entityType: 'LEAD', entityId: 'lead-1', page: 1, limit: 10,
    } as any);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.total).toBe(3);
  });
});
