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
var AutoNumberService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoNumberService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const app_error_1 = require("../../../../../common/errors/app-error");
const working_client_1 = require("@prisma/working-client");
let AutoNumberService = AutoNumberService_1 = class AutoNumberService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(AutoNumberService_1.name);
    }
    async next(tenantId, entityName) {
        return this.prisma.identity.$transaction(async (tx) => {
            const rows = await tx.$queryRawUnsafe(`SELECT * FROM auto_number_sequences WHERE tenant_id = $1 AND entity_name = $2 FOR UPDATE`, tenantId, entityName);
            if (!rows.length)
                throw app_error_1.AppError.from('CONFIG_ERROR');
            const seq = rows[0];
            if (!seq.isActive)
                throw app_error_1.AppError.from('CONFIG_ERROR');
            let current = seq.currentSequence;
            const shouldReset = this.shouldReset(seq);
            if (shouldReset) {
                current = seq.startFrom - seq.incrementBy;
                await tx.autoNumberSequence.update({
                    where: { id: seq.id },
                    data: {
                        lastResetSequence: seq.currentSequence,
                        lastResetAt: new Date(),
                    },
                });
            }
            const nextVal = current + seq.incrementBy;
            const formatted = this.format(seq.formatPattern, seq.prefix, nextVal, seq.seqPadding);
            await tx.autoNumberSequence.update({
                where: { id: seq.id },
                data: { currentSequence: nextVal, sampleNumber: formatted },
            });
            return formatted;
        });
    }
    async preview(tenantId, entityName) {
        const seq = await this.findSequence(tenantId, entityName);
        const nextVal = seq.currentSequence + seq.incrementBy;
        return this.format(seq.formatPattern, seq.prefix, nextVal, seq.seqPadding);
    }
    async resetSequence(tenantId, entityName, newStart) {
        const seq = await this.findSequence(tenantId, entityName);
        const startVal = newStart ?? seq.startFrom;
        await this.prisma.autoNumberSequence.update({
            where: { id: seq.id },
            data: {
                currentSequence: startVal - seq.incrementBy,
                lastResetAt: new Date(),
                lastResetSequence: seq.currentSequence,
            },
        });
        this.logger.log(`Reset sequence ${entityName} for tenant ${tenantId} to ${startVal}`);
    }
    async autoResetAll(tenantId) {
        const sequences = await this.prisma.autoNumberSequence.findMany({
            where: { tenantId, isActive: true },
        });
        const reset = [];
        const skipped = [];
        for (const seq of sequences) {
            if (this.shouldReset(seq)) {
                await this.resetSequence(tenantId, seq.entityName);
                reset.push(seq.entityName);
            }
            else {
                skipped.push(seq.entityName);
            }
        }
        return { reset, skipped };
    }
    async getAll(tenantId) {
        return this.prisma.autoNumberSequence.findMany({ where: { tenantId } });
    }
    async getOne(tenantId, entityName) {
        return this.findSequence(tenantId, entityName);
    }
    async update(tenantId, entityName, data) {
        const seq = await this.findSequence(tenantId, entityName);
        return this.prisma.autoNumberSequence.update({ where: { id: seq.id }, data });
    }
    format(pattern, prefix, seq, defaultPad) {
        const now = new Date();
        return pattern
            .replace(/{PREFIX}/g, prefix)
            .replace(/{YYYY}/g, now.getFullYear().toString())
            .replace(/{YY}/g, now.getFullYear().toString().slice(-2))
            .replace(/{MM}/g, String(now.getMonth() + 1).padStart(2, '0'))
            .replace(/{DD}/g, String(now.getDate()).padStart(2, '0'))
            .replace(/{SEQ:(\d+)}/g, (_, n) => seq.toString().padStart(Number(n), '0'))
            .replace(/{SEQ}/g, seq.toString().padStart(defaultPad, '0'));
    }
    shouldReset(seq) {
        if (seq.resetPolicy === working_client_1.SequenceResetPolicy.NEVER)
            return false;
        const lastReset = seq.lastResetAt ?? seq.createdAt;
        const now = new Date();
        switch (seq.resetPolicy) {
            case working_client_1.SequenceResetPolicy.DAILY:
                return now.toDateString() !== lastReset.toDateString();
            case working_client_1.SequenceResetPolicy.MONTHLY:
                return now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();
            case working_client_1.SequenceResetPolicy.QUARTERLY:
                return Math.floor(now.getMonth() / 3) !== Math.floor(lastReset.getMonth() / 3)
                    || now.getFullYear() !== lastReset.getFullYear();
            case working_client_1.SequenceResetPolicy.YEARLY:
                return now.getFullYear() !== lastReset.getFullYear();
            default:
                return false;
        }
    }
    async findSequence(tenantId, entityName) {
        const seq = await this.prisma.autoNumberSequence.findUnique({
            where: { tenantId_entityName: { tenantId, entityName } },
        });
        if (!seq)
            throw app_error_1.AppError.from('CONFIG_ERROR');
        return seq;
    }
};
exports.AutoNumberService = AutoNumberService;
exports.AutoNumberService = AutoNumberService = AutoNumberService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AutoNumberService);
//# sourceMappingURL=auto-number.service.js.map