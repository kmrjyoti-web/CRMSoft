import { IReportRenderer, RenderOptions } from '../interfaces/renderer.interface';
import { ReportData } from '../interfaces/report.interface';
export declare class ReportRendererPdfService implements IReportRenderer {
    render(data: ReportData, options?: RenderOptions): Promise<Buffer>;
    private renderTitle;
    private renderSummary;
    private renderTables;
    private renderTable;
    private addPageNumbers;
    private formatMetric;
    private formatCell;
}
