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
var DeleteCommentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCommentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const delete_comment_command_1 = require("./delete-comment.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
let DeleteCommentHandler = DeleteCommentHandler_1 = class DeleteCommentHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteCommentHandler_1.name);
    }
    async execute(cmd) {
        try {
            const comment = await this.prisma.working.comment.findUnique({ where: { id: cmd.commentId } });
            if (!comment || !comment.isActive)
                throw new common_1.NotFoundException('Comment not found');
            if (comment.authorId !== cmd.userId && cmd.userRoleLevel > 1) {
                throw new common_1.ForbiddenException('Only the author or an admin can delete a comment');
            }
            return this.prisma.working.comment.update({
                where: { id: cmd.commentId },
                data: { isActive: false },
            });
        }
        catch (error) {
            this.logger.error(`DeleteCommentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteCommentHandler = DeleteCommentHandler;
exports.DeleteCommentHandler = DeleteCommentHandler = DeleteCommentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_comment_command_1.DeleteCommentCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteCommentHandler);
//# sourceMappingURL=delete-comment.handler.js.map