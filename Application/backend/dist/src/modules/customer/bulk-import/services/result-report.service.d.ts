import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface ResultSummary {
    jobId: string;
    fileName: string;
    totalRows: number;
    created: number;
    updated: number;
    skipped: number;
    failed: number;
    duplicateExact: number;
    duplicateFuzzy: number;
    duplicateInFile: number;
    successRate: number;
    reportUrl?: string;
    failedReportUrl?: string;
}
export declare class ResultReportService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getResultSummary(jobId: string): Promise<ResultSummary>;
    generateReport(jobId: string): Promise<{
        fullPath: string;
        failedPath: string;
    }>;
    private buildExcel;
    private styleHeaderRow;
    private formatErrors;
}
