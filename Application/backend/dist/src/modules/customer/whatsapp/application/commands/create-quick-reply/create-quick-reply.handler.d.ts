import { ICommandHandler } from '@nestjs/cqrs';
import { CreateQuickReplyCommand } from './create-quick-reply.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CreateQuickReplyHandler implements ICommandHandler<CreateQuickReplyCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CreateQuickReplyCommand): Promise<{
        id: string;
        tenantId: string;
        createdById: string;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        category: string | null;
        message: string;
        wabaId: string;
        shortcut: string;
    }>;
}
