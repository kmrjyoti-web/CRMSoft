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
exports.FolderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let FolderService = class FolderService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        if (data.parentId) {
            const parent = await this.prisma.working.documentFolder.findUnique({
                where: { id: data.parentId, isActive: true },
            });
            if (!parent)
                throw new common_1.BadRequestException('Parent folder not found');
        }
        const maxSort = await this.prisma.working.documentFolder.aggregate({
            where: { parentId: data.parentId || null, isActive: true },
            _max: { sortOrder: true },
        });
        return this.prisma.working.documentFolder.create({
            data: {
                name: data.name,
                description: data.description,
                parentId: data.parentId,
                color: data.color,
                icon: data.icon,
                sortOrder: (maxSort._max.sortOrder || 0) + 1,
                createdById: data.createdById,
            },
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { documents: true, children: true } },
            },
        });
    }
    async update(id, data) {
        const folder = await this.prisma.working.documentFolder.findUnique({ where: { id, isActive: true } });
        if (!folder)
            throw new common_1.NotFoundException('Folder not found');
        return this.prisma.working.documentFolder.update({
            where: { id },
            data,
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { documents: true, children: true } },
            },
        });
    }
    async softDelete(id) {
        const folder = await this.prisma.working.documentFolder.findUnique({
            where: { id, isActive: true },
            include: { _count: { select: { documents: true, children: true } } },
        });
        if (!folder)
            throw new common_1.NotFoundException('Folder not found');
        if (folder._count.documents > 0 || folder._count.children > 0) {
            throw new common_1.BadRequestException('Cannot delete folder that contains documents or sub-folders. Move or delete contents first.');
        }
        return this.prisma.working.documentFolder.update({
            where: { id },
            data: { isActive: false },
        });
    }
    async getTree(userId) {
        const where = { isActive: true, parentId: null };
        if (userId)
            where.createdById = userId;
        const roots = await this.prisma.working.documentFolder.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
            include: {
                createdBy: { select: { id: true, firstName: true, lastName: true } },
                _count: { select: { documents: true, children: true } },
                children: {
                    where: { isActive: true },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        _count: { select: { documents: true, children: true } },
                        children: {
                            where: { isActive: true },
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                _count: { select: { documents: true, children: true } },
                            },
                        },
                    },
                },
            },
        });
        return roots;
    }
    async getContents(folderId, page = 1, limit = 20) {
        const folder = await this.prisma.working.documentFolder.findUnique({
            where: { id: folderId, isActive: true },
        });
        if (!folder)
            throw new common_1.NotFoundException('Folder not found');
        const skip = (page - 1) * limit;
        const [subFolders, documents, totalDocs] = await Promise.all([
            this.prisma.working.documentFolder.findMany({
                where: { parentId: folderId, isActive: true },
                orderBy: { sortOrder: 'asc' },
                include: { _count: { select: { documents: true, children: true } } },
            }),
            this.prisma.working.document.findMany({
                where: { folderId, isActive: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                    _count: { select: { attachments: true } },
                },
            }),
            this.prisma.working.document.count({ where: { folderId, isActive: true } }),
        ]);
        return {
            folder,
            subFolders,
            documents: { data: documents, total: totalDocs, page, limit, totalPages: Math.ceil(totalDocs / limit) },
        };
    }
};
exports.FolderService = FolderService;
exports.FolderService = FolderService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FolderService);
//# sourceMappingURL=folder.service.js.map