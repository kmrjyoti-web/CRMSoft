import { Controller, Get, Post, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from '../infrastructure/report-engine.service';
import { GenerateReportDto } from './dto/generate-report.dto';
import { ExportReportDto } from './dto/export-report.dto';
import { DrillDownDto } from './dto/drill-down.dto';
import { QueryExportsDto } from './dto/query-exports.dto';

/**
 * Controller for MIS report generation, export, and drill-down operations.
 * Provides endpoints to list definitions, generate data, export files,
 * drill into dimensions, and manage export history.
 */
@Controller('mis-reports')
@UseGuards(AuthGuard('jwt'))
export class MisReportsController {
  constructor(
    private readonly reportEngine: ReportEngineService,
    private readonly prisma: PrismaService,
  ) {}

  /** List all available report definitions, optionally filtered by category. */
  @Get('definitions')
  @RequirePermissions('reports:read')
  async listDefinitions(@Query('category') category?: string) {
    const definitions = this.reportEngine.getDefinitions(category);
    return ApiResponse.success(definitions, 'Report definitions retrieved');
  }

  /** Get a single report definition with its available filters and metadata. */
  @Get('definitions/:code')
  @RequirePermissions('reports:read')
  async getDefinition(@Param('code') code: string) {
    const definition = this.reportEngine.getDefinition(code);
    return ApiResponse.success(definition, 'Report definition retrieved');
  }

  /** Generate report data as JSON for the given report code and parameters. */
  @Post('generate/:code')
  @RequirePermissions('reports:read')
  async generate(
    @Param('code') code: string,
    @Body() dto: GenerateReportDto,
    @CurrentUser() user: any,
  ) {
    const params = {
      dateFrom: new Date(dto.dateFrom),
      dateTo: new Date(dto.dateTo),
      userId: dto.userId,
      groupBy: dto.groupBy,
      filters: dto.filters,
      comparePrevious: dto.comparePrevious,
    };
    const data = await this.reportEngine.generate(code, params);
    return ApiResponse.success(data, 'Report generated');
  }

  /** Export a report to file (PDF, Excel, or CSV) and log the export. */
  @Post('export/:code')
  @RequirePermissions('reports:export')
  async exportReport(
    @Param('code') code: string,
    @Body() dto: ExportReportDto,
    @CurrentUser() user: any,
  ) {
    const params = {
      dateFrom: new Date(dto.dateFrom),
      dateTo: new Date(dto.dateTo),
      userId: dto.userId,
      groupBy: dto.groupBy,
      filters: dto.filters,
      comparePrevious: dto.comparePrevious,
    };
    const result = await this.reportEngine.export(
      code, params, dto.format, user.id,
      `${user.firstName} ${user.lastName}`, 'MANUAL',
    );
    return ApiResponse.success(result, 'Report exported');
  }

  /** Drill down into a specific dimension value of a report. */
  @Post('drill-down/:code')
  @RequirePermissions('reports:read')
  async drillDown(@Param('code') code: string, @Body() dto: DrillDownDto) {
    const drillParams = {
      reportCode: code,
      dimension: dto.dimension,
      value: dto.value,
      dateFrom: new Date(dto.dateFrom),
      dateTo: new Date(dto.dateTo),
      filters: dto.filters,
      page: dto.page || 1,
      limit: dto.limit || 20,
    };
    const result = await this.reportEngine.drillDown(code, drillParams);
    return ApiResponse.success(result, 'Drill-down data retrieved');
  }

  /** Get paginated export history filtered by report code and source. */
  @Get('exports')
  @RequirePermissions('reports:read')
  async getExports(@Query() dto: QueryExportsDto, @CurrentUser('id') userId: string) {
    const where: any = { exportedById: userId };
    if (dto.reportCode) where.reportCode = dto.reportCode;
    if (dto.exportSource) where.exportSource = dto.exportSource;

    const page = dto.page || 1;
    const limit = dto.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.working.reportExportLog.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.reportExportLog.count({ where }),
    ]);
    return ApiResponse.paginated(data, total, page, limit);
  }

  /** Download a previously exported report file by its export log ID. */
  @Get('exports/:id/download')
  @RequirePermissions('reports:read')
  async download(@Param('id') id: string, @Res() res: Response) {
    const exportLog = await this.prisma.working.reportExportLog.findFirst({ where: { id } });
    if (!exportLog || !exportLog.fileUrl) {
      return res.status(404).json(ApiResponse.error('Export file not found'));
    }

    const filePath = path.isAbsolute(exportLog.fileUrl)
      ? exportLog.fileUrl
      : path.join(process.cwd(), 'uploads', exportLog.fileUrl);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json(ApiResponse.error('File not found on disk'));
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.csv': 'text/csv',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.pdf': 'application/pdf',
    };
    res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    return fs.createReadStream(filePath).pipe(res);
  }
}
