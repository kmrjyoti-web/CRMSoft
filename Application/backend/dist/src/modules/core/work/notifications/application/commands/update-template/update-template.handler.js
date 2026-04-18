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
const template_service_1 = require("../../../services/template.service");
let UpdateTemplateHandler = UpdateTemplateHandler_1 = class UpdateTemplateHandler {
    constructor(templateService) {
        this.templateService = templateService;
        this.logger = new common_1.Logger(UpdateTemplateHandler_1.name);
    }
    async execute(command) {
        try {
            const data = {};
            if (command.subject !== undefined)
                data.subject = command.subject;
            if (command.body !== undefined)
                data.body = command.body;
            if (command.channels !== undefined)
                data.channels = command.channels;
            if (command.variables !== undefined)
                data.variables = command.variables;
            if (command.isActive !== undefined)
                data.isActive = command.isActive;
            return this.templateService.update(command.id, data);
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
    __metadata("design:paramtypes", [template_service_1.NotificationTemplateService])
], UpdateTemplateHandler);
//# sourceMappingURL=update-template.handler.js.map