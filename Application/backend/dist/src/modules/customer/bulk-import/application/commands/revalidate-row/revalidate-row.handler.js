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
var RevalidateRowHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevalidateRowHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const row_validator_service_1 = require("../../../services/row-validator.service");
const revalidate_row_command_1 = require("./revalidate-row.command");
let RevalidateRowHandler = RevalidateRowHandler_1 = class RevalidateRowHandler {
    constructor(prisma, rowValidator) {
        this.prisma = prisma;
        this.rowValidator = rowValidator;
        this.logger = new common_1.Logger(RevalidateRowHandler_1.name);
    }
    async execute(cmd) {
        try {
            const row = await this.prisma.working.importRow.findUniqueOrThrow({ where: { id: cmd.rowId } });
            const job = await this.prisma.working.importJob.findUniqueOrThrow({ where: { id: cmd.jobId } });
            const data = (row.userEditedData || row.mappedData || {});
            const rules = job.validationRules || [];
            const result = this.rowValidator.validateRow(data, rules);
            await this.prisma.working.importRow.update({
                where: { id: cmd.rowId },
                data: {
                    rowStatus: result.valid ? 'VALID' : 'INVALID',
                    validationErrors: result.errors.length > 0 ? result.errors : undefined,
                    validationWarnings: result.warnings.length > 0 ? result.warnings : undefined,
                    mappedData: result.cleanedData,
                },
            });
            return result;
        }
        catch (error) {
            this.logger.error(`RevalidateRowHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RevalidateRowHandler = RevalidateRowHandler;
exports.RevalidateRowHandler = RevalidateRowHandler = RevalidateRowHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(revalidate_row_command_1.RevalidateRowCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        row_validator_service_1.RowValidatorService])
], RevalidateRowHandler);
//# sourceMappingURL=revalidate-row.handler.js.map