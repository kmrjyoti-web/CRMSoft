import { Injectable, Logger } from '@nestjs/common';
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

  constructor(private readonly prisma: PrismaService) {}

  /** Log an error entry (async, fire-and-forget). */
  log(entry: ErrorLogEntry): void {
    // Console log synchronously
    const tag = `[${entry.requestId}] ${entry.errorCode} ${entry.method} ${entry.path}`;
    if (entry.statusCode >= 500) {
      this.logger.error(`${tag} — ${entry.message}`, entry.stack);
    } else {
      this.logger.warn(`${tag} — ${entry.message}`);
    }

    // Async DB persist (fire-and-forget)
    if (entry.statusCode >= 500 || this.shouldPersist(entry.errorCode)) {
      this.persistAsync(entry);
    }
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
  }) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const where: any = {};
    if (options.errorCode) where.errorCode = options.errorCode;
    if (options.tenantId) where.tenantId = options.tenantId;
    if (options.layer) where.layer = options.layer;
    if (options.severity) where.severity = options.severity;

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

  /** Get error statistics grouped by code. */
  async getStats(options?: { tenantId?: string; since?: string }) {
    const where: any = {};
    if (options?.tenantId) where.tenantId = options.tenantId;
    if (options?.since) where.createdAt = { gte: new Date(options.since) };

    const [stats, total] = await Promise.all([
      this.prisma.errorLog.groupBy({
        by: ['errorCode'],
        where,
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      this.prisma.errorLog.count({ where }),
    ]);

    return {
      total,
      byCode: stats.map((s) => ({
        errorCode: s.errorCode,
        count: s._count.id,
      })),
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
      await this.prisma.errorLog.create({
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
        },
      });
    } catch (err) {
      this.logger.error(`Failed to persist error log: ${err.message}`);
    }
  }

  private shouldPersist(errorCode: string): boolean {
    const persistCodes = [
      'AUTH_TOKEN_INVALID',
      'AUTH_ACCOUNT_LOCKED',
      'ENCRYPTION_FAILED',
      'CREDENTIAL_VERIFICATION_FAILED',
      'WORKFLOW_EXECUTION_FAILED',
    ];
    return persistCodes.includes(errorCode);
  }
}
