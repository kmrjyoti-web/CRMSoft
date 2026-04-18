import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteTargetCommand } from './delete-target.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeleteTargetHandler implements ICommandHandler<DeleteTargetCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(command: DeleteTargetCommand): Promise<{
        deleted: boolean;
    }>;
}
