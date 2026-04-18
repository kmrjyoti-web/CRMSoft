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
exports.EmailSignatureController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_signature_command_1 = require("../application/commands/create-signature/create-signature.command");
const update_signature_command_1 = require("../application/commands/update-signature/update-signature.command");
const delete_signature_command_1 = require("../application/commands/delete-signature/delete-signature.command");
const query_1 = require("../application/queries/get-signatures/query");
const signature_dto_1 = require("./dto/signature.dto");
let EmailSignatureController = class EmailSignatureController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_signature_command_1.CreateSignatureCommand(dto.name, dto.bodyHtml, dto.isDefault || false, userId));
        return api_response_1.ApiResponse.success(result, 'Signature created successfully');
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_signature_command_1.UpdateSignatureCommand(id, dto.name, dto.bodyHtml, dto.isDefault));
        return api_response_1.ApiResponse.success(result, 'Signature updated successfully');
    }
    async delete(id) {
        await this.commandBus.execute(new delete_signature_command_1.DeleteSignatureCommand(id));
        return api_response_1.ApiResponse.success(null, 'Signature deleted successfully');
    }
    async list(userId) {
        const result = await this.queryBus.execute(new query_1.GetSignaturesQuery(userId));
        return api_response_1.ApiResponse.success(result, 'Signatures retrieved');
    }
};
exports.EmailSignatureController = EmailSignatureController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signature_dto_1.CreateSignatureDto, String]),
    __metadata("design:returntype", Promise)
], EmailSignatureController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, signature_dto_1.UpdateSignatureDto]),
    __metadata("design:returntype", Promise)
], EmailSignatureController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailSignatureController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('emails:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], EmailSignatureController.prototype, "list", null);
exports.EmailSignatureController = EmailSignatureController = __decorate([
    (0, swagger_1.ApiTags)('Email Signatures'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('email-signatures'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], EmailSignatureController);
//# sourceMappingURL=email-signature.controller.js.map