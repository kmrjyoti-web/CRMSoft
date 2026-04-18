"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionPackageModule = void 0;
const common_1 = require("@nestjs/common");
const subscription_package_controller_1 = require("./presentation/subscription-package.controller");
const coupon_controller_1 = require("./presentation/coupon.controller");
const subscription_package_service_1 = require("./services/subscription-package.service");
const coupon_engine_service_1 = require("./services/coupon-engine.service");
let SubscriptionPackageModule = class SubscriptionPackageModule {
};
exports.SubscriptionPackageModule = SubscriptionPackageModule;
exports.SubscriptionPackageModule = SubscriptionPackageModule = __decorate([
    (0, common_1.Module)({
        controllers: [subscription_package_controller_1.SubscriptionPackageController, coupon_controller_1.CouponController],
        providers: [subscription_package_service_1.SubscriptionPackageService, coupon_engine_service_1.CouponEngineService],
        exports: [subscription_package_service_1.SubscriptionPackageService, coupon_engine_service_1.CouponEngineService],
    })
], SubscriptionPackageModule);
//# sourceMappingURL=subscription-package.module.js.map