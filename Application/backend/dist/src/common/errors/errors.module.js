"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorsModule = void 0;
const common_1 = require("@nestjs/common");
const error_catalog_service_1 = require("./error-catalog.service");
const error_logger_service_1 = require("./error-logger.service");
const error_auto_report_service_1 = require("./error-auto-report.service");
const error_admin_controller_1 = require("./presentation/error-admin.controller");
const frontend_error_controller_1 = require("./presentation/frontend-error.controller");
let ErrorsModule = class ErrorsModule {
};
exports.ErrorsModule = ErrorsModule;
exports.ErrorsModule = ErrorsModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        controllers: [error_admin_controller_1.ErrorAdminController, frontend_error_controller_1.FrontendErrorController],
        providers: [
            error_catalog_service_1.ErrorCatalogService,
            error_auto_report_service_1.ErrorAutoReportService,
            {
                provide: 'ErrorAutoReportService',
                useExisting: error_auto_report_service_1.ErrorAutoReportService,
            },
            error_logger_service_1.ErrorLoggerService,
        ],
        exports: [error_catalog_service_1.ErrorCatalogService, error_logger_service_1.ErrorLoggerService, error_auto_report_service_1.ErrorAutoReportService],
    })
], ErrorsModule);
//# sourceMappingURL=errors.module.js.map