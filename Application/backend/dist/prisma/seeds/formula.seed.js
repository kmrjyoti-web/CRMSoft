"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedFormulas = seedFormulas;
const SYSTEM_FORMULAS = [
    {
        name: 'GST Calculator',
        category: 'tax',
        expression: 'taxableAmount * gstRate / 100',
        description: 'Calculate total GST from taxable amount and rate',
        requiredFields: ['taxableAmount', 'gstRate'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'CGST',
        category: 'tax',
        expression: 'taxableAmount * gstRate / 200',
        description: 'CGST = half of GST for intra-state transactions',
        requiredFields: ['taxableAmount', 'gstRate'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'SGST',
        category: 'tax',
        expression: 'taxableAmount * gstRate / 200',
        description: 'SGST = half of GST for intra-state transactions',
        requiredFields: ['taxableAmount', 'gstRate'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'IGST',
        category: 'tax',
        expression: 'taxableAmount * gstRate / 100',
        description: 'IGST = full GST for inter-state transactions',
        requiredFields: ['taxableAmount', 'gstRate'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'Discount Percentage',
        category: 'math',
        expression: 'amount * discountPercent / 100',
        description: 'Calculate discount amount from percentage',
        requiredFields: ['amount', 'discountPercent'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'Net Amount',
        category: 'math',
        expression: 'subtotal - discountAmount',
        description: 'Taxable amount after discount',
        requiredFields: ['subtotal', 'discountAmount'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'Grand Total',
        category: 'math',
        expression: 'subtotal - discountAmount + totalTax + ROUND(roundOff, 2)',
        description: 'Final payable amount including tax and round off',
        requiredFields: ['subtotal', 'discountAmount', 'totalTax', 'roundOff'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'Amount In Words',
        category: 'text',
        expression: 'AMOUNT_WORDS(amount)',
        description: 'Convert amount to Indian English words with Rupees/Paise',
        requiredFields: ['amount'],
        outputType: 'string',
        outputFormat: 'text',
    },
    {
        name: 'Item Total',
        category: 'math',
        expression: 'qty * rate - discount',
        description: 'Line item total after discount',
        requiredFields: ['qty', 'rate', 'discount'],
        outputType: 'number',
        outputFormat: 'currency',
    },
    {
        name: 'Round Off',
        category: 'math',
        expression: 'ROUND(amount, 0) - amount',
        description: 'Round off adjustment to nearest rupee',
        requiredFields: ['amount'],
        outputType: 'number',
        outputFormat: 'currency',
    },
];
async function seedFormulas(prisma) {
    console.log('Seeding system formulas...');
    for (const formula of SYSTEM_FORMULAS) {
        const existing = await prisma.savedFormula.findFirst({
            where: { name: formula.name, isSystem: true },
        });
        if (existing) {
            await prisma.savedFormula.update({
                where: { id: existing.id },
                data: {
                    category: formula.category,
                    expression: formula.expression,
                    description: formula.description,
                    requiredFields: formula.requiredFields,
                    outputType: formula.outputType,
                    outputFormat: formula.outputFormat,
                },
            });
        }
        else {
            await prisma.savedFormula.create({
                data: {
                    ...formula,
                    isSystem: true,
                    tenantId: null,
                },
            });
        }
    }
    console.log(`Seeded ${SYSTEM_FORMULAS.length} system formulas`);
}
//# sourceMappingURL=formula.seed.js.map