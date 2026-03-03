import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { ImportExecutorService } from '../../../services/import-executor.service';
import { ResultReportService } from '../../../services/result-report.service';
import { CommitImportCommand } from './commit-import.command';

@CommandHandler(CommitImportCommand)
export class CommitImportHandler implements ICommandHandler<CommitImportCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly executor: ImportExecutorService,
    private readonly reportService: ResultReportService,
  ) {}

  async execute(cmd: CommitImportCommand) {
    const job = await this.prisma.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
    await this.prisma.importJob.update({
      where: { id: cmd.jobId },
      data: { status: 'IMPORTING', startedAt: new Date() },
    });

    const rows = await this.prisma.importRow.findMany({
      where: { importJobId: cmd.jobId },
      orderBy: { rowNumber: 'asc' },
    });

    let created = 0, updated = 0, skipped = 0, failed = 0;

    for (const row of rows) {
      // Skip already processed or skipped rows
      if (row.rowStatus === 'IMPORTED' || row.rowStatus === 'SKIPPED') {
        if (row.rowStatus === 'SKIPPED') skipped++;
        continue;
      }

      // Handle user actions
      if (row.userAction === 'SKIP' || row.rowStatus === 'INVALID') {
        await this.prisma.importRow.update({
          where: { id: row.id },
          data: { rowStatus: 'SKIPPED', importAction: 'SKIPPED' },
        });
        skipped++;
        continue;
      }

      // Determine if VALID or user accepted duplicate
      const shouldImport = row.rowStatus === 'VALID' ||
        row.userAction === 'ACCEPT' ||
        row.userAction === 'FORCE_CREATE';

      if (!shouldImport) {
        await this.prisma.importRow.update({
          where: { id: row.id },
          data: { rowStatus: 'SKIPPED', importAction: 'SKIPPED' },
        });
        skipped++;
        continue;
      }

      // Execute import
      const result = await this.executor.executeRow(
        {
          rowNumber: row.rowNumber,
          mappedData: (row.userEditedData || row.mappedData || {}) as Record<string, any>,
          userAction: row.userAction || undefined,
          duplicateOfEntityId: row.duplicateOfEntityId || undefined,
        },
        job.targetEntity,
        cmd.createdById,
      );

      if (result.success) {
        if (result.action === 'CREATED') created++;
        else if (result.action === 'UPDATED') updated++;
        else if (result.action === 'SKIPPED') skipped++;

        await this.prisma.importRow.update({
          where: { id: row.id },
          data: {
            rowStatus: 'IMPORTED',
            importAction: result.action,
            importedEntityId: result.entityId,
            importedAt: new Date(),
          },
        });
      } else {
        failed++;
        await this.prisma.importRow.update({
          where: { id: row.id },
          data: { rowStatus: 'FAILED', importAction: 'FAILED', importError: result.error },
        });
      }
    }

    // Update job final stats
    await this.prisma.importJob.update({
      where: { id: cmd.jobId },
      data: {
        status: 'COMPLETED',
        importedCount: created,
        updatedCount: updated,
        skippedRows: skipped,
        failedCount: failed,
        completedAt: new Date(),
      },
    });

    // Update profile stats if linked
    if (job.profileId) {
      await this.prisma.importProfile.update({
        where: { id: job.profileId },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
          totalImported: { increment: created + updated },
          avgSuccessRate: job.totalRows > 0 ? ((created + updated) / job.totalRows) * 100 : 0,
        },
      });
    }

    // Generate result report
    try {
      await this.reportService.generateReport(cmd.jobId);
    } catch {
      // Report generation failure shouldn't block import result
    }

    return { created, updated, skipped, failed, total: rows.length };
  }
}
