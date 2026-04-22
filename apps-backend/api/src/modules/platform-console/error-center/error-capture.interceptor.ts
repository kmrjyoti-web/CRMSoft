import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

@Injectable()
export class ErrorCaptureInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorCaptureInterceptor.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    return next.handle().pipe(
      catchError((err) => {
        const status = err?.status ?? err?.statusCode ?? 500;
        // Only capture 5xx server errors
        if (status >= 500) {
          this.captureError(err, req).catch(() => {
            // Silently ignore logging failures — never block request
          });
        }
        return throwError(() => err);
      }),
    );
  }

  private async captureError(err: any, req: any): Promise<void> {
    try {
      await this.db.globalErrorLog.create({
        data: {
          severity: 'HIGH',
          errorCode: err?.code ?? `HTTP_${err?.status ?? 500}`,
          message: err?.message ?? 'Unknown error',
          stackTrace: err?.stack,
          endpoint: `${req?.method} ${req?.url}`,
          httpStatus: err?.status ?? 500,
          userId: req?.user?.id,
          userAgent: req?.headers?.['user-agent'],
          ipAddress:
            req?.ip ?? req?.headers?.['x-forwarded-for'],
          requestContext: {
            method: req?.method,
            url: req?.url,
            params: req?.params,
            query: req?.query,
          },
        },
      });
    } catch (captureErr) {
      this.logger.warn(
        `ErrorCaptureInterceptor: failed to log error: ${(captureErr as Error).message}`,
      );
    }
  }
}
