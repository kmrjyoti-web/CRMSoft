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
exports.DocumentActivityService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DocumentActivityService = class DocumentActivityService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async log(data) {
        return this.prisma.working.documentActivity.create({
            data: {
                documentId: data.documentId,
                action: data.action,
                userId: data.userId,
                details: data.details || {},
                ipAddress: data.ipAddress,
            },
        });
    }
    async getDocumentActivity(documentId, page = 1, limit = 20) {
        const where = { documentId };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.working.documentActivity.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true } },
                },
            }),
            this.prisma.working.documentActivity.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async getUserActivity(userId, page = 1, limit = 20) {
        const where = { userId };
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.prisma.working.documentActivity.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    document: { select: { id: true, originalName: true, mimeType: true } },
                },
            }),
            this.prisma.working.documentActivity.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
};
exports.DocumentActivityService = DocumentActivityService;
exports.DocumentActivityService = DocumentActivityService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentActivityService);
//# sourceMappingURL=document-activity.service.js.map