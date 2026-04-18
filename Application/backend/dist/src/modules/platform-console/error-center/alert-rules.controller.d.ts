import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class AlertRulesController {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    listRules(): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        channels: import(".prisma/platform-console-client/runtime/library").JsonValue;
        severity: string;
        condition: import(".prisma/platform-console-client/runtime/library").JsonValue;
        lastTriggered: Date | null;
    }[]>;
    createRule(body: {
        name: string;
        severity: string;
        condition: Record<string, unknown>;
        channels: string[];
    }): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        channels: import(".prisma/platform-console-client/runtime/library").JsonValue;
        severity: string;
        condition: import(".prisma/platform-console-client/runtime/library").JsonValue;
        lastTriggered: Date | null;
    }>;
    updateRule(id: string, body: Partial<{
        name: string;
        severity: string;
        condition: Record<string, unknown>;
        channels: string[];
        isActive: boolean;
    }>): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        channels: import(".prisma/platform-console-client/runtime/library").JsonValue;
        severity: string;
        condition: import(".prisma/platform-console-client/runtime/library").JsonValue;
        lastTriggered: Date | null;
    }>;
    deleteRule(id: string): Promise<{
        success: boolean;
    }>;
    getHistory(page?: string, limit?: string): Promise<{
        items: {
            id: string;
            createdAt: Date;
            channel: string;
            title: string;
            severity: string;
            message: string;
            ruleId: string | null;
            acknowledgedAt: Date | null;
            delivered: boolean;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
}
