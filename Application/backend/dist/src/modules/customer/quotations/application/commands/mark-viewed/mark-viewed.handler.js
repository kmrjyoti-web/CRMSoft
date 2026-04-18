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
var MarkViewedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkViewedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const mark_viewed_command_1 = require("./mark-viewed.command");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
let MarkViewedHandler = MarkViewedHandler_1 = class MarkViewedHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MarkViewedHandler_1.name);
    }
    async execute(cmd) {
        try {
            const quotation = await this.prisma.working.quotation.findUnique({ where: { id: cmd.id } });
            if (!quotation)
                throw new common_1.NotFoundException('Quotation not found');
            if (quotation.status === 'SENT') {
                await this.prisma.working.quotation.update({
                    where: { id: cmd.id },
                    data: { status: 'VIEWED' },
                });
            }
            if (cmd.sendLogId) {
                await this.prisma.working.quotationSendLog.update({
                    where: { id: cmd.sendLogId },
                    data: {
                        viewedAt: new Date(),
                        viewCount: { increment: 1 },
                    },
                });
            }
            else {
                const latestLog = await this.prisma.working.quotationSendLog.findFirst({
                    where: { quotationId: cmd.id },
                    orderBy: { sentAt: 'desc' },
                });
                if (latestLog) {
                    await this.prisma.working.quotationSendLog.update({
                        where: { id: latestLog.id },
                        data: { viewedAt: new Date(), viewCount: { increment: 1 } },
                    });
                }
            }
            await this.prisma.working.quotationActivity.create({
                data: {
                    quotationId: cmd.id, action: 'VIEWED',
                    description: 'Quotation viewed by recipient',
                    performedById: 'SYSTEM', performedByName: 'System',
                },
            });
            return { viewed: true };
        }
        catch (error) {
            this.logger.error(`MarkViewedHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.MarkViewedHandler = MarkViewedHandler;
exports.MarkViewedHandler = MarkViewedHandler = MarkViewedHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(mark_viewed_command_1.MarkViewedCommand),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MarkViewedHandler);
//# sourceMappingURL=mark-viewed.handler.js.map