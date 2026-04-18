export declare class CreateTemplateDto {
    name: string;
    description?: string;
    reportCode?: string;
    layout: Record<string, any>;
    dataSource?: Record<string, any>;
    isPublic?: boolean;
}
