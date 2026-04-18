import { IReportRenderer, RenderOptions } from '../interfaces/renderer.interface';
import { ReportData } from '../interfaces/report.interface';
export declare class ReportRendererCsvService implements IReportRenderer {
    render(data: ReportData, _options?: RenderOptions): Promise<Buffer>;
    private escape;
    private formatValue;
}
