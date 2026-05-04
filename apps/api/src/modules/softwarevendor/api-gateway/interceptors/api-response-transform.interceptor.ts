import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    // Only transform public API responses
    if (!request.apiKey) return next.handle();

    return next.handle().pipe(
      map((data) => {
        // If already wrapped by ResponseMapperInterceptor, skip
        if (data && data.__isApiResponse) return data;

        const apiVersion = request.apiVersion || 'v1';

        // If data has pagination info, extract it
        if (data && data.data && data.total !== undefined) {
          return {
            object: 'list',
            data: data.data,
            pagination: {
              total: data.total,
              page: data.page,
              limit: data.limit,
              totalPages: data.totalPages,
              hasMore: data.page < data.totalPages,
            },
            apiVersion,
            requestId: request.requestId,
          };
        }

        // Single object response
        return {
          object: data && Array.isArray(data) ? 'list' : 'object',
          data: data,
          apiVersion,
          requestId: request.requestId,
        };
      }),
    );
  }
}
