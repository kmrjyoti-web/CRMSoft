import { ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RowValidatorService } from '../../../services/row-validator.service';
import { RevalidateRowCommand } from './revalidate-row.command';
export declare class RevalidateRowHandler implements ICommandHandler<RevalidateRowCommand> {
    private readonly prisma;
    private readonly rowValidator;
    private readonly logger;
    constructor(prisma: PrismaService, rowValidator: RowValidatorService);
    execute(cmd: RevalidateRowCommand): Promise<import("../../../services/row-validator.service").RowValidationResult>;
}
