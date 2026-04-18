import { ICommandHandler } from '@nestjs/cqrs';
import { SubmitQuoteCommand } from './submit-quote.command';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';
export declare class SubmitQuoteHandler implements ICommandHandler<SubmitQuoteCommand> {
    private readonly mktPrisma;
    private readonly logger;
    constructor(mktPrisma: MktPrismaService);
    execute(command: SubmitQuoteCommand): Promise<string>;
}
