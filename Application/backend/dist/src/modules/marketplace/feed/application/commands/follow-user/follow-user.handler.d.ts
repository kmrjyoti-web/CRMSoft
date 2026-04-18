import { ICommandHandler } from '@nestjs/cqrs';
import { FollowUserCommand } from './follow-user.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class FollowUserHandler implements ICommandHandler<FollowUserCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: FollowUserCommand): Promise<{
        success: boolean;
    }>;
}
