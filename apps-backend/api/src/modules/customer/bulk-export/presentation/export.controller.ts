import { Controller, Post, Get, Param, Query, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AuditSkip } from '../../../core/identity/audit/decorators/audit-skip.decorator';
import { ExportService } from '../services/export.service';
import { CreateExportDto } from './dto/export.dto';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('export')
@UseGuards(JwtAuthGuard)
@AuditSkip()
export class ExportController {
  constructor(
    private readonly exportService: ExportService,
    private readonly prisma: PrismaService,
  ) {}

  /** Create export job */
  @Post()
  @RequirePermissions('export:write')
  async create(@Body() dto: CreateExportDto, @CurrentUser() user: any) {
    const result = await this.exportService.createExport({
      targetEntity: dto.targetEntity,
      format: dto.format || 'xlsx',
      filters: dto.filters,
      columns: dto.columns,
      createdById: user.id,
      createdByName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    });
    return ApiResponse.success(result, 'Export started');
  }

  /** List export jobs */
  @Get('jobs')
  @RequirePermissions('export:read')
  async list(@Query() q: any) {
    const page = +q.page || 1;
    const limit = +q.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.working.exportJob.findMany({ skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.working.exportJob.count(),
    ]);
    return ApiResponse.paginated(data, total, page, limit);
  }

  /** Download export file */
  @Get(':jobId/download')
  @RequirePermissions('export:read')
  async download(@Param('jobId') jobId: string, @Res() res: Response) {
    const job = await this.prisma.working.exportJob.findUniqueOrThrow({ where: { id: jobId } });
    if (!job.fileUrl) return res.status(404).json(ApiResponse.error('File not ready'));

    const filePath = path.join(process.cwd(), 'uploads', job.fileUrl);
    if (!fs.existsSync(filePath)) return res.status(404).json(ApiResponse.error('File not found'));

    return res.download(filePath);
  }

  /** Download blank template */
  @Get('template/:entityType')
  @RequirePermissions('export:read')
  async template(@Param('entityType') entityType: string, @Res() res: Response) {
    const buffer = await this.exportService.generateTemplate(entityType);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${entityType.toLowerCase()}-template.xlsx`);
    res.send(buffer);
  }
}
