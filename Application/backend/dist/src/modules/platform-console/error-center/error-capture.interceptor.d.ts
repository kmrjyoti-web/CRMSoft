import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
export declare class ErrorCaptureInterceptor implements NestInterceptor {
    private readonly db;
    private readonly logger;
    constructor(db: PlatformConsolePrismaService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    private captureError;
}
