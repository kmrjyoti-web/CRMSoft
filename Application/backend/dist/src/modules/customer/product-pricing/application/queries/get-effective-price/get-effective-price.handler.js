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
var GetEffectivePriceHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetEffectivePriceHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_effective_price_query_1 = require("./get-effective-price.query");
const tax_calculator_helper_1 = require("./tax-calculator.helper");
let GetEffectivePriceHandler = GetEffectivePriceHandler_1 = class GetEffectivePriceHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetEffectivePriceHandler_1.name);
    }
    async execute(query) {
        try {
            const { productId, contactId, organizationId, quantity, isInterState } = query;
            const product = await this.prisma.working.product.findUnique({
                where: { id: productId },
                select: {
                    id: true, name: true, gstRate: true, cessRate: true,
                    taxType: true, taxInclusive: true, salePrice: true, mrp: true,
                },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${productId}" not found`);
            }
            const priceGroupId = await this.resolvePriceGroup(contactId, organizationId);
            const now = new Date();
            const allPrices = await this.prisma.working.productPrice.findMany({
                where: { productId, isActive: true },
                include: {
                    priceGroup: { select: { id: true, name: true, priority: true } },
                },
                orderBy: [{ priceType: 'asc' }, { minQty: 'asc' }],
            });
            const validPrices = allPrices.filter((p) => {
                if (p.validFrom && new Date(p.validFrom) > now)
                    return false;
                if (p.validTo && new Date(p.validTo) < now)
                    return false;
                return true;
            });
            const resolved = this.resolvePrice(validPrices, priceGroupId, quantity, product);
            const gstRate = (0, tax_calculator_helper_1.toNum)(product.gstRate ?? 0);
            const cessRate = (0, tax_calculator_helper_1.toNum)(product.cessRate ?? 0);
            const { baseAmount, unitTotal, tax } = (0, tax_calculator_helper_1.calculateTax)({
                basePrice: resolved.price,
                gstRate,
                cessRate,
                taxType: product.taxType,
                taxInclusive: product.taxInclusive ?? false,
                isInterState,
                quantity,
            });
            return {
                productId: product.id,
                productName: product.name,
                basePrice: (0, tax_calculator_helper_1.round)(baseAmount),
                priceType: resolved.priceType,
                priceGroup: resolved.groupName,
                quantity,
                slabApplied: resolved.slabApplied,
                subtotal: (0, tax_calculator_helper_1.round)(baseAmount * quantity),
                tax,
                grandTotal: (0, tax_calculator_helper_1.round)(unitTotal * quantity),
                currency: 'INR',
            };
        }
        catch (error) {
            this.logger.error(`GetEffectivePriceHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async resolvePriceGroup(contactId, organizationId) {
        if (contactId) {
            const mapping = await this.prisma.working.customerGroupMapping.findFirst({
                where: { contactId, isActive: true },
                include: {
                    priceGroup: { select: { id: true, priority: true } },
                },
                orderBy: { priceGroup: { priority: 'desc' } },
            });
            if (mapping)
                return mapping.priceGroupId;
        }
        if (organizationId) {
            const mapping = await this.prisma.working.customerGroupMapping.findFirst({
                where: { organizationId, isActive: true },
                include: {
                    priceGroup: { select: { id: true, priority: true } },
                },
                orderBy: { priceGroup: { priority: 'desc' } },
            });
            if (mapping)
                return mapping.priceGroupId;
        }
        return null;
    }
    resolvePrice(prices, priceGroupId, qty, product) {
        const groupPrices = priceGroupId
            ? prices.filter((p) => p.priceGroupId === priceGroupId)
            : [];
        const basePrices = prices.filter((p) => !p.priceGroupId);
        const groupSlab = this.findSlabMatch(groupPrices, qty);
        if (groupSlab) {
            return {
                price: (0, tax_calculator_helper_1.toNum)(groupSlab.amount),
                priceType: groupSlab.priceType,
                groupName: groupSlab.priceGroup?.name ?? null,
                slabApplied: {
                    minQty: (0, tax_calculator_helper_1.toNum)(groupSlab.minQty),
                    maxQty: groupSlab.maxQty ? (0, tax_calculator_helper_1.toNum)(groupSlab.maxQty) : null,
                },
            };
        }
        const groupBase = this.findBasePrice(groupPrices);
        if (groupBase) {
            return {
                price: (0, tax_calculator_helper_1.toNum)(groupBase.amount),
                priceType: groupBase.priceType,
                groupName: groupBase.priceGroup?.name ?? null,
                slabApplied: null,
            };
        }
        const defaultSlab = this.findSlabMatch(basePrices, qty);
        if (defaultSlab) {
            return {
                price: (0, tax_calculator_helper_1.toNum)(defaultSlab.amount),
                priceType: defaultSlab.priceType,
                groupName: null,
                slabApplied: {
                    minQty: (0, tax_calculator_helper_1.toNum)(defaultSlab.minQty),
                    maxQty: defaultSlab.maxQty ? (0, tax_calculator_helper_1.toNum)(defaultSlab.maxQty) : null,
                },
            };
        }
        const sale = basePrices.find((p) => p.priceType === 'SALE_PRICE' && !p.minQty);
        if (sale)
            return { price: (0, tax_calculator_helper_1.toNum)(sale.amount), priceType: 'SALE_PRICE', groupName: null, slabApplied: null };
        const mrp = basePrices.find((p) => p.priceType === 'MRP' && !p.minQty);
        if (mrp)
            return { price: (0, tax_calculator_helper_1.toNum)(mrp.amount), priceType: 'MRP', groupName: null, slabApplied: null };
        const fallback = product.salePrice ?? product.mrp ?? 0;
        return {
            price: (0, tax_calculator_helper_1.toNum)(fallback),
            priceType: product.salePrice ? 'SALE_PRICE' : 'MRP',
            groupName: null,
            slabApplied: null,
        };
    }
    findSlabMatch(prices, qty) {
        const slabs = prices.filter((p) => p.minQty != null && (0, tax_calculator_helper_1.toNum)(p.minQty) > 0);
        return slabs.find((s) => {
            const min = (0, tax_calculator_helper_1.toNum)(s.minQty);
            const max = s.maxQty ? (0, tax_calculator_helper_1.toNum)(s.maxQty) : null;
            return min <= qty && (max === null || max >= qty);
        });
    }
    findBasePrice(prices) {
        const base = prices.filter((p) => !p.minQty || (0, tax_calculator_helper_1.toNum)(p.minQty) === 0);
        return (base.find((p) => p.priceType === 'SALE_PRICE') ??
            base.find((p) => p.priceType === 'DEALER_PRICE') ??
            base.find((p) => p.priceType === 'DISTRIBUTOR_PRICE') ??
            base[0] ?? null);
    }
};
exports.GetEffectivePriceHandler = GetEffectivePriceHandler;
exports.GetEffectivePriceHandler = GetEffectivePriceHandler = GetEffectivePriceHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_effective_price_query_1.GetEffectivePriceQuery),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetEffectivePriceHandler);
//# sourceMappingURL=get-effective-price.handler.js.map