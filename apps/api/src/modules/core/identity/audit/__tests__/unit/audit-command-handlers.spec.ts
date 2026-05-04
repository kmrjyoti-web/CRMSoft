import { NotFoundException } from '@nestjs/common';
import { CleanupOldLogsHandler } from '../../application/commands/cleanup-old-logs/cleanup-old-logs.handler';
import { CreateAuditLogHandler } from '../../application/commands/create-audit-log/create-audit-log.handler';
import { CreateBulkAuditLogHandler } from '../../application/commands/create-bulk-audit-log/create-bulk-audit-log.handler';
import { UpdateRetentionPolicyHandler } from '../../application/commands/update-retention-policy/update-retention-policy.handler';
import { CleanupOldLogsCommand } from '../../application/commands/cleanup-old-logs/cleanup-old-logs.command';
import { CreateAuditLogCommand } from '../../application/commands/create-audit-log/create-audit-log.command';
import { CreateBulkAuditLogCommand } from '../../application/commands/create-bulk-audit-log/create-bulk-audit-log.command';
import { UpdateRetentionPolicyCommand } from '../../application/commands/update-retention-policy/update-retention-policy.command';
import { GetAuditStatsHandler } from '../../application/queries/get-audit-stats/get-audit-stats.handler';
import { GetUserActivityHandler } from '../../application/queries/get-user-activity/get-user-activity.handler';
import { GetFieldHistoryHandler } from '../../application/queries/get-field-history/get-field-history.handler';
import { GetRetentionPoliciesHandler } from '../../application/queries/get-retention-policies/get-retention-policies.handler';
import { GetEntityTimelineHandler } from '../../application/queries/get-entity-timeline/get-entity-timeline.handler';
import { GetGlobalFeedHandler } from '../../application/queries/get-global-feed/get-global-feed.handler';
import { GetAuditLogDetailHandler } from '../../application/queries/get-audit-log-detail/get-audit-log-detail.handler';
import { GetDiffViewHandler } from '../../application/queries/get-diff-view/get-diff-view.handler';
import { GetAuditStatsQuery } from '../../application/queries/get-audit-stats/get-audit-stats.query';
import { GetUserActivityQuery } from '../../application/queries/get-user-activity/get-user-activity.query';
import { GetFieldHistoryQuery } from '../../application/queries/get-field-history/get-field-history.query';
import { GetRetentionPoliciesQuery } from '../../application/queries/get-retention-policies/get-retention-policies.query';
import { GetEntityTimelineQuery } from '../../application/queries/get-entity-timeline/get-entity-timeline.query';
import { GetGlobalFeedQuery } from '../../application/queries/get-global-feed/get-global-feed.query';
import { GetAuditLogDetailQuery } from '../../application/queries/get-audit-log-detail/get-audit-log-detail.query';
import { GetDiffViewQuery } from '../../application/queries/get-diff-view/get-diff-view.query';

// ---------------------------------------------------------------------------
// Shared mock helpers
// ---------------------------------------------------------------------------

const makeAuditLog = (overrides: Record<string, unknown> = {}) => ({
  id: 'log-1',
  entityType: 'LEAD',
  entityId: 'lead-1',
  entityLabel: 'Lead #L-001',
  action: 'UPDATE',
  summary: 'Updated lead status',
  changeCount: 1,
  beforeSnapshot: null,
  afterSnapshot: null,
  performedById: 'u-1',
  performedByName: 'Alice',
  performedByEmail: 'alice@example.com',
  performedByRole: 'SALES',
  ipAddress: '127.0.0.1',
  userAgent: 'Mozilla/5.0',
  httpMethod: 'PATCH',
  requestUrl: '/api/leads/lead-1',
  source: 'API',
  module: 'leads',
  correlationId: 'corr-1',
  tags: [],
  isSensitive: false,
  isSystemAction: false,
  createdAt: new Date('2026-01-10T10:00:00Z'),
  fieldChanges: [],
  ...overrides,
});

const makeRetentionPolicy = (overrides: Record<string, unknown> = {}) => ({
  id: 'rp-1',
  entityType: 'LEAD',
  retentionDays: 365,
  archiveEnabled: false,
  isActive: true,
  ...overrides,
});

function buildPrisma() {
  return {
    identity: {
      auditLog: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
        deleteMany: jest.fn(),
      },
      auditFieldChange: {
        findMany: jest.fn(),
        count: jest.fn(),
        deleteMany: jest.fn(),
      },
      auditRetentionPolicy: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    },
    $transaction: jest.fn(),
  } as any;
}

// ---------------------------------------------------------------------------
// CleanupOldLogsHandler
// ---------------------------------------------------------------------------

describe('CleanupOldLogsHandler', () => {
  let cleanupService: any;
  let handler: CleanupOldLogsHandler;

  beforeEach(() => {
    cleanupService = { cleanupOldLogs: jest.fn().mockResolvedValue({ totalDeleted: 5 }) };
    handler = new CleanupOldLogsHandler(cleanupService);
  });

  it('should delegate to AuditCleanupService and return result', async () => {
    const result = await handler.execute(new CleanupOldLogsCommand());
    expect(cleanupService.cleanupOldLogs).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ totalDeleted: 5 });
  });

  it('should propagate error from cleanup service', async () => {
    cleanupService.cleanupOldLogs.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new CleanupOldLogsCommand())).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// CreateAuditLogHandler
// ---------------------------------------------------------------------------

describe('CreateAuditLogHandler', () => {
  let auditService: any;
  let handler: CreateAuditLogHandler;
  const log = makeAuditLog();

  beforeEach(() => {
    auditService = { logAction: jest.fn().mockResolvedValue(log) };
    handler = new CreateAuditLogHandler(auditService);
  });

  it('should call logAction with correct params and return audit log', async () => {
    const cmd = new CreateAuditLogCommand(
      'LEAD', 'lead-1', 'UPDATE', 'Updated status', 'API',
      'u-1', 'Alice', 'leads', [], 'corr-1', ['tag1'],
    );
    const result = await handler.execute(cmd);
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'LEAD',
        entityId: 'lead-1',
        action: 'UPDATE',
        summary: 'Updated status',
        source: 'API',
        performedById: 'u-1',
        performedByName: 'Alice',
        module: 'leads',
        correlationId: 'corr-1',
        tags: ['tag1'],
      }),
    );
    expect(result).toEqual(log);
  });

  it('should propagate error from auditService.logAction', async () => {
    auditService.logAction.mockRejectedValue(new Error('Write failed'));
    const cmd = new CreateAuditLogCommand('LEAD', 'lead-1', 'CREATE', 'Created', 'API');
    await expect(handler.execute(cmd)).rejects.toThrow('Write failed');
  });
});

// ---------------------------------------------------------------------------
// CreateBulkAuditLogHandler
// ---------------------------------------------------------------------------

describe('CreateBulkAuditLogHandler', () => {
  let auditService: any;
  let handler: CreateBulkAuditLogHandler;

  beforeEach(() => {
    auditService = { logAction: jest.fn().mockResolvedValue(makeAuditLog()) };
    handler = new CreateBulkAuditLogHandler(auditService);
  });

  it('should call logAction once per entityId', async () => {
    const cmd = new CreateBulkAuditLogCommand(
      'LEAD', ['lead-1', 'lead-2', 'lead-3'], 'BULK_UPDATE', 'Bulk update', 'API',
    );
    const result = await handler.execute(cmd);
    expect(auditService.logAction).toHaveBeenCalledTimes(3);
    expect(result.logged).toBe(3);
  });

  it('should use provided correlationId', async () => {
    const cmd = new CreateBulkAuditLogCommand(
      'LEAD', ['lead-1'], 'UPDATE', 'Update', 'API',
      undefined, undefined, undefined, 'my-corr-id',
    );
    await handler.execute(cmd);
    expect(auditService.logAction).toHaveBeenCalledWith(
      expect.objectContaining({ correlationId: 'my-corr-id' }),
    );
  });

  it('should auto-generate correlationId when not provided', async () => {
    const cmd = new CreateBulkAuditLogCommand('LEAD', ['lead-1'], 'UPDATE', 'Update', 'API');
    const result = await handler.execute(cmd);
    expect(result.correlationId).toMatch(/^bulk-\d+$/);
  });

  it('should count only successful logs (non-null returns)', async () => {
    auditService.logAction
      .mockResolvedValueOnce(makeAuditLog())
      .mockResolvedValueOnce(null);
    const cmd = new CreateBulkAuditLogCommand('LEAD', ['lead-1', 'lead-2'], 'UPDATE', 'Update', 'API');
    const result = await handler.execute(cmd);
    expect(result.logged).toBe(1);
  });

  it('should propagate unexpected errors', async () => {
    auditService.logAction.mockRejectedValue(new Error('Bulk write failed'));
    const cmd = new CreateBulkAuditLogCommand('LEAD', ['lead-1'], 'UPDATE', 'Update', 'API');
    await expect(handler.execute(cmd)).rejects.toThrow('Bulk write failed');
  });
});

// ---------------------------------------------------------------------------
// UpdateRetentionPolicyHandler
// ---------------------------------------------------------------------------

describe('UpdateRetentionPolicyHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: UpdateRetentionPolicyHandler;
  const existingPolicy = makeRetentionPolicy();

  beforeEach(() => {
    prisma = buildPrisma();
    handler = new UpdateRetentionPolicyHandler(prisma);
  });

  it('should update existing policy when one is found', async () => {
    prisma.identity.auditRetentionPolicy.findFirst.mockResolvedValue(existingPolicy);
    prisma.identity.auditRetentionPolicy.update.mockResolvedValue({ ...existingPolicy, retentionDays: 180 });

    const cmd = new UpdateRetentionPolicyCommand('LEAD', 180, true, true);
    const result = await handler.execute(cmd);

    expect(prisma.identity.auditRetentionPolicy.findFirst).toHaveBeenCalledWith({
      where: { entityType: 'LEAD' },
    });
    expect(prisma.identity.auditRetentionPolicy.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'rp-1' },
        data: expect.objectContaining({ retentionDays: 180 }),
      }),
    );
    expect(result).toMatchObject({ retentionDays: 180 });
  });

  it('should create new policy when none exists', async () => {
    prisma.identity.auditRetentionPolicy.findFirst.mockResolvedValue(null);
    const newPolicy = makeRetentionPolicy({ id: 'rp-new', retentionDays: 90 });
    prisma.identity.auditRetentionPolicy.create.mockResolvedValue(newPolicy);

    const cmd = new UpdateRetentionPolicyCommand('CONTACT', 90);
    await handler.execute(cmd);

    expect(prisma.identity.auditRetentionPolicy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'CONTACT',
          retentionDays: 90,
        }),
      }),
    );
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditRetentionPolicy.findFirst.mockRejectedValue(new Error('DB down'));
    const cmd = new UpdateRetentionPolicyCommand('LEAD', 365);
    await expect(handler.execute(cmd)).rejects.toThrow('DB down');
  });
});

// ---------------------------------------------------------------------------
// GetAuditStatsHandler
// ---------------------------------------------------------------------------

describe('GetAuditStatsHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetAuditStatsHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditLog.groupBy
      .mockResolvedValueOnce([{ action: 'UPDATE', _count: 5 }])  // byAction
      .mockResolvedValueOnce([{ entityType: 'LEAD', _count: 5 }]) // byEntity
      .mockResolvedValueOnce([{ performedById: 'u-1', performedByName: 'Alice', _count: 5 }]); // topUsers
    prisma.identity.auditLog.count
      .mockResolvedValueOnce(10) // totalChanges
      .mockResolvedValueOnce(2)  // sensitiveChanges
      .mockResolvedValueOnce(1); // systemChanges
    prisma.identity.auditLog.groupBy.mockResolvedValueOnce([]); // byModule
    handler = new GetAuditStatsHandler(prisma);
  });

  it('should return stats with correct shape', async () => {
    const result = await handler.execute(new GetAuditStatsQuery());
    expect(result).toHaveProperty('totalChanges');
    expect(result).toHaveProperty('byAction');
    expect(result).toHaveProperty('byEntity');
    expect(result).toHaveProperty('byUser');
    expect(result).toHaveProperty('byModule');
    expect(result).toHaveProperty('sensitiveChanges');
    expect(result).toHaveProperty('systemChanges');
  });

  it('should filter by userId when provided', async () => {
    // reset and reconfigure
    prisma.identity.auditLog.groupBy.mockReset();
    prisma.identity.auditLog.count.mockReset();
    prisma.identity.auditLog.groupBy
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    prisma.identity.auditLog.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(0)
      .mockResolvedValueOnce(0);

    const query = { userId: 'u-2' } as GetAuditStatsQuery;
    await handler.execute(query);

    // groupBy calls should include performedById filter
    const firstCall = prisma.identity.auditLog.groupBy.mock.calls[0][0];
    expect(firstCall.where).toMatchObject({ performedById: 'u-2' });
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditLog.groupBy.mockReset();
    prisma.identity.auditLog.groupBy.mockRejectedValue(new Error('Stats query failed'));
    await expect(handler.execute(new GetAuditStatsQuery())).rejects.toThrow('Stats query failed');
  });
});

// ---------------------------------------------------------------------------
// GetUserActivityHandler
// ---------------------------------------------------------------------------

describe('GetUserActivityHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetUserActivityHandler;
  const logRow = {
    ...makeAuditLog(),
    createdAt: new Date('2026-01-10T10:00:00Z'),
    fieldChanges: [],
  };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditLog.findMany.mockResolvedValue([logRow]);
    prisma.identity.auditLog.count.mockResolvedValue(1);
    handler = new GetUserActivityHandler(prisma);
  });

  it('should return paginated activity for user', async () => {
    const query = { userId: 'u-1', page: 1, limit: 10 } as GetUserActivityQuery;
    const result = await handler.execute(query);
    expect(result.userId).toBe('u-1');
    expect(result.activity).toHaveLength(1);
    expect(result.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
  });

  it('should filter by performedById in where clause', async () => {
    const query = { userId: 'u-42' } as GetUserActivityQuery;
    await handler.execute(query);
    expect(prisma.identity.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ performedById: 'u-42' }) }),
    );
  });

  it('should use defaults for page and limit', async () => {
    await handler.execute({ userId: 'u-1' } as GetUserActivityQuery);
    expect(prisma.identity.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 20 }),
    );
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditLog.findMany.mockRejectedValue(new Error('Query failed'));
    await expect(handler.execute({ userId: 'u-1' } as GetUserActivityQuery)).rejects.toThrow('Query failed');
  });
});

// ---------------------------------------------------------------------------
// GetFieldHistoryHandler
// ---------------------------------------------------------------------------

describe('GetFieldHistoryHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetFieldHistoryHandler;
  const fieldChangeRow = {
    id: 'fc-1',
    auditLogId: 'log-1',
    fieldName: 'status',
    oldValue: 'NEW',
    newValue: 'VERIFIED',
    oldDisplayValue: 'New',
    newDisplayValue: 'Verified',
    fieldType: 'STRING',
    isSensitive: false,
    createdAt: new Date('2026-01-10T10:00:00Z'),
    auditLog: {
      id: 'log-1',
      action: 'UPDATE',
      performedByName: 'Alice',
      performedById: 'u-1',
      createdAt: new Date('2026-01-10T10:00:00Z'),
      summary: 'Updated status',
    },
  };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditFieldChange.findMany.mockResolvedValue([fieldChangeRow]);
    prisma.identity.auditFieldChange.count.mockResolvedValue(1);
    handler = new GetFieldHistoryHandler(prisma);
  });

  it('should return paginated field history', async () => {
    const query = { entityType: 'LEAD', entityId: 'lead-1', fieldName: 'status' } as GetFieldHistoryQuery;
    const result = await handler.execute(query);
    expect(result.entityType).toBe('LEAD');
    expect(result.entityId).toBe('lead-1');
    expect(result.fieldName).toBe('status');
    expect(result.history).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditFieldChange.findMany.mockRejectedValue(new Error('Field history failed'));
    const query = { entityType: 'LEAD', entityId: 'lead-1', fieldName: 'status' } as GetFieldHistoryQuery;
    await expect(handler.execute(query)).rejects.toThrow('Field history failed');
  });
});

// ---------------------------------------------------------------------------
// GetRetentionPoliciesHandler
// ---------------------------------------------------------------------------

describe('GetRetentionPoliciesHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetRetentionPoliciesHandler;

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditRetentionPolicy.findMany.mockResolvedValue([makeRetentionPolicy()]);
    handler = new GetRetentionPoliciesHandler(prisma);
  });

  it('should return all retention policies ordered by entityType', async () => {
    const result = await handler.execute(new GetRetentionPoliciesQuery());
    expect(Array.isArray(result)).toBe(true);
    expect(prisma.identity.auditRetentionPolicy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { entityType: 'asc' } }),
    );
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditRetentionPolicy.findMany.mockRejectedValue(new Error('Policies fetch failed'));
    await expect(handler.execute(new GetRetentionPoliciesQuery())).rejects.toThrow('Policies fetch failed');
  });
});

// ---------------------------------------------------------------------------
// GetEntityTimelineHandler
// ---------------------------------------------------------------------------

describe('GetEntityTimelineHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let snapshotService: any;
  let handler: GetEntityTimelineHandler;
  const logRow = { ...makeAuditLog(), createdAt: new Date('2026-01-10T10:00:00Z'), fieldChanges: [] };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditLog.findMany.mockResolvedValue([logRow]);
    prisma.identity.auditLog.count.mockResolvedValue(1);
    snapshotService = {
      captureSnapshot: jest.fn().mockResolvedValue({ id: 'lead-1', status: 'VERIFIED' }),
      getEntityLabel: jest.fn().mockReturnValue('Lead #L-001'),
    };
    handler = new GetEntityTimelineHandler(prisma, snapshotService);
  });

  it('should return timeline with entity metadata', async () => {
    const query = { entityType: 'LEAD', entityId: 'lead-1', page: 1, limit: 10 } as GetEntityTimelineQuery;
    const result = await handler.execute(query);
    expect(result.entity.type).toBe('LEAD');
    expect(result.entity.id).toBe('lead-1');
    expect(result.timeline).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should filter by entityType and entityId in where clause', async () => {
    const query = { entityType: 'CONTACT', entityId: 'contact-2' } as GetEntityTimelineQuery;
    await handler.execute(query);
    expect(prisma.identity.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ entityType: 'CONTACT', entityId: 'contact-2' }),
      }),
    );
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditLog.findMany.mockRejectedValue(new Error('Timeline failed'));
    const query = { entityType: 'LEAD', entityId: 'lead-1' } as GetEntityTimelineQuery;
    await expect(handler.execute(query)).rejects.toThrow('Timeline failed');
  });
});

// ---------------------------------------------------------------------------
// GetGlobalFeedHandler
// ---------------------------------------------------------------------------

describe('GetGlobalFeedHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetGlobalFeedHandler;
  const logRow = { ...makeAuditLog(), createdAt: new Date('2026-01-10T10:00:00Z'), fieldChanges: [] };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditLog.findMany.mockResolvedValue([logRow]);
    prisma.identity.auditLog.count.mockResolvedValue(1);
    handler = new GetGlobalFeedHandler(prisma);
  });

  it('should return paginated feed', async () => {
    const result = await handler.execute({ page: 1, limit: 10 } as GetGlobalFeedQuery);
    expect(result.feed).toHaveLength(1);
    expect(result.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
  });

  it('should filter by entityType when provided', async () => {
    await handler.execute({ entityType: 'LEAD' } as GetGlobalFeedQuery);
    expect(prisma.identity.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ entityType: 'LEAD' }) }),
    );
  });

  it('should return empty feed when no results', async () => {
    prisma.identity.auditLog.findMany.mockResolvedValue([]);
    prisma.identity.auditLog.count.mockResolvedValue(0);
    const result = await handler.execute({} as GetGlobalFeedQuery);
    expect(result.feed).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditLog.findMany.mockRejectedValue(new Error('Feed failed'));
    await expect(handler.execute({} as GetGlobalFeedQuery)).rejects.toThrow('Feed failed');
  });
});

// ---------------------------------------------------------------------------
// GetAuditLogDetailHandler
// ---------------------------------------------------------------------------

describe('GetAuditLogDetailHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetAuditLogDetailHandler;
  const fullLog = {
    ...makeAuditLog(),
    createdAt: new Date('2026-01-10T10:00:00Z'),
    fieldChanges: [
      {
        id: 'fc-1', fieldName: 'status', fieldLabel: 'Status', fieldType: 'STRING',
        oldValue: 'NEW', newValue: 'VERIFIED',
        oldDisplayValue: 'New', newDisplayValue: 'Verified', isSensitive: false,
      },
    ],
  };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditLog.findUnique.mockResolvedValue(fullLog);
    handler = new GetAuditLogDetailHandler(prisma);
  });

  it('should return detailed audit log with fieldChanges', async () => {
    const result = await handler.execute(new GetAuditLogDetailQuery('log-1'));
    expect(result.id).toBe('log-1');
    expect(result.fieldChanges).toHaveLength(1);
    expect(result.fieldChanges[0].fieldName).toBe('status');
  });

  it('should throw NotFoundException when log not found', async () => {
    prisma.identity.auditLog.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetAuditLogDetailQuery('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditLog.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetAuditLogDetailQuery('log-1'))).rejects.toThrow('DB error');
  });
});

// ---------------------------------------------------------------------------
// GetDiffViewHandler
// ---------------------------------------------------------------------------

describe('GetDiffViewHandler', () => {
  let prisma: ReturnType<typeof buildPrisma>;
  let handler: GetDiffViewHandler;
  const logWithChanges = {
    ...makeAuditLog(),
    beforeSnapshot: { status: 'NEW' },
    afterSnapshot: { status: 'VERIFIED' },
    createdAt: new Date('2026-01-10T10:00:00Z'),
    fieldChanges: [
      {
        id: 'fc-1', fieldName: 'status', fieldLabel: 'Status',
        oldValue: 'NEW', newValue: 'VERIFIED',
        oldDisplayValue: 'New', newDisplayValue: 'Verified',
      },
    ],
  };

  beforeEach(() => {
    prisma = buildPrisma();
    prisma.identity.auditLog.findUnique.mockResolvedValue(logWithChanges);
    handler = new GetDiffViewHandler(prisma);
  });

  it('should return diff view with fields', async () => {
    const result = await handler.execute(new GetDiffViewQuery('log-1'));
    expect(result.auditLog.id).toBe('log-1');
    expect(result.diff.fields).toHaveLength(1);
    expect(result.diff.fields[0].fieldName).toBe('status');
    expect(result.diff.fields[0].changeType).toBe('MODIFIED');
  });

  it('should detect ADDED change type (null old value)', async () => {
    const addedLog = {
      ...logWithChanges,
      fieldChanges: [
        { id: 'fc-2', fieldName: 'phone', fieldLabel: 'Phone', oldValue: null, newValue: '9999999999', oldDisplayValue: null, newDisplayValue: '9999999999' },
      ],
    };
    prisma.identity.auditLog.findUnique.mockResolvedValue(addedLog);
    const result = await handler.execute(new GetDiffViewQuery('log-1'));
    expect(result.diff.fields[0].changeType).toBe('ADDED');
  });

  it('should detect REMOVED change type (null new value)', async () => {
    const removedLog = {
      ...logWithChanges,
      fieldChanges: [
        { id: 'fc-3', fieldName: 'phone', fieldLabel: 'Phone', oldValue: '9999999999', newValue: null, oldDisplayValue: '9999999999', newDisplayValue: null },
      ],
    };
    prisma.identity.auditLog.findUnique.mockResolvedValue(removedLog);
    const result = await handler.execute(new GetDiffViewQuery('log-1'));
    expect(result.diff.fields[0].changeType).toBe('REMOVED');
  });

  it('should throw NotFoundException when log not found', async () => {
    prisma.identity.auditLog.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new GetDiffViewQuery('nonexistent'))).rejects.toThrow(NotFoundException);
  });

  it('should propagate DB errors', async () => {
    prisma.identity.auditLog.findUnique.mockRejectedValue(new Error('DB error'));
    await expect(handler.execute(new GetDiffViewQuery('log-1'))).rejects.toThrow('DB error');
  });
});
