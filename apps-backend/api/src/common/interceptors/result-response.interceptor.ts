import { CallHandler, ExecutionContext, Injectable, NestInterceptor, HttpException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResultType, isErr } from '../types/result.type';

/**
 * ResultResponseInterceptor — unwraps functional ResultType<T> discriminated unions.
 *
 * For the class-based Result<T> (canonical), use the existing ResponseMapperInterceptor
 * in src/common/response/response-mapper.interceptor.ts.
 *
 * This interceptor handles handlers that return plain { success, data } / { success, error }
 * discriminated unions (the F2-1 functional style).
 */
@Injectable()
export class ResultResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data: unknown) => {
        if (
          data !== null &&
          typeof data === 'object' &&
          'success' in data
        ) {
          const result = data as ResultType<unknown>;
          if (isErr(result)) {
            throw new HttpException(
              { success: false, error: result.error },
              result.error.statusCode ?? 400,
            );
          }
          const okResult = result as { success: true; data: unknown };
          return { success: true, data: okResult.data };
        }
        return { success: true, data };
      }),
    );
  }
}
