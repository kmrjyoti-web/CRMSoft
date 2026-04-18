"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const STATUS_COLORS = {
    IMPORTED: '90EE90',
    FAILED: 'FF6B6B',
    SKIPPED: 'D3D3D3',
    DUPLICATE_EXACT: 'FFD700',
    DUPLICATE_FUZZY: 'FFA500',
    DUPLICATE_IN_FILE: 'DDA0DD',
    VALID: 'ADD8E6',
    INVALID: 'FFB6C1',
};
let ResultReportService = class ResultReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getResultSummary(jobId) {
        const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: jobId } });
        return {
            jobId: job.id,
            fileName: job.fileName,
            totalRows: job.totalRows,
            created: job.importedCount,
            updated: job.updatedCount,
            skipped: job.skippedRows,
            failed: job.failedCount,
            duplicateExact: job.duplicateExactRows,
            duplicateFuzzy: job.duplicateFuzzyRows,
            duplicateInFile: job.duplicateInFileRows,
            successRate: job.totalRows > 0
                ? Math.round(((job.importedCount + job.updatedCount) / job.totalRows) * 100)
                : 0,
            reportUrl: job.resultReportUrl || undefined,
            failedReportUrl: job.failedRowsReportUrl || undefined,
        };
    }
    async generateReport(jobId) {
        const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: jobId } });
        const rows = await this.prisma.working.importRow.findMany({
            where: { importJobId: jobId },
            orderBy: { rowNumber: 'asc' },
        });
        const dir = path.join(process.cwd(), 'uploads', 'reports');
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        const fullPath = path.join(dir, `import-report-${jobId.slice(0, 8)}.xlsx`);
        const failedPath = path.join(dir, `import-failed-${jobId.slice(0, 8)}.xlsx`);
        await this.buildExcel(rows, job, fullPath, false);
        const failedRows = rows.filter(r => r.rowStatus === 'FAILED' || r.rowStatus === 'INVALID');
        if (failedRows.length > 0) {
            await this.buildExcel(failedRows, job, failedPath, true);
        }
        await this.prisma.working.importJob.update({
            where: { id: jobId },
            data: {
                resultReportUrl: `/reports/import-report-${jobId.slice(0, 8)}.xlsx`,
                failedRowsReportUrl: failedRows.length > 0
                    ? `/reports/import-failed-${jobId.slice(0, 8)}.xlsx`
                    : null,
            },
        });
        return { fullPath, failedPath };
    }
    async buildExcel(rows, job, filePath, failedOnly) {
        const workbook = new ExcelJS.Workbook();
        const summary = workbook.addWorksheet('Summary');
        summary.columns = [{ header: 'Metric', key: 'metric', width: 25 }, { header: 'Value', key: 'value', width: 20 }];
        summary.addRow({ metric: 'File Name', value: job.fileName });
        summary.addRow({ metric: 'Total Rows', value: job.totalRows });
        summary.addRow({ metric: 'Created', value: job.importedCount });
        summary.addRow({ metric: 'Updated', value: job.updatedCount });
        summary.addRow({ metric: 'Skipped', value: job.skippedRows });
        summary.addRow({ metric: 'Failed', value: job.failedCount });
        summary.addRow({ metric: 'Completed At', value: job.completedAt?.toISOString() || 'N/A' });
        this.styleHeaderRow(summary);
        const title = failedOnly ? 'Failed Rows' : 'All Rows';
        const sheet = workbook.addWorksheet(title);
        sheet.columns = [
            { header: 'Row #', key: 'rowNumber', width: 8 },
            { header: 'Status', key: 'status', width: 18 },
            { header: 'Action', key: 'action', width: 12 },
            { header: 'Raw Data', key: 'rawData', width: 50 },
            { header: 'Entity ID', key: 'entityId', width: 38 },
            { header: 'Error / Detail', key: 'error', width: 50 },
            { header: 'Match Score', key: 'matchScore', width: 12 },
        ];
        this.styleHeaderRow(sheet);
        for (const row of rows) {
            const dataRow = sheet.addRow({
                rowNumber: row.rowNumber,
                status: row.rowStatus,
                action: row.importAction || '-',
                rawData: JSON.stringify(row.rowData).slice(0, 200),
                entityId: row.importedEntityId || '-',
                error: row.importError || this.formatErrors(row.validationErrors),
                matchScore: row.fuzzyMatchScore ? Number(row.fuzzyMatchScore).toFixed(2) : '-',
            });
            const color = STATUS_COLORS[row.rowStatus] || 'FFFFFF';
            dataRow.eachCell(cell => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: color } };
            });
        }
        sheet.autoFilter = { from: 'A1', to: 'G1' };
        await workbook.xlsx.writeFile(filePath);
    }
    styleHeaderRow(sheet) {
        const row = sheet.getRow(1);
        row.font = { bold: true, color: { argb: 'FFFFFF' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } };
    }
    formatErrors(errors) {
        if (!errors)
            return '-';
        if (Array.isArray(errors)) {
            return errors.map((e) => `${e.field}: ${e.message}`).join('; ');
        }
        return JSON.stringify(errors).slice(0, 200);
    }
};
exports.ResultReportService = ResultReportService;
exports.ResultReportService = ResultReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ResultReportService);
//# sourceMappingURL=result-report.service.js.map