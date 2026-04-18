"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletModule = void 0;
const common_1 = require("@nestjs/common");
const wallet_controller_1 = require("./presentation/wallet.controller");
const wallet_admin_controller_1 = require("./presentation/wallet-admin.controller");
const wallet_service_1 = require("./services/wallet.service");
const wallet_transaction_service_1 = require("./services/wallet-transaction.service");
const recharge_service_1 = require("./services/recharge.service");
const coupon_service_1 = require("./services/coupon.service");
const service_rate_service_1 = require("./services/service-rate.service");
const wallet_analytics_service_1 = require("./services/wallet-analytics.service");
let WalletModule = class WalletModule {
};
exports.WalletModule = WalletModule;
exports.WalletModule = WalletModule = __decorate([
    (0, common_1.Module)({
        controllers: [wallet_controller_1.WalletController, wallet_admin_controller_1.WalletAdminController],
        providers: [
            wallet_service_1.WalletService,
            wallet_transaction_service_1.WalletTransactionService,
            recharge_service_1.RechargeService,
            coupon_service_1.CouponService,
            service_rate_service_1.ServiceRateService,
            wallet_analytics_service_1.WalletAnalyticsService,
        ],
        exports: [wallet_service_1.WalletService, wallet_transaction_service_1.WalletTransactionService, service_rate_service_1.ServiceRateService],
    })
], WalletModule);
//# sourceMappingURL=wallet.module.js.map