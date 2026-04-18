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
exports.OffersController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_offer_command_1 = require("../application/commands/create-offer/create-offer.command");
const activate_offer_command_1 = require("../application/commands/activate-offer/activate-offer.command");
const redeem_offer_command_1 = require("../application/commands/redeem-offer/redeem-offer.command");
const get_offer_query_1 = require("../application/queries/get-offer/get-offer.query");
const list_offers_query_1 = require("../application/queries/list-offers/list-offers.query");
const check_eligibility_query_1 = require("../application/queries/check-eligibility/check-eligibility.query");
const create_offer_dto_1 = require("./dto/create-offer.dto");
let OffersController = class OffersController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId, tenantId) {
        const id = await this.commandBus.execute(new create_offer_command_1.CreateOfferCommand(tenantId, userId, userId, dto.title, dto.offerType, dto.discountType, dto.discountValue, dto.description, dto.mediaUrls, dto.linkedListingIds, dto.linkedCategoryIds, dto.primaryListingId, dto.conditions, dto.maxRedemptions, dto.autoCloseOnLimit, dto.resetTime, dto.publishAt ? new Date(dto.publishAt) : undefined, dto.expiresAt ? new Date(dto.expiresAt) : undefined));
        const offer = await this.queryBus.execute(new get_offer_query_1.GetOfferQuery(id, tenantId));
        return api_response_1.ApiResponse.success(offer, 'Offer created');
    }
    async findAll(tenantId, page, limit, status, offerType) {
        const result = await this.queryBus.execute(new list_offers_query_1.ListOffersQuery(tenantId, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20, status, offerType));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async findOne(id, tenantId) {
        const offer = await this.queryBus.execute(new get_offer_query_1.GetOfferQuery(id, tenantId));
        return api_response_1.ApiResponse.success(offer);
    }
    async activate(id, userId, tenantId) {
        await this.commandBus.execute(new activate_offer_command_1.ActivateOfferCommand(id, tenantId, userId));
        const offer = await this.queryBus.execute(new get_offer_query_1.GetOfferQuery(id, tenantId));
        return api_response_1.ApiResponse.success(offer, 'Offer activated');
    }
    async redeem(id, body, userId, tenantId) {
        const result = await this.commandBus.execute(new redeem_offer_command_1.RedeemOfferCommand(id, tenantId, userId, body.orderId, body.orderValue, body.quantity, undefined, undefined, body.city, body.state, body.pincode, body.deviceType));
        return api_response_1.ApiResponse.success(result, 'Offer redeemed');
    }
    async checkEligibility(id, userId, tenantId, orderValue, quantity, city, state) {
        const result = await this.queryBus.execute(new check_eligibility_query_1.CheckEligibilityQuery(id, tenantId, userId, city, state, undefined, undefined, undefined, undefined, orderValue ? parseInt(orderValue, 10) : undefined, quantity ? parseInt(quantity, 10) : undefined));
        return api_response_1.ApiResponse.success(result);
    }
};
exports.OffersController = OffersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new offer' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_offer_dto_1.CreateOfferDto, String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List offers' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __param(4, (0, common_1.Query)('offerType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get an offer by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(':id/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate an offer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "activate", null);
__decorate([
    (0, common_1.Post)(':id/redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem an offer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "redeem", null);
__decorate([
    (0, common_1.Get)(':id/check-eligibility'),
    (0, swagger_1.ApiOperation)({ summary: 'Check offer eligibility for current user' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(3, (0, common_1.Query)('orderValue')),
    __param(4, (0, common_1.Query)('quantity')),
    __param(5, (0, common_1.Query)('city')),
    __param(6, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OffersController.prototype, "checkEligibility", null);
exports.OffersController = OffersController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Offers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/offers'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], OffersController);
//# sourceMappingURL=offers.controller.js.map