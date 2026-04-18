import { ICommandHandler } from '@nestjs/cqrs';
import { CreateListingCommand } from './create-listing.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class CreateListingHandler implements ICommandHandler<CreateListingCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: CreateListingCommand): Promise<string>;
}
