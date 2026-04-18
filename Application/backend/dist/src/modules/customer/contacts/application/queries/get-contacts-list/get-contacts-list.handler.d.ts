import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetContactsListQuery } from './get-contacts-list.query';
export declare class GetContactsListHandler implements IQueryHandler<GetContactsListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetContactsListQuery): Promise<import("../../../../../../common/utils/paginated-list.helper").PaginatedResult<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        firstName: string;
        lastName: string;
        designation: string | null;
        department: string | null;
        entityVerificationStatus: string;
        communications: {
            id: string;
            type: import("@prisma/working-client").$Enums.CommunicationType;
            value: string;
            isPrimary: boolean;
        }[];
        dataStatus: import("@prisma/working-client").$Enums.DataStatus;
        contactOrganizations: {
            organization: {
                id: string;
                name: string;
            };
        }[];
    }>>;
}
