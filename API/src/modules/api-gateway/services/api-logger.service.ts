import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

const SENSITIVE_FIELDS = ['password', 'secret', 'token', 'apiKey', 'creditCard', 'keyHash', 'keySecret'];

@Injectable()
export class ApiLoggerService {
  private readonly logger = new Logger(ApiLoggerService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(params: {
    tenantId: string;
    apiKeyId: string;
    apiKeyName: string;
    method: string;
    path: string;
    queryParams?: any;
    requestBody?: any;
    statusCode: number;
    responseBody?: any;
    responseTimeMs: number;
    ip: string;
    userAgent?: string;
    requestId: string;
    rateLimitRemaining?: number;
    rateLimitUsed?: number;
    wasRateLimited?: boolean;
    errorCode?: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      const sanitizedBody = params.requestBody ? this.sanitize(params.requestBody) : null;
      const truncatedResponse = params.responseBody
        ? this.truncate(params.responseBody, 10240)
        : null;

      let level: 'API_INFO' | 'API_WARN' | 'API_ERROR' = 'API_INFO';
      if (params.statusCode >= 500) level = 'API_ERROR';
      else if (params.statusCode >= 400) level = 'API_WARN';

      await this.prisma.apiRequestLog.create({
        data: {
          tenantId: params.tenantId,
          apiKeyId: params.apiKeyId,
          apiKeyName: params.apiKeyName,
          method: params.method,
          path: params.path,
          queryParams: params.queryParams || undefined,
          requestBody: sanitizedBody,
          statusCode: params.statusCode,
          responseBody: truncatedResponse,
          responseTimeMs: params.responseTimeMs,
          ip: params.ip,
          userAgent: params.userAgent,
          requestId: params.requestId,
          rateLimitRemaining: params.rateLimitRemaining,
          rateLimitUsed: params.rateLimitUsed,
          wasRateLimited: params.wasRateLimited || false,
          errorCode: params.errorCode,
          errorMessage: params.errorMessage,
          level,
        },
      });
    } catch (err) {
      this.logger.error(`Failed to log API request: ${err.message}`);
    }
  }

  async listLogs(tenantId: string, query: {
    apiKeyId?: string;
    path?: string;
    statusCode?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = { tenantId };
    if (query.apiKeyId) where.apiKeyId = query.apiKeyId;
    if (query.path) where.path = { contains: query.path };
    if (query.statusCode) where.statusCode = query.statusCode;
    if (query.fromDate || query.toDate) {
      where.createdAt = {};
      if (query.fromDate) where.createdAt.gte = new Date(query.fromDate);
      if (query.toDate) where.createdAt.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 50;

    const [data, total] = await Promise.all([
      this.prisma.apiRequestLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.apiRequestLog.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async cleanup(retentionDays: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - retentionDays);

    const result = await this.prisma.apiRequestLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    this.logger.log(`Cleaned up ${result.count} API request logs older than ${retentionDays} days`);
    return result.count;
  }

  private sanitize(obj: any): any {
    if (typeof obj !== 'object' || obj === null) return obj;
    const result = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const key of Object.keys(result)) {
      if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
        result[key] = '***REDACTED***';
      } else if (typeof result[key] === 'object') {
        result[key] = this.sanitize(result[key]);
      }
    }
    return result;
  }

  private truncate(obj: any, maxBytes: number): any {
    const str = JSON.stringify(obj);
    if (str.length <= maxBytes) return obj;
    return { _truncated: true, _size: str.length, _preview: str.substring(0, 500) };
  }
}
