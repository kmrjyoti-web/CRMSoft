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
exports.HelpService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const help_seed_data_1 = require("./help-seed-data");
let HelpService = class HelpService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listArticles(query) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.helpType)
            where.helpType = query.helpType;
        if (query.moduleCode)
            where.moduleCode = query.moduleCode;
        if (query.screenCode)
            where.screenCode = query.screenCode;
        if (query.fieldCode)
            where.fieldCode = query.fieldCode;
        if (query.isPublished !== undefined)
            where.isPublished = query.isPublished;
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { summary: { contains: query.search, mode: 'insensitive' } },
                { content: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.helpArticle.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
                select: {
                    id: true,
                    articleCode: true,
                    title: true,
                    summary: true,
                    helpType: true,
                    moduleCode: true,
                    screenCode: true,
                    fieldCode: true,
                    tags: true,
                    isPublished: true,
                    viewCount: true,
                    helpfulCount: true,
                    notHelpfulCount: true,
                    videoUrl: true,
                    createdAt: true,
                    updatedAt: true,
                },
            }),
            this.prisma.platform.helpArticle.count({ where }),
        ]);
        return { data, total, page, limit };
    }
    async getByCode(articleCode) {
        const article = await this.prisma.platform.helpArticle.findUnique({
            where: { articleCode },
        });
        if (!article)
            throw new common_1.NotFoundException(`Help article "${articleCode}" not found`);
        await this.prisma.platform.helpArticle.update({
            where: { id: article.id },
            data: { viewCount: { increment: 1 } },
        });
        return { ...article, viewCount: article.viewCount + 1 };
    }
    async getContextual(moduleCode, screenCode, fieldCode) {
        const where = {
            helpType: 'USER',
            isPublished: true,
            moduleCode,
        };
        if (screenCode)
            where.screenCode = screenCode;
        if (fieldCode)
            where.fieldCode = fieldCode;
        const articles = await this.prisma.platform.helpArticle.findMany({
            where,
            orderBy: { viewCount: 'desc' },
            select: {
                id: true,
                articleCode: true,
                title: true,
                summary: true,
                content: true,
                videoUrl: true,
                videoThumbnail: true,
                relatedArticles: true,
                tags: true,
                usesTerminology: true,
            },
        });
        return articles;
    }
    async create(data) {
        return this.prisma.platform.helpArticle.create({
            data: {
                articleCode: data.articleCode,
                title: data.title,
                content: data.content,
                summary: data.summary,
                helpType: data.helpType,
                moduleCode: data.moduleCode,
                screenCode: data.screenCode,
                fieldCode: data.fieldCode,
                applicableTypes: data.applicableTypes ?? ['ALL'],
                usesTerminology: data.usesTerminology ?? false,
                videoUrl: data.videoUrl,
                videoThumbnail: data.videoThumbnail,
                relatedArticles: data.relatedArticles ?? [],
                visibleToRoles: data.visibleToRoles ?? ['ALL'],
                tags: data.tags ?? [],
                isPublished: data.isPublished ?? false,
            },
        });
    }
    async update(id, data) {
        const existing = await this.prisma.platform.helpArticle.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Help article "${id}" not found`);
        return this.prisma.platform.helpArticle.update({
            where: { id },
            data: data,
        });
    }
    async markHelpful(id) {
        const existing = await this.prisma.platform.helpArticle.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Help article "${id}" not found`);
        return this.prisma.platform.helpArticle.update({
            where: { id },
            data: { helpfulCount: { increment: 1 } },
        });
    }
    async markNotHelpful(id) {
        const existing = await this.prisma.platform.helpArticle.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Help article "${id}" not found`);
        return this.prisma.platform.helpArticle.update({
            where: { id },
            data: { notHelpfulCount: { increment: 1 } },
        });
    }
    resolveTerminology(content, terminologyMap) {
        let resolved = content;
        for (const [placeholder, replacement] of Object.entries(terminologyMap)) {
            const regex = new RegExp(`\\{${placeholder}\\}`, 'gi');
            resolved = resolved.replace(regex, replacement);
        }
        return resolved;
    }
    async seedDefaults() {
        const results = [];
        for (const article of help_seed_data_1.helpSeedData) {
            const existing = await this.prisma.platform.helpArticle.findUnique({
                where: { articleCode: article.articleCode },
            });
            if (existing) {
                await this.prisma.platform.helpArticle.update({
                    where: { articleCode: article.articleCode },
                    data: article,
                });
                results.push({ articleCode: article.articleCode, action: 'updated' });
            }
            else {
                await this.prisma.platform.helpArticle.create({ data: article });
                results.push({ articleCode: article.articleCode, action: 'created' });
            }
        }
        return { seeded: results.length, results };
    }
};
exports.HelpService = HelpService;
exports.HelpService = HelpService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HelpService);
//# sourceMappingURL=help.service.js.map