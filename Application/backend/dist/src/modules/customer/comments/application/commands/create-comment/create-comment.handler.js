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
var CreateCommentHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCommentHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_comment_command_1 = require("./create-comment.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const comment_visibility_service_1 = require("../../services/comment-visibility.service");
let CreateCommentHandler = CreateCommentHandler_1 = class CreateCommentHandler {
    constructor(prisma, visibilityService) {
        this.prisma = prisma;
        this.visibilityService = visibilityService;
        this.logger = new common_1.Logger(CreateCommentHandler_1.name);
    }
    deriveRoleLabel(roleLevel) {
        if (roleLevel <= 1)
            return 'ADMIN';
        if (roleLevel <= 3)
            return 'MANAGER';
        return 'USER';
    }
    async execute(cmd) {
        try {
            const visibility = cmd.visibility || 'PUBLIC';
            if (visibility === 'PRIVATE') {
                this.visibilityService.validateCanMarkPrivate(cmd.authorRoleLevel);
            }
            const createdByRole = this.deriveRoleLabel(cmd.authorRoleLevel);
            return this.prisma.working.comment.create({
                data: {
                    tenantId: cmd.tenantId,
                    entityType: cmd.entityType,
                    entityId: cmd.entityId,
                    content: cmd.content,
                    visibility: visibility,
                    authorId: cmd.authorId,
                    createdByRole,
                    parentId: cmd.parentId,
                    taskId: cmd.taskId,
                    mentionedUserIds: cmd.mentionedUserIds ?? undefined,
                    attachments: cmd.attachments ?? undefined,
                },
                include: {
                    author: { select: { id: true, firstName: true, lastName: true } },
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateCommentHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateCommentHandler = CreateCommentHandler;
exports.CreateCommentHandler = CreateCommentHandler = CreateCommentHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_comment_command_1.CreateCommentCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        comment_visibility_service_1.CommentVisibilityService])
], CreateCommentHandler);
//# sourceMappingURL=create-comment.handler.js.map