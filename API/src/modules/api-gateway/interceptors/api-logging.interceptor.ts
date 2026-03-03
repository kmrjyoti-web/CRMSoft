import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { randomUUID } from 'crypto';
import { ApiLoggerService } from '../services/api-logger.service';

@Injectable()
export class ApiLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ApiLoggingInterceptor.name);

  constructor(private readonly apiLogger: ApiLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Only log public API requests (those with apiKey)
    if (!request.apiKey) return next.handle();

    const requestId = randomUUID();
    request.requestId = requestId;
    const start = Date.now();

    return next.handle().pipe(
      tap((responseBody) => {
        const elapsed = Date.now() - start;
        this.apiLogger.log({
          tenantId: request.tenantId,
          apiKeyId: request.apiKeyId,
          apiKeyName: request.apiKeyName || 'unknown',
          method: request.method,
          path: request.url,
          queryParams: request.query,
          requestBody: request.body,
          statusCode: response.statusCode,
          responseBody,
          responseTimeMs: elapsed,
          ip: request.ip || '0.0.0.0',
          userAgent: request.headers['user-agent'],
          requestId,
          rateLimitRemaining: request.rateLimitInfo?.remaining,
          rateLimitUsed: request.rateLimitInfo?.usage?.minute?.used,
          wasRateLimited: false,
        }).catch(err => this.logger.error(`Log failed: ${err.message}`));
      }),
      catchError((error) => {
        const elapsed = Date.now() - start;
        this.apiLogger.log({
          tenantId: request.tenantId,
          apiKeyId: request.apiKeyId,
          apiKeyName: request.apiKeyName || 'unknown',
          method: request.method,
          path: request.url,
          queryParams: request.query,
          requestBody: request.body,
          statusCode: error.status || 500,
          responseTimeMs: elapsed,
          ip: request.ip || '0.0.0.0',
          userAgent: request.headers['user-agent'],
          requestId,
          rateLimitRemaining: request.rateLimitInfo?.remaining,
          rateLimitUsed: request.rateLimitInfo?.usage?.minute?.used,
          wasRateLimited: error.status === 429,
          errorCode: error.code || error.errorCode,
          errorMessage: error.message,
        }).catch(err => this.logger.error(`Log failed: ${err.message}`));
        throw error;
      }),
    );
  }
}
