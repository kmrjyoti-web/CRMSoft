import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../decorators/current-user.decorator';
import { ErrorCatalogService } from '../error-catalog.service';
import { ErrorLoggerService } from '../error-logger.service';
import { ErrorAutoReportService } from '../error-auto-report.service';
import { ERROR_CODES, TOTAL_ERROR_CODES } from '../error-codes';
import { generateErrorReference } from '../error-docs-generator';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Controller('admin/errors')
@UseGuards(JwtAuthGuard)
export class ErrorAdminController {
  constructor(
    private readonly catalogService: ErrorCatalogService,
    private readonly loggerService: ErrorLoggerService,
    private readonly autoReportService: ErrorAutoReportService,
    private readonly prisma: PrismaService,
  ) {}

  // ═══════════════════════════════════════════════════
  // CATALOG (DB-backed with i18n)
  // ═══════════════════════════════════════════════════

  /**
   * GET /admin/errors/catalog
   * Returns all error catalog entries from DB (cached).
   */
  @Get('catalog')
  async listCatalog(@Query('module') module?: string, @Query('layer') layer?: string) {
    if (module) return this.catalogService.getByModule(module);
    if (layer) return this.catalogService.getByLayer(layer);
    return this.catalogService.getAll();
  }

  /**
   * GET /admin/errors/catalog/:code
   * Returns a single catalog entry by error code.
   */
  @Get('catalog/:code')
  async getCatalogEntry(@Param('code') code: string) {
    const entry = await this.catalogService.getByCode(code);
    if (!entry) return { found: false, code };
    return { found: true, ...entry };
  }

  /**
   * POST /admin/errors/catalog/refresh
   * Force-refresh the in-memory error catalog cache.
   */
  @Post('catalog/refresh')
  async refreshCatalog() {
    const count = await this.catalogService.refreshCache();
    return { refreshed: true, entries: count };
  }

  /**
   * PUT /admin/errors/catalog/:code
   * Update a catalog entry (messages, solutions, etc.)
   */
  @Put('catalog/:code')
  async updateCatalogEntry(
    @Param('code') code: string,
    @Body() body: {
      messageEn?: string;
      messageHi?: string;
      solutionEn?: string;
      solutionHi?: string;
      helpUrl?: string;
      isRetryable?: boolean;
    },
  ) {
    const updated = await this.prisma.errorCatalog.update({
      where: { code },
      data: body,
    });
    await this.catalogService.refreshCache();
    return updated;
  }

  /**
   * GET /admin/errors/modules
   * List distinct modules in the error catalog.
   */
  @Get('modules')
  async getModules() {
    const result = await this.prisma.errorCatalog.findMany({
      select: { module: true },
      distinct: ['module'],
    });
    return result.map((r) => r.module);
  }

  /**
   * GET /admin/errors/logs/severity/:severity
   * Get errors by severity for a tenant.
   */
  @Get('logs/severity/:severity')
  async getLogsBySeverity(
    @Param('severity') severity: string,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit = '50',
  ) {
    if (!tenantId) return [];
    return this.loggerService.getBySeverity(tenantId, severity, parseInt(limit));
  }

  // ═══════════════════════════════════════════════════
  // LEGACY CODES (TypeScript-based)
  // ═══════════════════════════════════════════════════

  /**
   * GET /admin/errors/codes
   * Returns all error codes from the TypeScript registry.
   */
  @Get('codes')
  listErrorCodes() {
    const codes = Object.values(ERROR_CODES).map((def) => ({
      code: def.code,
      httpStatus: def.httpStatus,
      message: def.message,
      suggestion: def.suggestion,
    }));
    return { total: TOTAL_ERROR_CODES, codes };
  }

  /**
   * GET /admin/errors/codes/:code
   * Returns a single error code definition from TypeScript registry.
   */
  @Get('codes/:code')
  getErrorCode(@Param('code') code: string) {
    const def = ERROR_CODES[code];
    if (!def) return { found: false, code };
    return { found: true, ...def };
  }

  /**
   * GET /admin/errors/docs
   * Returns the auto-generated error reference as markdown.
   */
  @Get('docs')
  getErrorDocs() {
    return { markdown: generateErrorReference() };
  }

  // ═══════════════════════════════════════════════════
  // LOGS
  // ═══════════════════════════════════════════════════

  /**
   * GET /admin/errors/logs
   * Lists error logs with pagination and filtering.
   */
  @Get('logs')
  async listErrorLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('errorCode') errorCode?: string,
    @Query('tenantId') tenantId?: string,
    @Query('layer') layer?: string,
    @Query('severity') severity?: string,
  ) {
    return this.loggerService.getRecent({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      errorCode,
      tenantId,
      layer,
      severity,
    });
  }

  /**
   * GET /admin/errors/logs/stats
   * Returns error log statistics (counts by error code).
   */
  @Get('logs/stats')
  async getErrorStats(
    @Query('tenantId') tenantId?: string,
    @Query('since') since?: string,
  ) {
    return this.loggerService.getStats({ tenantId, since });
  }

  /**
   * GET /admin/errors/trace/:traceId
   * Look up error logs by trace ID.
   */
  @Get('trace/:traceId')
  async getByTraceId(@Param('traceId') traceId: string) {
    const logs = await this.loggerService.getByTraceId(traceId);
    return { traceId, count: logs.length, logs };
  }

  // ═══════════════════════════════════════════════════
  // REPORT TO PROVIDER
  // ═══════════════════════════════════════════════════

  /**
   * POST /admin/errors/logs/:id/report-to-provider
   * Manually report a CRITICAL error to the software provider.
   * Vendor panel "Report to Provider" button calls this endpoint.
   */
  @Post('logs/:id/report-to-provider')
  @RequirePermissions('ops:manage')
  async reportToProvider(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.autoReportService.reportToProvider(id, userId);
    return {
      success: result.reported,
      message: result.reported
        ? 'Error reported to software provider successfully.'
        : 'Error log not found.',
    };
  }

  // ═══════════════════════════════════════════════════
  // FRONTEND ERROR LOGGING
  // ═══════════════════════════════════════════════════

  /**
   * POST /admin/errors/frontend
   * Accepts error reports from the frontend.
   */
  @Post('frontend')
  logFrontendError(
    @Body() body: {
      errorCode: string;
      message: string;
      path: string;
      userId?: string;
      tenantId?: string;
      details?: Record<string, unknown>;
      userAgent?: string;
    },
  ) {
    this.loggerService.log({
      requestId: `fe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      errorCode: body.errorCode || 'FE_UNKNOWN',
      message: body.message,
      statusCode: 0,
      path: body.path || '/',
      method: 'FRONTEND',
      layer: 'FE',
      severity: 'ERROR',
      userId: body.userId,
      tenantId: body.tenantId,
      details: body.details ? ErrorLoggerService.sanitizeBody(body.details) : undefined,
      userAgent: body.userAgent,
    });
    return { logged: true };
  }
}
