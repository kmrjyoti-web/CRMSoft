import { ApiResponse } from '../../../../common/utils/api-response';
import { ControlRoomService } from '../services/control-room.service';
import { RuleResolverService } from '../services/rule-resolver.service';
import { UpdateRuleDto, ResetRuleDto, AuditQueryDto } from './dto/control-room.dto';
export declare class ControlRoomController {
    private readonly controlRoomService;
    private readonly ruleResolver;
    constructor(controlRoomService: ControlRoomService, ruleResolver: RuleResolverService);
    getRulesGrouped(tenantId: string): Promise<ApiResponse<Record<string, unknown[]>>>;
    resolveAllRules(user: any): Promise<ApiResponse<Record<string, import("../services/rule-resolver.service").ResolvedRule>>>;
    getCacheVersion(tenantId: string): Promise<ApiResponse<{
        version: number;
        lastChangedAt: Date;
    }>>;
    resolveRule(user: any, ruleCode: string, pageCode?: string): Promise<ApiResponse<null> | ApiResponse<import("../services/rule-resolver.service").ResolvedRule>>;
    updateRule(user: any, ruleCode: string, dto: UpdateRuleDto, req: any): Promise<ApiResponse<any>>;
    resetRule(user: any, ruleCode: string, dto: ResetRuleDto, req: any): Promise<ApiResponse<{
        ruleCode: string;
        level: string;
        status: string;
    }>>;
    getAuditTrail(tenantId: string, query: AuditQueryDto): Promise<ApiResponse<any>>;
    getAuditTrailForRule(tenantId: string, ruleCode: string, query: AuditQueryDto): Promise<ApiResponse<any>>;
    saveDraft(ruleCode: string, dto: UpdateRuleDto, user: any): Promise<ApiResponse<{
        ruleCode: string;
        newValue: any;
        status: string;
    }>>;
    getPendingDrafts(user: any): Promise<ApiResponse<({
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
    })[]>>;
    discardDraft(draftId: string, user: any): Promise<ApiResponse<{
        discarded: boolean;
    }>>;
    discardAllDrafts(user: any): Promise<ApiResponse<{
        discarded: boolean;
    }>>;
    applyAllDrafts(body: {
        changeReason: string;
    }, user: any, req: any): Promise<ApiResponse<{
        appliedCount: number;
        changes: {
            ruleCode: string;
            label: string;
            previousValue: string | null;
            newValue: string;
        }[];
    }>>;
}
