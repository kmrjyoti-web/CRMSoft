import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { AiPredictDto, AiGenerateDto } from './dto/ai-generate.dto';
import { QuotationPredictionService } from '../services/quotation-prediction.service';
export declare class QuotationAiController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly prediction;
    constructor(commandBus: CommandBus, queryBus: QueryBus, prediction: QuotationPredictionService);
    predict(dto: AiPredictDto): Promise<ApiResponse<any>>;
    generate(dto: AiGenerateDto, user: any): Promise<ApiResponse<any>>;
    getQuestions(leadId: string): Promise<ApiResponse<any[]>>;
}
