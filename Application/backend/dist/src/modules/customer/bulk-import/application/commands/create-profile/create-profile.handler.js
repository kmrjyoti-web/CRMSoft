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
var CreateProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const create_profile_command_1 = require("./create-profile.command");
let CreateProfileHandler = CreateProfileHandler_1 = class CreateProfileHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateProfileHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.importProfile.create({
                data: {
                    name: cmd.name,
                    description: cmd.description,
                    sourceSystem: cmd.sourceSystem,
                    icon: cmd.icon,
                    color: cmd.color,
                    targetEntity: cmd.targetEntity,
                    expectedHeaders: cmd.expectedHeaders,
                    fieldMapping: cmd.fieldMapping,
                    defaultValues: cmd.defaultValues || undefined,
                    validationRules: cmd.validationRules || undefined,
                    duplicateCheckFields: cmd.duplicateCheckFields || [],
                    duplicateStrategy: cmd.duplicateStrategy || 'ASK_PER_ROW',
                    fuzzyMatchEnabled: cmd.fuzzyMatchEnabled || false,
                    fuzzyMatchFields: cmd.fuzzyMatchFields || [],
                    fuzzyThreshold: cmd.fuzzyThreshold || 0.85,
                    createdById: cmd.createdById,
                    createdByName: cmd.createdByName,
                },
            });
        }
        catch (error) {
            this.logger.error(`CreateProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateProfileHandler = CreateProfileHandler;
exports.CreateProfileHandler = CreateProfileHandler = CreateProfileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_profile_command_1.CreateProfileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CreateProfileHandler);
//# sourceMappingURL=create-profile.handler.js.map