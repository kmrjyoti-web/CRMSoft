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
var EnquiryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnquiryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const listing_service_1 = require("./listing.service");
let EnquiryService = EnquiryService_1 = class EnquiryService {
    constructor(prisma, listingService) {
        this.prisma = prisma;
        this.listingService = listingService;
        this.logger = new common_1.Logger(EnquiryService_1.name);
    }
    async create(tenantId, buyerId, dto) {
        const listing = await this.prisma.platform.marketplaceListing.findUnique({
            where: { id: dto.listingId },
        });
        if (!listing)
            throw new common_1.NotFoundException('Listing not found');
        const buyer = await this.prisma.user.findUnique({
            where: { id: buyerId },
        });
        if (!buyer)
            throw new common_1.NotFoundException('Buyer not found');
        const enquiryNumber = await this.generateEnquiryNumber(tenantId);
        const enquiry = await this.prisma.platform.marketplaceEnquiry.create({
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
        await this.listingService.trackEnquiry(dto.listingId);
        this.logger.log(`Enquiry ${enquiryNumber} created for listing ${listing.title}`);
        return enquiry;
    }
    async reply(enquiryId, senderId, senderType, message) {
        const enquiry = await this.prisma.platform.marketplaceEnquiry.findUnique({
            where: { id: enquiryId },
        });
        if (!enquiry)
            throw new common_1.NotFoundException('Enquiry not found');
        const messages = enquiry.messages || [];
        messages.push({
            senderId,
            senderType,
            message,
            createdAt: new Date().toISOString(),
        });
        const updateData = {
            messages,
            lastMessageAt: new Date(),
        };
        if (senderType === 'BUYER') {
            updateData.unreadCountVendor = { increment: 1 };
        }
        else {
            updateData.unreadCountBuyer = { increment: 1 };
            if (enquiry.status === 'ENQ_NEW') {
                updateData.status = 'ENQ_RESPONDED';
            }
        }
        return this.prisma.platform.marketplaceEnquiry.update({
            where: { id: enquiryId },
            data: updateData,
        });
    }
    async updateStatus(enquiryId, status) {
        const enquiry = await this.prisma.platform.marketplaceEnquiry.findUnique({
            where: { id: enquiryId },
        });
        if (!enquiry)
            throw new common_1.NotFoundException('Enquiry not found');
        return this.prisma.platform.marketplaceEnquiry.update({
            where: { id: enquiryId },
            data: { status },
        });
    }
    async getVendorEnquiries(tenantId, vendorId, status) {
        return this.prisma.platform.marketplaceEnquiry.findMany({
            where: {
                tenantId,
                vendorId,
                ...(status && { status }),
            },
            orderBy: { createdAt: 'desc' },
            include: { listing: { select: { title: true, b2cPrice: true, mediaUrls: true } } },
        });
    }
    async getBuyerEnquiries(tenantId, buyerId) {
        return this.prisma.platform.marketplaceEnquiry.findMany({
            where: { tenantId, buyerId },
            orderBy: { createdAt: 'desc' },
            include: { listing: { select: { title: true, b2cPrice: true, mediaUrls: true } } },
        });
    }
    async findById(enquiryId) {
        const enquiry = await this.prisma.platform.marketplaceEnquiry.findUnique({
            where: { id: enquiryId },
            include: { listing: true },
        });
        if (!enquiry)
            throw new common_1.NotFoundException('Enquiry not found');
        return enquiry;
    }
    async markRead(enquiryId, readerType) {
        return this.prisma.platform.marketplaceEnquiry.update({
            where: { id: enquiryId },
            data: readerType === 'BUYER'
                ? { unreadCountBuyer: 0 }
                : { unreadCountVendor: 0 },
        });
    }
    async generateEnquiryNumber(tenantId) {
        const count = await this.prisma.platform.marketplaceEnquiry.count({
            where: { tenantId },
        });
        return `ENQ-${new Date().getFullYear()}-${String(count + 1).padStart(5, '0')}`;
    }
};
exports.EnquiryService = EnquiryService;
exports.EnquiryService = EnquiryService = EnquiryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        listing_service_1.ListingService])
], EnquiryService);
//# sourceMappingURL=enquiry.service.js.map