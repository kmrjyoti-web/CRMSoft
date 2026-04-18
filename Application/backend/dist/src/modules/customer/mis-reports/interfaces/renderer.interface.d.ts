import { ReportData } from './report.interface';
export interface RenderOptions {
    title?: string;
    orientation?: 'portrait' | 'landscape';
    includeCharts?: boolean;
    includeTimestamp?: boolean;
}
export interface IReportRenderer {
    render(data: ReportData, options?: RenderOptions): Promise<Buffer>;
}
