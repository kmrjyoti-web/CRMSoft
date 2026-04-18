import { PrismaService } from "../../../../../core/prisma/prisma.service";
export declare const MANUAL_TEST_LOG_REPOSITORY: unique symbol;
export interface IManualTestLogRepository {
    create(data: CreateManualTestLogData): Promise<Record<string, unknown>>;
    findById(id: string): Promise<any | null>;
    findByTenantId(tenantId: string, filters: ListFilters): Promise<any[]>;
    update(id: string, data: Partial<CreateManualTestLogData>): Promise<Record<string, unknown>>;
    getSummary(tenantId: string, filters: SummaryFilters): Promise<Record<string, unknown>>;
}
export interface CreateManualTestLogData {
    tenantId: string;
    userId: string;
    testRunId?: string;
    testGroupId?: string;
    module: string;
    pageName: string;
    action: string;
    expectedResult: string;
    actualResult: string;
    status: string;
    severity?: string;
    screenshotUrls?: string[];
    videoUrl?: string;
    notes?: string;
    browser?: string;
    os?: string;
    screenResolution?: string;
    bugReported?: boolean;
    bugId?: string;
}
export interface ListFilters {
    testRunId?: string;
    module?: string;
    status?: string;
    userId?: string;
    page?: number;
    limit?: number;
}
export interface SummaryFilters {
    testRunId?: string;
    from?: string;
    to?: string;
}
export declare class PrismaManualTestLogRepository implements IManualTestLogRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateManualTestLogData): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        action: string;
        module: string;
        userId: string;
        videoUrl: string | null;
        severity: string | null;
        testRunId: string | null;
        testGroupId: string | null;
        pageName: string;
        expectedResult: string;
        actualResult: string;
        screenshotUrls: import("@prisma/platform-client/runtime/library").JsonValue;
        browser: string | null;
        os: string | null;
        screenResolution: string | null;
        bugReported: boolean;
        bugId: string | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        action: string;
        module: string;
        userId: string;
        videoUrl: string | null;
        severity: string | null;
        testRunId: string | null;
        testGroupId: string | null;
        pageName: string;
        expectedResult: string;
        actualResult: string;
        screenshotUrls: import("@prisma/platform-client/runtime/library").JsonValue;
        browser: string | null;
        os: string | null;
        screenResolution: string | null;
        bugReported: boolean;
        bugId: string | null;
    } | null>;
    findByTenantId(tenantId: string, filters?: ListFilters): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        action: string;
        module: string;
        userId: string;
        videoUrl: string | null;
        severity: string | null;
        testRunId: string | null;
        testGroupId: string | null;
        pageName: string;
        expectedResult: string;
        actualResult: string;
        screenshotUrls: import("@prisma/platform-client/runtime/library").JsonValue;
        browser: string | null;
        os: string | null;
        screenResolution: string | null;
        bugReported: boolean;
        bugId: string | null;
    }[]>;
    update(id: string, data: Partial<CreateManualTestLogData>): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        notes: string | null;
        action: string;
        module: string;
        userId: string;
        videoUrl: string | null;
        severity: string | null;
        testRunId: string | null;
        testGroupId: string | null;
        pageName: string;
        expectedResult: string;
        actualResult: string;
        screenshotUrls: import("@prisma/platform-client/runtime/library").JsonValue;
        browser: string | null;
        os: string | null;
        screenResolution: string | null;
        bugReported: boolean;
        bugId: string | null;
    }>;
    getSummary(tenantId: string, filters?: SummaryFilters): Promise<{
        total: number;
        byStatus: Record<string, number>;
        byModule: {
            total: number;
            module: string;
        }[];
    }>;
}
