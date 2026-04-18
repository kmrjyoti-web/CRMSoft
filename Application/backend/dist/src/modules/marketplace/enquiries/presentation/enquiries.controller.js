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
exports.EnquiriesController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_enquiry_command_1 = require("../application/commands/create-enquiry/create-enquiry.command");
const convert_enquiry_command_1 = require("../application/commands/convert-enquiry/convert-enquiry.command");
const list_enquiries_query_1 = require("../application/queries/list-enquiries/list-enquiries.query");
const create_enquiry_dto_1 = require("./dto/create-enquiry.dto");
let EnquiriesController = class EnquiriesController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId, tenantId) {
        const id = await this.commandBus.execute(new create_enquiry_command_1.CreateEnquiryCommand(tenantId, dto.listingId, userId, dto.message, dto.quantity, dto.expectedPrice, dto.deliveryPincode));
        return api_response_1.ApiResponse.success({ id }, 'Enquiry submitted');
    }
    async findAll(tenantId, listingId, status, page, limit) {
        const result = await this.queryBus.execute(new list_enquiries_query_1.ListEnquiriesQuery(tenantId, listingId, undefined, status, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20));
        return api_response_1.ApiResponse.paginated(result.data, result.meta.total, result.meta.page, result.meta.limit);
    }
    async convert(id, body, userId, tenantId) {
        await this.commandBus.execute(new convert_enquiry_command_1.ConvertEnquiryCommand(id, tenantId, userId, body.crmLeadId));
        return api_response_1.ApiResponse.success(null, 'Enquiry converted to CRM lead');
    }
};
exports.EnquiriesController = EnquiriesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Submit a product enquiry' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_enquiry_dto_1.CreateEnquiryDto, String, String]),
    __metadata("design:returntype", Promise)
], EnquiriesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List enquiries' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __param(1, (0, common_1.Query)('listingId')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], EnquiriesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)(':id/convert'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Convert enquiry to CRM lead' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], EnquiriesController.prototype, "convert", null);
exports.EnquiriesController = EnquiriesController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Enquiries'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/enquiries'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], EnquiriesController);
//# sourceMappingURL=enquiries.controller.js.map