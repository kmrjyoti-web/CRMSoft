"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnitConverterService = void 0;
const common_1 = require("@nestjs/common");
let UnitConverterService = class UnitConverterService {
    async convert(prisma, params) {
        const { productId, quantity, fromUnit, toUnit } = params;
        if (fromUnit === toUnit) {
            return { quantity, unit: toUnit, conversionRate: 1 };
        }
        const direct = await prisma.productUnitConversion.findFirst({
            where: {
                productId,
                fromUnit: fromUnit,
                toUnit: toUnit,
            },
        });
        if (direct) {
            const rate = Number(direct.conversionRate);
            return { quantity: quantity * rate, unit: toUnit, conversionRate: rate };
        }
        const reverse = await prisma.productUnitConversion.findFirst({
            where: {
                productId,
                fromUnit: toUnit,
                toUnit: fromUnit,
            },
        });
        if (reverse) {
            const rate = 1 / Number(reverse.conversionRate);
            return { quantity: quantity * rate, unit: toUnit, conversionRate: rate };
        }
        const allConversions = await prisma.productUnitConversion.findMany({
            where: { productId },
        });
        for (const c1 of allConversions) {
            const from1 = String(c1.fromUnit);
            const to1 = String(c1.toUnit);
            const rate1 = Number(c1.conversionRate);
            let intermediateUnit = null;
            let firstRate = 0;
            if (from1 === fromUnit) {
                intermediateUnit = to1;
                firstRate = rate1;
            }
            else if (to1 === fromUnit) {
                intermediateUnit = from1;
                firstRate = 1 / rate1;
            }
            else {
                continue;
            }
            for (const c2 of allConversions) {
                const from2 = String(c2.fromUnit);
                const to2 = String(c2.toUnit);
                const rate2 = Number(c2.conversionRate);
                let secondRate = 0;
                if (from2 === intermediateUnit && to2 === toUnit) {
                    secondRate = rate2;
                }
                else if (to2 === intermediateUnit && from2 === toUnit) {
                    secondRate = 1 / rate2;
                }
                else {
                    continue;
                }
                const combinedRate = firstRate * secondRate;
                return {
                    quantity: quantity * combinedRate,
                    unit: toUnit,
                    conversionRate: combinedRate,
                };
            }
        }
        throw new common_1.NotFoundException('No conversion path found');
    }
};
exports.UnitConverterService = UnitConverterService;
exports.UnitConverterService = UnitConverterService = __decorate([
    (0, common_1.Injectable)()
], UnitConverterService);
//# sourceMappingURL=unit-converter.service.js.map