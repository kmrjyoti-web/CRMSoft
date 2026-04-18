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
exports.StorageController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const r2_storage_service_1 = require("../../../../shared/infrastructure/storage/r2-storage.service");
const presigned_url_dto_1 = require("./dto/presigned-url.dto");
let StorageController = class StorageController {
    constructor(storageService) {
        this.storageService = storageService;
    }
    async getPresignedUrl(dto, tenantId) {
        const sanitized = dto.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const key = this.storageService.generateKey(dto.entityType, dto.entityId, sanitized);
        const url = await this.storageService.getPresignedUploadUrl(key, dto.contentType, dto.expiresIn ?? 3600);
        return api_response_1.ApiResponse.success({ url, key }, 'Presigned URL generated');
    }
};
exports.StorageController = StorageController;
__decorate([
    (0, common_1.Post)('presigned-url'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Get a presigned upload URL for direct R2 upload' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('tenantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [presigned_url_dto_1.PresignedUrlDto, String]),
    __metadata("design:returntype", Promise)
], StorageController.prototype, "getPresignedUrl", null);
exports.StorageController = StorageController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace - Storage'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('marketplace/storage'),
    __metadata("design:paramtypes", [r2_storage_service_1.R2StorageService])
], StorageController);
//# sourceMappingURL=storage.controller.js.map