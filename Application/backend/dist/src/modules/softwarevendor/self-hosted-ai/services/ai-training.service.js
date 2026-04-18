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
var AiTrainingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiTrainingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const vector_store_service_1 = require("./vector-store.service");
const ollama_service_1 = require("./ollama.service");
let AiTrainingService = AiTrainingService_1 = class AiTrainingService {
    constructor(prisma, vectorStore, ollama) {
        this.prisma = prisma;
        this.vectorStore = vectorStore;
        this.ollama = ollama;
        this.logger = new common_1.Logger(AiTrainingService_1.name);
    }
    async createDataset(tenantId, data) {
        return this.prisma.aiDataset.create({
            data: { tenantId, ...data },
        });
    }
    async listDatasets(tenantId, status) {
        const where = { tenantId };
        if (status)
            where.status = status;
        return this.prisma.aiDataset.findMany({
            where,
            include: { _count: { select: { documents: true, trainingJobs: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getDataset(tenantId, id) {
        const dataset = await this.prisma.aiDataset.findFirst({
            where: { id, tenantId },
            include: {
                documents: { orderBy: { createdAt: 'desc' } },
                trainingJobs: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        });
        if (!dataset)
            throw new common_1.NotFoundException('Dataset not found');
        return dataset;
    }
    async updateDataset(tenantId, id, data) {
        return this.prisma.aiDataset.updateMany({
            where: { id, tenantId },
            data,
        });
    }
    async deleteDataset(tenantId, id) {
        await this.vectorStore.deleteByDataset(id);
        return this.prisma.aiDataset.deleteMany({ where: { id, tenantId } });
    }
    async addDocument(tenantId, datasetId, data) {
        const dataset = await this.prisma.aiDataset.findFirst({
            where: { id: datasetId, tenantId },
        });
        if (!dataset)
            throw new common_1.NotFoundException('Dataset not found');
        const tokenCount = Math.ceil(data.content.split(/\s+/).length * 1.3);
        const doc = await this.prisma.aiDocument.create({
            data: {
                tenantId,
                datasetId,
                title: data.title,
                content: data.content,
                contentType: data.contentType ?? 'text',
                sourceUrl: data.sourceUrl,
                metadata: data.metadata,
                tokenCount,
            },
        });
        await this.prisma.aiDataset.update({
            where: { id: datasetId },
            data: {
                documentCount: { increment: 1 },
                totalTokens: { increment: tokenCount },
            },
        });
        return doc;
    }
    async getDocument(tenantId, documentId) {
        const doc = await this.prisma.aiDocument.findFirst({
            where: { id: documentId, tenantId },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async updateDocument(tenantId, documentId, data) {
        const existing = await this.prisma.aiDocument.findFirst({
            where: { id: documentId, tenantId },
        });
        if (!existing)
            throw new common_1.NotFoundException('Document not found');
        if (data.content) {
            await this.vectorStore.deleteByDocument(documentId);
            const newTokenCount = Math.ceil(data.content.split(/\s+/).length * 1.3);
            await this.prisma.aiDocument.update({
                where: { id: documentId },
                data: {
                    ...data,
                    tokenCount: newTokenCount,
                    isProcessed: false,
                    chunkCount: 0,
                },
            });
        }
        else {
            await this.prisma.aiDocument.update({
                where: { id: documentId },
                data,
            });
        }
    }
    async deleteDocument(tenantId, documentId) {
        const doc = await this.prisma.aiDocument.findFirst({
            where: { id: documentId, tenantId },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        await this.vectorStore.deleteByDocument(documentId);
        await this.prisma.aiDocument.delete({ where: { id: documentId } });
        await this.prisma.aiDataset.update({
            where: { id: doc.datasetId },
            data: {
                documentCount: { decrement: 1 },
                totalTokens: { decrement: doc.tokenCount },
            },
        });
    }
    async startTrainingJob(tenantId, data) {
        const dataset = await this.prisma.aiDataset.findFirst({
            where: { id: data.datasetId, tenantId },
            include: { documents: true },
        });
        if (!dataset)
            throw new common_1.NotFoundException('Dataset not found');
        if (dataset.documents.length === 0) {
            throw new common_1.BadRequestException('Dataset has no documents to process');
        }
        const model = await this.prisma.aiModel.findFirst({
            where: { tenantId, modelId: data.modelId, isEmbedding: true },
        });
        if (!model || model.status !== 'AVAILABLE') {
            throw new common_1.BadRequestException(`Embedding model "${data.modelId}" is not available. Pull it first.`);
        }
        const job = await this.prisma.aiTrainingJob.create({
            data: {
                tenantId,
                datasetId: data.datasetId,
                modelId: data.modelId,
                status: 'QUEUED',
                totalSteps: dataset.documents.length,
                createdBy: data.createdBy,
                configJson: data.config,
            },
        });
        this.processTrainingJob(job.id, tenantId).catch((e) => this.logger.error(`Training job ${job.id} failed: ${e.message}`));
        return job;
    }
    async processTrainingJob(jobId, tenantId) {
        await this.prisma.aiTrainingJob.update({
            where: { id: jobId },
            data: { status: 'RUNNING', startedAt: new Date() },
        });
        const job = await this.prisma.aiTrainingJob.findUnique({
            where: { id: jobId },
            include: { dataset: { include: { documents: true } } },
        });
        if (!job)
            return;
        const chunkSize = job.configJson?.chunkSize ?? 500;
        const overlap = job.configJson?.overlap ?? 50;
        let totalChunks = 0;
        let completedSteps = 0;
        try {
            await this.prisma.aiDataset.update({
                where: { id: job.datasetId },
                data: { status: 'PROCESSING' },
            });
            for (const doc of job.dataset.documents) {
                const chunks = this.vectorStore.chunkText(doc.content, chunkSize, overlap);
                const stored = await this.vectorStore.storeEmbeddings(tenantId, job.datasetId, doc.id, chunks, job.modelId);
                totalChunks += stored;
                completedSteps++;
                await this.prisma.aiDocument.update({
                    where: { id: doc.id },
                    data: { isProcessed: true, chunkCount: stored },
                });
                await this.prisma.aiTrainingJob.update({
                    where: { id: jobId },
                    data: {
                        completedSteps,
                        progress: (completedSteps / job.totalSteps) * 100,
                    },
                });
            }
            await this.prisma.aiTrainingJob.update({
                where: { id: jobId },
                data: {
                    status: 'COMPLETED',
                    progress: 100,
                    completedAt: new Date(),
                    resultJson: { totalChunks, documentsProcessed: completedSteps },
                },
            });
            await this.prisma.aiDataset.update({
                where: { id: job.datasetId },
                data: { status: 'READY', totalChunks },
            });
            this.logger.log(`Training job ${jobId} completed: ${totalChunks} chunks from ${completedSteps} docs`);
        }
        catch (e) {
            await this.prisma.aiTrainingJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', errorMessage: e.message },
            });
            await this.prisma.aiDataset.update({
                where: { id: job.datasetId },
                data: { status: 'FAILED' },
            });
            throw e;
        }
    }
    async getTrainingJob(tenantId, jobId) {
        const job = await this.prisma.aiTrainingJob.findFirst({
            where: { id: jobId, tenantId },
            include: { dataset: { select: { name: true } } },
        });
        if (!job)
            throw new common_1.NotFoundException('Training job not found');
        return job;
    }
    async listTrainingJobs(tenantId, datasetId) {
        const where = { tenantId };
        if (datasetId)
            where.datasetId = datasetId;
        return this.prisma.aiTrainingJob.findMany({
            where,
            include: { dataset: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async cancelTrainingJob(tenantId, jobId) {
        return this.prisma.aiTrainingJob.updateMany({
            where: { id: jobId, tenantId, status: { in: ['QUEUED', 'RUNNING'] } },
            data: { status: 'CANCELLED' },
        });
    }
    async importCrmData(tenantId, datasetId, entityType) {
        let records = [];
        switch (entityType) {
            case 'CONTACT': {
                const contacts = await this.prisma.contact.findMany({
                    where: { tenantId, isDeleted: false },
                    take: 500,
                    select: {
                        id: true, firstName: true, lastName: true,
                        designation: true, department: true, notes: true,
                        organization: { select: { name: true } },
                        communications: { select: { type: true, value: true }, take: 5 },
                    },
                });
                records = contacts.map((c) => {
                    const comms = (c.communications || []).map((cm) => `${cm.type}: ${cm.value}`).join(', ');
                    const emails = (c.communications || []).filter((cm) => cm.type === 'EMAIL').map((cm) => cm.value).join(', ');
                    const phones = (c.communications || []).filter((cm) => cm.type === 'PHONE' || cm.type === 'MOBILE').map((cm) => cm.value).join(', ');
                    return {
                        title: `Contact: ${c.firstName} ${c.lastName}`,
                        content: `Name: ${c.firstName} ${c.lastName}\nOrganization: ${c.organization?.name ?? ''}\nDesignation: ${c.designation ?? ''}\nDepartment: ${c.department ?? ''}\nEmail: ${emails}\nPhone: ${phones}\nAll Communications: ${comms}\nNotes: ${c.notes ?? ''}`,
                    };
                });
                break;
            }
            case 'ORGANIZATION': {
                const orgs = await this.prisma.organization.findMany({
                    where: { tenantId, isDeleted: false },
                    take: 500,
                    select: {
                        id: true, name: true, industry: true, city: true,
                        state: true, country: true, website: true,
                    },
                });
                records = orgs.map((o) => ({
                    title: `Organization: ${o.name}`,
                    content: `Name: ${o.name}\nIndustry: ${o.industry ?? ''}\nCity: ${o.city ?? ''}\nState: ${o.state ?? ''}\nCountry: ${o.country ?? ''}\nWebsite: ${o.website ?? ''}`,
                }));
                break;
            }
            case 'PRODUCT': {
                const products = await this.prisma.product.findMany({
                    where: { tenantId, isActive: true },
                    take: 500,
                    select: {
                        id: true, name: true, code: true, shortDescription: true,
                        hsnCode: true, mrp: true, salePrice: true,
                    },
                });
                records = products.map((p) => ({
                    title: `Product: ${p.name}`,
                    content: `Name: ${p.name}\nCode: ${p.code ?? ''}\nDescription: ${p.shortDescription ?? ''}\nHSN: ${p.hsnCode ?? ''}\nMRP: ${p.mrp ?? ''}\nSale Price: ${p.salePrice ?? ''}`,
                }));
                break;
            }
            case 'LEAD': {
                const leads = await this.prisma.lead.findMany({
                    where: { tenantId, isDeleted: false },
                    take: 500,
                    select: {
                        id: true, leadNumber: true, status: true,
                        expectedValue: true, notes: true, priority: true,
                        contact: { select: { firstName: true, lastName: true } },
                        organization: { select: { name: true } },
                    },
                });
                records = leads.map((l) => ({
                    title: `Lead: ${l.leadNumber}`,
                    content: `Lead#: ${l.leadNumber}\nContact: ${l.contact?.firstName ?? ''} ${l.contact?.lastName ?? ''}\nOrganization: ${l.organization?.name ?? ''}\nStatus: ${l.status}\nPriority: ${l.priority}\nValue: ${l.expectedValue ?? ''}\nNotes: ${l.notes ?? ''}`,
                }));
                break;
            }
            default:
                throw new common_1.BadRequestException(`Unsupported entity type: ${entityType}`);
        }
        let imported = 0;
        for (const rec of records) {
            await this.addDocument(tenantId, datasetId, {
                title: rec.title,
                content: rec.content,
                contentType: 'crm_entity',
                metadata: { entityType },
            });
            imported++;
        }
        return { imported };
    }
};
exports.AiTrainingService = AiTrainingService;
exports.AiTrainingService = AiTrainingService = AiTrainingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        vector_store_service_1.VectorStoreService,
        ollama_service_1.OllamaService])
], AiTrainingService);
//# sourceMappingURL=ai-training.service.js.map