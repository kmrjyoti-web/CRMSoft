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
var ValidateRowsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateRowsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const row_validator_service_1 = require("../../../services/row-validator.service");
const duplicate_detector_service_1 = require("../../../services/duplicate-detector.service");
const patch_generator_service_1 = require("../../../services/patch-generator.service");
const validate_rows_command_1 = require("./validate-rows.command");
let ValidateRowsHandler = ValidateRowsHandler_1 = class ValidateRowsHandler {
    constructor(prisma, rowValidator, duplicateDetector, patchGenerator) {
        this.prisma = prisma;
        this.rowValidator = rowValidator;
        this.duplicateDetector = duplicateDetector;
        this.patchGenerator = patchGenerator;
        this.logger = new common_1.Logger(ValidateRowsHandler_1.name);
    }
    async execute(cmd) {
        try {
            await this.prisma.working.importJob.update({ where: { id: cmd.jobId }, data: { status: 'VALIDATING' } });
            const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
            const rows = await this.prisma.working.importRow.findMany({
                where: { importJobId: cmd.jobId },
                orderBy: { rowNumber: 'asc' },
            });
            const validationRules = job.validationRules || [];
            const checkFields = job.duplicateCheckFields || [];
            const fuzzyFields = job.fuzzyMatchFields || [];
            const threshold = Number(job.fuzzyThreshold) || 0.85;
            const rowInputs = rows.map(r => ({ rowNumber: r.rowNumber, mappedData: (r.mappedData || {}) }));
            const validationResults = this.rowValidator.validateAllRows(rowInputs, validationRules);
            const inFileDups = this.duplicateDetector.detectInFileDuplicates(rowInputs, checkFields);
            const exactDups = await this.duplicateDetector.detectExactDbDuplicates(rowInputs, checkFields, job.targetEntity);
            let fuzzyDups = new Map();
            if (job.fuzzyMatchEnabled && fuzzyFields.length > 0) {
                const nonExact = rowInputs.filter(r => !exactDups.has(r.rowNumber) && !inFileDups.has(r.rowNumber));
                fuzzyDups = await this.duplicateDetector.detectFuzzyDbDuplicates(nonExact, fuzzyFields, job.targetEntity, threshold);
            }
            const updateRows = rows
                .filter(r => exactDups.has(r.rowNumber) && exactDups.get(r.rowNumber).duplicateOfEntityId)
                .map(r => ({
                rowNumber: r.rowNumber,
                mappedData: (r.mappedData || {}),
                entityId: exactDups.get(r.rowNumber).duplicateOfEntityId,
            }));
            const patches = await this.patchGenerator.generatePatchesForRows(updateRows, job.targetEntity);
            let validCount = 0, invalidCount = 0, exactDupCount = 0, fuzzyDupCount = 0, inFileDupCount = 0;
            const batchUpdates = [];
            for (const row of rows) {
                const updateData = {};
                const validation = validationResults.get(row.rowNumber);
                const inFile = inFileDups.get(row.rowNumber);
                const exact = exactDups.get(row.rowNumber);
                const fuzzy = fuzzyDups.get(row.rowNumber);
                if (validation) {
                    updateData.validationErrors = validation.errors.length > 0 ? validation.errors : undefined;
                    updateData.validationWarnings = validation.warnings.length > 0 ? validation.warnings : undefined;
                    if (validation.cleanedData)
                        updateData.mappedData = validation.cleanedData;
                }
                if (validation && !validation.valid) {
                    updateData.rowStatus = 'INVALID';
                    invalidCount++;
                }
                else if (inFile) {
                    updateData.rowStatus = 'DUPLICATE_IN_FILE';
                    updateData.isDuplicate = true;
                    updateData.duplicateType = inFile.duplicateType;
                    updateData.duplicateOfRowNumber = inFile.duplicateOfRowNumber;
                    updateData.duplicateMatchField = inFile.duplicateMatchField;
                    updateData.duplicateMatchValue = inFile.duplicateMatchValue;
                    inFileDupCount++;
                }
                else if (exact) {
                    updateData.rowStatus = 'DUPLICATE_EXACT';
                    updateData.isDuplicate = true;
                    updateData.duplicateType = exact.duplicateType;
                    updateData.duplicateOfEntityId = exact.duplicateOfEntityId;
                    updateData.duplicateMatchField = exact.duplicateMatchField;
                    updateData.duplicateMatchValue = exact.duplicateMatchValue;
                    const patch = patches.get(row.rowNumber);
                    if (patch)
                        updateData.patchPreview = patch;
                    exactDupCount++;
                }
                else if (fuzzy) {
                    updateData.rowStatus = 'DUPLICATE_FUZZY';
                    updateData.isDuplicate = true;
                    updateData.duplicateType = fuzzy.duplicateType;
                    updateData.fuzzyMatchScore = fuzzy.fuzzyMatchScore;
                    updateData.fuzzyMatchDetails = fuzzy.fuzzyMatchDetails;
                    fuzzyDupCount++;
                }
                else {
                    updateData.rowStatus = 'VALID';
                    validCount++;
                }
                batchUpdates.push({ id: row.id, data: updateData });
            }
            const CHUNK = 100;
            for (let i = 0; i < batchUpdates.length; i += CHUNK) {
                const chunk = batchUpdates.slice(i, i + CHUNK);
                await this.prisma.$transaction(chunk.map((u) => this.prisma.working.importRow.update({ where: { id: u.id }, data: u.data })));
            }
            await this.prisma.working.importJob.update({
                where: { id: cmd.jobId },
                data: {
                    status: 'VALIDATED',
                    validRows: validCount,
                    invalidRows: invalidCount,
                    duplicateExactRows: exactDupCount,
                    duplicateFuzzyRows: fuzzyDupCount,
                    duplicateInFileRows: inFileDupCount,
                },
            });
            return {
                totalRows: rows.length,
                valid: validCount,
                invalid: invalidCount,
                duplicateExact: exactDupCount,
                duplicateFuzzy: fuzzyDupCount,
                duplicateInFile: inFileDupCount,
            };
        }
        catch (error) {
            this.logger.error(`ValidateRowsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ValidateRowsHandler = ValidateRowsHandler;
exports.ValidateRowsHandler = ValidateRowsHandler = ValidateRowsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(validate_rows_command_1.ValidateRowsCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        row_validator_service_1.RowValidatorService,
        duplicate_detector_service_1.DuplicateDetectorService,
        patch_generator_service_1.PatchGeneratorService])
], ValidateRowsHandler);
//# sourceMappingURL=validate-rows.handler.js.map