import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ProfileMatcherService } from '../../../services/profile-matcher.service';
import { FieldMapperService } from '../../../services/field-mapper.service';
import { SelectProfileCommand } from './select-profile.command';

@CommandHandler(SelectProfileCommand)
export class SelectProfileHandler implements ICommandHandler<SelectProfileCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profileMatcher: ProfileMatcherService,
    private readonly fieldMapper: FieldMapperService,
  ) {}

  async execute(cmd: SelectProfileCommand) {
    const job = await this.prisma.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
    const profile = await this.prisma.importProfile.findUniqueOrThrow({ where: { id: cmd.profileId } });

    // Match file headers against profile
    const match = this.profileMatcher.matchHeaders(job.fileHeaders, profile);

    // Update job with profile link and settings
    await this.prisma.importJob.update({
      where: { id: cmd.jobId },
      data: {
        profileId: cmd.profileId,
        profileMatchScore: match.matchScore,
        duplicateCheckFields: profile.duplicateCheckFields,
        duplicateStrategy: profile.duplicateStrategy,
        fuzzyMatchEnabled: profile.fuzzyMatchEnabled,
        fuzzyMatchFields: profile.fuzzyMatchFields,
        fuzzyThreshold: profile.fuzzyThreshold,
        validationRules: profile.validationRules || undefined,
        defaultValues: profile.defaultValues || undefined,
      },
    });

    // If FULL_MATCH → auto-map rows and advance to MAPPED
    if (match.status === 'FULL_MATCH') {
      await this.autoMapRows(cmd.jobId, match.resolvedMapping, profile);
      return { matchStatus: match.status, matchScore: match.matchScore, nextStep: 'validate' };
    }

    // Store resolved mapping for manual fix
    await this.prisma.importJob.update({
      where: { id: cmd.jobId },
      data: { fieldMapping: match.resolvedMapping, status: 'MAPPING' },
    });

    return {
      matchStatus: match.status,
      matchScore: match.matchScore,
      resolvedMapping: match.resolvedMapping,
      unmatchedHeaders: match.unmatchedHeaders,
      nextStep: 'mapping',
    };
  }

  /** Auto-map all rows when profile is a full match */
  private async autoMapRows(jobId: string, resolvedMapping: any[], profile: any): Promise<void> {
    const rows = await this.prisma.importRow.findMany({
      where: { importJobId: jobId },
      orderBy: { rowNumber: 'asc' },
    });

    const rawRows = rows.map(r => r.rowData as Record<string, string>);
    const { mappedRows } = this.fieldMapper.mapRows(rawRows, resolvedMapping, profile.defaultValues);

    // Batch update rows with mapped data
    for (let i = 0; i < rows.length; i++) {
      await this.prisma.importRow.update({
        where: { id: rows[i].id },
        data: { mappedData: mappedRows[i] },
      });
    }

    await this.prisma.importJob.update({
      where: { id: jobId },
      data: { fieldMapping: resolvedMapping, status: 'MAPPED', usedAutoMapping: true },
    });
  }
}
