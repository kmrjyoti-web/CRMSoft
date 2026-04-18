import { ICommandHandler } from '@nestjs/cqrs';
import { RecalculateTotalsCommand } from './recalculate-totals.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { QuotationCalculatorService } from '../../../services/quotation-calculator.service';
export declare class RecalculateTotalsHandler implements ICommandHandler<RecalculateTotalsCommand> {
    private readonly prisma;
    private readonly calculator;
    private readonly logger;
    constructor(prisma: PrismaService, calculator: QuotationCalculatorService);
    execute(cmd: RecalculateTotalsCommand): Promise<import("../../../services/quotation-calculator.service").QuotationTotals>;
}
