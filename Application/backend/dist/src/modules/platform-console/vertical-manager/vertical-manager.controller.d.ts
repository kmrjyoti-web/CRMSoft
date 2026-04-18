import { VerticalManagerService } from './vertical-manager.service';
import { RegisterVerticalDto } from './dto/register-vertical.dto';
export declare class VerticalManagerController {
    private readonly verticalManagerService;
    constructor(verticalManagerService: VerticalManagerService);
    getHealthOverview(): Promise<{
        id: string;
        verticalType: string;
        apiStatus: string;
        dbStatus: string;
        testStatus: string;
        errorRate: number;
        avgResponseMs: number | null;
        lastChecked: Date;
    }[]>;
    getVerticals(): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        status: string;
        nameHi: string;
        modulesCount: number;
        schemaVersion: string;
        schemasConfig: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }[]>;
    registerVertical(dto: RegisterVerticalDto): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        status: string;
        nameHi: string;
        modulesCount: number;
        schemaVersion: string;
        schemasConfig: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }>;
    getVerticalDetail(code: string): Promise<{
        registry: {
            id: string;
            name: string;
            code: string;
            createdAt: Date;
            status: string;
            nameHi: string;
            modulesCount: number;
            schemaVersion: string;
            schemasConfig: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
        };
        version: {
            id: string;
            lastUpdated: Date;
            verticalType: string;
            currentVersion: string;
            modulesCount: number | null;
            endpointsCount: number | null;
            healthStatus: string;
        } | null;
        health: {
            id: string;
            verticalType: string;
            apiStatus: string;
            dbStatus: string;
            testStatus: string;
            errorRate: number;
            avgResponseMs: number | null;
            lastChecked: Date;
        } | null;
        recentAudits: {
            id: string;
            createdAt: Date;
            score: number;
            metrics: import(".prisma/platform-console-client/runtime/library").JsonValue;
            verticalType: string;
            auditDate: Date;
            issues: import(".prisma/platform-console-client/runtime/library").JsonValue;
        }[];
    }>;
    updateVertical(code: string, data: {
        name?: string;
        nameHi?: string;
        schemasConfig?: Record<string, unknown>;
    }): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        status: string;
        nameHi: string;
        modulesCount: number;
        schemaVersion: string;
        schemasConfig: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }>;
    updateVerticalStatus(code: string, body: {
        status: string;
    }): Promise<{
        id: string;
        name: string;
        code: string;
        createdAt: Date;
        status: string;
        nameHi: string;
        modulesCount: number;
        schemaVersion: string;
        schemasConfig: import(".prisma/platform-console-client/runtime/library").JsonValue | null;
    }>;
    getVerticalHealth(code: string): Promise<{
        id: string;
        verticalType: string;
        apiStatus: string;
        dbStatus: string;
        testStatus: string;
        errorRate: number;
        avgResponseMs: number | null;
        lastChecked: Date;
    }>;
    runVerticalAudit(code: string): Promise<{
        id: string;
        createdAt: Date;
        score: number;
        metrics: import(".prisma/platform-console-client/runtime/library").JsonValue;
        verticalType: string;
        auditDate: Date;
        issues: import(".prisma/platform-console-client/runtime/library").JsonValue;
    }>;
    getAudits(code: string, page?: string, limit?: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            score: number;
            metrics: import(".prisma/platform-console-client/runtime/library").JsonValue;
            verticalType: string;
            auditDate: Date;
            issues: import(".prisma/platform-console-client/runtime/library").JsonValue;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    getAuditDetail(code: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        score: number;
        metrics: import(".prisma/platform-console-client/runtime/library").JsonValue;
        verticalType: string;
        auditDate: Date;
        issues: import(".prisma/platform-console-client/runtime/library").JsonValue;
    }>;
}
