import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

export interface ErrorLogEntry {
  requestId: string;
  errorCode: string;
  message: string;
  statusCode: number;
  path: string;
  method: string;
  userId?: string;
  tenantId?: string;
  details?: any;
  stack?: string;
  ip?: string;
  userAgent?: string;
}

/**
 * Logs errors to both console and database.
 * Never throws — logging must never interrupt the error response.
 */
@Injectable()
export class ErrorLoggerService {
  private readonly logger = new Logger('ErrorLogger');

  constructor(private readonly prisma: PrismaService) {}

  async log(entry: ErrorLogEntry): Promise<void> {
    try {
      // Console log
      if (entry.statusCode >= 500) {
        this.logger.error(
          `[${entry.requestId}] ${entry.errorCode} ${entry.method} ${entry.path} — ${entry.message}`,
          entry.stack,
        );
      } else {
        this.logger.warn(
          `[${entry.requestId}] ${entry.errorCode} ${entry.method} ${entry.path} — ${entry.message}`,
        );
      }

      // DB log for 5xx and important 4xx errors
      if (entry.statusCode >= 500 || this.shouldPersist(entry.errorCode)) {
        await this.prisma.errorLog.create({
          data: {
            requestId: entry.requestId,
            errorCode: entry.errorCode,
            message: entry.message,
            statusCode: entry.statusCode,
            path: entry.path,
            method: entry.method,
            userId: entry.userId,
            tenantId: entry.tenantId,
            details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
            stack: entry.stack?.slice(0, 4000),
            ip: entry.ip,
            userAgent: entry.userAgent?.slice(0, 500),
          },
        });
      }
    } catch (err) {
      // Never let logging failures propagate
      this.logger.error(`Failed to log error: ${err.message}`);
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
