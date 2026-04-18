"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_controller_1 = require("./presentation/inventory.controller");
const inventory_labels_controller_1 = require("./presentation/inventory-labels.controller");
const bom_controller_1 = require("./presentation/bom.controller");
const inventory_service_1 = require("./services/inventory.service");
const serial_service_1 = require("./services/serial.service");
const transaction_service_1 = require("./services/transaction.service");
const location_service_1 = require("./services/location.service");
const adjustment_service_1 = require("./services/adjustment.service");
const report_service_1 = require("./services/report.service");
const label_service_1 = require("./services/label.service");
const bom_formula_service_1 = require("./services/bom-formula.service");
const bom_calculation_service_1 = require("./services/bom-calculation.service");
const bom_production_service_1 = require("./services/bom-production.service");
const scrap_service_1 = require("./services/scrap.service");
const bom_report_service_1 = require("./services/bom-report.service");
let InventoryModule = class InventoryModule {
};
exports.InventoryModule = InventoryModule;
exports.InventoryModule = InventoryModule = __decorate([
    (0, common_1.Module)({
        controllers: [inventory_controller_1.InventoryController, inventory_labels_controller_1.InventoryLabelsController, bom_controller_1.BOMController],
        providers: [
            inventory_service_1.InventoryService,
            serial_service_1.SerialService,
            transaction_service_1.TransactionService,
            location_service_1.LocationService,
            adjustment_service_1.AdjustmentService,
            report_service_1.InventoryReportService,
            label_service_1.InventoryLabelService,
            bom_formula_service_1.BOMFormulaService,
            bom_calculation_service_1.BOMCalculationService,
            bom_production_service_1.BOMProductionService,
            scrap_service_1.ScrapService,
            bom_report_service_1.BOMReportService,
        ],
        exports: [inventory_service_1.InventoryService, serial_service_1.SerialService, transaction_service_1.TransactionService, bom_formula_service_1.BOMFormulaService, bom_calculation_service_1.BOMCalculationService],
    })
], InventoryModule);
//# sourceMappingURL=inventory.module.js.map