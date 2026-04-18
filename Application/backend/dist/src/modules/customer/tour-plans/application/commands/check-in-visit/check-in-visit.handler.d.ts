import { ICommandHandler } from '@nestjs/cqrs';
import { CheckInVisitCommand } from './check-in-visit.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CheckInVisitHandler implements ICommandHandler<CheckInVisitCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CheckInVisitCommand): Promise<{
        id: string;
        tenantId: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        sortOrder: number;
        notes: string | null;
        contactId: string | null;
        leadId: string | null;
        outcome: string | null;
        scheduledTime: Date | null;
        tourPlanId: string;
        actualArrival: Date | null;
        actualDeparture: Date | null;
        checkInLat: import("@prisma/working-client/runtime/library").Decimal | null;
        checkInLng: import("@prisma/working-client/runtime/library").Decimal | null;
        checkOutLat: import("@prisma/working-client/runtime/library").Decimal | null;
        checkOutLng: import("@prisma/working-client/runtime/library").Decimal | null;
        checkInPhoto: string | null;
        checkOutPhoto: string | null;
        distanceFromTarget: number | null;
        isCompleted: boolean;
    }>;
}
