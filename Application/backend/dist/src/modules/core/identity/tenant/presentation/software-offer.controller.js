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
exports.SoftwareOfferController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const super_admin_guard_1 = require("../infrastructure/super-admin.guard");
const super_admin_route_decorator_1 = require("../infrastructure/decorators/super-admin-route.decorator");
const software_offer_service_1 = require("../services/software-offer.service");
const create_software_offer_dto_1 = require("./dto/create-software-offer.dto");
const update_software_offer_dto_1 = require("./dto/update-software-offer.dto");
const api_response_1 = require("../../../../../common/utils/api-response");
let SoftwareOfferController = class SoftwareOfferController {
    constructor(softwareOfferService) {
        this.softwareOfferService = softwareOfferService;
    }
    async listAll(query) {
        const data = await this.softwareOfferService.listAll(query);
        return api_response_1.ApiResponse.success(data);
    }
    async create(body) {
        const offer = await this.softwareOfferService.create({
            name: body.name,
            code: body.code,
            description: body.description,
            offerType: body.offerType,
            value: body.value,
            applicablePlanIds: body.applicablePlanIds,
            validFrom: new Date(body.validFrom),
            validTo: new Date(body.validTo),
            maxRedemptions: body.maxRedemptions,
            autoApply: body.autoApply,
            terms: body.terms,
        });
        return api_response_1.ApiResponse.success(offer, 'Offer created');
    }
    async getById(id) {
        const offer = await this.softwareOfferService.getById(id);
        return api_response_1.ApiResponse.success(offer);
    }
    async update(id, body) {
        const updateData = { ...body };
        if (body.validFrom) {
            updateData.validFrom = new Date(body.validFrom);
        }
        if (body.validTo) {
            updateData.validTo = new Date(body.validTo);
        }
        const offer = await this.softwareOfferService.update(id, updateData);
        return api_response_1.ApiResponse.success(offer, 'Offer updated');
    }
    async deactivate(id) {
        const offer = await this.softwareOfferService.deactivate(id);
        return api_response_1.ApiResponse.success(offer, 'Offer deactivated');
    }
    async redeem(id, tenantId) {
        const result = await this.softwareOfferService.redeem(id, tenantId);
        return api_response_1.ApiResponse.success(result, 'Offer redeemed');
    }
};
exports.SoftwareOfferController = SoftwareOfferController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all software offers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SoftwareOfferController.prototype, "listAll", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new software offer' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_software_offer_dto_1.CreateSoftwareOfferDto]),
    __metadata("design:returntype", Promise)
], SoftwareOfferController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get software offer by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SoftwareOfferController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a software offer' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_software_offer_dto_1.UpdateSoftwareOfferDto]),
    __metadata("design:returntype", Promise)
], SoftwareOfferController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate a software offer' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SoftwareOfferController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Post)(':id/redeem'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Redeem a software offer for a tenant' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SoftwareOfferController.prototype, "redeem", null);
exports.SoftwareOfferController = SoftwareOfferController = __decorate([
    (0, swagger_1.ApiTags)('Software Offers'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, super_admin_route_decorator_1.SuperAdminRoute)(),
    (0, common_1.UseGuards)(super_admin_guard_1.SuperAdminGuard),
    (0, common_1.Controller)('admin/offers'),
    __metadata("design:paramtypes", [software_offer_service_1.SoftwareOfferService])
], SoftwareOfferController);
//# sourceMappingURL=software-offer.controller.js.map