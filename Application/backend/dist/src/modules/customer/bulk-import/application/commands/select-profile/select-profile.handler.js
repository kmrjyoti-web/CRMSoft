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
var SelectProfileHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectProfileHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const profile_matcher_service_1 = require("../../../services/profile-matcher.service");
const field_mapper_service_1 = require("../../../services/field-mapper.service");
const select_profile_command_1 = require("./select-profile.command");
let SelectProfileHandler = SelectProfileHandler_1 = class SelectProfileHandler {
    constructor(prisma, profileMatcher, fieldMapper) {
        this.prisma = prisma;
        this.profileMatcher = profileMatcher;
        this.fieldMapper = fieldMapper;
        this.logger = new common_1.Logger(SelectProfileHandler_1.name);
    }
    async execute(cmd) {
        try {
            const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
            const profile = await this.prisma.working.importProfile.findUniqueOrThrow({ where: { id: cmd.profileId } });
            const match = this.profileMatcher.matchHeaders(job.fileHeaders, profile);
            await this.prisma.working.importJob.update({
                where: { id: cmd.jobId },
                data: {
                    profileId: cmd.profileId,
                    profileMatchScore: match.matchScore,
                    duplicateCheckFields: profile.duplicateCheckFields,
                    duplicateStrategy: profile.duplicateStrategy,
                    fuzzyMatchEnabled: profile.fuzzyMatchEnabled,
                    fuzzyMatchFields: profile.fuzzyMatchFields,
                    fuzzyThreshold: profile.fuzzyThreshold,
                    validationRules: profile.validationRules || undefined,
                    defaultValues: profile.defaultValues || undefined,
                },
            });
            if (match.status === 'FULL_MATCH') {
                await this.autoMapRows(cmd.jobId, match.resolvedMapping, profile);
                return { matchStatus: match.status, matchScore: match.matchScore, nextStep: 'validate' };
            }
            await this.prisma.working.importJob.update({
                where: { id: cmd.jobId },
                data: { fieldMapping: match.resolvedMapping, status: 'MAPPING' },
            });
            return {
                matchStatus: match.status,
                matchScore: match.matchScore,
                resolvedMapping: match.resolvedMapping,
                unmatchedHeaders: match.unmatchedHeaders,
                nextStep: 'mapping',
            };
        }
        catch (error) {
            this.logger.error(`SelectProfileHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async autoMapRows(jobId, resolvedMapping, profile) {
        const rows = await this.prisma.working.importRow.findMany({
            where: { importJobId: jobId },
            orderBy: { rowNumber: 'asc' },
        });
        const rawRows = rows.map(r => r.rowData);
        const { mappedRows } = this.fieldMapper.mapRows(rawRows, resolvedMapping, profile.defaultValues);
        for (let i = 0; i < rows.length; i++) {
            await this.prisma.working.importRow.update({
                where: { id: rows[i].id },
                data: { mappedData: mappedRows[i] },
            });
        }
        await this.prisma.working.importJob.update({
            where: { id: jobId },
            data: { fieldMapping: resolvedMapping, status: 'MAPPED', usedAutoMapping: true },
        });
    }
};
exports.SelectProfileHandler = SelectProfileHandler;
exports.SelectProfileHandler = SelectProfileHandler = SelectProfileHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(select_profile_command_1.SelectProfileCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        profile_matcher_service_1.ProfileMatcherService,
        field_mapper_service_1.FieldMapperService])
], SelectProfileHandler);
//# sourceMappingURL=select-profile.handler.js.map