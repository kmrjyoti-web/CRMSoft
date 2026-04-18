import { IQueryHandler } from '@nestjs/cqrs';
import { GetActivityListQuery } from './get-activity-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetActivityListHandler implements IQueryHandler<GetActivityListQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetActivityListQuery): Promise<import("../../../../../../common/utils/paginated-list.helper").PaginatedResult<{
        id: string;
        tenantId: string;
        description: string | null;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        type: import("@prisma/working-client").$Enums.ActivityType;
        contactId: string | null;
        leadId: string | null;
        subject: string;
        duration: number | null;
        outcome: string | null;
        scheduledAt: Date | null;
        endTime: Date | null;
        completedAt: Date | null;
        latitude: import("@prisma/working-client/runtime/library").Decimal | null;
        longitude: import("@prisma/working-client/runtime/library").Decimal | null;
        locationName: string | null;
    }>>;
}
