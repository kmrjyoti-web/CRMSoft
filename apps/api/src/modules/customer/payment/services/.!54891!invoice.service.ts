import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { GstCalculatorService, GstLineInput } from './gst-calculator.service';
import { AmountInWordsService } from './amount-in-words.service';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { CompanyProfileService } from '../../../core/identity/settings/services/company-profile.service';
import { CrossService } from '../../../../common/decorators/cross-service.decorator';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceQueryDto, GenerateInvoiceDto } from '../presentation/dto/invoice.dto';

@CrossService('identity', 'Uses AutoNumberService (invoice numbering sequences) and CompanyProfileService (seller details on PDF) from identity settings')
@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gstCalculator: GstCalculatorService,
    private readonly amountInWords: AmountInWordsService,
    private readonly autoNumber: AutoNumberService,
    private readonly companyProfile: CompanyProfileService,
  ) {}

  /** Generate invoice from an accepted quotation */
  async generateFromQuotation(tenantId: string, dto: GenerateInvoiceDto, userId: string) {
    const quotation = await this.prisma.working.quotation.findFirst({
      where: { id: dto.quotationId, tenantId },
      include: { lineItems: true },
    });

    if (!quotation) throw AppError.from('QUOTATION_NOT_FOUND');

    // Fetch contact and org separately (Quotation stores only IDs)
    const [contact, org] = await Promise.all([
      quotation.contactPersonId
        ? this.prisma.working.contact.findUnique({ where: { id: quotation.contactPersonId } })
        : null,
      quotation.organizationId
        ? this.prisma.working.organization.findUnique({ where: { id: quotation.organizationId } })
        : null,
    ]);

    const seller = await this.companyProfile.getPublic(tenantId);

    const isInterState = dto.isInterState ??
      this.gstCalculator.isInterStateByName(seller.state || null, org?.city || null);

    const gstLines: GstLineInput[] = quotation.lineItems.map((li) => ({
      quantity: Number(li.quantity),
      unitPrice: Number(li.unitPrice),
      discountType: li.discountType || undefined,
      discountValue: li.discountValue ? Number(li.discountValue) : undefined,
      gstRate: li.gstRate ? Number(li.gstRate) : undefined,
      cessRate: li.cessRate ? Number(li.cessRate) : undefined,
    }));

    const gst = this.gstCalculator.calculate(
      gstLines,
      isInterState,
      quotation.discountType || undefined,
      quotation.discountValue ? Number(quotation.discountValue) : undefined,
    );

    const invoiceNo = await this.autoNumber.next(tenantId, 'Invoice');
    const amountWords = this.amountInWords.convert(gst.totalAmount);

    const invoice = await this.prisma.working.invoice.create({
      data: {
        tenantId,
        invoiceNo,
        quotationId: quotation.id,
        leadId: quotation.leadId,
        contactId: quotation.contactPersonId,
        organizationId: quotation.organizationId,
        billingName: contact?.firstName
          ? `${contact.firstName} ${contact.lastName || ''}`.trim()
          : org?.name || 'N/A',
        billingGstNumber: null,
        sellerName: seller.companyName || '',
        sellerAddress: seller.addressLine1 || null,
        sellerCity: seller.city || null,
        sellerState: seller.state || null,
        sellerPincode: seller.pincode || null,
        sellerGstNumber: seller.gstNumber || null,
        sellerPanNumber: seller.panNumber || null,
        invoiceDate: dto.dueDate ? new Date() : new Date(),
        dueDate: new Date(dto.dueDate),
        subtotal: gst.subtotal,
        discountType: quotation.discountType,
        discountValue: quotation.discountValue ? Number(quotation.discountValue) : 0,
        discountAmount: gst.discountAmount,
        taxableAmount: gst.taxableAmount,
        cgstAmount: gst.cgstAmount,
        sgstAmount: gst.sgstAmount,
        igstAmount: gst.igstAmount,
        cessAmount: gst.cessAmount,
        totalTax: gst.totalTax,
        roundOff: gst.roundOff,
        totalAmount: gst.totalAmount,
        amountInWords: amountWords,
        balanceAmount: gst.totalAmount,
        isInterState,
        bankName: seller.bankName || null,
        bankBranch: seller.bankBranch || null,
        accountNumber: seller.accountNumber || null,
        ifscCode: seller.ifscCode || null,
        upiId: seller.upiId || null,
        notes: dto.notes,
        termsAndConditions: dto.termsAndConditions,
        createdById: userId,
        lineItems: {
          create: quotation.lineItems.map((li, idx) => ({
            tenantId,
            productId: li.productId,
            productCode: li.productCode,
            productName: li.productName,
            description: li.description,
            hsnCode: li.hsnCode,
            quantity: Number(li.quantity),
            unit: li.unit,
            unitPrice: Number(li.unitPrice),
            mrp: li.mrp ? Number(li.mrp) : null,
            discountType: li.discountType,
            discountValue: li.discountValue ? Number(li.discountValue) : null,
            discountAmount: gst.lines[idx].discountAmount,
            lineTotal: gst.lines[idx].lineTotal,
            gstRate: li.gstRate ? Number(li.gstRate) : null,
            cgstAmount: gst.lines[idx].cgstAmount,
            sgstAmount: gst.lines[idx].sgstAmount,
            igstAmount: gst.lines[idx].igstAmount,
            cessRate: li.cessRate ? Number(li.cessRate) : null,
            cessAmount: gst.lines[idx].cessAmount,
            taxAmount: gst.lines[idx].taxAmount,
            totalWithTax: gst.lines[idx].totalWithTax,
            sortOrder: li.sortOrder,
            notes: li.notes,
          })),
        },
      },
      include: { lineItems: true },
    });

    this.logger.log(`Invoice ${invoiceNo} generated from quotation ${quotation.quotationNo}`);
    return invoice;
  }

  /** Create invoice manually */
  async create(tenantId: string, dto: CreateInvoiceDto, userId: string) {
    const seller = await this.companyProfile.getPublic(tenantId);
    const isInterState = dto.isInterState ??
      this.gstCalculator.isInterStateByName(seller.state || null, dto.billingState || null);

    const gstLines: GstLineInput[] = dto.lineItems.map((li) => ({
      quantity: li.quantity,
      unitPrice: li.unitPrice,
      discountType: li.discountType,
      discountValue: li.discountValue,
      gstRate: li.gstRate,
      cessRate: li.cessRate,
    }));

    const gst = this.gstCalculator.calculate(gstLines, isInterState, dto.discountType, dto.discountValue);
    const invoiceNo = await this.autoNumber.next(tenantId, 'Invoice');
    const amountWords = this.amountInWords.convert(gst.totalAmount);

    const invoice = await this.prisma.working.invoice.create({
      data: {
        tenantId,
        invoiceNo,
        quotationId: dto.quotationId,
        leadId: dto.leadId,
        contactId: dto.contactId,
        organizationId: dto.organizationId,
        billingName: dto.billingName,
        billingAddress: dto.billingAddress,
        billingCity: dto.billingCity,
        billingState: dto.billingState,
        billingPincode: dto.billingPincode,
        billingGstNumber: dto.billingGstNumber,
        shippingName: dto.shippingName,
        shippingAddress: dto.shippingAddress,
        shippingCity: dto.shippingCity,
        shippingState: dto.shippingState,
        shippingPincode: dto.shippingPincode,
        sellerName: seller.companyName || '',
        sellerAddress: seller.addressLine1 || null,
        sellerCity: seller.city || null,
        sellerState: seller.state || null,
        sellerPincode: seller.pincode || null,
        sellerGstNumber: seller.gstNumber || null,
        sellerPanNumber: seller.panNumber || null,
        invoiceDate: dto.invoiceDate ? new Date(dto.invoiceDate) : new Date(),
        dueDate: new Date(dto.dueDate),
        supplyDate: dto.supplyDate ? new Date(dto.supplyDate) : null,
        subtotal: gst.subtotal,
        discountType: dto.discountType,
        discountValue: dto.discountValue || 0,
        discountAmount: gst.discountAmount,
        taxableAmount: gst.taxableAmount,
        cgstAmount: gst.cgstAmount,
        sgstAmount: gst.sgstAmount,
        igstAmount: gst.igstAmount,
        cessAmount: gst.cessAmount,
        totalTax: gst.totalTax,
        roundOff: gst.roundOff,
        totalAmount: gst.totalAmount,
        amountInWords: amountWords,
        balanceAmount: gst.totalAmount,
        isInterState,
        bankName: seller.bankName || null,
        bankBranch: seller.bankBranch || null,
        accountNumber: seller.accountNumber || null,
        ifscCode: seller.ifscCode || null,
        upiId: seller.upiId || null,
        notes: dto.notes,
        termsAndConditions: dto.termsAndConditions,
        internalNotes: dto.internalNotes,
        createdById: userId,
        lineItems: {
          create: dto.lineItems.map((li, idx) => ({
            tenantId,
            productId: li.productId,
            productCode: li.productCode,
            productName: li.productName,
            description: li.description,
            hsnCode: li.hsnCode,
            quantity: li.quantity,
            unit: li.unit,
            unitPrice: li.unitPrice,
            mrp: li.mrp,
            discountType: li.discountType,
            discountValue: li.discountValue,
            discountAmount: gst.lines[idx].discountAmount,
            lineTotal: gst.lines[idx].lineTotal,
            gstRate: li.gstRate,
            cgstAmount: gst.lines[idx].cgstAmount,
            sgstAmount: gst.lines[idx].sgstAmount,
            igstAmount: gst.lines[idx].igstAmount,
            cessRate: li.cessRate,
            cessAmount: gst.lines[idx].cessAmount,
            taxAmount: gst.lines[idx].taxAmount,
            totalWithTax: gst.lines[idx].totalWithTax,
            sortOrder: li.sortOrder || idx,
            notes: li.notes,
          })),
        },
      },
      include: { lineItems: true },
    });

    return invoice;
  }

  /** Get single invoice with relations */
  async getById(tenantId: string, invoiceId: string) {
    const invoice = await this.prisma.working.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: { lineItems: true, payments: true, creditNotes: true, reminders: true },
    });
    if (!invoice) throw AppError.from('INVOICE_NOT_FOUND');
    return invoice;
  }

  /** List invoices with filtering and pagination */
  async list(tenantId: string, query: InvoiceQueryDto) {
    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.leadId) where.leadId = query.leadId;
    if (query.contactId) where.contactId = query.contactId;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.fromDate || query.toDate) {
      where.invoiceDate = {};
      if (query.fromDate) where.invoiceDate.gte = new Date(query.fromDate);
      if (query.toDate) where.invoiceDate.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.working.invoice.findMany({
        where,
        include: { lineItems: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.invoice.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Update draft invoice */
  async update(tenantId: string, invoiceId: string, dto: UpdateInvoiceDto) {
    const invoice = await this.prisma.working.invoice.findFirst({
      where: { id: invoiceId, tenantId },
    });
    if (!invoice) throw AppError.from('INVOICE_NOT_FOUND');
    if (invoice.status !== 'DRAFT') {
      throw AppError.from('INVOICE_CANCELLED');
    }

    return this.prisma.working.invoice.update({
      where: { id: invoiceId },
      data: dto as any,
      include: { lineItems: true },
    });
  }

