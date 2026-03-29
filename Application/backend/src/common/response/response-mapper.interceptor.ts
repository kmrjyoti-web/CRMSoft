import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Result } from '../result';

/**
 * GLOBAL interceptor that wraps every controller response
 * into the standard ApiStandardResponse format.
 *
 * Handles:
 *   1. Result<T> from controller -> unwraps value or formats error
 *   2. ApiResponseBuilder output -> fills remaining fields
 *   3. Responses that already have __isApiResponse -> passes through
 *   4. __isResultError from Result.toErrorResponse() -> formats as error
 *   5. Raw data from controller -> auto-wraps in { success, data, ... }
 */
@Injectable()
export class ResponseMapperInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((data) => {
        // If controller already returned full ApiResponse -> pass through
        if (data && data.__isApiResponse) {
          return data;
        }

        // If controller returned a Result<T> instance
        if (data instanceof Result) {
          if (data.isOk) {
            return {
              success: true,
              statusCode: response.statusCode,
              message: this.getDefaultMessage(request.method),
              data: data.value ?? null,
              timestamp: new Date().toISOString(),
              path: request.url,
              requestId: request.requestId || 'unknown',
            };
          }
          // Failed Result — format as error response
          const err = data.error;
          response.status(err.httpStatus);
          return {
            success: false,
            statusCode: err.httpStatus,
            message: err.message,
            error: {
              code: err.code,
              message: err.message,
              details: err.details ?? null,
              suggestion: err.suggestion,
              documentationUrl: `/docs/errors#${err.code}`,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.requestId || 'unknown',
          };
        }

        // If controller returned __isResultError (from Result.toErrorResponse())
        if (data && data.__isResultError) {
          response.status(data.httpStatus);
          return {
            success: false,
            statusCode: data.httpStatus,
            message: data.message,
            error: {
              code: data.code,
              message: data.message,
              details: data.details ?? null,
              suggestion: data.suggestion,
              documentationUrl: `/docs/errors#${data.code}`,
            },
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.requestId || 'unknown',
          };
        }

        // If controller returned ApiResponseBuilder result -> fill extras
        if (data && data.__isBuilderResult) {
          const statusCode = data.statusCode ?? response.statusCode;
          response.status(statusCode);
          return {
            success: data.success ?? true,
            statusCode,
            message: data.message ?? this.getDefaultMessage(request.method),
            data: data.data ?? null,
            meta: data.meta ?? undefined,
            timestamp: new Date().toISOString(),
            path: request.url,
            requestId: request.requestId || 'unknown',
          };
        }

        // Raw data from controller -> auto-wrap
        return {
          success: true,
          statusCode: response.statusCode,
          message: this.getDefaultMessage(request.method),
          data: data ?? null,
          timestamp: new Date().toISOString(),
          path: request.url,
          requestId: request.requestId || 'unknown',
        };
      }),
    );
  }

  private getDefaultMessage(method: string): string {
    switch (method) {
      case 'GET':
        return 'Data fetched successfully';
      case 'POST':
        return 'Created successfully';
      case 'PUT':
      case 'PATCH':
        return 'Updated successfully';
      case 'DELETE':
        return 'Deleted successfully';
      default:
        return 'Request processed successfully';
    }
  }
}
