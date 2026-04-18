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
var CancelImportHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelImportHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const cancel_import_command_1 = require("./cancel-import.command");
let CancelImportHandler = CancelImportHandler_1 = class CancelImportHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CancelImportHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.importJob.update({
                where: { id: cmd.jobId },
                data: { status: 'CANCELLED' },
            });
        }
        catch (error) {
            this.logger.error(`CancelImportHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelImportHandler = CancelImportHandler;
exports.CancelImportHandler = CancelImportHandler = CancelImportHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_import_command_1.CancelImportCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CancelImportHandler);
//# sourceMappingURL=cancel-import.handler.js.map