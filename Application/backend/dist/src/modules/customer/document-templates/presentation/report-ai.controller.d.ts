import { ApiResponse } from '../../../../common/utils/api-response';
import { AiReportDesignerService } from '../services/ai-report-designer.service';
declare class DesignReportDto {
    description: string;
    documentType: string;
}
declare class GenerateFormulaDto {
    description: string;
}
declare class FromImageDto {
    imageDescription: string;
    documentType: string;
}
declare class RefineDesignDto {
    currentDesign: Record<string, any>;
    instruction: string;
}
export declare class ReportAiController {
    private readonly aiService;
    constructor(aiService: AiReportDesignerService);
    designReport(dto: DesignReportDto): Promise<ApiResponse<Record<string, any>>>;
    generateFormula(dto: GenerateFormulaDto): Promise<ApiResponse<{
        expression: string;
        name: string;
        category: string;
        description: string;
        requiredFields: string[];
    }>>;
    fromImage(dto: FromImageDto): Promise<ApiResponse<{
        design: Record<string, any>;
        confidence: number;
    }>>;
    refine(dto: RefineDesignDto): Promise<ApiResponse<Record<string, any>>>;
}
export {};
