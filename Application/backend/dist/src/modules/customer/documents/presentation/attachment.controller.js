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
exports.AttachmentController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const attach_document_command_1 = require("../application/commands/attach-document/attach-document.command");
const detach_document_command_1 = require("../application/commands/detach-document/detach-document.command");
const get_entity_documents_query_1 = require("../application/queries/get-entity-documents/get-entity-documents.query");
const attachment_dto_1 = require("./dto/attachment.dto");
let AttachmentController = class AttachmentController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async attach(dto, userId) {
        const result = await this.commandBus.execute(new attach_document_command_1.AttachDocumentCommand(dto.documentId, dto.entityType, dto.entityId, userId));
        return api_response_1.ApiResponse.success(result, 'Document attached successfully');
    }
    async detach(documentId, entityType, entityId, userId) {
        await this.commandBus.execute(new detach_document_command_1.DetachDocumentCommand(documentId, entityType, entityId, userId));
        return api_response_1.ApiResponse.success(null, 'Document detached successfully');
    }
    async getEntityDocuments(entityType, entityId, page, limit) {
        const result = await this.queryBus.execute(new get_entity_documents_query_1.GetEntityDocumentsQuery(entityType, entityId, page || 1, limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.AttachmentController = AttachmentController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [attachment_dto_1.AttachDocumentDto, String]),
    __metadata("design:returntype", Promise)
], AttachmentController.prototype, "attach", null);
__decorate([
    (0, common_1.Delete)(':documentId/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:delete'),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Param)('entityType')),
    __param(2, (0, common_1.Param)('entityId')),
    __param(3, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], AttachmentController.prototype, "detach", null);
__decorate([
    (0, common_1.Get)('entity/:entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AttachmentController.prototype, "getEntityDocuments", null);
exports.AttachmentController = AttachmentController = __decorate([
    (0, swagger_1.ApiTags)('Document Attachments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('document-attachments'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], AttachmentController);
//# sourceMappingURL=attachment.controller.js.map