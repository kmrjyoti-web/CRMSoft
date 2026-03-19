import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { PricingAccessService } from '../../softwarevendor/verification/services/pricing-access.service';
import { MktOrderStatus } from '@prisma/client';
import { ListingService } from './listing.service';

interface OrderItemDto {
  listingId: string;
  quantity: number;
}

interface CreateOrderDto {
  items: OrderItemDto[];
  shippingAddress: any;
  billingAddress?: any;
  paymentMethod?: string;
  buyerNotes?: string;
  sourceEnquiryId?: string;
}

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: PricingAccessService,
    private readonly listingService: ListingService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // CREATE ORDER
  // ═══════════════════════════════════════════════════════

  async create(tenantId: string, buyerId: string, dto: CreateOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must have at least one item');
    }

    // Validate all items belong to same vendor
    const listings = await Promise.all(
      dto.items.map(async (item) => {
        const listing = await this.prisma.marketplaceListing.findUnique({
          where: { id: item.listingId },
          include: { priceTiers: { orderBy: { minQty: 'asc' } } },
        });
        if (!listing) throw new NotFoundException(`Listing ${item.listingId} not found`);
        if (listing.status !== 'LST_ACTIVE') {
          throw new BadRequestException(`Listing "${listing.title}" is not active`);
        }
        return { listing, quantity: item.quantity };
      }),
    );

    const vendorId = listings[0].listing.vendorId;

    // Calculate pricing for each item
    const orderItems = await Promise.all(
      listings.map(async ({ listing, quantity }) => {
        const priceResult = await this.pricingService.calculatePrice(
          buyerId,
          quantity,
          Number(listing.b2cPrice),
          listing.priceTiers.map((t) => ({
            minQty: t.minQty,
            maxQty: t.maxQty,
            pricePerUnit: Number(t.pricePerUnit),
          })),
        );

        return {
          listingId: listing.id,
          title: listing.title,
          quantity,
          unitPrice: priceResult.unitPrice,
          totalPrice: priceResult.totalPrice,
          appliedTier: priceResult.tier,
          taxRate: 18, // Default GST 18%
          taxAmount: priceResult.totalPrice * 0.18,
        };
      }),
    );

    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalTax = orderItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const totalAmount = subtotal + totalTax;

    const orderNumber = await this.generateOrderNumber(tenantId);

    const order = await this.prisma.marketplaceOrder.create({
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

    // Track order on each listing
    for (const item of orderItems) {
      await this.listingService.trackOrder(item.listingId);
    }

    // Convert enquiry if sourced from one
    if (dto.sourceEnquiryId) {
      await this.prisma.marketplaceEnquiry.update({
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

  // ═══════════════════════════════════════════════════════
  // UPDATE STATUS
  // ═══════════════════════════════════════════════════════

  async updateStatus(
    orderId: string,
    status: MktOrderStatus,
    note?: string,
    changedBy?: string,
  ) {
    const order = await this.prisma.marketplaceOrder.findUnique({
      where: { id: orderId },
    });
    if (!order) throw new NotFoundException('Order not found');

    const history = (order.statusHistory as any[]) || [];
    history.push({
      status,
      note: note || `Status changed to ${status}`,
      changedBy,
      changedAt: new Date().toISOString(),
    });

    const updateData: any = { status, statusHistory: history };

    if (status === 'MKT_DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    return this.prisma.marketplaceOrder.update({
      where: { id: orderId },
      data: updateData,
    });
  }

  // ═══════════════════════════════════════════════════════
  // GET ORDERS
  // ═══════════════════════════════════════════════════════

  async getVendorOrders(tenantId: string, vendorId: string, status?: MktOrderStatus) {
    return this.prisma.marketplaceOrder.findMany({
      where: {
        tenantId,
        vendorId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async getBuyerOrders(tenantId: string, buyerId: string) {
    return this.prisma.marketplaceOrder.findMany({
      where: { tenantId, buyerId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });
  }

  async findById(orderId: string) {
    const order = await this.prisma.marketplaceOrder.findUnique({
      where: { id: orderId },
      include: { items: { include: { listing: { select: { mediaUrls: true, slug: true } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  // ═══════════════════════════════════════════════════════
  // UPDATE TRACKING
  // ═══════════════════════════════════════════════════════

  async updateTracking(orderId: string, trackingNumber: string, carrier: string, estimatedDelivery?: Date) {
    return this.prisma.marketplaceOrder.update({
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
          } as any,
        },
      },
    });
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════

  private async generateOrderNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.marketplaceOrder.count({
      where: { tenantId },
    });
    return `ORD-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
