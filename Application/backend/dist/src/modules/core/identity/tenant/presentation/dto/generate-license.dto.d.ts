export declare class GenerateLicenseDto {
    tenantId: string;
    planId: string;
    maxUsers?: number;
    expiresAt?: string;
    allowedModules?: Record<string, unknown>;
    notes?: string;
}
