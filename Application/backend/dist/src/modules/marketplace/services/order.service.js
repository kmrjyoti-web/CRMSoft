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
var OrderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const pricing_access_service_1 = require("../../softwarevendor/verification/services/pricing-access.service");
const listing_service_1 = require("./listing.service");
let OrderService = OrderService_1 = class OrderService {
    constructor(prisma, pricingService, listingService) {
        this.prisma = prisma;
        this.pricingService = pricingService;
        this.listingService = listingService;
        this.logger = new common_1.Logger(OrderService_1.name);
    }
    async create(tenantId, buyerId, dto) {
        if (!dto.items?.length) {
            throw new common_1.BadRequestException('Order must have at least one item');
        }
        const listings = await Promise.all(dto.items.map(async (item) => {
            const listing = await this.prisma.platform.marketplaceListing.findUnique({
                where: { id: item.listingId },
                include: { priceTiers: { orderBy: { minQty: 'asc' } } },
            });
            if (!listing)
                throw new common_1.NotFoundException(`Listing ${item.listingId} not found`);
            if (listing.status !== 'LST_ACTIVE') {
                throw new common_1.BadRequestException(`Listing "${listing.title}" is not active`);
            }
            return { listing, quantity: item.quantity };
        }));
        const vendorId = listings[0].listing.vendorId;
        const orderItems = await Promise.all(listings.map(async ({ listing, quantity }) => {
            const priceResult = await this.pricingService.calculatePrice(buyerId, quantity, Number(listing.b2cPrice), listing.priceTiers.map((t) => ({
                minQty: t.minQty,
                maxQty: t.maxQty,
                pricePerUnit: Number(t.pricePerUnit),
            })));
            return {
                listingId: listing.id,
                title: listing.title,
                quantity,
                unitPrice: priceResult.unitPrice,
                totalPrice: priceResult.totalPrice,
                appliedTier: priceResult.tier,
                taxRate: 18,
                taxAmount: priceResult.totalPrice * 0.18,
            };
        }));
        const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
        const totalTax = orderItems.reduce((sum, item) => sum + item.taxAmount, 0);
        const totalAmount = subtotal + totalTax;
        const orderNumber = await this.generateOrderNumber(tenantId);
        const order = await this.prisma.platform.marketplaceOrder.create({
            data: {
                orderNumber,
                tenantId,
                vendorId,
                buyerId,
                subtotal,
                taxableAmount: subtotal,
                totalTax,
                totalAmount,
                shippingAddress: dto.shippingAddress,
                billingAddress: dto.billingAddress,
                paymentMethod: dto.paymentMethod,
                sourceEnquiryId: dto.sourceEnquiryId,
                buyerNotes: dto.buyerNotes,
                statusHistory: [
                    {
                        status: 'MKT_PENDING',
                        note: 'Order placed',
                        changedAt: new Date().toISOString(),
                    },
                ],
                items: {
                    create: orderItems.map((item) => ({
                        listingId: item.listingId,
                        title: item.title,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        taxRate: item.taxRate,
                        taxAmount: item.taxAmount,
                        appliedTier: item.appliedTier,
                    })),
                },
            },
            include: { items: true },
        });
        for (const item of orderItems) {
            await this.listingService.trackOrder(item.listingId);
        }
        if (dto.sourceEnquiryId) {
            await this.prisma.platform.marketplaceEnquiry.update({
                where: { id: dto.sourceEnquiryId },
                data: {
                    status: 'ENQ_CONVERTED',
                    convertedToOrderId: order.id,
                    convertedAt: new Date(),
                },
            });
        }
        this.logger.log(`Order ${orderNumber} created`);
        return order;
    }
    async updateStatus(orderId, status, note, changedBy) {
        const order = await this.prisma.platform.marketplaceOrder.findUnique({
            where: { id: orderId },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        const history = order.statusHistory || [];
        history.push({
            status,
            note: note || `Status changed to ${status}`,
            changedBy,
            changedAt: new Date().toISOString(),
        });
        const updateData = { status, statusHistory: history };
        if (status === 'MKT_DELIVERED') {
            updateData.deliveredAt = new Date();
        }
        return this.prisma.platform.marketplaceOrder.update({
            where: { id: orderId },
            data: updateData,
        });
    }
    async getVendorOrders(tenantId, vendorId, status) {
        return this.prisma.platform.marketplaceOrder.findMany({
            where: {
                tenantId,
                vendorId,
                ...(status && { status }),
            },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }
    async getBuyerOrders(tenantId, buyerId) {
        return this.prisma.platform.marketplaceOrder.findMany({
            where: { tenantId, buyerId },
            orderBy: { createdAt: 'desc' },
            include: { items: true },
        });
    }
    async findById(orderId) {
        const order = await this.prisma.platform.marketplaceOrder.findUnique({
            where: { id: orderId },
            include: { items: { include: { listing: { select: { mediaUrls: true, slug: true } } } } },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async updateTracking(orderId, trackingNumber, carrier, estimatedDelivery) {
        return this.prisma.platform.marketplaceOrder.update({
            where: { id: orderId },
            data: {
                trackingNumber,
                carrier,
                estimatedDelivery,
                status: 'MKT_SHIPPED',
                statusHistory: {
                    push: {
                        status: 'MKT_SHIPPED',
                        note: `Shipped via ${carrier} (${trackingNumber})`,
                        changedAt: new Date().toISOString(),
                    },
                },
            },
        });
    }
    async generateOrderNumber(tenantId) {
        const count = await this.prisma.platform.marketplaceOrder.count({
            where: { tenantId },
        });
        return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = OrderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        pricing_access_service_1.PricingAccessService,
        listing_service_1.ListingService])
], OrderService);
//# sourceMappingURL=order.service.js.map