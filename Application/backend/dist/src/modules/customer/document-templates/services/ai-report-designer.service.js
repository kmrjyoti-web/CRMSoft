"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiReportDesignerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiReportDesignerService = void 0;
const common_1 = require("@nestjs/common");
let AiReportDesignerService = AiReportDesignerService_1 = class AiReportDesignerService {
    constructor() {
        this.logger = new common_1.Logger(AiReportDesignerService_1.name);
    }
    async designReport(description, documentType) {
        this.logger.log(`AI Design Report: ${description}`);
        const defaultDesign = this.getDefaultDesign(documentType, description);
        return defaultDesign;
    }
    async generateFormula(description) {
        this.logger.log(`AI Generate Formula: ${description}`);
        const lower = description.toLowerCase();
        if (lower.includes('gst') && lower.includes('total')) {
            return {
                expression: 'taxableAmount * gstRate / 100',
                name: 'GST Total',
                category: 'tax',
                description: 'Calculate GST amount from taxable amount and GST rate',
                requiredFields: ['taxableAmount', 'gstRate'],
            };
        }
        if (lower.includes('cgst')) {
            return {
                expression: 'taxableAmount * gstRate / 200',
                name: 'CGST',
                category: 'tax',
                description: 'Calculate CGST (half of total GST for intra-state)',
                requiredFields: ['taxableAmount', 'gstRate'],
            };
        }
        if (lower.includes('discount') && lower.includes('percent')) {
            return {
                expression: 'amount * discountPercent / 100',
                name: 'Discount Amount',
                category: 'math',
                description: 'Calculate discount from amount and percentage',
                requiredFields: ['amount', 'discountPercent'],
            };
        }
        if (lower.includes('grand total') || lower.includes('net')) {
            return {
                expression: 'subtotal - discountAmount + totalTax',
                name: 'Grand Total',
                category: 'math',
                description: 'Net payable after discount and tax',
                requiredFields: ['subtotal', 'discountAmount', 'totalTax'],
            };
        }
        return {
            expression: 'value',
            name: 'Custom Formula',
            category: 'math',
            description: description,
            requiredFields: ['value'],
        };
    }
    async fromImage(imageDescription, documentType) {
        this.logger.log(`AI From Image: ${documentType}`);
        const design = this.getDefaultDesign(documentType, imageDescription);
        return { design, confidence: 0.75 };
    }
    async refineDesign(currentDesign, instruction) {
        this.logger.log(`AI Refine: ${instruction}`);
        return currentDesign;
    }
    getDefaultDesign(documentType, _description) {
        return {
            version: 2,
            paper: { size: 'A4', orientation: 'portrait', margins: { top: 20, right: 15, bottom: 20, left: 15 } },
            bands: [
                {
                    type: 'REPORT_TITLE',
                    height: 120,
                    elements: [
                        { id: 'e1', type: 'image', position: { x: 20, y: 10, width: 120, height: 50 }, properties: { imageField: 'company.logo' } },
                        { id: 'e2', type: 'text', position: { x: 160, y: 10, width: 300, height: 28 }, properties: { dataField: 'company.name', fontSize: 20, fontWeight: 'bold', color: '#1a56db' } },
                        { id: 'e3', type: 'text', position: { x: 160, y: 40, width: 300, height: 16 }, properties: { dataField: 'company.address', fontSize: 11, color: '#555' } },
                        { id: 'e4', type: 'text', position: { x: 160, y: 58, width: 300, height: 16 }, properties: { text: 'GSTIN: ', fontSize: 11, color: '#555' } },
                        { id: 'e5', type: 'label', position: { x: 420, y: 10, width: 120, height: 30 }, properties: { text: documentType.replace(/_/g, ' '), fontSize: 14, fontWeight: 'bold', textAlign: 'center', backgroundColor: '#1a56db', color: '#fff', borderRadius: 4 } },
                    ],
                },
                {
                    type: 'PAGE_HEADER',
                    height: 80,
                    elements: [
                        { id: 'e6', type: 'text', position: { x: 20, y: 5, width: 150, height: 16 }, properties: { text: 'Invoice No:', fontSize: 11, fontWeight: '600' } },
                        { id: 'e7', type: 'text', position: { x: 170, y: 5, width: 200, height: 16 }, properties: { dataField: 'invoice.number', fontSize: 11 } },
                        { id: 'e8', type: 'text', position: { x: 380, y: 5, width: 80, height: 16 }, properties: { text: 'Date:', fontSize: 11, fontWeight: '600' } },
                        { id: 'e9', type: 'date', position: { x: 460, y: 5, width: 100, height: 16 }, properties: { dataField: 'invoice.date', format: 'DD/MM/YYYY', fontSize: 11 } },
                        { id: 'e10', type: 'line', position: { x: 20, y: 65, width: 520, height: 1 }, properties: { lineColor: '#ddd', lineWidth: 1 } },
                    ],
                },
                {
                    type: 'DETAIL',
                    height: 250,
                    elements: [
                        {
                            id: 'e11', type: 'table', position: { x: 20, y: 10, width: 520, height: 220 },
                            properties: {
                                dataSource: 'items',
                                columns: [
                                    { field: '#', header: '#', width: 30, align: 'center' },
                                    { field: 'name', header: 'Description', width: 180 },
                                    { field: 'hsn', header: 'HSN', width: 60, align: 'center' },
                                    { field: 'qty', header: 'Qty', width: 40, align: 'center' },
                                    { field: 'rate', header: 'Rate', width: 70, align: 'right' },
                                    { field: 'taxableAmount', header: 'Amount', width: 70, align: 'right' },
                                    { field: 'total', header: 'Total', width: 70, align: 'right' },
                                ],
                            },
                        },
                    ],
                },
                {
                    type: 'REPORT_SUMMARY',
                    height: 100,
                    elements: [
                        { id: 'e12', type: 'text', position: { x: 340, y: 10, width: 100, height: 16 }, properties: { text: 'Subtotal:', fontSize: 11, textAlign: 'right' } },
                        { id: 'e13', type: 'formula', position: { x: 450, y: 10, width: 90, height: 16 }, properties: { formulaExpression: 'totals_subtotal', outputFormat: 'currency', fontSize: 11, textAlign: 'right' } },
                        { id: 'e14', type: 'text', position: { x: 340, y: 30, width: 100, height: 16 }, properties: { text: 'Tax:', fontSize: 11, textAlign: 'right' } },
                        { id: 'e15', type: 'formula', position: { x: 450, y: 30, width: 90, height: 16 }, properties: { formulaExpression: 'totals_totalTax', outputFormat: 'currency', fontSize: 11, textAlign: 'right' } },
                        { id: 'e16', type: 'text', position: { x: 340, y: 55, width: 100, height: 20 }, properties: { text: 'Grand Total:', fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#1a56db' } },
                        { id: 'e17', type: 'formula', position: { x: 450, y: 55, width: 90, height: 20 }, properties: { formulaExpression: 'totals_grandTotal', outputFormat: 'currency', fontSize: 14, fontWeight: 'bold', textAlign: 'right', color: '#1a56db' } },
                    ],
                },
                {
                    type: 'PAGE_FOOTER',
                    height: 60,
                    elements: [
                        { id: 'e18', type: 'line', position: { x: 20, y: 5, width: 520, height: 1 }, properties: { lineColor: '#ddd' } },
                        { id: 'e19', type: 'signature', position: { x: 400, y: 10, width: 140, height: 40 }, properties: { imageField: 'signatureUrl' } },
                        { id: 'e20', type: 'page-no', position: { x: 240, y: 45, width: 80, height: 14 }, properties: { fontSize: 9, textAlign: 'center', color: '#888' } },
                    ],
                },
            ],
            formulas: [],
        };
    }
};
exports.AiReportDesignerService = AiReportDesignerService;
exports.AiReportDesignerService = AiReportDesignerService = AiReportDesignerService_1 = __decorate([
    (0, common_1.Injectable)()
], AiReportDesignerService);
//# sourceMappingURL=ai-report-designer.service.js.map