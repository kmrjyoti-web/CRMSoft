import { Controller, Post, Get, Put, Param, Body, Query, UseGuards, UseInterceptors, UploadedFile, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AuditSkip } from '../../../core/identity/audit/decorators/audit-skip.decorator';
import { UploadFileCommand } from '../application/commands/upload-file/upload-file.command';
import { SelectProfileCommand } from '../application/commands/select-profile/select-profile.command';
import { ApplyMappingCommand } from '../application/commands/apply-mapping/apply-mapping.command';
import { SaveProfileCommand } from '../application/commands/save-profile/save-profile.command';
import { ValidateRowsCommand } from '../application/commands/validate-rows/validate-rows.command';
import { CommitImportCommand } from '../application/commands/commit-import/commit-import.command';
import { CancelImportCommand } from '../application/commands/cancel-import/cancel-import.command';
import { RowActionCommand } from '../application/commands/row-action/row-action.command';
import { RowBulkActionCommand } from '../application/commands/row-bulk-action/row-bulk-action.command';
import { EditRowCommand } from '../application/commands/edit-row/edit-row.command';
import { RevalidateRowCommand } from '../application/commands/revalidate-row/revalidate-row.command';
import { GetJobListQuery } from '../application/queries/get-job-list/get-job-list.query';
import { GetJobDetailQuery } from '../application/queries/get-job-detail/get-job-detail.query';
import { GetValidationSummaryQuery } from '../application/queries/get-validation-summary/get-validation-summary.query';
import { GetDuplicatesQuery } from '../application/queries/get-duplicates/get-duplicates.query';
import { GetJobResultQuery } from '../application/queries/get-job-result/get-job-result.query';
import { GetJobRowsQuery } from '../application/queries/get-job-rows/get-job-rows.query';
import { GetRowDetailQuery } from '../application/queries/get-row-detail/get-row-detail.query';
import { GetMappingSuggestionsQuery } from '../application/queries/get-mapping-suggestions/get-mapping-suggestions.query';
import { SelectProfileDto, SaveProfileDto } from './dto/upload-file.dto';
import { ApplyMappingDto } from './dto/mapping.dto';
import { RowActionDto, RowBulkActionDto, EditRowDto } from './dto/row-action.dto';
import { ResultReportService } from '../services/result-report.service';

@Controller('import')
@UseGuards(JwtAuthGuard)
@AuditSkip()
export class ImportController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly reportService: ResultReportService,
  ) {}

  /** Step 1: Upload file and parse */
  @Post('upload')
  @RequirePermissions('import:write')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any, @Body() dto: any, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(new UploadFileCommand(
      file.originalname, file.mimetype, file.size, file.buffer,
      dto.targetEntity, user.id, `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    ));
    return ApiResponse.success(result, 'File uploaded and parsed');
  }

  /** Step 2a: Select profile for auto-mapping */
  @Post(':jobId/select-profile')
  @RequirePermissions('import:write')
  async selectProfile(@Param('jobId') jobId: string, @Body() dto: SelectProfileDto) {
    const result = await this.commandBus.execute(new SelectProfileCommand(jobId, dto.profileId));
    return ApiResponse.success(result);
  }

  /** Step 2b: Manual mapping */
  @Post(':jobId/mapping')
  @RequirePermissions('import:write')
  async applyMapping(@Param('jobId') jobId: string, @Body() dto: ApplyMappingDto) {
    const result = await this.commandBus.execute(new ApplyMappingCommand(
      jobId, dto.fieldMapping, dto.validationRules, dto.duplicateCheckFields,
      dto.duplicateStrategy, dto.fuzzyMatchEnabled, dto.fuzzyMatchFields, dto.fuzzyThreshold, dto.defaultValues,
    ));
    return ApiResponse.success(result, 'Mapping applied');
  }

  /** Step 2c: Save mapping as profile */
  @Post(':jobId/save-profile')
  @RequirePermissions('import:write')
  async saveProfile(@Param('jobId') jobId: string, @Body() dto: SaveProfileDto) {
    const result = await this.commandBus.execute(new SaveProfileCommand(jobId, dto.name, dto.description, dto.sourceSystem));
    return ApiResponse.success(result, 'Profile saved');
  }

  /** Step 3: Validate (fire-and-forget — processes in background) */
  @Post(':jobId/validate')
  @RequirePermissions('import:write')
  @HttpCode(202)
  async validate(@Param('jobId') jobId: string) {
    // Return immediately — validation runs in background
    this.commandBus.execute(new ValidateRowsCommand(jobId)).catch(() => {});
    return ApiResponse.success({ jobId, status: 'VALIDATING' }, 'Validation started');
  }

  /** Step 4: Poll job status (lightweight — for progress tracking) */
  @Get(':jobId/status')
  @RequirePermissions('import:read')
  async getStatus(@Param('jobId') jobId: string) {
    const job = await this.queryBus.execute(new GetJobDetailQuery(jobId));
    return ApiResponse.success({
      jobId: job.id,
      status: job.status,
      totalRows: job.totalRows,
      validRows: job.validRows,
      invalidRows: job.invalidRows,
      importedCount: job.importedCount,
      skippedRows: job.skippedRows,
      failedCount: job.failedCount,
      duplicateExactRows: job.duplicateExactRows,
      duplicateInFileRows: job.duplicateInFileRows,
    });
  }

  /** Step 5: Commit import (fire-and-forget — processes in background) */
  @Post(':jobId/commit')
  @RequirePermissions('import:write')
  @HttpCode(202)
  async commit(@Param('jobId') jobId: string, @CurrentUser('id') userId: string) {
    // Return immediately — import runs in background
    this.commandBus.execute(new CommitImportCommand(jobId, userId)).catch(async (err) => {
      // Log error and mark job as FAILED so user can see what happened
      console.error(`[Import] Job ${jobId} failed:`, err.message);
      try {
        const { PrismaClient } = require('@prisma/working-client');
        const prisma = new PrismaClient();
        await prisma.importJob.update({
          where: { id: jobId },
          data: { status: 'FAILED' as any },
        });
        await prisma.$disconnect();
      } catch { /* best-effort */ }
    });
    return ApiResponse.success({ jobId, status: 'IMPORTING' }, 'Import started');
  }

  /** Cancel import */
  @Post(':jobId/cancel')
  @RequirePermissions('import:write')
  async cancel(@Param('jobId') jobId: string) {
    const result = await this.commandBus.execute(new CancelImportCommand(jobId));
    return ApiResponse.success(result, 'Import cancelled');
  }

  /** List import jobs */
  @Get('jobs')
  @RequirePermissions('import:read')
  async listJobs(@Query() query: any) {
    const result = await this.queryBus.execute(new GetJobListQuery(query.userId, query.status, +query.page, +query.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  /** Job detail */
  @Get(':jobId')
  @RequirePermissions('import:read')
  async getJob(@Param('jobId') jobId: string) {
    const result = await this.queryBus.execute(new GetJobDetailQuery(jobId));
    return ApiResponse.success(result);
  }

  /** Validation summary */
  @Get(':jobId/validation-summary')
  @RequirePermissions('import:read')
  async validationSummary(@Param('jobId') jobId: string) {
    const result = await this.queryBus.execute(new GetValidationSummaryQuery(jobId));
    return ApiResponse.success(result);
  }

  /** Duplicates list */
  @Get(':jobId/duplicates')
  @RequirePermissions('import:read')
  async duplicates(@Param('jobId') jobId: string, @Query() q: any) {
    const result = await this.queryBus.execute(new GetDuplicatesQuery(jobId, +q.page, +q.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  /** Result summary */
  @Get(':jobId/result')
  @RequirePermissions('import:read')
  async result(@Param('jobId') jobId: string) {
    const result = await this.queryBus.execute(new GetJobResultQuery(jobId));
    return ApiResponse.success(result);
  }

  /** Download result report */
  @Get(':jobId/result/download')
  @RequirePermissions('import:read')
  async downloadReport(@Param('jobId') jobId: string, @Query('type') type: string) {
    const summary = await this.reportService.getResultSummary(jobId);
    const url = type === 'failed' ? summary.failedReportUrl : summary.reportUrl;
    return ApiResponse.success({ downloadUrl: url });
  }

  /** Paginated rows */
  @Get(':jobId/rows')
  @RequirePermissions('import:read')
  async getRows(@Param('jobId') jobId: string, @Query() q: any) {
    const result = await this.queryBus.execute(new GetJobRowsQuery(jobId, q.status, +q.page, +q.limit));
    return ApiResponse.paginated(result.data, result.total, result.page, result.limit);
  }

  /** Row detail */
  @Get(':jobId/rows/:rowId')
  @RequirePermissions('import:read')
  async getRow(@Param('jobId') jobId: string, @Param('rowId') rowId: string) {
    const result = await this.queryBus.execute(new GetRowDetailQuery(jobId, rowId));
    return ApiResponse.success(result);
  }

  /** Edit row */
  @Put(':jobId/rows/:rowId')
  @RequirePermissions('import:write')
  async editRow(@Param('jobId') jobId: string, @Param('rowId') rowId: string, @Body() dto: EditRowDto) {
    const result = await this.commandBus.execute(new EditRowCommand(jobId, rowId, dto.editedData));
    return ApiResponse.success(result, 'Row updated');
  }

  /** Row action (accept/skip/force) */
  @Post(':jobId/rows/:rowId/action')
  @RequirePermissions('import:write')
  async rowAction(@Param('jobId') jobId: string, @Param('rowId') rowId: string, @Body() dto: RowActionDto) {
    const result = await this.commandBus.execute(new RowActionCommand(jobId, rowId, dto.action));
    return ApiResponse.success(result);
  }

  /** Revalidate after edit */
  @Post(':jobId/rows/:rowId/revalidate')
  @RequirePermissions('import:write')
  async revalidateRow(@Param('jobId') jobId: string, @Param('rowId') rowId: string) {
    const result = await this.commandBus.execute(new RevalidateRowCommand(jobId, rowId));
    return ApiResponse.success(result);
  }

  /** Bulk action on rows */
  @Post(':jobId/rows/bulk-action')
  @RequirePermissions('import:write')
  async bulkAction(@Param('jobId') jobId: string, @Body() dto: RowBulkActionDto) {
    const result = await this.commandBus.execute(new RowBulkActionCommand(jobId, dto.action));
    return ApiResponse.success(result);
  }

  /** Mapping suggestions for entity (pass ?headers=col1,col2 for smart matching) */
  @Get('mapping-suggestions/:targetEntity')
  @RequirePermissions('import:read')
  async mappingSuggestions(
    @Param('targetEntity') entity: string,
    @Query('headers') headers?: string,
  ) {
    const fileHeaders = headers ? headers.split(',').map((h) => h.trim()).filter(Boolean) : undefined;
    const result = await this.queryBus.execute(new GetMappingSuggestionsQuery(entity, fileHeaders));
    return ApiResponse.success(result);
  }
}
