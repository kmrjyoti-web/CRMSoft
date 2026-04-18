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
var DeleteTemplateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTemplateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const delete_template_command_1 = require("./delete-template.command");
const wa_template_service_1 = require("../../../services/wa-template.service");
let DeleteTemplateHandler = DeleteTemplateHandler_1 = class DeleteTemplateHandler {
    constructor(waTemplateService) {
        this.waTemplateService = waTemplateService;
        this.logger = new common_1.Logger(DeleteTemplateHandler_1.name);
    }
    async execute(command) {
        try {
            await this.waTemplateService.deleteOnMeta(command.templateId);
            this.logger.log(`Template ${command.templateId} deleted`);
        }
        catch (error) {
            this.logger.error(`DeleteTemplateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteTemplateHandler = DeleteTemplateHandler;
exports.DeleteTemplateHandler = DeleteTemplateHandler = DeleteTemplateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_template_command_1.DeleteTemplateCommand),
    __metadata("design:paramtypes", [wa_template_service_1.WaTemplateService])
], DeleteTemplateHandler);
//# sourceMappingURL=delete-template.handler.js.map