import { ICommandHandler } from '@nestjs/cqrs';
import { DeactivateMenuCommand } from './deactivate-menu.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
export declare class DeactivateMenuHandler implements ICommandHandler<DeactivateMenuCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeactivateMenuCommand): Promise<{
        deactivated: number;
    }>;
    private collectDescendantIds;
}
