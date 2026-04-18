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
var RowActionHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RowActionHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const row_action_command_1 = require("./row-action.command");
let RowActionHandler = RowActionHandler_1 = class RowActionHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RowActionHandler_1.name);
    }
    async execute(cmd) {
        try {
            return this.prisma.working.importRow.update({
                where: { id: cmd.rowId },
                data: { userAction: cmd.action },
            });
        }
        catch (error) {
            this.logger.error(`RowActionHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RowActionHandler = RowActionHandler;
exports.RowActionHandler = RowActionHandler = RowActionHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(row_action_command_1.RowActionCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RowActionHandler);
//# sourceMappingURL=row-action.handler.js.map