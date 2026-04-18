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
exports.ReportBookmarksController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const require_permissions_decorator_1 = require("../../../../core/permissions/decorators/require-permissions.decorator");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const create_bookmark_dto_1 = require("./dto/create-bookmark.dto");
const update_bookmark_dto_1 = require("./dto/update-bookmark.dto");
let ReportBookmarksController = class ReportBookmarksController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto, userId) {
        const reportDef = await this.prisma.working.reportDefinition.findFirst({
            where: { code: dto.reportCode },
        });
        if (!reportDef) {
            throw new common_1.NotFoundException(`Report definition not found: ${dto.reportCode}`);
        }
        const bookmark = await this.prisma.working.reportBookmark.create({
            data: {
                reportDefId: reportDef.id,
                userId,
                name: dto.name,
                filters: dto.filters ?? undefined,
                isPinned: dto.isPinned ?? false,
            },
            include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(bookmark, 'Bookmark created');
    }
    async list(userId) {
        const bookmarks = await this.prisma.working.reportBookmark.findMany({
            where: { userId },
            include: { reportDef: true },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        });
        return api_response_1.ApiResponse.success(bookmarks, 'Bookmarks retrieved');
    }
    async update(id, dto, userId) {
        const existing = await this.prisma.working.reportBookmark.findFirst({
            where: { id, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Bookmark not found');
        }
        const updated = await this.prisma.working.reportBookmark.update({
            where: { id },
            data: {
                ...(dto.name !== undefined && { name: dto.name }),
                ...(dto.filters !== undefined && { filters: dto.filters }),
                ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
            },
            include: { reportDef: true },
        });
        return api_response_1.ApiResponse.success(updated, 'Bookmark updated');
    }
    async remove(id, userId) {
        const result = await this.prisma.working.reportBookmark.deleteMany({
            where: { id, userId },
        });
        if (result.count === 0) {
            throw new common_1.NotFoundException('Bookmark not found');
        }
        return api_response_1.ApiResponse.success(null, 'Bookmark deleted');
    }
};
exports.ReportBookmarksController = ReportBookmarksController;
__decorate([
    (0, common_1.Post)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_bookmark_dto_1.CreateBookmarkDto, String]),
    __metadata("design:returntype", Promise)
], ReportBookmarksController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ReportBookmarksController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_bookmark_dto_1.UpdateBookmarkDto, String]),
    __metadata("design:returntype", Promise)
], ReportBookmarksController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_permissions_decorator_1.RequirePermissions)('reports:read'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ReportBookmarksController.prototype, "remove", null);
exports.ReportBookmarksController = ReportBookmarksController = __decorate([
    (0, common_1.Controller)('mis-reports/bookmarks'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReportBookmarksController);
//# sourceMappingURL=report-bookmarks.controller.js.map