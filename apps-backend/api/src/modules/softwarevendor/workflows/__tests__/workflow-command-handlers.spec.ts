// @ts-nocheck
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { CreateWorkflowHandler } from '../application/commands/create-workflow/create-workflow.handler';
import { AddStateHandler } from '../application/commands/add-state/add-state.handler';
import { AddTransitionHandler } from '../application/commands/add-transition/add-transition.handler';
import { UpdateWorkflowHandler } from '../application/commands/update-workflow/update-workflow.handler';
import { UpdateStateHandler } from '../application/commands/update-state/update-state.handler';
import { UpdateTransitionHandler } from '../application/commands/update-transition/update-transition.handler';
import { PublishWorkflowHandler } from '../application/commands/publish-workflow/publish-workflow.handler';
import { ValidateWorkflowHandler } from '../application/commands/validate-workflow/validate-workflow.handler';
import { CloneWorkflowHandler } from '../application/commands/clone-workflow/clone-workflow.handler';
import { RemoveStateHandler } from '../application/commands/remove-state/remove-state.handler';
import { RemoveTransitionHandler } from '../application/commands/remove-transition/remove-transition.handler';
import { RollbackTransitionHandler } from '../application/commands/rollback-transition/rollback-transition.handler';
import { ExecuteTransitionHandler } from '../application/commands/execute-transition/execute-transition.handler';
import { InitializeWorkflowHandler } from '../application/commands/initialize-workflow/initialize-workflow.handler';
import { ApproveTransitionHandler } from '../application/commands/approve-transition/approve-transition.handler';
import { RejectTransitionHandler } from '../application/commands/reject-transition/reject-transition.handler';

import { CreateWorkflowCommand } from '../application/commands/create-workflow/create-workflow.command';
import { AddStateCommand } from '../application/commands/add-state/add-state.command';
import { AddTransitionCommand } from '../application/commands/add-transition/add-transition.command';
import { UpdateWorkflowCommand } from '../application/commands/update-workflow/update-workflow.command';
import { UpdateStateCommand } from '../application/commands/update-state/update-state.command';
import { UpdateTransitionCommand } from '../application/commands/update-transition/update-transition.command';
import { PublishWorkflowCommand } from '../application/commands/publish-workflow/publish-workflow.command';
import { ValidateWorkflowCommand } from '../application/commands/validate-workflow/validate-workflow.command';
import { CloneWorkflowCommand } from '../application/commands/clone-workflow/clone-workflow.command';
import { RemoveStateCommand } from '../application/commands/remove-state/remove-state.command';
import { RemoveTransitionCommand } from '../application/commands/remove-transition/remove-transition.command';
import { RollbackTransitionCommand } from '../application/commands/rollback-transition/rollback-transition.command';
import { ExecuteTransitionCommand } from '../application/commands/execute-transition/execute-transition.command';
import { InitializeWorkflowCommand } from '../application/commands/initialize-workflow/initialize-workflow.command';
import { ApproveTransitionCommand } from '../application/commands/approve-transition/approve-transition.command';
import { RejectTransitionCommand } from '../application/commands/reject-transition/reject-transition.command';

// ─── shared mock factories ────────────────────────────────────────────────────

function makePrisma() {
  return {
    workflow: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      $transaction: jest.fn(),
    },
    workflowState: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
    workflowTransition: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    workflowInstance: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    workflowApproval: {
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    workflowHistory: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    workflowActionLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;
}

function makeEngine() {
  return {
    executeTransition: jest.fn(),
    initializeWorkflow: jest.fn(),
    approveTransition: jest.fn(),
    rejectTransition: jest.fn(),
    getAvailableTransitions: jest.fn(),
    getEntityStatus: jest.fn(),
  } as any;
}

const mockWorkflow = {
  id: 'wf-1',
  name: 'Lead Flow',
  code: 'LEAD_FLOW',
  entityType: 'LEAD',
  isActive: false,
  version: 1,
  states: [],
  transitions: [],
};

const mockState = {
  id: 'st-1',
  workflowId: 'wf-1',
  name: 'New',
  code: 'NEW',
  stateType: 'INITIAL',
};

const mockTransition = {
  id: 'tr-1',
  workflowId: 'wf-1',
  code: 'NEW_TO_QUALIFIED',
  name: 'Qualify',
  fromStateId: 'st-1',
  toStateId: 'st-2',
};

const mockInstance = {
  id: 'inst-1',
  isActive: true,
  currentStateId: 'st-2',
  previousStateId: 'st-1',
  currentState: { id: 'st-2', code: 'QUALIFIED' },
  previousState: { id: 'st-1', code: 'NEW' },
};

// ─── CreateWorkflowHandler ────────────────────────────────────────────────────

describe('CreateWorkflowHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: CreateWorkflowHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new CreateWorkflowHandler(prisma);
  });

  it('creates a workflow when code is unique', async () => {
    prisma.workflow.findFirst.mockResolvedValue(null);
    prisma.workflow.create.mockResolvedValue(mockWorkflow);

    const cmd = new CreateWorkflowCommand('Lead Flow', 'LEAD_FLOW', 'LEAD', 'user-1');
    const result = await handler.execute(cmd);

    expect(prisma.workflow.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: 'LEAD_FLOW', name: 'Lead Flow' }),
      }),
    );
    expect(result.id).toBe('wf-1');
  });

  it('throws ConflictException when workflow code already exists', async () => {
    prisma.workflow.findFirst.mockResolvedValue(mockWorkflow);
    const cmd = new CreateWorkflowCommand('Lead Flow', 'LEAD_FLOW', 'LEAD', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });

  it('propagates prisma errors', async () => {
    prisma.workflow.findFirst.mockRejectedValue(new Error('DB error'));
    const cmd = new CreateWorkflowCommand('Lead Flow', 'LEAD_FLOW', 'LEAD', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow('DB error');
  });
});

// ─── AddStateHandler ──────────────────────────────────────────────────────────

describe('AddStateHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: AddStateHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new AddStateHandler(prisma);
  });

  it('adds a state to an existing workflow', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    prisma.workflowState.findFirst.mockResolvedValue(null);
    prisma.workflowState.create.mockResolvedValue(mockState);

    const cmd = new AddStateCommand('wf-1', 'New', 'NEW', 'INITIAL');
    const result = await handler.execute(cmd);

    expect(prisma.workflowState.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ workflowId: 'wf-1', code: 'NEW' }),
      }),
    );
    expect(result.id).toBe('st-1');
  });

  it('throws NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const cmd = new AddStateCommand('wf-999', 'New', 'NEW', 'INITIAL');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException when state code already exists', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    prisma.workflowState.findFirst.mockResolvedValue(mockState);
    const cmd = new AddStateCommand('wf-1', 'New', 'NEW', 'INITIAL');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });
});

// ─── AddTransitionHandler ─────────────────────────────────────────────────────

describe('AddTransitionHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: AddTransitionHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new AddTransitionHandler(prisma);
  });

  it('adds a transition when all references exist', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    prisma.workflowState.findUnique
      .mockResolvedValueOnce(mockState) // fromState
      .mockResolvedValueOnce({ id: 'st-2', code: 'QUALIFIED' }); // toState
    prisma.workflowTransition.findFirst.mockResolvedValue(null);
    prisma.workflowTransition.create.mockResolvedValue(mockTransition);

    const cmd = new AddTransitionCommand('wf-1', 'st-1', 'st-2', 'Qualify', 'NEW_TO_QUALIFIED');
    const result = await handler.execute(cmd);

    expect(prisma.workflowTransition.create).toHaveBeenCalled();
    expect(result.id).toBe('tr-1');
  });

  it('throws NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const cmd = new AddTransitionCommand('bad-wf', 'st-1', 'st-2', 'Qualify', 'CODE');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when fromState not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    prisma.workflowState.findUnique
      .mockResolvedValueOnce(null) // fromState missing
      .mockResolvedValueOnce({ id: 'st-2' });
    const cmd = new AddTransitionCommand('wf-1', 'bad-st', 'st-2', 'Qualify', 'CODE');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws NotFoundException when toState not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    prisma.workflowState.findUnique
      .mockResolvedValueOnce(mockState) // fromState ok
      .mockResolvedValueOnce(null); // toState missing
    const cmd = new AddTransitionCommand('wf-1', 'st-1', 'bad-st', 'Qualify', 'CODE');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws ConflictException when transition code already exists', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    prisma.workflowState.findUnique
      .mockResolvedValueOnce(mockState)
      .mockResolvedValueOnce({ id: 'st-2' });
    prisma.workflowTransition.findFirst.mockResolvedValue(mockTransition);
    const cmd = new AddTransitionCommand('wf-1', 'st-1', 'st-2', 'Qualify', 'NEW_TO_QUALIFIED');
    await expect(handler.execute(cmd)).rejects.toThrow(ConflictException);
  });
});

// ─── UpdateWorkflowHandler ────────────────────────────────────────────────────

describe('UpdateWorkflowHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: UpdateWorkflowHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new UpdateWorkflowHandler(prisma);
  });

  it('updates workflow when found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(mockWorkflow);
    const updated = { ...mockWorkflow, name: 'Updated' };
    prisma.workflow.update.mockResolvedValue(updated);

    const cmd = new UpdateWorkflowCommand('wf-1', { name: 'Updated' });
    const result = await handler.execute(cmd);

    expect(prisma.workflow.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'wf-1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('throws NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const cmd = new UpdateWorkflowCommand('bad-id', { name: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── UpdateStateHandler ───────────────────────────────────────────────────────

describe('UpdateStateHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: UpdateStateHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new UpdateStateHandler(prisma);
  });

  it('updates state when found', async () => {
    prisma.workflowState.findUnique.mockResolvedValue(mockState);
    const updated = { ...mockState, name: 'Updated' };
    prisma.workflowState.update.mockResolvedValue(updated);

    const cmd = new UpdateStateCommand('st-1', { name: 'Updated' });
    const result = await handler.execute(cmd);

    expect(prisma.workflowState.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'st-1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('throws NotFoundException when state not found', async () => {
    prisma.workflowState.findUnique.mockResolvedValue(null);
    const cmd = new UpdateStateCommand('bad-st', { name: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── UpdateTransitionHandler ──────────────────────────────────────────────────

describe('UpdateTransitionHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: UpdateTransitionHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new UpdateTransitionHandler(prisma);
  });

  it('updates transition when found', async () => {
    prisma.workflowTransition.findUnique.mockResolvedValue(mockTransition);
    const updated = { ...mockTransition, name: 'Updated' };
    prisma.workflowTransition.update.mockResolvedValue(updated);

    const cmd = new UpdateTransitionCommand('tr-1', { name: 'Updated' });
    const result = await handler.execute(cmd);

    expect(prisma.workflowTransition.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'tr-1' } }),
    );
    expect(result.name).toBe('Updated');
  });

  it('throws NotFoundException when transition not found', async () => {
    prisma.workflowTransition.findUnique.mockResolvedValue(null);
    const cmd = new UpdateTransitionCommand('bad-tr', { name: 'X' });
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── PublishWorkflowHandler ───────────────────────────────────────────────────

describe('PublishWorkflowHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: PublishWorkflowHandler;

  const workflowWithStates = (states: any[]) => ({
    ...mockWorkflow,
    states,
    transitions: [],
  });

  beforeEach(() => {
    prisma = makePrisma();
    handler = new PublishWorkflowHandler(prisma);
  });

  it('publishes workflow with valid INITIAL + TERMINAL states', async () => {
    const states = [
      { ...mockState, stateType: 'INITIAL' },
      { id: 'st-2', code: 'DONE', stateType: 'TERMINAL' },
    ];
    prisma.workflow.findUnique.mockResolvedValue(workflowWithStates(states));
    prisma.workflow.update.mockResolvedValue({ ...mockWorkflow, isActive: true, version: 2 });

    const cmd = new PublishWorkflowCommand('wf-1');
    const result = await handler.execute(cmd);

    expect(prisma.workflow.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'wf-1' },
        data: { version: { increment: 1 }, isActive: true },
      }),
    );
    expect(result.isActive).toBe(true);
  });

  it('throws NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const cmd = new PublishWorkflowCommand('bad-id');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when no INITIAL state', async () => {
    prisma.workflow.findUnique.mockResolvedValue(
      workflowWithStates([{ id: 'st-2', code: 'DONE', stateType: 'TERMINAL' }]),
    );
    const cmd = new PublishWorkflowCommand('wf-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when multiple INITIAL states', async () => {
    prisma.workflow.findUnique.mockResolvedValue(
      workflowWithStates([
        { id: 'st-1', code: 'A', stateType: 'INITIAL' },
        { id: 'st-2', code: 'B', stateType: 'INITIAL' },
        { id: 'st-3', code: 'C', stateType: 'TERMINAL' },
      ]),
    );
    const cmd = new PublishWorkflowCommand('wf-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when no TERMINAL state', async () => {
    prisma.workflow.findUnique.mockResolvedValue(
      workflowWithStates([{ id: 'st-1', code: 'NEW', stateType: 'INITIAL' }]),
    );
    const cmd = new PublishWorkflowCommand('wf-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });
});

// ─── ValidateWorkflowHandler ──────────────────────────────────────────────────

describe('ValidateWorkflowHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: ValidateWorkflowHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new ValidateWorkflowHandler(prisma);
  });

  it('returns valid:true for a valid workflow', async () => {
    const stA = { id: 'st-a', code: 'START', stateType: 'INITIAL' };
    const stB = { id: 'st-b', code: 'END', stateType: 'TERMINAL' };
    const tr1 = { id: 'tr-1', code: 'A_TO_B', fromStateId: 'st-a', toStateId: 'st-b' };
    prisma.workflow.findUnique.mockResolvedValue({
      ...mockWorkflow,
      states: [stA, stB],
      transitions: [tr1],
    });

    const result = await handler.execute(new ValidateWorkflowCommand('wf-1'));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.stateCount).toBe(2);
    expect(result.transitionCount).toBe(1);
  });

  it('returns errors for missing INITIAL state', async () => {
    prisma.workflow.findUnique.mockResolvedValue({
      ...mockWorkflow,
      states: [{ id: 'st-b', code: 'END', stateType: 'TERMINAL' }],
      transitions: [],
    });
    const result = await handler.execute(new ValidateWorkflowCommand('wf-1'));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('No INITIAL state defined');
  });

  it('returns errors for missing TERMINAL state', async () => {
    prisma.workflow.findUnique.mockResolvedValue({
      ...mockWorkflow,
      states: [{ id: 'st-a', code: 'START', stateType: 'INITIAL' }],
      transitions: [],
    });
    const result = await handler.execute(new ValidateWorkflowCommand('wf-1'));
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('No TERMINAL state defined');
  });

  it('detects unreachable states', async () => {
    const stA = { id: 'st-a', code: 'START', stateType: 'INITIAL' };
    const stB = { id: 'st-b', code: 'MID', stateType: 'NORMAL' };
    const stC = { id: 'st-c', code: 'END', stateType: 'TERMINAL' };
    // stB is unreachable (no transition from stA to stB)
    prisma.workflow.findUnique.mockResolvedValue({
      ...mockWorkflow,
      states: [stA, stB, stC],
      transitions: [{ id: 'tr-1', code: 'A_C', fromStateId: 'st-a', toStateId: 'st-c' }],
    });
    const result = await handler.execute(new ValidateWorkflowCommand('wf-1'));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('MID'))).toBe(true);
  });

  it('throws NotFoundException when workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    await expect(handler.execute(new ValidateWorkflowCommand('bad-id'))).rejects.toThrow(NotFoundException);
  });
});

// ─── CloneWorkflowHandler ─────────────────────────────────────────────────────

describe('CloneWorkflowHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: CloneWorkflowHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new CloneWorkflowHandler(prisma);
  });

  it('clones a workflow via $transaction', async () => {
    const source = {
      ...mockWorkflow,
      states: [{ id: 'st-1', code: 'NEW', name: 'New', stateType: 'INITIAL', sortOrder: 0 }],
      transitions: [],
    };
    const cloneResult = { ...mockWorkflow, id: 'wf-clone', code: 'LEAD_FLOW_COPY_123' };

    prisma.workflow.findUnique.mockResolvedValue(source);
    prisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        workflow: { create: jest.fn().mockResolvedValue(cloneResult) },
        workflowState: { create: jest.fn().mockResolvedValue({ id: 'st-clone', ...source.states[0] }) },
        workflowTransition: { create: jest.fn() },
      };
      return fn(tx);
    });

    const cmd = new CloneWorkflowCommand('wf-1', 'user-1');
    const result = await handler.execute(cmd);
    expect(result.id).toBe('wf-clone');
  });

  it('throws NotFoundException when source workflow not found', async () => {
    prisma.workflow.findUnique.mockResolvedValue(null);
    const cmd = new CloneWorkflowCommand('bad-id', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── RemoveStateHandler ───────────────────────────────────────────────────────

describe('RemoveStateHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: RemoveStateHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new RemoveStateHandler(prisma);
  });

  it('removes state when not used in transitions or instances', async () => {
    prisma.workflowState.findUnique.mockResolvedValue(mockState);
    prisma.workflowTransition.count.mockResolvedValue(0);
    prisma.workflowInstance.count.mockResolvedValue(0);
    prisma.workflowState.delete.mockResolvedValue(mockState);

    const cmd = new RemoveStateCommand('st-1');
    const result = await handler.execute(cmd);
    expect(result).toEqual({ deleted: true });
    expect(prisma.workflowState.delete).toHaveBeenCalledWith({ where: { id: 'st-1' } });
  });

  it('throws NotFoundException when state not found', async () => {
    prisma.workflowState.findUnique.mockResolvedValue(null);
    const cmd = new RemoveStateCommand('bad-st');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when state is used in transitions', async () => {
    prisma.workflowState.findUnique.mockResolvedValue(mockState);
    prisma.workflowTransition.count.mockResolvedValue(2);
    const cmd = new RemoveStateCommand('st-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when state is used by active instances', async () => {
    prisma.workflowState.findUnique.mockResolvedValue(mockState);
    prisma.workflowTransition.count.mockResolvedValue(0);
    prisma.workflowInstance.count.mockResolvedValue(1);
    const cmd = new RemoveStateCommand('st-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });
});

// ─── RemoveTransitionHandler ──────────────────────────────────────────────────

describe('RemoveTransitionHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: RemoveTransitionHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new RemoveTransitionHandler(prisma);
  });

  it('removes transition when found', async () => {
    prisma.workflowTransition.findUnique.mockResolvedValue(mockTransition);
    prisma.workflowTransition.delete.mockResolvedValue(mockTransition);

    const cmd = new RemoveTransitionCommand('tr-1');
    const result = await handler.execute(cmd);
    expect(result).toEqual({ deleted: true });
    expect(prisma.workflowTransition.delete).toHaveBeenCalledWith({ where: { id: 'tr-1' } });
  });

  it('throws NotFoundException when transition not found', async () => {
    prisma.workflowTransition.findUnique.mockResolvedValue(null);
    const cmd = new RemoveTransitionCommand('bad-tr');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── RollbackTransitionHandler ────────────────────────────────────────────────

describe('RollbackTransitionHandler', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let handler: RollbackTransitionHandler;

  beforeEach(() => {
    prisma = makePrisma();
    handler = new RollbackTransitionHandler(prisma);
  });

  it('rolls back instance to previousState', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
    prisma.user.findUnique.mockResolvedValue({ firstName: 'Alice', lastName: 'Smith' });
    prisma.workflowInstance.update.mockResolvedValue({});
    prisma.workflowHistory.create.mockResolvedValue({ id: 'hist-1' });

    const cmd = new RollbackTransitionCommand('inst-1', 'user-1', 'Mistake');
    const result = await handler.execute(cmd);

    expect(prisma.workflowInstance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'inst-1' },
        data: expect.objectContaining({ currentStateId: 'st-1', previousStateId: 'st-2' }),
      }),
    );
    expect(result.instanceId).toBe('inst-1');
    expect(result.rolledBackTo).toBe('NEW');
    expect(result.historyId).toBe('hist-1');
  });

  it('throws NotFoundException when instance not found', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(null);
    const cmd = new RollbackTransitionCommand('bad-id', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when instance is not active', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue({ ...mockInstance, isActive: false });
    const cmd = new RollbackTransitionCommand('inst-1', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when no previousStateId', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue({ ...mockInstance, previousStateId: null });
    const cmd = new RollbackTransitionCommand('inst-1', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });

  it('uses userId as performedByName when user not found', async () => {
    prisma.workflowInstance.findUnique.mockResolvedValue(mockInstance);
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.workflowInstance.update.mockResolvedValue({});
    prisma.workflowHistory.create.mockResolvedValue({ id: 'hist-2' });

    const cmd = new RollbackTransitionCommand('inst-1', 'user-orphan');
    await handler.execute(cmd);

    expect(prisma.workflowHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ performedByName: 'user-orphan' }),
      }),
    );
  });
});

// ─── ExecuteTransitionHandler ─────────────────────────────────────────────────

describe('ExecuteTransitionHandler', () => {
  let engine: ReturnType<typeof makeEngine>;
  let handler: ExecuteTransitionHandler;

  beforeEach(() => {
    engine = makeEngine();
    handler = new ExecuteTransitionHandler(engine);
  });

  it('delegates to engine.executeTransition', async () => {
    const transitionResult = { instanceId: 'inst-1', newState: 'QUALIFIED' };
    engine.executeTransition.mockResolvedValue(transitionResult);

    const cmd = new ExecuteTransitionCommand('inst-1', 'NEW_TO_QUALIFIED', 'user-1', 'OK');
    const result = await handler.execute(cmd);

    expect(engine.executeTransition).toHaveBeenCalledWith('inst-1', 'NEW_TO_QUALIFIED', 'user-1', 'OK', undefined);
    expect(result).toEqual(transitionResult);
  });

  it('propagates engine errors', async () => {
    engine.executeTransition.mockRejectedValue(new NotFoundException('Instance not found'));
    const cmd = new ExecuteTransitionCommand('bad-inst', 'CODE', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── InitializeWorkflowHandler ────────────────────────────────────────────────

describe('InitializeWorkflowHandler', () => {
  let engine: ReturnType<typeof makeEngine>;
  let handler: InitializeWorkflowHandler;

  beforeEach(() => {
    engine = makeEngine();
    handler = new InitializeWorkflowHandler(engine);
  });

  it('delegates to engine.initializeWorkflow', async () => {
    const initResult = { instanceId: 'inst-new', state: 'NEW' };
    engine.initializeWorkflow.mockResolvedValue(initResult);

    const cmd = new InitializeWorkflowCommand('LEAD', 'entity-1', 'user-1');
    const result = await handler.execute(cmd);

    expect(engine.initializeWorkflow).toHaveBeenCalledWith('LEAD', 'entity-1', 'user-1', undefined);
    expect(result).toEqual(initResult);
  });

  it('propagates engine errors', async () => {
    engine.initializeWorkflow.mockRejectedValue(new BadRequestException('No active workflow'));
    const cmd = new InitializeWorkflowCommand('UNKNOWN', 'entity-1', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(BadRequestException);
  });
});

// ─── ApproveTransitionHandler ─────────────────────────────────────────────────

describe('ApproveTransitionHandler', () => {
  let engine: ReturnType<typeof makeEngine>;
  let handler: ApproveTransitionHandler;

  beforeEach(() => {
    engine = makeEngine();
    handler = new ApproveTransitionHandler(engine);
  });

  it('delegates to engine.approveTransition', async () => {
    engine.approveTransition.mockResolvedValue({ status: 'APPROVED' });
    const cmd = new ApproveTransitionCommand('appr-1', 'user-1', 'Looks good');
    const result = await handler.execute(cmd);
    expect(engine.approveTransition).toHaveBeenCalledWith('appr-1', 'user-1', 'Looks good');
    expect(result.status).toBe('APPROVED');
  });

  it('propagates engine errors', async () => {
    engine.approveTransition.mockRejectedValue(new NotFoundException('Approval not found'));
    const cmd = new ApproveTransitionCommand('bad-id', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});

// ─── RejectTransitionHandler ──────────────────────────────────────────────────

describe('RejectTransitionHandler', () => {
  let engine: ReturnType<typeof makeEngine>;
  let handler: RejectTransitionHandler;

  beforeEach(() => {
    engine = makeEngine();
    handler = new RejectTransitionHandler(engine);
  });

  it('delegates to engine.rejectTransition', async () => {
    engine.rejectTransition.mockResolvedValue({ status: 'REJECTED' });
    const cmd = new RejectTransitionCommand('appr-1', 'user-1', 'Needs work');
    const result = await handler.execute(cmd);
    expect(engine.rejectTransition).toHaveBeenCalledWith('appr-1', 'user-1', 'Needs work');
    expect(result.status).toBe('REJECTED');
  });

  it('propagates engine errors', async () => {
    engine.rejectTransition.mockRejectedValue(new NotFoundException('Approval not found'));
    const cmd = new RejectTransitionCommand('bad-id', 'user-1');
    await expect(handler.execute(cmd)).rejects.toThrow(NotFoundException);
  });
});
