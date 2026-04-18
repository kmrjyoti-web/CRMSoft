import { ICommandHandler } from '@nestjs/cqrs';
import { ReorderMenusCommand } from './reorder-menus.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class ReorderMenusHandler implements ICommandHandler<ReorderMenusCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: ReorderMenusCommand): Promise<{
        reordered: number;
    }>;
}
