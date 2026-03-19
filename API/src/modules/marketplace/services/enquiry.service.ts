import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { EnquiryStatus } from '@prisma/platform-client';
import { ListingService } from './listing.service';

interface CreateEnquiryDto {
  listingId: string;
  quantity?: number;
  budget?: number;
  timeline?: string;
  message?: string;
  specifications?: any;
}

@Injectable()
export class EnquiryService {
  private readonly logger = new Logger(EnquiryService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly listingService: ListingService,
  ) {}

  // ═══════════════════════════════════════════════════════
  // CREATE ENQUIRY
  // ═══════════════════════════════════════════════════════

  async create(tenantId: string, buyerId: string, dto: CreateEnquiryDto) {
    const listing = await this.prisma.marketplaceListing.findUnique({
      where: { id: dto.listingId },
    });
    if (!listing) throw new NotFoundException('Listing not found');

    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
    });
    if (!buyer) throw new NotFoundException('Buyer not found');

    const enquiryNumber = await this.generateEnquiryNumber(tenantId);

    const enquiry = await this.prisma.marketplaceEnquiry.create({
      data: {
        enquiryNumber,
        tenantId,
        vendorId: listing.vendorId,
        listingId: dto.listingId,
        listingTitle: listing.title,
        buyerId,
        buyerName: `${buyer.firstName} ${buyer.lastName}`,
        buyerEmail: buyer.email,
        buyerPhone: buyer.phone,
        buyerCompany: buyer.companyName,
        buyerVerified: buyer.verificationStatus === 'FULLY_VERIFIED',
        quantity: dto.quantity,
        budget: dto.budget,
        timeline: dto.timeline,
        message: dto.message,
        specifications: dto.specifications,
        messages: dto.message
          ? [
              {
                senderId: buyerId,
                senderType: 'BUYER',
                message: dto.message,
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        unreadCountVendor: dto.message ? 1 : 0,
      },
    });

    // Track enquiry on listing
    await this.listingService.trackEnquiry(dto.listingId);

    this.logger.log(`Enquiry ${enquiryNumber} created for listing ${listing.title}`);
    return enquiry;
  }

  // ═══════════════════════════════════════════════════════
  // REPLY TO ENQUIRY
  // ═══════════════════════════════════════════════════════

  async reply(
    enquiryId: string,
    senderId: string,
    senderType: 'BUYER' | 'VENDOR',
    message: string,
  ) {
    const enquiry = await this.prisma.marketplaceEnquiry.findUnique({
      where: { id: enquiryId },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');

    const messages = (enquiry.messages as any[]) || [];
    messages.push({
      senderId,
      senderType,
      message,
      createdAt: new Date().toISOString(),
    });

    const updateData: any = {
      messages,
      lastMessageAt: new Date(),
    };

    if (senderType === 'BUYER') {
      updateData.unreadCountVendor = { increment: 1 };
    } else {
      updateData.unreadCountBuyer = { increment: 1 };
      if (enquiry.status === 'ENQ_NEW') {
        updateData.status = 'ENQ_RESPONDED';
      }
    }

    return this.prisma.marketplaceEnquiry.update({
      where: { id: enquiryId },
      data: updateData,
    });
  }

  // ═══════════════════════════════════════════════════════
  // UPDATE STATUS
  // ═══════════════════════════════════════════════════════

  async updateStatus(enquiryId: string, status: EnquiryStatus) {
    const enquiry = await this.prisma.marketplaceEnquiry.findUnique({
      where: { id: enquiryId },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');

    return this.prisma.marketplaceEnquiry.update({
      where: { id: enquiryId },
      data: { status },
    });
  }

  // ═══════════════════════════════════════════════════════
  // GET ENQUIRIES
  // ═══════════════════════════════════════════════════════

  async getVendorEnquiries(tenantId: string, vendorId: string, status?: EnquiryStatus) {
    return this.prisma.marketplaceEnquiry.findMany({
      where: {
        tenantId,
        vendorId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
      include: { listing: { select: { title: true, b2cPrice: true, mediaUrls: true } } },
    });
  }

  async getBuyerEnquiries(tenantId: string, buyerId: string) {
    return this.prisma.marketplaceEnquiry.findMany({
      where: { tenantId, buyerId },
      orderBy: { createdAt: 'desc' },
      include: { listing: { select: { title: true, b2cPrice: true, mediaUrls: true } } },
    });
  }

  async findById(enquiryId: string) {
    const enquiry = await this.prisma.marketplaceEnquiry.findUnique({
      where: { id: enquiryId },
      include: { listing: true },
    });
    if (!enquiry) throw new NotFoundException('Enquiry not found');
    return enquiry;
  }

  // ═══════════════════════════════════════════════════════
  // MARK READ
  // ═══════════════════════════════════════════════════════

  async markRead(enquiryId: string, readerType: 'BUYER' | 'VENDOR') {
    return this.prisma.marketplaceEnquiry.update({
      where: { id: enquiryId },
      data: readerType === 'BUYER'
        ? { unreadCountBuyer: 0 }
        : { unreadCountVendor: 0 },
    });
  }

  // ═══════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════

  private async generateEnquiryNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.marketplaceEnquiry.count({
      where: { tenantId },
    });
    return `ENQ-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
  }
}
