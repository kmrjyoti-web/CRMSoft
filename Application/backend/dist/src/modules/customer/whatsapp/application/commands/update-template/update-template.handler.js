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
    async execute(command) {
        try {
            const updateData = {};
            if (command.name !== undefined) {
                updateData.name = command.name;
            }
            if (command.bodyText !== undefined) {
                updateData.bodyText = command.bodyText;
            }
            if (command.footerText !== undefined) {
                updateData.footerText = command.footerText;
            }
            if (command.buttons !== undefined) {
                updateData.buttons = command.buttons;
            }
            const template = await this.prisma.working.waTemplate.update({
                where: { id: command.templateId },
                data: updateData,
            });
            this.logger.log(`Template ${command.templateId} updated`);
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