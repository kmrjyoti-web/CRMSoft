import { ICommandHandler } from '@nestjs/cqrs';
import { CreateOfferCommand } from './create-offer.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class CreateOfferHandler implements ICommandHandler<CreateOfferCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: CreateOfferCommand): Promise<string>;
}
