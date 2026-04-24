import {
  Controller, Post, Body, UseGuards, NotFoundException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { ReportEngineService } from '../infrastructure/report-engine.service';
import { CustomReportDto, SaveCustomReportDto } from './dto/custom-report.dto';

/**
 * Controller for the custom (ad-hoc) report builder.
 * Lets users dynamically query any entity with flexible columns,
 * filters, grouping, and aggregation — and save as bookmarks.
 */
@Controller('mis-reports/custom')
@UseGuards(AuthGuard('jwt'))
export class CustomReportController {
  constructor(
    private readonly reportEngine: ReportEngineService,
    private readonly prisma: PrismaService,
  ) {}

  /** Build a custom report on the fly. */
  @Post()
  @RequirePermissions('reports:read')
  async build(@Body() dto: CustomReportDto, @CurrentUser() user: any) {
    const params = {
      dateFrom: new Date(dto.dateFrom),
      dateTo: new Date(dto.dateTo),
      tenantId: user.tenantId,
      page: dto.page,
      limit: dto.limit,
      filters: {
        entity: dto.entity,
        columns: dto.columns,
        entityFilters: dto.entityFilters,
        groupByField: dto.groupByField,
        aggregations: dto.aggregations,
        sortByField: dto.sortByField,
        sortDirection: dto.sortDirection,
        chartType: dto.chartType,
      },
    };

    const data = await this.reportEngine.generate('CUSTOM_REPORT', params);
    return ApiResponse.success(data, 'Custom report generated');
  }

  /** Save a custom report configuration as a bookmark. */
  @Post('save')
  @RequirePermissions('reports:create')
  async save(@Body() dto: SaveCustomReportDto, @CurrentUser('id') userId: string) {
    const reportDef = await this.prisma.working.reportDefinition.findFirst({
      where: { code: 'CUSTOM_REPORT' },
    });

    if (!reportDef) {
      throw new NotFoundException('Custom report definition not found');
    }

    const bookmark = await this.prisma.working.reportBookmark.create({
      data: {
        reportDefId: reportDef.id,
        userId,
        name: dto.name,
        filters: {
          entity: dto.entity,
          columns: dto.columns,
          entityFilters: dto.entityFilters,
          groupByField: dto.groupByField,
          aggregations: dto.aggregations,
          sortByField: dto.sortByField,
          sortDirection: dto.sortDirection,
          chartType: dto.chartType,
        },
        isPinned: dto.isPinned ?? false,
      },
      include: { reportDef: true },
    });

    return ApiResponse.success(bookmark, 'Custom report saved as bookmark');
  }
}
