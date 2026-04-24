import { ProvisioningService } from './provisioning.service';
declare class DeprovisionDto {
    confirmation: string;
}
export declare class ProvisioningController {
    private provisioningService;
    constructor(provisioningService: ProvisioningService);
    provision(partnerId: string): Promise<import("./provisioning.service").ProvisionResult>;
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
    deprovision(partnerId: string, dto: DeprovisionDto): Promise<void>;
    reprovision(partnerId: string): Promise<import("./provisioning.service").ProvisionResult>;
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
export {};
