export declare class UpsertTenantProfileDto {
    companyLegalName?: string;
    industry?: string;
    website?: string;
    supportEmail?: string;
    dbStrategy?: string;
    primaryContactName?: string;
    primaryContactEmail?: string;
    primaryContactPhone?: string;
    billingAddress?: Record<string, unknown>;
    gstin?: string;
    pan?: string;
    accountManagerId?: string;
    notes?: string;
    tags?: string[];
    maxDiskQuotaMb?: number;
}
