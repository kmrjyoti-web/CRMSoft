import { PrismaService } from '../prisma/prisma.service';
import { ConditionEvaluatorService } from './condition-evaluator.service';
import { ActionExecutorService } from './action-executor.service';
import { AvailableTransition, EntityStatus, TransitionResult } from './interfaces/workflow-types.interface';
export declare class WorkflowEngineService {
    private readonly prisma;
    private readonly conditionEvaluator;
    private readonly actionExecutor;
    private readonly logger;
    constructor(prisma: PrismaService, conditionEvaluator: ConditionEvaluatorService, actionExecutor: ActionExecutorService);
    initializeWorkflow(entityType: string, entityId: string, userId: string, workflowId?: string): Promise<{
        workflow: {
            name: string;
        };
        currentState: {
            id: string;
            tenantId: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            category: import("@prisma/working-client").$Enums.WorkflowStateCategory | null;
            workflowId: string;
            stateType: import("@prisma/working-client").$Enums.WorkflowStateType;
            color: string | null;
            icon: string | null;
            sortOrder: number;
            metadata: import("@prisma/working-client/runtime/library").JsonValue | null;
        };
    } & {
        id: string;
        tenantId: string;
        entityType: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        workflowId: string;
        data: import("@prisma/working-client/runtime/library").JsonValue | null;
        completedAt: Date | null;
        entityId: string;
        currentStateId: string;
        previousStateId: string | null;
        startedAt: Date;
    }>;
    executeTransition(instanceId: string, transitionCode: string, userId: string, comment?: string, data?: Record<string, any>): Promise<TransitionResult>;
    getAvailableTransitions(instanceId: string, userId?: string): Promise<AvailableTransition[]>;
    approveTransition(approvalId: string, userId: string, comment?: string): Promise<{
        instanceId: any;
        fromState: any;
        toState: any;
        action: string;
        historyId: string;
    }>;
    rejectTransition(approvalId: string, userId: string, comment?: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.WorkflowApprovalStatus;
        comment: string | null;
        instanceId: string;
        transitionId: string;
        requestedById: string;
        approvedById: string | null;
        expiresAt: Date | null;
        decidedAt: Date | null;
    }>;
    getEntityStatus(entityType: string, entityId: string): Promise<EntityStatus | null>;
    fastForwardToState(instanceId: string, targetStateCode: string, userId: string): Promise<void>;
    getInstanceHistory(instanceId: string): Promise<({
        fromState: {
            id: string;
            name: string;
            code: string;
            color: string | null;
        } | null;
        toState: {
            id: string;
            name: string;
            code: string;
            color: string | null;
        };
        transition: {
            id: string;
            name: string;
            code: string;
        } | null;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        metadata: import("@prisma/working-client/runtime/library").JsonValue | null;
        fromStateId: string | null;
        toStateId: string;
        action: string;
        duration: number | null;
        comment: string | null;
        instanceId: string;
        transitionId: string | null;
        performedById: string;
        performedByName: string;
    })[]>;
    private performTransition;
    private loadInstance;
    private fetchEntityData;
}
