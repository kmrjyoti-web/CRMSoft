import { TenantStatus } from '@prisma/identity-client';
export declare class TenantQueryDto {
    page?: number;
    limit?: number;
    status?: TenantStatus;
    search?: string;
}
