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
var SyncTemplatesHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncTemplatesHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const sync_templates_command_1 = require("./sync-templates.command");
const wa_template_service_1 = require("../../../services/wa-template.service");
let SyncTemplatesHandler = SyncTemplatesHandler_1 = class SyncTemplatesHandler {
    constructor(waTemplateService) {
        this.waTemplateService = waTemplateService;
        this.logger = new common_1.Logger(SyncTemplatesHandler_1.name);
    }
    async execute(command) {
        try {
            const result = await this.waTemplateService.syncFromMeta(command.wabaId);
            this.logger.log(`Templates synced for WABA ${command.wabaId}: ${result.synced} total, ${result.added} added, ${result.updated} updated`);
            return result;
        }
        catch (error) {
            this.logger.error(`SyncTemplatesHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SyncTemplatesHandler = SyncTemplatesHandler;
exports.SyncTemplatesHandler = SyncTemplatesHandler = SyncTemplatesHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(sync_templates_command_1.SyncTemplatesCommand),
    __metadata("design:paramtypes", [wa_template_service_1.WaTemplateService])
], SyncTemplatesHandler);
//# sourceMappingURL=sync-templates.handler.js.map