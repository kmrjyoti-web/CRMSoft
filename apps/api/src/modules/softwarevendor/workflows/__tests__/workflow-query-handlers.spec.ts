// @ts-nocheck
import { NotFoundException } from '@nestjs/common';

import { GetApprovalByIdHandler } from '../application/queries/get-approval-by-id/get-approval-by-id.handler';
import { GetApprovalByIdQuery } from '../application/queries/get-approval-by-id/get-approval-by-id.query';
import { GetApprovalHistoryHandler } from '../application/queries/get-approval-history/get-approval-history.handler';
import { GetApprovalHistoryQuery } from '../application/queries/get-approval-history/get-approval-history.query';
import { GetEntityStatusHandler } from '../application/queries/get-entity-status/get-entity-status.handler';
import { GetEntityStatusQuery } from '../application/queries/get-entity-status/get-entity-status.query';
import { GetInstanceHistoryHandler } from '../application/queries/get-instance-history/get-instance-history.handler';
import { GetInstanceHistoryQuery } from '../application/queries/get-instance-history/get-instance-history.query';
import { GetInstanceTransitionsHandler } from '../application/queries/get-instance-transitions/get-instance-transitions.handler';
import { GetInstanceTransitionsQuery } from '../application/queries/get-instance-transitions/get-instance-transitions.query';
import { GetInstanceHandler } from '../application/queries/get-instance/get-instance.handler';
import { GetInstanceQuery } from '../application/queries/get-instance/get-instance.query';
import { GetPendingApprovalsHandler } from '../application/queries/get-pending-approvals/get-pending-approvals.handler';
import { GetPendingApprovalsQuery } from '../application/queries/get-pending-approvals/get-pending-approvals.query';
import { GetWorkflowByIdHandler } from '../application/queries/get-workflow-by-id/get-workflow-by-id.handler';
import { GetWorkflowByIdQuery } from '../application/queries/get-workflow-by-id/get-workflow-by-id.query';
import { GetWorkflowListHandler } from '../application/queries/get-workflow-list/get-workflow-list.handler';
import { GetWorkflowListQuery } from '../application/queries/get-workflow-list/get-workflow-list.query';
import { GetWorkflowStatsHandler } from '../application/queries/get-workflow-stats/get-workflow-stats.handler';
import { GetWorkflowStatsQuery } from '../application/queries/get-workflow-stats/get-workflow-stats.query';
import { GetWorkflowVisualHandler } from '../application/queries/get-workflow-visual/get-workflow-visual.handler';
import { GetWorkflowVisualQuery } from '../application/queries/get-workflow-visual/get-workflow-visual.query';

// ─── shared mock factories ────────────────────────────────────────────────────

const makeApproval = (overrides: any = {}) => ({
  id: 'appr-1',
  status: 'PENDING',
  requestedById: 'user-1',
  approvedById: null,
  instance: {
    id: 'inst-1', entityType: 'LEAD', entityId: 'lead-1',
    workflow: { id: 'wf-1', name: 'Lead Workflow', code: 'LEAD_WF' },
    currentState: { id: 'st-1', name: 'New', code: 'NEW' },
  },
  transition: {
    id: 'tr-1', name: 'Qualify', code: 'QUALIFY',
    fromState: { id: 'st-1', name: 'New', code: 'NEW' },
    toState: { id: 'st-2', name: 'Qualified', code: 'QUALIFIED' },
  },
  ...overrides,
});

const makeInstance = (overrides: any = {}) => ({
  id: 'inst-1',
  entityType: 'LEAD',
  entityId: 'lead-1',
  isActive: true,
  workflow: { id: 'wf-1', name: 'Lead Workflow', code: 'LEAD_WF', entityType: 'LEAD' },
  currentState: { id: 'st-1', name: 'New', code: 'NEW', color: '#ccc' },
  previousState: null,
  _count: { history: 3, approvals: 1 },
  ...overrides,
});

const makeWorkflow = (overrides: any = {}) => ({
  id: 'wf-1',
  name: 'Lead Workflow',
  code: 'LEAD_WF',
  entityType: 'LEAD',
  isActive: true,
  states: [{ id: 'st-1', name: 'New', code: 'NEW', sortOrder: 0 }],
  transitions: [],
  ...overrides,
});

function makePrisma() {
  return {
    workflowApproval: {
      findUnique: jest.fn().mockResolvedValue(makeApproval()),
      findMany: jest.fn().mockResolvedValue([makeApproval()]),
      count: jest.fn().mockResolvedValue(2),
    },
    workflowHistory: {
      findMany: jest.fn().mockResolvedValue([
        { id: 'hist-1', fromState: { id: 'st-1', name: 'New', code: 'NEW', color: '#ccc' },
          toState: { id: 'st-2', name: 'Qualified', code: 'QUALIFIED', color: '#0f0' },
          transition: { id: 'tr-1', name: 'Qualify', code: 'QUALIFY' } },
      ]),
    },
    workflowInstance: {
      findUnique: jest.fn().mockResolvedValue(makeInstance()),
      count: jest.fn().mockResolvedValue(5),
      groupBy: jest.fn().mockResolvedValue([{ currentStateId: 'st-1', _count: 5 }]),
    },
    workflow: {
      findUnique: jest.fn().mockResolvedValue(makeWorkflow()),
      findMany: jest.fn().mockResolvedValue([makeWorkflow()]),
      count: jest.fn().mockResolvedValue(3),
    },
    workflowSlaEscalation: {
      count: jest.fn().mockResolvedValue(0),
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GetApprovalByIdHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetApprovalByIdHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return approval with full includes', async () => {
    const handler = new GetApprovalByIdHandler(prisma as any);
    const result = await handler.execute(new GetApprovalByIdQuery('appr-1'));
    expect(prisma.workflowApproval.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'appr-1' } }),
    );
    expect(result.id).toBe('appr-1');
    expect(result.instance).toBeDefined();
    expect(result.transition).toBeDefined();
  });

  it('should throw NotFoundException when approval not found', async () => {
    prisma.workflowApproval.findUnique.mockResolvedValue(null);
    const handler = new GetApprovalByIdHandler(prisma as any);
    await expect(handler.execute(new GetApprovalByIdQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetApprovalHistoryHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetApprovalHistoryHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return all non-pending approvals', async () => {
    prisma.workflowApproval.findMany.mockResolvedValue([makeApproval({ status: 'APPROVED' })]);
    const handler = new GetApprovalHistoryHandler(prisma as any);
    const result = await handler.execute(new GetApprovalHistoryQuery());
    expect(prisma.workflowApproval.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: { not: 'PENDING' } }) }),
    );
    expect(result).toHaveLength(1);
  });

  it('should filter by userId when provided', async () => {
    const handler = new GetApprovalHistoryHandler(prisma as any);
    await handler.execute(new GetApprovalHistoryQuery('user-2'));
    const where = prisma.workflowApproval.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
  });

  it('should return empty array when no history', async () => {
    prisma.workflowApproval.findMany.mockResolvedValue([]);
    const handler = new GetApprovalHistoryHandler(prisma as any);
    const result = await handler.execute(new GetApprovalHistoryQuery());
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetEntityStatusHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetEntityStatusHandler', () => {
  it('should delegate to WorkflowEngineService.getEntityStatus', async () => {
    const mockEngine = { getEntityStatus: jest.fn().mockResolvedValue({ entityId: 'lead-1', currentState: 'NEW' }) };
    const handler = new GetEntityStatusHandler(mockEngine as any);
    const result = await handler.execute(new GetEntityStatusQuery('LEAD', 'lead-1'));
    expect(mockEngine.getEntityStatus).toHaveBeenCalledWith('LEAD', 'lead-1');
    expect(result.entityId).toBe('lead-1');
  });

  it('should propagate engine errors', async () => {
    const mockEngine = { getEntityStatus: jest.fn().mockRejectedValue(new Error('Not found')) };
    const handler = new GetEntityStatusHandler(mockEngine as any);
    await expect(handler.execute(new GetEntityStatusQuery('LEAD', 'bad'))).rejects.toThrow('Not found');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetInstanceHistoryHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetInstanceHistoryHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return history ordered by createdAt desc', async () => {
    const handler = new GetInstanceHistoryHandler(prisma as any);
    const result = await handler.execute(new GetInstanceHistoryQuery('inst-1'));
    expect(prisma.workflowHistory.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { instanceId: 'inst-1' },
        orderBy: { createdAt: 'desc' },
      }),
    );
    expect(result).toHaveLength(1);
  });

  it('should return empty array when no history', async () => {
    prisma.workflowHistory.findMany.mockResolvedValue([]);
    const handler = new GetInstanceHistoryHandler(prisma as any);
    const result = await handler.execute(new GetInstanceHistoryQuery('new-inst'));
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetInstanceTransitionsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetInstanceTransitionsHandler', () => {
  it('should return available transitions from engine', async () => {
    const transitions = [{ id: 'tr-1', name: 'Qualify', code: 'QUALIFY' }];
    const mockEngine = { getAvailableTransitions: jest.fn().mockResolvedValue(transitions) };
    const handler = new GetInstanceTransitionsHandler(mockEngine as any);
    const result = await handler.execute(new GetInstanceTransitionsQuery('inst-1', 'user-1'));
    expect(mockEngine.getAvailableTransitions).toHaveBeenCalledWith('inst-1', 'user-1');
    expect(result).toHaveLength(1);
  });

  it('should propagate engine errors', async () => {
    const mockEngine = { getAvailableTransitions: jest.fn().mockRejectedValue(new Error('Engine error')) };
    const handler = new GetInstanceTransitionsHandler(mockEngine as any);
    await expect(handler.execute(new GetInstanceTransitionsQuery('bad', 'user-1'))).rejects.toThrow('Engine error');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetInstanceHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetInstanceHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return instance with workflow and state details', async () => {
    const handler = new GetInstanceHandler(prisma as any);
    const result = await handler.execute(new GetInstanceQuery('inst-1'));
    expect(prisma.workflowInstance.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'inst-1' } }),
    );
    expect(result.id).toBe('inst-1');
    expect(result.workflow).toBeDefined();
    expect(result.currentState).toBeDefined();
  });

  it('should throw NotFoundException when instance not found', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(null);
    const handler = new GetInstanceHandler(prisma as any);
    await expect(handler.execute(new GetInstanceQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetPendingApprovalsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetPendingApprovalsHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return pending approvals ordered by createdAt desc', async () => {
    const handler = new GetPendingApprovalsHandler(prisma as any);
    const result = await handler.execute(new GetPendingApprovalsQuery());
    expect(prisma.workflowApproval.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } }),
    );
    expect(result).toHaveLength(1);
  });

  it('should return empty array when no pending approvals', async () => {
    prisma.workflowApproval.findMany.mockResolvedValue([]);
    const handler = new GetPendingApprovalsHandler(prisma as any);
    const result = await handler.execute(new GetPendingApprovalsQuery('user-1'));
    expect(result).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetWorkflowByIdHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetWorkflowByIdHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return workflow with states and transitions', async () => {
    const handler = new GetWorkflowByIdHandler(prisma as any);
    const result = await handler.execute(new GetWorkflowByIdQuery('wf-1'));
    expect(prisma.workflow.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wf-1' } }),
    );
    expect(result.id).toBe('wf-1');
    expect(result.states).toBeDefined();
    expect(result.transitions).toBeDefined();
  });

  it('should throw NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const handler = new GetWorkflowByIdHandler(prisma as any);
    await expect(handler.execute(new GetWorkflowByIdQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetWorkflowListHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetWorkflowListHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return paginated workflow list', async () => {
    prisma.workflow.count.mockResolvedValue(3);
    const handler = new GetWorkflowListHandler(prisma as any);
    const result = await handler.execute(new GetWorkflowListQuery(1, 20, 'desc'));
    expect(prisma.workflow.findMany).toHaveBeenCalled();
    expect(prisma.workflow.count).toHaveBeenCalled();
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(3);
  });

  it('should filter by entityType when provided', async () => {
    prisma.workflow.count.mockResolvedValue(1);
    const handler = new GetWorkflowListHandler(prisma as any);
    await handler.execute(new GetWorkflowListQuery(1, 20, 'asc', undefined, 'LEAD'));
    expect(prisma.workflow.findMany.mock.calls[0][0].where.entityType).toBe('LEAD');
  });

  it('should apply search filter across name and code', async () => {
    prisma.workflow.count.mockResolvedValue(0);
    prisma.workflow.findMany.mockResolvedValue([]);
    const handler = new GetWorkflowListHandler(prisma as any);
    await handler.execute(new GetWorkflowListQuery(1, 20, 'desc', 'lead'));
    const where = prisma.workflow.findMany.mock.calls[0][0].where;
    expect(where.OR).toBeDefined();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetWorkflowStatsHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetWorkflowStatsHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return aggregate workflow stats', async () => {
    prisma.workflow.count.mockResolvedValue(5);
    prisma.workflowInstance.count
      .mockResolvedValueOnce(12)
      .mockResolvedValueOnce(8);
    prisma.workflowApproval.count.mockResolvedValue(3);
    prisma.workflowSlaEscalation.count.mockResolvedValue(1);
    const handler = new GetWorkflowStatsHandler(prisma as any);
    const result = await handler.execute(new GetWorkflowStatsQuery());
    expect(result.totalWorkflows).toBe(5);
    expect(result.activeInstances).toBe(12);
    expect(result.completedInstances).toBe(8);
    expect(result.pendingApprovals).toBe(3);
    expect(result.slaBreaches).toBe(1);
  });

  it('should filter stats by entityType', async () => {
    const handler = new GetWorkflowStatsHandler(prisma as any);
    await handler.execute(new GetWorkflowStatsQuery('LEAD'));
    expect(prisma.workflow.count.mock.calls[0][0].where).toMatchObject({ entityType: 'LEAD' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GetWorkflowVisualHandler
// ═══════════════════════════════════════════════════════════════════════════════
describe('GetWorkflowVisualHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => { jest.clearAllMocks(); prisma = makePrisma(); });

  it('should return visual representation with nodes and edges', async () => {
    prisma.workflow.findUnique.mockResolvedValue({
      ...makeWorkflow(),
      states: [
        { id: 'st-1', name: 'New', code: 'NEW', sortOrder: 0, color: '#fff', isInitial: true },
        { id: 'st-2', name: 'Done', code: 'DONE', sortOrder: 1, color: '#0f0', isFinal: true },
      ],
      transitions: [
        { id: 'tr-1', name: 'Complete', code: 'COMPLETE',
          fromState: { id: 'st-1', name: 'New', code: 'NEW', color: '#fff' },
          toState: { id: 'st-2', name: 'Done', code: 'DONE', color: '#0f0' } },
      ],
    });
    const handler = new GetWorkflowVisualHandler(prisma as any);
    const result = await handler.execute(new GetWorkflowVisualQuery('wf-1'));
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const handler = new GetWorkflowVisualHandler(prisma as any);
    await expect(handler.execute(new GetWorkflowVisualQuery('missing'))).rejects.toThrow(NotFoundException);
  });
});
