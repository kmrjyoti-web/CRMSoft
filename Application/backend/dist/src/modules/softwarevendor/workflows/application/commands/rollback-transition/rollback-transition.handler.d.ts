import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RollbackTransitionCommand } from './rollback-transition.command';
export declare class RollbackTransitionHandler implements ICommandHandler<RollbackTransitionCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RollbackTransitionCommand): Promise<{
        instanceId: string;
        rolledBackTo: string | undefined;
        historyId: string;
    }>;
}
