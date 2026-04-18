import { ICommandHandler } from '@nestjs/cqrs';
import { RemoveLineItemCommand } from './remove-line-item.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';
export declare class RemoveLineItemHandler implements ICommandHandler<RemoveLineItemCommand> {
    private readonly prisma;
    private readonly calculator;
    private readonly logger;
    constructor(prisma: PrismaService, calculator: QuotationCalculatorService);
    execute(cmd: RemoveLineItemCommand): Promise<{
        removed: boolean;
    }>;
}
