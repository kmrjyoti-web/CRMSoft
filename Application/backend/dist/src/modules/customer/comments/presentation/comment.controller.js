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
exports.CommentController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const create_comment_dto_1 = require("./dto/create-comment.dto");
const create_comment_command_1 = require("../application/commands/create-comment/create-comment.command");
const update_comment_command_1 = require("../application/commands/update-comment/update-comment.command");
const delete_comment_command_1 = require("../application/commands/delete-comment/delete-comment.command");
const get_comments_by_entity_query_1 = require("../application/queries/get-comments-by-entity/get-comments-by-entity.query");
const get_comment_thread_query_1 = require("../application/queries/get-comment-thread/get-comment-thread.query");
let CommentController = class CommentController {
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, user) {
        const result = await this.commandBus.execute(new create_comment_command_1.CreateCommentCommand(dto.entityType, dto.entityId, dto.content, user.id, user.roleLevel ?? 5, user.tenantId ?? '', dto.visibility, dto.parentId, dto.taskId, dto.mentionedUserIds, dto.attachments));
        return api_response_1.ApiResponse.success(result, 'Comment created');
    }
    async getByEntity(entityType, entityId, user, page = 1, limit = 50) {
        const result = await this.queryBus.execute(new get_comments_by_entity_query_1.GetCommentsByEntityQuery(entityType, entityId, user.id, user.roleLevel ?? 5, +page, +limit));
        return api_response_1.ApiResponse.success(result);
    }
    async getThread(parentId, user) {
        const result = await this.queryBus.execute(new get_comment_thread_query_1.GetCommentThreadQuery(parentId, user.id, user.roleLevel ?? 5));
        return api_response_1.ApiResponse.success(result);
    }
    async update(id, content, user) {
        const result = await this.commandBus.execute(new update_comment_command_1.UpdateCommentCommand(id, user.id, content, user.roleLevel ?? 5));
        return api_response_1.ApiResponse.success(result, 'Comment updated');
    }
    async delete(id, user) {
        const result = await this.commandBus.execute(new delete_comment_command_1.DeleteCommentCommand(id, user.id, user.roleLevel ?? 5));
        return api_response_1.ApiResponse.success(result, 'Comment deleted');
    }
};
exports.CommentController = CommentController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('comments:create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_comment_dto_1.CreateCommentDto, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':entityType/:entityId'),
    (0, require_permissions_decorator_1.RequirePermissions)('comments:read'),
    __param(0, (0, common_1.Param)('entityType')),
    __param(1, (0, common_1.Param)('entityId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getByEntity", null);
__decorate([
    (0, common_1.Get)(':id/thread'),
    (0, require_permissions_decorator_1.RequirePermissions)('comments:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getThread", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('comments:update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('content')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('comments:delete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "delete", null);
exports.CommentController = CommentController = __decorate([
    (0, common_1.Controller)('comments'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus, cqrs_1.QueryBus])
], CommentController);
//# sourceMappingURL=comment.controller.js.map