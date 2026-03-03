import { WorkflowEngineService } from '../workflow-engine.service';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('WorkflowEngineService', () => {
  let service: WorkflowEngineService;
  let prisma: any;
  let conditionEvaluator: any;
  let actionExecutor: any;

  const mockWorkflow = {
    id: 'wf-1', name: 'Lead Pipeline', entityType: 'LEAD', isDefault: true, isActive: true,
    states: [
      { id: 'st-1', code: 'NEW', name: 'New', stateType: 'INITIAL' },
      { id: 'st-2', code: 'VERIFIED', name: 'Verified', stateType: 'INTERMEDIATE' },
      { id: 'st-3', code: 'WON', name: 'Won', stateType: 'TERMINAL' },
    ],
  };

  const mockInstance = {
    id: 'inst-1', workflowId: 'wf-1', entityType: 'LEAD', entityId: 'lead-1',
    currentStateId: 'st-1', currentState: { id: 'st-1', code: 'NEW', name: 'New', stateType: 'INITIAL' },
    workflow: mockWorkflow, isActive: true,
  };

  beforeEach(() => {
    prisma = {
      workflow: { findFirst: jest.fn(), findUnique: jest.fn() },
      workflowInstance: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
      workflowHistory: { create: jest.fn().mockResolvedValue({ id: 'hist-1' }) },
      workflowTransition: { findFirst: jest.fn(), findMany: jest.fn() },
      workflowApproval: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
      user: { findUnique: jest.fn().mockResolvedValue({ firstName: 'Raj', lastName: 'Patel', email: 'raj@crm.com' }) },
      lead: { findUnique: jest.fn().mockResolvedValue({ id: 'lead-1', status: 'NEW' }) },
    };
    conditionEvaluator = { evaluate: jest.fn().mockReturnValue(true) };
    actionExecutor = { executeAll: jest.fn().mockResolvedValue(undefined) };
    service = new WorkflowEngineService(prisma as any, conditionEvaluator, actionExecutor);
  });

  it('should initialize workflow for an entity', async () => {
    prisma.workflow.findFirst.mockResolvedValue(mockWorkflow);
    prisma.workflowInstance.findFirst.mockResolvedValue(null);
    prisma.workflowInstance.create.mockResolvedValue({ ...mockInstance, currentState: mockWorkflow.states[0], workflow: { name: 'Lead Pipeline' } });

    const result = await service.initializeWorkflow('LEAD', 'lead-1', 'user-1');

    expect(prisma.workflow.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { entityType: 'LEAD', isDefault: true, isActive: true } }));
    expect(prisma.workflowInstance.create).toHaveBeenCalled();
    expect(prisma.workflowHistory.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ action: 'INITIALIZE' }) }));
    expect(result).toBeDefined();
  });

  it('should throw NotFoundException when no workflow exists', async () => {
    prisma.workflow.findFirst.mockResolvedValue(null);
    await expect(service.initializeWorkflow('UNKNOWN', 'id-1', 'user-1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException for duplicate active instance', async () => {
    prisma.workflow.findFirst.mockResolvedValue(mockWorkflow);
    prisma.workflowInstance.findFirst.mockResolvedValue({ isActive: true });
    await expect(service.initializeWorkflow('LEAD', 'lead-1', 'user-1')).rejects.toThrow(ConflictException);
  });

  it('should execute a manual transition', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
    prisma.workflowTransition.findFirst.mockResolvedValue({
      id: 'tr-1', code: 'VERIFY', triggerType: 'MANUAL', toStateId: 'st-2',
      toState: { id: 'st-2', code: 'VERIFIED', name: 'Verified', stateType: 'INTERMEDIATE' },
      conditions: null, actions: [],
    });
    prisma.workflowInstance.update.mockResolvedValue({ ...mockInstance, currentStateId: 'st-2' });

    const result = await service.executeTransition('inst-1', 'VERIFY', 'user-1', 'Verified lead');

    expect(result.fromState).toBe('NEW');
    expect(result.toState).toBe('VERIFIED');
    expect(result.action).toBe('TRANSITION');
    expect(prisma.workflowInstance.update).toHaveBeenCalled();
    expect(prisma.workflowHistory.create).toHaveBeenCalled();
  });

  it('should create approval request for APPROVAL transitions', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
    prisma.workflowTransition.findFirst.mockResolvedValue({
      id: 'tr-2', code: 'WIN_APPROVAL', triggerType: 'APPROVAL', toStateId: 'st-3',
      toState: { id: 'st-3', code: 'WON', name: 'Won', stateType: 'TERMINAL' },
      conditions: null,
    });
    prisma.workflowApproval.create.mockResolvedValue({ id: 'appr-1' });

    const result = await service.executeTransition('inst-1', 'WIN_APPROVAL', 'user-1');

    expect(result.action).toBe('APPROVAL_REQUESTED');
    expect(prisma.workflowApproval.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'PENDING' }) }));
    expect(prisma.workflowInstance.update).not.toHaveBeenCalled();
  });

  it('should throw when transition conditions are not met', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
    prisma.workflowTransition.findFirst.mockResolvedValue({
      id: 'tr-1', code: 'VERIFY', triggerType: 'MANUAL', toStateId: 'st-2',
      toState: { id: 'st-2', code: 'VERIFIED', name: 'Verified', stateType: 'INTERMEDIATE' },
      conditions: { conditions: [{ field: 'amount', operator: 'gt', value: 10000 }], logic: 'AND' },
    });
    conditionEvaluator.evaluate.mockReturnValue(false);

    await expect(service.executeTransition('inst-1', 'VERIFY', 'user-1')).rejects.toThrow(BadRequestException);
  });

  it('should return available transitions from current state', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
    prisma.workflowTransition.findMany.mockResolvedValue([
      { id: 'tr-1', code: 'VERIFY', name: 'Verify Lead', triggerType: 'MANUAL', conditions: null, toState: { id: 'st-2', name: 'Verified', code: 'VERIFIED', color: '#60A5FA' } },
      { id: 'tr-2', code: 'NEW_TO_LOST', name: 'Mark Lost', triggerType: 'MANUAL', conditions: null, toState: { id: 'st-4', name: 'Lost', code: 'LOST', color: '#EF4444' } },
    ]);

    const transitions = await service.getAvailableTransitions('inst-1');

    expect(transitions).toHaveLength(2);
    expect(transitions[0].code).toBe('VERIFY');
    expect(transitions[1].code).toBe('NEW_TO_LOST');
  });

  it('should approve transition and perform state change', async () => {
    const approval = {
      id: 'appr-1', status: 'PENDING', requestedById: 'user-2',
      instance: { ...mockInstance },
      transition: {
        id: 'tr-2', toStateId: 'st-3',
        toState: { id: 'st-3', code: 'WON', name: 'Won', stateType: 'TERMINAL' },
      },
    };
    prisma.workflowApproval.findUnique.mockResolvedValue(approval);
    prisma.workflowApproval.update.mockResolvedValue({});
    prisma.workflowInstance.update.mockResolvedValue({ ...mockInstance, currentStateId: 'st-3' });

    const result = await service.approveTransition('appr-1', 'user-1', 'Approved');

    expect(result.toState).toBe('WON');
    expect(prisma.workflowApproval.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'APPROVED' }) }));
  });
});
