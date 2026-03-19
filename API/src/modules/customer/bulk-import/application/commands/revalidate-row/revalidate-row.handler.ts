import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RowValidatorService } from '../../../services/row-validator.service';
import { RevalidateRowCommand } from './revalidate-row.command';

@CommandHandler(RevalidateRowCommand)
export class RevalidateRowHandler implements ICommandHandler<RevalidateRowCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rowValidator: RowValidatorService,
  ) {}

  async execute(cmd: RevalidateRowCommand) {
    const row = await this.prisma.working.importRow.findUniqueOrThrow({ where: { id: cmd.rowId } });
    const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });

    const data = (row.userEditedData || row.mappedData || {}) as Record<string, any>;
    const rules = (job.validationRules as any[]) || [];
    const result = this.rowValidator.validateRow(data, rules);

    await this.prisma.working.importRow.update({
      where: { id: cmd.rowId },
      data: {
        rowStatus: result.valid ? 'VALID' : 'INVALID',
        validationErrors: result.errors.length > 0 ? result.errors : undefined,
        validationWarnings: result.warnings.length > 0 ? result.warnings : undefined,
        mappedData: result.cleanedData,
      },
    });

    return result;
  }
}
