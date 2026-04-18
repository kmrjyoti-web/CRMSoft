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
exports.DocumentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const working_client_1 = require("@prisma/working-client");
let DocumentService = class DocumentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createDocument(data) {
        if (data.folderId) {
            const folder = await this.prisma.working.documentFolder.findUnique({
                where: { id: data.folderId, isActive: true },
            });
            if (!folder)
                throw new common_1.BadRequestException('Folder not found');
        }
        return this.prisma.working.document.create({
            data: {
                fileName: data.fileName,
                originalName: data.originalName,
                mimeType: data.mimeType,
                fileSize: data.fileSize,
                storageType: data.storageType,
                storageProvider: data.storageProvider || working_client_1.StorageProvider.NONE,
                storagePath: data.storagePath,
                storageUrl: data.storageUrl,
                cloudFileId: data.cloudFileId,
                thumbnailUrl: data.thumbnailUrl,
                category: data.category || working_client_1.DocumentCategory.GENERAL,
                description: data.description,
                tags: data.tags || [],
                folderId: data.folderId,
                uploadedById: data.uploadedById,
            },
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, name: true } },
            },
        });
    }
    async getById(id) {
        const doc = await this.prisma.working.document.findUnique({
            where: { id, isActive: true },
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, name: true } },
                attachments: {
                    include: { attachedBy: { select: { id: true, firstName: true, lastName: true } } },
                },
                shareLinks: { where: { isActive: true } },
                _count: { select: { childVersions: true, activityLogs: true } },
            },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async getList(params) {
        const where = { isActive: true, status: working_client_1.DocumentStatus.ACTIVE };
        if (params.search) {
            where.OR = [
                { originalName: { contains: params.search, mode: 'insensitive' } },
                { description: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.category)
            where.category = params.category;
        if (params.storageType)
            where.storageType = params.storageType;
        if (params.folderId)
            where.folderId = params.folderId;
        if (params.uploadedById)
            where.uploadedById = params.uploadedById;
        if (params.tags?.length)
            where.tags = { hasSome: params.tags };
        const skip = (params.page - 1) * params.limit;
        const [data, total] = await Promise.all([
            this.prisma.working.document.findMany({
                where,
                skip,
                take: params.limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                    folder: { select: { id: true, name: true } },
                    _count: { select: { attachments: true } },
                },
            }),
            this.prisma.working.document.count({ where }),
        ]);
        return { data, total, page: params.page, limit: params.limit, totalPages: Math.ceil(total / params.limit) };
    }
    async updateDocument(id, data) {
        await this.getById(id);
        return this.prisma.working.document.update({
            where: { id },
            data,
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                folder: { select: { id: true, name: true } },
            },
        });
    }
    async softDelete(id) {
        await this.getById(id);
        return this.prisma.working.document.update({
            where: { id },
            data: { isActive: false, status: working_client_1.DocumentStatus.DELETED },
        });
    }
    async moveToFolder(id, folderId) {
        await this.getById(id);
        if (folderId) {
            const folder = await this.prisma.working.documentFolder.findUnique({
                where: { id: folderId, isActive: true },
            });
            if (!folder)
                throw new common_1.BadRequestException('Target folder not found');
        }
        return this.prisma.working.document.update({
            where: { id },
            data: { folderId },
        });
    }
    async getVersions(documentId) {
        const doc = await this.getById(documentId);
        let rootId = doc.id;
        if (doc.parentVersionId) {
            let current = doc;
            while (current.parentVersionId) {
                const parent = await this.prisma.working.document.findUnique({ where: { id: current.parentVersionId } });
                if (!parent)
                    break;
                rootId = parent.id;
                current = parent;
            }
        }
        const versions = await this.prisma.working.document.findMany({
            where: {
                OR: [
                    { id: rootId },
                    { parentVersionId: rootId },
                ],
                isActive: true,
            },
            orderBy: { version: 'asc' },
            select: {
                id: true, version: true, fileName: true, originalName: true,
                fileSize: true, mimeType: true, createdAt: true,
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
        return versions;
    }
    async createVersion(parentId, data) {
        const parent = await this.getById(parentId);
        const latestVersion = await this.prisma.working.document.findFirst({
            where: {
                OR: [{ id: parentId }, { parentVersionId: parentId }],
                isActive: true,
            },
            orderBy: { version: 'desc' },
        });
        const nextVersion = (latestVersion?.version || parent.version) + 1;
        return this.prisma.working.document.create({
            data: {
                ...data,
                storageProvider: parent.storageProvider,
                category: parent.category,
                description: parent.description,
                tags: parent.tags,
                folderId: parent.folderId,
                version: nextVersion,
                parentVersionId: parent.parentVersionId || parent.id,
            },
            include: {
                uploadedBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async getStats(userId) {
        const where = { isActive: true };
        if (userId)
            where.uploadedById = userId;
        const [totalDocuments, totalSize, byCategory, byStorageType] = await Promise.all([
            this.prisma.working.document.count({ where }),
            this.prisma.working.document.aggregate({ where, _sum: { fileSize: true } }),
            this.prisma.working.document.groupBy({ by: ['category'], where, _count: { id: true } }),
            this.prisma.working.document.groupBy({ by: ['storageType'], where, _count: { id: true } }),
        ]);
        return {
            totalDocuments,
            totalSizeBytes: totalSize._sum.fileSize || 0,
            totalSizeMB: Math.round((totalSize._sum.fileSize || 0) / (1024 * 1024) * 100) / 100,
            byCategory: byCategory.map(c => ({ category: c.category, count: c._count.id })),
            byStorageType: byStorageType.map(s => ({ storageType: s.storageType, count: s._count.id })),
        };
    }
    categorizeByMimeType(mimeType) {
        if (mimeType.startsWith('image/'))
            return working_client_1.DocumentCategory.IMAGE;
        if (mimeType.startsWith('video/'))
            return working_client_1.DocumentCategory.VIDEO;
        if (mimeType.startsWith('audio/'))
            return working_client_1.DocumentCategory.AUDIO;
        if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType === 'text/csv')
            return working_client_1.DocumentCategory.SPREADSHEET;
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
            return working_client_1.DocumentCategory.PRESENTATION;
        if (mimeType === 'application/pdf')
            return working_client_1.DocumentCategory.GENERAL;
        return working_client_1.DocumentCategory.OTHER;
    }
};
exports.DocumentService = DocumentService;
exports.DocumentService = DocumentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentService);
//# sourceMappingURL=document.service.js.map