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
var NotionSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionSyncService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@notionhq/client");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
let NotionSyncService = NotionSyncService_1 = class NotionSyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotionSyncService_1.name);
    }
    async getConfig(tenantId) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
        if (!config)
            return null;
        return {
            id: config.id,
            tenantId: config.tenantId,
            tokenMasked: config.token ? `${config.token.slice(0, 8)}...${'*'.repeat(12)}` : '',
            databaseId: config.databaseId,
            isActive: config.isActive,
            createdAt: config.createdAt,
            updatedAt: config.updatedAt,
        };
    }
    async saveConfig(tenantId, token, databaseId, userId) {
        const update = { updatedById: userId };
        if (token)
            update.token = token;
        if (databaseId !== undefined)
            update.databaseId = databaseId;
        return this.prisma.notionConfig.upsert({
            where: { tenantId },
            update,
            create: { tenantId, token, databaseId, updatedById: userId },
        });
    }
    async testConnection(tenantId) {
        const client = await this.getClient(tenantId);
        try {
            const me = await client.users.me({});
            return { success: true, user: me.name ?? me.id };
        }
        catch (err) {
            this.logger.warn(`Notion connection test failed for tenant ${tenantId}: ${err.message}`);
            return { success: false, error: err.message };
        }
    }
    async listDatabases(tenantId) {
        const client = await this.getClient(tenantId);
        const response = await client.search({
            filter: { property: 'object', value: 'data_source' },
            page_size: 50,
        });
        return response.results.map((db) => ({
            id: db.id,
            title: db.title?.[0]?.plain_text ?? 'Untitled',
        }));
    }
    async createEntry(tenantId, data) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
        if (!config?.databaseId) {
            throw app_error_1.AppError.from('NOTION_DATABASE_NOT_SET');
        }
        const client = await this.getClient(tenantId);
        const properties = {
            'Prompt': { title: [{ text: { content: data.promptNumber } }] },
            'Title': { rich_text: [{ text: { content: data.title } }] },
            'Date': { date: { start: new Date().toISOString().split('T')[0] } },
            'Status': { select: { name: data.status } },
        };
        if (data.description) {
            properties['Description'] = { rich_text: [{ text: { content: data.description.slice(0, 2000) } }] };
        }
        if (data.filesChanged) {
            properties['Files Changed'] = { rich_text: [{ text: { content: data.filesChanged.slice(0, 2000) } }] };
        }
        if (data.testResults) {
            properties['Test Results'] = { rich_text: [{ text: { content: data.testResults.slice(0, 2000) } }] };
        }
        const page = await client.pages.create({
            parent: { database_id: config.databaseId },
            properties,
        });
        return { id: page.id, url: page.url };
    }
    async listEntries(tenantId) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
        if (!config?.databaseId) {
            return [];
        }
        const client = await this.getClient(tenantId);
        const response = await client.dataSources.query({
            data_source_id: config.databaseId,
            sorts: [{ property: 'Date', direction: 'descending' }],
            page_size: 100,
        });
        return response.results.map((page) => {
            const props = page.properties;
            return {
                id: page.id,
                promptNumber: props['Prompt']?.title?.[0]?.plain_text ?? '',
                title: props['Title']?.rich_text?.[0]?.plain_text ?? '',
                description: props['Description']?.rich_text?.[0]?.plain_text ?? '',
                status: props['Status']?.select?.name ?? '',
                filesChanged: props['Files Changed']?.rich_text?.[0]?.plain_text ?? '',
                testResults: props['Test Results']?.rich_text?.[0]?.plain_text ?? '',
                date: props['Date']?.date?.start ?? '',
                url: page.url,
            };
        });
    }
    async syncModuleTestStatus(tenantId, moduleId, moduleName, status, notes) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
        if (!config?.databaseId) {
            throw app_error_1.AppError.from('NOTION_DATABASE_NOT_SET');
        }
        const client = await this.getClient(tenantId);
        const existing = await client.dataSources.query({
            data_source_id: config.databaseId,
            filter: {
                property: 'Module ID',
                rich_text: { equals: moduleId },
            },
            page_size: 1,
        }).catch(() => ({ results: [] }));
        const properties = {
            'Prompt': { title: [{ text: { content: moduleName } }] },
            'Module ID': { rich_text: [{ text: { content: moduleId } }] },
            'Status': { select: { name: status } },
            'Date': { date: { start: new Date().toISOString().split('T')[0] } },
        };
        if (notes) {
            properties['Description'] = { rich_text: [{ text: { content: notes.slice(0, 2000) } }] };
        }
        let page;
        if (existing.results.length > 0) {
            page = await client.pages.update({
                page_id: existing.results[0].id,
                properties,
            });
        }
        else {
            page = await client.pages.create({
                parent: { database_id: config.databaseId },
                properties,
            });
        }
        this.logger.log(`Notion module test status synced: ${moduleName} ? ${status}`);
        return { id: page.id, url: page.url ?? '' };
    }
    async listModuleTestStatuses(tenantId, modules) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
        if (!config?.databaseId || !config?.token) {
            return modules.map(m => ({
                moduleId: m.id,
                moduleName: m.name,
                category: m.category,
                notionStatus: 'Not Started',
                syncState: 'not_synced',
            }));
        }
        let notionPages = [];
        try {
            const client = await this.getClient(tenantId);
            const response = await client.dataSources.query({
                data_source_id: config.databaseId,
                page_size: 200,
            });
            notionPages = response.results;
        }
        catch (err) {
            this.logger.warn(`Failed to fetch Notion test log: ${err.message}`);
        }
        const notionMap = new Map();
        for (const page of notionPages) {
            const moduleId = page.properties?.['Module ID']?.rich_text?.[0]?.plain_text ?? '';
            if (moduleId)
                notionMap.set(moduleId, page);
        }
        return modules.map(m => {
            const page = notionMap.get(m.id);
            if (!page) {
                return {
                    moduleId: m.id,
                    moduleName: m.name,
                    category: m.category,
                    notionStatus: 'Not Started',
                    syncState: 'not_synced',
                };
            }
            return {
                moduleId: m.id,
                moduleName: m.name,
                category: m.category,
                notionStatus: page.properties?.['Status']?.select?.name ?? 'Not Started',
                notionPageId: page.id,
                notionUrl: page.url,
                lastSyncedAt: page.last_edited_time,
                syncState: 'synced',
            };
        });
    }
    async getClient(tenantId) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } });
        if (!config?.token) {
            throw app_error_1.AppError.from('NOTION_NOT_CONFIGURED');
        }
        return new client_1.Client({ auth: config.token });
    }
};
exports.NotionSyncService = NotionSyncService;
exports.NotionSyncService = NotionSyncService = NotionSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotionSyncService);
//# sourceMappingURL=notion-sync.service.js.map