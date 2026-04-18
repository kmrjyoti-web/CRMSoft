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
var ApplyMappingHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyMappingHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const field_mapper_service_1 = require("../../../services/field-mapper.service");
const apply_mapping_command_1 = require("./apply-mapping.command");
let ApplyMappingHandler = ApplyMappingHandler_1 = class ApplyMappingHandler {
    constructor(prisma, fieldMapper) {
        this.prisma = prisma;
        this.fieldMapper = fieldMapper;
        this.logger = new common_1.Logger(ApplyMappingHandler_1.name);
    }
    async execute(cmd) {
        try {
            const rows = await this.prisma.working.importRow.findMany({
                where: { importJobId: cmd.jobId },
                orderBy: { rowNumber: 'asc' },
            });
            const rawRows = rows.map(r => r.rowData);
            const { mappedRows } = this.fieldMapper.mapRows(rawRows, cmd.fieldMapping, cmd.defaultValues);
            for (let i = 0; i < rows.length; i++) {
                await this.prisma.working.importRow.update({
                    where: { id: rows[i].id },
                    data: { mappedData: mappedRows[i] },
                });
            }
            await this.prisma.working.importJob.update({
                where: { id: cmd.jobId },
                data: {
                    fieldMapping: cmd.fieldMapping,
                    validationRules: cmd.validationRules || undefined,
                    defaultValues: cmd.defaultValues || undefined,
                    duplicateCheckFields: cmd.duplicateCheckFields || [],
                    duplicateStrategy: cmd.duplicateStrategy || 'ASK_PER_ROW',
                    fuzzyMatchEnabled: cmd.fuzzyMatchEnabled || false,
                    fuzzyMatchFields: cmd.fuzzyMatchFields || [],
                    fuzzyThreshold: cmd.fuzzyThreshold || 0.85,
                    status: 'MAPPED',
                },
            });
            return { mapped: true, rowCount: rows.length };
        }
        catch (error) {
            this.logger.error(`ApplyMappingHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ApplyMappingHandler = ApplyMappingHandler;
exports.ApplyMappingHandler = ApplyMappingHandler = ApplyMappingHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(apply_mapping_command_1.ApplyMappingCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        field_mapper_service_1.FieldMapperService])
], ApplyMappingHandler);
//# sourceMappingURL=apply-mapping.handler.js.map