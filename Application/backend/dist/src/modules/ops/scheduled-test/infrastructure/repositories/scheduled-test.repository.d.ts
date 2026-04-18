import { PrismaService } from "../../../../../core/prisma/prisma.service";
export declare const SCHEDULED_TEST_REPOSITORY: unique symbol;
export interface IScheduledTestRepository {
    create(data: CreateScheduledTestData): Promise<Record<string, unknown>>;
    findById(id: string): Promise<any | null>;
    findByTenantId(tenantId: string, filters?: ListFilters): Promise<{
        data: Record<string, unknown>[];
        total: number;
    }>;
    findDue(): Promise<any[]>;
    update(id: string, data: UpdateScheduledTestData): Promise<Record<string, unknown>>;
    softDelete(id: string): Promise<void>;
}
export interface CreateScheduledTestData {
    tenantId: string;
    name: string;
    description?: string;
    cronExpression: string;
    targetModules: string[];
    testTypes: string[];
    dbSourceType?: string;
    createdById: string;
    nextRunAt?: Date;
}
export interface UpdateScheduledTestData {
    name?: string;
    description?: string;
    cronExpression?: string;
    targetModules?: string[];
    testTypes?: string[];
    dbSourceType?: string;
    isActive?: boolean;
    lastRunAt?: Date;
    nextRunAt?: Date;
    lastRunStatus?: string;
}
export interface ListFilters {
    isActive?: boolean;
    page?: number;
    limit?: number;
}
export declare class PrismaScheduledTestRepository implements IScheduledTestRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateScheduledTestData): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        cronExpression: string;
        lastRunAt: Date | null;
        lastRunStatus: import("@prisma/platform-client").$Enums.TestRunStatus | null;
        nextRunAt: Date | null;
        testTypes: string[];
        targetModules: string[];
        dbSourceType: import("@prisma/platform-client").$Enums.TestEnvSourceType;
    }>;
    findById(id: string): Promise<({
        runs: {
            id: string;
            status: import("@prisma/platform-client").$Enums.TestRunStatus;
            errorMessage: string | null;
            completedAt: Date | null;
            startedAt: Date;
            testEnvId: string | null;
            testRunId: string | null;
            scheduledTestId: string;
            backupRecordId: string | null;
        }[];
    } & {
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        cronExpression: string;
        lastRunAt: Date | null;
        lastRunStatus: import("@prisma/platform-client").$Enums.TestRunStatus | null;
        nextRunAt: Date | null;
        testTypes: string[];
        targetModules: string[];
        dbSourceType: import("@prisma/platform-client").$Enums.TestEnvSourceType;
    }) | null>;
    findByTenantId(tenantId: string, filters?: ListFilters): Promise<{
        data: ({
            runs: {
                id: string;
                status: import("@prisma/platform-client").$Enums.TestRunStatus;
                errorMessage: string | null;
                completedAt: Date | null;
                startedAt: Date;
                testEnvId: string | null;
                testRunId: string | null;
                scheduledTestId: string;
                backupRecordId: string | null;
            }[];
        } & {
            id: string;
            tenantId: string;
            name: string;
            description: string | null;
            isActive: boolean;
            createdById: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            cronExpression: string;
            lastRunAt: Date | null;
            lastRunStatus: import("@prisma/platform-client").$Enums.TestRunStatus | null;
            nextRunAt: Date | null;
            testTypes: string[];
            targetModules: string[];
            dbSourceType: import("@prisma/platform-client").$Enums.TestEnvSourceType;
        })[];
        total: number;
    }>;
    findDue(): Promise<any[]>;
    update(id: string, data: UpdateScheduledTestData): Promise<{
        id: string;
        tenantId: string;
        name: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        cronExpression: string;
        lastRunAt: Date | null;
        lastRunStatus: import("@prisma/platform-client").$Enums.TestRunStatus | null;
        nextRunAt: Date | null;
        testTypes: string[];
        targetModules: string[];
        dbSourceType: import("@prisma/platform-client").$Enums.TestEnvSourceType;
    }>;
    softDelete(id: string): Promise<void>;
}
