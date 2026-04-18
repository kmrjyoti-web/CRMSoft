export declare class CreateWorkflowDto {
    name: string;
    code: string;
    entityType: string;
    description?: string;
    isDefault?: boolean;
    configJson?: Record<string, unknown>;
}
