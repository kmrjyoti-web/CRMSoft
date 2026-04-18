export declare class UpdateJobDto {
    cronExpression?: string;
    cronDescription?: string;
    timezone?: string;
    timeoutSeconds?: number;
    maxRetries?: number;
    retryDelaySeconds?: number;
    allowConcurrent?: boolean;
    alertOnFailure?: boolean;
    alertOnTimeout?: boolean;
    alertAfterConsecutiveFailures?: number;
    alertChannel?: string;
    alertRecipientEmails?: string[];
    alertRecipientUserIds?: string[];
}
export declare class UpdateJobParamsDto {
    jobParams?: Record<string, any>;
}
export declare class ToggleJobDto {
    status: string;
}
