import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCommunicationByIdQuery } from './get-communication-by-id.query';
export declare class GetCommunicationByIdHandler implements IQueryHandler<GetCommunicationByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetCommunicationByIdQuery): Promise<{
        lead: {
            id: string;
            status: import("@prisma/working-client").$Enums.LeadStatus;
            leadNumber: string;
        } | null;
        rawContact: {
            id: string;
            status: import("@prisma/working-client").$Enums.RawContactStatus;
            firstName: string;
            lastName: string;
        } | null;
        contact: {
            id: string;
            firstName: string;
            lastName: string;
        } | null;
        organization: {
            id: string;
            name: string;
        } | null;
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
        type: import("@prisma/working-client").$Enums.CommunicationType;
        value: string;
        notes: string | null;
        contactId: string | null;
        label: string | null;
        priorityType: import("@prisma/working-client").$Enums.PriorityType;
        isPrimary: boolean;
        isVerified: boolean;
        organizationId: string | null;
        leadId: string | null;
        rawContactId: string | null;
    }>;
}
