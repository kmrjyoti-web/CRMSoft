import { ICommandHandler } from '@nestjs/cqrs';
import { RejectQuoteCommand } from './reject-quote.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class RejectQuoteHandler implements ICommandHandler<RejectQuoteCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: RejectQuoteCommand): Promise<{
        success: boolean;
    }>;
}
