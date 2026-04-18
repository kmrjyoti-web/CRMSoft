import { ICommandHandler } from '@nestjs/cqrs';
import { AcceptQuoteCommand } from './accept-quote.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class AcceptQuoteHandler implements ICommandHandler<AcceptQuoteCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: AcceptQuoteCommand): Promise<{
        success: boolean;
    }>;
}
