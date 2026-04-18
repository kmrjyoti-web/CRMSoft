import { ICommandHandler } from '@nestjs/cqrs';
import { UpdateListingCommand } from './update-listing.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class UpdateListingHandler implements ICommandHandler<UpdateListingCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: UpdateListingCommand): Promise<void>;
}
