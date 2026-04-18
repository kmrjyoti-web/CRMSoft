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
var SaveProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const save_profile_command_1 = require("./save-profile.command");
let SaveProfileHandler = SaveProfileHandler_1 = class SaveProfileHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SaveProfileHandler_1.name);
    }
    async execute(cmd) {
        try {
            const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
            const profile = await this.prisma.working.importProfile.create({
                data: {
                    name: cmd.name,
                    description: cmd.description,
                    sourceSystem: cmd.sourceSystem,
                    targetEntity: job.targetEntity,
                    expectedHeaders: job.fileHeaders,
                    fieldMapping: job.fieldMapping || [],
                    defaultValues: job.defaultValues || undefined,
                    validationRules: job.validationRules || undefined,
                    duplicateCheckFields: job.duplicateCheckFields,
                    duplicateStrategy: job.duplicateStrategy,
                    fuzzyMatchEnabled: job.fuzzyMatchEnabled,
                    fuzzyMatchFields: job.fuzzyMatchFields,
                    fuzzyThreshold: job.fuzzyThreshold,
                    createdById: job.createdById,
                    createdByName: job.createdByName,
                },
            });
            await this.prisma.working.importJob.update({
                where: { id: cmd.jobId },
                data: { profileId: profile.id },
            });
            return profile;
        }
        catch (error) {
            this.logger.error(`SaveProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SaveProfileHandler = SaveProfileHandler;
exports.SaveProfileHandler = SaveProfileHandler = SaveProfileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(save_profile_command_1.SaveProfileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SaveProfileHandler);
//# sourceMappingURL=save-profile.handler.js.map