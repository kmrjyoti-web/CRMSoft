import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetOrgsByContactQuery } from './get-by-contact.query';
export declare class GetOrgsByContactHandler implements IQueryHandler<GetOrgsByContactQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetOrgsByContactQuery): Promise<({
        organization: {
            id: string;
            name: string;
            isActive: boolean;
            industry: string | null;
            city: string | null;
        };
    } & {
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        designation: string | null;
        department: string | null;
        notes: string | null;
        contactId: string;
        isPrimary: boolean;
        organizationId: string;
        relationType: import("@prisma/working-client").$Enums.ContactOrgRelationType;
        startDate: Date | null;
        endDate: Date | null;
    })[]>;
}
