import { ICommandHandler } from '@nestjs/cqrs';
import { ModerateReviewCommand } from './moderate-review.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ModerateReviewHandler implements ICommandHandler<ModerateReviewCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: ModerateReviewCommand): Promise<void>;
    private updateListingRating;
}
