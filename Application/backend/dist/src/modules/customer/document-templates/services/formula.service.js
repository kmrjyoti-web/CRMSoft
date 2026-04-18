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
var FormulaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormulaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const mathjs_1 = require("mathjs");
let FormulaService = FormulaService_1 = class FormulaService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(FormulaService_1.name);
        this.math = (0, mathjs_1.create)(mathjs_1.all, {});
        this.registerCustomFunctions();
    }
    registerCustomFunctions() {
        this.math.import({
            FORMAT_INR: (n) => {
                if (n == null || isNaN(n))
                    return '?0.00';
                return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(n);
            },
            ROUND2: (n, decimals = 2) => {
                const factor = Math.pow(10, decimals);
                return Math.round(n * factor) / factor;
            },
            IS_INTERSTATE: (companyState, customerState) => {
                return companyState !== customerState ? 1 : 0;
            },
            CONCAT: (...args) => args.join(''),
            TODAY: () => new Date().toISOString().split('T')[0],
            PAGE_NO: () => 1,
            AMOUNT_WORDS: (amount) => this.numberToWordsINR(amount),
        }, { override: true });
    }
    async findAll(tenantId) {
        const orConditions = [{ isSystem: true }];
        if (tenantId)
            orConditions.push({ tenantId });
        return this.prisma.working.savedFormula.findMany({
            where: { OR: orConditions },
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    }
    async findById(id) {
        const formula = await this.prisma.working.savedFormula.findUnique({ where: { id } });
        if (!formula)
            throw new common_1.NotFoundException(`Formula "${id}" not found`);
        return formula;
    }
    async findByCategory(category, tenantId) {
        const orConditions = [{ isSystem: true }];
        if (tenantId)
            orConditions.push({ tenantId });
        return this.prisma.working.savedFormula.findMany({
            where: { category, OR: orConditions },
            orderBy: { name: 'asc' },
        });
    }
    async create(data) {
        this.logger.log(`Creating formula: ${data.name}`);
        return this.prisma.working.savedFormula.create({
            data: {
                name: data.name,
                category: data.category,
                expression: data.expression,
                description: data.description,
                requiredFields: data.requiredFields ?? [],
                outputType: data.outputType ?? 'number',
                outputFormat: data.outputFormat,
                tenantId: data.tenantId,
                isSystem: data.isSystem ?? false,
            },
        });
    }
    async update(id, data) {
        await this.findById(id);
        this.logger.log(`Updating formula: ${id}`);
        return this.prisma.working.savedFormula.update({ where: { id }, data });
    }
    async delete(id) {
        await this.findById(id);
        this.logger.log(`Deleting formula: ${id}`);
        return this.prisma.working.savedFormula.delete({ where: { id } });
    }
    evaluate(expression, variables = {}) {
        try {
            return this.math.evaluate(expression, variables);
        }
        catch (error) {
            this.logger.warn(`Formula evaluation failed: ${expression}`, error);
            return null;
        }
    }
    numberToWordsINR(amount) {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const convertChunk = (n) => {
            if (n === 0)
                return '';
            if (n < 20)
                return ones[n];
            if (n < 100) {
                const remainder = n % 10;
                return tens[Math.floor(n / 10)] + (remainder ? '-' + ones[remainder] : '');
            }
            const remainder = n % 100;
            return ones[Math.floor(n / 100)] + ' Hundred' + (remainder ? ' and ' + convertChunk(remainder) : '');
        };
        const convertIndian = (n) => {
            if (n === 0)
                return 'Zero';
            let result = '';
            let remaining = n;
            if (remaining >= 10000000) {
                result += convertChunk(Math.floor(remaining / 10000000)) + ' Crore ';
                remaining %= 10000000;
            }
            if (remaining >= 100000) {
                result += convertChunk(Math.floor(remaining / 100000)) + ' Lakh ';
                remaining %= 100000;
            }
            if (remaining >= 1000) {
                result += convertChunk(Math.floor(remaining / 1000)) + ' Thousand ';
                remaining %= 1000;
            }
            if (remaining > 0)
                result += convertChunk(remaining);
            return result.trim();
        };
        const rupees = Math.floor(Math.abs(amount));
        const paise = Math.round((Math.abs(amount) - rupees) * 100);
        let words = convertIndian(rupees) + ' Rupees';
        if (paise > 0)
            words += ' and ' + convertIndian(paise) + ' Paise';
        words += ' Only';
        return words;
    }
};
exports.FormulaService = FormulaService;
exports.FormulaService = FormulaService = FormulaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormulaService);
//# sourceMappingURL=formula.service.js.map