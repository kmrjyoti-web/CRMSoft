"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedProcurement = seedProcurement;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SYSTEM_UNITS = [
    { name: 'Kilogram', symbol: 'kg', unitCategory: 'WEIGHT', isBase: true },
    { name: 'Gram', symbol: 'g', unitCategory: 'WEIGHT', isBase: false },
    { name: 'Milligram', symbol: 'mg', unitCategory: 'WEIGHT', isBase: false },
    { name: 'Tonne', symbol: 'ton', unitCategory: 'WEIGHT', isBase: false },
    { name: 'Quintal', symbol: 'qtl', unitCategory: 'WEIGHT', isBase: false },
    { name: 'Litre', symbol: 'L', unitCategory: 'VOLUME', isBase: true },
    { name: 'Millilitre', symbol: 'mL', unitCategory: 'VOLUME', isBase: false },
    { name: 'Metre', symbol: 'm', unitCategory: 'LENGTH', isBase: true },
    { name: 'Centimetre', symbol: 'cm', unitCategory: 'LENGTH', isBase: false },
    { name: 'Foot', symbol: 'ft', unitCategory: 'LENGTH', isBase: false },
    { name: 'Inch', symbol: 'in', unitCategory: 'LENGTH', isBase: false },
    { name: 'Piece', symbol: 'pcs', unitCategory: 'QUANTITY', isBase: true },
    { name: 'Dozen', symbol: 'dz', unitCategory: 'QUANTITY', isBase: false },
    { name: 'Box', symbol: 'box', unitCategory: 'QUANTITY', isBase: false },
    { name: 'Square Metre', symbol: 'sqm', unitCategory: 'AREA', isBase: true },
];
const GLOBAL_CONVERSIONS = [
    { from: 'kg', to: 'g', factor: 1000 },
    { from: 'kg', to: 'mg', factor: 1000000 },
    { from: 'kg', to: 'ton', factor: 0.001 },
    { from: 'kg', to: 'qtl', factor: 0.01 },
    { from: 'L', to: 'mL', factor: 1000 },
    { from: 'm', to: 'cm', factor: 100 },
    { from: 'm', to: 'ft', factor: 3.28084 },
    { from: 'pcs', to: 'dz', factor: 1 / 12 },
];
const SYSTEM_LEDGERS = [
    { name: 'Purchase Account', code: 'PURCHASE', groupType: 'EXPENSE' },
    { name: 'Purchase Returns', code: 'PURCHASE_RETURNS', groupType: 'EXPENSE' },
    { name: 'Accounts Payable', code: 'ACCOUNTS_PAYABLE', groupType: 'LIABILITY' },
    { name: 'Input GST (CGST)', code: 'INPUT_CGST', groupType: 'ASSET' },
    { name: 'Input GST (SGST)', code: 'INPUT_SGST', groupType: 'ASSET' },
    { name: 'Input GST (IGST)', code: 'INPUT_IGST', groupType: 'ASSET' },
    { name: 'Input GST', code: 'INPUT_GST', groupType: 'ASSET' },
    { name: 'Stock in Hand', code: 'STOCK_IN_HAND', groupType: 'ASSET' },
    { name: 'Cash Account', code: 'CASH', groupType: 'ASSET' },
    { name: 'Bank Account', code: 'BANK', groupType: 'ASSET' },
    { name: 'Sales Account', code: 'SALES', groupType: 'INCOME' },
    { name: 'Sales Returns', code: 'SALES_RETURNS', groupType: 'INCOME' },
    { name: 'Accounts Receivable', code: 'ACCOUNTS_RECEIVABLE', groupType: 'ASSET' },
    { name: 'Output GST', code: 'OUTPUT_GST', groupType: 'LIABILITY' },
    { name: 'Discount Allowed', code: 'DISCOUNT_ALLOWED', groupType: 'EXPENSE' },
];
async function seedProcurement(tenantId) {
    console.log('  Seeding procurement data...');
    let unitsCreated = 0;
    const unitMap = {};
    for (const unit of SYSTEM_UNITS) {
        const existing = await prisma.unitMaster.findUnique({
            where: { tenantId_symbol: { tenantId, symbol: unit.symbol } },
        });
        if (!existing) {
            const created = await prisma.unitMaster.create({
                data: { tenantId, ...unit, isSystem: true },
            });
            unitMap[unit.symbol] = created.id;
            unitsCreated++;
        }
        else {
            unitMap[unit.symbol] = existing.id;
        }
    }
    console.log(`    Units: ${unitsCreated} created`);
    let conversionsCreated = 0;
    for (const conv of GLOBAL_CONVERSIONS) {
        const fromId = unitMap[conv.from];
        const toId = unitMap[conv.to];
        if (!fromId || !toId)
            continue;
        const existing = await prisma.unitConversion.findFirst({
            where: { tenantId, fromUnitId: fromId, toUnitId: toId, productId: null },
        });
        if (!existing) {
            await prisma.unitConversion.create({
                data: { tenantId, fromUnitId: fromId, toUnitId: toId, conversionFactor: conv.factor },
            });
            conversionsCreated++;
        }
    }
    console.log(`    Conversions: ${conversionsCreated} created`);
    let ledgersCreated = 0;
    for (const ledger of SYSTEM_LEDGERS) {
        const existing = await prisma.ledgerMaster.findFirst({
            where: { tenantId, code: ledger.code },
        });
        if (!existing) {
            await prisma.ledgerMaster.create({
                data: { tenantId, ...ledger, isSystem: true },
            });
            ledgersCreated++;
        }
    }
    console.log(`    Ledgers: ${ledgersCreated} created`);
    console.log('  Procurement seed complete.');
}
//# sourceMappingURL=procurement.seed.js.map