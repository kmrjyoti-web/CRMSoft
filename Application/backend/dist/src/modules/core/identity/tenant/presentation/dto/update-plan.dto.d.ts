import { FeatureFlag } from '@prisma/identity-client';
export declare class UpdatePlanDto {
    name?: string;
    description?: string;
    price?: number;
    maxUsers?: number;
    maxContacts?: number;
    maxLeads?: number;
    maxProducts?: number;
    maxStorage?: number;
    features?: FeatureFlag[];
    isActive?: boolean;
    sortOrder?: number;
}
