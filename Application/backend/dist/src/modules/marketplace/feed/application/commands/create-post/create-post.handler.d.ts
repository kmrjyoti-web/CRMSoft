import { ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from './create-post.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class CreatePostHandler implements ICommandHandler<CreatePostCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: CreatePostCommand): Promise<string>;
}
