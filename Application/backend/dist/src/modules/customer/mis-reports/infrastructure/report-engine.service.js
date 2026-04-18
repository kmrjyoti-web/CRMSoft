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
var ReportEngineService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportEngineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const fs = require("fs");
const path = require("path");
const period_comparator_service_1 = require("./period-comparator.service");
const report_renderer_excel_service_1 = require("./report-renderer-excel.service");
const report_renderer_csv_service_1 = require("./report-renderer-csv.service");
const report_renderer_pdf_service_1 = require("./report-renderer-pdf.service");
let ReportEngineService = ReportEngineService_1 = class ReportEngineService {
    constructor(prisma, comparator, excelRenderer, csvRenderer, pdfRenderer) {
        this.prisma = prisma;
        this.comparator = comparator;
        this.excelRenderer = excelRenderer;
        this.csvRenderer = csvRenderer;
        this.pdfRenderer = pdfRenderer;
        this.logger = new common_1.Logger(ReportEngineService_1.name);
        this.registry = new Map();
        this.exportDir = path.join(process.cwd(), 'tmp', 'mis-reports');
        if (!fs.existsSync(this.exportDir)) {
            fs.mkdirSync(this.exportDir, { recursive: true });
        }
    }
    registerReport(report) {
        this.registry.set(report.code, report);
        this.logger.log(`Registered report: ${report.code} (${report.name})`);
    }
    getDefinitions(category) {
        const defs = [];
        for (const r of this.registry.values()) {
            if (category && r.category !== category)
                continue;
            defs.push(this.toMeta(r));
        }
        return defs;
    }
    getDefinition(code) {
        const report = this.registry.get(code);
        if (!report)
            throw new common_1.NotFoundException(`Report "${code}" not found`);
        return this.toMeta(report);
    }
    toMeta(r) {
        return {
            code: r.code, name: r.name, category: r.category, description: r.description,
            availableFilters: r.availableFilters, supportsDrillDown: r.supportsDrillDown,
            supportsPeriodComparison: r.supportsPeriodComparison,
        };
    }
    async generate(code, params) {
        const report = this.registry.get(code);
        if (!report)
            throw new common_1.NotFoundException(`Report "${code}" not found`);
        const data = await report.generate(params);
        if (params.comparePrevious && report.supportsPeriodComparison) {
            const prevPeriod = this.comparator.getComparisonPeriod(params.dateFrom, params.dateTo);
            const prevData = await report.generate({
                ...params,
                dateFrom: prevPeriod.from,
                dateTo: prevPeriod.to,
                comparePrevious: false,
            });
            data.comparison = {
                metrics: this.comparator.compare(data.summary, prevData.summary),
            };
        }
        return data;
    }
    async export(code, params, format, userId, userName, source = 'MANUAL') {
        const startTime = Date.now();
        const data = await this.generate(code, params);
        const renderer = this.getRenderer(format);
        const buffer = await renderer.render(data);
        const fileName = `${code}_${Date.now()}.${format.toLowerCase()}`;
        const filePath = path.join(this.exportDir, fileName);
        fs.writeFileSync(filePath, buffer);
        const generationTimeMs = Date.now() - startTime;
        const recordCount = data.tables.reduce((sum, t) => sum + t.rows.length, 0);
        await this.prisma.working.reportExportLog.create({
            data: {
                reportType: 'CUSTOM',
                reportCode: code,
                reportName: data.reportName,
                format: format,
                filters: params,
                recordCount,
                fileUrl: filePath,
                fileSize: buffer.length,
                status: 'COMPLETED',
                generatedAt: new Date(),
                duration: generationTimeMs,
                generationTimeMs,
                exportedById: userId,
                exportedByName: userName,
                exportSource: source,
            },
        });
        return { fileUrl: filePath, fileName, fileSize: buffer.length, recordCount, generationTimeMs };
    }
    async drillDown(code, drillParams) {
        const report = this.registry.get(code);
        if (!report)
            throw new common_1.NotFoundException(`Report "${code}" not found`);
        if (!report.supportsDrillDown || !report.drillDown) {
            throw new common_1.NotFoundException(`Report "${code}" does not support drill-down`);
        }
        return report.drillDown(drillParams);
    }
    getRenderer(format) {
        switch (format.toUpperCase()) {
            case 'XLSX': return this.excelRenderer;
            case 'CSV': return this.csvRenderer;
            case 'PDF': return this.pdfRenderer;
            default: return this.excelRenderer;
        }
    }
};
exports.ReportEngineService = ReportEngineService;
exports.ReportEngineService = ReportEngineService = ReportEngineService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        period_comparator_service_1.PeriodComparatorService,
        report_renderer_excel_service_1.ReportRendererExcelService,
        report_renderer_csv_service_1.ReportRendererCsvService,
        report_renderer_pdf_service_1.ReportRendererPdfService])
], ReportEngineService);
//# sourceMappingURL=report-engine.service.js.map