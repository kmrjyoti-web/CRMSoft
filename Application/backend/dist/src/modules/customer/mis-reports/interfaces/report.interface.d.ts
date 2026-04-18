export interface ReportParams {
    dateFrom: Date;
    dateTo: Date;
    userId?: string;
    groupBy?: string;
    filters?: Record<string, any>;
    comparePrevious?: boolean;
    tenantId?: string;
    page?: number;
    limit?: number;
}
export interface ReportMetric {
    key: string;
    label: string;
    value: number;
    previousValue?: number;
    changePercent?: number;
    changeDirection?: 'UP' | 'DOWN' | 'FLAT';
    format?: 'number' | 'currency' | 'percent' | 'days';
}
export interface ChartData {
    type: 'BAR' | 'LINE' | 'PIE' | 'DONUT' | 'FUNNEL' | 'HEATMAP' | 'STACKED_BAR' | 'AREA' | 'TABLE';
    title: string;
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        color?: string;
    }>;
}
export interface ColumnDef {
    key: string;
    header: string;
    width?: number;
    format?: 'currency' | 'date' | 'percent' | 'number';
}
export interface ReportData {
    reportCode: string;
    reportName: string;
    category: string;
    generatedAt: Date;
    params: ReportParams;
    summary: ReportMetric[];
    charts: ChartData[];
    tables: Array<{
        title: string;
        columns: ColumnDef[];
        rows: any[];
    }>;
    comparison?: {
        metrics: ReportMetric[];
    };
    metadata?: Record<string, any>;
}
export interface DrillDownParams {
    reportCode: string;
    dimension: string;
    value: string;
    dateFrom: Date;
    dateTo: Date;
    filters?: Record<string, any>;
    page: number;
    limit: number;
}
export interface DrillDownResult {
    dimension: string;
    value: string;
    columns: ColumnDef[];
    rows: any[];
    total: number;
    page: number;
    limit: number;
}
export interface ExportResult {
    fileUrl: string;
    fileName: string;
    fileSize: number;
    recordCount: number;
    generationTimeMs: number;
}
