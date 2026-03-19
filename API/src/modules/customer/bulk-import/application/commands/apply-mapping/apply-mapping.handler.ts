import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { FieldMapperService } from '../../../services/field-mapper.service';
import { ApplyMappingCommand } from './apply-mapping.command';

@CommandHandler(ApplyMappingCommand)
export class ApplyMappingHandler implements ICommandHandler<ApplyMappingCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fieldMapper: FieldMapperService,
  ) {}

  async execute(cmd: ApplyMappingCommand) {
    const rows = await this.prisma.working.importRow.findMany({
      where: { importJobId: cmd.jobId },
      orderBy: { rowNumber: 'asc' },
    });

    const rawRows = rows.map(r => r.rowData as Record<string, string>);
    const { mappedRows } = this.fieldMapper.mapRows(rawRows, cmd.fieldMapping, cmd.defaultValues);

    // Update rows with mapped data
    for (let i = 0; i < rows.length; i++) {
      await this.prisma.working.importRow.update({
        where: { id: rows[i].id },
        data: { mappedData: mappedRows[i] },
      });
    }

    // Update job
    await this.prisma.working.importJob.update({
      where: { id: cmd.jobId },
      data: {
        fieldMapping: cmd.fieldMapping,
        validationRules: cmd.validationRules || undefined,
        defaultValues: cmd.defaultValues || undefined,
        duplicateCheckFields: cmd.duplicateCheckFields || [],
        duplicateStrategy: (cmd.duplicateStrategy as any) || 'ASK_PER_ROW',
        fuzzyMatchEnabled: cmd.fuzzyMatchEnabled || false,
        fuzzyMatchFields: cmd.fuzzyMatchFields || [],
        fuzzyThreshold: cmd.fuzzyThreshold || 0.85,
        status: 'MAPPED',
      },
    });

    return { mapped: true, rowCount: rows.length };
  }
}
