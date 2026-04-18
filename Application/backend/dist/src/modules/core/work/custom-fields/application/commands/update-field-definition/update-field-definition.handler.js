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
var UpdateFieldDefinitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFieldDefinitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const update_field_definition_command_1 = require("./update-field-definition.command");
let UpdateFieldDefinitionHandler = UpdateFieldDefinitionHandler_1 = class UpdateFieldDefinitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateFieldDefinitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.customFieldDefinition.update({
                where: { id: cmd.id },
                data: cmd.data,
            });
        }
        catch (error) {
            this.logger.error(`UpdateFieldDefinitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateFieldDefinitionHandler = UpdateFieldDefinitionHandler;
exports.UpdateFieldDefinitionHandler = UpdateFieldDefinitionHandler = UpdateFieldDefinitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_field_definition_command_1.UpdateFieldDefinitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateFieldDefinitionHandler);
//# sourceMappingURL=update-field-definition.handler.js.map