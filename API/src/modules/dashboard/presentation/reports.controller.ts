import { Controller, Get, Post, Body, Param, Query, Res, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Response } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../common/utils/api-response';
import { ExportReportDto } from './dto/export-report.dto';
import { ExportReportCommand } from '../application/commands/export-report/export-report.command';
import { GetReportExportsQuery } from '../application/queries/get-report-exports/get-report-exports.query';
import * as fs from 'fs';
import * as path from 'path';

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Post('export')
  @RequirePermissions('reports:export')
  async exportReport(@Body() dto: ExportReportDto, @CurrentUser() user: any) {
    const result = await this.commandBus.execute(
      new ExportReportCommand(
        dto.reportType, dto.format,
        { dateFrom: dto.dateFrom ? new Date(dto.dateFrom) : undefined, dateTo: dto.dateTo ? new Date(dto.dateTo) : undefined, userId: dto.userId, status: dto.status },
        user.id, `${user.firstName} ${user.lastName}`,
      ),
    );
    return ApiResponse.success(result, 'Report generated');
  }

  @Get('exports')
  @RequirePermissions('reports:read')
  async exportHistory(@CurrentUser('id') userId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.queryBus.execute(
      new GetReportExportsQuery(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 20),
    );
    return ApiResponse.success(result);
  }

  @Get('exports/:id/download')
  @RequirePermissions('reports:read')
  async download(@Param('id') id: string, @Res() res: Response) {
    const log = await this.queryBus.execute(new GetReportExportsQuery(id));
    if (log?.data?.[0]?.fileUrl && fs.existsSync(log.data[0].fileUrl)) {
      const filePath = log.data[0].fileUrl;
      const ext = path.extname(filePath);
      const contentTypes: Record<string, string> = {
        '.csv': 'text/csv', '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.json': 'application/json', '.pdf': 'application/pdf',
      };
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.status(404).json(ApiResponse.error('File not found'));
    }
  }
}
