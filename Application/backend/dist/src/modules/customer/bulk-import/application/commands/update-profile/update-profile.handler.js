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
var UpdateProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const update_profile_command_1 = require("./update-profile.command");
let UpdateProfileHandler = UpdateProfileHandler_1 = class UpdateProfileHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(UpdateProfileHandler_1.name);
    }
    async execute(cmd) {
        try {
            const updateData = {};
            const d = cmd.data;
            if (d.name !== undefined)
                updateData.name = d.name;
            if (d.description !== undefined)
                updateData.description = d.description;
            if (d.sourceSystem !== undefined)
                updateData.sourceSystem = d.sourceSystem;
            if (d.icon !== undefined)
                updateData.icon = d.icon;
            if (d.color !== undefined)
                updateData.color = d.color;
            if (d.fieldMapping !== undefined)
                updateData.fieldMapping = d.fieldMapping;
            if (d.expectedHeaders !== undefined)
                updateData.expectedHeaders = d.expectedHeaders;
            if (d.defaultValues !== undefined)
                updateData.defaultValues = d.defaultValues;
            if (d.validationRules !== undefined)
                updateData.validationRules = d.validationRules;
            if (d.duplicateCheckFields !== undefined)
                updateData.duplicateCheckFields = d.duplicateCheckFields;
            if (d.duplicateStrategy !== undefined)
                updateData.duplicateStrategy = d.duplicateStrategy;
            if (d.fuzzyMatchEnabled !== undefined)
                updateData.fuzzyMatchEnabled = d.fuzzyMatchEnabled;
            if (d.fuzzyMatchFields !== undefined)
                updateData.fuzzyMatchFields = d.fuzzyMatchFields;
            if (d.fuzzyThreshold !== undefined)
                updateData.fuzzyThreshold = d.fuzzyThreshold;
            return this.prisma.working.importProfile.update({ where: { id: cmd.profileId }, data: updateData });
        }
        catch (error) {
            this.logger.error(`UpdateProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.UpdateProfileHandler = UpdateProfileHandler;
exports.UpdateProfileHandler = UpdateProfileHandler = UpdateProfileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(update_profile_command_1.UpdateProfileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UpdateProfileHandler);
//# sourceMappingURL=update-profile.handler.js.map