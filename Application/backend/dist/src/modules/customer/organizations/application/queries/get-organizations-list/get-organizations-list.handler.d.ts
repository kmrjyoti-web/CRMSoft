import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetOrganizationsListQuery } from './get-organizations-list.query';
export declare class GetOrganizationsListHandler implements IQueryHandler<GetOrganizationsListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetOrganizationsListQuery): Promise<import("../../../../../../common/utils/paginated-list.helper").PaginatedResult<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        entityVerificationStatus: string;
        communications: {
            id: string;
            type: import("@prisma/working-client").$Enums.CommunicationType;
            value: string;
            isPrimary: boolean;
        }[];
        website: string | null;
        industry: string | null;
        city: string | null;
        gstNumber: string | null;
    }>>;
}
