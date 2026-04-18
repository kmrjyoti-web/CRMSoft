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
var DevQANotionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevQANotionService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@notionhq/client");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let DevQANotionService = DevQANotionService_1 = class DevQANotionService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DevQANotionService_1.name);
    }
    async generateModuleTestPlan(planName, moduleNames, createdById, tenantId) {
        const components = await this.discoverComponents(moduleNames);
        const plan = await this.prisma.platform.testPlan.create({
            data: {
                tenantId,
                name: planName,
                description: `Auto-generated QA plan covering ${components.length} components`,
                targetModules: moduleNames ?? [],
                status: 'ACTIVE',
                createdById,
            },
        });
        if (components.length > 0) {
            await this.prisma.platform.testPlanItem.createMany({
                data: components.map((c, i) => ({
                    planId: plan.id,
                    moduleName: c.moduleName,
                    componentName: c.componentName,
                    functionality: c.functionality,
                    layer: c.layer,
                    priority: c.priority,
                    sortOrder: i,
                })),
            });
        }
        await this.prisma.platform.testPlan.update({
            where: { id: plan.id },
            data: { totalItems: components.length },
        });
        this.logger.log(`Generated QA plan "${planName}" with ${components.length} items`);
        return { planId: plan.id, itemCount: components.length };
    }
    async discoverComponents(moduleNames) {
        const components = [];
        const pages = await this.prisma.platform.pageRegistry.findMany({
            select: { moduleCode: true, componentName: true, friendlyName: true, routePath: true },
            take: 200,
        }).catch(() => []);
        const moduleFilter = moduleNames && moduleNames.length > 0 ? moduleNames : null;
        for (const page of pages) {
            if (!page.moduleCode)
                continue;
            if (moduleFilter && !moduleFilter.includes(page.moduleCode))
                continue;
            components.push({
                moduleName: page.moduleCode,
                componentName: page.friendlyName ?? page.componentName ?? page.routePath,
                functionality: `Page renders correctly and core actions work: ${page.routePath}`,
                layer: 'UI',
                priority: 'MEDIUM',
            });
        }
        const defaultModules = moduleFilter ?? [
            'leads', 'contacts', 'organizations', 'invoicing', 'payments',
            'orders', 'stock', 'accounts', 'quotations', 'activities',
            'settings', 'users', 'roles', 'workflows', 'tickets',
        ];
        for (const mod of defaultModules) {
            for (const op of ['Create', 'List', 'GetById', 'Update', 'Delete']) {
                components.push({
                    moduleName: mod,
                    componentName: `${this.toPascal(mod)}Controller`,
                    functionality: `${op} ${mod} � correct status code, response shape, and data`,
                    layer: 'API',
                    priority: op === 'Create' || op === 'List' ? 'HIGH' : 'MEDIUM',
                });
            }
            components.push({
                moduleName: mod,
                componentName: `${this.toPascal(mod)} DB Model`,
                functionality: `FK constraints valid, required fields non-null, unique constraints hold`,
                layer: 'DB',
                priority: 'HIGH',
            });
            components.push({
                moduleName: mod,
                componentName: `${this.toPascal(mod)}Controller`,
                functionality: `Unauthenticated access returns 401, cross-tenant access returns 403`,
                layer: 'API',
                priority: 'CRITICAL',
            });
        }
        const seen = new Set();
        return components.filter(c => {
            const key = `${c.moduleName}:${c.componentName}:${c.functionality}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    async syncToNotion(planId, tenantId) {
        const plan = await this.prisma.platform.testPlan.findFirst({
            where: { id: planId, tenantId },
            include: { items: true },
        });
        if (!plan)
            throw new common_1.NotFoundException(`TestPlan ${planId} not found`);
        const client = await this.getNotionClient(tenantId);
        const databaseId = await this.getOrCreateNotionDatabase(client, tenantId, plan.name);
        let syncedCount = 0;
        for (const item of plan.items) {
            try {
                const properties = {
                    Module: { title: [{ text: { content: item.moduleName } }] },
                    Component: { rich_text: [{ text: { content: item.componentName } }] },
                    Functionality: { rich_text: [{ text: { content: item.functionality.substring(0, 2000) } }] },
                    Layer: { select: { name: item.layer } },
                    Status: { select: { name: item.status.replace('_', ' ') } },
                    Priority: { select: { name: item.priority } },
                    Notes: { rich_text: item.notes ? [{ text: { content: item.notes.substring(0, 2000) } }] : [] },
                };
                if (item.notionBlockId) {
                    await client.pages.update({ page_id: item.notionBlockId, properties });
                }
                else {
                    const page = await client.pages.create({
                        parent: { database_id: databaseId },
                        properties,
                    });
                    await this.prisma.platform.testPlanItem.update({
                        where: { id: item.id },
                        data: { notionBlockId: page.id },
                    });
                }
                syncedCount++;
            }
            catch (err) {
                this.logger.warn(`Failed to sync item ${item.id} to Notion: ${err.message}`);
            }
        }
        await this.prisma.platform.testPlan.update({
            where: { id: planId },
            data: {
                notionPageId: databaseId,
                notionSyncedAt: new Date(),
            },
        });
        const notionUrl = `https://notion.so/${databaseId.replace(/-/g, '')}`;
        this.logger.log(`Synced plan ${planId} ? Notion (${syncedCount}/${plan.items.length} items)`);
        return { notionUrl, syncedCount };
    }
    async pullFromNotion(planId, tenantId) {
        const plan = await this.prisma.platform.testPlan.findFirst({
            where: { id: planId, tenantId },
            include: { items: { where: { notionBlockId: { not: null } } } },
        });
        if (!plan)
            throw new common_1.NotFoundException(`TestPlan ${planId} not found`);
        if (!plan.notionPageId)
            return { updated: 0 };
        const client = await this.getNotionClient(tenantId);
        let updated = 0;
        for (const item of plan.items) {
            if (!item.notionBlockId)
                continue;
            try {
                const page = await client.pages.retrieve({ page_id: item.notionBlockId });
                const notionStatus = page.properties?.Status?.select?.name?.replace(' ', '_') ?? null;
                const notionNotes = page.properties?.Notes?.rich_text?.[0]?.plain_text ?? null;
                const updates = {};
                if (notionStatus && notionStatus !== item.status)
                    updates.status = notionStatus;
                if (notionNotes && notionNotes !== item.notes)
                    updates.notes = notionNotes;
                if (Object.keys(updates).length > 0) {
                    await this.prisma.platform.testPlanItem.update({ where: { id: item.id }, data: updates });
                    updated++;
                }
            }
            catch (err) {
                this.logger.warn(`Failed to pull item ${item.id} from Notion: ${err.message}`);
            }
        }
        this.logger.log(`Pulled ${updated} update(s) from Notion for plan ${planId}`);
        return { updated };
    }
    async getNotionClient(tenantId) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } }).catch(() => null);
        const token = config?.token ?? process.env.NOTION_API_KEY;
        if (!token)
            throw new Error('Notion API key not configured. Set it in Settings ? Notion or NOTION_API_KEY env var.');
        return new client_1.Client({ auth: token });
    }
    async getOrCreateNotionDatabase(client, tenantId, planName) {
        const config = await this.prisma.notionConfig.findUnique({ where: { tenantId } }).catch(() => null);
        if (config?.databaseId)
            return config.databaseId;
        const search = await client.search({
            query: `Dev QA: ${planName}`,
            filter: { property: 'object', value: 'data_source' },
            page_size: 1,
        }).catch(() => ({ results: [] }));
        if (search.results.length > 0)
            return search.results[0].id;
        const parentPageId = process.env.NOTION_PARENT_PAGE_ID;
        if (!parentPageId)
            throw new Error('NOTION_PARENT_PAGE_ID not set � cannot create Notion database automatically');
        const db = await client.databases.create({
            parent: { type: 'page_id', page_id: parentPageId },
            title: [{ type: 'text', text: { content: `Dev QA: ${planName}` } }],
            properties: {
                Module: { title: {} },
                Component: { rich_text: {} },
                Functionality: { rich_text: {} },
                Layer: { select: { options: [{ name: 'UI' }, { name: 'API' }, { name: 'DB' }, { name: 'ARCH' }, { name: 'INTEGRATION' }] } },
                Status: { select: { options: [
                            { name: 'NOT STARTED' }, { name: 'IN PROGRESS' }, { name: 'PASSED' },
                            { name: 'FAILED' }, { name: 'PARTIAL' }, { name: 'BLOCKED' },
                        ] } },
                Priority: { select: { options: [{ name: 'LOW' }, { name: 'MEDIUM' }, { name: 'HIGH' }, { name: 'CRITICAL' }] } },
                Notes: { rich_text: {} },
            },
        });
        return db.id;
    }
    toPascal(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
exports.DevQANotionService = DevQANotionService;
exports.DevQANotionService = DevQANotionService = DevQANotionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DevQANotionService);
//# sourceMappingURL=dev-qa-notion.service.js.map