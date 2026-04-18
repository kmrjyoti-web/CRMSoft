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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const notion_sync_service_1 = require("../services/notion-sync.service");
const notion_dto_1 = require("./dto/notion.dto");
const menu_seed_data_1 = require("../../menus/presentation/menu-seed-data");
let NotionController = class NotionController {
    constructor(service) {
        this.service = service;
    }
    getConfig(req) {
        return this.service.getConfig(req.user.tenantId);
    }
    saveConfig(req, dto) {
        return this.service.saveConfig(req.user.tenantId, dto.token ?? '', dto.databaseId, req.user.id);
    }
    testConnection(req) {
        return this.service.testConnection(req.user.tenantId);
    }
    listDatabases(req) {
        return this.service.listDatabases(req.user.tenantId);
    }
    createEntry(req, dto) {
        return this.service.createEntry(req.user.tenantId, dto);
    }
    listEntries(req) {
        return this.service.listEntries(req.user.tenantId);
    }
    async listTestLogModules(req) {
        const modules = this.buildModuleList();
        return this.service.listModuleTestStatuses(req.user.tenantId, modules);
    }
    async syncModuleStatus(req, body) {
        return this.service.syncModuleTestStatus(req.user.tenantId, body.moduleId, body.moduleName, body.status, body.notes);
    }
    async syncAllModules(req, body) {
        const modules = this.buildModuleList();
        const results = [];
        for (const m of modules) {
            try {
                const status = body.statuses?.[m.id] ?? 'Not Started';
                const result = await this.service.syncModuleTestStatus(req.user.tenantId, m.id, m.name, status);
                results.push({ moduleId: m.id, moduleName: m.name, ...result });
            }
            catch {
                results.push({ moduleId: m.id, moduleName: m.name, error: 'sync_failed' });
            }
        }
        return { total: results.length, results };
    }
    buildModuleList() {
        const modules = [];
        const flatten = (items, category) => {
            for (const item of items) {
                if (item.code && item.name) {
                    modules.push({ id: item.code, name: item.name, category });
                }
                if (item.children?.length) {
                    flatten(item.children, category ?? item.name);
                }
            }
        };
        flatten(menu_seed_data_1.MENU_SEED_DATA);
        return modules;
    }
};
exports.NotionController = NotionController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotionController.prototype, "getConfig", null);
__decorate([
    (0, common_1.Put)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notion_dto_1.UpdateNotionConfigDto]),
    __metadata("design:returntype", void 0)
], NotionController.prototype, "saveConfig", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotionController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Get)('databases'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotionController.prototype, "listDatabases", null);
__decorate([
    (0, common_1.Post)('entries'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, notion_dto_1.CreateNotionEntryDto]),
    __metadata("design:returntype", void 0)
], NotionController.prototype, "createEntry", null);
__decorate([
    (0, common_1.Get)('entries'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], NotionController.prototype, "listEntries", null);
__decorate([
    (0, common_1.Get)('test-log/modules'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], NotionController.prototype, "listTestLogModules", null);
__decorate([
    (0, common_1.Post)('test-log/sync'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotionController.prototype, "syncModuleStatus", null);
__decorate([
    (0, common_1.Post)('test-log/sync-all'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], NotionController.prototype, "syncAllModules", null);
exports.NotionController = NotionController = __decorate([
    (0, swagger_1.ApiTags)('Settings - Notion'),
    (0, common_1.Controller)('settings/notion'),
    __metadata("design:paramtypes", [notion_sync_service_1.NotionSyncService])
], NotionController);
//# sourceMappingURL=notion.controller.js.map