import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class DocumentDataService {
  private readonly logger = new Logger(DocumentDataService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch all data required to render an invoice template.
   */
  async getInvoiceData(invoiceId: string, tenantId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId },
      include: {
        lineItems: { orderBy: { createdAt: 'asc' } },
        contact: true,
        organization: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice "${invoiceId}" not found`);
    }

    const company = await this.getCompanyData(tenantId);

    return {
      invoice: {
        invoiceNo: invoice.invoiceNo,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        supplyDate: invoice.supplyDate,
        status: invoice.status,
        subtotal: Number(invoice.subtotal),
        discountType: invoice.discountType,
        discountValue: Number(invoice.discountValue),
        discountAmount: Number(invoice.discountAmount),
        taxableAmount: Number(invoice.taxableAmount),
        cgstAmount: Number(invoice.cgstAmount),
        sgstAmount: Number(invoice.sgstAmount),
        igstAmount: Number(invoice.igstAmount),
        cessAmount: Number(invoice.cessAmount),
        totalTax: Number(invoice.totalTax),
        roundOff: Number(invoice.roundOff),
        totalAmount: Number(invoice.totalAmount),
        amountInWords: invoice.amountInWords,
        paidAmount: Number(invoice.paidAmount),
        balanceAmount: Number(invoice.balanceAmount),
        isInterState: invoice.isInterState,
        notes: invoice.notes,
        termsAndConditions: invoice.termsAndConditions,
        bankName: invoice.bankName,
        bankBranch: invoice.bankBranch,
        accountNumber: invoice.accountNumber,
        ifscCode: invoice.ifscCode,
        upiId: invoice.upiId,
      },
      seller: {
        name: invoice.sellerName,
        address: invoice.sellerAddress,
        city: invoice.sellerCity,
        state: invoice.sellerState,
        pincode: invoice.sellerPincode,
        gstNumber: invoice.sellerGstNumber,
        panNumber: invoice.sellerPanNumber,
      },
      customer: {
        billingName: invoice.billingName,
        billingAddress: invoice.billingAddress,
        billingCity: invoice.billingCity,
        billingState: invoice.billingState,
        billingPincode: invoice.billingPincode,
        billingGstNumber: invoice.billingGstNumber,
        shippingName: invoice.shippingName,
        shippingAddress: invoice.shippingAddress,
        shippingCity: invoice.shippingCity,
        shippingState: invoice.shippingState,
        shippingPincode: invoice.shippingPincode,
        stateCode: invoice.billingState,
        contactName: invoice.contact
          ? `${invoice.contact.firstName ?? ''} ${invoice.contact.lastName ?? ''}`.trim()
          : null,
        organizationName: invoice.organization?.name ?? null,
      },
      items: invoice.lineItems.map((item) => ({
        productCode: item.productCode,
        productName: item.productName,
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        mrp: item.mrp ? Number(item.mrp) : null,
        discountType: item.discountType,
        discountValue: item.discountValue ? Number(item.discountValue) : null,
        discountAmount: Number(item.discountAmount),
        lineTotal: Number(item.lineTotal),
        gstRate: item.gstRate ? Number(item.gstRate) : null,
        cgstAmount: Number(item.cgstAmount),
        sgstAmount: Number(item.sgstAmount),
        igstAmount: Number(item.igstAmount),
        cessRate: item.cessRate ? Number(item.cessRate) : null,
        cessAmount: Number(item.cessAmount),
        taxAmount: Number(item.taxAmount),
        totalWithTax: Number(item.totalWithTax),
      })),
      company,
    };
  }

  /**
   * Fetch all data required to render a quotation template.
   */
  async getQuotationData(quotationId: string, tenantId: string) {
    const quotation = await this.prisma.quotation.findFirst({
      where: { id: quotationId, tenantId },
      include: {
        lineItems: { orderBy: { createdAt: 'asc' } },
        lead: {
          include: {
            contact: true,
            organization: true,
          },
        },
      },
    });

    if (!quotation) {
      throw new NotFoundException(`Quotation "${quotationId}" not found`);
    }

    const company = await this.getCompanyData(tenantId);

    return {
      quotation: {
        quotationNo: quotation.quotationNo,
        title: quotation.title,
        summary: quotation.summary,
        coverNote: quotation.coverNote,
        version: quotation.version,
        status: quotation.status,
        subtotal: Number(quotation.subtotal),
        discountType: quotation.discountType,
        discountValue: Number(quotation.discountValue),
        discountAmount: Number(quotation.discountAmount),
        taxableAmount: Number(quotation.taxableAmount),
        cgstAmount: Number(quotation.cgstAmount),
        sgstAmount: Number(quotation.sgstAmount),
        igstAmount: Number(quotation.igstAmount),
        cessAmount: Number(quotation.cessAmount),
        totalTax: Number(quotation.totalTax),
        roundOff: Number(quotation.roundOff),
        totalAmount: Number(quotation.totalAmount),
        validFrom: quotation.validFrom,
        validUntil: quotation.validUntil,
        paymentTerms: quotation.paymentTerms,
        deliveryTerms: quotation.deliveryTerms,
        warrantyTerms: quotation.warrantyTerms,
        termsConditions: quotation.termsConditions,
      },
      customer: {
        contactName: quotation.lead?.contact
          ? `${quotation.lead.contact.firstName ?? ''} ${quotation.lead.contact.lastName ?? ''}`.trim()
          : null,
        organizationName: quotation.lead?.organization?.name ?? null,
        stateCode: null,
      },
      items: quotation.lineItems.map((item) => ({
        productCode: item.productCode,
        productName: item.productName,
        description: item.description,
        hsnCode: item.hsnCode,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitPrice: Number(item.unitPrice),
        mrp: item.mrp ? Number(item.mrp) : null,
        discountType: item.discountType,
        discountValue: item.discountValue ? Number(item.discountValue) : null,
        discountAmount: Number(item.discountAmount),
        lineTotal: Number(item.lineTotal),
        gstRate: item.gstRate ? Number(item.gstRate) : null,
        cgstAmount: Number(item.cgstAmount),
        sgstAmount: Number(item.sgstAmount),
        igstAmount: Number(item.igstAmount),
        cessRate: item.cessRate ? Number(item.cessRate) : null,
        cessAmount: Number(item.cessAmount),
        taxAmount: Number(item.taxAmount),
        totalWithTax: Number(item.totalWithTax),
      })),
      company,
    };
  }

  /**
   * Fetch company data from the tenant profile.
   */
  async getCompanyData(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { profile: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant "${tenantId}" not found`);
    }

    const profile = tenant.profile;

    return {
      name: tenant.name,
      legalName: profile?.companyLegalName ?? tenant.name,
      logo: tenant.logo ?? null,
      gstin: profile?.gstin ?? null,
      pan: profile?.pan ?? null,
      phone: profile?.primaryContactPhone ?? null,
      email: profile?.primaryContactEmail ?? profile?.supportEmail ?? null,
      website: profile?.website ?? null,
      address: profile?.billingAddress ?? null,
      industry: profile?.industry ?? null,
      stateCode: null,
    };
  }

  /**
   * Return hardcoded sample data for template preview.
   */
  getSampleData(documentType: string): Record<string, any> {
    const sampleCompany = {
      name: 'Acme Technologies Pvt. Ltd.',
      legalName: 'Acme Technologies Private Limited',
      logo: null,
      gstin: '27AABCA1234L1ZM',
      pan: 'AABCA1234L',
      phone: '+91 98765 43210',
      email: 'billing@acmetech.in',
      website: 'www.acmetech.in',
      address: '42, Industrial Area Phase II, Pune, Maharashtra - 411018',
      stateCode: '27',
    };

    // Customer data — field names match Handlebars templates
    const sampleCustomer = {
      name: 'Raj Enterprises',
      address: '15, MG Road, Andheri East, Mumbai, Maharashtra - 400069',
      phone: '+91 98765 12345',
      email: 'rajesh@rajenterprises.in',
      gstin: '27AADCR5678M1Z4',
      shippingAddress: 'Plot 8, MIDC Taloja, Navi Mumbai, Maharashtra - 410208',
      contactName: 'Rajesh Kumar',
      organizationName: 'Raj Enterprises',
      stateCode: '27',
    };

    // Items — field names match Handlebars templates (name, hsn, qty, rate, etc.)
    const sampleItems = [
      {
        name: 'CRM Enterprise License',
        description: '1-year enterprise license with 50 users',
        hsn: '998314',
        qty: 1,
        unit: 'Nos',
        rate: 150000,
        discount: 15000,
        taxableAmount: 135000,
        gstRate: 18,
        cgst: 12150,
        sgst: 12150,
        igst: 0,
        cess: 0,
        total: 159300,
      },
      {
        name: 'Annual Maintenance Contract',
        description: 'Priority support with 4-hour SLA',
        hsn: '998316',
        qty: 1,
        unit: 'Nos',
        rate: 30000,
        discount: 0,
        taxableAmount: 30000,
        gstRate: 18,
        cgst: 2700,
        sgst: 2700,
        igst: 0,
        cess: 0,
        total: 35400,
      },
    ];

    // Totals — field names match Handlebars templates
    const sampleTotals = {
      subtotal: 180000,
      totalDiscount: 15000,
      taxableAmount: 165000,
      totalCgst: 14850,
      totalSgst: 14850,
      totalIgst: 0,
      totalCess: 0,
      totalTax: 29700,
      roundOff: 0,
      grandTotal: 194700,
    };

    const baseSample = {
      company: sampleCompany,
      customer: sampleCustomer,
      items: sampleItems,
      totals: sampleTotals,
      settings: {
        fields: {
          hsn: true,
          discount: true,
          gst: true,
          shipping: true,
          bankDetails: true,
          signature: true,
          cess: false,
        },
      },
    };

    switch (documentType) {
      case 'GST_INVOICE':
      case 'PROFORMA_INVOICE':
      case 'CREDIT_NOTE':
      case 'DEBIT_NOTE':
      case 'RECEIPT':
        return {
          ...baseSample,
          invoice: {
            number: 'INV-2026-0001',
            date: new Date('2026-03-10'),
            dueDate: new Date('2026-04-09'),
            placeOfSupply: 'Maharashtra (27)',
            status: 'SENT',
            isInterState: false,
            notes: 'Thank you for your business.',
            termsAndConditions:
              'Payment due within 30 days. Late payments attract 1.5% per month interest.',
            bankName: 'HDFC Bank',
            bankBranch: 'Kothrud, Pune',
            accountNumber: '50200012345678',
            ifscCode: 'HDFC0001234',
            upiId: 'acmetech@hdfcbank',
          },
        };

      case 'QUOTATION':
        return {
          ...baseSample,
          quotation: {
            number: 'QTN-2026-0001',
            title: 'CRM Enterprise Package',
            summary: 'Enterprise CRM solution with annual support',
            coverNote: 'We are pleased to present our proposal.',
            date: new Date('2026-03-10'),
            validUntil: new Date('2026-04-09'),
            version: 1,
            status: 'DRAFT',
            paymentTerms: '50% advance, 50% on delivery',
            deliveryTerms: 'Within 7 business days of order confirmation',
            warrantyTerms: '1-year warranty on software defects',
            termsConditions:
              'This quotation is valid for 30 days from the date of issue.',
          },
        };

      case 'PURCHASE_ORDER':
      case 'DELIVERY_CHALLAN':
      case 'SALE_CHALLAN':
        return {
          ...baseSample,
          document: {
            number: 'PO-2026-0001',
            date: new Date('2026-03-10'),
            type: documentType.replace(/_/g, ' '),
            notes: 'Standard purchase order terms apply.',
            termsAndConditions: 'Delivery within 15 days. Quality checks applicable.',
          },
        };

      default:
        return {
          ...baseSample,
          document: {
            number: 'DOC-2026-0001',
            date: new Date('2026-03-10'),
            type: documentType.replace(/_/g, ' '),
            totalAmount: 194700,
          },
        };
    }
  }
}
