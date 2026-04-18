import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateLeadDto } from './dto/create-lead.dto';
import { QuickCreateLeadDto } from './dto/quick-create-lead.dto';
import { AllocateLeadDto } from './dto/allocate-lead.dto';
import { ChangeLeadStatusDto } from './dto/change-lead-status.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadQueryDto } from './dto/lead-query.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
import { WorkflowEngineService } from '../../../../core/workflow/workflow-engine.service';
export declare class LeadsController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly workflowEngine;
    constructor(commandBus: CommandBus, queryBus: QueryBus, workflowEngine: WorkflowEngineService);
    quickCreate(dto: QuickCreateLeadDto, userId: string): Promise<ApiResponse<any>>;
    create(dto: CreateLeadDto, userId: string): Promise<ApiResponse<any>>;
    findAll(query: LeadQueryDto): Promise<ApiResponse<unknown[]>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateLeadDto): Promise<ApiResponse<any>>;
    allocate(id: string, dto: AllocateLeadDto): Promise<ApiResponse<any>>;
    changeStatus(id: string, dto: ChangeLeadStatusDto): Promise<ApiResponse<any>>;
    getTransitions(id: string): Promise<ApiResponse<{
        currentStatus: any;
        validNextStatuses: any;
        isTerminal: any;
    }>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    reactivate(id: string): Promise<ApiResponse<any>>;
    softDelete(id: string, userId: string): Promise<ApiResponse<any>>;
    restore(id: string): Promise<ApiResponse<any>>;
    getWorkflowStatus(id: string, userId: string): Promise<ApiResponse<import("../../../../core/workflow/interfaces/workflow-types.interface").EntityStatus | null>>;
    getWorkflowTransitions(id: string, userId: string): Promise<ApiResponse<import("../../../../core/workflow/interfaces/workflow-types.interface").AvailableTransition[]>>;
    executeWorkflowTransition(id: string, body: {
        transitionCode: string;
        comment?: string;
    }, userId: string): Promise<ApiResponse<null> | ApiResponse<import("../../../../core/workflow/interfaces/workflow-types.interface").TransitionResult>>;
    getWorkflowHistory(id: string): Promise<ApiResponse<({
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
    })[]>>;
    permanentDelete(id: string): Promise<ApiResponse<{
        id: string;
        deleted: boolean;
    }>>;
}
