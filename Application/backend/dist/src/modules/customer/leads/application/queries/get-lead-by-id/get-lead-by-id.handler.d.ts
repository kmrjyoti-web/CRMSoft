import { IQueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetLeadByIdQuery } from './get-lead-by-id.query';
export declare class GetLeadByIdHandler implements IQueryHandler<GetLeadByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetLeadByIdQuery): Promise<{
        validNextStatuses: string[];
        isTerminal: boolean;
        contact: {
            id: string;
            isActive: boolean;
            firstName: string;
            lastName: string;
            designation: string | null;
            communications: {
                id: string;
                type: import("@prisma/working-client").$Enums.CommunicationType;
                value: string;
            }[];
        };
        filters: {
            id: string;
            lookupValueId: string;
        }[];
        _count: {
            activities: number;
            demos: number;
            quotations: number;
        };
        organization: {
            id: string;
            name: string;
            industry: string | null;
            city: string | null;
        } | null;
        activities: {
            id: string;
            type: import("@prisma/working-client").$Enums.ActivityType;
            subject: string;
            outcome: string | null;
            scheduledAt: Date | null;
            completedAt: Date | null;
        }[];
        demos: {
            id: string;
            status: import("@prisma/working-client").$Enums.DemoStatus;
            mode: import("@prisma/working-client").$Enums.DemoMode;
            scheduledAt: Date;
            completedAt: Date | null;
        }[];
        quotations: {
            id: string;
            status: import("@prisma/working-client").$Enums.QuotationStatus;
            totalAmount: import("@prisma/working-client/runtime/library").Decimal;
            quotationNo: string;
            validUntil: Date | null;
        }[];
        id: string;
        tenantId: string;
        isActive: boolean;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.LeadStatus;
        notes: string | null;
        contactId: string;
        organizationId: string | null;
        priority: import("@prisma/working-client").$Enums.LeadPriority;
        verticalData: import("@prisma/working-client/runtime/library").JsonValue | null;
        allocatedToId: string | null;
        expectedValue: import("@prisma/working-client/runtime/library").Decimal | null;
        expectedCloseDate: Date | null;
        leadNumber: string;
        allocatedAt: Date | null;
        lostReason: string | null;
    }>;
}
