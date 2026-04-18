import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ApiLoggerService } from '../services/api-logger.service';
export declare class ApiLoggingInterceptor implements NestInterceptor {
    private readonly apiLogger;
    private readonly logger;
    constructor(apiLogger: ApiLoggerService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
