import { PrismaClient } from '@prisma/client';
export declare const DOCUMENT_TEMPLATES: ({
    code: string;
    name: string;
    description: string;
    documentType: "GST_INVOICE";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "GST_INVOICE";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        paper: {
            size: string;
            orientation: string;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
    };
    availableFields: string[];
    industryCode: string;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "QUOTATION";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "QUOTATION";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: string;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "RECEIPT";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        paper: {
            size: string;
            orientation: string;
        };
        fields: {
            hsn: boolean;
            discount: boolean;
            sku: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "PURCHASE_ORDER";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "DELIVERY_CHALLAN";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "SALE_CHALLAN";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "CREDIT_NOTE";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "SALES_REPORT";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        paper: {
            size: string;
            orientation: string;
        };
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
} | {
    code: string;
    name: string;
    description: string;
    documentType: "CUSTOMER_STATEMENT";
    htmlTemplate: string;
    cssStyles: null;
    defaultSettings: {
        fields: {
            hsn: boolean;
            sku: boolean;
            discount: boolean;
            cgst: boolean;
            sgst: boolean;
            igst: boolean;
            cess: boolean;
        };
        colors: {
            primary: string;
            secondary: string;
        };
        fonts: {
            heading: string;
            body: string;
            size: number;
        };
        paper: {
            size: string;
            orientation: string;
        };
    };
    availableFields: string[];
    industryCode: null;
    sortOrder: number;
    isDefault: boolean;
})[];
export declare function seedDocumentTemplates(prisma: PrismaClient): Promise<void>;
