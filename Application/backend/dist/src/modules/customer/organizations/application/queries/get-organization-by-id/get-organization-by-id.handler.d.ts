import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetOrganizationByIdQuery } from './get-organization-by-id.query';
export declare class GetOrganizationByIdHandler implements IQueryHandler<GetOrganizationByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetOrganizationByIdQuery): Promise<{
        id: string;
        tenantId: string;
        name: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        notes: string | null;
        entityVerificationStatus: string;
        entityVerifiedVia: string | null;
        email: string | null;
        website: string | null;
        industry: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        country: string | null;
        phone: string | null;
        gstNumber: string | null;
        address: string | null;
        dataStatus: import("@prisma/working-client").$Enums.DataStatus;
        entityVerifiedAt: Date | null;
        annualRevenue: number | null;
        orgType: import("@prisma/working-client").$Enums.OrgType;
    }>;
}
