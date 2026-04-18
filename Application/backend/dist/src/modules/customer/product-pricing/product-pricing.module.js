"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductPricingModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const product_pricing_controller_1 = require("./presentation/product-pricing.controller");
const set_product_prices_handler_1 = require("./application/commands/set-product-prices/set-product-prices.handler");
const set_group_price_handler_1 = require("./application/commands/set-group-price/set-group-price.handler");
const set_slab_price_handler_1 = require("./application/commands/set-slab-price/set-slab-price.handler");
const get_effective_price_handler_1 = require("./application/queries/get-effective-price/get-effective-price.handler");
const get_price_list_handler_1 = require("./application/queries/get-price-list/get-price-list.handler");
const CommandHandlers = [
    set_product_prices_handler_1.SetProductPricesHandler,
    set_group_price_handler_1.SetGroupPriceHandler,
    set_slab_price_handler_1.SetSlabPriceHandler,
];
const QueryHandlers = [
    get_effective_price_handler_1.GetEffectivePriceHandler,
    get_price_list_handler_1.GetPriceListHandler,
];
let ProductPricingModule = class ProductPricingModule {
};
exports.ProductPricingModule = ProductPricingModule;
exports.ProductPricingModule = ProductPricingModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [product_pricing_controller_1.ProductPricingController],
        providers: [...CommandHandlers, ...QueryHandlers],
    })
], ProductPricingModule);
//# sourceMappingURL=product-pricing.module.js.map