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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const coupon_engine_service_1 = require("../services/coupon-engine.service");
const coupon_dto_1 = require("./dto/coupon.dto");
let CouponController = class CouponController {
    constructor(couponEngine) {
        this.couponEngine = couponEngine;
    }
    async validate(dto, tenantId, userId) {
        const result = await this.couponEngine.validate(dto.couponCode, tenantId, userId, dto.packageCode, dto.amount);
        return api_response_1.ApiResponse.success(result);
    }
    async redeem(dto, tenantId, userId) {
        const redemption = await this.couponEngine.redeem(dto.couponCode, tenantId, userId, dto.discountApplied);
        return api_response_1.ApiResponse.success(redemption, 'Coupon redeemed successfully');
    }
    async create(dto) {
        const coupon = await this.couponEngine.create(dto);
        return api_response_1.ApiResponse.success(coupon, 'Coupon created');
    }
    async update(id, dto) {
        const coupon = await this.couponEngine.update(id, dto);
        return api_response_1.ApiResponse.success(coupon, 'Coupon updated');
    }
    async listAll(query) {
        const result = await this.couponEngine.listAll(query);
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.CouponController = CouponController;
__decorate([
    (0, common_1.Post)('validate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Validate a coupon code' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.ValidateCouponDto, String, String]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "validate", null);
__decorate([
    (0, common_1.Post)('redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem a coupon' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.RedeemCouponDto, String, String]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "redeem", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a coupon (admin)' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.CreateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a coupon (admin)' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, coupon_dto_1.UpdateCouponDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all coupons (admin)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [coupon_dto_1.CouponListQueryDto]),
    __metadata("design:returntype", Promise)
], CouponController.prototype, "listAll", null);
exports.CouponController = CouponController = __decorate([
    (0, swagger_1.ApiTags)('Coupons'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('coupons'),
    __metadata("design:paramtypes", [coupon_engine_service_1.CouponEngineService])
], CouponController);
//# sourceMappingURL=coupon.controller.js.map