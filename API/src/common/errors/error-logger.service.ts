import { Injectable, Logger, Optional, Inject } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface ErrorLogEntry {
  requestId: string;
  errorCode: string;
  message: string;
  statusCode: number;
  path: string;
  method: string;
  layer?: 'BE' | 'FE' | 'DB' | 'MOB';
  severity?: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  userId?: string;
  tenantId?: string;
  details?: any;
  stack?: string;
  ip?: string;
  userAgent?: string;
  module?: string;
  requestBody?: any;
  queryParams?: any;
  metadata?: any;
  requestHeaders?: any;
  responseBody?: any;
  responseTimeMs?: number;
  userName?: string;
  userRole?: string;
  tenantName?: string;
  industryCode?: string;
}

/** Sensitive keys to redact from request bodies. */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'apiKey', 'accessToken', 'refreshToken'];

/**
 * Logs errors to both console and database (fire-and-forget).
 * Never throws — logging must never interrupt the error response.
 */
@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger('ErrorLogger');

  constructor(
    private readonly prisma: PrismaService,
    @Optional() @Inject('ErrorAutoReportService') private readonly autoReportService?: any,
  ) {}

  /** Log an error entry (async, fire-and-forget). */
  log(entry: ErrorLogEntry): void {
    // Console log synchronously
    const tag = `[${entry.requestId}] ${entry.errorCode} ${entry.method} ${entry.path}`;
    if (entry.statusCode >= 500) {
      this.logger.error(`${tag} — ${entry.message}`, entry.stack);
    } else {
      this.logger.warn(`${tag} — ${entry.message}`);
    }

    // Async DB persist (fire-and-forget) — persist ALL errors
    this.persistAsync(entry);
  }

  /** Get a single error log by ID. */
  async getById(id: string) {
    return this.prisma.errorLog.findUnique({ where: { id } });
  }

  /** Look up error logs by trace/request ID. */
  async getByTraceId(traceId: string) {
    return this.prisma.errorLog.findMany({
      where: { requestId: traceId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Get recent error logs with pagination. */
  async getRecent(options: {
    page?: number;
    limit?: number;
    errorCode?: string;
    tenantId?: string;
    layer?: string;
    severity?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const where: any = {};
    if (options.errorCode) where.errorCode = options.errorCode;
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.layer) where.layer = options.layer;
    if (options.severity) where.severity = options.severity;
    if (options.status) where.status = options.status;
    if (options.dateFrom || options.dateTo) {
      where.createdAt = {};
      if (options.dateFrom) where.createdAt.gte = new Date(options.dateFrom);
      if (options.dateTo) where.createdAt.lte = new Date(options.dateTo);
    }

    const [data, total] = await Promise.all([
      this.prisma.errorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.errorLog.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1,
      },
    };
  }

  /** Get error statistics grouped by code and severity. */
  async getStats(options?: { tenantId?: string; since?: string }) {
    const where: any = {};
    if (options?.tenantId) where.tenantId = options.tenantId;
    if (options?.since) where.createdAt = { gte: new Date(options.since) };

    const [byCodeStats, bySeverityStats, total] = await Promise.all([
      this.prisma.errorLog.groupBy({
        by: ['errorCode'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.errorLog.groupBy({
        by: ['severity'],
        where,
        _count: { id: true },
      }),
      this.prisma.errorLog.count({ where }),
    ]);

    const bySeverity: Record<string, number> = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
    for (const s of bySeverityStats) {
      bySeverity[s.severity] = s._count.id;
    }

    return {
      total,
      byCode: byCodeStats.map((s) => ({
        errorCode: s.errorCode,
        count: s._count.id,
      })),
      bySeverity,
    };
  }

  /** Get errors by severity for a tenant. */
  async getBySeverity(tenantId: string, severity: string, limit = 50) {
    return this.prisma.errorLog.findMany({
      where: { tenantId, severity: severity as any },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /** Resolve an error log. */
  async resolve(id: string, data: { resolvedById: string; resolution: string }) {
    return this.prisma.errorLog.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedById: data.resolvedById,
        resolution: data.resolution,
      },
    });
  }

  /** Assign an error log to someone. */
  async assign(id: string, data: { assignedToId: string; assignedToName: string }) {
    return this.prisma.errorLog.update({
      where: { id },
      data: {
        status: 'ASSIGNED',
        assignedToId: data.assignedToId,
        assignedToName: data.assignedToName,
      },
    });
  }

  /** Mark an error log as ignored. */
  async ignore(id: string) {
    return this.prisma.errorLog.update({
      where: { id },
      data: { status: 'IGNORED' },
    });
  }

  /** Get error count trends grouped by day. */
  async getTrends(options?: { tenantId?: string; days?: number }) {
    const days = options?.days || 14;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = { createdAt: { gte: since } };
    if (options?.tenantId) where.tenantId = options.tenantId;

    const logs = await this.prisma.errorLog.findMany({
      where,
      select: { createdAt: true, severity: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by date string
    const trendMap: Record<string, { total: number; bySeverity: Record<string, number> }> = {};
    for (let d = 0; d < days; d++) {
      const date = new Date(since);
      date.setDate(date.getDate() + d);
      const key = date.toISOString().slice(0, 10);
      trendMap[key] = { total: 0, bySeverity: { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 } };
    }

    for (const log of logs) {
      const key = log.createdAt.toISOString().slice(0, 10);
      if (trendMap[key]) {
        trendMap[key].total++;
        trendMap[key].bySeverity[log.severity]++;
      }
    }

    return Object.entries(trendMap).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }

  /** Sanitize request body by redacting sensitive fields. */
  static sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;
    const sanitized = { ...body };
    for (const key of Object.keys(sanitized)) {
      if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      }
    }
    return sanitized;
  }

  /** Sanitize headers by removing auth tokens and cookies. */
  static sanitizeHeaders(headers: Record<string, any>): Record<string, any> {
    if (!headers) return {};
    const safe = { ...headers };
    delete safe.authorization;
    delete safe.cookie;
    delete safe['set-cookie'];
    return safe;
  }

  private async persistAsync(entry: ErrorLogEntry): Promise<void> {
    try {
      const created = await this.prisma.errorLog.create({
        data: {
          requestId: entry.requestId,
          errorCode: entry.errorCode,
          message: entry.message,
          statusCode: entry.statusCode,
          layer: (entry.layer as any) || 'BE',
          severity: (entry.severity as any) || (entry.statusCode >= 500 ? 'ERROR' : 'WARNING'),
          path: entry.path,
          method: entry.method,
          userId: entry.userId,
          tenantId: entry.tenantId,
          details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
          stack: entry.stack?.slice(0, 4000),
          ip: entry.ip,
          userAgent: entry.userAgent?.slice(0, 500),
          module: entry.module,
          requestBody: entry.requestBody ? ErrorLoggerService.sanitizeBody(entry.requestBody) : undefined,
          queryParams: entry.queryParams,
          metadata: entry.metadata,
          requestHeaders: entry.requestHeaders ? ErrorLoggerService.sanitizeHeaders(entry.requestHeaders) : undefined,
          responseBody: entry.responseBody ? JSON.parse(JSON.stringify(entry.responseBody)) : undefined,
          responseTimeMs: entry.responseTimeMs,
          userName: entry.userName,
          userRole: entry.userRole,
          tenantName: entry.tenantName,
          industryCode: entry.industryCode,
        },
      });

      // Auto-report for HIGH severity errors
      if ((entry.severity === 'ERROR' || entry.severity === 'CRITICAL') && this.autoReportService) {
        this.autoReportService.checkAndReport(created);
      }
    } catch (err) {
      this.logger.error(`Failed to persist error log: ${err.message}`);
    }
  }
}
