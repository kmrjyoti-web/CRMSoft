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
var NotionDocsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionDocsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@notionhq/client");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
let NotionDocsService = NotionDocsService_1 = class NotionDocsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotionDocsService_1.name);
        this.notion = null;
        const token = process.env.NOTION_TOKEN;
        if (token) {
            this.notion = new client_1.Client({ auth: token });
            this.logger.log('Notion client initialized');
        }
        else {
            this.logger.warn('NOTION_TOKEN not set � Notion integration disabled');
        }
    }
    get isConfigured() {
        return this.notion !== null;
    }
    async publishReleaseNotes(versionId) {
        if (!this.notion) {
            this.logger.warn('Notion not configured, skipping release notes publish');
            return null;
        }
        const version = await this.prisma.appVersion.findUnique({
            where: { id: versionId },
            include: { patches: true },
        });
        if (!version)
            return null;
        const databaseId = process.env.NOTION_RELEASES_DB_ID;
        if (!databaseId) {
            this.logger.warn('NOTION_RELEASES_DB_ID not set');
            return null;
        }
        try {
            const changelog = version.changelog || [];
            const breakingChanges = version.breakingChanges || [];
            const children = [
                {
                    object: 'block',
                    type: 'heading_2',
                    heading_2: {
                        rich_text: [{ type: 'text', text: { content: `Release ${version.version}` } }],
                    },
                },
            ];
            for (const section of changelog) {
                children.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: section.category || 'General' } }],
                    },
                });
                for (const item of section.items || []) {
                    children.push({
                        object: 'block',
                        type: 'bulleted_list_item',
                        bulleted_list_item: {
                            rich_text: [{ type: 'text', text: { content: item } }],
                        },
                    });
                }
            }
            if (breakingChanges.length > 0) {
                children.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: '?? Breaking Changes' } }],
                    },
                });
                for (const bc of breakingChanges) {
                    children.push({
                        object: 'block',
                        type: 'bulleted_list_item',
                        bulleted_list_item: {
                            rich_text: [{ type: 'text', text: { content: typeof bc === 'string' ? bc : JSON.stringify(bc) } }],
                        },
                    });
                }
            }
            if (version.patches.length > 0) {
                children.push({
                    object: 'block',
                    type: 'heading_3',
                    heading_3: {
                        rich_text: [{ type: 'text', text: { content: 'Industry Patches' } }],
                    },
                });
                for (const patch of version.patches) {
                    children.push({
                        object: 'block',
                        type: 'bulleted_list_item',
                        bulleted_list_item: {
                            rich_text: [{ type: 'text', text: { content: `[${patch.industryCode}] ${patch.patchName}: ${patch.description || 'No description'}` } }],
                        },
                    });
                }
            }
            const page = await this.notion.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    Name: { title: [{ text: { content: `v${version.version} � ${version.codeName || version.releaseType}` } }] },
                    Version: { rich_text: [{ text: { content: version.version } }] },
                    Status: { select: { name: version.status } },
                    'Release Type': { select: { name: version.releaseType } },
                },
                children,
            });
            await this.prisma.appVersion.update({
                where: { id: versionId },
                data: { notionPageId: page.id },
            });
            this.logger.log(`Published release notes to Notion: ${page.id}`);
            return page.id;
        }
        catch (error) {
            this.logger.error(`Failed to publish to Notion: ${(error instanceof Error ? error.message : String(error))}`);
            return null;
        }
    }
    async getStatus() {
        return {
            configured: this.isConfigured,
            hasDatabaseId: !!process.env.NOTION_RELEASES_DB_ID,
        };
    }
};
exports.NotionDocsService = NotionDocsService;
exports.NotionDocsService = NotionDocsService = NotionDocsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotionDocsService);
//# sourceMappingURL=notion-docs.service.js.map