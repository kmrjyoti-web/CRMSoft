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
var GetReportExportsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportExportsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_report_exports_query_1 = require("./get-report-exports.query");
const report_export_service_1 = require("../../../services/report-export.service");
let GetReportExportsHandler = GetReportExportsHandler_1 = class GetReportExportsHandler {
    constructor(reportExportService) {
        this.reportExportService = reportExportService;
        this.logger = new common_1.Logger(GetReportExportsHandler_1.name);
    }
    async execute(query) {
        try {
            return this.reportExportService.getExportHistory(query.userId, query.page, query.limit);
        }
        catch (error) {
            this.logger.error(`GetReportExportsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetReportExportsHandler = GetReportExportsHandler;
exports.GetReportExportsHandler = GetReportExportsHandler = GetReportExportsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_report_exports_query_1.GetReportExportsQuery),
    __metadata("design:paramtypes", [report_export_service_1.ReportExportService])
], GetReportExportsHandler);
//# sourceMappingURL=get-report-exports.handler.js.map