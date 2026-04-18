import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateRuleDto } from './dto/create-rule.dto';
import { AutoAssignDto } from './dto/auto-assign.dto';
import { RuleEngineService } from '../services/rule-engine.service';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export declare class OwnershipRulesController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly ruleEngine;
    private readonly prisma;
    constructor(commandBus: CommandBus, queryBus: QueryBus, ruleEngine: RuleEngineService, prisma: PrismaService);
    createRule(dto: CreateRuleDto, userId: string): Promise<ApiResponse<any>>;
    listRules(query: any): Promise<ApiResponse<unknown[]>>;
    getRule(id: string): Promise<ApiResponse<{
        id: string;
        tenantId: string;
        name: string;
        entityType: import("@prisma/working-client").$Enums.EntityType;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        conditions: import("@prisma/working-client/runtime/library").JsonValue;
        status: import("@prisma/working-client").$Enums.AssignmentRuleStatus;
        priority: number;
        lastAssignedIndex: number;
        triggerEvent: string;
        assignmentMethod: import("@prisma/working-client").$Enums.AssignmentMethod;
        assignToUserId: string | null;
        assignToTeamIds: string[];
        assignToRoleId: string | null;
        ownerType: import("@prisma/working-client").$Enums.OwnerType;
        maxPerUser: number | null;
        respectWorkload: boolean;
        escalateAfterHours: number | null;
        escalateToUserId: string | null;
        escalateToRoleId: string | null;
        executionCount: number;
        lastExecutedAt: Date | null;
    } | null>>;
    updateRule(id: string, dto: any): Promise<ApiResponse<any>>;
    deleteRule(id: string): Promise<ApiResponse<null>>;
    testRule(id: string, dto: {
        entityType: string;
        entityId: string;
    }): Promise<ApiResponse<{
        ruleMatches: boolean;
        reason: string;
        conditionResults: never[];
        wouldAssignTo?: undefined;
    } | {
        ruleMatches: boolean;
        conditionResults: {
            field: any;
            operator: any;
            expected: any;
            actual: Record<string, unknown>;
            passed: boolean;
        }[];
        wouldAssignTo: any;
        reason: string;
    }>>;
    autoAssign(dto: AutoAssignDto, userId: string): Promise<ApiResponse<any>>;
}
