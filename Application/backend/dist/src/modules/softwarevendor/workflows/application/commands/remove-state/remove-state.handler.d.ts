import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RemoveStateCommand } from './remove-state.command';
export declare class RemoveStateHandler implements ICommandHandler<RemoveStateCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: RemoveStateCommand): Promise<{
        deleted: boolean;
    }>;
}
