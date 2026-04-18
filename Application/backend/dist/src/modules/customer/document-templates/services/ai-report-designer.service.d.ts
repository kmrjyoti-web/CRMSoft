export declare class AiReportDesignerService {
    private readonly logger;
    designReport(description: string, documentType: string): Promise<Record<string, any>>;
    generateFormula(description: string): Promise<{
        expression: string;
        name: string;
        category: string;
        description: string;
        requiredFields: string[];
    }>;
    fromImage(imageDescription: string, documentType: string): Promise<{
        design: Record<string, any>;
        confidence: number;
    }>;
    refineDesign(currentDesign: Record<string, any>, instruction: string): Promise<Record<string, any>>;
    private getDefaultDesign;
}
