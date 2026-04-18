import { ICommandHandler } from '@nestjs/cqrs';
import { RejectTourPlanCommand } from './reject-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class RejectTourPlanHandler implements ICommandHandler<RejectTourPlanCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RejectTourPlanCommand): Promise<{
        id: string;
        tenantId: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.TourPlanStatus;
        leadId: string;
        title: string;
        approvedById: string | null;
        approvedAt: Date | null;
        rejectedReason: string | null;
        planDate: Date;
        startLocation: string | null;
        endLocation: string | null;
        salesPersonId: string;
        checkInLat: import("@prisma/working-client/runtime/library").Decimal | null;
        checkInLng: import("@prisma/working-client/runtime/library").Decimal | null;
        checkOutLat: import("@prisma/working-client/runtime/library").Decimal | null;
        checkOutLng: import("@prisma/working-client/runtime/library").Decimal | null;
        checkInPhoto: string | null;
        checkInTime: Date | null;
        checkOutTime: Date | null;
    }>;
}
