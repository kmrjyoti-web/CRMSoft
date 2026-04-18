import { PrismaService } from "../../../../../core/prisma/prisma.service";
export declare const SCHEDULED_TEST_RUN_REPOSITORY: unique symbol;
export interface IScheduledTestRunRepository {
    create(data: CreateScheduledTestRunData): Promise<any>;
    findById(id: string): Promise<any | null>;
    findByScheduledTestId(scheduledTestId: string, limit?: number): Promise<any[]>;
    update(id: string, data: UpdateScheduledTestRunData): Promise<any>;
}
export interface CreateScheduledTestRunData {
    scheduledTestId: string;
    status: string;
    testRunId?: string;
    backupRecordId?: string;
    testEnvId?: string;
}
export interface UpdateScheduledTestRunData {
    status?: string;
    testRunId?: string;
    backupRecordId?: string;
    testEnvId?: string;
    errorMessage?: string;
    completedAt?: Date;
}
export declare class PrismaScheduledTestRunRepository implements IScheduledTestRunRepository {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(data: CreateScheduledTestRunData): Promise<{
        id: string;
        status: import("@prisma/platform-client").$Enums.TestRunStatus;
        errorMessage: string | null;
        completedAt: Date | null;
        startedAt: Date;
        testEnvId: string | null;
        testRunId: string | null;
        scheduledTestId: string;
        backupRecordId: string | null;
    }>;
    findById(id: string): Promise<{
        id: string;
        status: import("@prisma/platform-client").$Enums.TestRunStatus;
        errorMessage: string | null;
        completedAt: Date | null;
        startedAt: Date;
        testEnvId: string | null;
        testRunId: string | null;
        scheduledTestId: string;
        backupRecordId: string | null;
    } | null>;
    findByScheduledTestId(scheduledTestId: string, limit?: number): Promise<{
        id: string;
        status: import("@prisma/platform-client").$Enums.TestRunStatus;
        errorMessage: string | null;
        completedAt: Date | null;
        startedAt: Date;
        testEnvId: string | null;
        testRunId: string | null;
        scheduledTestId: string;
        backupRecordId: string | null;
    }[]>;
    update(id: string, data: UpdateScheduledTestRunData): Promise<{
        id: string;
        status: import("@prisma/platform-client").$Enums.TestRunStatus;
        errorMessage: string | null;
        completedAt: Date | null;
        startedAt: Date;
        testEnvId: string | null;
        testRunId: string | null;
        scheduledTestId: string;
        backupRecordId: string | null;
    }>;
}
