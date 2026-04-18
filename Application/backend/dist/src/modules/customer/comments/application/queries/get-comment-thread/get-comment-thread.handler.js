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
var GetCommentThreadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommentThreadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_comment_thread_query_1 = require("./get-comment-thread.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const comment_visibility_service_1 = require("../../services/comment-visibility.service");
let GetCommentThreadHandler = GetCommentThreadHandler_1 = class GetCommentThreadHandler {
    constructor(prisma, visibilityService) {
        this.prisma = prisma;
        this.visibilityService = visibilityService;
        this.logger = new common_1.Logger(GetCommentThreadHandler_1.name);
    }
    async execute(query) {
        try {
            const visibilityFilter = await this.visibilityService.buildVisibilityFilter({
                userId: query.userId,
                roleLevel: query.roleLevel,
            });
            return this.prisma.working.comment.findMany({
                where: { ...visibilityFilter, parentId: query.parentId },
                orderBy: { createdAt: 'asc' },
                include: { author: { select: { id: true, firstName: true, lastName: true } } },
            });
        }
        catch (error) {
            this.logger.error(`GetCommentThreadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCommentThreadHandler = GetCommentThreadHandler;
exports.GetCommentThreadHandler = GetCommentThreadHandler = GetCommentThreadHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_comment_thread_query_1.GetCommentThreadQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        comment_visibility_service_1.CommentVisibilityService])
], GetCommentThreadHandler);
//# sourceMappingURL=get-comment-thread.handler.js.map