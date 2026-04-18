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
var CreateTemplateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTemplateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const create_template_command_1 = require("./create-template.command");
const wa_template_service_1 = require("../../../services/wa-template.service");
let CreateTemplateHandler = CreateTemplateHandler_1 = class CreateTemplateHandler {
    constructor(waTemplateService) {
        this.waTemplateService = waTemplateService;
        this.logger = new common_1.Logger(CreateTemplateHandler_1.name);
    }
    async execute(command) {
        try {
            const template = await this.waTemplateService.createOnMeta(command.wabaId, {
                name: command.name,
                language: command.language,
                category: command.category,
                headerType: command.headerType,
                headerContent: command.headerContent,
                bodyText: command.bodyText,
                footerText: command.footerText,
                buttons: command.buttons,
                variables: command.variables,
                sampleValues: command.sampleValues,
            });
            this.logger.log(`Template "${command.name}" created for WABA ${command.wabaId}`);
            return template;
        }
        catch (error) {
            this.logger.error(`CreateTemplateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTemplateHandler = CreateTemplateHandler;
exports.CreateTemplateHandler = CreateTemplateHandler = CreateTemplateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_template_command_1.CreateTemplateCommand),
    __metadata("design:paramtypes", [wa_template_service_1.WaTemplateService])
], CreateTemplateHandler);
//# sourceMappingURL=create-template.handler.js.map