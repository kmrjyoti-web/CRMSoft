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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentVisibilityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
let CommentVisibilityService = class CommentVisibilityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    validateCanMarkPrivate(roleLevel) {
        if (roleLevel >= 4) {
            throw new common_1.ForbiddenException('Users cannot mark comments as private');
        }
    }
    async buildVisibilityFilter(ctx) {
        if (ctx.roleLevel <= 1) {
            return { isActive: true };
        }
        if (ctx.roleLevel <= 3) {
            const reporteeIds = await this.getReporteeIds(ctx.userId);
            return {
                isActive: true,
                OR: [
                    { visibility: working_client_1.CommentVisibility.PUBLIC },
                    { visibility: working_client_1.CommentVisibility.PRIVATE, authorId: ctx.userId },
                    { visibility: working_client_1.CommentVisibility.PRIVATE, authorId: { in: reporteeIds } },
                ],
            };
        }
        return {
            isActive: true,
            OR: [
                { visibility: working_client_1.CommentVisibility.PUBLIC },
                { visibility: working_client_1.CommentVisibility.PRIVATE, authorId: ctx.userId },
            ],
        };
    }
    async getReporteeIds(managerId) {
        const reportees = await this.prisma.$queryRaw `
      WITH RECURSIVE chain AS (
        SELECT id FROM users WHERE reporting_to_id = ${managerId} AND is_deleted = false
        UNION ALL
        SELECT u.id FROM users u INNER JOIN chain c ON u.reporting_to_id = c.id WHERE u.is_deleted = false
      )
      SELECT id FROM chain
    `;
        return reportees.map(r => r.id);
    }
};
exports.CommentVisibilityService = CommentVisibilityService;
exports.CommentVisibilityService = CommentVisibilityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CommentVisibilityService);
//# sourceMappingURL=comment-visibility.service.js.map