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
exports.FinancialReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
let FinancialReportService = class FinancialReportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfitAndLoss(tenantId, fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const transactions = await this.prisma.working.accountTransaction.findMany({
            where: { tenantId, transactionDate: { gte: from, lte: to } },
        });
        const ledgers = await this.prisma.working.ledgerMaster.findMany({ where: { tenantId } });
        const ledgerMap = new Map(ledgers.map((l) => [l.id, l]));
        const income = [];
        const expenses = [];
        const ledgerTotals = {};
        for (const txn of transactions) {
            const debitLedger = ledgerMap.get(txn.debitLedgerId);
            const creditLedger = ledgerMap.get(txn.creditLedgerId);
            const amt = Number(txn.amount);
            if (debitLedger) {
                ledgerTotals[debitLedger.id] = (ledgerTotals[debitLedger.id] ?? 0) + amt;
            }
            if (creditLedger) {
                ledgerTotals[creditLedger.id] = (ledgerTotals[creditLedger.id] ?? 0) - amt;
            }
        }
        for (const ledger of ledgers) {
            const balance = ledgerTotals[ledger.id] ?? 0;
            if (balance === 0)
                continue;
            if (ledger.groupType === 'INCOME') {
                income.push({ name: ledger.name, amount: Math.abs(balance) });
            }
            else if (ledger.groupType === 'EXPENSE') {
                expenses.push({ name: ledger.name, amount: Math.abs(balance) });
            }
        }
        const totalIncome = income.reduce((s, i) => s + i.amount, 0);
        const totalExpenses = expenses.reduce((s, i) => s + i.amount, 0);
        const netProfit = Math.round((totalIncome - totalExpenses) * 100) / 100;
        return {
            period: { from: fromDate, to: toDate },
            income,
            expenses,
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpenses: Math.round(totalExpenses * 100) / 100,
            grossProfit: Math.round(totalIncome * 100) / 100,
            netProfit,
        };
    }
    async getBalanceSheet(tenantId, asOfDate) {
        const date = new Date(asOfDate);
        const ledgers = await this.prisma.working.ledgerMaster.findMany({ where: { tenantId } });
        const transactions = await this.prisma.working.accountTransaction.findMany({
            where: { tenantId, transactionDate: { lte: date } },
        });
        const balances = {};
        for (const l of ledgers) {
            balances[l.id] = Number(l.openingBalance);
        }
        for (const txn of transactions) {
            balances[txn.debitLedgerId] = (balances[txn.debitLedgerId] ?? 0) + Number(txn.amount);
            balances[txn.creditLedgerId] = (balances[txn.creditLedgerId] ?? 0) - Number(txn.amount);
        }
        const assets = [];
        const liabilities = [];
        const equity = [];
        for (const l of ledgers) {
            const bal = Math.round((balances[l.id] ?? 0) * 100) / 100;
            if (bal === 0)
                continue;
            const item = { name: l.name, group: l.subGroup || l.groupType, balance: Math.abs(bal) };
            if (l.groupType === 'ASSET')
                assets.push(item);
            else if (l.groupType === 'LIABILITY')
                liabilities.push(item);
            else if (l.groupType === 'EQUITY')
                equity.push(item);
        }
        const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
        const totalLiabilities = liabilities.reduce((s, l) => s + l.balance, 0);
        const totalEquity = equity.reduce((s, e) => s + e.balance, 0);
        return {
            asOfDate,
            assets,
            liabilities,
            equity,
            totalAssets: Math.round(totalAssets * 100) / 100,
            totalLiabilities: Math.round(totalLiabilities * 100) / 100,
            totalEquity: Math.round(totalEquity * 100) / 100,
            isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        };
    }
    async getTrialBalance(tenantId, fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const ledgers = await this.prisma.working.ledgerMaster.findMany({ where: { tenantId, isActive: true } });
        const transactions = await this.prisma.working.accountTransaction.findMany({
            where: { tenantId, transactionDate: { gte: from, lte: to } },
        });
        const debitTotals = {};
        const creditTotals = {};
        for (const txn of transactions) {
            debitTotals[txn.debitLedgerId] = (debitTotals[txn.debitLedgerId] ?? 0) + Number(txn.amount);
            creditTotals[txn.creditLedgerId] = (creditTotals[txn.creditLedgerId] ?? 0) + Number(txn.amount);
        }
        const rows = ledgers.map((l) => ({
            ledgerId: l.id,
            name: l.name,
            code: l.code,
            groupType: l.groupType,
            debit: Math.round((debitTotals[l.id] ?? 0) * 100) / 100,
            credit: Math.round((creditTotals[l.id] ?? 0) * 100) / 100,
        })).filter((r) => r.debit > 0 || r.credit > 0);
        const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
        const totalCredit = rows.reduce((s, r) => s + r.credit, 0);
        return {
            period: { from: fromDate, to: toDate },
            ledgers: rows,
            totalDebit: Math.round(totalDebit * 100) / 100,
            totalCredit: Math.round(totalCredit * 100) / 100,
            isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
        };
    }
    async getLedgerStatement(tenantId, ledgerId, fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const ledger = await this.prisma.working.ledgerMaster.findFirst({ where: { id: ledgerId, tenantId } });
        if (!ledger)
            return null;
        const transactions = await this.prisma.working.accountTransaction.findMany({
            where: {
                tenantId,
                transactionDate: { gte: from, lte: to },
                OR: [{ debitLedgerId: ledgerId }, { creditLedgerId: ledgerId }],
            },
            orderBy: { transactionDate: 'asc' },
        });
        let balance = Number(ledger.openingBalance);
        const entries = transactions.map((txn) => {
            const isDebit = txn.debitLedgerId === ledgerId;
            const amt = Number(txn.amount);
            balance += isDebit ? amt : -amt;
            return {
                date: txn.transactionDate,
                voucherType: txn.voucherType,
                voucherNumber: txn.voucherNumber,
                narration: txn.narration,
                debit: isDebit ? amt : 0,
                credit: isDebit ? 0 : amt,
                balance: Math.round(balance * 100) / 100,
            };
        });
        return {
            ledgerName: ledger.name,
            ledgerCode: ledger.code,
            openingBalance: Number(ledger.openingBalance),
            closingBalance: Math.round(balance * 100) / 100,
            entries,
        };
    }
    async getPayableAging(tenantId) {
        const now = new Date();
        const invoices = await this.prisma.working.purchaseInvoice.findMany({
            where: { tenantId, paymentStatus: { in: ['UNPAID', 'PARTIAL'] } },
        });
        const buckets = { current: [], aging30: [], aging60: [], aging90: [] };
        for (const inv of invoices) {
            const due = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.invoiceDate);
            const daysOverdue = Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
            const item = {
                invoiceRef: inv.ourReference,
                vendorId: inv.vendorId,
                amount: Number(inv.balanceAmount),
                dueDate: due,
                daysOverdue,
            };
            if (daysOverdue <= 0)
                buckets.current.push(item);
            else if (daysOverdue <= 30)
                buckets.aging30.push(item);
            else if (daysOverdue <= 60)
                buckets.aging60.push(item);
            else if (daysOverdue <= 90)
                buckets.aging60.push(item);
            else
                buckets.aging90.push(item);
        }
        return {
            ...buckets,
            total: {
                current: buckets.current.reduce((s, i) => s + i.amount, 0),
                aging30: buckets.aging30.reduce((s, i) => s + i.amount, 0),
                aging60: buckets.aging60.reduce((s, i) => s + i.amount, 0),
                aging90: buckets.aging90.reduce((s, i) => s + i.amount, 0),
            },
        };
    }
    async getReceivableAging(tenantId) {
        const now = new Date();
        const invoices = await this.prisma.working.invoice.findMany({
            where: { tenantId, status: { in: ['SENT', 'PARTIALLY_PAID', 'OVERDUE'] } },
        });
        const buckets = { current: [], aging30: [], aging60: [], aging90: [] };
        for (const inv of invoices) {
            const daysOverdue = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
            const item = {
                invoiceNo: inv.invoiceNo,
                contactId: inv.contactId,
                billingName: inv.billingName,
                amount: Number(inv.balanceAmount),
                dueDate: inv.dueDate,
                daysOverdue,
            };
            if (daysOverdue <= 0)
                buckets.current.push(item);
            else if (daysOverdue <= 30)
                buckets.aging30.push(item);
            else if (daysOverdue <= 60)
                buckets.aging60.push(item);
            else
                buckets.aging90.push(item);
        }
        return {
            ...buckets,
            total: {
                current: buckets.current.reduce((s, i) => s + i.amount, 0),
                aging30: buckets.aging30.reduce((s, i) => s + i.amount, 0),
                aging60: buckets.aging60.reduce((s, i) => s + i.amount, 0),
                aging90: buckets.aging90.reduce((s, i) => s + i.amount, 0),
            },
        };
    }
    async getCashFlow(tenantId, fromDate, toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const transactions = await this.prisma.working.accountTransaction.findMany({
            where: { tenantId, transactionDate: { gte: from, lte: to } },
        });
        const ledgers = await this.prisma.working.ledgerMaster.findMany({ where: { tenantId } });
        const ledgerMap = new Map(ledgers.map((l) => [l.id, l]));
        let operating = 0;
        let investing = 0;
        let financing = 0;
        for (const txn of transactions) {
            const debit = ledgerMap.get(txn.debitLedgerId);
            const credit = ledgerMap.get(txn.creditLedgerId);
            const amt = Number(txn.amount);
            if (txn.voucherType === 'RECEIPT' || txn.voucherType === 'PAYMENT') {
                operating += txn.voucherType === 'RECEIPT' ? amt : -amt;
            }
            else if (debit?.groupType === 'ASSET' && debit?.subGroup === 'FIXED_ASSET') {
                investing -= amt;
            }
            else if (credit?.groupType === 'EQUITY' || credit?.groupType === 'LIABILITY') {
                financing += amt;
            }
        }
        return {
            period: { from: fromDate, to: toDate },
            operating: Math.round(operating * 100) / 100,
            investing: Math.round(investing * 100) / 100,
            financing: Math.round(financing * 100) / 100,
            netCashFlow: Math.round((operating + investing + financing) * 100) / 100,
        };
    }
    async getDayBook(tenantId, date) {
        const start = new Date(date);
        const end = new Date(date);
        end.setHours(23, 59, 59);
        return this.prisma.working.accountTransaction.findMany({
            where: { tenantId, transactionDate: { gte: start, lte: end } },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.FinancialReportService = FinancialReportService;
exports.FinancialReportService = FinancialReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinancialReportService);
//# sourceMappingURL=financial-report.service.js.map