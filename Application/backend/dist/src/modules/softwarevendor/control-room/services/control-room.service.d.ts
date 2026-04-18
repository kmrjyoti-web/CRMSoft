import { PrismaService } from '../../../../core/prisma/prisma.service';
import { RuleResolverService } from './rule-resolver.service';
export interface UpdateRuleContext {
    userId: string;
    userName: string;
    ipAddress?: string;
}
export interface AuditQueryOptions {
    page?: number;
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    level?: string;
    changedByUserId?: string;
}
export declare class ControlRoomService {
    private readonly prisma;
    private readonly ruleResolver;
    private readonly logger;
    constructor(prisma: PrismaService, ruleResolver: RuleResolverService);
    getRulesGrouped(tenantId: string): Promise<Record<string, unknown[]>>;
    updateRule(tenantId: string, ruleCode: string, newValue: any, level: string, context: UpdateRuleContext & {
        pageCode?: string;
        roleId?: string;
        targetUserId?: string;
        changeReason?: string;
    }): Promise<any>;
    getAuditTrail(tenantId: string, ruleCode?: string, options?: AuditQueryOptions): Promise<{
        data: any;
        meta: {
            total: any;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    resetRule(tenantId: string, ruleCode: string, level: string, context: UpdateRuleContext & {
        pageCode?: string;
        roleId?: string;
        targetUserId?: string;
        changeReason?: string;
    }): Promise<{
        ruleCode: string;
        level: string;
        status: string;
    }>;
    saveDraft(tenantId: string, ruleCode: string, newValue: any, level: string, context: UpdateRuleContext): Promise<{
        ruleCode: string;
        newValue: any;
        status: string;
    }>;
    getPendingDrafts(tenantId: string): Promise<({
        rule: {
            valueType: string;
            label: string;
            selectOptions: import("@prisma/working-client/runtime/library").JsonValue;
        };
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: string;
        level: string;
        roleId: string | null;
        userId: string | null;
        newValue: string;
        ruleId: string;
        ruleCode: string;
        pageCode: string | null;
        previousValue: string | null;
        createdByUserId: string;
        createdByUserName: string | null;
        appliedAt: Date | null;
    })[]>;
    discardDraft(tenantId: string, draftId: string): Promise<void>;
    discardAllDrafts(tenantId: string): Promise<void>;
    applyAllDrafts(tenantId: string, context: UpdateRuleContext & {
        changeReason: string;
    }): Promise<{
        appliedCount: number;
        changes: {
            ruleCode: string;
            label: string;
            previousValue: string | null;
            newValue: string;
        }[];
    }>;
}
