import { ApiResponse } from '../../../../common/utils/api-response';
import { DevQANotionService } from '../services/dev-qa-notion.service';
import { PrismaService } from "../../../../core/prisma/prisma.service";
export declare class DevQAController {
    private readonly devQAService;
    private readonly prisma;
    constructor(devQAService: DevQANotionService, prisma: PrismaService);
    generatePlan(user: any, name: string, modules?: string[]): Promise<ApiResponse<{
        planId: string;
        itemCount: number;
    }>>;
    syncToNotion(planId: string, user: any): Promise<ApiResponse<{
        notionUrl: string;
        syncedCount: number;
    }>>;
    pullFromNotion(planId: string, user: any): Promise<ApiResponse<{
        updated: number;
    }>>;
    getDashboard(user: any): Promise<ApiResponse<{
        plans: {
            id: string;
            name: string;
            createdAt: Date;
            status: import("@prisma/platform-client").$Enums.TestPlanStatus;
            totalItems: number;
            progress: number;
            passedItems: number;
            failedItems: number;
            notionSyncedAt: Date | null;
        }[];
        stats: {
            totalItems: number;
            passedItems: number;
            failedItems: number;
            notStarted: number;
            overallPassRate: number;
        };
    }>>;
    listPlans(user: any, page?: number, limit?: number): Promise<ApiResponse<{
        data: {
            id: string;
            name: string;
            description: string | null;
            createdAt: Date;
            status: import("@prisma/platform-client").$Enums.TestPlanStatus;
            totalItems: number;
            progress: number;
            passedItems: number;
            failedItems: number;
            notionPageId: string | null;
            notionSyncedAt: Date | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
        };
    }>>;
}
