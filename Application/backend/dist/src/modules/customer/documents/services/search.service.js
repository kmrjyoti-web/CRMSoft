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
exports.DocumentSearchService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DocumentSearchService = class DocumentSearchService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async search(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = { isActive: true };
        if (params.query) {
            where.OR = [
                { originalName: { contains: params.query, mode: 'insensitive' } },
                { description: { contains: params.query, mode: 'insensitive' } },
                { tags: { hasSome: [params.query.toLowerCase()] } },
            ];
        }
        if (params.category)
            where.category = params.category;
        if (params.storageType)
            where.storageType = params.storageType;
        if (params.tags?.length)
            where.tags = { hasSome: params.tags };
        if (params.uploadedById)
            where.uploadedById = params.uploadedById;
        if (params.mimeType)
            where.mimeType = { contains: params.mimeType };
        if (params.dateFrom || params.dateTo) {
            where.createdAt = {};
            if (params.dateFrom)
                where.createdAt.gte = params.dateFrom;
            if (params.dateTo)
                where.createdAt.lte = params.dateTo;
        }
        if (params.minSize || params.maxSize) {
            where.fileSize = {};
            if (params.minSize)
                where.fileSize.gte = params.minSize;
            if (params.maxSize)
                where.fileSize.lte = params.maxSize;
        }
        const [data, total] = await Promise.all([
            this.prisma.working.document.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    uploadedBy: { select: { id: true, firstName: true, lastName: true } },
                    folder: { select: { id: true, name: true } },
                    _count: { select: { attachments: true } },
                },
            }),
            this.prisma.working.document.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.DocumentSearchService = DocumentSearchService;
exports.DocumentSearchService = DocumentSearchService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentSearchService);
//# sourceMappingURL=search.service.js.map