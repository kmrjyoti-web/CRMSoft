export interface CronJobResult {
    recordsProcessed?: number;
    recordsSucceeded?: number;
    recordsFailed?: number;
    details?: Record<string, any>;
}
export interface ICronJobHandler {
    readonly jobCode: string;
    execute(params: Record<string, any>, context?: {
        tenantId?: string;
    }): Promise<CronJobResult>;
}
export declare class JobRegistryService {
    private readonly logger;
    private handlers;
    register(handler: ICronJobHandler): void;
    getHandler(jobCode: string): ICronJobHandler | null;
    listRegistered(): string[];
}
