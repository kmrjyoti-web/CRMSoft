import { ErrorLoggerService } from '../error-logger.service';
export declare class FrontendErrorController {
    private readonly errorLoggerService;
    constructor(errorLoggerService: ErrorLoggerService);
    logFrontendError(req: any, body: {
        errorCode: string;
        message: string;
        stack?: string;
        url?: string;
        component?: string;
        userAction?: string;
        metadata?: Record<string, unknown>;
    }): {
        traceId: `${string}-${string}-${string}-${string}-${string}`;
        success: boolean;
    };
    logMobileError(req: any, body: {
        errorCode: string;
        message: string;
        stack?: string;
        screen?: string;
        action?: string;
        deviceInfo?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }): {
        traceId: `${string}-${string}-${string}-${string}-${string}`;
        success: boolean;
    };
}
