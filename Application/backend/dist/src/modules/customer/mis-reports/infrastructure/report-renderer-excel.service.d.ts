import { IReportRenderer, RenderOptions } from '../interfaces/renderer.interface';
import { ReportData } from '../interfaces/report.interface';
export declare class ReportRendererExcelService implements IReportRenderer {
    render(data: ReportData, options?: RenderOptions): Promise<Buffer>;
    private buildSummarySheet;
    private buildDataSheet;
    private formatMetricValue;
    private formatCellValue;
}
