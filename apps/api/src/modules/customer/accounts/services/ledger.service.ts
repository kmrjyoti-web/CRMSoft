import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class AccountLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  async getChartOfAccounts(tenantId: string) {
    const ledgers = await this.prisma.working.ledgerMaster.findMany({
      where: { tenantId, isActive: true },
      orderBy: [{ groupType: 'asc' }, { name: 'asc' }],
    });

    const groups: Record<string, unknown[]> = {};
    for (const l of ledgers) {
      if (!groups[l.groupType]) groups[l.groupType] = [];
      groups[l.groupType].push({
        id: l.id, code: l.code, name: l.name, subGroup: l.subGroup,
        balance: Number(l.currentBalance), isSystem: l.isSystem, station: l.station,
      });
    }
    return groups;
  }

  async listLedgers(tenantId: string, params?: { search?: string; groupType?: string; station?: string; page?: number; limit?: number }) {
    const where: any = { tenantId, isActive: true };
    if (params?.search) where.OR = [
      { name: { contains: params.search, mode: 'insensitive' } },
      { code: { contains: params.search, mode: 'insensitive' } },
    ];
    if (params?.groupType) where.groupType = params.groupType;
    if (params?.station) where.station = { contains: params.station, mode: 'insensitive' };

    const page = params?.page ?? 1;
    const limit = params?.limit ?? 50;
    const [data, total] = await Promise.all([
      this.prisma.working.ledgerMaster.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: [{ groupType: 'asc' }, { name: 'asc' }],
        include: { accountGroup: { select: { name: true } } },
      }),
      this.prisma.working.ledgerMaster.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getLedgerById(tenantId: string, id: string) {
    const ledger = await this.prisma.working.ledgerMaster.findFirst({
      where: { tenantId, id },
      include: {
        accountGroup: true,
        mappings: { where: { isActive: true } },
      },
    });
    if (!ledger) throw new NotFoundException('Ledger not found');

    const transactions = await this.prisma.working.accountTransaction.findMany({
      where: { tenantId, OR: [{ debitLedgerId: id }, { creditLedgerId: id }] },
      orderBy: { transactionDate: 'desc' },
      take: 20,
    });

    return { ...ledger, recentTransactions: transactions };
  }

  async getLedgerEntities(tenantId: string, ledgerId: string) {
    return this.prisma.working.ledgerMapping.findMany({
      where: { tenantId, ledgerId, isActive: true },
    });
  }

  async getLedgerStatement(ledgerId: string, tenantId: string, from: string, to: string) {
    const ledger = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, id: ledgerId } });
    if (!ledger) throw new NotFoundException('Ledger not found');

    const txns = await this.prisma.working.accountTransaction.findMany({
      where: {
        tenantId,
        OR: [{ debitLedgerId: ledgerId }, { creditLedgerId: ledgerId }],
        transactionDate: { gte: new Date(from), lte: new Date(to) },
      },
      orderBy: { transactionDate: 'asc' },
    });

    let runningBalance = Number(ledger.openingBalance);
    const entries = txns.map((t) => {
      const isDebit = t.debitLedgerId === ledgerId;
      const amount = Number(t.amount);
      runningBalance += isDebit ? amount : -amount;
      return { ...t, type: isDebit ? 'Dr' : 'Cr', amount, balance: runningBalance };
    });

    return { ledger, entries, closingBalance: runningBalance };
  }

  private async generateLedgerCode(tenantId: string, name: string): Promise<string> {
    const prefix = name.replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LDG';
    const count = await this.prisma.working.ledgerMaster.count({
      where: { tenantId, code: { startsWith: prefix } },
    });
    let candidate = `${prefix}${String(count + 1).padStart(3, '0')}`;
    while (await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, code: candidate } })) {
      const num = parseInt(candidate.slice(prefix.length), 10) + 1;
      candidate = `${prefix}${String(num).padStart(3, '0')}`;
    }
    return candidate;
  }

  /** Maps Tally-style primaryGroup codes ? simple 5-type groupType */
  private resolveGroupType(primaryGroup: string): string {
    const ASSET_GROUPS = ['CURRENT_ASSETS', 'FIXED_ASSETS', 'INVESTMENTS', 'MISC_EXPENSES',
      'BANK_ACCOUNTS', 'CASH_IN_HAND', 'DEPOSITS_ASSET', 'LOANS_ADVANCES_ASSET',
      'STOCK_IN_HAND', 'SUNDRY_DEBTORS', 'BRANCH_DIVISIONS'];
    const LIABILITY_GROUPS = ['CURRENT_LIABILITIES', 'LOANS_LIABILITY', 'DUTIES_TAXES',
      'PROVISIONS', 'SUNDRY_CREDITORS', 'BANK_OD', 'SECURED_LOANS', 'UNSECURED_LOANS'];
    const EQUITY_GROUPS = ['CAPITAL', 'CAPITAL_ACCOUNT', 'RESERVES_SURPLUS', 'PROFIT_LOSS'];
    const INCOME_GROUPS = ['REVENUE', 'REVENUE_ACCOUNT', 'DIRECT_INCOMES'];
    const EXPENSE_GROUPS = ['EXPENDITURE', 'EXPENDITURE_ACCOUNT', 'DIRECT_EXPENSES', 'INDIRECT_EXPENSES'];
    if (ASSET_GROUPS.includes(primaryGroup)) return 'ASSET';
    if (LIABILITY_GROUPS.includes(primaryGroup)) return 'LIABILITY';
    if (EQUITY_GROUPS.includes(primaryGroup)) return 'EQUITY';
    if (INCOME_GROUPS.includes(primaryGroup)) return 'INCOME';
    if (EXPENSE_GROUPS.includes(primaryGroup)) return 'EXPENSE';
    return primaryGroup; // already a valid simple type
  }

  async createLedger(tenantId: string, data: {
    code?: string; name: string; groupType?: string; subGroup?: string;
    parentId?: string; accountGroupId?: string; openingBalance?: number;
    openingBalanceType?: string; aliasName?: string; mailTo?: string;
    address?: string; country?: string; state?: string; city?: string;
    pincode?: string; station?: string; currency?: string; balancingMethod?: string;
    creditDays?: number; creditLimit?: number; phoneOffice?: string;
    mobile1?: string; mobile2?: string; whatsappNo?: string; email?: string;
    ledgerType?: string; panNo?: string; gstin?: string; gstApplicable?: boolean;
    gstType?: string; bankName?: string; bankAccountNo?: string; bankIfsc?: string; bankBranch?: string;
  }) {
    const code = data.code?.trim()
      ? data.code.trim()
      : await this.generateLedgerCode(tenantId, data.name);

    const existing = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, code } });
    if (existing) throw new BadRequestException(`Ledger code "${code}" already exists`);

    // Resolve groupType: always derive from accountGroupId.primaryGroup (authoritative)
    let resolvedGroupType = data.groupType ?? 'ASSET';
    if (data.accountGroupId) {
      const grp = await this.prisma.working.accountGroup.findFirst({
        where: { id: data.accountGroupId },
        select: { primaryGroup: true },
      });
      if (grp?.primaryGroup) {
        resolvedGroupType = this.resolveGroupType(grp.primaryGroup);
      }
    }

    return this.prisma.working.ledgerMaster.create({
      data: {
        tenantId,
        code,
        name: data.name,
        groupType: resolvedGroupType,
        subGroup: data.subGroup,
        parentId: data.parentId,
        accountGroupId: data.accountGroupId,
        openingBalance: data.openingBalance ?? 0,
        openingBalanceType: data.openingBalanceType ?? 'Dr',
        currentBalance: data.openingBalance ?? 0,
        aliasName: data.aliasName,
        mailTo: data.mailTo,
        address: data.address,
        country: data.country ?? 'India',
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        station: data.station,
        currency: data.currency ?? 'INR',
        balancingMethod: data.balancingMethod,
        creditDays: data.creditDays,
        creditLimit: data.creditLimit,
        phoneOffice: data.phoneOffice,
        mobile1: data.mobile1,
        mobile2: data.mobile2,
        whatsappNo: data.whatsappNo,
        email: data.email,
        ledgerType: data.ledgerType,
        panNo: data.panNo,
        gstin: data.gstin,
        gstApplicable: data.gstApplicable ?? false,
        gstType: data.gstType,
        bankName: data.bankName,
        bankAccountNo: data.bankAccountNo,
        bankIfsc: data.bankIfsc,
        bankBranch: data.bankBranch,
      },
    });
  }

  async updateLedger(tenantId: string, id: string, data: any) {
    const ledger = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, id } });
    if (!ledger) throw new NotFoundException('Ledger not found');

    // Resolve groupType on update too (handles Tally-style values)
    if (data.groupType) {
      data = { ...data, groupType: this.resolveGroupType(data.groupType) };
    }
    if (data.accountGroupId && !data.groupType) {
      const grp = await this.prisma.working.accountGroup.findFirst({
        where: { id: data.accountGroupId },
        select: { primaryGroup: true },
      });
      if (grp?.primaryGroup) {
        data = { ...data, groupType: this.resolveGroupType(grp.primaryGroup) };
      }
    }
    return this.prisma.working.ledgerMaster.update({ where: { id }, data });
  }

  /**
   * Bulk import ledgers from Tally XML export.
   * Accepts the parsed array from Tally's LEDGER group under TALLYMESSAGE.
   * Maps Tally's PARENT (group name) ? accountGroupId and normalises groupType.
   */
  async bulkImportFromTally(tenantId: string, tallyLedgers: Array<{
    NAME: string;
    PARENT?: string;          // Tally group name e.g. "Sundry Debtors"
    OPENINGBALANCE?: string;  // e.g. "50000.00 Dr"
    ADDRESS?: string[];
    EMAIL?: string;
    LEDGERFAX?: string;
    GSTREGISTRATIONTYPE?: string;
    PARTYGSTIN?: string;
    PANNO?: string;
    COUNTRYNAME?: string;
    STATENAME?: string;
    PINCODE?: string;
    BANKACNO?: string;
    BANKNAME?: string;
    IFSCCODE?: string;
  }>) {
    // Tally group name ? primaryGroup code map
    const TALLY_PARENT_MAP: Record<string, string> = {
      'Sundry Debtors':           'SUNDRY_DEBTORS',
      'Sundry Creditors':         'SUNDRY_CREDITORS',
      'Bank Accounts':            'BANK_ACCOUNTS',
      'Cash-in-Hand':             'CASH_IN_HAND',
      'Capital Account':          'CAPITAL_ACCOUNT',
      'Current Assets':           'CURRENT_ASSETS',
      'Current Liabilities':      'CURRENT_LIABILITIES',
      'Fixed Assets':             'FIXED_ASSETS',
      'Investments':              'INVESTMENTS',
      'Loans & Advances (Asset)': 'LOANS_ADVANCES_ASSET',
      'Secured Loans':            'SECURED_LOANS',
      'Unsecured Loans':          'UNSECURED_LOANS',
      'Bank OD A/c':              'BANK_OD',
      'Duties & Taxes':           'DUTIES_TAXES',
      'Provisions':               'PROVISIONS',
      'Revenue Account':          'REVENUE_ACCOUNT',
      'Direct Incomes':           'DIRECT_INCOMES',
      'Direct Expenses':          'DIRECT_EXPENSES',
      'Indirect Expenses':        'INDIRECT_EXPENSES',
      'Reserves & Surplus':       'RESERVES_SURPLUS',
      'Profit & Loss':            'PROFIT_LOSS',
      'Stock-in-Hand':            'STOCK_IN_HAND',
      'Misc. Expenses (ASSET)':   'MISC_EXPENSES',
    };

    // Load all account groups for this tenant once
    const groups = await this.prisma.working.accountGroup.findMany({
      where: { tenantId },
      select: { id: true, code: true, primaryGroup: true },
    });
    const groupByCode = new Map(groups.map((g) => [g.code, g]));

    const results: { name: string; status: 'created' | 'skipped'; code?: string }[] = [];

    for (const tl of tallyLedgers) {
      if (!tl.NAME) continue;

      // Check duplicate
      const existingCode = await this.generateLedgerCode(tenantId, tl.NAME);
      const dup = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, name: tl.NAME } });
      if (dup) { results.push({ name: tl.NAME, status: 'skipped' }); continue; }

      // Resolve group
      const pgCode = tl.PARENT ? TALLY_PARENT_MAP[tl.PARENT] : undefined;
      const grp = pgCode ? groupByCode.get(pgCode) : undefined;
      const groupType = this.resolveGroupType(pgCode ?? tl.PARENT ?? 'CURRENT_ASSETS');

      // Parse opening balance: "50000.00 Dr" or "-50000.00 Cr"
      let openingBalance = 0;
      let openingBalanceType = 'Dr';
      if (tl.OPENINGBALANCE) {
        const parts = tl.OPENINGBALANCE.trim().split(/\s+/);
        openingBalance = Math.abs(parseFloat(parts[0]) || 0);
        openingBalanceType = parts[1]?.toLowerCase() === 'cr' ? 'Cr' : 'Dr';
      }

      const created = await this.prisma.working.ledgerMaster.create({
        data: {
          tenantId,
          code: existingCode,
          name: tl.NAME,
          groupType,
          accountGroupId: grp?.id,
          openingBalance,
          openingBalanceType,
          currentBalance: openingBalance,
          address: tl.ADDRESS?.join(', '),
          country: tl.COUNTRYNAME ?? 'India',
          state: tl.STATENAME,
          pincode: tl.PINCODE,
          email: tl.EMAIL,
          gstin: tl.PARTYGSTIN,
          panNo: tl.PANNO,
          gstApplicable: !!tl.PARTYGSTIN,
          bankAccountNo: tl.BANKACNO,
          bankName: tl.BANKNAME,
          bankIfsc: tl.IFSCCODE,
          currency: 'INR',
        },
      });
      results.push({ name: tl.NAME, status: 'created', code: created.code });
    }

    return { total: tallyLedgers.length, created: results.filter((r) => r.status === 'created').length, skipped: results.filter((r) => r.status === 'skipped').length, results };
  }

  async deactivateLedger(tenantId: string, id: string) {
    const ledger = await this.prisma.working.ledgerMaster.findFirst({ where: { tenantId, id } });
    if (!ledger) throw new NotFoundException('Ledger not found');
    if (ledger.isSystem) throw new BadRequestException('Cannot deactivate system ledgers');
    if (Number(ledger.currentBalance) !== 0) throw new BadRequestException('Cannot deactivate ledger with non-zero balance');
    return this.prisma.working.ledgerMaster.update({ where: { id }, data: { isActive: false } });
  }

  async getLedgerMappings(tenantId: string) {
    return this.prisma.working.ledgerMapping.findMany({
      where: { tenantId, isActive: true },
      include: { ledger: { select: { id: true, name: true, code: true, groupType: true } } },
    });
  }

  async createLedgerMapping(tenantId: string, data: {
    entityType: string; entityId: string; entityName?: string;
    ledgerId: string; mappingType: string; creditLimit?: number; creditDays?: number; gstin?: string; pan?: string;
  }) {
    const existing = await this.prisma.working.ledgerMapping.findFirst({
      where: { tenantId, entityType: data.entityType, entityId: data.entityId },
    });
    if (existing) {
      return this.prisma.working.ledgerMapping.update({ where: { id: existing.id }, data: { ...data, isActive: true } });
    }
    return this.prisma.working.ledgerMapping.create({ data: { tenantId, ...data } });
  }

  async getUnmappedEntities(tenantId: string) {
    const mappedIds = await this.prisma.working.ledgerMapping.findMany({
      where: { tenantId, isActive: true },
      select: { entityId: true, entityType: true },
    });
    const mappedOrgIds = mappedIds.filter((m) => m.entityType === 'ORGANIZATION').map((m) => m.entityId);
    const mappedContactIds = mappedIds.filter((m) => m.entityType === 'CONTACT').map((m) => m.entityId);

    const [orgs, contacts] = await Promise.all([
      this.prisma.working.organization.findMany({
        where: { tenantId, id: { notIn: mappedOrgIds }, isActive: true },
        select: { id: true, name: true, gstNumber: true },
        take: 50,
      }).catch(() => []),
      this.prisma.working.contact.findMany({
        where: { tenantId, id: { notIn: mappedContactIds }, isActive: true },
        select: { id: true, firstName: true, lastName: true },
        take: 50,
      }).catch(() => []),
    ]);

    return {
      organizations: orgs,
      contacts: contacts.map((c: Record<string, unknown>) => ({ ...c, name: `${c.firstName} ${c.lastName}` })),
    };
  }

  async bulkCreateMappings(tenantId: string, mappings: Array<{ entityType: string; entityId: string; entityName?: string; ledgerId: string; mappingType: string }>) {
    const results = await Promise.all(
      mappings.map((m) => this.createLedgerMapping(tenantId, m)),
    );
    return { created: results.length };
  }

  async createJournalEntry(tenantId: string, userId: string, data: {
    transactionDate: string; debitLedgerId: string; creditLedgerId: string;
    amount: number; narration?: string; referenceType?: string; referenceId?: string;
  }) {
    const count = await this.prisma.working.accountTransaction.count({ where: { tenantId, voucherType: 'JOURNAL' } });
    const voucherNumber = `JV-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    const txn = await this.prisma.working.accountTransaction.create({
      data: {
        tenantId,
        transactionDate: new Date(data.transactionDate),
        voucherType: 'JOURNAL',
        voucherNumber,
        debitLedgerId: data.debitLedgerId,
        creditLedgerId: data.creditLedgerId,
        amount: data.amount,
        narration: data.narration,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        createdById: userId,
      },
    });

    await this.prisma.working.ledgerMaster.update({ where: { id: data.debitLedgerId }, data: { currentBalance: { increment: data.amount } } });
    await this.prisma.working.ledgerMaster.update({ where: { id: data.creditLedgerId }, data: { currentBalance: { decrement: data.amount } } });
    return txn;
  }
}
