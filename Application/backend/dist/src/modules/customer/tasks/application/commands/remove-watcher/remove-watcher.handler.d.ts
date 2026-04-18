import { ICommandHandler } from '@nestjs/cqrs';
import { RemoveWatcherCommand } from './remove-watcher.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class RemoveWatcherHandler implements ICommandHandler<RemoveWatcherCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RemoveWatcherCommand): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
    }>;
}
