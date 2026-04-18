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
var CreateFieldDefinitionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFieldDefinitionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../../core/prisma/prisma.service");
const create_field_definition_command_1 = require("./create-field-definition.command");
let CreateFieldDefinitionHandler = CreateFieldDefinitionHandler_1 = class CreateFieldDefinitionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateFieldDefinitionHandler_1.name);
    }
    async execute(cmd) {
        try {
            const existing = await this.prisma.customFieldDefinition.findFirst({
                where: {
                    entityType: cmd.entityType.toUpperCase(),
                    fieldName: cmd.fieldName,
                },
            });
            if (existing) {
                throw new common_1.ConflictException(`Field '${cmd.fieldName}' already exists for ${cmd.entityType}`);
            }
            return this.prisma.customFieldDefinition.create({
                data: {
                    entityType: cmd.entityType.toUpperCase(),
                    fieldName: cmd.fieldName,
                    fieldLabel: cmd.fieldLabel,
                    fieldType: cmd.fieldType.toUpperCase(),
                    isRequired: cmd.isRequired ?? false,
                    defaultValue: cmd.defaultValue,
                    options: cmd.options,
                    sortOrder: cmd.sortOrder ?? 0,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateFieldDefinitionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateFieldDefinitionHandler = CreateFieldDefinitionHandler;
exports.CreateFieldDefinitionHandler = CreateFieldDefinitionHandler = CreateFieldDefinitionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_field_definition_command_1.CreateFieldDefinitionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateFieldDefinitionHandler);
//# sourceMappingURL=create-field-definition.handler.js.map