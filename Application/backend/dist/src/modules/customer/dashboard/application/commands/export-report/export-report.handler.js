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
var ExportReportHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportReportHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const export_report_command_1 = require("./export-report.command");
const report_export_service_1 = require("../../../services/report-export.service");
let ExportReportHandler = ExportReportHandler_1 = class ExportReportHandler {
    constructor(reportExportService) {
        this.reportExportService = reportExportService;
        this.logger = new common_1.Logger(ExportReportHandler_1.name);
    }
    async execute(command) {
        try {
            return this.reportExportService.exportReport({
                reportType: command.reportType,
                format: command.format,
                filters: command.filters,
                exportedById: command.exportedById,
                exportedByName: command.exportedByName,
            });
        }
        catch (error) {
            this.logger.error(`ExportReportHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ExportReportHandler = ExportReportHandler;
exports.ExportReportHandler = ExportReportHandler = ExportReportHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(export_report_command_1.ExportReportCommand),
    __metadata("design:paramtypes", [report_export_service_1.ReportExportService])
], ExportReportHandler);
//# sourceMappingURL=export-report.handler.js.map