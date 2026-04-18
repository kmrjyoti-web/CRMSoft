export interface SendReportParams {
    recipients: string[];
    reportName: string;
    format: string;
    fileBuffer: Buffer;
    fileName: string;
}
export declare class ReportEmailerService {
    private readonly logger;
    sendReport(params: SendReportParams): Promise<void>;
    validateRecipients(recipients: string[]): boolean;
}
