import { IQueryHandler } from '@nestjs/cqrs';
import { GetPredictionMatrixQuery } from './get-prediction-matrix.query';
import { QuotationPredictionService } from '../../../services/quotation-prediction.service';
export declare class GetPredictionMatrixHandler implements IQueryHandler<GetPredictionMatrixQuery> {
    private readonly prediction;
    private readonly logger;
    constructor(prediction: QuotationPredictionService);
    execute(query: GetPredictionMatrixQuery): Promise<import("../../../services/quotation-prediction.service").PredictionResult>;
}
