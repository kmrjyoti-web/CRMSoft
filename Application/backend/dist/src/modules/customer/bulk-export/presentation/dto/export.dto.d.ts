export declare class CreateExportDto {
    targetEntity: string;
    format?: string;
    filters?: Record<string, unknown>;
    columns?: string[];
}
export declare class ExportQueryDto {
    status?: string;
    page?: number;
    limit?: number;
}
