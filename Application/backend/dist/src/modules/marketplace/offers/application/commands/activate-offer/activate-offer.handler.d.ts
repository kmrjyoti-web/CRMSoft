import { ICommandHandler } from '@nestjs/cqrs';
import { ActivateOfferCommand } from './activate-offer.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class ActivateOfferHandler implements ICommandHandler<ActivateOfferCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: ActivateOfferCommand): Promise<void>;
}
