import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { ConfigService } from '@nestjs/config';
export interface ProvisionResult {
    success: boolean;
    databases: string[];
    duration: number;
    error?: string;
}
export declare class ProvisioningService {
    private prisma;
    private audit;
    private config;
    constructor(prisma: PrismaService, audit: AuditService, config: ConfigService);
    private getDbNames;
    provision(partnerId: string): Promise<ProvisionResult>;
    getStatus(partnerId: string): Promise<{
        partnerId: string;
        isProvisioned: boolean;
        status: import("@prisma/client").$Enums.PartnerStatus;
        databases: {
            key: string;
            url: string;
            status: string;
        }[];
        featureFlags: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            featureCode: string;
            isEnabled: boolean;
            config: import("@prisma/client/runtime/client").JsonValue | null;
        }[];
        deployment: {
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
        } | null;
    }>;
    deprovision(partnerId: string, confirmation: string): Promise<void>;
    reprovision(partnerId: string): Promise<ProvisionResult>;
    getDatabases(partnerId: string): Promise<{
        provisioned: boolean;
        databases: {
            key: string;
            dbName: string | undefined;
            connectionUrl: string;
            status: string;
        }[];
    }>;
}
