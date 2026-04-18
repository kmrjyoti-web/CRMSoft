import { LicenseService } from '../services/license.service';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorLicensesController {
    private readonly licenseService;
    constructor(licenseService: LicenseService);
    list(status?: string, search?: string, page?: string, limit?: string): Promise<ApiResponse<({
        tenant: never;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/platform-client").$Enums.LicenseStatus;
        notes: string | null;
        maxUsers: number;
        planId: string;
        licenseKey: string;
        expiresAt: Date | null;
        allowedModules: import("@prisma/platform-client/runtime/library").JsonValue | null;
        activatedAt: Date | null;
        hardwareFingerprint: string | null;
        lastValidatedAt: Date | null;
    })[]>>;
    getById(id: string): Promise<ApiResponse<{
        tenant: never;
    } & {
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/platform-client").$Enums.LicenseStatus;
        notes: string | null;
        maxUsers: number;
        planId: string;
        licenseKey: string;
        expiresAt: Date | null;
        allowedModules: import("@prisma/platform-client/runtime/library").JsonValue | null;
        activatedAt: Date | null;
        hardwareFingerprint: string | null;
        lastValidatedAt: Date | null;
    }>>;
}
