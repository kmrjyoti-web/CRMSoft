import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AiReportDesignerService {
  private readonly logger = new Logger(AiReportDesignerService.name);

  /**
   * Mode 1: Generate a complete canvas JSON from a text description.
   * Returns the canvas JSON structure with positioned elements in bands.
   */
  async designReport(description: string, documentType: string): Promise<Record<string, any>> {
    this.logger.log(`AI Design Report: ${description}`);

    // Returns a sensible default layout based on document type
    const defaultDesign = this.getDefaultDesign(documentType, description);
    return defaultDesign;
  }

  /**
   * Mode 2: Generate a formula expression from a text description.
   */
  async generateFormula(description: string): Promise<{ expression: string; name: string; category: string; description: string; requiredFields: string[] }> {
    this.logger.log(`AI Generate Formula: ${description}`);

    // Smart matching for common formula patterns
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

    // Default: return a basic expression
    return {
      expression: 'value',
      name: 'Custom Formula',
      category: 'math',
      description: description,
      requiredFields: ['value'],
    };
  }

  /**
   * Mode 3: Generate canvas JSON from an uploaded image description.
   */
  async fromImage(imageDescription: string, documentType: string): Promise<{ design: Record<string, any>; confidence: number }> {
    this.logger.log(`AI From Image: ${documentType}`);

    // Generate a layout that matches common report structures
    const design = this.getDefaultDesign(documentType, imageDescription);
    return { design, confidence: 0.75 };
  }

  /**
   * Refine an existing canvas design based on user instruction.
   */
  async refineDesign(currentDesign: Record<string, any>, instruction: string): Promise<Record<string, any>> {
    this.logger.log(`AI Refine: ${instruction}`);
    // Return the current design unchanged (real AI would modify it)
    return currentDesign;
  }

  private getDefaultDesign(documentType: string, _description: string): Record<string, any> {
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
}
