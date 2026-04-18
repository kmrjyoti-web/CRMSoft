"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkExportModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const export_controller_1 = require("./presentation/export.controller");
const export_service_1 = require("./services/export.service");
let BulkExportModule = class BulkExportModule {
};
exports.BulkExportModule = BulkExportModule;
exports.BulkExportModule = BulkExportModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [export_controller_1.ExportController],
        providers: [export_service_1.ExportService],
        exports: [export_service_1.ExportService],
    })
], BulkExportModule);
//# sourceMappingURL=bulk-export.module.js.map