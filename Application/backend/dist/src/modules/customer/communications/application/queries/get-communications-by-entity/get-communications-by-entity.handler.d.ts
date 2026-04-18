import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCommunicationsByEntityQuery } from './get-communications-by-entity.query';
export declare class GetCommunicationsByEntityHandler implements IQueryHandler<GetCommunicationsByEntityQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetCommunicationsByEntityQuery): Promise<{
        id: string;
        createdAt: Date;
        type: import("@prisma/working-client").$Enums.CommunicationType;
        value: string;
        contactId: string | null;
        label: string | null;
        priorityType: import("@prisma/working-client").$Enums.PriorityType;
        isPrimary: boolean;
        isVerified: boolean;
        organizationId: string | null;
        leadId: string | null;
        rawContactId: string | null;
    }[]>;
}
