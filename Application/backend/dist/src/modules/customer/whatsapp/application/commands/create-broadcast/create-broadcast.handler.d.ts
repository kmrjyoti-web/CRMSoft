import { ICommandHandler } from '@nestjs/cqrs';
import { CreateBroadcastCommand } from './create-broadcast.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateBroadcastHandler implements ICommandHandler<CreateBroadcastCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: CreateBroadcastCommand): Promise<{
        id: string;
        tenantId: string;
        name: string;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        status: import("@prisma/working-client").$Enums.WaBroadcastStatus;
        templateId: string;
        scheduledAt: Date | null;
        completedAt: Date | null;
        startedAt: Date | null;
        failedCount: number;
        createdByName: string;
        wabaId: string;
        totalRecipients: number;
        sentCount: number;
        deliveredCount: number;
        readCount: number;
        throttlePerSecond: number;
        optOutCount: number;
    }>;
}
