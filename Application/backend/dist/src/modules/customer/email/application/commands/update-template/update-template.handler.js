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
var UpdateTemplateHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTemplateHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const update_template_command_1 = require("./update-template.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let UpdateTemplateHandler = UpdateTemplateHandler_1 = class UpdateTemplateHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateTemplateHandler_1.name);
    }
    async execute(cmd) {
        try {
            const data = {};
            if (cmd.name !== undefined)
                data.name = cmd.name;
            if (cmd.category !== undefined)
                data.category = cmd.category;
            if (cmd.subject !== undefined)
                data.subject = cmd.subject;
            if (cmd.bodyHtml !== undefined)
                data.bodyHtml = cmd.bodyHtml;
            if (cmd.bodyText !== undefined)
                data.bodyText = cmd.bodyText;
            if (cmd.variables !== undefined)
                data.variables = cmd.variables;
            if (cmd.description !== undefined)
                data.description = cmd.description;
            if (cmd.isShared !== undefined)
                data.isShared = cmd.isShared;
            const template = await this.prisma.working.emailTemplate.update({
                where: { id: cmd.id },
                data,
            });
            this.logger.log(`Email template updated: ${cmd.id}`);
            return template;
        }
        catch (error) {
            this.logger.error(`UpdateTemplateHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateTemplateHandler = UpdateTemplateHandler;
exports.UpdateTemplateHandler = UpdateTemplateHandler = UpdateTemplateHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_template_command_1.UpdateTemplateCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateTemplateHandler);
//# sourceMappingURL=update-template.handler.js.map