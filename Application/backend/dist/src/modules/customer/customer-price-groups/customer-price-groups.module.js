"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerPriceGroupsModule = void 0;
const common_1 = require("@nestjs/common");
const customer_price_groups_controller_1 = require("./presentation/customer-price-groups.controller");
let CustomerPriceGroupsModule = class CustomerPriceGroupsModule {
};
exports.CustomerPriceGroupsModule = CustomerPriceGroupsModule;
exports.CustomerPriceGroupsModule = CustomerPriceGroupsModule = __decorate([
    (0, common_1.Module)({
        controllers: [customer_price_groups_controller_1.CustomerPriceGroupsController],
    })
], CustomerPriceGroupsModule);
//# sourceMappingURL=customer-price-groups.module.js.map