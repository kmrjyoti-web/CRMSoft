import { PlanInterval, FeatureFlag } from '@prisma/identity-client';
export declare class CreatePlanDto {
    name: string;
    code: string;
    description?: string;
    interval: PlanInterval;
    price: number;
    currency?: string;
    maxUsers: number;
    maxContacts: number;
    maxLeads: number;
    maxProducts: number;
    maxStorage: number;
    features?: FeatureFlag[];
    isActive?: boolean;
    sortOrder?: number;
}
