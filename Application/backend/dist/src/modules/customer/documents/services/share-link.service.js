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
exports.ShareLinkService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
const uuid_1 = require("uuid");
let ShareLinkService = class ShareLinkService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createLink(data) {
        const doc = await this.prisma.working.document.findUnique({
            where: { id: data.documentId, isActive: true },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        const token = (0, uuid_1.v4)().replace(/-/g, '');
        return this.prisma.working.documentShareLink.create({
            data: {
                documentId: data.documentId,
                token,
                access: data.access || working_client_1.ShareLinkAccess.VIEW,
                password: data.password,
                expiresAt: data.expiresAt,
                maxViews: data.maxViews,
                createdById: data.createdById,
            },
            include: {
                document: { select: { id: true, originalName: true, mimeType: true } },
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async accessLink(token, password) {
        const link = await this.prisma.working.documentShareLink.findUnique({
            where: { token },
            include: {
                document: {
                    include: {
                        uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                    },
                },
            },
        });
        if (!link || !link.isActive)
            throw new common_1.NotFoundException('Share link not found or has been revoked');
        if (link.expiresAt && link.expiresAt < new Date()) {
            throw new common_1.BadRequestException('This share link has expired');
        }
        if (link.maxViews && link.viewCount >= link.maxViews) {
            throw new common_1.BadRequestException('This share link has reached its maximum view count');
        }
        if (link.password && link.password !== password) {
            throw new common_1.ForbiddenException('Invalid password');
        }
        await this.prisma.working.documentShareLink.update({
            where: { id: link.id },
            data: { viewCount: { increment: 1 } },
        });
        return {
            document: link.document,
            access: link.access,
        };
    }
    async revokeLink(linkId, userId) {
        const link = await this.prisma.working.documentShareLink.findUnique({
            where: { id: linkId },
        });
        if (!link)
            throw new common_1.NotFoundException('Share link not found');
        if (link.createdById !== userId)
            throw new common_1.ForbiddenException('You can only revoke your own share links');
        return this.prisma.working.documentShareLink.update({
            where: { id: linkId },
            data: { isActive: false },
        });
    }
    async getDocumentLinks(documentId) {
        return this.prisma.working.documentShareLink.findMany({
            where: { documentId, isActive: true },
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.ShareLinkService = ShareLinkService;
exports.ShareLinkService = ShareLinkService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ShareLinkService);
//# sourceMappingURL=share-link.service.js.map