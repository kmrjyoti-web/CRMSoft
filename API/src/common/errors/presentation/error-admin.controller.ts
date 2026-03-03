import {
  Controller,
  Get,
  Delete,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { generateErrorReference } from '../error-docs-generator';
import { ERROR_CODES, TOTAL_ERROR_CODES } from '../error-codes';

@Controller('admin/errors')
@UseGuards(JwtAuthGuard)
export class ErrorAdminController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /admin/errors/codes
   * Returns all error codes with their metadata.
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
   * Returns a single error code definition.
   */
  @Get('codes/:code')
  getErrorCode(@Param('code') code: string) {
    const def = ERROR_CODES[code];
    if (!def) {
      return { found: false, code };
    }
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

  /**
   * GET /admin/errors/logs
   * Lists error logs with pagination and filtering.
   */
  @Get('logs')
  async listErrorLogs(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('errorCode') errorCode?: string,
    @Query('tenantId') tenantId?: string,
    @Query('statusCode') statusCode?: string,
  ) {
    const where: any = {};
    if (errorCode) where.errorCode = errorCode;
    if (tenantId) where.tenantId = tenantId;
    if (statusCode) where.statusCode = Number(statusCode);

    const [data, total] = await Promise.all([
      this.prisma.errorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.errorLog.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number(limit));
    return {
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext: Number(page) < totalPages,
        hasPrevious: Number(page) > 1,
      },
    };
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
    const where: any = {};
    if (tenantId) where.tenantId = tenantId;
    if (since) where.createdAt = { gte: new Date(since) };

    const stats = await this.prisma.errorLog.groupBy({
      by: ['errorCode'],
      where,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const total = await this.prisma.errorLog.count({ where });

    return {
      total,
      byCode: stats.map((s) => ({
        errorCode: s.errorCode,
        count: s._count.id,
      })),
    };
  }

  /**
   * DELETE /admin/errors/logs/:id
   * Delete a single error log entry.
   */
  @Delete('logs/:id')
  async deleteErrorLog(@Param('id') id: string) {
    await this.prisma.errorLog.delete({ where: { id } });
    return { deleted: true };
  }
}
