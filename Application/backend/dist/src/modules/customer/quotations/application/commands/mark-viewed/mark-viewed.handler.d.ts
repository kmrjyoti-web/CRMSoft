import { ICommandHandler } from '@nestjs/cqrs';
import { MarkViewedCommand } from './mark-viewed.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class MarkViewedHandler implements ICommandHandler<MarkViewedCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: MarkViewedCommand): Promise<{
        viewed: boolean;
    }>;
}
