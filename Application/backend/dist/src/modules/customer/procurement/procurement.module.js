"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProcurementModule = void 0;
const common_1 = require("@nestjs/common");
const inventory_module_1 = require("../../customer/inventory/inventory.module");
const procurement_controller_1 = require("./presentation/procurement.controller");
const unit_service_1 = require("./services/unit.service");
const rfq_service_1 = require("./services/rfq.service");
const purchase_quotation_service_1 = require("./services/purchase-quotation.service");
const compare_engine_service_1 = require("./services/compare-engine.service");
const purchase_order_service_1 = require("./services/purchase-order.service");
const goods_receipt_service_1 = require("./services/goods-receipt.service");
const purchase_invoice_service_1 = require("./services/purchase-invoice.service");
const procurement_dashboard_service_1 = require("./services/procurement-dashboard.service");
let ProcurementModule = class ProcurementModule {
};
exports.ProcurementModule = ProcurementModule;
exports.ProcurementModule = ProcurementModule = __decorate([
    (0, common_1.Module)({
        imports: [inventory_module_1.InventoryModule],
        controllers: [procurement_controller_1.ProcurementController],
        providers: [
            unit_service_1.UnitService,
            rfq_service_1.RFQService,
            purchase_quotation_service_1.PurchaseQuotationService,
            compare_engine_service_1.CompareEngineService,
            purchase_order_service_1.PurchaseOrderService,
            goods_receipt_service_1.GoodsReceiptService,
            purchase_invoice_service_1.PurchaseInvoiceService,
            procurement_dashboard_service_1.ProcurementDashboardService,
        ],
        exports: [unit_service_1.UnitService, purchase_order_service_1.PurchaseOrderService],
    })
], ProcurementModule);
//# sourceMappingURL=procurement.module.js.map