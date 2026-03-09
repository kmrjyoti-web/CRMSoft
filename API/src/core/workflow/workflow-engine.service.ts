import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConditionEvaluatorService } from './condition-evaluator.service';
import { ActionExecutorService } from './action-executor.service';
import { WorkflowActionContext } from './interfaces/action-handler.interface';
import { AvailableTransition, EntityStatus, TransitionResult } from './interfaces/workflow-types.interface';

@Injectable()
export class WorkflowEngineService {
  private readonly logger = new Logger(WorkflowEngineService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly conditionEvaluator: ConditionEvaluatorService,
    private readonly actionExecutor: ActionExecutorService,
  ) {}

  async initializeWorkflow(
    entityType: string, entityId: string, userId: string, workflowId?: string,
  ) {
    const workflow = workflowId
      ? await this.prisma.workflow.findUnique({ where: { id: workflowId }, include: { states: true } })
      : await this.prisma.workflow.findFirst({
          where: { entityType, isDefault: true, isActive: true },
          include: { states: true },
        });

    if (!workflow) throw new NotFoundException(`No workflow found for entity type "${entityType}"`);

    const existing = await this.prisma.workflowInstance.findFirst({
      where: { entityType, entityId, workflowId: workflow.id },
    });
    if (existing?.isActive) throw new ConflictException('Active workflow instance already exists');

    const initialState = workflow.states.find((s) => s.stateType === 'INITIAL');
    if (!initialState) throw new BadRequestException('Workflow has no INITIAL state');

    const user = await this.prisma.user.findUnique({
      where: { id: userId }, select: { firstName: true, lastName: true },
    });

    const instance = await this.prisma.workflowInstance.create({
      data: {
        workflowId: workflow.id, entityType, entityId,
        currentStateId: initialState.id, data: {},
      },
      include: { currentState: true, workflow: { select: { name: true } } },
    });

    await this.prisma.workflowHistory.create({
      data: {
        instanceId: instance.id, toStateId: initialState.id,
        action: 'INITIALIZE', performedById: userId,
        performedByName: user ? `${user.firstName} ${user.lastName}` : userId,
      },
    });

    this.logger.log(`Initialized workflow "${workflow.name}" for ${entityType}/${entityId}`);
    return instance;
  }

  async executeTransition(
    instanceId: string, transitionCode: string, userId: string,
    comment?: string, data?: Record<string, any>,
  ): Promise<TransitionResult> {
    const instance = await this.loadInstance(instanceId);
    const transition = await this.prisma.workflowTransition.findFirst({
      where: { workflowId: instance.workflowId, code: transitionCode, fromStateId: instance.currentStateId, isActive: true },
      include: { toState: true },
    });
    if (!transition) throw new NotFoundException(`Transition "${transitionCode}" not available from current state`);

    const entityData = await this.fetchEntityData(instance.entityType, instance.entityId);
    if (!this.conditionEvaluator.evaluate(transition.conditions as any, entityData)) {
      throw new BadRequestException('Transition conditions not met');
    }

    if (transition.triggerType === 'APPROVAL') {
      await this.prisma.workflowApproval.create({
        data: {
          instanceId, transitionId: transition.id, requestedById: userId,
          status: 'PENDING', comment,
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        },
      });
      return { instanceId, fromState: instance.currentState.code, toState: transition.toState.code, action: 'APPROVAL_REQUESTED', historyId: '' };
    }

    return this.performTransition(instance, transition, userId, comment, entityData);
  }

  async getAvailableTransitions(instanceId: string, userId?: string): Promise<AvailableTransition[]> {
    const instance = await this.loadInstance(instanceId);
    const transitions = await this.prisma.workflowTransition.findMany({
      where: { workflowId: instance.workflowId, fromStateId: instance.currentStateId, isActive: true },
      include: { toState: { select: { id: true, name: true, code: true, color: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    const entityData = await this.fetchEntityData(instance.entityType, instance.entityId);
    const result: AvailableTransition[] = [];
    for (const t of transitions) {
      if (this.conditionEvaluator.evaluate(t.conditions as any, entityData)) {
        result.push({ id: t.id, code: t.code, name: t.name, triggerType: t.triggerType, toState: t.toState });
      }
    }
    return result;
  }

  async approveTransition(approvalId: string, userId: string, comment?: string) {
    const approval = await this.prisma.workflowApproval.findUnique({
      where: { id: approvalId }, include: { transition: { include: { toState: true } }, instance: { include: { currentState: true } } },
    });
    if (!approval) throw new NotFoundException('Approval not found');
    if (approval.status !== 'PENDING') throw new BadRequestException(`Approval already ${approval.status}`);
    if (approval.requestedById === userId) throw new BadRequestException('Cannot approve own request');

    await this.prisma.workflowApproval.update({
      where: { id: approvalId }, data: { status: 'APPROVED', approvedById: userId, comment, decidedAt: new Date() },
    });

    const entityData = await this.fetchEntityData(approval.instance.entityType, approval.instance.entityId);
    return this.performTransition(approval.instance, approval.transition, userId, comment, entityData);
  }

  async rejectTransition(approvalId: string, userId: string, comment?: string) {
    const approval = await this.prisma.workflowApproval.findUnique({ where: { id: approvalId } });
    if (!approval) throw new NotFoundException('Approval not found');
    if (approval.status !== 'PENDING') throw new BadRequestException(`Approval already ${approval.status}`);

    return this.prisma.workflowApproval.update({
      where: { id: approvalId }, data: { status: 'REJECTED', approvedById: userId, comment, decidedAt: new Date() },
    });
  }

  async getEntityStatus(entityType: string, entityId: string): Promise<EntityStatus | null> {
    const instance = await this.prisma.workflowInstance.findFirst({
      where: { entityType, entityId, isActive: true },
      include: { workflow: { select: { id: true, name: true } }, currentState: true, previousState: true },
    });
    if (!instance) return null;
    return {
      instanceId: instance.id, workflowId: instance.workflow.id, workflowName: instance.workflow.name,
      currentState: {
        id: instance.currentState.id, name: instance.currentState.name, code: instance.currentState.code,
        stateType: instance.currentState.stateType, category: instance.currentState.category, color: instance.currentState.color,
      },
      previousState: instance.previousState ? { id: instance.previousState.id, name: instance.previousState.name, code: instance.previousState.code } : null,
      startedAt: instance.startedAt, completedAt: instance.completedAt, isActive: instance.isActive,
    };
  }

  async fastForwardToState(instanceId: string, targetStateCode: string, userId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId },
      include: { workflow: { include: { states: true } } },
    });
    if (!instance) throw new NotFoundException(`Workflow instance "${instanceId}" not found`);

    const targetState = instance.workflow.states.find((s) => s.code === targetStateCode);
    if (!targetState) throw new BadRequestException(`State "${targetStateCode}" not found in workflow`);

    const user = await this.prisma.user.findUnique({
      where: { id: userId }, select: { firstName: true, lastName: true },
    });

    await this.prisma.workflowInstance.update({
      where: { id: instanceId },
      data: {
        currentStateId: targetState.id,
        previousStateId: instance.currentStateId,
        ...(targetState.stateType === 'TERMINAL' ? { completedAt: new Date(), isActive: false } : {}),
      },
    });

    await this.prisma.workflowHistory.create({
      data: {
        instanceId, fromStateId: instance.currentStateId, toStateId: targetState.id,
        action: 'FAST_FORWARD', performedById: userId,
        performedByName: user ? `${user.firstName} ${user.lastName}` : userId,
        comment: `Fast-forwarded to "${targetState.name}" during lazy initialization`,
      },
    });

    this.logger.log(`Fast-forwarded instance ${instanceId} to state "${targetStateCode}"`);
  }

  async getInstanceHistory(instanceId: string) {
    return this.prisma.workflowHistory.findMany({
      where: { instanceId },
      include: {
        fromState: { select: { id: true, name: true, code: true, color: true } },
        toState: { select: { id: true, name: true, code: true, color: true } },
        transition: { select: { id: true, name: true, code: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async performTransition(instance: any, transition: any, userId: string, comment?: string, entityData?: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true, email: true } });
    const performerName = user ? `${user.firstName} ${user.lastName}` : userId;
    const isTerminal = transition.toState.stateType === 'TERMINAL';

    const updated = await this.prisma.workflowInstance.update({
      where: { id: instance.id },
      data: {
        currentStateId: transition.toStateId, previousStateId: instance.currentStateId,
        ...(isTerminal ? { completedAt: new Date(), isActive: false } : {}),
      },
    });

    const history = await this.prisma.workflowHistory.create({
      data: {
        instanceId: instance.id, fromStateId: instance.currentStateId, toStateId: transition.toStateId,
        transitionId: transition.id, action: 'TRANSITION', performedById: userId, performedByName: performerName, comment,
      },
    });

    const context: WorkflowActionContext = {
      instanceId: instance.id, entityType: instance.entityType, entityId: instance.entityId,
      entity: entityData || {}, performer: { id: userId, firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' },
      currentState: { name: transition.toState.name, code: transition.toState.code },
      previousState: instance.currentState ? { name: instance.currentState.name, code: instance.currentState.code } : undefined,
      timestamp: new Date(),
    };
    this.actionExecutor.executeAll(transition.actions as any[], context, instance.id, transition.id).catch((err) => {
      this.logger.error(`Action execution error: ${err.message}`);
    });

    return { instanceId: instance.id, fromState: instance.currentState?.code, toState: transition.toState.code, action: 'TRANSITION', historyId: history.id };
  }

  private async loadInstance(instanceId: string) {
    const instance = await this.prisma.workflowInstance.findUnique({
      where: { id: instanceId }, include: { currentState: true, workflow: true },
    });
    if (!instance) throw new NotFoundException(`Workflow instance "${instanceId}" not found`);
    if (!instance.isActive) throw new BadRequestException('Workflow instance is completed');
    return instance;
  }

  private async fetchEntityData(entityType: string, entityId: string): Promise<Record<string, any>> {
    const tableMap: Record<string, string> = {
      LEAD: 'lead', CONTACT: 'contact', ORGANIZATION: 'organization',
      DEMO: 'demo', TOUR_PLAN: 'tourPlan', QUOTATION: 'quotation',
    };
    const table = tableMap[entityType];
    if (!table) return {};
    try {
      return await (this.prisma as any)[table].findUnique({ where: { id: entityId } }) || {};
    } catch {
      return {};
    }
  }
}
