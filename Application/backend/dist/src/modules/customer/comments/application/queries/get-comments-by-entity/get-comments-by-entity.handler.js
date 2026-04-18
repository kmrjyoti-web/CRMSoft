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
var GetCommentsByEntityHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCommentsByEntityHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const get_comments_by_entity_query_1 = require("./get-comments-by-entity.query");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const comment_visibility_service_1 = require("../../services/comment-visibility.service");
let GetCommentsByEntityHandler = GetCommentsByEntityHandler_1 = class GetCommentsByEntityHandler {
    constructor(prisma, visibilityService) {
        this.prisma = prisma;
        this.visibilityService = visibilityService;
        this.logger = new common_1.Logger(GetCommentsByEntityHandler_1.name);
    }
    async execute(query) {
        try {
            const visibilityFilter = await this.visibilityService.buildVisibilityFilter({
                userId: query.userId,
                roleLevel: query.roleLevel,
            });
            const where = {
                ...visibilityFilter,
                entityType: query.entityType,
                entityId: query.entityId,
                parentId: null,
            };
            const skip = (query.page - 1) * query.limit;
            const [data, total] = await Promise.all([
                this.prisma.working.comment.findMany({
                    where,
                    skip,
                    take: query.limit,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        author: { select: { id: true, firstName: true, lastName: true } },
                        replies: {
                            where: visibilityFilter,
                            orderBy: { createdAt: 'asc' },
                            include: { author: { select: { id: true, firstName: true, lastName: true } } },
                        },
                        _count: { select: { replies: true } },
                    },
                }),
                this.prisma.working.comment.count({ where }),
            ]);
            return { data, total, page: query.page, limit: query.limit };
        }
        catch (error) {
            this.logger.error(`GetCommentsByEntityHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetCommentsByEntityHandler = GetCommentsByEntityHandler;
exports.GetCommentsByEntityHandler = GetCommentsByEntityHandler = GetCommentsByEntityHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_comments_by_entity_query_1.GetCommentsByEntityQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        comment_visibility_service_1.CommentVisibilityService])
], GetCommentsByEntityHandler);
//# sourceMappingURL=get-comments-by-entity.handler.js.map