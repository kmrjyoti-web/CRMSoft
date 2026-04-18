import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCampaignRecipientsQuery } from './query';
export declare class GetCampaignRecipientsHandler implements IQueryHandler<GetCampaignRecipientsQuery> {
    private readonly prisma;
    constructor(prisma: PrismaService);
    execute(query: GetCampaignRecipientsQuery): Promise<{
        data: {
            id: string;
            tenantId: string;
            createdAt: Date;
            isDeleted: boolean;
            deletedAt: Date | null;
            deletedById: string | null;
            updatedById: string | null;
            updatedByName: string | null;
            status: import("@prisma/working-client").$Enums.CampaignRecipientStatus;
            firstName: string | null;
            lastName: string | null;
            companyName: string | null;
            contactId: string | null;
            email: string;
            errorMessage: string | null;
            sentAt: Date | null;
            failedAt: Date | null;
            openCount: number;
            clickCount: number;
            repliedAt: Date | null;
            campaignId: string;
            emailId: string | null;
            mergeData: import("@prisma/working-client/runtime/library").JsonValue | null;
            openedAt: Date | null;
            clickedAt: Date | null;
            bouncedAt: Date | null;
            unsubscribedAt: Date | null;
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
}
