import { ICommandHandler } from '@nestjs/cqrs';
import { DeleteFollowUpCommand } from './delete-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class DeleteFollowUpHandler implements ICommandHandler<DeleteFollowUpCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: DeleteFollowUpCommand): Promise<{
        id: string;
        deleted: boolean;
    }>;
}
