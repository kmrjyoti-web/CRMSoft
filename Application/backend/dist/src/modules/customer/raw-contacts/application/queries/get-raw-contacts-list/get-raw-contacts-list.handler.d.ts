import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetRawContactsListQuery } from './get-raw-contacts-list.query';
export declare class GetRawContactsListHandler implements IQueryHandler<GetRawContactsListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    private csvToArray;
    execute(query: GetRawContactsListQuery): Promise<import("../../../../../../common/utils/paginated-list.helper").PaginatedResult<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        status: import("@prisma/working-client").$Enums.RawContactStatus;
        source: import("@prisma/working-client").$Enums.RawContactSource;
        firstName: string;
        lastName: string;
        designation: string | null;
        department: string | null;
        companyName: string | null;
        entityVerificationStatus: string;
        communications: {
            id: string;
            type: import("@prisma/working-client").$Enums.CommunicationType;
            value: string;
            isPrimary: boolean;
        }[];
    }>>;
}
