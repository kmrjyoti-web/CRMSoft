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
var DeleteFieldDefinitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFieldDefinitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const delete_field_definition_command_1 = require("./delete-field-definition.command");
let DeleteFieldDefinitionHandler = DeleteFieldDefinitionHandler_1 = class DeleteFieldDefinitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DeleteFieldDefinitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.prisma.customFieldDefinition.update({
                where: { id: cmd.id },
                data: { isActive: false },
            });
            return { deactivated: true };
        }
        catch (error) {
            this.logger.error(`DeleteFieldDefinitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeleteFieldDefinitionHandler = DeleteFieldDefinitionHandler;
exports.DeleteFieldDefinitionHandler = DeleteFieldDefinitionHandler = DeleteFieldDefinitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(delete_field_definition_command_1.DeleteFieldDefinitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeleteFieldDefinitionHandler);
//# sourceMappingURL=delete-field-definition.handler.js.map