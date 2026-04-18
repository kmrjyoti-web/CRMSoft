"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WorkflowEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const condition_evaluator_service_1 = require("./condition-evaluator.service");
const action_executor_service_1 = require("./action-executor.service");
let WorkflowEngineService = WorkflowEngineService_1 = class WorkflowEngineService {
    constructor(prisma, conditionEvaluator, actionExecutor) {
        this.prisma = prisma;
        this.conditionEvaluator = conditionEvaluator;
        this.actionExecutor = actionExecutor;
        this.logger = new common_1.Logger(WorkflowEngineService_1.name);
    }
    async initializeWorkflow(entityType, entityId, userId, workflowId) {
        const workflow = workflowId
            ? await this.prisma.working.workflow.findUnique({ where: { id: workflowId }, include: { states: true } })
            : await this.prisma.working.workflow.findFirst({
                where: { entityType, isDefault: true, isActive: true },
                include: { states: true },
            });
        if (!workflow)
            throw new common_1.NotFoundException(`No workflow found for entity type "${entityType}"`);
        const existing = await this.prisma.working.workflowInstance.findFirst({
            where: { entityType, entityId, workflowId: workflow.id },
        });
        if (existing?.isActive)
            throw new common_1.ConflictException('Active workflow instance already exists');
        const initialState = workflow.states.find((s) => s.stateType === 'INITIAL');
        if (!initialState)
            throw new common_1.BadRequestException('Workflow has no INITIAL state');
        const user = await this.prisma.user.findUnique({
            where: { id: userId }, select: { firstName: true, lastName: true },
        });
        const instance = await this.prisma.working.workflowInstance.create({
            data: {
                workflowId: workflow.id, entityType, entityId,
                currentStateId: initialState.id, data: {},
            },
            include: { currentState: true, workflow: { select: { name: true } } },
        });
        await this.prisma.working.workflowHistory.create({
            data: {
                instanceId: instance.id, toStateId: initialState.id,
                action: 'INITIALIZE', performedById: userId,
                performedByName: user ? `${user.firstName} ${user.lastName}` : userId,
            },
        });
        this.logger.log(`Initialized workflow "${workflow.name}" for ${entityType}/${entityId}`);
        return instance;
    }
    async executeTransition(instanceId, transitionCode, userId, comment, data) {
        const instance = await this.loadInstance(instanceId);
        const transition = await this.prisma.working.workflowTransition.findFirst({
            where: { workflowId: instance.workflowId, code: transitionCode, fromStateId: instance.currentStateId, isActive: true },
            include: { toState: true },
        });
        if (!transition)
            throw new common_1.NotFoundException(`Transition "${transitionCode}" not available from current state`);
        const entityData = await this.fetchEntityData(instance.entityType, instance.entityId);
        if (!this.conditionEvaluator.evaluate(transition.conditions, entityData)) {
            throw new common_1.BadRequestException('Transition conditions not met');
        }
        if (transition.triggerType === 'APPROVAL') {
            await this.prisma.working.workflowApproval.create({
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
    async getAvailableTransitions(instanceId, userId) {
        const instance = await this.loadInstance(instanceId);
        const transitions = await this.prisma.working.workflowTransition.findMany({
            where: { workflowId: instance.workflowId, fromStateId: instance.currentStateId, isActive: true },
            include: { toState: { select: { id: true, name: true, code: true, color: true } } },
            orderBy: { sortOrder: 'asc' },
        });
        const entityData = await this.fetchEntityData(instance.entityType, instance.entityId);
        const result = [];
        for (const t of transitions) {
            if (this.conditionEvaluator.evaluate(t.conditions, entityData)) {
                result.push({ id: t.id, code: t.code, name: t.name, triggerType: t.triggerType, toState: t.toState });
            }
        }
        return result;
    }
    async approveTransition(approvalId, userId, comment) {
        const approval = await this.prisma.working.workflowApproval.findUnique({
            where: { id: approvalId }, include: { transition: { include: { toState: true } }, instance: { include: { currentState: true } } },
        });
        if (!approval)
            throw new common_1.NotFoundException('Approval not found');
        if (approval.status !== 'PENDING')
            throw new common_1.BadRequestException(`Approval already ${approval.status}`);
        if (approval.requestedById === userId)
            throw new common_1.BadRequestException('Cannot approve own request');
        await this.prisma.working.workflowApproval.update({
            where: { id: approvalId }, data: { status: 'APPROVED', approvedById: userId, comment, decidedAt: new Date() },
        });
        const entityData = await this.fetchEntityData(approval.instance.entityType, approval.instance.entityId);
        return this.performTransition(approval.instance, approval.transition, userId, comment, entityData);
    }
    async rejectTransition(approvalId, userId, comment) {
        const approval = await this.prisma.working.workflowApproval.findUnique({ where: { id: approvalId } });
        if (!approval)
            throw new common_1.NotFoundException('Approval not found');
        if (approval.status !== 'PENDING')
            throw new common_1.BadRequestException(`Approval already ${approval.status}`);
        return this.prisma.working.workflowApproval.update({
            where: { id: approvalId }, data: { status: 'REJECTED', approvedById: userId, comment, decidedAt: new Date() },
        });
    }
    async getEntityStatus(entityType, entityId) {
        const instance = await this.prisma.working.workflowInstance.findFirst({
            where: { entityType, entityId, isActive: true },
            include: { workflow: { select: { id: true, name: true } }, currentState: true, previousState: true },
        });
        if (!instance)
            return null;
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
    async fastForwardToState(instanceId, targetStateCode, userId) {
        const instance = await this.prisma.working.workflowInstance.findUnique({
            where: { id: instanceId },
            include: { workflow: { include: { states: true } } },
        });
        if (!instance)
            throw new common_1.NotFoundException(`Workflow instance "${instanceId}" not found`);
        const targetState = instance.workflow.states.find((s) => s.code === targetStateCode);
        if (!targetState)
            throw new common_1.BadRequestException(`State "${targetStateCode}" not found in workflow`);
        const user = await this.prisma.user.findUnique({
            where: { id: userId }, select: { firstName: true, lastName: true },
        });
        await this.prisma.working.workflowInstance.update({
            where: { id: instanceId },
            data: {
                currentStateId: targetState.id,
                previousStateId: instance.currentStateId,
                ...(targetState.stateType === 'TERMINAL' ? { completedAt: new Date(), isActive: false } : {}),
            },
        });
        await this.prisma.working.workflowHistory.create({
            data: {
                instanceId, fromStateId: instance.currentStateId, toStateId: targetState.id,
                action: 'FAST_FORWARD', performedById: userId,
                performedByName: user ? `${user.firstName} ${user.lastName}` : userId,
                comment: `Fast-forwarded to "${targetState.name}" during lazy initialization`,
            },
        });
        this.logger.log(`Fast-forwarded instance ${instanceId} to state "${targetStateCode}"`);
    }
    async getInstanceHistory(instanceId) {
        return this.prisma.working.workflowHistory.findMany({
            where: { instanceId },
            include: {
                fromState: { select: { id: true, name: true, code: true, color: true } },
                toState: { select: { id: true, name: true, code: true, color: true } },
                transition: { select: { id: true, name: true, code: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async performTransition(instance, transition, userId, comment, entityData) {
        const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { firstName: true, lastName: true, email: true } });
        const performerName = user ? `${user.firstName} ${user.lastName}` : userId;
        const isTerminal = transition.toState.stateType === 'TERMINAL';
        const updated = await this.prisma.working.workflowInstance.update({
            where: { id: instance.id },
            data: {
                currentStateId: transition.toStateId, previousStateId: instance.currentStateId,
                ...(isTerminal ? { completedAt: new Date(), isActive: false } : {}),
            },
        });
        const history = await this.prisma.working.workflowHistory.create({
            data: {
                instanceId: instance.id, fromStateId: instance.currentStateId, toStateId: transition.toStateId,
                transitionId: transition.id, action: 'TRANSITION', performedById: userId, performedByName: performerName, comment,
            },
        });
        const context = {
            instanceId: instance.id, entityType: instance.entityType, entityId: instance.entityId,
            entity: entityData || {}, performer: { id: userId, firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' },
            currentState: { name: transition.toState.name, code: transition.toState.code },
            previousState: instance.currentState ? { name: instance.currentState.name, code: instance.currentState.code } : undefined,
            timestamp: new Date(),
        };
        this.actionExecutor.executeAll(transition.actions, context, instance.id, transition.id).catch((err) => {
            this.logger.error(`Action execution error: ${err.message}`);
        });
        return { instanceId: instance.id, fromState: instance.currentState?.code, toState: transition.toState.code, action: 'TRANSITION', historyId: history.id };
    }
    async loadInstance(instanceId) {
        const instance = await this.prisma.working.workflowInstance.findUnique({
            where: { id: instanceId }, include: { currentState: true, workflow: true },
        });
        if (!instance)
            throw new common_1.NotFoundException(`Workflow instance "${instanceId}" not found`);
        if (!instance.isActive)
            throw new common_1.BadRequestException('Workflow instance is completed');
        return instance;
    }
    async fetchEntityData(entityType, entityId) {
        const tableMap = {
            LEAD: 'lead', CONTACT: 'contact', ORGANIZATION: 'organization',
            DEMO: 'demo', TOUR_PLAN: 'tourPlan', QUOTATION: 'quotation',
        };
        const table = tableMap[entityType];
        if (!table)
            return {};
        try {
            return await this.prisma[table].findUnique({ where: { id: entityId } }) || {};
        }
        catch {
            return {};
        }
    }
};
exports.WorkflowEngineService = WorkflowEngineService;
exports.WorkflowEngineService = WorkflowEngineService = WorkflowEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        condition_evaluator_service_1.ConditionEvaluatorService,
        action_executor_service_1.ActionExecutorService])
], WorkflowEngineService);
//# sourceMappingURL=workflow-engine.service.js.map