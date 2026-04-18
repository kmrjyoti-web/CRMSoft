"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationModule = void 0;
const common_1 = require("@nestjs/common");
const otp_service_1 = require("./services/otp.service");
const verification_service_1 = require("./services/verification.service");
const pricing_access_service_1 = require("./services/pricing-access.service");
const verification_controller_1 = require("./presentation/verification.controller");
const verification_guard_1 = require("./guards/verification.guard");
let VerificationModule = class VerificationModule {
};
exports.VerificationModule = VerificationModule;
exports.VerificationModule = VerificationModule = __decorate([
    (0, common_1.Module)({
        controllers: [verification_controller_1.VerificationController],
        providers: [
            otp_service_1.OtpService,
            verification_service_1.VerificationService,
            pricing_access_service_1.PricingAccessService,
            verification_guard_1.VerificationGuard,
        ],
        exports: [
            otp_service_1.OtpService,
            verification_service_1.VerificationService,
            pricing_access_service_1.PricingAccessService,
            verification_guard_1.VerificationGuard,
        ],
    })
], VerificationModule);
//# sourceMappingURL=verification.module.js.map