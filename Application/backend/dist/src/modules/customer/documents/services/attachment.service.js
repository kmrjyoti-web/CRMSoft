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
exports.AttachmentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const VALID_ENTITY_TYPES = ['LEAD', 'CONTACT', 'ORGANIZATION', 'QUOTATION', 'DEAL', 'ACTIVITY', 'DEMO'];
let AttachmentService = class AttachmentService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async attachDocument(documentId, entityType, entityId, userId) {
        if (!VALID_ENTITY_TYPES.includes(entityType)) {
            throw new common_1.BadRequestException(`Invalid entity type: ${entityType}. Allowed: ${VALID_ENTITY_TYPES.join(', ')}`);
        }
        const doc = await this.prisma.working.document.findUnique({ where: { id: documentId, isActive: true } });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        const existing = await this.prisma.working.documentAttachment.findFirst({
            where: { documentId, entityType, entityId },
        });
        if (existing)
            throw new common_1.BadRequestException('Document is already attached to this entity');
        return this.prisma.working.documentAttachment.create({
            data: {
                documentId,
                entityType,
                entityId,
                attachedById: userId,
            },
            include: {
                document: {
                    select: { id: true, originalName: true, mimeType: true, fileSize: true, category: true },
                },
                attachedBy: { select: { id: true, firstName: true, lastName: true } },
            },
        });
    }
    async detachDocument(documentId, entityType, entityId) {
        const attachment = await this.prisma.working.documentAttachment.findFirst({
            where: { documentId, entityType, entityId },
        });
        if (!attachment)
            throw new common_1.NotFoundException('Attachment not found');
        return this.prisma.working.documentAttachment.delete({
            where: { id: attachment.id },
        });
    }
    async getEntityDocuments(entityType, entityId, page = 1, limit = 20) {
        const where = { entityType, entityId };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.working.documentAttachment.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    document: {
                        select: {
                            id: true, originalName: true, fileName: true, mimeType: true,
                            fileSize: true, category: true, storageType: true, storageUrl: true,
                            thumbnailUrl: true, createdAt: true,
                            uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                        },
                    },
                    attachedBy: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
            this.prisma.working.documentAttachment.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getDocumentEntities(documentId) {
        return this.prisma.working.documentAttachment.findMany({
            where: { documentId },
            select: {
                id: true,
                entityType: true,
                entityId: true,
                attachedBy: { select: { id: true, firstName: true, lastName: true } },
                createdAt: true,
            },
        });
    }
};
exports.AttachmentService = AttachmentService;
exports.AttachmentService = AttachmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttachmentService);
//# sourceMappingURL=attachment.service.js.map