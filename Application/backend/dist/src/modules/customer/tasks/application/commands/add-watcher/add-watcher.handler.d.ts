import { ICommandHandler } from '@nestjs/cqrs';
import { AddWatcherCommand } from './add-watcher.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../../../core/prisma/cross-db-resolver.service';
export declare class AddWatcherHandler implements ICommandHandler<AddWatcherCommand> {
    private readonly prisma;
    private readonly resolver;
    private readonly logger;
    constructor(prisma: PrismaService, resolver: CrossDbResolverService);
    execute(cmd: AddWatcherCommand): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        } | null;
        id: string;
        createdAt: Date;
        userId: string;
        taskId: string;
    }>;
}
