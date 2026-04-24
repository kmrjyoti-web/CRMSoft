import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';
export declare class DeploymentsService {
    private prisma;
    private audit;
    private config;
    constructor(prisma: PrismaService, audit: AuditService, config: ConfigService);
    deploy(partnerId: string, params: {
        version?: string;
        gitTag?: string;
        deployedBy?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeploymentStatus;
        partnerId: string;
        currentVersion: string | null;
        deployedAt: Date | null;
        deployedBy: string | null;
        gitBranch: string | null;
        gitCommitHash: string | null;
        gitTag: string | null;
        deploymentType: string;
        serverConfig: import("@prisma/client/runtime/client").JsonValue | null;
        lastHealthCheck: Date | null;
        healthStatus: string | null;
    }>;
    rollback(partnerId: string, targetVersion: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeploymentStatus;
        partnerId: string;
        currentVersion: string | null;
        deployedAt: Date | null;
        deployedBy: string | null;
        gitBranch: string | null;
        gitCommitHash: string | null;
        gitTag: string | null;
        deploymentType: string;
        serverConfig: import("@prisma/client/runtime/client").JsonValue | null;
        lastHealthCheck: Date | null;
        healthStatus: string | null;
    }>;
    getDeployment(partnerId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.DeploymentStatus;
        partnerId: string;
        currentVersion: string | null;
        deployedAt: Date | null;
        deployedBy: string | null;
        gitBranch: string | null;
        gitCommitHash: string | null;
        gitTag: string | null;
        deploymentType: string;
        serverConfig: import("@prisma/client/runtime/client").JsonValue | null;
        lastHealthCheck: Date | null;
        healthStatus: string | null;
    } | {
        partnerId: string;
        status: string;
        isDeployed: boolean;
    }>;
    checkHealth(partnerId: string): Promise<{
        partnerId: string;
        status: string;
        healthy: boolean;
        healthStatus?: undefined;
        lastCheck?: undefined;
    } | {
        partnerId: string;
        status: import("@prisma/client").$Enums.DeploymentStatus;
        healthy: boolean;
        healthStatus: string;
        lastCheck: Date;
    }>;
    getHistory(partnerId: string): Promise<{
        id: string;
        createdAt: Date;
        partnerId: string | null;
        action: string;
        performedBy: string;
        performedByRole: string;
        details: import("@prisma/client/runtime/client").JsonValue | null;
        ipAddress: string | null;
        userAgent: string | null;
    }[]>;
    checkAllHealth(): Promise<{
        checked: number;
        results: ({
            partnerId: string;
            status: string;
            healthy: boolean;
            healthStatus?: undefined;
            lastCheck?: undefined;
        } | {
            partnerId: string;
            status: import("@prisma/client").$Enums.DeploymentStatus;
            healthy: boolean;
            healthStatus: string;
            lastCheck: Date;
        })[];
    }>;
}
