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
var UpdateCommentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCommentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const update_comment_command_1 = require("./update-comment.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const common_1 = require("@nestjs/common");
const DEFAULT_EDIT_WINDOW_MINUTES = 30;
let UpdateCommentHandler = UpdateCommentHandler_1 = class UpdateCommentHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateCommentHandler_1.name);
    }
    async getEditWindowMinutes(tenantId) {
        const config = await this.prisma.working.taskLogicConfig.findFirst({
            where: {
                tenantId,
                configKey: 'COMMENT_EDIT_WINDOW_MINUTES',
                isActive: true,
            },
        });
        if (config?.value != null) {
            const val = config.value;
            const minutes = typeof val === 'number' ? val : val?.minutes;
            if (typeof minutes === 'number' && minutes > 0)
                return minutes;
        }
        return DEFAULT_EDIT_WINDOW_MINUTES;
    }
    async execute(cmd) {
        try {
            const comment = await this.prisma.working.comment.findUnique({ where: { id: cmd.commentId } });
            if (!comment || !comment.isActive)
                throw new common_1.NotFoundException('Comment not found');
            if (comment.authorId !== cmd.userId)
                throw new common_1.ForbiddenException('Only the author can edit a comment');
            const isAdmin = cmd.roleLevel <= 1;
            if (!isAdmin) {
                const windowMinutes = await this.getEditWindowMinutes(comment.tenantId);
                const cutoff = new Date(comment.createdAt.getTime() + windowMinutes * 60 * 1000);
                if (new Date() > cutoff) {
                    throw new common_1.ForbiddenException('Edit window has expired');
                }
            }
            return this.prisma.working.comment.update({
                where: { id: cmd.commentId },
                data: {
                    content: cmd.content,
                    isEdited: true,
                    editedAt: new Date(),
                },
                include: { author: { select: { id: true, firstName: true, lastName: true } } },
            });
        }
        catch (error) {
            this.logger.error(`UpdateCommentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateCommentHandler = UpdateCommentHandler;
exports.UpdateCommentHandler = UpdateCommentHandler = UpdateCommentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_comment_command_1.UpdateCommentCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateCommentHandler);
//# sourceMappingURL=update-comment.handler.js.map