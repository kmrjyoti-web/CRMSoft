import { ApiResponse } from '../../../../common/utils/api-response';
import { WorkflowAiService } from '../services/workflow-ai.service';
declare class GenerateFromPromptDto {
    prompt: string;
    context?: {
        existingNodes?: number;
        workflowName?: string;
    };
}
export declare class WorkflowAiController {
    private readonly workflowAiService;
    constructor(workflowAiService: WorkflowAiService);
    generate(dto: GenerateFromPromptDto): ApiResponse<import("../services/workflow-ai.service").AiGenerateResult>;
}
export {};
