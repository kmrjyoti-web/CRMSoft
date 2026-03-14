import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CanvasRendererService } from './canvas-renderer.service';
import * as Handlebars from 'handlebars';

@Injectable()
export class TemplateRendererService {
  private readonly logger = new Logger(TemplateRendererService.name);
  private handlebarsInstance: typeof Handlebars;

  constructor(
    private readonly prisma: PrismaService,
    private readonly canvasRendererService: CanvasRendererService,
  ) {
    this.handlebarsInstance = Handlebars.create();
    this.registerHelpers();
  }

  /**
   * Render a template (v1 Handlebars or v2 Canvas JSON) to HTML.
   * Routes to the appropriate renderer based on templateVersion.
   */
  async renderTemplate(
    templateId: string,
    tenantId: string,
    data: Record<string, any>,
  ): Promise<string> {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template "${templateId}" not found`);
    }

    // v2 canvas JSON
    if (template.templateVersion === 2 && template.canvasJson) {
      return this.canvasRendererService.renderCanvasToHtml(
        template.canvasJson as any,
        data,
      );
    }

    // v1 Handlebars (existing logic)
    return this.renderToHtml(templateId, tenantId, data);
  }

  /**
   * Render a template to HTML with the provided data, merging tenant customizations.
   */
  async renderToHtml(
    templateId: string,
    tenantId: string,
    data: Record<string, any>,
  ): Promise<string> {
    const template = await this.prisma.documentTemplate.findUnique({
      where: { id: templateId },
    });

    if (!template) {
      throw new NotFoundException(`Template "${templateId}" not found`);
    }

    // Fetch tenant customization if available
    const customization = await this.prisma.tenantTemplateCustomization.findUnique({
      where: {
        tenantId_templateId: { tenantId, templateId },
      },
    });

    // Merge default settings with tenant custom settings
    const settings = this.deepMerge(
      (template.defaultSettings as Record<string, any>) ?? {},
      (customization?.customSettings as Record<string, any>) ?? {},
    );

    // Build the rendering context
    const context = {
      ...data,
      settings,
      customHeader: customization?.customHeader ?? null,
      customFooter: customization?.customFooter ?? null,
      termsAndConditions: customization?.termsAndConditions ?? null,
      bankDetails: customization?.bankDetails ?? null,
      signatureUrl: customization?.signatureUrl ?? null,
      logoUrl: customization?.logoUrl ?? template.thumbnailUrl ?? null,
    };

    // Compile and render the template
    const compiledTemplate = this.handlebarsInstance.compile(template.htmlTemplate);
    let html = compiledTemplate(context);

    // Inject CSS if present
    if (template.cssStyles) {
      html = `<style>${template.cssStyles}</style>\n${html}`;
    }

    return html;
  }

  /**
   * Render template to PDF buffer via Puppeteer.
   */
  async renderToPdf(
    templateId: string,
    tenantId: string,
    data: Record<string, any>,
  ): Promise<Buffer> {
    const html = await this.renderToHtml(templateId, tenantId, data);

    // Dynamic import to avoid hard dependency when not generating PDFs
    const puppeteer = await import('puppeteer-core');
    let browser;

    try {
      browser = await puppeteer.launch({
        headless: true,
        channel: 'chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      } as any);

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      this.logger.error(`PDF generation failed for template ${templateId}`, error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Register custom Handlebars helpers for Indian business document formatting.
   */
  private registerHelpers(): void {
    const hbs = this.handlebarsInstance;

    // Indian Rupee formatting: ₹1,23,456.78
    hbs.registerHelper('inr', (amount: number) => {
      if (amount == null || isNaN(amount)) return '₹0.00';
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
      }).format(amount);
    });

    // Date in DD/MM/YYYY format
    hbs.registerHelper('dateIN', (date: string | Date) => {
      if (!date) return '';
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    });

    // Amount in Indian English words: "One Thousand Two Hundred Thirty-Four Rupees and Fifty-Six Paise Only"
    hbs.registerHelper('amountInWords', (amount: number) => {
      if (amount == null || isNaN(amount)) return '';
      return this.numberToWordsINR(amount);
    });

    // Conditional field visibility based on settings.fields
    hbs.registerHelper('showField', function (this: any, fieldKey: string, options: any) {
      const fields = this.settings?.fields;
      if (!fields) return options.fn(this);
      if (fields[fieldKey] === false) return options.inverse(this);
      return options.fn(this);
    });

    // Serial number: index + 1
    hbs.registerHelper('serialNo', (index: number) => {
      return index + 1;
    });

    // Inter-state check: company.stateCode !== customer.stateCode
    hbs.registerHelper('isInterState', function (this: any, options: any) {
      const companyState = this.company?.stateCode;
      const customerState = this.customer?.stateCode;
      if (companyState && customerState && companyState !== customerState) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    // Equality check
    hbs.registerHelper('eq', (a: any, b: any) => {
      return a === b;
    });

    // Multiplication
    hbs.registerHelper('multiply', (a: number, b: number) => {
      return (a || 0) * (b || 0);
    });

    // Addition
    hbs.registerHelper('add', (a: number, b: number) => {
      return (a || 0) + (b || 0);
    });
  }

  /**
   * Deep merge two objects. Source properties override target properties.
   */
  private deepMerge(
    target: Record<string, any>,
    source: Record<string, any>,
  ): Record<string, any> {
    const result = { ...target };

    for (const key of Object.keys(source)) {
      if (source[key] === undefined) continue;

      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        target[key] &&
        typeof target[key] === 'object' &&
        !Array.isArray(target[key])
      ) {
        result[key] = this.deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }

    return result;
  }

  /**
   * Convert a number to Indian English words with Rupees and Paise.
   * e.g. 1234.56 → "One Thousand Two Hundred Thirty-Four Rupees and Fifty-Six Paise Only"
   */
  private numberToWordsINR(amount: number): string {
    const ones = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
      'Seventeen', 'Eighteen', 'Nineteen',
    ];
    const tens = [
      '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
    ];

    const convertChunk = (n: number): string => {
      if (n === 0) return '';
      if (n < 20) return ones[n];
      if (n < 100) {
        const remainder = n % 10;
        return tens[Math.floor(n / 10)] + (remainder ? '-' + ones[remainder] : '');
      }
      const remainder = n % 100;
      return (
        ones[Math.floor(n / 100)] +
        ' Hundred' +
        (remainder ? ' and ' + convertChunk(remainder) : '')
      );
    };

    const convertIndian = (n: number): string => {
      if (n === 0) return 'Zero';

      let result = '';
      let remaining = n;

      // Crore (10,000,000)
      if (remaining >= 10000000) {
        result += convertChunk(Math.floor(remaining / 10000000)) + ' Crore ';
        remaining %= 10000000;
      }

      // Lakh (100,000)
      if (remaining >= 100000) {
        result += convertChunk(Math.floor(remaining / 100000)) + ' Lakh ';
        remaining %= 100000;
      }

      // Thousand (1,000)
      if (remaining >= 1000) {
        result += convertChunk(Math.floor(remaining / 1000)) + ' Thousand ';
        remaining %= 1000;
      }

      // Hundred and below
      if (remaining > 0) {
        result += convertChunk(remaining);
      }

      return result.trim();
    };

    const rupees = Math.floor(Math.abs(amount));
    const paise = Math.round((Math.abs(amount) - rupees) * 100);

    let words = convertIndian(rupees) + ' Rupees';

    if (paise > 0) {
      words += ' and ' + convertIndian(paise) + ' Paise';
    }

    words += ' Only';

    return words;
  }
}
