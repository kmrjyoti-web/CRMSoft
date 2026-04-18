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
exports.FolderController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_folder_command_1 = require("../application/commands/create-folder/create-folder.command");
const update_folder_command_1 = require("../application/commands/update-folder/update-folder.command");
const delete_folder_command_1 = require("../application/commands/delete-folder/delete-folder.command");
const get_folder_tree_query_1 = require("../application/queries/get-folder-tree/get-folder-tree.query");
const get_folder_contents_query_1 = require("../application/queries/get-folder-contents/get-folder-contents.query");
const folder_dto_1 = require("./dto/folder.dto");
let FolderController = class FolderController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const result = await this.commandBus.execute(new create_folder_command_1.CreateFolderCommand(dto.name, userId, dto.description, dto.parentId, dto.color, dto.icon));
        return api_response_1.ApiResponse.success(result, 'Folder created successfully');
    }
    async getTree(userId) {
        const result = await this.queryBus.execute(new get_folder_tree_query_1.GetFolderTreeQuery(userId));
        return api_response_1.ApiResponse.success(result);
    }
    async getContents(id, page, limit) {
        const result = await this.queryBus.execute(new get_folder_contents_query_1.GetFolderContentsQuery(id, page || 1, limit || 20));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, dto) {
        const result = await this.commandBus.execute(new update_folder_command_1.UpdateFolderCommand(id, dto.name, dto.description, dto.color, dto.icon));
        return api_response_1.ApiResponse.success(result, 'Folder updated successfully');
    }
    async delete(id) {
        await this.commandBus.execute(new delete_folder_command_1.DeleteFolderCommand(id));
        return api_response_1.ApiResponse.success(null, 'Folder deleted successfully');
    }
};
exports.FolderController = FolderController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [folder_dto_1.CreateFolderDto, String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('tree'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getTree", null);
__decorate([
    (0, common_1.Get)(':id/contents'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "getContents", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, folder_dto_1.UpdateFolderDto]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('documents:delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FolderController.prototype, "delete", null);
exports.FolderController = FolderController = __decorate([
    (0, swagger_1.ApiTags)('Document Folders'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('document-folders'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], FolderController);
//# sourceMappingURL=folder.controller.js.map