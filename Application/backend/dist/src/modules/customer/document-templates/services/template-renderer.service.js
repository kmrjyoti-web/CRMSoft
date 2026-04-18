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
var TemplateRendererService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateRendererService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const canvas_renderer_service_1 = require("./canvas-renderer.service");
const Handlebars = require("handlebars");
let TemplateRendererService = TemplateRendererService_1 = class TemplateRendererService {
    constructor(prisma, canvasRendererService) {
        this.prisma = prisma;
        this.canvasRendererService = canvasRendererService;
        this.logger = new common_1.Logger(TemplateRendererService_1.name);
        this.handlebarsInstance = Handlebars.create();
        this.registerHelpers();
    }
    async renderTemplate(templateId, tenantId, data) {
        const template = await this.prisma.working.documentTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template "${templateId}" not found`);
        }
        if (template.templateVersion === 2 && template.canvasJson) {
            return this.canvasRendererService.renderCanvasToHtml(template.canvasJson, data);
        }
        return this.renderToHtml(templateId, tenantId, data);
    }
    async renderToHtml(templateId, tenantId, data) {
        const template = await this.prisma.working.documentTemplate.findUnique({
            where: { id: templateId },
        });
        if (!template) {
            throw new common_1.NotFoundException(`Template "${templateId}" not found`);
        }
        const customization = await this.prisma.working.tenantTemplateCustomization.findUnique({
            where: {
                tenantId_templateId: { tenantId, templateId },
            },
        });
        const settings = this.deepMerge(template.defaultSettings ?? {}, customization?.customSettings ?? {});
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
        const compiledTemplate = this.handlebarsInstance.compile(template.htmlTemplate);
        let html = compiledTemplate(context);
        if (template.cssStyles) {
            html = `<style>${template.cssStyles}</style>\n${html}`;
        }
        return html;
    }
    async renderToPdf(templateId, tenantId, data) {
        const html = await this.renderToHtml(templateId, tenantId, data);
        const puppeteer = await Promise.resolve().then(() => require('puppeteer-core'));
        let browser;
        try {
            browser = await puppeteer.launch({
                headless: true,
                channel: 'chrome',
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            await page.setContent(html, { waitUntil: 'networkidle0' });
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' },
            });
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            this.logger.error(`PDF generation failed for template ${templateId}`, error);
            throw error;
        }
        finally {
            if (browser) {
                await browser.close();
            }
        }
    }
    registerHelpers() {
        const hbs = this.handlebarsInstance;
        hbs.registerHelper('inr', (amount) => {
            if (amount == null || isNaN(amount))
                return '?0.00';
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2,
            }).format(amount);
        });
        hbs.registerHelper('dateIN', (date) => {
            if (!date)
                return '';
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        });
        hbs.registerHelper('amountInWords', (amount) => {
            if (amount == null || isNaN(amount))
                return '';
            return this.numberToWordsINR(amount);
        });
        hbs.registerHelper('showField', function (fieldKey, options) {
            const fields = this.settings?.fields;
            if (!fields)
                return options.fn(this);
            if (fields[fieldKey] === false)
                return options.inverse(this);
            return options.fn(this);
        });
        hbs.registerHelper('serialNo', (index) => {
            return index + 1;
        });
        hbs.registerHelper('isInterState', function (options) {
            const companyState = this.company?.stateCode;
            const customerState = this.customer?.stateCode;
            if (companyState && customerState && companyState !== customerState) {
                return options.fn(this);
            }
            return options.inverse(this);
        });
        hbs.registerHelper('eq', (a, b) => {
            return a === b;
        });
        hbs.registerHelper('multiply', (a, b) => {
            return (a || 0) * (b || 0);
        });
        hbs.registerHelper('add', (a, b) => {
            return (a || 0) + (b || 0);
        });
    }
    deepMerge(target, source) {
        const result = { ...target };
        for (const key of Object.keys(source)) {
            if (source[key] === undefined)
                continue;
            if (source[key] &&
                typeof source[key] === 'object' &&
                !Array.isArray(source[key]) &&
                target[key] &&
                typeof target[key] === 'object' &&
                !Array.isArray(target[key])) {
                result[key] = this.deepMerge(target[key], source[key]);
            }
            else {
                result[key] = source[key];
            }
        }
        return result;
    }
    numberToWordsINR(amount) {
        const ones = [
            '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen',
        ];
        const tens = [
            '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety',
        ];
        const convertChunk = (n) => {
            if (n === 0)
                return '';
            if (n < 20)
                return ones[n];
            if (n < 100) {
                const remainder = n % 10;
                return tens[Math.floor(n / 10)] + (remainder ? '-' + ones[remainder] : '');
            }
            const remainder = n % 100;
            return (ones[Math.floor(n / 100)] +
                ' Hundred' +
                (remainder ? ' and ' + convertChunk(remainder) : ''));
        };
        const convertIndian = (n) => {
            if (n === 0)
                return 'Zero';
            let result = '';
            let remaining = n;
            if (remaining >= 10000000) {
                result += convertChunk(Math.floor(remaining / 10000000)) + ' Crore ';
                remaining %= 10000000;
            }
            if (remaining >= 100000) {
                result += convertChunk(Math.floor(remaining / 100000)) + ' Lakh ';
                remaining %= 100000;
            }
            if (remaining >= 1000) {
                result += convertChunk(Math.floor(remaining / 1000)) + ' Thousand ';
                remaining %= 1000;
            }
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
};
exports.TemplateRendererService = TemplateRendererService;
exports.TemplateRendererService = TemplateRendererService = TemplateRendererService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        canvas_renderer_service_1.CanvasRendererService])
], TemplateRendererService);
//# sourceMappingURL=template-renderer.service.js.map