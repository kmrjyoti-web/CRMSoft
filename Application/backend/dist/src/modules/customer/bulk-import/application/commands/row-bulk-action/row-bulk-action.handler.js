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
var RowBulkActionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowBulkActionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const row_bulk_action_command_1 = require("./row-bulk-action.command");
let RowBulkActionHandler = RowBulkActionHandler_1 = class RowBulkActionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RowBulkActionHandler_1.name);
    }
    async execute(cmd) {
        try {
            let where = { importJobId: cmd.jobId };
            switch (cmd.action) {
                case 'ACCEPT_ALL_VALID':
                    where.rowStatus = 'VALID';
                    break;
                case 'SKIP_ALL_DUPLICATES':
                    where.rowStatus = { in: ['DUPLICATE_EXACT', 'DUPLICATE_FUZZY', 'DUPLICATE_IN_FILE'] };
                    break;
                case 'SKIP_ALL_INVALID':
                    where.rowStatus = 'INVALID';
                    break;
                case 'ACCEPT_ALL':
                    where.rowStatus = { in: ['VALID', 'DUPLICATE_EXACT', 'DUPLICATE_FUZZY'] };
                    break;
            }
            const action = cmd.action.startsWith('SKIP') ? 'SKIP' : 'ACCEPT';
            const result = await this.prisma.working.importRow.updateMany({
                where,
                data: { userAction: action },
            });
            return { updated: result.count, action };
        }
        catch (error) {
            this.logger.error(`RowBulkActionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RowBulkActionHandler = RowBulkActionHandler;
exports.RowBulkActionHandler = RowBulkActionHandler = RowBulkActionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(row_bulk_action_command_1.RowBulkActionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RowBulkActionHandler);
//# sourceMappingURL=row-bulk-action.handler.js.map