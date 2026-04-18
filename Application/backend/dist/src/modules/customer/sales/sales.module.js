"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesModule = void 0;
const common_1 = require("@nestjs/common");
const sales_controller_1 = require("./presentation/sales.controller");
const sale_order_service_1 = require("./services/sale-order.service");
const delivery_challan_service_1 = require("./services/delivery-challan.service");
const sale_return_service_1 = require("./services/sale-return.service");
const credit_note_enhanced_service_1 = require("./services/credit-note-enhanced.service");
const debit_note_service_1 = require("./services/debit-note.service");
let SalesModule = class SalesModule {
};
exports.SalesModule = SalesModule;
exports.SalesModule = SalesModule = __decorate([
    (0, common_1.Module)({
        controllers: [sales_controller_1.SalesController],
        providers: [
            sale_order_service_1.SaleOrderService,
            delivery_challan_service_1.DeliveryChallanService,
            sale_return_service_1.SaleReturnService,
            credit_note_enhanced_service_1.CreditNoteEnhancedService,
            debit_note_service_1.DebitNoteService,
        ],
        exports: [sale_order_service_1.SaleOrderService, delivery_challan_service_1.DeliveryChallanService],
    })
], SalesModule);
//# sourceMappingURL=sales.module.js.map