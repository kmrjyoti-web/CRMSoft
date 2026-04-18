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
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let BankService = class BankService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBankAccount(tenantId, data) {
        let ledgerId = data.ledgerId;
        if (!ledgerId) {
            const ledger = await this.prisma.working.ledgerMaster.create({
                data: {
                    tenantId,
                    code: `BANK_${data.accountNumber.slice(-4)}`,
                    name: `${data.bankName} - ${data.accountNumber.slice(-4)}`,
                    groupType: 'ASSET',
                    subGroup: 'BANK',
                    openingBalance: data.openingBalance ?? 0,
                    currentBalance: data.openingBalance ?? 0,
                },
            });
            ledgerId = ledger.id;
        }
        return this.prisma.working.bankAccount.create({
            data: {
                tenantId,
                bankName: data.bankName,
                accountNumber: data.accountNumber,
                accountType: data.accountType,
                ifscCode: data.ifscCode,
                branchName: data.branchName,
                ledgerId,
                openingBalance: data.openingBalance ?? 0,
                currentBalance: data.openingBalance ?? 0,
                isDefault: data.isDefault ?? false,
            },
        });
    }
    async listBankAccounts(tenantId) {
        return this.prisma.working.bankAccount.findMany({
            where: { tenantId, isActive: true },
            orderBy: { bankName: 'asc' },
        });
    }
    async getReconciliation(tenantId, bankAccountId) {
        const bank = await this.prisma.working.bankAccount.findFirst({ where: { id: bankAccountId, tenantId } });
        if (!bank)
            throw new common_1.NotFoundException('Bank account not found');
        const unreconciled = await this.prisma.working.paymentRecord.findMany({
            where: {
                tenantId,
                bankAccountId,
                status: 'APPROVED',
            },
            orderBy: { paymentDate: 'desc' },
        });
        return {
            bankAccount: bank,
            bookBalance: Number(bank.currentBalance),
            unreconciledPayments: unreconciled,
            unreconciledCount: unreconciled.length,
        };
    }
    async submitReconciliation(tenantId, userId, data) {
        const bank = await this.prisma.working.bankAccount.findFirst({ where: { id: data.bankAccountId, tenantId } });
        if (!bank)
            throw new common_1.NotFoundException('Bank account not found');
        const bookBalance = Number(bank.currentBalance);
        const difference = Math.round((data.statementBalance - bookBalance) * 100) / 100;
        const recon = await this.prisma.working.bankReconciliation.create({
            data: {
                tenantId,
                bankAccountId: data.bankAccountId,
                reconciliationDate: new Date(data.reconciliationDate),
                statementBalance: data.statementBalance,
                bookBalance,
                difference,
                status: difference === 0 ? 'COMPLETED' : 'IN_PROGRESS',
                reconciledById: userId,
                completedAt: difference === 0 ? new Date() : undefined,
            },
        });
        if (difference === 0) {
            await this.prisma.working.paymentRecord.updateMany({
                where: { tenantId, bankAccountId: data.bankAccountId, status: 'APPROVED' },
                data: { status: 'RECONCILED' },
            });
        }
        return recon;
    }
};
exports.BankService = BankService;
exports.BankService = BankService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BankService);
//# sourceMappingURL=bank.service.js.map