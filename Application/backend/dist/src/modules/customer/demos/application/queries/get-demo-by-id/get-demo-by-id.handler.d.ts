import { IQueryHandler } from '@nestjs/cqrs';
import { GetDemoByIdQuery } from './get-demo-by-id.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class GetDemoByIdHandler implements IQueryHandler<GetDemoByIdQuery> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(query: GetDemoByIdQuery): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        result: import("@prisma/working-client").$Enums.DemoResult | null;
        status: import("@prisma/working-client").$Enums.DemoStatus;
        notes: string | null;
        leadId: string;
        duration: number | null;
        mode: import("@prisma/working-client").$Enums.DemoMode;
        outcome: string | null;
        scheduledAt: Date;
        completedAt: Date | null;
        cancelReason: string | null;
        location: string | null;
        meetingLink: string | null;
        conductedById: string;
        rescheduleCount: number;
        noShowReason: string | null;
    }>;
}
