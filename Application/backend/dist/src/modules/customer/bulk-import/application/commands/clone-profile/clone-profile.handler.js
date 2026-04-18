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
var CloneProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloneProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const clone_profile_command_1 = require("./clone-profile.command");
let CloneProfileHandler = CloneProfileHandler_1 = class CloneProfileHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CloneProfileHandler_1.name);
    }
    async execute(cmd) {
        try {
            const source = await this.prisma.working.importProfile.findUniqueOrThrow({ where: { id: cmd.profileId } });
            return this.prisma.working.importProfile.create({
                data: {
                    name: cmd.newName,
                    description: source.description ? `Clone of ${source.name}: ${source.description}` : `Clone of ${source.name}`,
                    sourceSystem: source.sourceSystem,
                    icon: source.icon,
                    color: source.color,
                    targetEntity: source.targetEntity,
                    expectedHeaders: source.expectedHeaders,
                    headerMatchMode: source.headerMatchMode,
                    fieldMapping: source.fieldMapping,
                    defaultValues: source.defaultValues || undefined,
                    validationRules: source.validationRules || undefined,
                    duplicateCheckFields: source.duplicateCheckFields,
                    duplicateStrategy: source.duplicateStrategy,
                    fuzzyMatchEnabled: source.fuzzyMatchEnabled,
                    fuzzyMatchFields: source.fuzzyMatchFields,
                    fuzzyThreshold: source.fuzzyThreshold,
                    createdById: cmd.createdById,
                    createdByName: cmd.createdByName,
                },
            });
        }
        catch (error) {
            this.logger.error(`CloneProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CloneProfileHandler = CloneProfileHandler;
exports.CloneProfileHandler = CloneProfileHandler = CloneProfileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(clone_profile_command_1.CloneProfileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CloneProfileHandler);
//# sourceMappingURL=clone-profile.handler.js.map