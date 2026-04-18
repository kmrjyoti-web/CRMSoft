import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetContactsByOrgQuery } from './get-by-organization.query';
export declare class GetContactsByOrgHandler implements IQueryHandler<GetContactsByOrgQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetContactsByOrgQuery): Promise<({
        contact: {
            id: string;
            isActive: boolean;
            firstName: string;
            lastName: string;
            designation: string | null;
            communications: {
                type: import("@prisma/working-client").$Enums.CommunicationType;
                value: string;
            }[];
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
