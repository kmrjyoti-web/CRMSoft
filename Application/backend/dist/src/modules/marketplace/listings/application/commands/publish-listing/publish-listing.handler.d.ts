import { ICommandHandler } from '@nestjs/cqrs';
import { PublishListingCommand } from './publish-listing.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class PublishListingHandler implements ICommandHandler<PublishListingCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: PublishListingCommand): Promise<void>;
}
