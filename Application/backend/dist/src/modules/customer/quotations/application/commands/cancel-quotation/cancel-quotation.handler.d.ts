import { ICommandHandler } from '@nestjs/cqrs';
import { CancelQuotationCommand } from './cancel-quotation.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
export declare class CancelQuotationHandler implements ICommandHandler<CancelQuotationCommand> {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(cmd: CancelQuotationCommand): Promise<{
        cancelled: boolean;
    }>;
}
