import { DeploymentsService } from './deployments.service';
declare class DeployDto {
    version?: string;
    gitTag?: string;
}
declare class RollbackDto {
    targetVersion: string;
}
export declare class DeploymentsController {
    private deploymentsService;
    constructor(deploymentsService: DeploymentsService);
    deploy(partnerId: string, dto: DeployDto): Promise<{
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
    rollback(partnerId: string, dto: RollbackDto): Promise<{
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
export {};
