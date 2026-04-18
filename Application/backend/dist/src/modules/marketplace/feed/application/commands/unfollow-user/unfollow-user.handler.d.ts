import { ICommandHandler } from '@nestjs/cqrs';
import { UnfollowUserCommand } from './unfollow-user.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class UnfollowUserHandler implements ICommandHandler<UnfollowUserCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: UnfollowUserCommand): Promise<{
        success: boolean;
    }>;
}
