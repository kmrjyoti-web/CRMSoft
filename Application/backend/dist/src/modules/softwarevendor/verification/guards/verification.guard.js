"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const verification_service_1 = require("../services/verification.service");
const require_verification_decorator_1 = require("../decorators/require-verification.decorator");
let VerificationGuard = class VerificationGuard {
    constructor(reflector, verificationService) {
        this.reflector = reflector;
        this.verificationService = verificationService;
    }
    async canActivate(context) {
        const requiredAction = this.reflector.getAllAndOverride(require_verification_decorator_1.REQUIRE_VERIFICATION_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredAction) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const canPerform = await this.verificationService.canPerformAction(userId, requiredAction);
        if (!canPerform) {
            const status = await this.verificationService.getVerificationStatus(userId);
            throw new common_1.ForbiddenException({
                errorCode: 'VERIFICATION_REQUIRED',
                message: this.getErrorMessage(requiredAction, status),
                verificationStatus: status.verificationStatus,
                emailVerified: status.emailVerified,
                mobileVerified: status.mobileVerified,
            });
        }
        return true;
    }
    getErrorMessage(action, status) {
        if (status.verificationStatus === 'UNVERIFIED') {
            return 'Please verify your email and mobile number to perform this action';
        }
        if (!status.emailVerified) {
            return 'Please verify your email to continue';
        }
        if (!status.mobileVerified) {
            return 'Please verify your mobile number to continue';
        }
        if (action === 'view_b2b_price' && !status.canSeeB2BPricing) {
            return 'Please verify your business GST to access wholesale pricing';
        }
        return 'Additional verification required';
    }
};
exports.VerificationGuard = VerificationGuard;
exports.VerificationGuard = VerificationGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        verification_service_1.VerificationService])
], VerificationGuard);
//# sourceMappingURL=verification.guard.js.map