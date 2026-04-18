import { ICommandHandler } from '@nestjs/cqrs';
import { EngagePostCommand } from './engage-post.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class EngagePostHandler implements ICommandHandler<EngagePostCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: EngagePostCommand): Promise<void>;
}
