"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAccountMaster = seedAccountMaster;
async function seedAccountMaster(prisma, tenantId) {
    console.log('  → Seeding Account Groups...');
    const groupDefs = [
        { code: 'BRANCH_DIVISIONS', name: 'Branch / Divisions', primaryGroup: 'BRANCH_DIVISIONS', nature: 'DEBIT', parentCode: null },
        { code: 'CAPITAL_ACCOUNT', name: 'Capital Account', primaryGroup: 'CAPITAL', nature: 'CREDIT', parentCode: null },
        { code: 'CURRENT_ASSETS', name: 'Current Assets', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: null },
        { code: 'CURRENT_LIABILITIES', name: 'Current Liabilities', primaryGroup: 'CURRENT_LIABILITIES', nature: 'CREDIT', parentCode: null },
        { code: 'FIXED_ASSETS', name: 'Fixed Assets', primaryGroup: 'FIXED_ASSETS', nature: 'DEBIT', parentCode: null },
        { code: 'INVESTMENTS', name: 'Investments', primaryGroup: 'INVESTMENTS', nature: 'DEBIT', parentCode: null },
        { code: 'LOANS_LIABILITY', name: 'Loans (Liability)', primaryGroup: 'LOANS_LIABILITY', nature: 'CREDIT', parentCode: null },
        { code: 'REVENUE_ACCOUNT', name: 'Revenue Account', primaryGroup: 'REVENUE', nature: 'CREDIT', parentCode: null },
        { code: 'EXPENDITURE_ACCOUNT', name: 'Expenditure Account', primaryGroup: 'EXPENDITURE', nature: 'DEBIT', parentCode: null },
        { code: 'PROFIT_LOSS', name: 'Profit & Loss', primaryGroup: 'PROFIT_LOSS', nature: 'CREDIT', parentCode: null },
        { code: 'MISC_EXPENSES', name: 'Misc. Expenses (ASSET)', primaryGroup: 'MISC_EXPENSES', nature: 'DEBIT', parentCode: null },
        { code: 'BANK_ACCOUNTS', name: 'Bank Accounts', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: 'CURRENT_ASSETS' },
        { code: 'CASH_IN_HAND', name: 'Cash-in-Hand', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: 'CURRENT_ASSETS' },
        { code: 'DEPOSITS_ASSET', name: 'Deposits (Asset)', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: 'CURRENT_ASSETS' },
        { code: 'LOANS_ADVANCES_ASSET', name: 'Loans & Advances (Asset)', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: 'CURRENT_ASSETS' },
        { code: 'STOCK_IN_HAND', name: 'Stock-in-Hand', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: 'CURRENT_ASSETS' },
        { code: 'SUNDRY_DEBTORS', name: 'Sundry Debtors', primaryGroup: 'CURRENT_ASSETS', nature: 'DEBIT', parentCode: 'CURRENT_ASSETS' },
        { code: 'DUTIES_TAXES', name: 'Duties & Taxes', primaryGroup: 'CURRENT_LIABILITIES', nature: 'CREDIT', parentCode: 'CURRENT_LIABILITIES' },
        { code: 'PROVISIONS', name: 'Provisions', primaryGroup: 'CURRENT_LIABILITIES', nature: 'CREDIT', parentCode: 'CURRENT_LIABILITIES' },
        { code: 'SUNDRY_CREDITORS', name: 'Sundry Creditors', primaryGroup: 'CURRENT_LIABILITIES', nature: 'CREDIT', parentCode: 'CURRENT_LIABILITIES' },
        { code: 'DIRECT_INCOMES', name: 'Direct Incomes', primaryGroup: 'REVENUE', nature: 'CREDIT', parentCode: 'REVENUE_ACCOUNT' },
        { code: 'DIRECT_EXPENSES', name: 'Direct Expenses', primaryGroup: 'EXPENDITURE', nature: 'DEBIT', parentCode: 'EXPENDITURE_ACCOUNT' },
        { code: 'INDIRECT_EXPENSES', name: 'Indirect Expenses', primaryGroup: 'EXPENDITURE', nature: 'DEBIT', parentCode: 'EXPENDITURE_ACCOUNT' },
        { code: 'BANK_OD', name: 'Bank OD A/c', primaryGroup: 'LOANS_LIABILITY', nature: 'CREDIT', parentCode: 'LOANS_LIABILITY' },
        { code: 'SECURED_LOANS', name: 'Secured Loans', primaryGroup: 'LOANS_LIABILITY', nature: 'CREDIT', parentCode: 'LOANS_LIABILITY' },
        { code: 'UNSECURED_LOANS', name: 'Unsecured Loans', primaryGroup: 'LOANS_LIABILITY', nature: 'CREDIT', parentCode: 'LOANS_LIABILITY' },
        { code: 'RESERVES_SURPLUS', name: 'Reserves & Surplus', primaryGroup: 'CAPITAL', nature: 'CREDIT', parentCode: 'CAPITAL_ACCOUNT' },
    ];
    const codeToId = new Map();
    for (const def of groupDefs.filter((d) => !d.parentCode)) {
        const existing = await prisma.accountGroup.findFirst({ where: { tenantId, code: def.code } });
        if (!existing) {
            const created = await prisma.accountGroup.create({
                data: {
                    tenantId,
                    code: def.code,
                    name: def.name,
                    primaryGroup: def.primaryGroup,
                    nature: def.nature,
                    isSystem: true,
                },
            });
            codeToId.set(def.code, created.id);
        }
        else {
            codeToId.set(def.code, existing.id);
        }
    }
    const level1Defs = groupDefs.filter((d) => d.parentCode && groupDefs.find((r) => r.code === d.parentCode && !r.parentCode));
    for (const def of level1Defs) {
        const parentId = codeToId.get(def.parentCode);
        const existing = await prisma.accountGroup.findFirst({ where: { tenantId, code: def.code } });
        if (!existing) {
            const created = await prisma.accountGroup.create({
                data: {
                    tenantId,
                    code: def.code,
                    name: def.name,
                    primaryGroup: def.primaryGroup,
                    nature: def.nature,
                    parentId,
                    isSystem: true,
                },
            });
            codeToId.set(def.code, created.id);
        }
        else {
            codeToId.set(def.code, existing.id);
        }
    }
    const level2Defs = groupDefs.filter((d) => d.parentCode && !groupDefs.find((r) => r.code === d.parentCode && !r.parentCode));
    for (const def of level2Defs) {
        const parentId = codeToId.get(def.parentCode);
        const existing = await prisma.accountGroup.findFirst({ where: { tenantId, code: def.code } });
        if (!existing) {
            const created = await prisma.accountGroup.create({
                data: {
                    tenantId,
                    code: def.code,
                    name: def.name,
                    primaryGroup: def.primaryGroup,
                    nature: def.nature,
                    parentId,
                    isSystem: true,
                },
            });
            codeToId.set(def.code, created.id);
        }
        else {
            codeToId.set(def.code, existing.id);
        }
    }
    console.log(`  ✓ Account Groups: ${codeToId.size} groups`);
    console.log('  → Seeding Sale Masters...');
    const saleMasters = [
        { code: 'GST_SALE_5', name: 'GST Sale - 5%', igstRate: 5, cgstRate: 2.5, sgstRate: 2.5, cessRate: 0, taxability: 'TAXABLE', sortOrder: 1 },
        { code: 'GST_SALE_6', name: 'GST Sale - 6%', igstRate: 6, cgstRate: 3, sgstRate: 3, cessRate: 0, taxability: 'TAXABLE', sortOrder: 2 },
        { code: 'GST_SALE_12', name: 'GST Sale - 12%', igstRate: 12, cgstRate: 6, sgstRate: 6, cessRate: 0, taxability: 'TAXABLE', sortOrder: 3 },
        { code: 'GST_SALE_18', name: 'GST Sale - 18%', igstRate: 18, cgstRate: 9, sgstRate: 9, cessRate: 0, taxability: 'TAXABLE', sortOrder: 4, isDefault: true },
        { code: 'GST_SALE_28', name: 'GST Sale - 28%', igstRate: 28, cgstRate: 14, sgstRate: 14, cessRate: 0, taxability: 'TAXABLE', sortOrder: 5 },
        { code: 'GST_SALE_40', name: 'GST Sale - 40%', igstRate: 40, cgstRate: 20, sgstRate: 20, cessRate: 0, taxability: 'TAXABLE', sortOrder: 6 },
        { code: 'GST_SALE_FREE', name: 'GST Sale Tax Free', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 7 },
        { code: 'GST_SALE_PAID', name: 'GST Sale Tax Paid', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 8 },
        { code: 'GST_SALE_EXEMPT', name: 'GST Sale-Exempt', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'EXEMPTED', sortOrder: 9 },
        { code: 'GST_SALE_NIL', name: 'GST Sale-Nil Rated', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'NIL_RATED', sortOrder: 10 },
        { code: 'GST_SALE_EXPORT', name: 'GST-Export (Exempted)', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'EXEMPTED', sortOrder: 11 },
        { code: 'GST_SALE_SEZ', name: 'GST-Sale SEZ (Exempted)', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'EXEMPTED', sortOrder: 12 },
        { code: 'ITEM_WISE_SALE', name: 'Item wise', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 13 },
    ];
    for (const sm of saleMasters) {
        const existing = await prisma.saleMaster.findFirst({ where: { tenantId, code: sm.code } });
        if (!existing) {
            await prisma.saleMaster.create({ data: { tenantId, ...sm } });
        }
    }
    console.log(`  ✓ Sale Masters: ${saleMasters.length} types`);
    console.log('  → Seeding Purchase Masters...');
    const purchaseMasters = [
        { code: 'GST_PUR_5', name: 'GST Purchase - 5%', igstRate: 5, cgstRate: 2.5, sgstRate: 2.5, cessRate: 0, taxability: 'TAXABLE', sortOrder: 1, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_6', name: 'GST Purchase - 6%', igstRate: 6, cgstRate: 3, sgstRate: 3, cessRate: 0, taxability: 'TAXABLE', sortOrder: 2, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_12', name: 'GST Purchase - 12%', igstRate: 12, cgstRate: 6, sgstRate: 6, cessRate: 0, taxability: 'TAXABLE', sortOrder: 3, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_18', name: 'GST Purchase - 18%', igstRate: 18, cgstRate: 9, sgstRate: 9, cessRate: 0, taxability: 'TAXABLE', sortOrder: 4, natureOfTransaction: 'PURCHASE', isDefault: true },
        { code: 'GST_PUR_28', name: 'GST Purchase - 28%', igstRate: 28, cgstRate: 14, sgstRate: 14, cessRate: 0, taxability: 'TAXABLE', sortOrder: 5, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_40', name: 'GST Purchase - 40%', igstRate: 40, cgstRate: 20, sgstRate: 20, cessRate: 0, taxability: 'TAXABLE', sortOrder: 6, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_FREE', name: 'GST Purchase Tax Free', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 7, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_EXEMPT', name: 'GST Purchase-Exempt', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'EXEMPTED', sortOrder: 8, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_NIL', name: 'GST Purchase-Nil Rated', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'NIL_RATED', sortOrder: 9, natureOfTransaction: 'PURCHASE' },
        { code: 'GST_PUR_IMPORT', name: 'GST Purchase Import', igstRate: 18, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 10, natureOfTransaction: 'IMPORT' },
        { code: 'GST_PUR_SEZ', name: 'GST Purchase SEZ', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'EXEMPTED', sortOrder: 11, natureOfTransaction: 'SEZ_PURCHASE' },
        { code: 'GST_PUR_RETURN', name: 'GST Purchase Return', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 12, natureOfTransaction: 'PURCHASE_RETURN' },
        { code: 'ITEM_WISE_PUR', name: 'Item wise', igstRate: 0, cgstRate: 0, sgstRate: 0, cessRate: 0, taxability: 'TAXABLE', sortOrder: 13, natureOfTransaction: 'PURCHASE' },
    ];
    for (const pm of purchaseMasters) {
        const existing = await prisma.purchaseMaster.findFirst({ where: { tenantId, code: pm.code } });
        if (!existing) {
            await prisma.purchaseMaster.create({ data: { tenantId, ...pm } });
        }
    }
    console.log(`  ✓ Purchase Masters: ${purchaseMasters.length} types`);
}
//# sourceMappingURL=account-master.seed.js.map