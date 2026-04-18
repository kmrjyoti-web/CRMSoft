import { IQueryHandler } from '@nestjs/cqrs';
import { ListEnquiriesQuery } from './list-enquiries.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ListEnquiriesHandler implements IQueryHandler<ListEnquiriesQuery> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(query: ListEnquiriesQuery): Promise<{
        data: ({
            listing: {
                id: string;
                basePrice: number;
                title: string;
            };
        } & {
            id: string;
            tenantId: string;
            createdAt: Date;
            updatedAt: Date;
            isDeleted: boolean;
            status: string;
            quantity: number | null;
            message: string;
            listingId: string;
            expectedPrice: number | null;
            deliveryPincode: string | null;
            enquirerId: string;
            crmLeadId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
}
