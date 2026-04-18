import { ICommandHandler } from '@nestjs/cqrs';
import { RescheduleDemoCommand } from './reschedule-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class RescheduleDemoHandler implements ICommandHandler<RescheduleDemoCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RescheduleDemoCommand): Promise<{
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
