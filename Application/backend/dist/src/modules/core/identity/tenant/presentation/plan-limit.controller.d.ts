import { PlanLimitService } from '../services/plan-limit.service';
import { UpsertPlanLimitsDto } from './dto/upsert-plan-limits.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class PlanLimitController {
    private readonly planLimitService;
    constructor(planLimitService: PlanLimitService);
    getLimits(planId: string): Promise<ApiResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        resourceKey: string;
        limitType: import("@prisma/identity-client").$Enums.LimitType;
        isChargeable: boolean;
        chargeTokens: number;
        limitValue: number;
    }[]>>;
    upsertLimits(planId: string, dto: UpsertPlanLimitsDto): Promise<ApiResponse<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        planId: string;
        resourceKey: string;
        limitType: import("@prisma/identity-client").$Enums.LimitType;
        isChargeable: boolean;
        chargeTokens: number;
        limitValue: number;
    }[]>>;
    deleteLimit(planId: string, limitId: string): Promise<ApiResponse<null>>;
}
