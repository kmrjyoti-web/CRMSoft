import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetLeadsListQuery } from './get-leads-list.query';
export declare class GetLeadsListHandler implements IQueryHandler<GetLeadsListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetLeadsListQuery): Promise<import("../../../../../../common/utils/paginated-list.helper").PaginatedResult<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        status: import("@prisma/working-client").$Enums.LeadStatus;
        contact: {
            id: string;
            firstName: string;
            lastName: string;
            communications: {
                type: import("@prisma/working-client").$Enums.CommunicationType;
                value: string;
            }[];
        };
        organization: {
            id: string;
            name: string;
        } | null;
        priority: import("@prisma/working-client").$Enums.LeadPriority;
        allocatedToId: string | null;
        expectedValue: import("@prisma/working-client/runtime/library").Decimal | null;
        leadNumber: string;
    }>>;
}
