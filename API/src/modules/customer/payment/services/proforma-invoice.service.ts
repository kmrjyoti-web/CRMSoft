import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { AppError } from '../../../../common/errors/app-error';
import { GstCalculatorService, GstLineInput } from './gst-calculator.service';
import { AmountInWordsService } from './amount-in-words.service';
import { AutoNumberService } from '../../../core/identity/settings/services/auto-number.service';
import { CompanyProfileService } from '../../../core/identity/settings/services/company-profile.service';
import { CrossService } from '../../../../common/decorators/cross-service.decorator';
import { InvoiceService } from './invoice.service';
import {
  CreateProformaInvoiceDto,
  UpdateProformaInvoiceDto,
  ProformaInvoiceQueryDto,
  GenerateProformaFromQuotationDto,
} from '../presentation/dto/proforma-invoice.dto';

@CrossService('identity', 'Uses AutoNumberService (pro-forma numbering) and CompanyProfileService (seller details on PDF) from identity settings')
@Injectable()
export class ProformaInvoiceService {
  private readonly logger = new Logger(ProformaInvoiceService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gstCalculator: GstCalculatorService,
    private readonly amountInWords: AmountInWordsService,
    private readonly autoNumber: AutoNumberService,
    private readonly companyProfile: CompanyProfileService,
    private readonly invoiceService: InvoiceService,
  ) {}

  /** Generate proforma invoice from an accepted quotation */
  async generateFromQuotation(tenantId: string, dto: GenerateProformaFromQuotationDto, userId: string) {
    const quotation = await this.prisma.working.quotation.findFirst({
      where: { id: dto.quotationId, tenantId },
      include: { lineItems: true },
    });

    if (!quotation) throw AppError.from('QUOTATION_NOT_FOUND');

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

    const proformaNo = await this.autoNumber.next(tenantId, 'ProformaInvoice');
    const amountWords = this.amountInWords.convert(gst.totalAmount);

    const proforma = await this.prisma.working.proformaInvoice.create({
      data: {
        tenantId,
        proformaNo,
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
        proformaDate: new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
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
        isInterState,
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

    this.logger.log(`Proforma ${proformaNo} generated from quotation ${quotation.quotationNo}`);
    return proforma;
  }

  /** Create proforma invoice manually */
  async create(tenantId: string, dto: CreateProformaInvoiceDto, userId: string) {
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
    const proformaNo = await this.autoNumber.next(tenantId, 'ProformaInvoice');
    const amountWords = this.amountInWords.convert(gst.totalAmount);

    const proforma = await this.prisma.working.proformaInvoice.create({
      data: {
        tenantId,
        proformaNo,
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
        sellerName: seller.companyName || '',
        sellerAddress: seller.addressLine1 || null,
        sellerCity: seller.city || null,
        sellerState: seller.state || null,
        sellerPincode: seller.pincode || null,
        sellerGstNumber: seller.gstNumber || null,
        sellerPanNumber: seller.panNumber || null,
        proformaDate: dto.proformaDate ? new Date(dto.proformaDate) : new Date(),
        validUntil: dto.validUntil ? new Date(dto.validUntil) : null,
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
        isInterState,
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

    return proforma;
  }

  /** Get single proforma invoice with relations */
  async getById(tenantId: string, id: string) {
    const proforma = await this.prisma.working.proformaInvoice.findFirst({
      where: { id, tenantId },
      include: { lineItems: true },
    });
    if (!proforma) throw AppError.from('PROFORMA_NOT_FOUND');
    return proforma;
  }

  /** List proforma invoices with filtering and pagination */
  async list(tenantId: string, query: ProformaInvoiceQueryDto) {
    const where: any = { tenantId };
    if (query.status) where.status = query.status;
    if (query.contactId) where.contactId = query.contactId;
    if (query.organizationId) where.organizationId = query.organizationId;
    if (query.leadId) where.leadId = query.leadId;
    if (query.quotationId) where.quotationId = query.quotationId;
    if (query.fromDate || query.toDate) {
      where.proformaDate = {};
      if (query.fromDate) where.proformaDate.gte = new Date(query.fromDate);
      if (query.toDate) where.proformaDate.lte = new Date(query.toDate);
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.working.proformaInvoice.findMany({
        where,
        include: { lineItems: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.working.proformaInvoice.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Update draft proforma invoice */
  async update(tenantId: string, id: string, dto: UpdateProformaInvoiceDto) {
    const proforma = await this.prisma.working.proformaInvoice.findFirst({
      where: { id, tenantId },
    });
    if (!proforma) throw AppError.from('PROFORMA_NOT_FOUND');
    if (proforma.status !== 'PI_DRAFT') {
      throw AppError.from('PROFORMA_NOT_DRAFT');
    }

    return this.prisma.working.proformaInvoice.update({
      where: { id },
      data: dto as any,
      include: { lineItems: true },
    });
  }

  /** Send proforma invoice — change status from PI_DRAFT to PI_SENT */
  async send(tenantId: string, id: string) {
    const proforma = await this.prisma.working.proformaInvoice.findFirst({
      where: { id, tenantId },
    });
    if (!proforma) throw AppError.from('PROFORMA_NOT_FOUND');

    return this.prisma.working.proformaInvoice.update({
      where: { id },
      data: { status: 'PI_SENT' },
    });
  }

  /** Convert proforma invoice to final invoice */
  async convertToInvoice(tenantId: string, id: string, userId: string) {
    const proforma = await this.prisma.working.proformaInvoice.findFirst({
      where: { id, tenantId },
      include: { lineItems: true },
    });
    if (!proforma) throw AppError.from('PROFORMA_NOT_FOUND');
    if (proforma.status === 'PI_CONVERTED') {
      throw AppError.from('PROFORMA_ALREADY_CONVERTED');
    }
    if (proforma.status === 'PI_CANCELLED') {
      throw AppError.from('PROFORMA_CANCELLED');
    }

    // Create invoice from proforma data using manual create
    const seller = await this.companyProfile.getPublic(tenantId);
    const invoiceNo = await this.autoNumber.next(tenantId, 'Invoice');
    const amountWords = this.amountInWords.convert(Number(proforma.totalAmount));

    const invoice = await this.prisma.working.invoice.create({
      data: {
        tenantId,
        invoiceNo,
        quotationId: proforma.quotationId,
        leadId: proforma.leadId,
        contactId: proforma.contactId,
        organizationId: proforma.organizationId,
        billingName: proforma.billingName,
        billingAddress: proforma.billingAddress,
        billingCity: proforma.billingCity,
        billingState: proforma.billingState,
        billingPincode: proforma.billingPincode,
        billingGstNumber: proforma.billingGstNumber,
        sellerName: proforma.sellerName,
        sellerAddress: proforma.sellerAddress,
        sellerCity: proforma.sellerCity,
        sellerState: proforma.sellerState,
        sellerPincode: proforma.sellerPincode,
        sellerGstNumber: proforma.sellerGstNumber,
        sellerPanNumber: proforma.sellerPanNumber,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        subtotal: proforma.subtotal,
        discountType: proforma.discountType,
        discountValue: proforma.discountValue,
        discountAmount: proforma.discountAmount,
        taxableAmount: proforma.taxableAmount,
        cgstAmount: proforma.cgstAmount,
        sgstAmount: proforma.sgstAmount,
        igstAmount: proforma.igstAmount,
        cessAmount: proforma.cessAmount,
        totalTax: proforma.totalTax,
        roundOff: proforma.roundOff,
        totalAmount: proforma.totalAmount,
        amountInWords: amountWords,
        balanceAmount: proforma.totalAmount,
        isInterState: proforma.isInterState,
        bankName: seller.bankName || null,
        bankBranch: seller.bankBranch || null,
        accountNumber: seller.accountNumber || null,
        ifscCode: seller.ifscCode || null,
        upiId: seller.upiId || null,
        notes: proforma.notes,
        termsAndConditions: proforma.termsAndConditions,
        internalNotes: proforma.internalNotes,
        createdById: userId,
        lineItems: {
          create: proforma.lineItems.map((li) => ({
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
            discountAmount: Number(li.discountAmount),
            lineTotal: Number(li.lineTotal),
            gstRate: li.gstRate ? Number(li.gstRate) : null,
            cgstAmount: Number(li.cgstAmount),
            sgstAmount: Number(li.sgstAmount),
            igstAmount: Number(li.igstAmount),
            cessRate: li.cessRate ? Number(li.cessRate) : null,
            cessAmount: Number(li.cessAmount),
            taxAmount: Number(li.taxAmount),
            totalWithTax: Number(li.totalWithTax),
            sortOrder: li.sortOrder,
            notes: li.notes,
          })),
        },
      },
      include: { lineItems: true },
    });

    // Link proforma to invoice and mark as converted
    await this.prisma.working.proformaInvoice.update({
      where: { id },
      data: {
        status: 'PI_CONVERTED',
        invoiceId: invoice.id,
      },
    });

    this.logger.log(`Proforma ${proforma.proformaNo} converted to invoice ${invoiceNo}`);
    return invoice;
  }

  /** Cancel proforma invoice */
  async cancel(tenantId: string, id: string, reason: string, userId: string) {
    const proforma = await this.prisma.working.proformaInvoice.findFirst({
      where: { id, tenantId },
    });
    if (!proforma) throw AppError.from('PROFORMA_NOT_FOUND');
    if (proforma.status === 'PI_CONVERTED') {
      throw AppError.from('PROFORMA_ALREADY_CONVERTED');
    }

    return this.prisma.working.proformaInvoice.update({
      where: { id },
      data: {
        status: 'PI_CANCELLED',
        cancelledAt: new Date(),
        cancelledById: userId,
        cancelReason: reason,
      },
    });
  }
}
