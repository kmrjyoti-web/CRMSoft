import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RemoveTransitionCommand } from './remove-transition.command';
export declare class RemoveTransitionHandler implements ICommandHandler<RemoveTransitionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RemoveTransitionCommand): Promise<{
        deleted: boolean;
    }>;
}
