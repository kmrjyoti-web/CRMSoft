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
exports.DocumentController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const upload_document_command_1 = require("../application/commands/upload-document/upload-document.command");
const update_document_command_1 = require("../application/commands/update-document/update-document.command");
const delete_document_command_1 = require("../application/commands/delete-document/delete-document.command");
const move_document_command_1 = require("../application/commands/move-document/move-document.command");
const upload_version_command_1 = require("../application/commands/upload-version/upload-version.command");
const link_cloud_file_command_1 = require("../application/commands/link-cloud-file/link-cloud-file.command");
const get_document_list_query_1 = require("../application/queries/get-document-list/get-document-list.query");
const get_document_by_id_query_1 = require("../application/queries/get-document-by-id/get-document-by-id.query");
const get_document_versions_query_1 = require("../application/queries/get-document-versions/get-document-versions.query");
const get_document_stats_query_1 = require("../application/queries/get-document-stats/get-document-stats.query");
const get_document_activity_query_1 = require("../application/queries/get-document-activity/get-document-activity.query");
const search_documents_query_1 = require("../application/queries/search-documents/search-documents.query");
const upload_document_dto_1 = require("./dto/upload-document.dto");
const update_document_dto_1 = require("./dto/update-document.dto");
const document_query_dto_1 = require("./dto/document-query.dto");
const cloud_dto_1 = require("./dto/cloud.dto");
const search_dto_1 = require("./dto/search.dto");
let DocumentController = class DocumentController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async upload(file, dto, userId) {
        const result = await this.commandBus.execute(new upload_document_command_1.UploadDocumentCommand(file, userId, dto.category, dto.description, dto.tags, dto.folderId));
        return api_response_1.ApiResponse.success(result, 'Document uploaded successfully');
    }
    async linkCloud(dto, userId) {
        const result = await this.commandBus.execute(new link_cloud_file_command_1.LinkCloudFileCommand(dto.url, userId, dto.category, dto.description, dto.tags, dto.folderId));
        return api_response_1.ApiResponse.success(result, 'Cloud file linked successfully');
    }
    async list(dto) {
        const result = await this.queryBus.execute(new get_document_list_query_1.GetDocumentListQuery(dto.page, dto.limit, dto.search, dto.category, dto.storageType, dto.folderId, dto.uploadedById, dto.tags));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async search(dto) {
        const result = await this.queryBus.execute(new search_documents_query_1.SearchDocumentsQuery(dto.query || '', dto.page, dto.limit, dto.category, dto.storageType, dto.tags, dto.uploadedById, dto.dateFrom ? new Date(dto.dateFrom) : undefined, dto.dateTo ? new Date(dto.dateTo) : undefined, dto.mimeType, dto.minSize, dto.maxSize));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
    async stats(userId) {
        const result = await this.queryBus.execute(new get_document_stats_query_1.GetDocumentStatsQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async getById(id) {
        const result = await this.queryBus.execute(new get_document_by_id_query_1.GetDocumentByIdQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto, userId) {
        const result = await this.commandBus.execute(new update_document_command_1.UpdateDocumentCommand(id, userId, dto.description, dto.category, dto.tags));
        return api_response_1.ApiResponse.success(result, 'Document updated successfully');
    }
    async delete(id, userId) {
        await this.commandBus.execute(new delete_document_command_1.DeleteDocumentCommand(id, userId));
        return api_response_1.ApiResponse.success(null, 'Document deleted successfully');
    }
    async move(id, folderId, userId) {
        const result = await this.commandBus.execute(new move_document_command_1.MoveDocumentCommand(id, folderId, userId));
        return api_response_1.ApiResponse.success(result, 'Document moved successfully');
    }
    async uploadVersion(id, file, userId) {
        const result = await this.commandBus.execute(new upload_version_command_1.UploadVersionCommand(id, file, userId));
        return api_response_1.ApiResponse.success(result, 'New version uploaded successfully');
    }
    async getVersions(id) {
        const result = await this.queryBus.execute(new get_document_versions_query_1.GetDocumentVersionsQuery(id));
        return api_response_1.ApiResponse.success(result);
    }
    async getActivity(id, page, limit) {
        const result = await this.queryBus.execute(new get_document_activity_query_1.GetDocumentActivityQuery(id, page || 1, limit || 20));
        return api_response_1.ApiResponse.paginated(result.data, result.total, result.page, result.limit);
    }
};
exports.DocumentController = DocumentController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, upload_document_dto_1.UploadDocumentDto, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "upload", null);
__decorate([
    (0, common_1.Post)('link-cloud'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [cloud_dto_1.LinkCloudFileDto, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "linkCloud", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [document_query_dto_1.DocumentQueryDto]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_dto_1.SearchDocumentsDto]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_document_dto_1.UpdateDocumentDto, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/move'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('folderId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "move", null);
__decorate([
    (0, common_1.Post)(':id/versions'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "uploadVersion", null);
__decorate([
    (0, common_1.Get)(':id/versions'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Get)(':id/activity'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], DocumentController.prototype, "getActivity", null);
exports.DocumentController = DocumentController = __decorate([
    (0, swagger_1.ApiTags)('Documents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('documents'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], DocumentController);
//# sourceMappingURL=document.controller.js.map