"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentsModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const comment_controller_1 = require("./presentation/comment.controller");
const comment_visibility_service_1 = require("./application/services/comment-visibility.service");
const create_comment_handler_1 = require("./application/commands/create-comment/create-comment.handler");
const update_comment_handler_1 = require("./application/commands/update-comment/update-comment.handler");
const delete_comment_handler_1 = require("./application/commands/delete-comment/delete-comment.handler");
const get_comments_by_entity_handler_1 = require("./application/queries/get-comments-by-entity/get-comments-by-entity.handler");
const get_comment_thread_handler_1 = require("./application/queries/get-comment-thread/get-comment-thread.handler");
const CommandHandlers = [create_comment_handler_1.CreateCommentHandler, update_comment_handler_1.UpdateCommentHandler, delete_comment_handler_1.DeleteCommentHandler];
const QueryHandlers = [get_comments_by_entity_handler_1.GetCommentsByEntityHandler, get_comment_thread_handler_1.GetCommentThreadHandler];
let CommentsModule = class CommentsModule {
};
exports.CommentsModule = CommentsModule;
exports.CommentsModule = CommentsModule = __decorate([
    (0, common_1.Module)({
        imports: [cqrs_1.CqrsModule],
        controllers: [comment_controller_1.CommentController],
        providers: [comment_visibility_service_1.CommentVisibilityService, ...CommandHandlers, ...QueryHandlers],
        exports: [comment_visibility_service_1.CommentVisibilityService],
    })
], CommentsModule);
//# sourceMappingURL=comments.module.js.map