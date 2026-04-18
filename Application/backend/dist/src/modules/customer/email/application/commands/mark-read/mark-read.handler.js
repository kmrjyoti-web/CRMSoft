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
var MarkReadHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkReadHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const mark_read_command_1 = require("./mark-read.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let MarkReadHandler = MarkReadHandler_1 = class MarkReadHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MarkReadHandler_1.name);
    }
    async execute(cmd) {
        try {
            const email = await this.prisma.working.email.update({
                where: { id: cmd.emailId },
                data: { isRead: cmd.isRead },
            });
            return email;
        }
        catch (error) {
            this.logger.error(`MarkReadHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MarkReadHandler = MarkReadHandler;
exports.MarkReadHandler = MarkReadHandler = MarkReadHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(mark_read_command_1.MarkReadCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarkReadHandler);
//# sourceMappingURL=mark-read.handler.js.map