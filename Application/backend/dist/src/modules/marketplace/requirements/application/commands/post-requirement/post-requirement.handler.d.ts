import { ICommandHandler } from '@nestjs/cqrs';
import { PostRequirementCommand } from './post-requirement.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class PostRequirementHandler implements ICommandHandler<PostRequirementCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: PostRequirementCommand): Promise<string>;
}
