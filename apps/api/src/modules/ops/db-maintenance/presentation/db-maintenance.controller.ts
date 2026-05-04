import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DbMaintenanceService } from '../db-maintenance.service';

@Controller('ops/db-maintenance')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class DbMaintenanceController {
  constructor(private readonly maintenance: DbMaintenanceService) {}

  /** GET /ops/db-maintenance/summary — Database size + connection overview */
  @Get('summary')
  async summary() {
    const data = await this.maintenance.getDatabaseSummary();
    return ApiResponse.success(data);
  }

  /** GET /ops/db-maintenance/tables — Table stats (size, bloat, vacuum age) */
  @Get('tables')
  async tableStats(@Query('dbUrl') dbUrl?: string) {
    const data = await this.maintenance.getTableStats(dbUrl);
    return ApiResponse.success(data);
  }

  /** GET /ops/db-maintenance/indexes — Index stats (unused, duplicates) */
  @Get('indexes')
  async indexStats(@Query('dbUrl') dbUrl?: string) {
    const data = await this.maintenance.getIndexStats(dbUrl);
    return ApiResponse.success(data);
  }

  /** GET /ops/db-maintenance/bloat — Dead tuple bloat analysis */
  @Get('bloat')
  async bloatAnalysis(@Query('dbUrl') dbUrl?: string) {
    const data = await this.maintenance.getBloatAnalysis(dbUrl);
    return ApiResponse.success(data);
  }

  /** GET /ops/db-maintenance/slow-queries — Slowest queries via pg_stat_statements */
  @Get('slow-queries')
  async slowQueries(@Query('limit') limit?: string, @Query('dbUrl') dbUrl?: string) {
    const data = await this.maintenance.getSlowQueries(dbUrl, limit ? Number(limit) : 20);
    return ApiResponse.success(data);
  }

  /** GET /ops/db-maintenance/connections — Connection pool utilization */
  @Get('connections')
  async connections(@Query('dbUrl') dbUrl?: string) {
    const data = await this.maintenance.getConnectionPool(dbUrl);
    return ApiResponse.success(data);
  }

  /** POST /ops/db-maintenance/vacuum — Run VACUUM [FULL] [ANALYZE] */
  @Post('vacuum')
  async vacuum(
    @Body() body: { tableName?: string; full?: boolean; dbUrl?: string },
  ) {
    const result = await this.maintenance.runVacuum(body.tableName, body.full, body.dbUrl);
    return ApiResponse.success(result, result.success ? 'VACUUM completed' : 'VACUUM failed');
  }

  /** POST /ops/db-maintenance/analyze — Run ANALYZE */
  @Post('analyze')
  async analyze(@Body() body: { tableName?: string; dbUrl?: string }) {
    const result = await this.maintenance.runAnalyze(body.tableName, body.dbUrl);
    return ApiResponse.success(result, result.success ? 'ANALYZE completed' : 'ANALYZE failed');
  }

  /** POST /ops/db-maintenance/reindex — Run REINDEX CONCURRENTLY on a specific index */
  @Post('reindex')
  async reindex(@Body() body: { indexName: string; dbUrl?: string }) {
    const result = await this.maintenance.runReindex(body.indexName, body.dbUrl);
    return ApiResponse.success(result, result.success ? 'REINDEX completed' : 'REINDEX failed');
  }

  /** POST /ops/db-maintenance/cleanup/dev-logs — Delete DEBUG logs older than 7 days */
  @Post('cleanup/dev-logs')
  async cleanupDevLogs() {
    const result = await this.maintenance.cleanupDevLogs();
    return ApiResponse.success(result, `Deleted ${result.deleted} dev log entries`);
  }

  /** POST /ops/db-maintenance/cleanup/error-logs — Delete INFO/WARN logs older than 30 days */
  @Post('cleanup/error-logs')
  async cleanupErrorLogs() {
    const result = await this.maintenance.cleanupErrorLogs();
    return ApiResponse.success(result, `Deleted ${result.deleted} error log entries`);
  }

  /** POST /ops/db-maintenance/cleanup/audit-logs — Delete audit logs older than 90 days */
  @Post('cleanup/audit-logs')
  async cleanupAuditLogs() {
    const result = await this.maintenance.cleanupAuditLogs();
    return ApiResponse.success(result, `Deleted ${result.deleted} audit log entries`);
  }

  /** POST /ops/db-maintenance/cleanup/all — Run all cleanup jobs */
  @Post('cleanup/all')
  async cleanupAll() {
    const results = await this.maintenance.runAllCleanup();
    const total = results.reduce((s, r) => s + r.deleted, 0);
    return ApiResponse.success(results, `Cleanup complete — ${total} records deleted`);
  }
}
